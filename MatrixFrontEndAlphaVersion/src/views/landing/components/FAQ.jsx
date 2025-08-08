import React, { useState, Fragment } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Disclosure, Dialog, Transition } from '@headlessui/react';
import { FiChevronDown, FiMail, FiPhone, FiMapPin, FiX } from 'react-icons/fi';
import { useTheme } from '../../../contexts/ThemeContext';
import styled from 'styled-components';
import faqBackground from '../../../assets/img/landing/faq-bg.jpg';

const StyledButton = styled.button`
  font-family: inherit;
  font-size: 16px;
  background: ${props => props.isDarkMode ? '#818CF8' : '#4F46E5'};
  color: white;
  padding: 0.6em 1em;
  padding-left: 0.9em;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
  cursor: pointer;
  margin: 0 auto;
  position: relative;
  min-width: 160px;
  max-width: 180px;

  .svg-wrapper-1 {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    transition: all 0.3s ease-in-out;
  }

  .svg-wrapper {
    position: relative;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s ease-in-out;
  }

  span {
    display: block;
    margin-left: 0.3em;
    transition: all 0.3s ease-in-out;
    white-space: nowrap;
    position: relative;
    z-index: 1;
  }

  svg {
    position: absolute;
    display: block;
    transform-origin: center center;
    transition: transform 0.3s ease-in-out;
    width: 20px;
    height: 20px;
  }

  &:hover .svg-wrapper {
    animation: fly-1 0.6s ease-in-out infinite alternate;
  }

  &:hover svg {
    transform: translateX(40px) rotate(45deg) scale(1.1);
  }

  &:hover span {
    transform: translateX(100%);
    opacity: 0;
  }

  &:active {
    transform: scale(0.95);
  }

  @keyframes fly-1 {
    from {
      transform: translateY(0.1em);
    }

    to {
      transform: translateY(-0.1em);
    }
  }
`;

const FormInput = styled.div`
  position: relative;
  margin-bottom: 1rem;

  input, textarea {
    width: 100%;
    padding: 0.75rem;
    border-radius: 0.5rem;
    transition: all 0.3s ease;
    font-size: 0.9rem;
    border: 2px solid transparent;
    background: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'};
    color: ${props => props.isDarkMode ? '#fff' : '#1f2937'};
    outline: none;

    &:focus {
      border-color: ${props => props.isDarkMode ? '#818CF8' : '#4F46E5'};
      background: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'};
    }

    &::placeholder {
      color: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
      font-size: 0.9rem;
    }
  }

  textarea {
    min-height: 100px;
    resize: vertical;
  }

  label {
    display: block;
    margin-bottom: 0.25rem;
    font-size: 0.8rem;
    font-weight: 500;
    color: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'};
    transition: all 0.3s ease;
  }

  &:focus-within label {
    color: ${props => props.isDarkMode ? '#818CF8' : '#4F46E5'};
  }
`;

const ContactInfo = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  background: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'};
  margin-bottom: 0.5rem;

  &:hover {
    background: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'};
  }

  svg {
    width: 1rem;
    height: 1rem;
    margin-right: 0.75rem;
    color: ${props => props.isDarkMode ? '#818CF8' : '#4F46E5'};
  }

  span {
    font-size: 0.9rem;
  }
`;

const faqs = [
  {
    question: "How do I reserve a book?",
    answer: "You can reserve a book by logging into your student account, searching for the desired book in our catalog, and clicking the 'Reserve' button. You'll receive a notification when the book is ready for pickup."
  },
  {
    question: "What happens when I miss a return deadline?",
    answer: "Late returns incur a fine of ₹5 per day. You'll receive reminder notifications before and after the due date. Your borrowing privileges may be temporarily suspended until the fine is cleared."
  },
  {
    question: "Can I view my scan history?",
    answer: "Yes, your entry and exit scan history is available in your student dashboard under the 'Library Visits' section. This includes timestamps and duration of each visit."
  },
  {
    question: "How do admins add racks?",
    answer: "Administrators can add new racks through the Admin Dashboard → Rack Management section. You'll need to specify the library, department, and position details for proper organization."
  },
  {
    question: "How can I access the digital library?",
    answer: "The digital library is accessible through your student/admin dashboard. Simply navigate to the 'Digital Resources' section and browse through various categories of materials."
  },
  {
    question: "Is there a limit to how many books I can borrow?",
    answer: "Students can borrow up to 5 books simultaneously. Faculty members can borrow up to 10 books. Special permissions can be requested for additional books."
  },
  {
    question: "How can I get technical support?",
    answer: "For technical support, you can reach out to our support team at support@matrixlms.com. Our team is available during business hours to assist you with any issues."
  }
];

const ContactModal = ({ isOpen, onClose, isDarkMode }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Form submitted:', formData);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-[999] overflow-y-auto" onClose={onClose}>
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className={`inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform rounded-2xl ${
              isDarkMode 
                ? 'bg-gray-900 border border-white/10' 
                : 'bg-white'
            }`}>
              <div className="flex justify-between items-center mb-5">
                <div>
                  <Dialog.Title as="h3" className={`text-xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Get in Touch
                  </Dialog.Title>
                  <p className={`mt-1 text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    We'll get back to you within 24 hours
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className={`p-1.5 rounded-full transition-colors ${
                    isDarkMode 
                      ? 'hover:bg-white/10 text-white' 
                      : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput isDarkMode={isDarkMode}>
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    required
                    placeholder="Teja Reddy"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </FormInput>

                <FormInput isDarkMode={isDarkMode}>
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    required
                    placeholder="teja@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </FormInput>

                <FormInput isDarkMode={isDarkMode}>
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    required
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </FormInput>

                <div className="w-full flex justify-center pt-2">
                  <StyledButton 
                    type="submit" 
                    isDarkMode={isDarkMode}
                    disabled={isSubmitting}
                    style={{ opacity: isSubmitting ? 0.7 : 1 }}
                  >
                    <div className="svg-wrapper-1">
                      <div className="svg-wrapper">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={20} height={20}>
                          <path fill="none" d="M0 0h24v24H0z" />
                          <path fill="currentColor" d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z" />
                        </svg>
                      </div>
                    </div>
                    <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                  </StyledButton>
                </div>
              </form>

              <div className={`mt-5 pt-4 border-t ${
                isDarkMode ? 'border-white/10' : 'border-gray-200'
              }`}>
                <ContactInfo isDarkMode={isDarkMode}>
                  <FiMail />
                  <span>matrixlmsqueries@gmail.com</span>
                </ContactInfo>
                <ContactInfo isDarkMode={isDarkMode}>
                  <FiPhone />
                  <span>+91 7386678998</span>
                </ContactInfo>
                <ContactInfo isDarkMode={isDarkMode}>
                  <FiMapPin />
                  <span>Department of Computer Applications, Bill Gates Bhavan, Aditya University, IN</span>
                </ContactInfo>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

const FAQItem = ({ faq, index, isDarkMode }) => {
  const contentRef = React.useRef(null);
  const [contentHeight, setContentHeight] = React.useState(0);

  React.useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.offsetHeight);
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.4, delay: index * 0.1 }
      }}
      viewport={{ once: false, margin: "-100px" }}
      className="relative group"
    >
      <Disclosure>
        {({ open }) => (
          <motion.div 
            className={`relative overflow-hidden rounded-xl ${
              isDarkMode 
                ? 'bg-white/5 backdrop-blur-sm border border-white/10' 
                : 'bg-white border border-gray-100'
            } transition-all duration-300`}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            {/* Decorative gradient blob */}
            <motion.div 
              className={`absolute -left-4 -top-4 w-32 h-32 rounded-full blur-2xl opacity-20 bg-gradient-to-br ${
                isDarkMode ? 'from-purple-500 to-indigo-500' : 'from-primary to-primary-dark'
              }`}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            <Disclosure.Button className={`relative flex w-full items-center justify-between px-6 py-4 text-left ${
              open 
                ? isDarkMode ? 'bg-white/5' : 'bg-primary/5' 
                : ''
            }`}>
              <motion.span 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`text-lg font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                {faq.question}
              </motion.span>
              <motion.div
                animate={{ 
                  rotate: open ? 180 : 0,
                  y: open ? 0 : -2
                }}
                transition={{ 
                  duration: 0.3,
                  ease: "easeInOut"
                }}
                className={`p-1 rounded-full ${
                  open
                    ? isDarkMode 
                      ? 'bg-white/10' 
                      : 'bg-primary/10'
                    : ''
                }`}
              >
                <FiChevronDown className={`w-5 h-5 ${
                  isDarkMode ? 'text-white' : 'text-primary'
                }`} />
              </motion.div>
            </Disclosure.Button>

            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ 
                    height: "auto",
                    transition: {
                      height: { duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }
                    }
                  }}
                  exit={{ 
                    height: 0,
                    transition: {
                      height: { duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }
                    }
                  }}
                  className="overflow-hidden"
                >
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ 
                      opacity: 1,
                      y: 0,
                      transition: {
                        opacity: { duration: 0.2, delay: 0.1 },
                        y: { duration: 0.3, delay: 0.1, ease: "easeOut" }
                      }
                    }}
                    exit={{ 
                      opacity: 0,
                      y: 20,
                      transition: {
                        opacity: { duration: 0.2 },
                        y: { duration: 0.3, ease: "easeIn" }
                      }
                    }}
                  >
                    <Disclosure.Panel static className="relative px-6 py-4">
                      {/* Subtle gradient line */}
                      <motion.div 
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ 
                          scaleX: 1, 
                          opacity: 1,
                          transition: { duration: 0.3, delay: 0.1 }
                        }}
                        exit={{ 
                          scaleX: 0, 
                          opacity: 0,
                          transition: { duration: 0.2 }
                        }}
                        className={`absolute top-0 left-6 right-6 h-px origin-left bg-gradient-to-r ${
                          isDarkMode 
                            ? 'from-transparent via-white/10 to-transparent' 
                            : 'from-transparent via-primary/10 to-transparent'
                        }`} 
                      />
                      <div ref={contentRef}>
                        <motion.p 
                          className={`text-base leading-relaxed ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}
                        >
                          {faq.answer}
                        </motion.p>
                      </div>
                    </Disclosure.Panel>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </Disclosure>
    </motion.div>
  );
};

const FAQ = ({ onLoad }) => {
  const { isDarkMode } = useTheme();
  const { scrollYProgress } = useScroll();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Call onLoad when component mounts
  React.useEffect(() => {
    onLoad?.();
  }, [onLoad]);

  return (
    <section 
      id="faq-section"
      className={`relative min-h-screen flex items-center py-36 md:py-48 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-white to-gray-50'
      }`}
    >
      {/* Background Image with Theme-based Overlay */}
      <div className="absolute inset-0">
        <img 
          src={faqBackground} 
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
          style={{
            opacity: useTransform(scrollYProgress, [0, 0.2], [0.5, 1]),
            scale: useTransform(scrollYProgress, [0, 0.2], [0.95, 1]),
          }}
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
            Frequently Asked Questions
          </motion.span>

          <h2 className={`text-4xl lg:text-5xl font-bold mb-8`}>
            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>How can we </span>
            <span className={isDarkMode ? 'text-purple-400' : 'text-primary'}>help you</span>
            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}> ?</span>
          </h2>

          <p className={`text-lg max-w-2xl mx-auto ${
            isDarkMode ? 'text-gray-300/90' : 'text-gray-600/90'
          }`}>
            Find answers to common questions about our library management system
          </p>
        </motion.div>

        {/* FAQs Grid */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem
              key={faq.question}
              faq={faq}
              index={index}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16 flex flex-col items-center"
        >
          <p className={`text-lg font-medium mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Still can't find what you're looking for?
          </p>
          <div className="w-full flex justify-center">
            <StyledButton
              onClick={() => setIsContactModalOpen(true)}
              isDarkMode={isDarkMode}
            >
              <div className="svg-wrapper-1">
                <div className="svg-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24}>
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path fill="currentColor" d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z" />
                  </svg>
                </div>
              </div>
              <span>Get in Touch</span>
            </StyledButton>
          </div>
        </motion.div>
      </div>

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        isDarkMode={isDarkMode}
      />
    </section>
  );
};

export default FAQ; 