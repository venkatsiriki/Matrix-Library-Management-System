import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdSearch,
  MdFilterList,
  MdSort,
  MdCheckCircle,
  MdWarning,
  MdBook,
  MdClose,
  MdCalendarToday,
  MdBarcodeReader,
  MdViewList,
  MdGridOn,
} from 'react-icons/md';
import styled from 'styled-components';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Constants
const LIBRARY_CONFIG = {
  STATUSES: ['Available', 'Out of Stock', 'In Repair', 'Borrowed', 'Lost'],
  VIEW_MODES: ['list', 'grid'],
  CATEGORIES: ['Fiction', 'Technology', 'Science', 'History', 'Biography', 'Mystery', 'Thriller', 'Science Fiction', 'Fantasy', 'Journal'],
};

// Styled Components
const StyledDiv = styled.div`
  min-height: 100vh;
  background: ${(props) => (props.$isDarkMode ? '#0a1437' : '#fff')};
  transition: background 0.3s;
`;

const StyledSearch = styled.div`
  color: ${(props) => (props.$isDarkMode ? '#fff' : '#1a1a1a')};
  background-color: ${(props) => (props.$isDarkMode ? '#1b254b' : '#f3f4f6')};
  border: 1px solid ${(props) => (props.$isDarkMode ? '#1f2937' : '#d1d5db')};
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
`;

// Utility Components
const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseClasses = 'inline-flex items-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-500',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 dark:bg-navy-700 dark:text-gray-300 dark:hover:bg-navy-600',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500',
    warning: 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500',
    purple: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ label, error, isDarkMode, className = '', ...props }) => (
  <div className={className}>
    {label && (
      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        {label}
      </label>
    )}
    <input
      className={`w-full rounded-lg border p-3 text-sm transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500 ${
        isDarkMode
          ? 'bg-navy-700 border-gray-600 text-white placeholder-gray-400'
          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
      } ${error ? 'border-red-500' : ''}`}
      {...props}
    />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className={`relative w-full ${sizes[size]} rounded-xl bg-white p-6 shadow-lg dark:bg-navy-800`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-navy-700 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-navy-700"
          >
            <MdClose className="h-6 w-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Book Card Component
const BookCard = ({ book, onEdit, onView, onDelete, isSelected, onSelect, isDarkMode }) => (
  <div className="group relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-navy-700 dark:bg-navy-800">
    <div className="absolute top-2 left-2">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(book.id)}
        className="rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900"
      />
    </div>
    
    <div className="mb-4 aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
      {book.coverImage ? (
        <img
          src={book.coverImage}
          alt={book.title}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <MdBook className="h-16 w-16 text-gray-400" />
        </div>
      )}
    </div>
    
    <h3 className="mb-1 text-lg font-medium text-navy-700 dark:text-white truncate">
      {book.title}
    </h3>
    <p className="mb-2 text-sm text-gray-500 truncate">{book.author}</p>
    
    <div className="mb-3 flex items-center gap-2">
      <span
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
          book.status === 'Available'
            ? 'bg-green-100 text-green-700'
            : 'bg-amber-100 text-amber-700'
        }`}
      >
        {book.status === 'Available' ? (
          <MdCheckCircle className="h-4 w-4" />
        ) : (
          <MdWarning className="h-4 w-4" />
        )}
        {book.status}
      </span>
    </div>
    
    <div className="flex gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onEdit(book)}
        className="flex-1"
      >
        <MdEdit className="h-4 w-4" />
        Edit
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onView(book)}
        className="flex-1"
      >
        <MdBook className="h-4 w-4" />
        View
      </Button>
    </div>
  </div>
);

// Book Table Component
const BookTable = ({ books, selectedRows, onSelect, onSelectAll, onEdit, onView, onDelete, sortField, sortDirection, onSort, isDarkMode }) => (
  <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
    <table className="w-full min-w-[600px]">
      <thead>
        <tr className="border-b border-gray-200 bg-gray-50 dark:border-navy-700 dark:bg-navy-900">
          <th className="w-[40px] py-4 px-2 sm:px-4">
            <input
              type="checkbox"
              checked={selectedRows.size === books.length}
              onChange={onSelectAll}
              className="rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900"
            />
          </th>
          {['Title', 'Author', 'ISBN/ISNN', 'Category', 'Status', 'Actions'].map((header) => (
            <th
              key={header}
              onClick={() => onSort(header.toLowerCase())}
              className="cursor-pointer py-4 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400"
            >
              <div className="flex items-center gap-1">
                {header}
                {sortField === header.toLowerCase() && (
                  <MdSort
                    className={`h-4 w-4 transition-transform ${
                      sortDirection === 'desc' ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {books.map((book) => (
          <tr
            key={book.id}
            className="border-b border-gray-200 last:border-none hover:bg-gray-50 dark:border-navy-700 dark:hover:bg-navy-700"
          >
            <td className="py-4 px-2 sm:px-4">
              <input
                type="checkbox"
                checked={selectedRows.has(book.id)}
                onChange={() => onSelect(book.id)}
                className="rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900"
              />
            </td>
            <td className="py-4 px-2 sm:px-4">
              <p className="font-medium text-navy-700 dark:text-white text-xs sm:text-base">
                {book.title}
              </p>
            </td>
            <td className="py-4 px-2 sm:px-4 text-xs sm:text-base text-gray-500 dark:text-gray-300">
              {book.author}
            </td>
            <td className="py-4 px-2 sm:px-4">
              <span className="font-mono text-xs sm:text-sm text-blue-600 dark:text-blue-300">
                {book.isbn || book.isnn}
              </span>
            </td>
            <td className="py-4 px-2 sm:px-4">
              <span className="rounded-full bg-gray-100 px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-gray-600 dark:bg-navy-700 dark:text-gray-400">
                {book.categories?.[0] || 'Uncategorized'}
              </span>
            </td>
            <td className="py-4 px-2 sm:px-4">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium ${
                  book.status === 'Available'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {book.status === 'Available' ? (
                  <MdCheckCircle className="h-4 w-4" />
                ) : (
                  <MdWarning className="h-4 w-4" />
                )}
                {book.status}
              </span>
            </td>
            <td className="py-4 px-2 sm:px-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(book)}
                  className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-navy-700"
                  title="Edit"
                >
                  <MdEdit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onView(book)}
                  className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-navy-700"
                  title="View"
                >
                  <MdBook className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDelete(book.id)}
                  className="rounded-full p-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-navy-700"
                  title="Delete"
                >
                  <MdDelete className="h-5 w-5" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };
  
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      
      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            page === currentPage
              ? 'bg-brand-500 text-white'
              : page === '...'
              ? 'text-gray-400 cursor-default'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-navy-700 dark:text-gray-300 dark:hover:bg-navy-600'
          }`}
        >
          {page}
        </button>
      ))}
      
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </div>
  );
};

// Main Component
const BookList = ({ isDarkMode }) => {
  document.title = 'Book Manager';

  // State management
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // UI state
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [sortField, setSortField] = useState('title');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage, setBooksPerPage] = useState(10);
  
  // Filter states
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  
  // Modal states
  const [modals, setModals] = useState({
    add: false,
    edit: false,
    view: false,
    delete: false,
    statusUpdate: false,
    export: false,
    manualAdd: false,
    addJournal: false,
    unidentified: false,
  });
  
  // Form states
  const [selectedBook, setSelectedBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    status: 'Available',
    copies: 1,
    available: 1,
    publishedDate: '',
    coverImage: '',
    publisher: '',
    pageCount: 0,
    categories: [],
    type: 'book',
  });
  
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isbnInput, setIsbnInput] = useState('');
  const [journalForm, setJournalForm] = useState({ isnn: '' });
  const [unidentifiedBooks, setUnidentifiedBooks] = useState([]);
  const [scannedBooksForStatusUpdate, setScannedBooksForStatusUpdate] = useState([]);
  const [newStatusForBulkUpdate, setNewStatusForBulkUpdate] = useState(LIBRARY_CONFIG.STATUSES[0]);
  const [exportStartDate, setExportStartDate] = useState(null);
  const [exportEndDate, setExportEndDate] = useState(null);
  const [journalLoading, setJournalLoading] = useState(false);
  const [journalError, setJournalError] = useState('');
  const [journals, setJournals] = useState([]);
  const [selectedJournal, setSelectedJournal] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Fetch books
  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
              const response = await axios.get(`${API_URL}/api/books`, { timeout: 5000 });
      setBooks(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching books:', err.message);
      setError('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Memoized filtered and paginated books
  const filteredAndPaginatedBooks = useMemo(() => {
    let result = [...books];

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(lowerCaseSearchTerm) ||
          book.author.toLowerCase().includes(lowerCaseSearchTerm) ||
          (book.isbn || book.isnn || '').toLowerCase().includes(lowerCaseSearchTerm) ||
          book.status.toLowerCase().includes(lowerCaseSearchTerm) ||
          (book.description || '').toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    result.sort((a, b) => {
      const fieldA = a[sortField] || '';
      const fieldB = b[sortField] || '';
      if (sortField === 'title' || sortField === 'author') {
        return sortDirection === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
      }
      return sortDirection === 'asc' ? fieldA - fieldB : fieldB - fieldA;
    });

    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    return result.slice(startIndex, endIndex);
  }, [books, searchTerm, sortField, sortDirection, currentPage, booksPerPage]);

  const totalPages = Math.ceil(books.length / booksPerPage);

  // Event handlers
  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleRowSelect = (id) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === books.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(books.map((book) => book.id)));
    }
  };

  const handleDeleteBook = (bookId) => {
    setDeleteTarget(bookId);
    setModals(prev => ({ ...prev, delete: true }));
  };

  const confirmDeleteBook = async () => {
    try {
              await axios.delete(`${API_URL}/api/books/${deleteTarget}`, { timeout: 5000 });
      setBooks((prev) => prev.filter((book) => book.id !== deleteTarget));
      toast.success('Book deleted successfully!');
      setModals(prev => ({ ...prev, delete: false }));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting book:', err.message);
      toast.error('Failed to delete book');
    }
  };

  const handleEditBook = (book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title || '',
      author: book.author || '',
      isbn: book.isbn || book.isnn || '',
      description: book.description || '',
      status: book.status || 'Available',
      copies: book.copies || 1,
      available: book.available || 1,
      publishedDate: book.publishedDate || '',
      coverImage: book.coverImage || '',
      publisher: book.publisher || '',
      pageCount: book.pageCount || 0,
      categories: book.categories || [],
      type: book.type || 'book',
    });
    setModals(prev => ({ ...prev, edit: true }));
  };

  const handleViewBook = (book) => {
    setSelectedBook(book);
    setModals(prev => ({ ...prev, view: true }));
  };

  const handleSaveChanges = async () => {
    try {
              await axios.put(`${API_URL}/api/books/${selectedBook.id}`, formData, { timeout: 5000 });
      setBooks((prev) =>
        prev.map((book) => (book.id === selectedBook.id ? { ...book, ...formData } : book))
      );
      toast.success('Book updated successfully!');
      setModals(prev => ({ ...prev, edit: false }));
      setSelectedBook(null);
    } catch (err) {
      console.error('Error updating book:', err.message);
      toast.error('Failed to update book');
    }
  };

  const handleBulkAction = async (action) => {
    if (action === 'delete') {
      setDeleteTarget(Array.from(selectedRows));
      setModals(prev => ({ ...prev, delete: true }));
    } else if (action === 'export') {
      // Handle export logic
      toast.info('Export functionality coming soon');
    } else if (action === 'updateStatus') {
      setModals(prev => ({ ...prev, statusUpdate: true }));
    }
  };

  const confirmBulkDelete = async () => {
    try {
      await Promise.all(
        deleteTarget.map((id) => axios.delete(`${API_URL}/api/books/${id}`, { timeout: 5000 }))
      );
      setBooks((prev) => prev.filter((book) => !deleteTarget.includes(book.id)));
      toast.success(`${deleteTarget.length} books deleted successfully!`);
      setSelectedRows(new Set());
      setModals(prev => ({ ...prev, delete: false }));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting books:', err.message);
      toast.error('Failed to delete some books');
    }
  };

  // Modal close handlers
  const closeModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
    if (modalName === 'edit') {
      setSelectedBook(null);
      setFormData({
        title: '',
        author: '',
        isbn: '',
        description: '',
        status: 'Available',
        copies: 1,
        available: 1,
        publishedDate: '',
        coverImage: '',
        publisher: '',
        pageCount: 0,
        categories: [],
        type: 'book',
      });
    }
  };

  return (
    <StyledDiv $isDarkMode={isDarkMode} className={isDarkMode ? 'dark bg-navy-900' : ''}>
      <div className={`w-full min-h-screen p-0 bg-white dark:bg-navy-900 transition-colors`}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white sm:text-3xl">
            Book Manager
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Manage your library's book collection
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 max-w-md">
              <div className={`flex items-center rounded-lg border px-4 py-2 text-sm transition-colors focus-within:ring-2 focus-within:ring-brand-500 ${isDarkMode ? 'bg-navy-800 border-navy-700' : 'bg-white border-gray-300'} dark:bg-navy-800 dark:border-navy-700`}>
                <MdSearch className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`flex-1 bg-transparent outline-none text-sm ${isDarkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'} dark:text-white dark:placeholder-gray-400`}
                  aria-label="Search books"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              >
                {viewMode === 'list' ? <MdGridOn className="h-4 w-4" /> : <MdViewList className="h-4 w-4" />}
                {viewMode === 'list' ? 'Grid' : 'List'}
              </Button>
              
              <Button
                variant="primary"
                size="sm"
                onClick={() => setModals(prev => ({ ...prev, add: true }))}
              >
                <MdAdd className="h-4 w-4" />
                Add Book
              </Button>
              
              <Button
                variant="purple"
                size="sm"
                onClick={() => setModals(prev => ({ ...prev, addJournal: true }))}
              >
                <MdAdd className="h-4 w-4" />
                Add Journal
              </Button>
              
              <Button
                variant="warning"
                size="sm"
                onClick={() => setModals(prev => ({ ...prev, statusUpdate: true }))}
              >
                <MdEdit className="h-4 w-4" />
                Update Status
              </Button>
              
              <Button
                variant="success"
                size="sm"
                onClick={() => setModals(prev => ({ ...prev, export: true }))}
              >
                <MdFilterList className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-xl bg-green-50 p-4 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400">
            {success}
          </div>
        )}

        {/* Bulk Actions */}
        {selectedRows.size > 0 && (
          <div className="mb-4 flex items-center gap-4 rounded-xl bg-gray-50 px-4 py-3 dark:bg-black">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {selectedRows.size} items selected
            </span>
            <div className="flex gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleBulkAction('delete')}
              >
                Delete Selected
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleBulkAction('export')}
              >
                Export Selected
              </Button>
              <Button
                variant="warning"
                size="sm"
                onClick={() => handleBulkAction('updateStatus')}
              >
                Update Status
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Loading books...</p>
            </div>
          </div>
        )}

        {/* Book Display */}
        {!loading && (
          <>
            {viewMode === 'list' ? (
              <BookTable
                books={filteredAndPaginatedBooks}
                selectedRows={selectedRows}
                onSelect={handleRowSelect}
                onSelectAll={handleSelectAll}
                onEdit={handleEditBook}
                onView={handleViewBook}
                onDelete={handleDeleteBook}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                isDarkMode={isDarkMode}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filteredAndPaginatedBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onEdit={handleEditBook}
                    onView={handleViewBook}
                    onDelete={handleDeleteBook}
                    isSelected={selectedRows.has(book.id)}
                    onSelect={handleRowSelect}
                    isDarkMode={isDarkMode}
                  />
                ))}
              </div>
            )}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}

        {/* Modals */}
        <Modal
          isOpen={modals.delete}
          onClose={() => closeModal('delete')}
          title="Confirm Delete"
          size="sm"
        >
          <div className="mb-4 text-gray-700 dark:text-gray-300">
            {Array.isArray(deleteTarget)
              ? `Are you sure you want to delete ${deleteTarget.length} books?`
              : 'Are you sure you want to delete this book?'}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => closeModal('delete')}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={Array.isArray(deleteTarget) ? confirmBulkDelete : confirmDeleteBook}
            >
              Delete
            </Button>
          </div>
        </Modal>

        <Modal
          isOpen={modals.view}
          onClose={() => closeModal('view')}
          title="Book Details"
          size="md"
        >
          {selectedBook && (
            <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong>Title:</strong> {selectedBook.title}
                </div>
                <div>
                  <strong>Author:</strong> {selectedBook.author}
                </div>
                <div>
                  <strong>{selectedBook.type === 'journal' ? 'ISNN' : 'ISBN'}:</strong>{' '}
                  {selectedBook.isbn || selectedBook.isnn}
                </div>
                <div>
                  <strong>Category:</strong> {selectedBook.categories?.join(', ') || 'N/A'}
                </div>
                <div>
                  <strong>Status:</strong> {selectedBook.status}
                </div>
                <div>
                  <strong>Copies:</strong> {selectedBook.copies}
                </div>
                <div>
                  <strong>Available:</strong> {selectedBook.available}
                </div>
                <div>
                  <strong>Published Date:</strong> {selectedBook.publishedDate || 'N/A'}
                </div>
                <div>
                  <strong>Publisher:</strong> {selectedBook.publisher || 'N/A'}
                </div>
                <div>
                  <strong>Page Count:</strong> {selectedBook.pageCount || 'N/A'}
                </div>
              </div>
              {selectedBook.description && (
                <div>
                  <strong>Description:</strong>
                  <p className="mt-1">{selectedBook.description}</p>
                </div>
              )}
              {selectedBook.coverImage && (
                <div>
                  <strong>Cover Image:</strong>
                  <img
                    src={selectedBook.coverImage}
                    alt={selectedBook.title}
                    className="mt-2 h-32 w-auto rounded-lg"
                  />
                </div>
              )}
            </div>
          )}
        </Modal>

        <Modal
          isOpen={modals.edit}
          onClose={() => closeModal('edit')}
          title="Edit Book"
          size="lg"
        >
          <form onSubmit={(e) => { e.preventDefault(); handleSaveChanges(); }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                isDarkMode={isDarkMode}
              />
              <Input
                label="Author"
                value={formData.author}
                onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                required
                isDarkMode={isDarkMode}
              />
              <Input
                label="ISBN"
                value={formData.isbn}
                readOnly
                isDarkMode={isDarkMode}
                className="bg-gray-100"
              />
              <Input
                label="Publisher"
                value={formData.publisher}
                onChange={(e) => setFormData(prev => ({ ...prev, publisher: e.target.value }))}
                isDarkMode={isDarkMode}
              />
              <Input
                label="Published Date"
                type="date"
                value={formData.publishedDate}
                onChange={(e) => setFormData(prev => ({ ...prev, publishedDate: e.target.value }))}
                isDarkMode={isDarkMode}
              />
              <Input
                label="Page Count"
                type="number"
                value={formData.pageCount}
                onChange={(e) => setFormData(prev => ({ ...prev, pageCount: parseInt(e.target.value) || 0 }))}
                min="0"
                isDarkMode={isDarkMode}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={`w-full rounded-lg border p-3 text-sm transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500 ${
                  isDarkMode
                    ? 'bg-navy-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                rows="4"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {LIBRARY_CONFIG.CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        categories: prev.categories.includes(category)
                          ? prev.categories.filter(c => c !== category)
                          : [...prev.categories, category]
                      }));
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      formData.categories.includes(category)
                        ? 'bg-brand-500 text-white'
                        : isDarkMode
                          ? 'bg-navy-700 text-gray-300 border border-gray-600 hover:bg-navy-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Cover Image URL"
              type="url"
              value={formData.coverImage}
              onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
              placeholder="https://"
              isDarkMode={isDarkMode}
            />

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => closeModal('edit')}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>

        {/* Add more modals as needed - keeping the structure clean */}
        <Modal
          isOpen={modals.add}
          onClose={() => closeModal('add')}
          title="Add New Books"
          size="md"
        >
          <div className="space-y-4">
            <Input
              label="Scan or Enter ISBNs (comma-separated)"
              value={isbnInput}
              onChange={(e) => setIsbnInput(e.target.value)}
              placeholder="Scan ISBNs here..."
              isDarkMode={isDarkMode}
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => closeModal('add')}>
                Cancel
              </Button>
              <Button variant="primary" disabled={!isbnInput.trim()}>
                Add Books
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={modals.addJournal}
          onClose={() => closeModal('addJournal')}
          title="Add New Journals"
          size="md"
        >
          <div className="space-y-4">
            <Input
              label="Enter ISNNs (comma-separated)"
              value={journalForm.isnn}
              onChange={(e) => setJournalForm({ isnn: e.target.value })}
              placeholder="Enter ISNNs here..."
              isDarkMode={isDarkMode}
            />
            {journalError && (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {journalError}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => closeModal('addJournal')}>
                Cancel
              </Button>
              <Button variant="purple" disabled={!journalForm.isnn.trim()}>
                Add Journals
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={modals.statusUpdate}
          onClose={() => closeModal('statusUpdate')}
          title="Update Book Status"
          size="md"
        >
          <div className="space-y-4">
            <Input
              label="Enter ISBNs/ISNNs (comma-separated)"
              value={isbnInput}
              onChange={(e) => setIsbnInput(e.target.value)}
              placeholder="Enter ISBNs/ISNNs here..."
              isDarkMode={isDarkMode}
            />
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                New Status
              </label>
              <select
                value={newStatusForBulkUpdate}
                onChange={(e) => setNewStatusForBulkUpdate(e.target.value)}
                className={`w-full rounded-lg border p-3 text-sm transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500 ${
                  isDarkMode
                    ? 'bg-navy-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {LIBRARY_CONFIG.STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => closeModal('statusUpdate')}>
                Cancel
              </Button>
              <Button variant="warning" disabled={!isbnInput.trim()}>
                Update Status
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={modals.export}
          onClose={() => closeModal('export')}
          title="Export Books"
          size="sm"
        >
          <div className="space-y-4">
            <Input
              label="From Date"
              type="date"
              value={exportStartDate ? exportStartDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setExportStartDate(e.target.value ? new Date(e.target.value) : null)}
              isDarkMode={isDarkMode}
            />
            <Input
              label="To Date"
              type="date"
              value={exportEndDate ? exportEndDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setExportEndDate(e.target.value ? new Date(e.target.value) : null)}
              isDarkMode={isDarkMode}
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => closeModal('export')}>
                Cancel
              </Button>
              <Button variant="success">
                Export
              </Button>
            </div>
          </div>
        </Modal>
      </div>
      
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop 
        closeOnClick 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
      />
    </StyledDiv>
  );
};

export default BookList;