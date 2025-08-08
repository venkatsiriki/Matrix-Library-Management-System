/* eslint-disable */
import { HiX } from 'react-icons/hi';
import { MdKeyboardArrowRight, MdKeyboardArrowLeft } from 'react-icons/md';
import { motion } from 'framer-motion';
import Links from './components/Links';
import SidebarCard from './componentsrtl/SidebarCard';
import StudentSidebarCard from './components/StudentSidebarCard';
import routes from '../../routes';
import { FaBookReader } from 'react-icons/fa';

const Sidebar = ({ open, onClose, role = 'admin', routes: providedRoutes }) => {
  // Use provided routes or filter the default routes
  const sidebarRoutes = providedRoutes || routes.filter((route) => {
    if (role === 'student') {
      return route.layout === '/student';
    }
    if (role === 'admin') {
      return route.layout === '/admin';
    }
    return route.layout === '/rtl';
  });

  // Debug logging
  console.log('Sidebar - Role:', role);
  console.log('Sidebar - Routes:', sidebarRoutes);

  return (
    <>
      {/* Mobile Toggle Button */}
      <motion.button
        initial={{ x: -100 }}
        animate={{ x: open ? -100 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        onClick={() => !open && onClose()}
        className="fixed left-0 top-1/2 z-40 -translate-y-1/2 transform rounded-r-2xl bg-white p-3 shadow-lg dark:bg-navy-800 xl:hidden hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors"
      >
        <MdKeyboardArrowRight className="h-6 w-6 text-navy-700 dark:text-white" />
      </motion.button>

      <motion.div
        initial={{ x: -300 }}
        animate={{ x: open ? 0 : -300 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`sm:none fixed !z-50 flex min-h-screen w-[290px] items-center px-4 transition-all`}
      >
        <motion.div
          className="flex max-h-[90vh] w-full flex-col rounded-2xl bg-white shadow-card-light dark:bg-navy-800 dark:shadow-card-dark"
        >
          {/* Close Button */}
          <div className="relative h-12">
            <motion.button
              className="absolute right-4 top-4 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-600 hover:bg-gray-100 dark:bg-navy-700 dark:text-gray-400 dark:hover:bg-navy-600 xl:hidden shadow-btn-light dark:shadow-btn-dark hover:shadow-btn-hover"
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MdKeyboardArrowLeft className="h-6 w-6" />
            </motion.button>
          </div>

          {/* Header Section with Background */}
          <div className="relative h-[180px] overflow-hidden rounded-t-2xl -mt-12">
            {/* Gradient Background */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-gray-100 dark:from-navy-800 dark:via-navy-900 dark:to-gray-900 transition-colors duration-300">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-100/10 to-transparent dark:via-blue-900/10" />
              </div>
            </div>

            {/* Logo Section */}
            <div className="relative flex h-full flex-col items-center justify-center px-6 py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
                className="mb-3 flex h-16 w-16 items-center justify-center rounded-xl bg-white/90 shadow-card-light backdrop-blur-sm dark:bg-navy-800/90 dark:shadow-card-dark"
              >
                <FaBookReader className="h-8 w-8 text-brand-500 dark:text-brand-400" />
              </motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <h1 className="font-poppins text-xl font-bold tracking-wider text-slate-800 dark:text-white">
                  MATRIX
                </h1>
                <div className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                  {role === 'student' ? 'Student Portal' : 'Admin Portal'}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="scrollbar-hidden flex-1 overflow-y-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <ul className="mb-auto pt-4">
                <Links routes={sidebarRoutes} />
              </ul>
            </motion.div>
          </div>

          {/* Bottom Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="px-4 pb-4"
          >
            {role === 'student' ? <StudentSidebarCard /> : <SidebarCard />}
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default Sidebar;