import React from 'react';
import { Routes, Route, useLocation, Navigate, Link } from 'react-router-dom';
import Navbar from '../../components/navbar';
import Sidebar from '../../components/sidebar';
import Footer from '../../components/footer/Footer';
import routes from '../../routes';
import Chatbot from '../../components/chatbot';

// Import student views directly
import StudentDashboard from '../../views/student';
import BorrowHistory from '../../views/student/history';

export default function StudentLayout() {
  const location = useLocation();
  const [open, setOpen] = React.useState(true);
  const [currentRoute, setCurrentRoute] = React.useState('Student Dashboard');

  // Get student routes
  const studentRoutes = React.useMemo(() => {
    // Log all routes for debugging
    console.log('All available routes:', routes);
    
    // Filter student routes
    const filtered = routes.filter(route => {
      const isStudentRoute = route.layout === '/student';
      console.log(`Route ${route.name}: layout=${route.layout}, isStudent=${isStudentRoute}`);
      return isStudentRoute;
    });
    
    console.log('Filtered student routes:', filtered);
    return filtered;
  }, []);

  React.useEffect(() => {
    window.addEventListener('resize', () =>
      window.innerWidth < 1200 ? setOpen(false) : setOpen(true)
    );
    return () => window.removeEventListener('resize', () => {});
  }, []);

  React.useEffect(() => {
    getActiveRoute(studentRoutes);
  }, [location.pathname, studentRoutes]);

  const getActiveRoute = (routes) => {
    let activeRoute = 'Student Dashboard';
    for (let i = 0; i < routes.length; i++) {
      if (location.pathname === `${routes[i].layout}/${routes[i].path}`) {
        setCurrentRoute(routes[i].name);
        return routes[i].name;
      }
    }
    return activeRoute;
  };

  const getActiveNavbar = (routes) => {
    let activeNavbar = false;
    for (let i = 0; i < routes.length; i++) {
      if (location.pathname === `${routes[i].layout}/${routes[i].path}`) {
        return routes[i].secondary;
      }
    }
    return activeNavbar;
  };

  // Create static student routes
  const staticStudentRoutes = [
    {
      name: 'Student Dashboard',
      layout: '/student',
      path: 'dashboard',
      icon: routes.find(r => r.path === 'dashboard')?.icon,
      component: StudentDashboard,
    },
    {
      name: 'Borrow History',
      layout: '/student',
      path: 'history',
      icon: routes.find(r => r.path === 'history')?.icon,
      component: BorrowHistory,
    },
  ];

  // Use static routes if dynamic routes are empty
  const routesToUse = studentRoutes.length > 0 ? studentRoutes : staticStudentRoutes;
  console.log('Routes being used:', routesToUse);

  document.documentElement.dir = 'ltr';
  return (
    <div className="flex h-full min-h-screen w-full bg-lightPrimary dark:!bg-navy-900">
      <Sidebar open={open} onClose={() => setOpen(!open)} role="student" />
      <div className="h-full w-full transition-all">
        <main className="mx-[12px] flex h-full min-h-screen flex-col transition-all md:pr-2 xl:ml-[313px]">
          <Navbar
            logoText="MATRIX"
            brandText={currentRoute}
            secondary={getActiveNavbar(routesToUse)}
          />
          <div className="mx-auto w-full flex-grow px-4 pb-6">
            <Routes>
              <Route path="/" element={<Navigate to="/student/dashboard" replace />} />
              {routesToUse.map((route) => {
                const Component = route.component;
                return (
                  <Route key={route.path} path={route.path} element={<Component />} />
                );
              })}
            </Routes>
          </div>
          <div className="mt-auto p-3">
            <Footer />
          </div>
        </main>
      </div>
      <Chatbot />
    </div>
  );
}