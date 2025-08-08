import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { FiBook, FiBookOpen, FiVideo, FiFileText, FiAward, FiSearch, FiChevronDown, FiDownload, FiExternalLink, FiEye } from 'react-icons/fi';
import { useTheme } from '../../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import digitalLibraryBackground from '../../../assets/img/landing/digital-library-bg.jpg';
import styled from 'styled-components';
import { getPublicResources } from '../../../api/digitalLibraryApi';
import { API_URL } from '../../../api/config';
import { toast } from 'react-toastify';

// Styled Search Input Component
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

// Animation variants
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

// Memoize the categories data
const categories = [
  {
    id: 'All',
    label: 'All Resources',
    icon: FiBook,
    description: 'Browse our complete collection',
    color: 'gray'
  },
  {
    id: 'Previous Papers',
    label: 'Previous Papers',
    icon: FiFileText,
    description: 'Past exam papers and solutions',
    color: 'amber'
  },
  {
    id: 'Tools',
    label: 'Tools',
    icon: FiAward,
    description: 'Software tools and utilities',
    color: 'blue'
  },
  {
    id: 'E-books',
    label: 'E-Books',
    icon: FiBookOpen,
    description: 'Digital books and study materials',
    color: 'purple'
  },
  {
    id: 'Research Papers',
    label: 'Research Papers',
    icon: FiFileText,
    description: 'Academic papers and publications',
    color: 'amber'
  },
  {
    id: 'Competitive',
    label: 'Competitive',
    icon: FiAward,
    description: 'Exam preparation resources',
    color: 'sky'
  },
  {
    id: 'Others',
    label: 'Others',
    icon: FiBook,
    description: 'Miscellaneous resources',
    color: 'gray'
  }
];

// Memoized Resource Card Component
const ResourceCard = React.memo(({ resource, isDarkMode, index, isInView, onDownload }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const category = categories.find(c => c.id === resource.category) || categories[0];
  const animationProps = useMemo(() => ({
    initial: { opacity: 0, y: 20 },
    animate: isInView ? {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: index * 0.2,
        ease: [0.215, 0.610, 0.355, 1.000]
      }
    } : { opacity: 0, y: 20 }
  }), [isInView, index]);

  // Subtle pastel gradients for each category
  const gradients = {
    'E-books': isDarkMode 
      ? 'bg-gradient-to-br from-purple-900/10 via-purple-800/5 to-transparent'
      : 'bg-gradient-to-br from-purple-50 via-purple-50/50 to-white',
    'Video Lectures': isDarkMode
      ? 'bg-gradient-to-br from-emerald-900/10 via-emerald-800/5 to-transparent'
      : 'bg-gradient-to-br from-emerald-50 via-emerald-50/50 to-white',
    'Research Papers': isDarkMode
      ? 'bg-gradient-to-br from-amber-900/10 via-amber-800/5 to-transparent'
      : 'bg-gradient-to-br from-amber-50 via-amber-50/50 to-white',
    'Competitive': isDarkMode
      ? 'bg-gradient-to-br from-sky-900/10 via-sky-800/5 to-transparent'
      : 'bg-gradient-to-br from-sky-50 via-sky-50/50 to-white',
    'All': isDarkMode
      ? 'bg-gradient-to-br from-gray-900/10 via-gray-800/5 to-transparent'
      : 'bg-gradient-to-br from-gray-50 via-gray-50/50 to-white'
  };

  const handleDownloadClick = async () => {
    setIsDownloading(true);
    await onDownload(resource._id);
    setIsDownloading(false);
  };

  return (
    <motion.div
      {...animationProps}
      className="group relative"
    >
      <div 
        className={`overflow-hidden rounded-2xl transition-all duration-300 ${
          isDarkMode 
            ? 'bg-white/5 hover:bg-white/10' 
            : 'bg-white hover:bg-white'
        } ${gradients[resource.category] || gradients['All']}`}
        style={{ minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
      >
        {/* Content */}
        <div className="relative p-6 z-10 h-full flex flex-col justify-between backdrop-blur-[2px]">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <h3 className={`text-lg font-semibold truncate ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`} style={{ maxWidth: 220 }}>
                {resource.title}
              </h3>
              <span className={`p-2 rounded-xl backdrop-blur-sm ${
                isDarkMode 
                  ? 'bg-white/5' 
                  : 'bg-primary/5'
              }`}>
                {category.icon && <category.icon className={`w-5 h-5 ${isDarkMode ? 'text-white/80' : 'text-primary/80'}`} />}
              </span>
            </div>
            
            <p className={`text-sm leading-relaxed truncate ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`} style={{ maxWidth: 220 }}>
              {resource.description}
            </p>

            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2 py-1 rounded-full font-medium ${
                isDarkMode 
                  ? 'bg-white/10 text-white/80' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {resource.category}
              </span>
              {resource.fileSize && (
                <span className={`px-2 py-1 rounded-full font-medium ${
                  isDarkMode 
                    ? 'bg-white/5 text-white/60' 
                    : 'bg-gray-50 text-gray-500'
                }`}>
                  {resource.fileSize}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={handleDownloadClick}
              disabled={isDownloading}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                isDownloading
                  ? isDarkMode
                    ? 'bg-white/10 text-white/50 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : isDarkMode
                    ? 'bg-white/10 hover:bg-white/20 text-white/90 hover:text-white'
                    : 'bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary/90'
              }`}
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <FiDownload className="w-4 h-4" />
                  <span>Download</span>
                </>
              )}
            </button>

            {resource.externalLink && (
              <button
                onClick={() => window.open(resource.externalLink, '_blank')}
                className={`p-2.5 rounded-xl transition-all duration-200 ${
                  isDarkMode
                    ? 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'
                }`}
                title="Open external link"
              >
                <FiExternalLink className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

const DigitalLibrary = ({ onLoad }) => {
  // Force hot reload - isLoading has been changed to loading
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // Show 6 items per page (2x3 grid)

  // Calculate pagination
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedResources = filteredResources.slice(startIndex, endIndex);

  // Reset to first page when search or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // Call onLoad when component mounts
  useEffect(() => {
    onLoad?.();
  }, [onLoad]);

  // Fetch all resources on component mount
  useEffect(() => {
    const fetchAllResources = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPublicResources();
        setResources(data);
        setFilteredResources(data);
        setRecommendations(data); // Set recommendations to all resources initially
      } catch (error) {
        console.error('Error fetching resources:', error);
        setError('Failed to load resources');
        toast.error('Failed to load digital resources');
      } finally {
        setLoading(false);
      }
    };

    fetchAllResources();
  }, []);

  // Search and filter resources when query or category changes
  useEffect(() => {
    const searchAndFilterResources = async () => {
      // Only search if query has at least 3 characters or is empty
      if (searchQuery.trim().length < 3 && searchQuery.trim().length > 0) {
        setFilteredResources(recommendations);
        setHasSearched(false);
        return;
      }

      if (!searchQuery.trim()) {
        setFilteredResources(recommendations);
        setHasSearched(false);
        return;
      }

      try {
        setLoading(true);
        setHasSearched(true);
        
        // Filter resources based on search query and category
        let filtered = resources.filter(resource => {
          const matchesSearch = searchQuery.trim() === '' || 
            resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.category.toLowerCase().includes(searchQuery.toLowerCase());
          
          const matchesCategory = selectedCategory === 'All' || resource.category === selectedCategory;
          
          return matchesSearch && matchesCategory;
        });
        
        setFilteredResources(filtered);
      } catch (error) {
        console.error('Error filtering resources:', error);
        setFilteredResources([]);
      } finally {
        setLoading(false);
      }
    };

    // Add debounce to avoid too many filtering operations
    const timeoutId = setTimeout(searchAndFilterResources, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory, resources, recommendations]);

  const handleDownload = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('not logged in');
      }

      const response = await fetch(`${API_URL}/api/digital-library/download/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('not logged in');
        }
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resource';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Resource downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      if (error.message.includes('not logged in')) {
        toast.error('Please log in again to download resources', {
          onClose: () => {
            localStorage.removeItem('token');
            navigate('/auth/sign-in');
          },
          autoClose: 2000
        });
      } else {
        toast.error('Failed to download resource: ' + error.message);
      }
    }
  };

  const handleSearchInput = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  return (
    <section 
      id="digital-library-section"
      className={`relative min-h-screen flex items-center py-16 sm:py-20 md:py-24 lg:py-36 xl:py-48 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-white to-gray-50'
      }`}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img 
          src={digitalLibraryBackground} 
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
            Digital Library
          </motion.span>

          <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 md:mb-8 leading-tight`}>
            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Access </span>
            <span className={isDarkMode ? 'text-purple-400' : 'text-primary'}>Digital</span>
            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}> Resources</span>
          </h2>

          <p className={`text-sm sm:text-base md:text-lg max-w-xs sm:max-w-md md:max-w-2xl mx-auto ${
            isDarkMode ? 'text-gray-300/90' : 'text-gray-600/90'
          }`}>
            Explore our curated collection of educational materials
          </p>
        </motion.div>

        {/* Search Bar */}
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
                placeholder="Search resources... (minimum 3 characters)"
                value={searchQuery}
                onChange={handleSearchInput}
              />
              {loading ? (
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

        {/* Categories */}
        <div className="max-w-5xl mx-auto mb-12 sm:mb-16 md:mb-20">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => handleCategorySelect(category.id)}
                className={`relative inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-medium transition-all rounded-xl px-3 sm:px-5 py-2 sm:py-2.5 group
                  ${selectedCategory === category.id
                    ? isDarkMode
                      ? `bg-white/15 text-white/90 ring-2 ring-${
                          category.id === 'All' ? 'gray' : 
                          category.id === 'E-books' ? 'purple' :
                          category.id === 'Video Lectures' ? 'emerald' :
                          category.id === 'Research Papers' ? 'amber' : 'sky'
                        }-400/40 ring-offset-2 ring-offset-gray-900`
                      : `bg-white text-gray-900 shadow-md ring-2 ring-${
                          category.id === 'All' ? 'gray' : 
                          category.id === 'E-books' ? 'purple' :
                          category.id === 'Video Lectures' ? 'emerald' :
                          category.id === 'Research Papers' ? 'amber' : 'sky'
                        }-500/20`
                    : isDarkMode
                      ? 'bg-white/5 hover:bg-white/10 text-gray-300/90 hover:text-white/90'
                      : 'bg-white hover:bg-gray-50 text-gray-600 shadow-sm hover:text-gray-900'
                  }`}
              >
                <category.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium">{category.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Category Description */}
          <AnimatePresence mode="wait">
            <motion.p
              key={selectedCategory}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`text-center mt-4 sm:mt-6 text-xs sm:text-sm max-w-2xl mx-auto ${
                isDarkMode ? 'text-gray-400/90' : 'text-gray-500/90'
              }`}
            >
              {categories.find(c => c.id === selectedCategory)?.description}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Resources Grid */}
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {loading ? (
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
                  <span className="text-sm sm:text-base">Searching resources...</span>
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
                  <span className="text-sm sm:text-base">Keep typing to search resources...</span>
                </div>
              </motion.div>
            ) : hasSearched ? (
              filteredResources.length > 0 ? (
                <motion.div
                  key="results"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
                >
                  {paginatedResources.map((resource, index) => (
                    <motion.div
                      key={resource._id}
                      variants={itemVariants}
                    >
                      <ResourceCard
                        resource={resource}
                        isDarkMode={isDarkMode}
                        index={index}
                        isInView={true}
                        onDownload={handleDownload}
                      />
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
                  <span className="text-sm sm:text-base">No resources found matching your search.</span>
                </motion.div>
              )
            ) : (
              // Show recommendations when no search is performed
              recommendations.length > 0 && (
                <motion.div
                  key="recommendations"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
                >
                  {paginatedResources.map((resource, index) => (
                    <motion.div
                      key={resource._id}
                      variants={itemVariants}
                    >
                      <ResourceCard
                        resource={resource}
                        isDarkMode={isDarkMode}
                        index={index}
                        isInView={true}
                        onDownload={handleDownload}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>

        {/* Pagination Dots */}
        {totalPages > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center mt-8 sm:mt-12 gap-2"
          >
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`w-3 h-3 rounded-full transition-all duration-200 hover:scale-110
                  ${currentPage === idx + 1
                    ? isDarkMode ? 'bg-purple-400 scale-125' : 'bg-primary scale-125'
                    : isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                aria-label={`Go to page ${idx + 1}`}
              />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default React.memo(DigitalLibrary);