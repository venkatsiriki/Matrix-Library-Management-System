import React, { Suspense, lazy, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Loader from '../../components/Loader';

// Lazy load all components
const Header = lazy(() => import('./components/Header'));
const Hero = lazy(() => import('./components/Hero'));
const HowItWorks = lazy(() => import('./components/HowItWorks'));
const Features = lazy(() => import('./components/Features'));
const DigitalLibrary = lazy(() => import('./components/DigitalLibrary'));
const RackVisualization = lazy(() => import('./components/RackVisualization'));
const Testimonials = lazy(() => import('./components/Testimonials'));
const FAQ = lazy(() => import('./components/FAQ'));
const Footer = lazy(() => import('./components/Footer'));

const Landing = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [componentsLoaded, setComponentsLoaded] = useState(0);
  const totalComponents = 9; // Updated from 10 to 9 since we removed Contact

  const handleComponentLoad = useCallback(() => {
    setComponentsLoaded(prev => {
      const newCount = prev + 1;
      console.log(`Component loaded: ${newCount}/${totalComponents}`); // Add logging
      if (newCount === totalComponents) {
        // Add a longer minimum display time for the loader
        setTimeout(() => {
          console.log('All components loaded, hiding loader...'); // Add logging
          setIsLoading(false);
        }, 3500); // Increased from 500ms to 3.5s for better visibility
      }
      return newCount;
    });
  }, [totalComponents]);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && <Loader onLoadingComplete={() => {
          console.log('Loader animation complete'); // Add logging
          setIsLoading(false);
        }} />}
      </AnimatePresence>

      <Suspense fallback={null}>
        <div className="relative">
          <Header onLoad={handleComponentLoad} />
          <main>
            <Hero onLoad={handleComponentLoad} />
            <HowItWorks onLoad={handleComponentLoad} />
            <Features onLoad={handleComponentLoad} />
            <DigitalLibrary onLoad={handleComponentLoad} />
            <RackVisualization onLoad={handleComponentLoad} />
            <Testimonials onLoad={handleComponentLoad} />
            <FAQ onLoad={handleComponentLoad} />
          </main>
          <Footer onLoad={handleComponentLoad} />
        </div>
      </Suspense>
    </>
  );
};

export default Landing;
