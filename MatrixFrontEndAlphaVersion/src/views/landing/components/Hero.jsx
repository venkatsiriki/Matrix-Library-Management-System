import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { useTheme } from '../../../contexts/ThemeContext';
import heroBackground from '../../../assets/img/landing/hero-bg.jpg';
import heroRight from '../../../assets/img/landing/hero-right.jpg';
import AnimatedButton from '../../../components/AnimatedButton';
import './MatrixLoader.css';

// Shared SVG Gradients Component
const SharedGradients = () => (
  <svg height="0" width="0" viewBox="0 0 64 64" className="absolute">
    <defs>
      <linearGradient gradientUnits="userSpaceOnUse" y2="2" x2="0" y1="62" x1="0" id="matrix-gradient-1">
        <stop stopColor="#4318FF" />
        <stop stopColor="#9F7AEA" offset="1" />
      </linearGradient>
      <linearGradient gradientUnits="userSpaceOnUse" y2="0" x2="0" y1="64" x1="0" id="matrix-gradient-2">
        <stop stopColor="#4318FF" />
        <stop stopColor="#868CFF" offset="1" />
        <animateTransform
          repeatCount="indefinite"
          keySplines=".42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1"
          keyTimes="0; 0.25; 0.5; 0.75; 1"
          dur="8s"
          values="0 32 32;-270 32 32;-540 32 32;-810 32 32;-1080 32 32"
          type="rotate"
          attributeName="gradientTransform"
        />
      </linearGradient>
      <linearGradient gradientUnits="userSpaceOnUse" y2="2" x2="0" y1="62" x1="0" id="matrix-gradient-3">
        <stop stopColor="#4318FF" />
        <stop stopColor="#4318FF" offset="1" />
      </linearGradient>
    </defs>
  </svg>
);

const MinimalLoader = () => (
  <div className="loader mb-8">
    <SharedGradients />
    {/* M */}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="40" width="40" className="inline-block">
      <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="6" stroke="url(#matrix-gradient-1)" d="M12 44V20L24 35L36 20V44" className="dash" />
    </svg>
    {/* I */}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="40" width="40" className="inline-block">
      <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="6" stroke="url(#matrix-gradient-2)" d="M32 20V44" className="dash" />
    </svg>
    {/* N */}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="40" width="40" className="inline-block">
      <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="6" stroke="url(#matrix-gradient-1)" d="M12 44V20M12 20L36 44M36 44V20" className="dash" />
    </svg>
    {/* I */}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="40" width="40" className="inline-block">
      <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="6" stroke="url(#matrix-gradient-2)" d="M32 20V44" className="dash" />
    </svg>
    {/* M */}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="40" width="40" className="inline-block">
      <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="6" stroke="url(#matrix-gradient-1)" d="M12 44V20L24 35L36 20V44" className="dash" />
    </svg>
    {/* A */}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="40" width="40" className="inline-block">
      <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="6" stroke="url(#matrix-gradient-3)" d="M16 44L32 20L48 44M22 36H42" className="dash" />
    </svg>
    {/* L */}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="40" width="40" className="inline-block">
      <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="6" stroke="url(#matrix-gradient-2)" d="M20 20V44H44" className="dash" />
    </svg>
  </div>
);

const ModularLoader = () => (
  <div className="loader mb-8">
    <SharedGradients />
    {/* M */}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="40" width="40" className="inline-block">
      <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="6" stroke="url(#matrix-gradient-1)" d="M12 44V20L24 35L36 20V44" className="dash" />
    </svg>
    {/* O */}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="40" width="40" className="inline-block">
      <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="6" stroke="url(#matrix-gradient-2)" d="M32 20C38 20 44 26 44 32C44 38 38 44 32 44C26 44 20 38 20 32C20 26 26 20 32 20" className="dash" />
    </svg>
    {/* D */}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="40" width="40" className="inline-block">
      <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="6" stroke="url(#matrix-gradient-1)" d="M20 20V44M20 20H32C40 20 44 26 44 32C44 38 40 44 32 44H20" className="dash" />
    </svg>
    {/* U */}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="40" width="40" className="inline-block">
      <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="6" stroke="url(#matrix-gradient-2)" d="M20 20V36C20 40 24 44 32 44C40 44 44 40 44 36V20" className="dash" />
    </svg>
    {/* L */}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="40" width="40" className="inline-block">
      <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="6" stroke="url(#matrix-gradient-1)" d="M20 20V44H44" className="dash" />
    </svg>
    {/* A */}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="40" width="40" className="inline-block">
      <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="6" stroke="url(#matrix-gradient-2)" d="M16 44L32 20L48 44M22 36H42" className="dash" />
    </svg>
    {/* R */}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="40" width="40" className="inline-block">
      <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="6" stroke="url(#matrix-gradient-3)" d="M16 44V20H36C42 20 42 28 36 28H16M36 28L44 44" className="dash" />
    </svg>
  </div>
);

const MatrixLoader = () => (
  <div className="loader mb-8">
    <SharedGradients />
    {/* M */}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="40" width="40" className="inline-block">
      <path
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeWidth="6"
        stroke="url(#matrix-gradient-1)"
        d="M12 44V20L24 35L36 20V44"
        className="dash"
        pathLength="360"
      />
    </svg>
    {/* A */}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="40" width="40" className="inline-block">
      <path
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeWidth="6"
        stroke="url(#matrix-gradient-2)"
        d="M16 44L32 20L48 44M22 36H42"
        className="dash"
        pathLength="360"
      />
    </svg>
    {/* T */}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="40" width="40" className="inline-block">
      <path
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeWidth="6"
        stroke="url(#matrix-gradient-1)"
        d="M20 20H44M32 20V44"
        className="dash"
        pathLength="360"
      />
    </svg>
    {/* R */}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="40" width="40" className="inline-block">
      <path
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeWidth="6"
        stroke="url(#matrix-gradient-2)"
        d="M16 44V20H36C42 20 42 28 36 28H16M36 28L44 44"
        className="dash"
        pathLength="360"
      />
    </svg>
    {/* I */}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="40" width="40" className="inline-block">
      <path
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeWidth="6"
        stroke="url(#matrix-gradient-1)"
        d="M32 20V44"
        className="dash"
        pathLength="360"
      />
    </svg>
    {/* X */}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="40" width="40" className="inline-block">
      <path
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeWidth="6"
        stroke="url(#matrix-gradient-3)"
        d="M16 20L48 44M48 20L16 44"
        className="dash"
        pathLength="360"
      />
    </svg>
  </div>
);

const SequenceLoader = () => {
  const [currentLoader, setCurrentLoader] = useState(0);
  const [key, setKey] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLoader((prev) => (prev + 1) % 3);
      setKey(k => k + 1); // Force re-render of animation
    }, 6000); // Increased to 6 seconds to match the fadeInOut animation duration
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div key={key}>
      {currentLoader === 0 && <MinimalLoader />}
      {currentLoader === 1 && <ModularLoader />}
      {currentLoader === 2 && <MatrixLoader />}
    </div>
  );
};

const Hero = ({ onLoad }) => {
  const { isDarkMode } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!isLoaded && typeof onLoad === 'function') {
      const handleLoad = () => {
        setIsLoaded(true);
        onLoad();
      };

      // Check if images are already loaded
      const heroBackgroundImg = new Image();
      const heroRightImg = new Image();
      let loadedCount = 0;

      const checkAllLoaded = () => {
        loadedCount++;
        if (loadedCount === 2) {
          handleLoad();
        }
      };

      heroBackgroundImg.onload = checkAllLoaded;
      heroRightImg.onload = checkAllLoaded;

      heroBackgroundImg.src = heroBackground;
      heroRightImg.src = heroRight;

      // If images are cached and load immediately
      if (heroBackgroundImg.complete) checkAllLoaded();
      if (heroRightImg.complete) checkAllLoaded();

      return () => {
        heroBackgroundImg.onload = null;
        heroRightImg.onload = null;
      };
    }
  }, [onLoad, isLoaded]);

  const handleGetStarted = () => {
    // Add your get started logic here
    console.log('Get Started clicked');
  };

  return (
    <section id="hero-section" className="relative min-h-screen flex items-center justify-center overflow-hidden py-16 sm:py-20 md:py-24 lg:py-36 xl:py-48">
      {/* Background Image with Theme-based Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroBackground} 
          alt="background" 
          className={`w-full h-full object-cover object-center transition-opacity duration-300 ${
            isDarkMode ? 'opacity-50' : 'opacity-75'
          }`}
          loading="eager"
          decoding="async"
        />
        <div className={`absolute inset-0 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-900/90' 
            : 'bg-gradient-to-b from-white/60 via-white/70 to-white/60'
        }`} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center max-w-7xl mx-auto">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center lg:items-start justify-center w-full lg:pl-4 order-2 lg:order-1"
          >
            <div className="w-full flex flex-col items-center lg:items-start max-w-xl">
              <div className="w-full flex justify-center lg:justify-start mb-4 sm:mb-6">
                <SequenceLoader />
              </div>
              <motion.h1 
                className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight text-center lg:text-left ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Modernize Your{' '}
                <span className={`bg-clip-text text-transparent bg-gradient-to-r ${
                  isDarkMode 
                    ? 'from-primary via-primary to-primary/80' 
                    : 'from-primary via-primary to-primary/80'
                }`}>
                  Library
                </span>
                <br />
                with <span className="font-['Audiowide']">MATRIX</span>
              </motion.h1>

              <motion.p
                className={`text-base sm:text-lg md:text-xl ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                } mb-6 sm:mb-8 text-center lg:text-left max-w-lg mx-auto lg:mx-0`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Track, manage, and discover resources all in one place.
                <br className="hidden sm:block" />
                The future of library management is here.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start w-full sm:w-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <div className="w-full sm:w-auto flex justify-center">
                  <AnimatedButton onClick={handleGetStarted} />
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Column - Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative w-full max-w-2xl mx-auto lg:ml-auto lg:pr-4 order-1 lg:order-2"
          >
            {/* Decorative elements */}
            <motion.div 
              className={`absolute -left-2 sm:-left-4 -top-2 sm:-top-4 w-48 h-48 sm:w-72 sm:h-72 rounded-full blur-3xl ${
                isDarkMode ? 'bg-primary/20' : 'bg-primary/10'
              } -z-10`}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div 
              className={`absolute -right-2 sm:-right-4 -bottom-2 sm:-bottom-4 w-48 h-48 sm:w-72 sm:h-72 rounded-full blur-3xl ${
                isDarkMode ? 'bg-primary/20' : 'bg-primary/10'
              } -z-10`}
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 4, repeat: Infinity, delay: 2 }}
            />

            {/* Main image */}
            <motion.div
              className={`relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl ${
                isDarkMode ? 'shadow-primary/20' : 'shadow-primary/10'
              } backdrop-blur-sm`}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={heroRight}
                alt="Modern Library Interior"
                className={`w-full h-[250px] xs:h-[300px] sm:h-[350px] md:h-[400px] lg:h-[500px] xl:h-[600px] object-cover object-center transition-all duration-300 ${
                  isDarkMode ? 'opacity-80' : 'opacity-100'
                }`}
                loading="eager"
                decoding="async"
              />
              <div className={`absolute inset-0 ${
                isDarkMode 
                  ? 'bg-gradient-to-tr from-gray-900/80 via-transparent to-transparent' 
                  : 'bg-gradient-to-tr from-white/50 via-transparent to-transparent'
              }`} />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 