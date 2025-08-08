import React from 'react';
import { motion } from 'framer-motion';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';

const StickyThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-8 right-8 z-50"
    >
      <button
        onClick={toggleTheme}
        className={`p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${
          isDarkMode
            ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
            : 'bg-white text-gray-700 hover:bg-gray-100'
        }`}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDarkMode ? <FiSun size={24} /> : <FiMoon size={24} />}
      </button>
    </motion.div>
  );
};

export default StickyThemeToggle; 