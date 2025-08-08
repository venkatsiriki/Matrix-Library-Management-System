import React, { useState, useEffect } from 'react';
import { motion, animate } from 'framer-motion';
import { 
  FiUser, 
  FiMail, 
  FiBook, 
  FiCalendar, 
  FiEdit3, 
  FiSave, 
  FiX,
  FiAward,
  FiClock,
  FiTrendingUp,
  FiBookOpen
} from 'react-icons/fi';
import PropTypes from 'prop-types';
import { getCurrentStudent, getStudentAnalytics } from '../../api/borrowApi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FancyCircleLoader from '../../components/FancyCircleLoader';

// Animated number using framer-motion animate utility
const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const controls = animate(display, value, {
      duration: 0.8,
      onUpdate: v => setDisplay(Math.floor(v)),
    });
    return controls.stop;
  }, [value]);
  return <span>{display}</span>;
};
AnimatedNumber.propTypes = { value: PropTypes.number.isRequired };

const ProgressBar = ({ value, maxValue, label, color, badgeAchieved }) => {
  const percent = Math.min((value / maxValue) * 100, 100);
  return (
    <div className="w-full" aria-label={label} role="progressbar" aria-valuenow={value} aria-valuemax={maxValue}>
    <div className="flex justify-between mb-1">
      <span className="text-sm font-medium text-navy-700 dark:text-white">{label}</span>
      <span className="text-sm font-medium text-navy-700 dark:text-white">{value}/{maxValue}</span>
    </div>
      <div className="relative w-full h-3 bg-gray-200 rounded-full dark:bg-navy-700 overflow-hidden">
        <motion.div
          className={`h-3 rounded-full ${color}`}
          style={{
            background: 'linear-gradient(90deg, #ffb347 0%, #ffcc33 100%)',
            transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
        />
        {badgeAchieved && (
          <FiAward className="absolute right-0 top-1/2 -translate-y-1/2 text-yellow-400 text-xl drop-shadow" title="Badge Achieved!" />
        )}
    </div>
  </div>
);
};
ProgressBar.propTypes = {
  value: PropTypes.number.isRequired,
  maxValue: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  badgeAchieved: PropTypes.bool,
};
ProgressBar.defaultProps = { badgeAchieved: false };

const StatCard = ({ icon, title, value, subtitle, color, bgColor }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className={`p-4 rounded-2xl shadow-lg ${bgColor} bg-opacity-60 border border-opacity-20 flex flex-col gap-1 min-w-0`}
    tabIndex={0}
    aria-label={title}
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-xl shadow-md ${color} bg-opacity-80 flex items-center justify-center" title={title}`}>{icon}</div>
      <div className="flex flex-col min-w-0">
        <h4 className="text-lg font-semibold text-navy-700 dark:text-white truncate">
          {typeof value === 'number' ? <AnimatedNumber value={value} /> : value}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{subtitle}</p>}
      </div>
    </div>
  </motion.div>
);
StatCard.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string,
  color: PropTypes.string.isRequired,
  bgColor: PropTypes.string,
};
StatCard.defaultProps = { bgColor: '' };

const getBadgeByHours = (hours) => {
  if (hours >= 100) return { title: "Diamond", color: "bg-blue-500" };
  if (hours >= 75) return { title: "Platinum", color: "bg-purple-500" };
  if (hours >= 50) return { title: "Gold", color: "bg-yellow-500" };
  if (hours >= 25) return { title: "Silver", color: "bg-gray-400" };
  if (hours >= 10) return { title: "Bronze", color: "bg-orange-500" };
  return { title: "Beginner", color: "bg-gray-600" };
};

const getInitials = (name) => {
  if (!name) return '';
  const names = name.split(' ');
  return names.map((n) => n[0]).join('').toUpperCase();
};

const renderInfoItem = (icon, label, value) => (
  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-navy-900 transition-all duration-200" tabIndex={0} aria-label={label}>
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lightPrimary dark:bg-navy-700">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
      <p className="text-base font-semibold text-navy-700 dark:text-white">{value || 'N/A'}</p>
    </div>
  </div>
);

const StudentProfile = () => {
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const fetchData = async () => {
    setError(null);
    try {
      const [profileData, analyticsData] = await Promise.all([
        getCurrentStudent(),
        getStudentAnalytics(),
      ]);
      setStudentData(profileData);
      setAnalytics(analyticsData);
    } catch (err) {
      setError('Failed to fetch profile data. Please try again later.');
      toast.error('Failed to fetch profile data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[300px]" role="status" aria-live="polite">
        <FancyCircleLoader />
        <span className="sr-only">Loading profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
        <p className="text-red-600 dark:text-red-400 font-semibold mb-2">{error}</p>
        <button
          onClick={fetchData}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Retry
        </button>
    </div>
  );
  }

  if (!studentData || !analytics) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
        <p className="text-gray-600 dark:text-gray-400 font-semibold mb-2">Profile data is unavailable.</p>
        <button
          onClick={fetchData}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Retry
        </button>
      </div>
    );
  }

  const hoursSpent = analytics && analytics.totalTimeSpent ? Math.floor(analytics.totalTimeSpent / 60) : 0;
  const badge = getBadgeByHours(hoursSpent);
  const nextBadgeHours = 
    hoursSpent >= 100 ? 100 :
    hoursSpent >= 75 ? 100 :
    hoursSpent >= 50 ? 75 :
    hoursSpent >= 25 ? 50 :
    hoursSpent >= 10 ? 25 : 10;
  const badgeAchieved = hoursSpent >= nextBadgeHours;

  return (
    <div className="mt-3">
      <div className="flex flex-col gap-5">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          className="relative flex flex-col rounded-[20px] bg-gradient-to-br from-blue-50 via-white to-purple-50 bg-clip-border p-6 shadow-3xl shadow-shadow-500 dark:!bg-gradient-to-br dark:from-navy-900 dark:via-navy-800 dark:to-navy-700 dark:text-white dark:shadow-none transition-all"
        >
          <div className="flex justify-between items-start mb-6 flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-4">
              {/* Profile Avatar */}
              <motion.div
                whileHover={{ scale: 1.08, rotate: 2 }}
                className="w-16 h-16 rounded-full bg-blue-100 dark:bg-navy-700 flex items-center justify-center text-2xl font-bold text-blue-700 dark:text-white border-2 border-blue-400 shadow-lg transition-all"
                aria-label="Profile avatar"
                tabIndex={0}
              >
                {studentData.avatarUrl ? (
                  <img
                    src={studentData.avatarUrl}
                    alt="Profile avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  getInitials(studentData.name)
                )}
              </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-navy-700 dark:text-white">
                  {studentData.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                  <span className="flex items-center text-base font-medium text-gray-500 dark:text-gray-300">
                    <FiBook className="mr-1 text-lg" />
                    {studentData.rollNumber}
                  </span>
              </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={<FiClock className="h-6 w-6 text-blue-500" aria-label="Hours Spent" />}
              title="Hours Spent"
              value={hoursSpent}
              subtitle="Total time in library"
              color="bg-blue-500"
              bgColor="bg-blue-100 dark:bg-navy-800"
            />
            <StatCard
              icon={<FiTrendingUp className="h-6 w-6 text-green-500" aria-label="Library Rank" />}
              title="Library Rank"
              value={analytics.rank ?? "N/A"}
              subtitle="Based on time spent"
              color="bg-green-500"
              bgColor="bg-green-100 dark:bg-navy-800"
            />
            <StatCard
              icon={<FiAward className="h-6 w-6 text-purple-500" aria-label="Current Badge" />}
              title="Current Badge"
              value={badge.title}
              subtitle={`${hoursSpent}/${nextBadgeHours}h to next badge`}
              color="bg-purple-500"
              bgColor="bg-purple-100 dark:bg-navy-800"
            />
            <StatCard
              icon={<FiBookOpen className="h-6 w-6 text-orange-500" aria-label="Total Visits" />}
              title="Total Visits"
              value={analytics.totalVisits || 0}
              subtitle="Library check-ins"
              color="bg-orange-500"
              bgColor="bg-orange-100 dark:bg-navy-800"
            />
          </div>

          {/* Progress Section */}
          <div className="bg-white/60 dark:bg-navy-900/60 rounded-xl p-4 mb-6 backdrop-blur-md shadow-inner border border-gray-100 dark:border-navy-800">
            <h3 className="text-lg font-semibold text-navy-700 dark:text-white mb-4 flex items-center gap-2">
              Progress to Next Badge
              {badgeAchieved && <FiAward className="text-yellow-400 ml-2" title="Badge Achieved!" />}
            </h3>
            <ProgressBar
              value={hoursSpent}
              maxValue={nextBadgeHours}
              label="Hours Progress"
              color={badge.color}
              badgeAchieved={badgeAchieved}
            />
          </div>
        </motion.div>

        {/* Profile Information Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 gap-5 lg:grid-cols-2"
        >
          {/* Basic Information */}
          <div className="rounded-[20px] bg-white/60 dark:bg-navy-800/60 p-6 shadow-xl backdrop-blur-md border border-gray-100 dark:border-navy-800">
            <h4 className="text-lg font-bold text-navy-700 dark:text-white mb-4 flex items-center gap-2 border-b border-gray-200 dark:border-navy-700 pb-2">
              <FiUser className="h-5 w-5" />
              Basic Information
            </h4>
            <div className="space-y-4">
              {renderInfoItem(
                <FiMail className="h-5 w-5 text-brand-500 dark:text-white" />, 'Email', studentData.email
              )}
              {renderInfoItem(
                <FiBook className="h-5 w-5 text-brand-500 dark:text-white" />, 'Roll Number', studentData.rollNumber
              )}
            </div>
          </div>

          {/* Academic Information */}
          <div className="rounded-[20px] bg-white/60 dark:bg-navy-800/60 p-6 shadow-xl backdrop-blur-md border border-gray-100 dark:border-navy-800">
            <h4 className="text-lg font-bold text-navy-700 dark:text-white mb-4 flex items-center gap-2 border-b border-gray-200 dark:border-navy-700 pb-2">
              <FiAward className="h-5 w-5" />
              Academic Information
            </h4>
            <div className="space-y-4">
              {renderInfoItem(
                <FiBook className="h-5 w-5 text-brand-500 dark:text-white" />, 'Department', studentData.department
              )}
              {renderInfoItem(
                <FiCalendar className="h-5 w-5 text-brand-500 dark:text-white" />, 'Batch', studentData.batch
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentProfile; 