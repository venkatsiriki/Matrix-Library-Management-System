import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLogIn, FiMenu, FiX, FiUser, FiBook, FiLogOut, FiHome } from 'react-icons/fi';
import { useTheme } from '../../../contexts/ThemeContext';
import SeatsDropdown from './SeatsDropdown';
import Dropdown from '../../../components/dropdown';

const Header = ({ onLoad }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero-section');
  const [isScrolled, setIsScrolled] = useState(false);
  const [userData, setUserData] = useState(null);

  const navLinks = [
    { path: '/', label: 'Home', sectionId: 'hero-section' },
    { path: '/#how-it-works', label: 'How It Works', sectionId: 'how-it-works-section' },
    { path: '/#features', label: 'Features', sectionId: 'features-section' },
    { path: '/#digital-library', label: 'Digital Library', sectionId: 'digital-library-section' },
    { path: '/#racks', label: 'Find Books', sectionId: 'racks-section' },
    { path: '/#testimonials', label: 'Testimonials', sectionId: 'testimonials-section' },
    { path: '/#faq', label: 'FAQ', sectionId: 'faq-section' },
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
    navigate('/auth/sign-in');
  };

  // Handle smooth scrolling and active section highlighting
  const handleNavClick = (e, path, sectionId, isPage) => {
    e.preventDefault();
    
    if (isPage) {
      navigate(path);
      setIsMobileMenuOpen(false);
      return;
    }

    // For section links, navigate to home first if not already there
    if (window.location.pathname !== '/') {
      navigate('/');
      // Wait for navigation to complete before scrolling
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
          setActiveSection(sectionId);
        }
      }, 100);
    } else {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
        setActiveSection(sectionId);
      }
    }
    setIsMobileMenuOpen(false);
  };

  // Update active section based on scroll position and handle header background
  useEffect(() => {
    const handleScroll = () => {
      // Update active section
      const sections = navLinks.map(link => document.getElementById(link.sectionId));
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(section.id);
          break;
        }
      }

      // Update header background
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [navLinks]);

  // Call onLoad when component mounts
  useEffect(() => {
    onLoad?.();
  }, [onLoad]);

  return (
    <motion.header 
      initial={false}
      animate={{
        backgroundColor: isDarkMode 
          ? 'rgba(17, 24, 39, 0.85)' 
          : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: isDarkMode 
          ? '1px solid rgba(255, 255, 255, 0.1)' 
          : '1px solid rgba(0, 0, 0, 0.1)',
      }}
      transition={{ duration: 0.2 }}
      className="fixed top-0 left-0 right-0 z-[999]"
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <motion.h1 
              className={`text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${
                isDarkMode
                  ? 'from-purple-500 via-blue-500 to-emerald-500'
                  : 'from-pink-500 via-purple-500 to-indigo-500'
              } font-['Audiowide'] tracking-wider`}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              MATRIX
            </motion.h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navLinks.map((link) => (
              <motion.div
                key={link.path}
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link
                  to={link.path}
                  onClick={(e) => handleNavClick(e, link.path, link.sectionId, link.isPage)}
                  className={`relative text-sm xl:text-base font-medium transition-all ${
                    isDarkMode
                      ? 'text-gray-300 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                  {!link.isPage && activeSection === link.sectionId && (
                    <motion.div
                      layoutId="activeSection"
                      className={`absolute -bottom-1 left-0 right-0 h-0.5 ${
                        isDarkMode ? 'bg-primary' : 'bg-primary'
                      }`}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Login Button & Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Seats Dropdown */}
            <div className="hidden md:block">
              <SeatsDropdown isDarkMode={isDarkMode} />
            </div>

            {userData ? (
              <Dropdown
                button={
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 border-transparent bg-lightPrimary hover:border-brand-500 transition-colors dark:bg-navy-700"
                  >
                    {userData.profileImage ? (
                      <img
                        src={userData.profileImage}
                        alt="Profile"
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white/20 transition-transform duration-200 hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                        <FiUser className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                    )}
                  </motion.div>
                }
                children={
                  <div className="flex w-[180px] sm:w-[200px] flex-col justify-start rounded-[20px] bg-white bg-cover bg-no-repeat shadow-xl shadow-shadow-500 dark:!bg-navy-700 dark:text-white dark:shadow-none">
                    <div className="p-3">
                      <div className="flex items-center gap-2">
                        {userData.profileImage ? (
                          <img
                            src={userData.profileImage}
                            alt="Profile"
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gradient-to-b from-brandLinear to-brand-500 text-white">
                            <FiUser className="h-4 w-4 sm:h-5 sm:w-5" />
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-navy-700 dark:text-white truncate">
                            {userData.name}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {userData.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="h-px w-full bg-gray-200 dark:bg-white/20" />
                    <div className="flex flex-col p-3">
                      <Link
                        to="/"
                        className="flex items-center gap-2 text-xs sm:text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-navy-600 rounded-lg px-2 py-1.5"
                      >
                        <FiHome className="h-3 w-3 sm:h-4 sm:w-4" />
                        Home
                      </Link>
                      <Link
                        to={`/${userData.role}/profile`}
                        className="flex items-center gap-2 text-xs sm:text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-navy-600 rounded-lg px-2 py-1.5"
                      >
                        <FiUser className="h-3 w-3 sm:h-4 sm:w-4" />
                        Profile
                      </Link>
                      <Link
                        to={`/${userData.role}/dashboard`}
                        className="flex items-center gap-2 text-xs sm:text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-navy-600 rounded-lg px-2 py-1.5"
                      >
                        <FiBook className="h-3 w-3 sm:h-4 sm:w-4" />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 mt-2 text-xs sm:text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg px-2 py-1.5"
                      >
                        <FiLogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                }
                classNames={"py-2 top-12 -right-0 md:-right-0 w-max"}
              />
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/auth/sign-in')}
                className={`hidden md:flex items-center h-[32px] sm:h-[38px] px-3 sm:px-5 rounded-xl space-x-2 font-medium transition-all text-xs sm:text-sm ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-purple-500/90 to-blue-500/90 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/20'
                    : 'bg-gradient-to-r from-primary/90 to-indigo-500/90 hover:from-primary hover:to-indigo-500 text-white shadow-lg shadow-primary/20'
                }`}
              >
                <FiLogIn className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Sign In</span>
              </motion.button>
            )}

            {/* Mobile Seats Dropdown */}
            <div className="md:hidden">
              <SeatsDropdown isDarkMode={isDarkMode} />
            </div>

            {/* Mobile Menu Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-1.5 sm:p-2 rounded-xl ${
                isDarkMode
                  ? 'bg-white/10 hover:bg-white/20'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {isMobileMenuOpen ? (
                <FiX className={`w-5 h-5 sm:w-6 sm:h-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
              ) : (
                <FiMenu className={`w-5 h-5 sm:w-6 sm:h-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`lg:hidden mt-3 sm:mt-4 p-3 sm:p-4 rounded-2xl ${
                isDarkMode
                  ? 'bg-gray-800/90 backdrop-blur-lg'
                  : 'bg-white/90 backdrop-blur-lg'
              }`}
            >
              <div className="flex flex-col space-y-3 sm:space-y-4">
                {navLinks.map((link) => (
                  <motion.div
                    key={link.path}
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Link
                      to={link.path}
                      onClick={(e) => handleNavClick(e, link.path, link.sectionId, link.isPage)}
                      className={`text-sm sm:text-base font-medium transition-colors ${
                        activeSection === link.sectionId
                          ? isDarkMode
                            ? 'text-primary'
                            : 'text-primary'
                          : isDarkMode
                          ? 'text-gray-400 hover:text-white'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                {userData ? (
                  <>
                    <Link
                      to="/"
                      className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      <FiHome className="w-4 h-4" />
                      Home
                    </Link>
                    <Link
                      to={`/${userData.role}/profile`}
                      className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      <FiUser className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link
                      to={`/${userData.role}/dashboard`}
                      className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      <FiBook className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-sm sm:text-base font-medium text-red-500 hover:text-red-600"
                    >
                      <FiLogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/auth/sign-in')}
                    className={`flex items-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl space-x-2 font-medium text-sm sm:text-base ${
                      isDarkMode
                        ? 'bg-white/10 hover:bg-white/20 text-white'
                        : 'bg-primary text-white hover:bg-primary/90'
                    }`}
                  >
                    <FiLogIn className="w-4 h-4" />
                    <span>Login</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
};

export default Header; 