import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MdQrCodeScanner, MdPerson, MdMenuBook, MdHistory, MdAccessTime } from 'react-icons/md';
import Card from 'components/card';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Constants
const BRANCHES = ['CSE', 'ECE', 'MECH', 'IT', 'CIVIL', 'EEE', 'MCA', 'MBA', 'MTECH', 'AIML', 'CSE-AIML', 'CSE-DS', 'CSE-CS', 'CSE-IOT', 'CSE-CYBER'];
const sectionSeatLimits = {
  central: 450,
  reference: 300,
  reading: 400,
  elibrary: 100,
};

const Scanner = () => {
  document.title = 'Student Scan Manager';

  // State management
  const [state, setState] = useState({
    rollNumber: '',
    scannedStudent: null,
    scanLogs: [],
    selectedSection: 'reference-studisection', // Default to study section after 4:30 PM
    isAdmin: true,
    isLoading: false,
    sectionSeats: {
      central: { total: 450, occupied: 0 },
      reference: { total: 300, occupied: 0 },
      reading: { total: 400, occupied: 0 },
      elibrary: { total: 100, occupied: 0 },
    },
    currentPage: 1,
    itemsPerPage: 10,
    error: '',
    success: '',
    searchTerm: '',
  });

  const scanInputRef = useRef(null);
  const [logSortField, setLogSortField] = useState('createdAt');
  const [logSortDirection, setLogSortDirection] = useState('desc');
  const [showCameraModal, setShowCameraModal] = useState(false);
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFromDate, setExportFromDate] = useState('');
  const [exportToDate, setExportToDate] = useState('');

  // API base URL
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Fetch today's logs and seat availability on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [logsResponse, seatsResponse] = await Promise.all([
          axios.get(`${API_URL}/api/activity-logs/today`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/api/activity-logs/seats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setState((prev) => ({
          ...prev,
          scanLogs: logsResponse.data,
          sectionSeats: seatsResponse.data,
        }));
      } catch (error) {
        console.error('Fetch data error:', error.response?.data || error.message);
        handleError(error.response?.data?.message || 'Failed to fetch data');
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Auto-checkout and section transfer logic
  useEffect(() => {
    const interval = setInterval(async () => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const closingTimes = {
        'centrallibrary': { hour: 17, min: 30 }, // 5:30 PM
        'reference': { hour: 16, min: 30 }, // 4:30 PM
        'reference-studisection': { hour: 23, min: 59 }, // 11:59 PM
        'readingroom': { hour: 17, min: 30 }, // 5:30 PM
        'e-library': { hour: 17, min: 30 }, // 5:30 PM
      };

      const logsToUpdate = state.scanLogs.filter((log) => !log.timeOut && log.status === 'Checked In');
      for (const log of logsToUpdate) {
        const sectionKey = log.section.toLowerCase().replace(/\s/g, '');
        const closing = new Date();
        closing.setHours(closingTimes[sectionKey]?.hour || 17, closingTimes[sectionKey]?.min || 30, 0, 0);

        try {
          const token = localStorage.getItem('token');
          if (!token) {
            console.error(`No token for auto-checkout: ${log.rollNumber}`);
            continue;
          }

          // Transfer Reference to Reference - Study Section at 4:30 PM
          if (sectionKey === 'reference' && now >= closing && now < new Date().setHours(23, 59, 0, 0)) {
            console.log(`Transferring ${log.rollNumber} from Reference to Reference - Study Section`);
            await axios.post(
              `${API_URL}/api/activity-logs/transfer`,
              {
                rollNumber: log.rollNumber,
                fromSection: 'reference',
                toSection: 'reference',
                isStudySection: true,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setState((prev) => ({
              ...prev,
              scanLogs: prev.scanLogs.map((l) =>
                l._id === log._id
                  ? { ...l, section: 'Reference - Study Section', isStudySection: true }
                  : l
              ),
            }));
          }
          // Auto-checkout for closed sections
          else if (now > closing) {
            const sectionInput = sectionKey.includes('reference')
              ? 'reference'
              : sectionKey.replace('centrallibrary', 'central').replace('readingroom', 'reading').replace('e-library', 'elibrary');
            console.log(`Auto-checkout: rollNumber=${log.rollNumber}, section=${sectionInput}, originalSection=${log.section}`);
            const response = await axios.post(
              `${API_URL}/api/activity-logs/check-out`,
              { rollNumber: log.rollNumber, section: sectionInput },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log(`Auto-checkout successful: ${log.rollNumber}, section=${log.section}`);
            setState((prev) => ({
              ...prev,
              scanLogs: prev.scanLogs.map((l) =>
                l._id === log._id ? response.data : l
              ),
              sectionSeats: {
                ...prev.sectionSeats,
                [sectionInput]: {
                  ...prev.sectionSeats[sectionInput],
                  occupied: Math.max(0, (prev.sectionSeats[sectionInput]?.occupied || 0) - 1),
                },
              },
            }));
          }
        } catch (error) {
          console.error(`Auto-checkout/transfer failed for ${log.rollNumber}:`, error.response?.data || error.message);
        }
      }
    }, 60000); // Run every minute

    return () => clearInterval(interval);
  }, [state.scanLogs]);

  // Helper to check if a section is locked
  const isSectionLocked = useCallback((section) => {
    const now = new Date();
    const lockTimes = {
      central: { hour: 17, min: 30 }, // 5:30 PM
      reading: { hour: 17, min: 30 }, // 5:30 PM
      elibrary: { hour: 17, min: 30 }, // 5:30 PM
      reference: { hour: 16, min: 30 }, // 4:30 PM
      'reference-studisection': { hour: 23, min: 59 }, // 11:59 PM
    };

    const lockTime = new Date();
    lockTime.setHours(lockTimes[section]?.hour || 17, lockTimes[section]?.min || 30, 0, 0);
    return now > lockTime;
  }, []);

  // Helper to check if Reference is open (before 4:30 PM)
  const isReferenceOpen = useCallback(() => {
    const now = new Date();
    const referenceCloseTime = new Date();
    referenceCloseTime.setHours(16, 30, 0, 0); // 4:30 PM
    return now < referenceCloseTime;
  }, []);

  // Helper to get seat label for UI
  const getSeatLabel = (section) => {
    const { occupied, total } = state.sectionSeats[section] || { occupied: 0, total: sectionSeatLimits[section] };
    return `${occupied}/${total}`;
  };

  // Replace handleError and handleSuccess to use toastify
  const handleError = useCallback((message) => {
    let displayMessage = message;
    if (message === 'Student not found') {
      displayMessage = 'Student ID not found in the database. Please verify the ID (e.g., 24M11MC006) or contact support.';
    } else if (message.includes('Unauthorized')) {
      displayMessage = 'Session expired. Please log in again.';
      localStorage.removeItem('token');
      window.location.href = '/auth/sign-in';
    } else if (message.includes('Forbidden')) {
      displayMessage = 'Access denied. Admin privileges required.';
    } else if (message.includes('already checked in')) {
      displayMessage = `${message}. Try checking out or contact support to resolve.`;
    }
    toast.error(displayMessage, {
      position: 'top-right',
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'colored',
      progressStyle: { background: '#ef4444' },
    });
  }, []);

  const handleSuccess = useCallback((message) => {
    toast.success(message, {
      position: 'top-right',
      autoClose: 3500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'colored',
      progressStyle: { background: '#22c55e' },
    });
  }, []);

  // Helper to fetch seat counts
  const fetchSeatCounts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const seatsResponse = await axios.get(`${API_URL}/api/activity-logs/seats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setState((prev) => ({
        ...prev,
        sectionSeats: seatsResponse.data,
      }));
    } catch (error) {
      console.error('Fetch seat counts error:', error.response?.data || error.message);
    }
  }, []);

  // Handle manual scan
  const handleManualScan = useCallback(async () => {
    const id = state.rollNumber.trim();
    if (!id) {
      openCameraModal();
      return;
    }

    const section = state.selectedSection;
    if (isSectionLocked(section)) {
      handleError(`Cannot check in to ${section === 'reference-studisection' ? 'Reference - Study Section' : section} after closing time.`);
      return;
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: '', success: '' }));
      const token = localStorage.getItem('token');
      console.log('Scanning roll number:', id);
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('Selected section:', section);
      const studentResponse = await axios.get(`${API_URL}/api/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Student response:', studentResponse.data);
      const student = studentResponse.data;

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      let sectionLabel = section;
      let isStudySection = false;
      const seatSection = section === 'reference-studisection' ? 'reference' : section;

      if (section === 'reference') {
        sectionLabel = 'Reference';
      } else if (section === 'reference-studisection') {
        sectionLabel = 'Reference - Study Section';
        isStudySection = true;
      } else if (section === 'central') {
        sectionLabel = 'Central Library';
      } else if (section === 'reading') {
        sectionLabel = 'Reading Room';
      } else if (section === 'elibrary') {
        sectionLabel = 'E-Library';
      }

      const today = now.toISOString().split('T')[0];
      const activeLog = state.scanLogs.find(
        (log) => log.rollNumber.toLowerCase() === id.toLowerCase() && log.date === today && !log.timeOut && log.section === sectionLabel
      );

      if (activeLog) {
        // Check-out
        console.log(`Checking out: rollNumber=${id}, section=${section}`);
        const response = await axios.post(
          `${API_URL}/api/activity-logs/check-out`,
          { rollNumber: id, section: seatSection },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const updatedLog = response.data;

        setState((prev) => ({
          ...prev,
          scanLogs: [
            ...prev.scanLogs.filter((log) => log._id !== activeLog._id),
            updatedLog,
          ],
          scannedStudent: {
            rollNumber: id,
            name: student.name,
            branch: student.branch,
            timeOut: timeStr,
            section: sectionLabel,
            isStudySection,
            status: 'Checked Out',
            duration: updatedLog.duration,
          },
          sectionSeats: {
            ...prev.sectionSeats,
            [seatSection]: {
              ...prev.sectionSeats[seatSection],
              occupied: Math.max(0, (prev.sectionSeats[seatSection]?.occupied || 0) - 1),
            },
          },
          rollNumber: '',
          isLoading: false,
        }));

        handleSuccess(`Check-out recorded successfully for ${student.name}! Duration: ${updatedLog.duration}`);
        await fetchSeatCounts();
      } else {
        // Check-in
        console.log(`Checking in: rollNumber=${id}, section=${section}`);
        const response = await axios.post(
          `${API_URL}/api/activity-logs/check-in`,
          { rollNumber: id, section: seatSection },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const newLog = response.data;

        setState((prev) => ({
          ...prev,
          scanLogs: [...prev.scanLogs, newLog],
          scannedStudent: {
            rollNumber: id,
            name: student.name,
            branch: student.branch,
            timeIn: timeStr,
            section: sectionLabel,
            isStudySection,
            status: 'Checked In',
          },
          sectionSeats: {
            ...prev.sectionSeats,
            [seatSection]: {
              ...prev.sectionSeats[seatSection],
              occupied: (prev.sectionSeats[seatSection]?.occupied || 0) + 1,
            },
          },
          rollNumber: '',
          isLoading: false,
        }));

        handleSuccess(`Check-in recorded successfully for ${student.name}!`);
        await fetchSeatCounts();
      }

      if (scanInputRef.current) {
        scanInputRef.current.focus();
      }
    } catch (error) {
      console.error('Scan error:', error.response?.data || error.message);
      handleError(error.response?.data?.message || 'Scan failed');
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [state.rollNumber, state.selectedSection, state.scanLogs, isSectionLocked]);

  // Simulate scan (for camera modal)
  const handleSimulateScan = useCallback(async () => {
    const section = state.selectedSection;
    if (isSectionLocked(section)) {
      handleError(`Cannot check in to ${section === 'reference-studisection' ? 'Reference - Study Section' : section} after closing time.`);
      return;
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const token = localStorage.getItem('token');
      console.log('Simulating scan for random student');
      const studentsResponse = await axios.get(`${API_URL}/api/students/random`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Random student response:', studentsResponse.data);
      const student = studentsResponse.data;

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      let sectionLabel = section;
      let isStudySection = false;
      const seatSection = section === 'reference-studisection' ? 'reference' : section;

      if (section === 'reference') {
        sectionLabel = 'Reference';
      } else if (section === 'reference-studisection') {
        sectionLabel = 'Reference - Study Section';
        isStudySection = true;
      } else if (section === 'central') {
        sectionLabel = 'Central Library';
      } else if (section === 'reading') {
        sectionLabel = 'Reading Room';
      } else if (section === 'elibrary') {
        sectionLabel = 'E-Library';
      }

      const today = now.toISOString().split('T')[0];
      const activeLog = state.scanLogs.find(
        (log) => log.rollNumber.toLowerCase() === student.rollNumber.toLowerCase() && log.date === today && !log.timeOut && log.section === sectionLabel
      );

      if (activeLog) {
        console.log(`Checking out random student: rollNumber=${student.rollNumber}, section=${section}`);
        const response = await axios.post(
          `${API_URL}/api/activity-logs/check-out`,
          { rollNumber: student.rollNumber, section: seatSection },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const updatedLog = response.data;

        setState((prev) => ({
          ...prev,
          scanLogs: [
            ...prev.scanLogs.filter((log) => log._id !== activeLog._id),
            updatedLog,
          ],
          scannedStudent: {
            rollNumber: student.rollNumber,
            name: student.name,
            branch: student.branch,
            timeOut: timeStr,
            section: sectionLabel,
            isStudySection,
            status: 'Checked Out',
            duration: updatedLog.duration,
          },
          sectionSeats: {
            ...prev.sectionSeats,
            [seatSection]: {
              ...prev.sectionSeats[seatSection],
              occupied: Math.max(0, (prev.sectionSeats[seatSection]?.occupied || 0) - 1),
            },
          },
          isLoading: false,
        }));

        handleSuccess(`Check-out recorded successfully for ${student.name}!`);
        await fetchSeatCounts();
      } else {
        console.log(`Checking in random student: rollNumber=${student.rollNumber}, section=${section}`);
        const response = await axios.post(
          `${API_URL}/api/activity-logs/check-in`,
          { rollNumber: student.rollNumber, section: seatSection },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const newLog = response.data;

        setState((prev) => ({
          ...prev,
          scanLogs: [...prev.scanLogs, newLog],
          scannedStudent: {
            rollNumber: student.rollNumber,
            name: student.name,
            branch: student.branch,
            timeIn: timeStr,
            section: sectionLabel,
            isStudySection,
            status: 'Checked In',
          },
          sectionSeats: {
            ...prev.sectionSeats,
            [seatSection]: {
              ...prev.sectionSeats[seatSection],
              occupied: (prev.sectionSeats[seatSection]?.occupied || 0) + 1,
            },
          },
          isLoading: false,
        }));

        handleSuccess(`Check-in recorded successfully for ${student.name}!`);
        await fetchSeatCounts();
      }

      closeCameraModal();
    } catch (error) {
      console.error('Simulated scan error:', error.response?.data || error.message);
      handleError(error.response?.data?.message || 'Simulated scan failed');
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [state.selectedSection, state.scanLogs, isSectionLocked]);

  // Export to CSV
  const exportToCSV = useCallback(() => {
    try {
      if (!exportFromDate || !exportToDate) {
        throw new Error('Please select both from and to dates');
      }

      const fromDate = new Date(exportFromDate);
      const toDate = new Date(exportToDate);

      if (fromDate > toDate) {
        throw new Error('From date cannot be greater than to date');
      }

      const filteredLogs = state.scanLogs.filter((log) => {
        const logDate = new Date(log.date);
        return logDate >= fromDate && logDate <= toDate;
      });

      const headers = [
        'Name',
        'Roll Number',
        'Branch',
        'Section',
        'Date',
        'Check-In Time',
        'Check-Out Time',
        'Duration',
        'Status',
      ];

      const csvRows = filteredLogs.map((log) => [
        log.name,
        log.rollNumber,
        log.branch,
        log.section,
        log.date,
        log.timeIn || '-',
        log.timeOut || '-',
        log.duration || '-',
        log.status,
      ]);

      const csvContent = [headers.join(','), ...csvRows.map((row) => row.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `library_attendance_${exportFromDate}_to_${exportToDate}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShowExportModal(false);
      handleSuccess('CSV file downloaded successfully!');
    } catch (error) {
      console.error('Export error:', error.message);
      handleError(error.message);
    }
  }, [state.scanLogs, exportFromDate, exportToDate]);

  // Filter logs for selected section
  const filteredSectionLogs = useMemo(() => {
    let label = state.selectedSection;
    if (label === 'central') label = 'Central Library';
    if (label === 'reading') label = 'Reading Room';
    if (label === 'elibrary') label = 'E-Library';
    if (label === 'reference') label = 'Reference';
    if (label === 'reference-studisection') label = 'Reference - Study Section';

    if (label === 'Reference' || label === 'Reference - Study Section') {
      return state.scanLogs.filter((log) => log.section === 'Reference' || log.section === 'Reference - Study Section');
    }
    return state.scanLogs.filter((log) => log.section === label);
  }, [state.scanLogs, state.selectedSection]);

  // Pagination
  const totalPages = Math.ceil(filteredSectionLogs.length / state.itemsPerPage);
  const startIndex = (state.currentPage - 1) * state.itemsPerPage;
  const endIndex = startIndex + state.itemsPerPage;
  const currentPageLogs = filteredSectionLogs.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setState((prev) => ({ ...prev, currentPage: newPage }));
  };

  // Camera modal handling
  const openCameraModal = () => {
    setShowCameraModal(true);
    setTimeout(() => setCameraActive(true), 100);
  };

  const closeCameraModal = () => {
    setShowCameraModal(false);
    setCameraActive(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (showCameraModal && cameraActive && videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        })
        .catch((err) => {
          console.error('Camera error:', err);
          handleError('Failed to access camera');
        });
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [showCameraModal, cameraActive]);

  // Render
  return (
    <div className="w-full">
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        limit={3}
      />
      <div className="mt-3">
        {state.error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">{state.error}</div>
        )}
        {state.success && (
          <div className="mb-4 rounded-lg bg-green-100 p-3 text-green-700">{state.success}</div>
        )}
        <div className="mb-6 flex flex-col gap-5 w-full">
          {/* Scanner Section */}
          <Card extra="!p-[20px] w-full">
            <div className="mb-8">
              <h4 className="text-xl font-bold text-navy-700 dark:text-white">ID Scanner</h4>
              <p className="mt-2 text-base text-gray-600">Scan student IDs to manage library access</p>
            </div>

            <div className="mb-8 flex items-center gap-4">
              <div className="inline-flex rounded-xl bg-gray-100 p-1 dark:bg-navy-700">
                <button
                  onClick={() => setState((prev) => ({ ...prev, scanMode: 'student' }))}
                  className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                    state.scanMode === 'student'
                      ? 'bg-white text-brand-500 shadow-sm dark:bg-navy-600 dark:text-white'
                      : 'text-gray-600 hover:text-brand-500 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  <MdPerson className="h-5 w-5" />
                  Student ID
                </button>
                <div className="flex items-center gap-2 ml-2">
                  <div className="relative">
                    <select
                      value={state.selectedSection}
                      onChange={(e) => setState((prev) => ({ ...prev, selectedSection: e.target.value }))}
                      className="appearance-none [-webkit-appearance:none] [-moz-appearance:none] pr-8 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all bg-white text-brand-500 shadow-sm dark:bg-navy-600 dark:text-white border-0 focus:ring-2 focus:ring-brand-500 focus:outline-none h-[42px]"
                      style={{ minWidth: 160 }}
                    >
                      <option value="central" disabled={isSectionLocked('central')}>
                        Central Library {isSectionLocked('central') && '(Locked)'}
                      </option>
                      <option value="reference" disabled={!isReferenceOpen()}>
                        Reference {!isReferenceOpen() && '(Locked)'}
                      </option>
                      <option value="reference-studisection" disabled={isReferenceOpen()}>
                        Reference - Study Section {isReferenceOpen() && '(Not Open)'}
                      </option>
                      <option value="reading" disabled={isSectionLocked('reading')}>
                        Reading Room {isSectionLocked('reading') && '(Locked)'}
                      </option>
                      <option value="elibrary" disabled={isSectionLocked('elibrary')}>
                        E-Library {isSectionLocked('elibrary') && '(Locked)'}
                      </option>
                    </select>
                    <svg
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500 dark:text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <span className="inline-block rounded-lg border border-brand-500 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 dark:bg-navy-700 dark:text-brand-200">
                    Seats: {getSeatLabel(state.selectedSection === 'reference-studisection' ? 'reference' : state.selectedSection)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 dark:border-navy-600 dark:bg-navy-800">
              <div className="mb-4 rounded-full bg-white p-3 shadow-lg dark:bg-navy-700">
                <MdQrCodeScanner className="h-8 w-8 text-brand-500" />
              </div>
              <input
                type="text"
                ref={scanInputRef}
                value={state.rollNumber}
                onChange={(e) => setState((prev) => ({ ...prev, rollNumber: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleManualScan();
                }}
                placeholder="Scan or enter student ID (e.g., 24M11MC006)"
                className="mb-4 w-full max-w-xs rounded-lg border border-gray-300 px-4 py-2 text-center text-base focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                autoFocus
                disabled={state.isLoading}
              />
              <p className="mb-4 text-center text-sm text-gray-600 dark:text-gray-400">
                Place the student ID in front of the scanner
              </p>
              <button
                onClick={handleManualScan}
                className="flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-brand-600 active:bg-brand-700"
                disabled={state.isLoading}
              >
                <MdQrCodeScanner className="h-5 w-5" />
                Scan Now
              </button>
            </div>
          </Card>

          {/* Scan Results Section */}
          <Card extra="!p-[20px] w-full mt-6">
            <h4 className="mb-6 text-xl font-bold text-navy-700 dark:text-white">Scan Results</h4>
            {state.scannedStudent ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl p-3 bg-blue-100 text-blue-600">
                    <MdPerson className="h-8 w-8" />
                  </div>
                  <div>
                    <h5 className="text-lg font-semibold text-navy-700 dark:text-white">
                      {state.scannedStudent.name}
                    </h5>
                    <p className="text-sm text-gray-600">ID: {state.scannedStudent.rollNumber}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InfoCard icon={<MdMenuBook />} label="Branch" value={state.scannedStudent.branch} />
                  <InfoCard icon={<MdAccessTime />} label="Section" value={state.scannedStudent.section} />
                  <InfoCard icon={<MdHistory />} label="Status" value={state.scannedStudent.status || '-'} />
                  <InfoCard
                    icon={<MdAccessTime />}
                    label="Time"
                    value={state.scannedStudent.timeIn || state.scannedStudent.timeOut || '-'}
                  />
                </div>
                {state.scannedStudent.status === 'Checked Out' && (
                  <div className="rounded-xl border border-gray-200 p-4 dark:border-navy-600">
                    <h6 className="mb-3 font-semibold text-navy-700 dark:text-white">Duration</h6>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      {state.scannedStudent.duration}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-[100px] items-center justify-center text-gray-500 dark:text-gray-400">
                No scan data available
              </div>
            )}
          </Card>

          {/* Activity Log Table Section */}
          <Card extra="!p-[20px] w-full mt-6">
            <h4 className="mb-6 text-xl font-bold text-navy-700 dark:text-white">Activity Log</h4>
            <div className="mb-4 flex items-center justify-end">
              <button
                className="flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-brand-600 active:bg-brand-700"
                onClick={() => setShowExportModal(true)}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 4v16m8-8H4" />
                </svg>
                Export
              </button>
            </div>
            {showExportModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white dark:bg-navy-800 rounded-xl shadow-lg p-6 w-full max-w-xs flex flex-col items-center">
                  <h3 className="text-lg font-semibold mb-4 text-navy-700 dark:text-white">
                    Export Activity Log
                  </h3>
                  <label className="w-full mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={exportFromDate}
                    onChange={(e) => setExportFromDate(e.target.value)}
                    className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                  />
                  <label className="w-full mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={exportToDate}
                    onChange={(e) => setExportToDate(e.target.value)}
                    className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                  />
                  <div className="flex gap-2 w-full mt-2">
                    <button
                      onClick={() => setShowExportModal(false)}
                      className="flex-1 rounded-lg bg-gray-200 px-4 py-2 text-gray-700 font-medium hover:bg-gray-300 dark:bg-navy-700 dark:text-white dark:hover:bg-navy-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={exportToCSV}
                      className="flex-1 rounded-lg bg-brand-500 px-4 py-2 text-white font-medium hover:bg-brand-600"
                    >
                      Export
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-navy-700 dark:bg-navy-900">
                    <th className="w-[40px] py-4 px-4"></th>
                    <th className="py-4 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                      Name
                    </th>
                    <th className="py-4 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                      ID
                    </th>
                    <th className="py-4 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                      Department
                    </th>
                    <th className="py-4 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                      Time In
                    </th>
                    <th className="py-4 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                      Time Out
                    </th>
                    <th className="py-4 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                      Section
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentPageLogs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-6 text-center text-gray-400"
                      >
                        No activity logs available
                      </td>
                    </tr>
                  ) : (
                    currentPageLogs.map((log) => (
                      <tr
                        key={log._id}
                        className={`border-b border-gray-200 last:border-none hover:bg-gray-50 dark:border-navy-700 dark:hover:bg-navy-700 ${
                          log.isStudySection ? 'bg-amber-50 dark:bg-yellow-900/10' : ''
                        }`}
                      >
                        <td className="py-4 px-4"></td>
                        <td className="py-4 px-4 font-medium text-navy-700 dark:text-white">
                          {log.name}
                        </td>
                        <td className="py-4 px-4 font-mono text-sm">{log.rollNumber}</td>
                        <td className="py-4 px-4">{log.branch}</td>
                        <td className="py-4 px-4">{log.timeIn}</td>
                        <td className="py-4 px-4">{log.timeOut || '-'}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-medium ${
                              log.isStudySection
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-200'
                                : 'bg-gray-100 text-gray-600 dark:bg-navy-700 dark:text-gray-400'
                            }`}
                          >
                            {log.section}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {filteredSectionLogs.length > 0 && (
                <PaginationControls
                  currentPage={state.currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalEntries={filteredSectionLogs.length}
                />
              )}
            </div>
          </Card>
        </div>

        {/* Camera Modal */}
        {showCameraModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-navy-800 rounded-xl shadow-lg p-6 w-full max-w-xs flex flex-col items-center">
              <video
                ref={videoRef}
                className="rounded-lg w-64 h-40 bg-black mb-4"
                autoPlay
                muted
                playsInline
              />
              <button
                onClick={handleSimulateScan}
                className="mb-2 w-full rounded-lg bg-brand-500 px-4 py-2 text-white font-medium hover:bg-brand-600"
              >
                Simulate Scan
              </button>
              <button
                onClick={closeCameraModal}
                className="w-full rounded-lg bg-gray-200 px-4 py-2 text-gray-700 font-medium hover:bg-gray-300 dark:bg-navy-700 dark:text-white dark:hover:bg-navy-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const InfoCard = ({ icon, label, value }) => (
  <div className="rounded-xl bg-gray-50 p-4 dark:bg-navy-800">
    <div className="mb-2 flex items-center gap-2 text-gray-600 dark:text-gray-400">
      {React.cloneElement(icon, { className: 'h-5 w-5' })}
      <span className="text-sm">{label}</span>
    </div>
    <p className="font-medium text-navy-700 dark:text-white">{value}</p>
  </div>
);

const PaginationControls = ({ currentPage, totalPages, onPageChange, totalEntries }) => (
  <div className="mt-4 flex items-center justify-between">
    <div className="text-sm text-gray-600 dark:text-gray-400">
      Showing {((currentPage - 1) * 10) + 1} to{' '}
      {Math.min(currentPage * 10, totalEntries)} of{' '}
      {totalEntries} entries
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-navy-600 dark:text-gray-400 dark:hover:bg-navy-700"
      >
        Previous
      </button>
      <div className="flex items-center gap-1">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i + 1}
            onClick={() => onPageChange(i + 1)}
            className={`rounded-lg px-3 py-1 text-sm font-medium ${
              currentPage === i + 1
                ? 'bg-brand-500 text-white'
                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-navy-700'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-navy-600 dark:text-gray-400 dark:hover:bg-navy-700"
      >
        Next
      </button>
    </div>
  </div>
);

export default React.memo(Scanner);