import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiGithub, FiTwitter, FiLinkedin, FiInstagram } from 'react-icons/fi';
import { useTheme } from '../../../contexts/ThemeContext';

const socialLinks = [
  { icon: FiGithub, href: 'https://github.com', label: 'GitHub' },
  { icon: FiTwitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: FiLinkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: FiInstagram, href: 'https://instagram.com', label: 'Instagram' }
];

const quickLinks = [
  { path: '#hero', label: 'Home', sectionId: 'hero-section' },
  { path: '#how-it-works', label: 'How It Works', sectionId: 'how-it-works-section' },
  { path: '#features', label: 'Features', sectionId: 'features-section' },
  { path: '#digital-library', label: 'Digital Library', sectionId: 'digital-library-section' },
  { path: '#racks', label: 'Find Books', sectionId: 'racks-section' },
  { path: '#testimonials', label: 'Testimonials', sectionId: 'testimonials-section' },
  { path: '#faq', label: 'FAQ & Contact', sectionId: 'faq-section' }
];

const resources = [
  { path: '#features', label: 'Library Features', sectionId: 'features-section' },
  { path: '#digital-library', label: 'Digital Resources', sectionId: 'digital-library-section' },
  { path: '#racks', label: 'Book Finder', sectionId: 'racks-section' },
  { path: '#faq', label: 'Help Center', sectionId: 'faq-section' }
];

const policyContent = {
  privacy: {
    title: "Privacy Policy",
    content: (
      <div>
        <p><strong>Information We Collect:</strong> Matrix - Library Management System ("Matrix LMS") collects information including, but not limited to, student names, student IDs, borrowing history, digital library access logs, fines, and form submissions. This data is collected solely for the operation and improvement of our library services.</p>
        <p className="mt-2"><strong>How We Use Your Information:</strong> The information we collect is used to personalize your library experience, manage book borrowing and returns, administer fines, and enhance the features of our digital library. We may also use aggregated, anonymized data for system analytics and improvements.</p>
        <p className="mt-2"><strong>Data Security:</strong> Matrix LMS employs industry-standard security measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction. Your data is stored securely and is not shared with third parties except as required by law.</p>
        <p className="mt-2"><strong>Your Rights:</strong> You have the right to access, correct, or request deletion of your personal data held by Matrix LMS. To exercise these rights, please contact the library administration at the email address below.</p>
        <p className="mt-2"><strong>Contact Us:</strong> For any privacy-related inquiries or concerns, please contact us at <a href="mailto:matrix@support.com" className="text-blue-600 underline">matrix@support.com</a>.</p>
        <p className="mt-2 text-xs text-gray-500">This Privacy Policy may be updated periodically. Please review it regularly for any changes.</p>
      </div>
    ),
  },
  terms: {
    title: "Terms of Service",
    content: (
      <div>
        <p><strong>Acceptance of Terms:</strong> By accessing and using Matrix LMS, you agree to comply with these Terms of Service and all applicable library policies and regulations.</p>
        <p className="mt-2"><strong>User Responsibilities:</strong></p>
        <ul className="list-disc ml-6">
          <li>Students must present a valid student ID to access system features and borrow materials.</li>
          <li>All borrowed books and resources must be returned by the due date specified at checkout.</li>
          <li>Overdue items will incur fines, which must be settled before further borrowing privileges are granted.</li>
        </ul>
        <p className="mt-2"><strong>System Usage:</strong></p>
        <ul className="list-disc ml-6">
          <li>Users are prohibited from misusing digital resources, including unauthorized sharing or distribution of materials.</li>
          <li>Repeated violations of library policies may result in suspension or termination of system access.</li>
        </ul>
        <p className="mt-2"><strong>Limitations of Liability:</strong> Matrix LMS is not responsible for the content or availability of third-party PDF links or external resources accessed through the system. The system and its content are provided "as is" without warranties of any kind.</p>
        <p className="mt-2"><strong>Modifications:</strong> Matrix LMS reserves the right to update or modify these Terms of Service at any time. Continued use of the system constitutes acceptance of any changes.</p>
        <p className="mt-2 text-xs text-gray-500">For questions regarding these terms, please contact the library administration.</p>
      </div>
    ),
  },
  cookie: {
    title: "Cookie Policy",
    content: (
      <div>
        <p><strong>Use of Cookies:</strong> Matrix LMS uses cookies to enhance your browsing experience and ensure the security of your session. Cookies are small text files stored on your device when you access our system.</p>
        <p className="mt-2"><strong>Types of Cookies We Use:</strong></p>
        <ul className="list-disc ml-6">
          <li><strong>Session Cookies:</strong> These cookies maintain your login session and expire when you log out or close your browser.</li>
          <li><strong>Preference Cookies:</strong> These cookies remember your user interface preferences, such as dark mode settings.</li>
        </ul>
        <p className="mt-2"><strong>Data Stored in Cookies:</strong> No sensitive personal information is stored in cookies. Cookies are used strictly for authentication and user experience purposes.</p>
        <p className="mt-2"><strong>Managing Cookies:</strong> You may disable cookies in your browser settings; however, this may affect the functionality and security of Matrix LMS.</p>
        <p className="mt-2 text-xs text-gray-500">This Cookie Policy may be updated periodically. Please review it regularly for any changes.</p>
      </div>
    ),
  },
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity duration-300 p-4">
      <div className="relative w-full max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl bg-white rounded-lg shadow-lg animate-fadeInUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-2 sm:top-4 right-2 sm:right-4 text-gray-400 hover:text-gray-700 text-xl sm:text-2xl font-bold focus:outline-none"
        >
          &times;
        </button>
        {/* Title */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">{title}</h2>
        </div>
        {/* Content */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 max-h-[50vh] sm:max-h-[60vh] md:max-h-[70vh] overflow-y-auto text-gray-700 text-sm sm:text-base leading-relaxed">
          {children}
        </div>
      </div>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.3s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </div>
  );
};

const Footer = ({ onLoad }) => {
  const { isDarkMode } = useTheme();
  const [openModal, setOpenModal] = useState(null);

  // Handle smooth scrolling
  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Call onLoad when component mounts
  React.useEffect(() => {
    onLoad?.();
  }, [onLoad]);

  return (
    <footer className={`relative ${
      isDarkMode ? 'bg-gray-900 border-t border-white/10' : 'bg-gray-900'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* About Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="col-span-1 sm:col-span-2"
          >
            <h3 className="text-xl sm:text-2xl font-normal text-white mb-3 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-primary/80 font-['Audiowide']">
              MATRIX
            </h3>
            <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 max-w-md">
              Modern library management system designed to streamline operations and enhance the learning experience through digital innovation and smart organization.
            </p>
            <div className="flex gap-3 sm:gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <social.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6">Quick Links</h3>
            <ul className="space-y-2 sm:space-y-3">
              {quickLinks.map((link) => (
                <motion.li
                  key={link.path}
                  whileHover={{ x: 5 }}
                >
                  <a 
                    href={link.path}
                    onClick={(e) => handleNavClick(e, link.sectionId)}
                    className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6">Resources</h3>
            <ul className="space-y-2 sm:space-y-3">
              {resources.map((link) => (
                <motion.li
                  key={link.path}
                  whileHover={{ x: 5 }}
                >
                  <a 
                    href={link.path}
                    onClick={(e) => handleNavClick(e, link.sectionId)}
                    className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <p className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
            © {new Date().getFullYear()} <span className="font-['Audiowide']">MATRIX</span> LMS. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4 sm:gap-6 justify-center sm:justify-end">
            <button
              className="text-xs sm:text-sm text-gray-400 hover:underline hover:text-white transition-colors focus:outline-none"
              onClick={() => setOpenModal('privacy')}
            >
              Privacy Policy
            </button>
            <button
              className="text-xs sm:text-sm text-gray-400 hover:underline hover:text-white transition-colors focus:outline-none"
              onClick={() => setOpenModal('terms')}
            >
              Terms of Service
            </button>
            <button
              className="text-xs sm:text-sm text-gray-400 hover:underline hover:text-white transition-colors focus:outline-none"
              onClick={() => setOpenModal('cookie')}
            >
              Cookie Policy
            </button>
          </div>
          <Modal
            isOpen={!!openModal}
            onClose={() => setOpenModal(null)}
            title={openModal ? policyContent[openModal].title : ''}
          >
            {openModal ? policyContent[openModal].content : null}
          </Modal>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer; 