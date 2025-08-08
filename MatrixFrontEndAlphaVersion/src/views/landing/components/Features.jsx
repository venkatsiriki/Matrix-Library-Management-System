import React from 'react';
import { motion, useScroll, useInView, useTransform } from 'framer-motion';
import { FaSearch, FaHistory, FaIdCard, FaChartBar } from 'react-icons/fa';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '../../../contexts/ThemeContext';
import featuresBackground from '../../../assets/img/landing/features-bg.jpg';

const features = [
  {
    icon: FaSearch,
    title: 'Smart Search & Reserve',
    description: 'Find and reserve books instantly with our AI-powered search system. Get personalized recommendations based on your interests and academic needs. Access our extensive collection with intelligent search capabilities.',
    gradient: 'from-blue-500 to-indigo-500'
  },
  {
    icon: FaHistory,
    title: 'Seamless Tracking',
    description: 'Keep track of your entire library journey with our comprehensive history and management system. Monitor your borrowing history, manage fines, and receive automated reminders.',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: FaIdCard,
    title: 'Smart Access Control',
    description: 'Modern entry/exit system with contactless student ID cards and automated tracking. Real-time occupancy monitoring and automated attendance management for enhanced security.',
    gradient: 'from-green-500 to-teal-500'
  },
  {
    icon: FaChartBar,
    title: 'Powerful Analytics',
    description: 'Make data-driven decisions with comprehensive analytics and reporting tools. Track usage patterns, optimize resource allocation, and generate detailed insights for better library management.',
    gradient: 'from-orange-500 to-red-500'
  }
];

const FeatureItem = ({ feature, isDarkMode }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.5 }
      } : {
        opacity: 0,
        y: 20
      }}
    >
      {/* Vertical Line with Scroll Progress */}
      <motion.div 
        className={`absolute left-4 sm:left-6 top-0 w-0.5 bg-gradient-to-b ${
          isDarkMode ? 'from-gray-700 to-transparent' : 'from-gray-200 to-transparent'
        } -z-10`}
        style={{
          height: '100%',
          scaleY: isInView ? 1 : 0,
          originY: 0,
        }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />

      <div className="flex gap-4 sm:gap-6 items-start group">
        {/* Icon Circle */}
        <motion.div
          className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 
            ${isInView ? `bg-gradient-to-br ${feature.gradient} shadow-lg shadow-${feature.gradient.split('-')[1]}/20` : 
            isDarkMode ? 'bg-gray-800 border-2 border-gray-700' : 'bg-white border-2 border-gray-200'}
            transition-all duration-500`}
          animate={isInView ? {
            scale: [0.8, 1],
            rotate: [45, 0],
          } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Background Animation */}
          {isInView && (
            <motion.div
              className="absolute inset-0 opacity-30"
              animate={{
                background: [
                  `linear-gradient(0deg, ${feature.gradient})`,
                  `linear-gradient(360deg, ${feature.gradient})`
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          )}
          
          {React.createElement(feature.icon, {
            className: `w-4 h-4 sm:w-5 sm:h-5 ${isInView ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-gray-600'} relative z-10`
          })}
        </motion.div>

        {/* Content */}
        <div className="flex-1 pt-1">
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? {
              opacity: 1,
              x: 0,
              transition: { duration: 0.5, delay: 0.2 }
            } : {}}
          >
            <motion.h3 
              className={`text-lg sm:text-xl font-semibold mb-2 ${
                isDarkMode ? 'text-purple-400' : 'text-gray-900'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? {
                opacity: 1,
                y: 0,
                transition: { duration: 0.5, delay: 0.3 }
              } : {}}
            >
              {feature.title}
            </motion.h3>
            <motion.p 
              className={`text-sm sm:text-base leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? {
                opacity: 1,
                y: 0,
                transition: { duration: 0.5, delay: 0.4 }
              } : {}}
            >
              {feature.description}
            </motion.p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const Features = ({ onLoad }) => {
  const { isDarkMode } = useTheme();
  const containerRef = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Call onLoad when component mounts
  React.useEffect(() => {
    onLoad?.();
  }, [onLoad]);

  return (
    <section 
      id="features-section" 
      className={`relative min-h-screen flex items-center py-16 sm:py-20 md:py-24 lg:py-36 xl:py-48 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-white to-gray-50'
      }`}
      ref={containerRef}
    >
      {/* Background Image with Theme-based Overlay */}
      <div className="absolute inset-0">
        <img 
          src={featuresBackground} 
          alt="background" 
          className={`w-full h-full object-cover object-center transition-opacity duration-300 ${
            isDarkMode ? 'opacity-30' : 'opacity-50'
          }`}
          loading="lazy"
          decoding="async"
        />
        <div className={`absolute inset-0 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-900/90' 
            : 'bg-gradient-to-b from-white/60 via-white/70 to-white/60'
        }`} />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr,1.5fr] gap-8 sm:gap-12 items-start max-w-7xl mx-auto">
          {/* Left Column */}
          <motion.div 
            className="relative lg:sticky lg:top-24"
            style={{
              opacity: useTransform(scrollYProgress, [0, 0.2], [0.5, 1]),
              scale: useTransform(scrollYProgress, [0, 0.2], [0.95, 1]),
            }}
          >
            {/* Background Decoration */}
            <motion.div 
              className={`absolute -left-2 sm:-left-4 -top-2 sm:-top-4 w-16 h-16 sm:w-20 sm:h-20 rounded-full blur-xl ${
                isDarkMode ? 'bg-white/5' : 'bg-primary/5'
              }`}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div 
              className={`absolute -right-2 sm:-right-4 -bottom-2 sm:-bottom-4 w-24 h-24 sm:w-32 sm:h-32 rounded-full blur-xl ${
                isDarkMode ? 'bg-white/5' : 'bg-primary/5'
              }`}
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 4, repeat: Infinity, delay: 2 }}
            />
            
            <div className="relative">
              <motion.span
                className={`inline-block font-medium mb-2 text-sm sm:text-base ${
                  isDarkMode ? 'text-purple-400' : 'text-primary'
                }`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                Modern Library Management
              </motion.span>
              <motion.h2 
                className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Powerful Features for</span>
                <br />
                <span className={`bg-clip-text text-transparent bg-gradient-to-r ${
                  isDarkMode ? 'from-purple-400 to-purple-500' : 'from-primary to-primary/80'
                }`}>
                  Modern Libraries
                </span>
              </motion.h2>
              <motion.p 
                className={`text-base sm:text-lg lg:text-xl ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                Experience the next generation of library management with our comprehensive suite of features designed for modern institutions.
              </motion.p>
            </div>
          </motion.div>

          {/* Right Column - Features List */}
          <div className="space-y-8 sm:space-y-12 mb-8 sm:mb-12 lg:mb-24">
            {features.map((feature, index) => (
              <FeatureItem key={index} feature={feature} isDarkMode={isDarkMode} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features; 