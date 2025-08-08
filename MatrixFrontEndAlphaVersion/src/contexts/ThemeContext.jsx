import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if there's a saved preference in localStorage
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : false; // Default to light mode
  });

  useEffect(() => {
    // Update localStorage and document classes when theme changes
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    
    // Get both html and body elements
    const htmlElement = document.documentElement;
    const bodyElement = document.body;

    if (isDarkMode) {
      htmlElement.classList.add('dark');
      bodyElement.classList.add('dark');
      // Also set a data attribute for additional styling hooks
      htmlElement.setAttribute('data-theme', 'dark');
    } else {
      htmlElement.classList.remove('dark');
      bodyElement.classList.remove('dark');
      htmlElement.setAttribute('data-theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 