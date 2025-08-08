import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiBookOpen, FiMap } from 'react-icons/fi';
import { useTheme } from '../../../contexts/ThemeContext';
import findBooksBackground from '../../../assets/img/landing/find-books-bg.jpg';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { searchBooksWithLocation } from '../../../api/borrowApi';
import { toast } from 'react-toastify';

// Mock library locations
const libraryLocations = [
  { name: "Main Library", floors: ["Ground", "First", "Second"] },
  { name: "Reference Section", floors: ["Ground"] },
  { name: "Research Wing", floors: ["First", "Second"] }
];

const statusColors = {
  'Available': 'bg-green-100 text-green-800',
  'Borrowed': 'bg-yellow-100 text-yellow-800',
  'Out of Stock': 'bg-red-100 text-red-800',
};

// Styled components
const StyledSearch = styled.div`
  .input-container {
    position: relative;
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
    
    @media (min-width: 640px) {
      max-width: 400px;
    }
    
    @media (min-width: 768px) {
      max-width: 500px;
    }
  }

  .input {
    width: 100%;
    height: 44px;
    padding: 8px 44px 8px 12px;
    font-size: 14px;
    font-family: inherit;
    color: ${props => props.isDarkMode ? '#fff' : '#1a1a1a'};
    background-color: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff'};
    border: 1px solid ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
    border-radius: 10px;
    outline: none;
    transition: all 0.2s ease;
    backdrop-filter: blur(8px);
    
    @media (min-width: 640px) {
      height: 50px;
      padding: 8px 44px 8px 16px;
      font-size: 15px;
      border-radius: 12px;
    }
  }

  .input::placeholder {
    color: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)'};
    font-size: 13px;
    
    @media (min-width: 640px) {
      font-size: 15px;
    }
  }

  .input:hover {
    border-color: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
    background-color: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#fff'};
  }

  .input:focus {
    background-color: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#fff'};
    border-color: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
    box-shadow: ${props => props.isDarkMode 
      ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
      : '0 4px 20px rgba(0, 0, 0, 0.1)'};
  }

  .search-icon-button {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)'};
    transition: all 0.2s ease;
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    @media (min-width: 640px) {
      right: 16px;
      padding: 8px;
      border-radius: 8px;
    }

    &:hover {
      background-color: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
      color: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)'};
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .spinner {
      animation: spin 1s linear infinite;
      width: 14px;
      height: 14px;
      border: 2px solid;
      border-top-color: transparent;
      border-radius: 50%;
      
      @media (min-width: 640px) {
        width: 16px;
        height: 16px;
      }
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .input:focus ~ .search-icon-button {
    color: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)'};
  }
`;

const StyledLoader = styled.div`
  .container_SevMini {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  .Ghost {
    transform: translate(0px, -25px);
    z-index: -1;
    animation: opacidad 4s infinite ease-in-out;
  }

  @keyframes opacidad {
    0% {
      opacity: 1;
      scale: 1;
    }

    50% {
      opacity: 0.5;
      scale: 0.9;
    }

    100% {
      opacity: 1;
      scale: 1;
    }
  }

  @keyframes estroboscopico {
    0% {
      opacity: 1;
    }

    50% {
      opacity: 0;
    }

    51% {
      opacity: 1;
    }

    100% {
      opacity: 1;
    }
  }

  @keyframes rebote {
    0%,
    100% {
      transform: translateY(0);
    }

    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes estroboscopico1 {
    0%,
    50%,
    100% {
      fill: rgb(255, 95, 74);
    }

    25%,
    75% {
      fill: rgb(16, 53, 115);
    }
  }

  @keyframes estroboscopico2 {
    0%,
    50%,
    100% {
      fill: #17e300;
    }

    25%,
    75% {
      fill: #17e300b4;
    }
  }

  .SevMini {
    animation: rebote 4s infinite ease-in-out;
  }

  #strobe_led1 {
    animation: estroboscopico 0.5s infinite;
  }

  #strobe_color1 {
    animation: estroboscopico2 0.8s infinite;
  }

  #strobe_color3 {
    animation: estroboscopico1 0.8s infinite;
    animation-delay: 3s;
  }
`;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: {
      duration: 0.2
    }
  }
};

const emptyStateVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3
    }
  }
};

const RackVisualization = ({ onLoad }) => {
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Call onLoad when component mounts
  useEffect(() => {
    onLoad?.();
  }, [onLoad]);

  // Fetch initial recommendations
  useEffect(() => {
    const fetchInitialBooks = async () => {
      try {
        setIsLoading(true);
        const data = await searchBooksWithLocation('');  // Empty query to get recent/popular books
        setRecommendations(data);
        setBooks(data); // Set books to recommendations initially
      } catch (error) {
        console.error('Error fetching initial books:', error);
        toast.error('Failed to load books');
        setRecommendations([]);
        setBooks([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialBooks();
  }, []);

  // Search books when query changes
  useEffect(() => {
    const searchBooks = async () => {
      // Only search if query has at least 3 characters or is empty
      if (searchQuery.trim().length < 3 && searchQuery.trim().length > 0) {
        setBooks(recommendations);
        setHasSearched(false);
        return;
      }

      if (!searchQuery.trim()) {
        setBooks(recommendations);
        setHasSearched(false);
        return;
      }

      try {
        setIsLoading(true);
        setHasSearched(true);
        const data = await searchBooksWithLocation(searchQuery);
        setBooks(data);
      } catch (error) {
        console.error('Error searching books:', error);
        toast.error('Failed to search books');
        setBooks([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Add debounce to avoid too many API calls
    const timeoutId = setTimeout(searchBooks, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, recommendations]);

  const handleSearchInput = (e) => {
    setSearchQuery(e.target.value);
  };

  const renderLocationInfo = (location) => {
    if (location.library === 'Unassigned') {
      return (
        <div className={`flex flex-col gap-1 text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <div className="flex items-center gap-1 sm:gap-2">
            <FiMap className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">Location not assigned</span>
          </div>
        </div>
      );
    }

    return (
      <div className={`flex flex-col gap-1 text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <div className="flex items-center gap-1 sm:gap-2">
          <FiMap className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="truncate">{location.library}</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <FiBookOpen className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="truncate">{location.department}, {location.rack}</span>
        </div>
      </div>
    );
  };

  return (
    <section 
      id="racks-section"
      className={`relative min-h-screen flex items-center py-16 sm:py-20 md:py-24 lg:py-36 xl:py-48 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-white to-gray-50'
      }`}>
      {/* Background */}
      <div className="absolute inset-0">
        <img 
          src={findBooksBackground} 
          alt="background" 
          className={`w-full h-full object-cover object-center ${
            isDarkMode ? 'opacity-30' : 'opacity-50'
          }`}
        />
        <div className={`absolute inset-0 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-900/90' 
            : 'bg-gradient-to-b from-white/60 via-white/70 to-white/60'
        }`} />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <motion.span
            className={`inline-block px-3 sm:px-4 py-1.5 mb-4 sm:mb-6 text-xs sm:text-sm font-medium rounded-full ${
              isDarkMode 
                ? 'text-white/90 bg-white/10' 
                : 'text-primary/90 bg-primary/10'
            }`}
          >
            Find Your Book
          </motion.span>

          <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 md:mb-8 leading-tight`}>
            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Locate </span>
            <span className={isDarkMode ? 'text-purple-400' : 'text-primary'}>Books</span>
            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}> Instantly</span>
          </h2>

          <p className={`text-sm sm:text-base md:text-lg max-w-xs sm:max-w-md md:max-w-2xl mx-auto ${
            isDarkMode ? 'text-gray-300/90' : 'text-gray-600/90'
          }`}>
            Find any book in our library with its exact location and availability status
          </p>
        </motion.div>

        {/* Search Input */}
        <motion.div 
          className="mb-8 sm:mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <StyledSearch isDarkMode={isDarkMode}>
            <div className="input-container">
              <input
                className="input"
                type="text"
                placeholder="Search by title, author, or ISBN... (minimum 3 characters)"
                value={searchQuery}
                onChange={handleSearchInput}
              />
              {isLoading ? (
                <div className="search-icon-button">
                  <div className="spinner"></div>
                </div>
              ) : (
                <FiSearch className="search-icon-button w-4 h-4" />
              )}
            </div>
          </StyledSearch>
          
          {/* Character count indicator */}
          {searchQuery.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-center mt-2 text-xs sm:text-sm ${
                searchQuery.length >= 3 
                  ? isDarkMode ? 'text-green-400' : 'text-green-600'
                  : isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
              }`}
            >
              {searchQuery.length < 3 
                ? `Type ${3 - searchQuery.length} more character${3 - searchQuery.length === 1 ? '' : 's'} to search`
                : 'Searching...'
              }
            </motion.div>
          )}
        </motion.div>

        {/* Book Recommendations Section */}
        {!hasSearched && recommendations.length > 0 && (
          <div className="mb-8 sm:mb-12 md:mb-16">
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6 text-center text-purple-500">Recommended for You</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {recommendations.map((book) => (
                <motion.div
                  key={book.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative overflow-hidden rounded-xl sm:rounded-2xl transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-white/5 hover:bg-white/10' 
                      : 'bg-white hover:bg-white'
                  } shadow-lg flex flex-col h-full`}
                >
                  <div className="relative p-4 sm:p-6 z-10 h-full flex flex-col justify-between backdrop-blur-[2px]">
                    <div className="flex flex-col gap-3 sm:gap-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-sm sm:text-base md:text-lg font-semibold truncate ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {book.title}
                          </h3>
                          <p className={`text-xs sm:text-sm truncate ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            by {book.authors.join(', ')}
                          </p>
                        </div>
                        {book.thumbnail && (
                          <img 
                            src={book.thumbnail} 
                            alt={book.title}
                            className="w-12 h-16 sm:w-16 sm:h-20 md:h-24 object-cover rounded-lg shadow-lg flex-shrink-0 transition-transform duration-200 hover:scale-105"
                            loading="lazy"
                            decoding="async"
                          />
                        )}
                      </div>
                      <div className="text-xs sm:text-sm">
                        {renderLocationInfo(book.location)}
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-6">
                      <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                        book.status === 'Available'
                          ? isDarkMode
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-green-100 text-green-800'
                          : isDarkMode
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {book.status}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Results Grid */}
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                variants={emptyStateVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="text-center py-8 sm:py-12"
              >
                <div className={`inline-block ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-purple-500 mx-auto mb-3 sm:mb-4"></div>
                  <span className="text-sm sm:text-base">Searching books...</span>
                </div>
              </motion.div>
            ) : searchQuery.length > 0 && searchQuery.length < 3 ? (
              <motion.div
                key="typing"
                variants={emptyStateVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={`text-center py-8 sm:py-12 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-pulse text-lg sm:text-xl">⌨️</div>
                  <span className="text-sm sm:text-base">Keep typing to search books...</span>
                </div>
              </motion.div>
            ) : hasSearched ? (
              books.length > 0 ? (
                <motion.div
                  key="results"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
                >
                  {books.map((book) => (
                    <motion.div
                      key={book.id}
                      variants={itemVariants}
                      className={`group relative overflow-hidden rounded-xl sm:rounded-2xl transition-all duration-300 ${
                        isDarkMode 
                          ? 'bg-white/5 hover:bg-white/10' 
                          : 'bg-white hover:bg-white'
                      }`}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative p-4 sm:p-6 z-10 h-full flex flex-col justify-between backdrop-blur-[2px]"
                      >
                        <div className="flex flex-col gap-3 sm:gap-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className={`text-sm sm:text-base md:text-lg font-semibold truncate ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {book.title}
                              </h3>
                              <p className={`text-xs sm:text-sm truncate ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                by {book.authors.join(', ')}
                              </p>
                            </div>
                            {book.thumbnail && (
                              <img 
                                src={book.thumbnail} 
                                alt={book.title}
                                className="w-12 h-16 sm:w-16 sm:h-20 md:h-24 object-cover rounded-lg shadow-lg flex-shrink-0 transition-transform duration-200 hover:scale-105"
                                loading="lazy"
                                decoding="async"
                              />
                            )}
                          </div>
                          <div className="text-xs sm:text-sm">
                            {renderLocationInfo(book.location)}
                          </div>
                        </div>
                        <div className="mt-4 sm:mt-6">
                          <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                            book.status === 'Available'
                              ? isDarkMode
                                ? 'bg-green-500/20 text-green-300'
                                : 'bg-green-100 text-green-800'
                              : isDarkMode
                                ? 'bg-red-500/20 text-red-300'
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {book.status}
                          </span>
                        </div>
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  variants={emptyStateVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className={`text-center py-8 sm:py-12 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  <span className="text-sm sm:text-base">No books found matching your search.</span>
                </motion.div>
              )
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default React.memo(RackVisualization); 