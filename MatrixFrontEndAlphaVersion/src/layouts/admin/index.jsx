import React from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import Navbar from '../../components/navbar';
import Sidebar from '../../components/sidebar';
import Footer from '../../components/footer/Footer';
import routes from '../../routes';

export default function AdminLayout(props) {
  const { ...rest } = props;
  const location = useLocation();
  const [open, setOpen] = React.useState(true);
  const [currentRoute, setCurrentRoute] = React.useState('Main Dashboard');

  React.useEffect(() => {
    window.addEventListener('resize', () =>
      window.innerWidth < 1200 ? setOpen(false) : setOpen(true)
    );
    return () => window.removeEventListener('resize', () => {});
  }, []);

  React.useEffect(() => {
    getActiveRoute(routes);
  }, [location.pathname]);

  const getActiveRoute = (routes) => {
    let activeRoute = 'Main Dashboard';
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

  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === '/admin') {
        const Component = prop.component;
        return (
          <Route 
            path={prop.path} 
            element={<Component />} 
            key={key} 
          />
        );
      }
      return null;
    });
  };

  document.documentElement.dir = 'ltr';
  return (
    <div className="flex h-full min-h-screen w-full bg-lightPrimary dark:!bg-navy-900">
      <Sidebar open={open} onClose={() => setOpen(!open)} />
      <div className="h-full w-full transition-all">
        <main className="mx-[12px] flex h-full min-h-screen flex-col transition-all md:pr-2 xl:ml-[313px]">
          <Navbar
            logoText="MATRIX"
            brandText={currentRoute}
            secondary={getActiveNavbar(routes)}
            {...rest}
          />
          <div className="mx-auto w-full flex-grow px-4 pb-6">
            <Routes>
              {getRoutes(routes)}
              <Route
                path="/"
                element={<Navigate to="/admin/analytics" replace />}
              />
            </Routes>
          </div>
          <div className="mt-auto p-3">
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}