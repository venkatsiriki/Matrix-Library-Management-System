import React from 'react';
import { Link, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import routes from '../../routes.js';
import Footer from '../../components/footer/FooterAuthDefault';

export default function Auth() {
  const location = useLocation();

  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === '/auth') {
        const Component = prop.component;
        return (
          <Route path={prop.path} element={<Component />} key={key} />
        );
      } else {
        return null;
      }
    });
  };

  document.documentElement.dir = 'ltr';

  return (
    <div className="relative min-h-screen w-full">
      <div className="relative min-h-screen w-full bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        {/* Background pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] dark:bg-grid-slate-700/25"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/80 to-white dark:from-gray-950/40 dark:via-gray-900/80 dark:to-gray-950"></div>
        </div>

        <main className="relative mx-auto min-h-screen">
          <div className="flex min-h-screen">
            <div className="mx-auto flex w-full flex-col justify-start px-4 pt-12 lg:pt-0">
              <div className="mb-auto flex flex-col">
                {/* Back button with animation */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-8 relative z-20"
                >
                  <Link 
                    to="/" 
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                  >
                    <FiArrowLeft className="h-4 w-4" />
                    Return to Home
                  </Link>
                </motion.div>

                {/* Routes */}
                <Routes>
                  {getRoutes(routes)}
                  <Route
                    path="/"
                    element={<Navigate to="/auth/sign-in" replace />}
                  />
                </Routes>
              </div>

              {/* Footer - hide on /auth/sign-in */}
              {location.pathname !== '/auth/sign-in' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="py-8 relative z-20"
                >
                  <Footer />
                </motion.div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
