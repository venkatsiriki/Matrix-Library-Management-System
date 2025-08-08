import React, { useState, useEffect, useMemo, Fragment } from 'react';
import { FiDownload, FiEdit2, FiTrash2, FiStar, FiSearch, FiFileText, FiVideo, FiBookOpen, FiBook, FiEye } from 'react-icons/fi';
import { useTheme } from '../../../contexts/ThemeContext';
import styled from 'styled-components';
import { Dialog, Transition } from '@headlessui/react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import {
  getResources,
  uploadResource,
  updateResource,
  deleteResource,
  downloadResource
} from '../../../api/digitalLibraryApi';

// Library configuration
const LIBRARY_CONFIG = {
  CATEGORIES: [
    "All",
    "Notes",
    "Previous Papers",
    "Tools",
    "Prep Materials",
    "Model Papers",
    "Assignments",
    "E-books",
    "Research Papers",
    "Competitive",
    "Others"
  ],
  DEPARTMENTS: [
    "CSE",
    "ECE",
    "MECH",
    "CIVIL",
    "MCA",
    "AI/ML",
    "IT",
    "EEE",
    "BCA",
    "BBA",
    "BCOM",
    "MBA",
    "BIOTECH",
    "CHEM",
    "COMPETITIVE",
    "GENERAL"
  ],
  UPLOAD_TYPES: ["PDF", "External Link", "Video", "ZIP", "Image"],
  STATUSES: ["Active", "Inactive"],
};

// LocalStorage keys
const STORAGE_KEYS = {
  RESOURCES: "digital_resources",
  RECENTLY_ADDED: "digital_recently_added",
};

// Categorized sample data (displayed by default)
const CATEGORIZED_SAMPLE_RESOURCES = [
  // Previous Papers
  {
    id: 'PP1',
    title: 'Previous Paper - Control Systems',
    category: 'Previous Papers',
    department: 'ECE',
    description: '2019 Control Systems university exam paper.',
    link: '',
    url: '',
    tags: ['ECE', 'Exam'],
    previewAvailable: false,
    status: 'Active',
    downloads: 80,
    rating: 4.2,
    addedDate: new Date(2022, 11, 5).toISOString(),
    addedBy: 'Faculty',
    views: 32,
  },
  {
    id: 'PP2',
    title: 'Previous Paper - Data Structures',
    category: 'Previous Papers',
    department: 'CSE',
    description: '2021 Data Structures exam paper with solutions.',
    link: '',
    url: '',
    tags: ['CSE', 'Exam'],
    previewAvailable: true,
    status: 'Active',
    downloads: 110,
    rating: 4.6,
    addedDate: new Date(2021, 10, 20).toISOString(),
    addedBy: 'Admin',
    views: 50,
  },
  // Additional Previous Papers
  {
    id: 'PP3',
    title: 'Previous Paper - Microprocessors',
    category: 'Previous Papers',
    department: 'ECE',
    description: '2020 Microprocessors exam paper with answer key.',
    link: '',
    url: '',
    tags: ['ECE', 'Microprocessors', 'Exam'],
    previewAvailable: true,
    status: 'Active',
    downloads: 95,
    rating: 4.4,
    addedDate: new Date(2020, 9, 15).toISOString(),
    addedBy: 'Faculty',
    views: 41,
  },
  {
    id: 'PP4',
    title: 'Previous Paper - Engineering Mathematics II',
    category: 'Previous Papers',
    department: 'GENERAL',
    description: '2018 Engineering Mathematics II university exam paper.',
    link: '',
    url: '',
    tags: ['Math', 'Exam'],
    previewAvailable: false,
    status: 'Active',
    downloads: 70,
    rating: 4.0,
    addedDate: new Date(2018, 4, 10).toISOString(),
    addedBy: 'Admin',
    views: 29,
  },
  {
    id: 'PP5',
    title: 'Previous Paper - Operating Systems',
    category: 'Previous Papers',
    department: 'CSE',
    description: '2017 Operating Systems exam paper with solutions.',
    link: '',
    url: '',
    tags: ['CSE', 'OS', 'Exam'],
    previewAvailable: true,
    status: 'Active',
    downloads: 85,
    rating: 4.3,
    addedDate: new Date(2017, 6, 22).toISOString(),
    addedBy: 'Faculty',
    views: 36,
  },
  {
    id: 'PP6',
    title: 'Previous Paper - Signals and Systems',
    category: 'Previous Papers',
    department: 'ECE',
    description: '2016 Signals and Systems exam paper.',
    link: '',
    url: '',
    tags: ['ECE', 'Signals', 'Exam'],
    previewAvailable: false,
    status: 'Active',
    downloads: 60,
    rating: 4.1,
    addedDate: new Date(2016, 2, 18).toISOString(),
    addedBy: 'Admin',
    views: 24,
  },
  // Tools
  {
    id: 'T1',
    title: 'MATLAB Student License',
    category: 'Tools',
    department: 'CSE',
    description: 'MATLAB software for engineering students.',
    link: 'https://matlab.com',
    url: '',
    tags: ['Software', 'Engineering'],
    previewAvailable: false,
    status: 'Active',
    downloads: 200,
    rating: 4.8,
    addedDate: new Date(2023, 1, 20).toISOString(),
    addedBy: 'Admin',
    views: 100,
  },
  {
    id: 'T2',
    title: 'Python IDE Installer',
    category: 'Tools',
    department: 'CSE',
    description: 'Installer for Python IDE (PyCharm Community).',
    link: 'https://jetbrains.com/pycharm',
    url: '',
    tags: ['Python', 'IDE'],
    previewAvailable: false,
    status: 'Active',
    downloads: 180,
    rating: 4.7,
    addedDate: new Date(2023, 3, 12).toISOString(),
    addedBy: 'Admin',
    views: 90,
  },
  {
    id: 'T3',
    title: 'GitHub',
    category: 'Tools',
    department: 'GENERAL',
    description: 'GitHub is a code hosting platform for version control and collaboration.',
    link: 'https://github.com',
    url: '',
    tags: ['Git', 'Version Control', 'Collaboration'],
    previewAvailable: false,
    status: 'Active',
    downloads: 300,
    rating: 4.9,
    addedDate: new Date(2023, 7, 1).toISOString(),
    addedBy: 'Admin',
    views: 150,
  },
  {
    id: 'T4',
    title: 'AI Tools',
    category: 'Tools',
    department: 'CSE',
    description: 'A curated list of AI-powered tools for productivity and learning.',
    link: 'https://aitoolsdirectory.com',
    url: '',
    tags: ['AI', 'Productivity', 'Learning'],
    previewAvailable: false,
    status: 'Active',
    downloads: 120,
    rating: 4.8,
    addedDate: new Date(2023, 8, 15).toISOString(),
    addedBy: 'Admin',
    views: 110,
  },
  {
    id: 'T5',
    title: 'ChatGPT',
    category: 'Tools',
    department: 'GENERAL',
    description: 'ChatGPT is an AI-powered conversational assistant developed by OpenAI.',
    link: 'https://chat.openai.com',
    url: '',
    tags: ['AI', 'Chatbot', 'OpenAI'],
    previewAvailable: false,
    status: 'Active',
    downloads: 210,
    rating: 4.9,
    addedDate: new Date(2023, 9, 10).toISOString(),
    addedBy: 'Admin',
    views: 180,
  },
  {
    id: 'T6',
    title: 'Git',
    category: 'Tools',
    department: 'GENERAL',
    description: 'Git is a distributed version control system for tracking changes in source code.',
    link: 'https://git-scm.com',
    url: '',
    tags: ['Git', 'Version Control'],
    previewAvailable: false,
    status: 'Active',
    downloads: 250,
    rating: 4.8,
    addedDate: new Date(2023, 10, 5).toISOString(),
    addedBy: 'Admin',
    views: 140,
  },
  // E-books
  {
    id: 'E1',
    title: 'Advanced Algorithms E-book',
    category: 'E-books',
    department: 'CSE',
    description: 'A comprehensive e-book on advanced algorithms.',
    link: '',
    url: '',
    tags: ['Algorithms', 'E-book'],
    previewAvailable: true,
    status: 'Active',
    downloads: 95,
    rating: 4.9,
    addedDate: new Date(2023, 6, 18).toISOString(),
    addedBy: 'Admin',
    views: 120,
  },
  {
    id: 'E2',
    title: 'Machine Learning E-book',
    category: 'E-books',
    department: 'CSE',
    description: 'E-book covering basics to advanced machine learning.',
    link: '',
    url: '',
    tags: ['Machine Learning', 'E-book'],
    previewAvailable: true,
    status: 'Active',
    downloads: 80,
    rating: 4.8,
    addedDate: new Date(2023, 7, 10).toISOString(),
    addedBy: 'Faculty',
    views: 90,
  },
  // Research Papers
  {
    id: 'RP1',
    title: 'AI in Healthcare Research Paper',
    category: 'Research Papers',
    department: 'CSE',
    description: 'Research paper on applications of AI in healthcare.',
    link: '',
    url: '',
    tags: ['AI', 'Healthcare', 'Research'],
    previewAvailable: true,
    status: 'Active',
    downloads: 40,
    rating: 4.8,
    addedDate: new Date(2023, 8, 2).toISOString(),
    addedBy: 'Researcher',
    views: 67,
  },
  {
    id: 'RP2',
    title: 'Blockchain Security Research',
    category: 'Research Papers',
    department: 'CSE',
    description: 'Research on security in blockchain technology.',
    link: '',
    url: '',
    tags: ['Blockchain', 'Security'],
    previewAvailable: true,
    status: 'Active',
    downloads: 35,
    rating: 4.7,
    addedDate: new Date(2023, 9, 12).toISOString(),
    addedBy: 'Researcher',
    views: 55,
  },
  // Competitive
  {
    id: 'C1',
    title: 'Aptitude Practice Set',
    category: 'Competitive',
    department: 'COMPETITIVE',
    description: 'Practice set for competitive exams aptitude section.',
    link: '',
    url: '',
    tags: ['Aptitude', 'Competitive'],
    previewAvailable: true,
    status: 'Active',
    downloads: 130,
    rating: 4.6,
    addedDate: new Date(2023, 9, 1).toISOString(),
    addedBy: 'Admin',
    views: 140,
  },
  {
    id: 'C2',
    title: 'Logical Reasoning Practice',
    category: 'Competitive',
    department: 'COMPETITIVE',
    description: 'Logical reasoning questions for competitive exams.',
    link: '',
    url: '',
    tags: ['Reasoning', 'Competitive'],
    previewAvailable: true,
    status: 'Active',
    downloads: 110,
    rating: 4.5,
    addedDate: new Date(2023, 10, 3).toISOString(),
    addedBy: 'Faculty',
    views: 100,
  },
];

// Styled Search Input Component
const StyledSearch = styled.div`
  .input-container {
    position: relative;
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
  }

  .input {
    width: 100%;
    height: 50px;
    padding: 8px 44px 8px 16px;
    font-size: 15px;
    font-family: inherit;
    color: ${props => props.isDarkMode ? '#fff' : '#1a1a1a'};
    background-color: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff'};
    border: 1px solid ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
    border-radius: 12px;
    outline: none;
    transition: all 0.2s ease;
    backdrop-filter: blur(8px);
  }

  .input::placeholder {
    color: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)'};
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

  .search-icon {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)'};
    transition: color 0.2s ease;
  }

  .input:focus ~ .search-icon {
    color: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)'};
  }

  .input:not(:placeholder-shown) {
    font-weight: 500;
  }
`;

// Memoized Resource Card Component
const ResourceCard = React.memo(({ resource, isDarkMode, index, isInView, onEdit, onDelete, onDownload, downloadingId }) => {
  const category = LIBRARY_CONFIG.CATEGORIES.find(c => c === resource.category) || LIBRARY_CONFIG.CATEGORIES[0];
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
                {resource.uploadType === 'PDF' && <FiFileText className={`w-5 h-5 ${isDarkMode ? 'text-white/80' : 'text-primary/80'}`} />}
                {resource.uploadType === 'Video' && <FiVideo className={`w-5 h-5 ${isDarkMode ? 'text-white/80' : 'text-primary/80'}`} />}
                {resource.uploadType === 'External Link' && <FiBookOpen className={`w-5 h-5 ${isDarkMode ? 'text-white/80' : 'text-primary/80'}`} />}
                {resource.uploadType === 'ZIP' && <FiDownload className={`w-5 h-5 ${isDarkMode ? 'text-white/80' : 'text-primary/80'}`} />}
                {resource.uploadType === 'Image' && <FiFileText className={`w-5 h-5 ${isDarkMode ? 'text-white/80' : 'text-primary/80'}`} />}
              </span>
            </div>
            
            <p className={`text-sm leading-relaxed truncate ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`} style={{ maxWidth: 220 }}>
              {resource.description}
            </p>

            <div className={`flex flex-wrap gap-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary">
                {resource.department}
              </span>
              <span className="px-3 py-1 rounded-full bg-info/10 text-info">
                {resource.category}
              </span>
              <span className={`px-3 py-1 rounded-full ${
                resource.status === 'Active' 
                  ? 'bg-success/10 text-success' 
                  : 'bg-danger/10 text-danger'
              }`}>
                {resource.status}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6">
            <div className={`flex items-center gap-4 text-sm mb-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <span className="flex items-center gap-1.5">
                <FiDownload className="w-4 h-4" />
                {resource.downloads || 0} downloads
              </span>
              <span className="w-1 h-1 rounded-full bg-current opacity-50" />
              <span className="flex items-center gap-1.5">
                <FiStar className={`w-4 h-4 ${
                  isDarkMode ? 'text-amber-400' : 'text-amber-500'
                }`} />
                {resource.rating || 'New'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {resource.url ? (
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 backdrop-blur-sm ${
                    isDarkMode 
                      ? 'bg-white/5 hover:bg-white/10 text-white' 
                      : 'bg-primary/5 hover:bg-primary/10 text-primary'
                  }`}
                >
                  <FiEye className="w-4 h-4" />
                  <span>View</span>
                </a>
              ) : (
                <button
                  onClick={() => onDownload(resource._id)}
                  disabled={downloadingId === resource._id}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 backdrop-blur-sm ${
                    isDarkMode 
                      ? 'bg-white/5 hover:bg-white/10 text-white disabled:bg-white/5 disabled:text-white/50' 
                      : 'bg-primary/5 hover:bg-primary/10 text-primary disabled:bg-primary/5 disabled:text-primary/50'
                  }`}
                >
                  {downloadingId === resource._id ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <FiDownload className="w-4 h-4" />
                      <span>Download</span>
                    </>
                  )}
                </button>
              )}
              <button 
                onClick={() => onEdit(resource)}
                className={`p-2.5 rounded-xl transition-colors backdrop-blur-sm ${
                  isDarkMode 
                    ? 'bg-white/5 hover:bg-white/10 text-white' 
                    : 'bg-primary/5 hover:bg-primary/10 text-primary'
                }`}
              >
                <FiEdit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onDelete(resource._id)}
                className={`p-2.5 rounded-xl transition-colors backdrop-blur-sm ${
                  isDarkMode 
                    ? 'bg-white/5 hover:bg-white/10 text-white' 
                    : 'bg-primary/5 hover:bg-primary/10 text-primary'
                }`}>
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

const DigitalLibrary = () => {
  document.title = "Digital Library Manager";

  const { isDarkMode } = useTheme();
  const [allResources, setAllResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [filters, setFilters] = useState({
    category: 'All',
    department: '',
    search: ''
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    department: '',
    description: '',
    tags: '',
    file: null,
    url: ''
  });
  const [deleteModal, setDeleteModal] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    fetchAllResources();
  }, [filters.category, filters.department]);

  // Fetch all resources for the selected category/department (not search)
  const fetchAllResources = async () => {
    try {
      setLoading(true);
      // Only send category/department to backend, not search
      const backendFilters = { ...filters };
      delete backendFilters.search;
      if (backendFilters.category === 'All') delete backendFilters.category;
      const data = await getResources(backendFilters);
      if (!Array.isArray(data)) {
        console.error('Invalid response data:', data);
        toast.error('Failed to fetch resources');
        return;
      }
      setAllResources(data);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error(error.message || 'Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  // Filter resources by search query (case-insensitive, by any letter)
  const filteredResources = useMemo(() => {
    const q = (filters.search || '').trim().toLowerCase();
    if (!q) return allResources;
    return allResources.filter(resource =>
      (resource.title || '').toLowerCase().includes(q) ||
      (resource.description || '').toLowerCase().includes(q) ||
      (resource.department || '').toLowerCase().includes(q)
    );
  }, [allResources, filters.search]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setError('File size should not exceed 50MB');
        e.target.value = ''; // Clear the file input
        return;
      }
      setFormData(prev => ({
        ...prev,
        file
      }));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.category) {
      setError('Category is required');
      return;
    }
    if (!formData.department) {
      setError('Department is required');
      return;
    }
    if (!formData.file && !formData.url) {
      setError('Please provide either a file or a URL.');
      return;
    }
    try {
      setUploading(true);
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'file') {
          if (formData.file) {
            formDataToSend.append('file', formData.file);
          }
        } else if (key === 'tags') {
          if (formData.tags) {
            formDataToSend.append('tags', formData.tags.split(',').map(tag => tag.trim()).filter(Boolean));
          }
        } else if (key === 'previewAvailable') {
          formDataToSend.append('previewAvailable', formData.previewAvailable ? 'true' : 'false');
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      if (selectedResource) {
        if (formData.file) {
          await updateResource(selectedResource._id, formDataToSend, true);
        } else {
          const updateObj = { ...formData };
          delete updateObj.file;
          if (updateObj.tags) {
            updateObj.tags = updateObj.tags.split(',').map(tag => tag.trim()).filter(Boolean);
          }
          await updateResource(selectedResource._id, updateObj, false);
        }
        toast.success('Resource updated successfully');
        setEditModal(false);
      } else {
        await uploadResource(formDataToSend);
        toast.success('Resource uploaded successfully');
        setAddModal(false);
      }
      resetForm();
      fetchAllResources();
    } catch (error) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id) => {
    setResourceToDelete(id);
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!resourceToDelete) {
      toast.error('Invalid resource ID');
      setDeleteModal(false);
      return;
    }
    try {
      await deleteResource(resourceToDelete);
      toast.success('Resource deleted successfully');
      await fetchAllResources();
    } catch (error) {
      toast.error(error.message || 'Failed to delete resource');
    } finally {
      setDeleteModal(false);
      setResourceToDelete(null);
    }
  };

  const handleDownload = async (id) => {
    try {
      setDownloadingId(id);
      await downloadResource(id);
    } catch (error) {
      toast.error('Failed to download resource');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleEdit = (resource) => {
    setSelectedResource(resource);
    setFormData({
      title: resource.title || '',
      category: resource.category || '',
      department: resource.department || '',
      description: resource.description || '',
      tags: Array.isArray(resource.tags) ? resource.tags.join(', ') : (resource.tags || ''),
      file: null,
      url: resource.url || '',
      status: resource.status || 'Active',
      previewAvailable: !!resource.previewAvailable
    });
    setEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      department: '',
      description: '',
      tags: '',
      file: null,
      url: ''
    });
    setError('');
    setSelectedResource(null);
  };

  // Add this handler for filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate paginated resources
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
  const paginatedResources = filteredResources.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="page-content pt-0">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                {error && (
                  <div className="alert alert-danger d-flex align-items-center rounded-pill shadow-sm">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                  </div>
                )}
                {success && (
                  <div className="alert alert-success d-flex align-items-center rounded-pill shadow-sm">
                    <i className="fas fa-check-circle me-2"></i>
                    {success}
                  </div>
                )}

                <div className="row mb-4 align-items-center">
                  <div className="col-12 col-md-6 mb-3 mb-md-0">
                    <StyledSearch isDarkMode={isDarkMode}>
                      <div className="input-container">
                        <input
                          className="input"
                          type="text"
                          placeholder="Search resources..."
                          value={filters.search}
                          onChange={e => handleFilterChange('search', e.target.value)}
                          name="search"
                        />
                        <FiSearch className="search-icon" size={18} />
                      </div>
                    </StyledSearch>
                  </div>
                  <div className="col-12 col-md-6 text-end flex justify-end items-center mt-2 mt-md-0">
                    <button
                      className="linear w-full md:w-auto rounded-xl bg-brand-500 px-4 py-2 text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-500 dark:active:bg-brand-600"
                      onClick={() => {
                        resetForm();
                        setAddModal(true);
                      }}
                    >
                      <i className="fas fa-plus me-2"></i> Add New
                    </button>
                  </div>
                </div>

                <section className="mb-6">
                  <h3 className="text-gray-600 dark:text-gray-400 text-sm uppercase mb-2">Filter by Category</h3>
                  <div className="flex flex-wrap gap-2">
                    {LIBRARY_CONFIG.CATEGORIES
                      .filter(category => !["Notes", "Prep Materials", "Model Papers", "Assignments", "Resources", "Video Lectures"].includes(category))
                      .map((category, index) => (
                      <button
                        key={category}
                        className={`linear rounded-xl px-4 py-2 text-base font-medium transition duration-200 w-full sm:w-auto ${
                          filters.category === category
                            ? 'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-500 dark:active:bg-brand-600'
                            : 'bg-lightPrimary text-navy-700 hover:bg-gray-200 active:bg-gray-300 dark:bg-navy-700 dark:text-white dark:hover:bg-navy-600 dark:active:bg-navy-700'
                        }`}
                        onClick={() => handleFilterChange('category', category)}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  {loading ? (
                    <div className="col-span-2 text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">Loading resources...</p>
                    </div>
                  ) : filteredResources.length > 0 ? (
                    paginatedResources.map((resource, index) => (
                      <ResourceCard
                        key={resource._id}
                        resource={resource}
                        isDarkMode={isDarkMode}
                        index={index}
                        isInView={true}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onDownload={handleDownload}
                        downloadingId={downloadingId}
                      />
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">No resources found in this category.</p>
                    </div>
                  )}
                </div>

                {/* Pagination Controls */}
                {filteredResources.length > itemsPerPage && (
                  <div className="flex justify-center mt-6">
                    <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 rounded-l-md border border-gray-300 dark:border-navy-700 bg-white dark:bg-navy-700 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-navy-600 focus:outline-none ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        Previous
                      </button>
                      {[...Array(totalPages)].map((_, idx) => (
                        <button
                          key={idx + 1}
                          onClick={() => setCurrentPage(idx + 1)}
                          className={`px-3 py-2 border-t border-b border-gray-300 dark:border-navy-700 bg-white dark:bg-navy-700 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-navy-600 focus:outline-none ${currentPage === idx + 1 ? 'font-bold bg-brand-100 dark:bg-brand-500/20' : ''}`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-2 rounded-r-md border border-gray-300 dark:border-navy-700 bg-white dark:bg-navy-700 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-navy-600 focus:outline-none ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}

                {/* Add Resource Modal */}
                <Transition appear show={addModal} as={Fragment}>
                  <Dialog as="div" className="fixed inset-0 z-[999] overflow-y-auto" onClose={setAddModal}>
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
                        <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
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
                        <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl dark:bg-navy-800">
                          <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                            Add New Resource
                          </Dialog.Title>
                          <div className="mt-2">
                            <form onSubmit={handleSubmit} className="mt-4">
                              {error && (
                                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                  {error}
                                </div>
                              )}
                              <div className="space-y-4">
                                {/* Title Field */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                                    Title *
                                  </label>
                                  <input
                                    type="text"
                                    name="title"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter resource title"
                                  />
                                </div>

                                {/* Category Field */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                                    Category *
                                  </label>
                                  <select
                                    name="category"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                  >
                                    <option value="">Select Category</option>
                                    {LIBRARY_CONFIG.CATEGORIES.filter(cat => [
                                      'Previous Papers',
                                      'Tools',
                                      'E-books',
                                      'Research Papers',
                                      'Competitive'
                                    ].includes(cat)).map(category => (
                                      <option key={category} value={category}>
                                        {category}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Department Field */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                                    Department *
                                  </label>
                                  <select
                                    name="department"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                  >
                                    <option value="">Select Department</option>
                                    {LIBRARY_CONFIG.DEPARTMENTS.map(dept => (
                                      <option key={dept} value={dept}>
                                        {dept}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* URL Field */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                                    URL
                                  </label>
                                  <input
                                    type="url"
                                    name="url"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                                    value={formData.url}
                                    onChange={handleInputChange}
                                    placeholder="Enter URL"
                                  />
                                </div>

                                {/* Description Field */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                                    Description
                                  </label>
                                  <textarea
                                    name="description"
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                  />
                                </div>

                                {/* File Upload Field */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                                    File
                                  </label>
                                  <input
                                    type="file"
                                    name="file"
                                    onChange={handleFileChange}
                                    className="!z-99 w-full rounded-xl border border-gray-200 bg-white bg-clip-border px-3 py-2 text-sm text-navy-700 outline-none transition duration-200 placeholder:!text-gray-500 focus:border-brand-500 dark:!border-navy-700 dark:!bg-navy-700 dark:text-white dark:placeholder:!text-white dark:focus:border-brand-400 shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-navy-500 dark:file:text-white dark:hover:file:bg-navy-400"
                                  />
                                </div>
                              </div>

                              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                <button
                                  type="button"
                                  className="w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-colors border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-navy-700 dark:text-white dark:border-navy-600 dark:hover:bg-navy-600"
                                  onClick={() => {
                                    setAddModal(false);
                                    resetForm();
                                  }}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  disabled={uploading}
                                  className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                                    isDarkMode
                                      ? 'bg-brand-500 hover:bg-brand-600 text-white disabled:bg-brand-500/50'
                                      : 'bg-brand-500 hover:bg-brand-600 text-white disabled:bg-brand-500/50'
                                  }`}
                                >
                                  {uploading ? (
                                    <>
                                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      <span>{selectedResource ? 'Updating...' : 'Uploading...'}</span>
                                    </>
                                  ) : (
                                    <span>{selectedResource ? 'Update Resource' : 'Upload Resource'}</span>
                                  )}
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </Transition.Child>
                    </div>
                  </Dialog>
                </Transition>

                {/* Edit Resource Modal */}
                <Transition appear show={editModal} as={Fragment}>
                  <Dialog as="div" className="fixed inset-0 z-[999] overflow-y-auto" onClose={() => setEditModal(false)}>
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
                        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-25" />
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
                        <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl dark:bg-navy-800">
                          <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                            <i className="fas fa-edit me-2 text-primary"></i> Edit Resource
                          </Dialog.Title>
                          <div className="mt-4">
                            <form onSubmit={handleSubmit}>
                              <div className="row g-3">
                                <div className="col-md-6">
                                  <div className="form-group">
                                    <label className="form-label fw-bold text-sm text-navy-700 dark:text-white">Title</label>
                                    <input
                                      type="text"
                                      name="title"
                                      className="!z-99 w-full rounded-xl border border-gray-200 bg-white bg-clip-border px-3 py-2 text-sm text-navy-700 outline-none transition duration-200 placeholder:!text-gray-500 focus:border-brand-500 dark:!border-navy-700 dark:!bg-navy-700 dark:text-white dark:placeholder:!text-white dark:focus:border-brand-400 shadow-sm"
                                      value={formData.title}
                                      onChange={handleInputChange}
                                      placeholder="Enter resource title"
                                    />
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="form-group">
                                    <label className="form-label fw-bold text-sm text-navy-700 dark:text-white">Category</label>
                                    <select
                                      className="!z-99 w-full rounded-xl border border-gray-200 bg-white bg-clip-border px-3 py-2 text-sm text-navy-700 outline-none transition duration-200 placeholder:!text-gray-500 focus:border-brand-500 dark:!border-navy-700 dark:!bg-navy-700 dark:text-white dark:placeholder:!text-white dark:focus:border-brand-400 shadow-sm"
                                      value={formData.category}
                                      onChange={handleInputChange}
                                      name="category"
                                    >
                                      <option value="">Select Category</option>
                                      {LIBRARY_CONFIG.CATEGORIES.filter(cat => [
                                        'Previous Papers',
                                        'Tools',
                                        'E-books',
                                        'Research Papers',
                                        'Competitive'
                                      ].includes(cat)).map(category => (
                                        <option key={category} value={category}>
                                          {category}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="form-group">
                                    <label className="form-label fw-bold text-sm text-navy-700 dark:text-white">Department</label>
                                    <select
                                      className="!z-99 w-full rounded-xl border border-gray-200 bg-white bg-clip-border px-3 py-2 text-sm text-navy-700 outline-none transition duration-200 placeholder:!text-gray-500 focus:border-brand-500 dark:!border-navy-700 dark:!bg-navy-700 dark:text-white dark:placeholder:!text-white dark:focus:border-brand-400 shadow-sm"
                                      value={formData.department}
                                      onChange={handleInputChange}
                                    >
                                      <option value="">Select Department</option>
                                      {LIBRARY_CONFIG.DEPARTMENTS.map(dept => (
                                        <option key={dept} value={dept}>
                                          {dept}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                                <div className="col-12">
                                  <div className="form-group">
                                    <label className="form-label fw-bold text-sm text-navy-700 dark:text-white">URL</label>
                                    <input
                                      type="url"
                                      name="url"
                                      className="!z-99 w-full rounded-xl border border-gray-200 bg-white bg-clip-border px-3 py-2 text-sm text-navy-700 outline-none transition duration-200 placeholder:!text-gray-500 focus:border-brand-500 dark:!border-navy-700 dark:!bg-navy-700 dark:text-white dark:placeholder:!text-white dark:focus:border-brand-400 shadow-sm"
                                      value={formData.url}
                                      onChange={handleInputChange}
                                      placeholder="Enter URL"
                                    />
                                  </div>
                                </div>
                                <div className="col-12">
                                  <div className="form-group">
                                    <label className="form-label fw-bold text-sm text-navy-700 dark:text-white">File</label>
                                    <input
                                      type="file"
                                      name="file"
                                      className="!z-99 w-full rounded-xl border border-gray-200 bg-white bg-clip-border px-3 py-2 text-sm text-navy-700 outline-none transition duration-200 placeholder:!text-gray-500 focus:border-brand-500 dark:!border-navy-700 dark:!bg-navy-700 dark:text-white dark:placeholder:!text-white dark:focus:border-brand-400 shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-navy-500 dark:file:text-white dark:hover:file:bg-navy-400"
                                      onChange={handleFileChange}
                                    />
                                  </div>
                                </div>
                                <div className="col-12">
                                  <div className="form-group">
                                    <label className="form-label fw-bold text-sm text-navy-700 dark:text-white">Description</label>
                                    <textarea
                                      name="description"
                                      rows="3"
                                      className="!z-99 w-full rounded-xl border border-gray-200 bg-white bg-clip-border px-3 py-2 text-sm text-navy-700 outline-none transition duration-200 placeholder:!text-gray-500 focus:border-brand-500 dark:!border-navy-700 dark:!bg-navy-700 dark:text-white dark:placeholder:!text-white dark:focus:border-brand-400 shadow-sm"
                                      value={formData.description}
                                      onChange={handleInputChange}
                                      placeholder="Enter description"
                                    ></textarea>
                                  </div>
                                </div>
                                
                                <div className="col-md-6">
                                  <div className="form-group">
                                    <label className="form-label fw-bold text-sm text-navy-700 dark:text-white">Status</label>
                                    <select
                                      className="!z-99 w-full rounded-xl border border-gray-200 bg-white bg-clip-border px-3 py-2 text-sm text-navy-700 outline-none transition duration-200 placeholder:!text-gray-500 focus:border-brand-500 dark:!border-navy-700 dark:!bg-navy-700 dark:text-white dark:placeholder:!text-white dark:focus:border-brand-400 shadow-sm"
                                      value={formData.status}
                                      onChange={handleInputChange}
                                    >
                                      {LIBRARY_CONFIG.STATUSES.map(status => (
                                        <option key={status} value={status}>
                                          {status}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="form-check form-group d-flex align-items-center mt-4">
                                    <input
                                      type="checkbox"
                                      className="form-check-input me-2 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600 dark:border-gray-600 dark:bg-navy-900 dark:checked:bg-brand-400 shadow-sm"
                                      id="previewAvailableCheck"
                                      checked={formData.previewAvailable}
                                      onChange={handleInputChange}
                                      name="previewAvailable"
                                    />
                                    <label className="form-check-label fw-bold text-sm text-navy-700 dark:text-white" htmlFor="previewAvailableCheck">
                                      Preview Available
                                    </label>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4 flex justify-end gap-2">
                                <button
                                  type="button"
                                  className="btn btn-secondary px-4 rounded-pill"
                                  onClick={() => setEditModal(false)}
                                >
                                  <i className="fas fa-times me-2"></i> Cancel
                                </button>
                                <button
                                  type="submit"
                                  className="btn btn-primary px-4 rounded-pill"
                                >
                                  <i className="fas fa-save me-2"></i> Save Changes
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </Transition.Child>
                    </div>
                  </Dialog>
                </Transition>

                {/* View Resource Modal */}
                <Transition appear show={viewModal && selectedResource} as={Fragment}>
                  <Dialog as="div" className="relative z-10" onClose={() => setViewModal(false)}>
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-300"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="ease-in duration-200"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                      <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                          as={Fragment}
                          enter="ease-out duration-300"
                          enterFrom="opacity-0 scale-95"
                          enterTo="opacity-100 scale-100"
                          leave="ease-in duration-200"
                          leaveFrom="opacity-100 scale-100"
                          leaveTo="opacity-0 scale-95"
                        >
                          <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:!bg-navy-800 dark:text-white">
                            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                              <i className="fas fa-eye me-2 text-primary"></i> Resource Details
                            </Dialog.Title>
                            <div className="mt-4">
                              <div className="resource-details">
                                <div className="row g-3">
                                  <div className="col-md-12">
                                    {selectedResource && (
                                      <>
                                        <h4 className="mb-3">{selectedResource?.title}</h4>
                                        <div className="d-flex gap-2 mb-3">
                                          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary">
                                            {selectedResource?.category}
                                          </span>
                                          {/* Add null check for department */} 
                                          {selectedResource?.department && (
                                            <span className="px-3 py-1 rounded-full bg-info/10 text-info">
                                                {selectedResource.department}
                                            </span>
                                          )}
                                          <span className={`px-3 py-1 rounded-full ${
                                            selectedResource?.status === 'Active' 
                                              ? 'bg-success/10 text-success' 
                                              : 'bg-danger/10 text-danger'
                                          }`}>
                                            {selectedResource?.status}
                                          </span>
                                        </div>
                                        {/* Display URL if available */}
                                        {selectedResource?.url && (
                                          <div className="mt-3">
                                            <p className="form-label fw-bold text-sm text-navy-700 dark:text-white">URL:</p>
                                            <a href={selectedResource.url} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline">
                                              {selectedResource.url}
                                            </a>
                                          </div>
                                        )}
                                        {/* Display file name/link if available */}
                                         {selectedResource?.link && !selectedResource?.url && (
                                            <div className="mt-3">
                                                <p className="form-label fw-bold text-sm text-navy-700 dark:text-white">File:</p>
                                                <a href={selectedResource.link} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline">
                                                    {selectedResource.link.substring(selectedResource.link.lastIndexOf('/') + 1) || selectedResource.link} {/* Display file name or full link */}
                                                </a>
                                            </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                  {/* Add other resource details similarly */}
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                              <button
                                type="button"
                                className="btn btn-secondary px-4 rounded-pill"
                                onClick={() => setViewModal(false)}
                              >
                                <i className="fas fa-times me-2"></i> Close
                              </button>
                            </div>
                          </Dialog.Panel>
                        </Transition.Child>
                      </div>
                    </div>
                  </Dialog>
                </Transition>

                {/* Delete Confirmation Modal */}
                <Transition appear show={deleteModal} as={Fragment}>
                  <Dialog as="div" className="fixed inset-0 z-[999] overflow-y-auto" onClose={() => setDeleteModal(false)}>
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
                        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-40 transition-opacity" />
                      </Transition.Child>
                      <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
                      <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                      >
                        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl dark:bg-navy-800">
                          <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white text-center">
                            Confirm Deletion
                          </Dialog.Title>
                          <div className="mt-4 text-center">
                            <p className="text-gray-600 dark:text-gray-300">Are you sure you want to delete this resource? This action cannot be undone.</p>
                          </div>
                          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                              type="button"
                              className="w-full sm:w-auto px-6 py-2 rounded-xl text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-navy-700 dark:text-white dark:border-navy-600 dark:hover:bg-navy-600 transition-colors"
                              onClick={() => setDeleteModal(false)}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              className="w-full sm:w-auto px-6 py-2 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                              onClick={confirmDelete}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </Transition.Child>
                    </div>
                  </Dialog>
                </Transition>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalLibrary; 