import React from "react";
import { Outlet } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import Header from "../../views/landing/components/Header";

const LandingLayout = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-navy-900' : 'bg-gray-50'}`}>
      <Header />
      <Outlet />
    </div>
  );
};

export default LandingLayout;
