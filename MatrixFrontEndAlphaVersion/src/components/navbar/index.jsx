import React from "react";
import Dropdown from "components/dropdown";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import {
  IoMdNotificationsOutline,
  IoMdInformationCircleOutline,
} from "react-icons/io";
import { FiUser, FiHome } from "react-icons/fi";
import { motion } from "framer-motion";
import DarkModeToggle from "components/darkModeToggle";
import { useLocation } from "react-router-dom";
import { HiX } from "react-icons/hi";
import { getNotifications, markAllNotificationsRead } from "../../api/borrowApi";
import Modal from "../Modal";

const Navbar = (props) => {
  const { brandText } = props;
  const [darkmode, setDarkmode] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isStudent = location.pathname.startsWith('/student');
  const [showMobileSearch, setShowMobileSearch] = React.useState(false);
  const [userData, setUserData] = React.useState(null);
  const [notifications, setNotifications] = React.useState([]);
  const [loadingNotifications, setLoadingNotifications] = React.useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = React.useState(false);
  const [helpModal, setHelpModal] = React.useState(null);

  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  // Fetch notifications when dropdown is opened
  React.useEffect(() => {
    if (notifDropdownOpen) {
      setLoadingNotifications(true);
      getNotifications()
        .then(setNotifications)
        .finally(() => setLoadingNotifications(false));
    }
  }, [notifDropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
    navigate('/auth/sign-in');
  };

  const toggleDarkMode = () => {
    if (darkmode) {
      document.body.classList.remove("dark");
      setDarkmode(false);
    } else {
      document.body.classList.add("dark");
      setDarkmode(true);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <nav className="sticky top-0 z-40 flex flex-row flex-wrap items-center justify-between rounded-xl bg-white/10 p-2 backdrop-blur-xl dark:bg-[#0b14374d] mb-4 overflow-visible">
      <div className="ml-[6px] flex flex-col sm:flex-row items-start sm:items-center">
        <div className="flex items-center mb-2 sm:mb-0">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="flex items-center">
              <Link
                to={isStudent ? "/student/dashboard" : "/admin/analytics"}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Dashboard
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {brandText}
              </span>
            </div>
            <h1 className="mt-1 sm:mt-0 sm:ml-4 text-xl font-bold text-navy-700 dark:text-white">
              {brandText}
            </h1>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-auto h-[52px]">
        {/* Notifications */}
        <motion.div className="flex items-center">
          <Dropdown
            button={
              <motion.p 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer"
                onClick={() => setNotifDropdownOpen((open) => !open)}
              >
                <IoMdNotificationsOutline className="h-5 w-5 text-gray-600 dark:text-white" />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                )}
              </motion.p>
            }
            animation="origin-[65%_0%] md:origin-top-right transition-all duration-300 ease-in-out"
            children={
              <div className="flex w-[280px] flex-col gap-2 rounded-[20px] bg-white p-4 shadow-xl shadow-shadow-500 dark:!bg-navy-700 dark:text-white dark:shadow-none">
                <div className="flex items-center justify-between">
                  <p className="text-base font-bold text-navy-700 dark:text-white">
                    Notifications
                  </p>
                  <button
                    className="text-sm font-medium text-navy-700 dark:text-white cursor-pointer hover:text-brand-500"
                    onClick={handleMarkAllRead}
                  >
                    Mark all read
                  </button>
                </div>
                {loadingNotifications ? (
                  <div className="text-xs text-gray-500 py-4 text-center">Loading...</div>
                ) : notifications.length === 0 ? (
                  <div className="text-xs text-gray-500 py-4 text-center">No notifications</div>
                ) : (
                  notifications.filter(n => !n.read).slice(0, 6).map((notif) => (
                    <div
                      key={notif._id}
                      className={`flex w-full items-center gap-3 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-navy-600 bg-blue-50 dark:bg-navy-800/50`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-b from-brandLinear to-brand-500 text-white">
                        <IoMdNotificationsOutline className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col items-start">
                        <p className="text-sm font-medium text-navy-700 dark:text-white">
                          {notif.type === 'overdue' ? 'Overdue Alert' : notif.type === 'book' ? 'Book Update' : 'Notification'}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            }
            classNames={"py-2 top-4 -left-[230px] md:-left-[240px] w-max"}
          />
        </motion.div>
        {/* Help & Support */}
        <motion.div className="flex items-center">
          <Dropdown
            button={
              <motion.p 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer"
              >
                <IoMdInformationCircleOutline className="h-5 w-5 text-gray-600 dark:text-white" />
              </motion.p>
            }
            children={
              <div className="flex w-[260px] flex-col gap-2 rounded-[20px] bg-white p-4 shadow-xl shadow-shadow-500 dark:!bg-navy-700 dark:text-white dark:shadow-none">
                <div className="flex flex-col">
                  <h4 className="text-sm font-bold text-navy-700 dark:text-white">
                    Help & Resources
                  </h4>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    Quick access to help
                  </p>
                </div>
                <div className="h-px w-full bg-gray-200 dark:bg-white/20" />
                <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-white dark:hover:bg-navy-600" onClick={() => setHelpModal('guide')}>
                  <IoMdInformationCircleOutline className="h-4 w-4" />
                  <span>Library Guide</span>
                </button>
                <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-white dark:hover:bg-navy-600" onClick={() => setHelpModal('manual')}>
                  <IoMdInformationCircleOutline className="h-4 w-4" />
                  <span>System Manual</span>
                </button>
                <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-white dark:hover:bg-navy-600" onClick={() => setHelpModal('support')}>
                  <IoMdInformationCircleOutline className="h-4 w-4" />
                  <span>Contact Support</span>
                </button>
              </div>
            }
            classNames={"py-2 top-6 -left-[220px] md:-left-[230px] w-max"}
            animation="origin-[75%_0%] md:origin-top-right transition-all duration-300 ease-in-out"
          />
        </motion.div>
        {/* Profile */}
        <div className="flex items-center">
          <Dropdown
            button={
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-transparent bg-lightPrimary hover:border-brand-500 transition-colors dark:bg-navy-700"
              >
                {userData?.profileImage ? (
                  <img
                    src={userData.profileImage}
                    alt="Profile"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <FiUser className="h-5 w-5 text-gray-600 dark:text-white" />
                )}
              </motion.div>
            }
            children={
              <div className="flex w-[200px] flex-col justify-start rounded-[20px] bg-white bg-cover bg-no-repeat shadow-xl shadow-shadow-500 dark:!bg-navy-700 dark:text-white dark:shadow-none">
                <div className="p-3">
                  <div className="flex items-center gap-2">
                    {userData?.profileImage ? (
                      <img
                        src={userData.profileImage}
                        alt="Profile"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-brandLinear to-brand-500 text-white">
                        <FiUser className="h-5 w-5" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <p className="text-sm font-bold text-navy-700 dark:text-white">
                        {userData?.name || (isStudent ? "Student" : "Admin")}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[120px]" title={userData?.email || (isStudent ? 'student@matrix.com' : 'admin@matrix.com')}>
                        {userData?.email || (isStudent ? "student@matrix.com" : "admin@matrix.com")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="h-px w-full bg-gray-200 dark:bg-white/20" />
                <div className="flex flex-col p-3">
                  {isStudent && userData?.studentId && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Student ID: {userData.studentId}
                    </p>
                  )}
                  {isStudent && userData?.joinDate && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Joined: {userData.joinDate}
                    </p>
                  )}
                  <Link
                    to="/"
                    className="flex items-center gap-2 text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-navy-600 rounded-lg px-2 py-1.5"
                  >
                    <FiHome className="h-4 w-4" />
                    Home
                  </Link>
                  <Link
                    to={`${isStudent ? "/student" : "/admin"}/profile`}
                    className="flex items-center gap-2 text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-navy-600 rounded-lg px-2 py-1.5"
                  >
                    <FiUser className="h-4 w-4" />
                    Profile
                  </Link>
                  <Link
                    to={`${isStudent ? "/student" : "/admin"}/dashboard`}
                    className="flex items-center gap-2 text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-navy-600 rounded-lg px-2 py-1.5"
                  >
                    <IoMdNotificationsOutline className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 mt-2 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg px-2 py-1.5"
                  >
                    <HiX className="h-4 w-4" />
                    Log Out
                  </button>
                </div>
              </div>
            }
            classNames={"py-2 top-12 -right-0 md:-right-0 w-max"}
          />
        </div>
      </div>
      {/* Help & Resources Modals (moved outside Dropdown) */}
      <Modal isOpen={helpModal === 'guide'} onClose={() => setHelpModal(null)} title={<span className="flex items-center gap-2"><IoMdInformationCircleOutline className="text-blue-500" /> Library Guide</span>}>
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <IoMdInformationCircleOutline className="text-blue-500 text-xl" />
            <h3 className="text-lg font-semibold">Getting Started with Matrix Library</h3>
          </div>
          <ol className="list-decimal ml-6 space-y-1 text-base">
            <li><span className="font-medium">Browse & Search:</span> Use the dashboard or search bar to find books and resources.</li>
            <li><span className="font-medium">Borrow:</span> Scan your student ID and the book barcode at the counter or kiosk.</li>
            <li><span className="font-medium">Return:</span> Return books at the counter or via the return kiosk before the due date.</li>
            <li><span className="font-medium">Digital Library:</span> Access e-books and resources from the Digital Library section.</li>
            <li><span className="font-medium">Track Activity:</span> View your borrow history, fines, and notifications in your profile.</li>
          </ol>
          <div className="text-sm text-gray-500 dark:text-gray-400">Need more help? Contact the library staff or see the System Manual.</div>
        </div>
      </Modal>
      <Modal isOpen={helpModal === 'manual'} onClose={() => setHelpModal(null)} title={<span className="flex items-center gap-2"><IoMdInformationCircleOutline className="text-blue-500" /> System Manual</span>}>
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <IoMdInformationCircleOutline className="text-blue-500 text-xl" />
            <h3 className="text-lg font-semibold">System Manual Overview</h3>
          </div>
          <ul className="list-disc ml-6 space-y-1 text-base">
            <li><span className="font-medium">Student Dashboard:</span> Monitor your library usage and statistics.</li>
            <li><span className="font-medium">Borrow History:</span> Review all your borrowed and returned books.</li>
            <li><span className="font-medium">Library Forms:</span> Submit requests, feedback, or report issues.</li>
            <li><span className="font-medium">Profile:</span> Update your personal details and preferences.</li>
            <li><span className="font-medium">Notifications:</span> Stay informed about due dates, returns, and fines.</li>
          </ul>
          <div className="text-sm text-gray-500 dark:text-gray-400">For detailed instructions, refer to the FAQ or contact support.</div>
        </div>
      </Modal>
      <Modal isOpen={helpModal === 'support'} onClose={() => setHelpModal(null)} title={<span className="flex items-center gap-2"><IoMdInformationCircleOutline className="text-blue-500" /> Contact Support</span>}>
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <IoMdInformationCircleOutline className="text-blue-500 text-xl" />
            <h3 className="text-lg font-semibold">Library Support</h3>
          </div>
          <div className="text-base mb-2">For assistance, please reach out to us:</div>
          <ul className="mb-2 space-y-1">
            <li><span className="font-medium">Email:</span> <a href="mailto:matrix@support.com" className="text-blue-600 underline">matrix@support.com</a></li>
            <li><span className="font-medium">Phone:</span> <a href="tel:+911234567890" className="text-blue-600 underline">+91 12345 67890</a></li>
            <li><span className="font-medium">Visit:</span> Library Help Desk, Main Hall</li>
          </ul>
          <div className="text-sm text-gray-500 dark:text-gray-400">Support is available during library hours. We are here to help!</div>
        </div>
      </Modal>
    </nav>
  );
};

export default Navbar;
