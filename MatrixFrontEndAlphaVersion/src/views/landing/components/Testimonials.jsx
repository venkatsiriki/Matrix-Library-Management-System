import React from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { FiStar, FiUser } from 'react-icons/fi';
import { useTheme } from '../../../contexts/ThemeContext';
import testimonialsBackground from '../../../assets/img/landing/testimonials-bg.jpg';

const QuoteIcon = ({ className }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    fill="currentColor"
  >
    <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.57-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z"/>
  </svg>
);

const testimonials = [
  {
    quote: "Matrix LMS has completely transformed how we manage our library resources. The analytics dashboard is particularly helpful for making data-driven decisions.",
    name: "Dr. Sarah Johnson",
    role: "Head Librarian",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    rating: 5,
    gradient: "from-purple-500 to-indigo-500"
  },
  {
    quote: "As a student, I love how easy it is to find and reserve books. The digital library section has been a game-changer for my research work.",
    name: "Alex Chen",
    role: "Computer Science Student",
    image: "https://randomuser.me/api/portraits/men/1.jpg",
    rating: 5,
    gradient: "from-primary to-primary-dark"
  },
  {
    quote: "The automated ID scanning and fine management system has made our administrative tasks much more efficient. Highly recommended!",
    name: "Maria Rodriguez",
    role: "Library Administrator",
    image: "https://randomuser.me/api/portraits/women/2.jpg",
    rating: 5,
    gradient: "from-emerald-500 to-teal-500"
  }
];

const TestimonialCard = ({ testimonial, index, isDarkMode }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, delay: index * 0.2 }
      } : {
        opacity: 0,
        y: 20
      }}
      className="relative group h-full"
    >
      <div className={`relative rounded-2xl p-6 h-full flex flex-col ${
        isDarkMode 
          ? 'bg-white/5 backdrop-blur-sm border border-white/10' 
          : 'bg-white border border-gray-100'
      }`}>
        {/* Decorative gradient blob */}
        <motion.div 
          className={`absolute -left-4 -top-4 w-32 h-32 rounded-full blur-2xl opacity-25 bg-gradient-to-br ${testimonial.gradient}`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        {/* Opening Quote */}
        <div className={`relative mb-4 ${
          isDarkMode ? 'text-white/20' : 'text-primary/20'
        }`}>
          <QuoteIcon className="w-8 h-8" />
        </div>

        {/* Quote */}
        <blockquote className={`relative mb-6 text-base flex-grow ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {testimonial.quote}
        </blockquote>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-6">
          {[...Array(testimonial.rating)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={isInView ? {
                opacity: 1,
                scale: 1,
                transition: { delay: index * 0.1 + i * 0.1 }
              } : {}}
            >
              <FiStar className={`w-4 h-4 ${
                isDarkMode ? 'text-yellow-300' : 'text-yellow-400'
              } fill-current`} />
            </motion.div>
          ))}
        </div>

        {/* Author */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${testimonial.gradient} blur-sm opacity-50`} />
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              {testimonial.image ? (
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-white/20 transition-transform duration-200 hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${testimonial.gradient}`}>
                  <FiUser className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              )}
            </motion.div>
          </div>
          <div>
            <h4 className={`text-sm font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {testimonial.name}
            </h4>
            <p className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {testimonial.role}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Testimonials = ({ onLoad }) => {
  const { isDarkMode } = useTheme();
  const containerRef = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const headerY = useTransform(scrollYProgress, [0, 0.2], [50, 0]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  // Call onLoad when component mounts
  React.useEffect(() => {
    onLoad?.();
  }, [onLoad]);

  return (
    <section 
      id="testimonials-section"
      ref={containerRef}
      className={`relative min-h-screen flex items-center py-36 md:py-48 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-white to-gray-50'
      }`}
    >
      {/* Background Image with Theme-based Overlay */}
      <div className="absolute inset-0">
        <img 
          src={testimonialsBackground} 
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

      <div className="container relative mx-auto px-4">
        <motion.div 
          style={{ y: headerY, opacity: headerOpacity }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`inline-block px-4 py-1.5 mb-6 text-sm font-medium rounded-full ${
              isDarkMode 
                ? 'text-white/90 bg-white/10' 
                : 'text-primary/90 bg-primary/10'
            }`}
          >
            Testimonials
          </motion.span>

          <h2 className={`text-4xl lg:text-5xl font-bold mb-8`}>
            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>What Our </span>
            <span className={isDarkMode ? 'text-purple-400' : 'text-primary'}>Users</span>
            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}> Say</span>
          </h2>

          <p className={`text-lg max-w-2xl mx-auto ${
            isDarkMode ? 'text-gray-300/90' : 'text-gray-600/90'
          }`}>
            Discover how Matrix LMS is transforming library management for institutions worldwide
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.name}
              testimonial={testimonial}
              index={index}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 