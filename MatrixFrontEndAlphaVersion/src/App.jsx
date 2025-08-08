import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LandingLayout from './layouts/landing';
import RTL from './layouts/rtl';
import AdminLayout from './layouts/admin';
import AuthLayout from './layouts/auth';
import StudentLayout from './layouts/student';
import { ThemeProvider } from './contexts/ThemeContext';
import StickyThemeToggle from './components/StickyThemeToggle';
import Landing from './views/landing';
import PrivateRoute from './components/PrivateRoute';

const App = () => {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<LandingLayout />}>
          <Route index element={<Landing />} />
        </Route>
        <Route path="/auth/*" element={<AuthLayout />} />
        <Route element={<PrivateRoute allowedRole="admin" />}>
          <Route path="/admin/*" element={<AdminLayout />} />
        </Route>
        <Route element={<PrivateRoute allowedRole="student" />}>
          <Route path="/student/*" element={<StudentLayout />} />
        </Route>
        <Route path="/rtl/*" element={<RTL />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <StickyThemeToggle />
    </ThemeProvider>
  );
};

export default App;