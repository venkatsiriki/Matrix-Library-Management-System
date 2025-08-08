import React, { useState, useEffect, useMemo } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { FiUser, FiSearch, FiClock, FiFileText, FiShield, FiEdit, FiDatabase, FiPieChart, FiChevronDown } from 'react-icons/fi';
import { useTheme } from '../../../contexts/ThemeContext';
import howItWorksBackground from '../../../assets/img/landing/how-it-works-bg.jpg';
import styled from 'styled-components';

// Memoize the styled component to prevent recreation on theme change
const NeoToggle = React.memo(styled.div`
  .neo-toggle-container {
    --toggle-width: 60px;
    --toggle-height: 30px;
    --toggle-bg: ${props => props.isDarkMode ? '#181c20' : '#f3f4f6'};
    --toggle-off-color: #6366f1;
    --toggle-on-color: #10b981;
    --toggle-transition: 0.4s cubic-bezier(0.25, 1, 0.5, 1);
    position: relative;
    display: inline-flex;
    flex-direction: column;
    user-select: none;
    will-change: transform;
  }

  .neo-toggle-input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .neo-toggle {
    position: relative;
    width: var(--toggle-width);
    height: var(--toggle-height);
    display: block;
    cursor: pointer;
    transform: translateZ(0);
    perspective: 500px;
  }

  .neo-track {
    position: absolute;
    inset: 0;
    border-radius: calc(var(--toggle-height) / 2);
    overflow: hidden;
    transform-style: preserve-3d;
    transform: translateZ(-1px);
    transition: transform var(--toggle-transition);
    box-shadow: ${props => props.isDarkMode 
      ? '0 2px 10px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.1)'
      : '0 4px 12px rgba(99, 102, 241, 0.2), inset 0 0 0 1px rgba(99, 102, 241, 0.1)'};
  }

  .neo-background-layer {
    position: absolute;
    inset: 0;
    background: var(--toggle-bg);
    background-image: linear-gradient(
      -45deg,
      ${props => props.isDarkMode 
        ? 'rgba(20, 20, 20, 0.8), rgba(30, 30, 30, 0.3), rgba(20, 20, 20, 0.8)'
        : 'rgba(255, 255, 255, 1), rgba(243, 244, 246, 0.8), rgba(255, 255, 255, 1)'};
    );
    opacity: 1;
    transition: all var(--toggle-transition);
  }

  .neo-grid-layer {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(
        to right,
        rgba(99, 102, 241, 0.03) 1px,
        transparent 1px
      ),
      linear-gradient(to bottom, rgba(99, 102, 241, 0.03) 1px, transparent 1px);
    background-size: 4px 4px;
    opacity: ${props => props.isDarkMode ? 0 : 0.5};
    transition: opacity var(--toggle-transition);
  }

  .neo-thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    transform-style: preserve-3d;
    transition: transform var(--toggle-transition);
    z-index: 1;
  }

  .neo-thumb-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 1px solid rgba(99, 102, 241, 0.2);
    background: var(--toggle-off-color);
    box-shadow: ${props => props.isDarkMode
      ? '0 2px 8px rgba(99, 102, 241, 0.2)'
      : '0 4px 12px rgba(99, 102, 241, 0.3), 0 2px 4px rgba(99, 102, 241, 0.2)'};
    transition: all var(--toggle-transition);
  }

  .neo-status {
    position: absolute;
    bottom: -20px;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .neo-status-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .neo-status-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: var(--toggle-off-color);
    transition: all var(--toggle-transition);
  }

  .neo-status-text {
    font-size: 10px;
    font-weight: 600;
    color: ${props => props.isDarkMode ? 'var(--toggle-off-color)' : '#4f46e5'};
    letter-spacing: 1px;
    transition: all var(--toggle-transition);
    text-transform: uppercase;
  }

  /* ON state */
  .neo-toggle-input:checked + .neo-toggle .neo-thumb {
    transform: translateX(calc(var(--toggle-width) - 30px));
  }

  .neo-toggle-input:checked + .neo-toggle .neo-thumb-ring {
    background-color: var(--toggle-on-color);
    border-color: rgba(16, 185, 129, 0.2);
    box-shadow: 0 0 12px rgba(16, 185, 129, 0.3);
  }

  .neo-toggle-input:checked + .neo-toggle .neo-status-dot {
    background-color: var(--toggle-on-color);
    box-shadow: 0 0 8px var(--toggle-on-color);
  }

  .neo-toggle-input:checked + .neo-toggle .neo-status-text {
    color: ${props => props.isDarkMode ? 'var(--toggle-on-color)' : '#059669'};
  }

  /* Status text change */
  .neo-toggle-input:checked + .neo-toggle .neo-status-text::before {
    content: "ADMIN";
  }

  .neo-toggle-input:not(:checked) + .neo-toggle .neo-status-text::before {
    content: "STUDENT";
  }

  /* Hover effects */
  .neo-toggle:hover .neo-thumb-ring {
    transform: scale(1.05);
  }

  /* Not checked (Student) state hover effect */
  .neo-toggle-input:not(:checked) + .neo-toggle:hover .neo-thumb-ring {
    box-shadow: ${props => props.isDarkMode
      ? '0 0 12px rgba(99, 102, 241, 0.3)'
      : '0 6px 16px rgba(99, 102, 241, 0.4), 0 2px 4px rgba(99, 102, 241, 0.2)'};
  }

  /* Checked (Admin) state hover effect */
  .neo-toggle-input:checked + .neo-toggle:hover .neo-thumb-ring {
    box-shadow: ${props => props.isDarkMode
      ? '0 0 15px rgba(16, 185, 129, 0.4)'
      : '0 6px 16px rgba(16, 185, 129, 0.4), 0 2px 4px rgba(16, 185, 129, 0.2)'};
  }
`);

// Memoize the steps data
const steps = {
  student: [
    {
      title: 'Log in with Student ID',
      description: 'Access your personalized dashboard with your unique student credentials.',
      icon: FiUser,
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      title: 'Search or Reserve Books',
      description: 'Browse our extensive collection and reserve books for pickup.',
      icon: FiSearch,
      gradient: 'from-green-500 to-teal-500'
    },
    {
      title: 'Use ID Scanner to Track Entry & Exit',
      description: 'Seamlessly track your library visits with our automated system.',
      icon: FiClock,
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      title: 'View Borrowed History and Fines',
      description: 'Keep track of your borrowing history and manage any outstanding fines.',
      icon: FiFileText,
      gradient: 'from-red-500 to-pink-500'
    }
  ],
  admin: [
    {
      title: 'Log in with Admin Credentials',
      description: 'Access the powerful admin dashboard with secure authentication.',
      icon: FiShield,
      gradient: 'from-purple-500 to-violet-500'
    },
    {
      title: 'Add/Edit Book Information',
      description: 'Manage the library catalog with easy-to-use book management tools.',
      icon: FiEdit,
      gradient: 'from-pink-500 to-red-500'
    },
    {
      title: 'Manage Racks, Departments, Digital Resources',
      description: 'Organize library resources efficiently across different sections.',
      icon: FiDatabase,
      gradient: 'from-indigo-500 to-blue-500'
    },
    {
      title: 'View Student Analytics and Reports',
      description: 'Generate insights with comprehensive usage analytics and reports.',
      icon: FiPieChart,
      gradient: 'from-green-500 to-teal-500'
    }
  ]
};

// Memoize StepCard component
const StepCard = React.memo(({ step, index, isDarkMode, isInView }) => {
  const animationProps = useMemo(() => ({
    initial: { opacity: 0, y: 50 },
    animate: isInView ? {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: index * 0.2,
        ease: [0.215, 0.610, 0.355, 1.000]
      }
    } : { opacity: 0, y: 50 }
  }), [isInView, index]);

  return (
    <motion.div
      {...animationProps}
      className="relative group"
    >
      <div className="flex flex-col items-center text-center">
        {/* Step Number and Icon Circle */}
        <motion.div 
          className="relative mb-6"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300, damping: 10 }}
        >
          {/* Circle with Icon */}
          <div className="relative">
            <motion.div 
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors
                ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-primary/5 hover:bg-primary/10'}`}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              {React.createElement(step.icon, { 
                className: `w-8 h-8 ${isDarkMode ? 'text-white' : 'text-primary'}`
              })}
            </motion.div>
            
            {/* Step Number */}
            <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br ${step.gradient}
              text-white text-sm font-medium flex items-center justify-center shadow-lg`}
            >
              {index + 1}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div 
          className="max-w-[250px] mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { 
            opacity: 1, 
            y: 0,
            transition: { 
              duration: 0.6, 
              delay: index * 0.4 + 0.3,
              ease: "easeOut"
            }
          } : { opacity: 0, y: 20 }}
        >
          <h3 className={`text-lg font-semibold mb-3 transition-colors ${
            isDarkMode ? 'text-purple-400' : 'text-gray-900'
          }`}>
            {step.title}
          </h3>
          <p className={`text-sm leading-relaxed ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {step.description}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
});

const HowItWorks = ({ onLoad }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const { isDarkMode } = useTheme();
  const containerRef = React.useRef(null);
  const [isInView, setIsInView] = useState(false);
  
  // Memoize scroll progress values
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const headerY = useTransform(scrollYProgress, [0, 0.2], [50, 0]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [0.95, 1]);

  // Memoize current steps
  const currentSteps = useMemo(() => isAdmin ? steps.admin : steps.student, [isAdmin]);
  
  // Call onLoad when component mounts
  React.useEffect(() => {
    onLoad?.();
  }, [onLoad]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '-5% 0px'
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  // Memoize background styles
  const backgroundStyles = useMemo(() => ({
    overlay: isDarkMode 
      ? 'bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-900/90'
      : 'bg-gradient-to-b from-white/60 via-white/70 to-white/60',
    imageOpacity: isDarkMode ? 'opacity-50' : 'opacity-75'
  }), [isDarkMode]);

  return (
    <section 
      id="how-it-works-section"
      ref={containerRef}
      className={`relative min-h-screen flex items-center py-36 md:py-48 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-white to-gray-50'
      }`}
    >
      {/* Background Image with Theme-based Overlay */}
      <div className="absolute inset-0">
        <img 
          src={howItWorksBackground} 
          alt="background" 
          className={`w-full h-full object-cover object-center transition-opacity duration-300 ${backgroundStyles.imageOpacity}`}
          loading="lazy"
          decoding="async"
        />
        <div className={`absolute inset-0 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-900/90' 
            : 'bg-gradient-to-b from-white/60 via-white/70 to-white/60'
        }`} />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div 
            className="grid md:grid-cols-[1fr,auto] gap-8 items-start mb-16"
            style={{ y: headerY, opacity: headerOpacity, scale }}
          >
            <motion.div className="relative">
              {/* Decorative elements */}
              <motion.div 
                className={`absolute -left-4 -top-4 w-20 h-20 rounded-full blur-xl ${
                  isDarkMode ? 'bg-white/5' : 'bg-primary/5'
                }`}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div 
                className={`absolute -right-4 -bottom-4 w-32 h-32 rounded-full blur-xl ${
                  isDarkMode ? 'bg-white/5' : 'bg-primary/5'
                }`}
                animate={{
                  scale: [1.2, 1, 1.2],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ duration: 4, repeat: Infinity, delay: 2, ease: "easeInOut" }}
              />

              <motion.span
                className={`inline-block px-4 py-1 mb-4 text-sm font-medium rounded-full ${
                  isDarkMode 
                    ? 'text-purple-400 bg-purple-400/10' 
                    : 'text-primary bg-primary/10'
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                How It Works
              </motion.span>
              <motion.h2 
                className={`text-4xl md:text-5xl font-bold mb-4 tracking-tight`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>How </span>
                <span className={`bg-clip-text text-transparent bg-gradient-to-r font-['Audiowide'] ${
                  isDarkMode ? 'from-purple-400 to-purple-500' : 'from-primary to-primary/80'
                }`}>MATRIX</span>
                <span className={isDarkMode ? 'text-white' : 'text-gray-900'}> works?</span>
              </motion.h2>
              <motion.p 
                className={`text-lg max-w-2xl leading-relaxed ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                Experience our streamlined library management system designed for both students and administrators.
              </motion.p>
            </motion.div>

            {/* New Toggle Switch */}
            <NeoToggle isDarkMode={isDarkMode}>
              <div className="neo-toggle-container">
                <input 
                  className="neo-toggle-input" 
                  id="neo-toggle" 
                  type="checkbox"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                />
                <label className="neo-toggle" htmlFor="neo-toggle">
                  <div className="neo-track">
                    <div className="neo-background-layer"></div>
                    <div className="neo-grid-layer"></div>
                  </div>

                  <div className="neo-thumb">
                    <div className="neo-thumb-ring"></div>
                  </div>

                  <div className="neo-status">
                    <div className="neo-status-indicator">
                      <div className="neo-status-dot"></div>
                      <div className="neo-status-text"></div>
                    </div>
                  </div>
                </label>
              </div>
            </NeoToggle>
          </motion.div>

          {/* Steps Grid */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={isAdmin ? 'admin' : 'student'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 px-4 sm:px-6"
            >
              {currentSteps.map((step, index) => (
                <StepCard 
                  key={step.title} 
                  step={step} 
                  index={index} 
                  isDarkMode={isDarkMode}
                  isInView={isInView}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Explore More Section */}
          <motion.div 
            className="mt-24 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { 
              opacity: 1, 
              y: 0,
              transition: { 
                duration: 0.6,
                delay: 0.8,
                ease: "easeOut"
              }
            } : {}}
          >
            <p className={`text-lg md:text-xl font-medium mb-6 ${
              isDarkMode ? 'text-purple-400' : 'text-gray-800'
            }`}>
              That's not all you can do!
              <br />
              <span className={`text-base ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Explore more features below
              </span>
            </p>
            
            <motion.div
              animate={{
                y: [0, 8, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="inline-block"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isDarkMode 
                  ? 'bg-white/5 hover:bg-white/10' 
                  : 'bg-primary/5 hover:bg-primary/10'
              } transition-colors cursor-pointer`}
                onClick={() => {
                  const nextSection = containerRef.current?.nextElementSibling;
                  nextSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <FiChevronDown className={`w-6 h-6 ${
                  isDarkMode ? 'text-white' : 'text-primary'
                }`} />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(HowItWorks);