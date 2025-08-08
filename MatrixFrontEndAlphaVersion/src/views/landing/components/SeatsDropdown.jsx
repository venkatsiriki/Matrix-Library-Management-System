import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiUsers, FiLock } from 'react-icons/fi';
import axios from 'axios';

const sectionLabels = {
  central: 'Central Library',
  reference: 'Reference Library',
  reading: 'Reading Room',
  elibrary: 'E-Library',
};

const sectionOrder = ['central', 'reference', 'reading', 'elibrary'];

const sectionLockTimes = {
  central: { hour: 17, min: 30 }, // 5:30 PM
  reading: { hour: 17, min: 30 },
  elibrary: { hour: 17, min: 30 },
  reference: { hour: 16, min: 30, studyUnlockHour: 16, studyUnlockMin: 30, studyLockHour: 23, studyLockMin: 59 }, // Study Section: 4:30 PM to 11:59 PM
};

function isSectionLocked(section) {
  const now = new Date();
  const lock = sectionLockTimes[section];
  if (!lock) return false;

  if (section === 'reference') {
    const studyUnlock = new Date();
    studyUnlock.setHours(lock.studyUnlockHour, lock.studyUnlockMin, 0, 0);
    const studyLock = new Date();
    studyLock.setHours(lock.studyLockHour, lock.studyLockMin, 0, 0);
    const regularLock = new Date();
    regularLock.setHours(lock.hour, lock.min, 0, 0);
    // Reference is locked if before Study Section opens or after regular hours, but not during Study Section
    return now < studyUnlock && now > regularLock;
  }

  const lockTime = new Date();
  lockTime.setHours(lock.hour, lock.min, 0, 0);
  return now > lockTime;
}

const SeatsDropdown = ({ isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastFetchTime, setLastFetchTime] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const POLLING_INTERVAL = 30000; // 30 seconds
  const MAX_RETRIES = 3;
  const INITIAL_RETRY_DELAY = 5000; // 5 seconds

  const fetchSeats = useCallback(async (retryCount = 0) => {
    try {
      const response = await axios.get(`${API_URL}/api/activity-logs/seats`, {
        timeout: 5000,
      });
      const data = response.data;
      console.log('Fetched seats:', data);

      const now = new Date();
      const isStudySectionActive =
        sectionLockTimes.reference &&
        now >= new Date().setHours(sectionLockTimes.reference.studyUnlockHour, sectionLockTimes.reference.studyUnlockMin, 0, 0) &&
        now <= new Date().setHours(sectionLockTimes.reference.studyLockHour, sectionLockTimes.reference.studyLockMin, 0, 0);

      const arr = sectionOrder.map((key) => {
        const s = data[key] || { occupied: 0, total: 0 };
        return {
          id: key,
          label: key === 'reference' && isStudySectionActive ? 'Reference - Study Section' : sectionLabels[key],
          occupied: s.occupied,
          totalSeats: s.total,
          locked: isSectionLocked(key),
        };
      });

      setSections(arr);
      setSelectedSection((prev) => {
        const found = arr.find((a) => a.id === (prev?.id || 'central'));
        return found || arr[0];
      });
      setLoading(false);
      setError('');
      setLastFetchTime(Date.now());
    } catch (err) {
      console.error('Fetch seats error:', err.message);
      if (retryCount < MAX_RETRIES) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
        console.log(`Retrying fetch in ${delay}ms...`);
        setTimeout(() => fetchSeats(retryCount + 1), delay);
      } else {
        setError('Unable to fetch seat data');
        setLoading(false);
      }
    }
  }, [API_URL]);

  useEffect(() => {
    fetchSeats();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchSeats();
      }
    }, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchSeats]);

  const getUtilizationColor = useCallback((occupied, total, isDark) => {
    if (!total) return '';
    const percentage = (occupied / total) * 100;
    if (percentage <= 50) return isDark ? 'text-green-400' : 'text-green-500';
    if (percentage <= 75) return isDark ? 'text-yellow-400' : 'text-yellow-500';
    return isDark ? 'text-red-400' : 'text-red-500';
  }, []);

  const buttonContent = useMemo(() => {
    if (loading) {
      return <span className="animate-pulse">Loading...</span>;
    }
    if (error) {
      return <span className="text-red-500">Error</span>;
    }
    if (!selectedSection) {
      return <span>No data</span>;
    }
    if (selectedSection.locked) {
      return (
        <span className="flex items-center gap-1">
          <FiLock className="w-4 h-4" />
          <span>Locked</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1">
        <FiUsers className="w-4 h-4" />
        <span className="font-semibold">{selectedSection.occupied}</span>
        <span className="text-xs opacity-60">/{selectedSection.totalSeats}</span>
      </span>
    );
  }, [loading, error, selectedSection]);

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all min-w-[110px] ${
          isDarkMode
            ? 'bg-white/10 text-white hover:bg-white/20'
            : 'bg-primary/10 text-primary hover:bg-primary/20'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={loading || !!error || sections.length === 0}
      >
        {buttonContent}
        <FiChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && !loading && !error && sections.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`absolute right-0 mt-2 w-64 rounded-xl overflow-hidden shadow-lg z-50 ${
                isDarkMode
                  ? 'bg-gray-800/90 backdrop-blur-lg border border-white/10'
                  : 'bg-white/90 backdrop-blur-lg border border-gray-100'
              }`}
            >
              <div className="p-1.5">
                {sections.map((section) => (
                  <motion.button
                    key={section.id}
                    onClick={() => {
                      setSelectedSection(section);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      selectedSection && section.id === selectedSection.id
                        ? isDarkMode
                          ? 'bg-white/10 text-white'
                          : 'bg-primary/10 text-primary'
                        : isDarkMode
                          ? 'text-gray-300 hover:bg-white/5'
                          : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    whileHover={{ x: 2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    <div className="flex flex-col items-start gap-1">
                      <span className="font-medium">{section.label}</span>
                      <div className="flex items-center gap-2">
                        {section.locked ? (
                          <span className="flex items-center text-xs text-red-500">
                            <FiLock className="w-3 h-3 mr-1" />
                            Locked
                          </span>
                        ) : (
                          <>
                            <div
                              className={`flex items-center gap-1 text-xs ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}
                            >
                              <FiUsers className="w-3 h-3" />
                              <span className="font-medium">{section.occupied}</span>
                              <span className="opacity-60">/ {section.totalSeats}</span>
                            </div>
                            <span
                              className={`text-xs font-medium ${getUtilizationColor(
                                section.occupied,
                                section.totalSeats,
                                isDarkMode
                              )}`}
                            >
                              {section.totalSeats
                                ? Math.round((section.occupied / section.totalSeats) * 100)
                                : 0}
                              % Full
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {selectedSection && section.id === selectedSection.id && (
                      <div
                        className={`ml-2 text-xs font-medium px-2 py-1 rounded-md ${
                          isDarkMode ? 'bg-white/20' : 'bg-primary/20'
                        }`}
                      >
                        Active
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SeatsDropdown;