import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  MdAdd,
  MdDelete,
  MdWarning,
  MdCheckCircle,
  MdVisibility,
  MdSearch,
  MdDownload,
} from "react-icons/md";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Constants
const libraries = ["Central Library", "Reference Section"];
const departments = ["Electronics", "Mechanical", "Computers", "Competitive Exams", "Literature", "History", "Science", "Others"];
const API_BASE_URL = 'http://localhost:5000/api';

const RackManager = () => {
  const [racks, setRacks] = useState([]);
  const [books, setBooks] = useState([]);
  const [state, setState] = useState({
    selectedLibrary: "Central Library",
    selectedDepartment: "",
    selectedRack: "",
    selectedBooks: [],
    rackData: [],
    searchTerm: "",
    bookSearch: "",
    modal: false,
    rackToRemove: null,
    editRackModal: false,
    newRackName: "",
    editRackId: null,
    showBookDetails: null,
    isLoading: false,
    selectionStatus: {},
    addRackModal: false,
    deleteRackModal: false,
    selectedBookToRemove: null,
    rackFormModal: false,
    scannedBook: null,
    isScanning: false,
    rackSections: {},
    addBooksModal: false,
    showLibraryDropdown: false,
    currentPage: 1,
    itemsPerPage: 10,
    currentScanSessionBooks: [],
    removeBooksModal: false,
    removeBookSearch: "",
    removeConfirmationModalVisible: false,
    booksFoundToRemove: [],
    newRackDepartment: "",
    mobileMenuOpen: false,
  });

  const mobileMenuRef = useRef(null);

  // Fetch books, racks, and assignments on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true }));
        const [booksResponse, racksResponse, assignmentsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/books`),
          axios.get(`${API_BASE_URL}/racks`),
          axios.get(`${API_BASE_URL}/rack-assignments`),
        ]);
        setBooks(booksResponse.data);
        setRacks(racksResponse.data);
        setState(prev => ({
          ...prev,
          rackData: assignmentsResponse.data,
          isLoading: false,
        }));
      } catch (error) {
        toast.error('Error fetching data from server');
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };
    fetchData();
  }, []);

  // Update rack usage when rackData changes
  useEffect(() => {
    const updatedRacks = racks.map(rack => {
      const totalUsed = state.rackData.filter(book => book.rack === rack.id).length;
      return { ...rack, used: totalUsed };
    });
    setRacks(updatedRacks);
  }, [state.rackData]);

  const handleError = useCallback(message => {
    toast.error(message, { position: "top-right", autoClose: 5000 });
  }, []);

  const handleSuccess = useCallback(message => {
    toast.success(message, { position: "top-right", autoClose: 3000 });
  }, []);

  const handleAddRack = async () => {
    if (!state.newRackName) {
      handleError("Please enter a rack name.");
      return;
    }
    if (!state.newRackDepartment) {
      handleError("Please select a department.");
      return;
    }
    const formattedName = state.newRackName.startsWith("Rack - ") ? state.newRackName : `Rack - ${state.newRackName}`;

    if (racks.some(rack => rack.id === formattedName)) {
      handleError("This rack name already exists.");
      return;
    }
    try {
      const newRack = {
        id: formattedName,
        capacity: 50,
        used: 0,
        department: state.newRackDepartment,
        library: state.selectedLibrary,
      };
      await axios.post(`${API_BASE_URL}/racks`, newRack);
      setRacks(prevRacks => [...prevRacks, newRack]);
      setState(prev => ({
        ...prev,
        addRackModal: false,
        newRackName: "",
        newRackDepartment: "",
      }));
      handleSuccess(`Rack ${formattedName} added successfully!`);
    } catch (error) {
      handleError('Error adding rack');
    }
  };

  const handleRenameRack = async () => {
    if (!state.newRackName) {
      handleError("Please enter a new rack name.");
      return;
    }
    const formattedName = state.newRackName.startsWith("Rack - ") ? state.newRackName : `Rack - ${state.newRackName}`;

    if (racks.some(rack => rack.id === formattedName)) {
      handleError("This rack name already exists.");
      return;
    }
    try {
      await axios.put(`${API_BASE_URL}/racks/${state.editRackId}`, { newId: formattedName });
      setRacks(prevRacks => prevRacks.map(rack => 
        rack.id === state.editRackId ? { ...rack, id: formattedName } : rack
      ));
      setState(prev => ({
        ...prev,
        rackData: prev.rackData.map(book =>
          book.rack === prev.editRackId ? { ...book, rack: formattedName } : book
        ),
        editRackModal: false,
        newRackName: "",
        editRackId: null,
      }));
      handleSuccess(`Rack renamed to ${formattedName} successfully!`);
    } catch (error) {
      handleError('Error renaming rack');
    }
  };

  const handleRemoveRack = async () => {
    if (!state.rackToRemove) return;

    try {
      const rackBooks = state.rackData.filter(book => book.rack === state.rackToRemove);
      if (rackBooks.length > 0) {
        handleError("Please remove all books from the rack before deleting it");
        return;
      }
      await axios.delete(`${API_BASE_URL}/racks/${state.rackToRemove}`);
      setRacks(prevRacks => prevRacks.filter(rack => rack.id !== state.rackToRemove));
      setState(prev => ({
        ...prev,
        deleteRackModal: false,
        rackToRemove: null,
      }));
      handleSuccess(`Rack ${state.rackToRemove} deleted successfully!`);
    } catch (error) {
      handleError('Error deleting rack');
    }
  };

  const handleISBNScan = async (identifier) => {
    const identifierList = identifier.split(',').map(id => id.trim().replace(/[^0-9X]/gi, ''));
    const validIdentifiers = identifierList.filter(id => /^(?:\d{10}|\d{13}|\d{9}X)$/i.test(id));
    if (validIdentifiers.length === 0) {
      handleError('Invalid ISBN/ISNN format. Please enter valid 10 or 13 digit identifiers separated by commas');
      return;
    }
    setState(prev => ({ ...prev, isScanning: true }));
    try {
      const booksFound = [];
      for (const id of validIdentifiers) {
        // Try isbn first, then isnn
        let response = await axios.get(`${API_BASE_URL}/books/isbn/${id}`);
        let book = response.data;
        if (response.status === 404) {
          response = await axios.get(`${API_BASE_URL}/books/isnn/${id}`);
          book = response.data;
        }
        if (response.status === 200 && book.id) {
          booksFound.push({
            ...book,
            id: `scanned-${book.id}-${Date.now()}`, // Unique ID for frontend
            originalBookId: book.id, // Store Book.id for RackAssignment
            assigned: false,
          });
        }
      }
      if (booksFound.length > 0) {
        setState(prev => ({
          ...prev,
          bookSearch: '',
          currentScanSessionBooks: booksFound,
          scannedBook: booksFound[0],
          isScanning: false,
          addBooksModal: false,
        }));
        handleSuccess(`Successfully scanned ${booksFound.length} item(s)!`);
      } else {
        handleError('No books or journals found for the provided identifiers');
        setState(prev => ({ ...prev, isScanning: false }));
      }
    } catch (error) {
      console.error('Error in handleISBNScan:', error.response?.data || error.message);
      handleError(error.response?.data?.message || 'Error scanning items');
      setState(prev => ({ ...prev, isScanning: false }));
    }
  };

  const handleAssignBooks = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      if (!state.selectedDepartment || !state.selectedRack || state.currentScanSessionBooks.length === 0) {
        throw new Error("Please select a department and rack, and scan at least one item.");
      }
      const rack = racks.find(r => r.id === state.selectedRack);
      if (!rack) {
        throw new Error("Selected rack not found.");
      }
      const unassignedBooks = state.currentScanSessionBooks.filter(book => !book.assigned);
      const currentRackBooks = state.rackData.filter(book => book.rack === state.selectedRack).length;
      if (currentRackBooks + unassignedBooks.length > rack.capacity) {
        throw new Error("Rack capacity exceeded.");
      }
      const newAssignments = unassignedBooks.map(book => {
        const requiredFields = ['title', 'originalBookId'];
        const missingFields = requiredFields.filter(field => !book[field]);
        if (missingFields.length > 0) {
          throw new Error(`Item ${book.isbn || book.isnn || 'unknown'} is missing required fields: ${missingFields.join(', ')}`);
        }
        return {
          bookId: book.originalBookId, // Use originalBookId, not id
          title: book.title,
          isbn: book.isbn || undefined,
          isnn: book.isnn || undefined,
          author: book.author || 'Unknown Author',
          categories: book.categories || [],
          publishedDate: book.publishedDate || '',
          rack: state.selectedRack,
          department: state.selectedDepartment,
          library: state.selectedLibrary,
        };
      });
      console.log('Sending payload to /api/rack-assignments:', JSON.stringify(newAssignments, null, 2));
      const response = await axios.post(`${API_BASE_URL}/rack-assignments`, newAssignments);
      console.log('Response from /api/rack-assignments:', JSON.stringify(response.data, null, 2));
      setState(prev => ({
        ...prev,
        rackData: [...prev.rackData, ...response.data],
        currentScanSessionBooks: prev.currentScanSessionBooks.map(book =>
          unassignedBooks.some(unassigned => unassigned.id === book.id) ? { ...book, assigned: true } : book
        ),
        selectedDepartment: "",
        selectedRack: "",
        scannedBook: null,
        currentScanSessionBooks: [],
        addBooksModal: false,
        isLoading: false,
      }));
      handleSuccess("Items assigned successfully!");
    } catch (error) {
      console.error('Error in handleAssignBooks:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      handleError(error.response?.data?.message || error.message || 'Error assigning items');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleDeleteBookFromRack = async (bookId) => {
    try {
      await axios.delete(`${API_BASE_URL}/rack-assignments/${bookId}`);
      setState(prev => ({
        ...prev,
        rackData: prev.rackData.filter(book => book._id !== bookId),
        showBookDetails: prev.showBookDetails ? prev.showBookDetails.filter(book => book._id !== bookId) : null,
      }));
      handleSuccess('Book removed from rack successfully!');
    } catch (error) {
      handleError('Error removing book from rack');
    }
  };

  const handleRemoveBookByIsbn = async () => {
    if (!state.removeBookSearch) {
      handleError("Please enter an ISBN.");
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    const isbnToRemove = state.removeBookSearch.trim().replace(/[^0-9X]/gi, '');

    try {
      const response = await axios.get(`${API_BASE_URL}/rack-assignments`, { params: { isbn: isbnToRemove, library: state.selectedLibrary } });
      const booksFound = response.data;

      if (booksFound.length === 0) {
        handleError(`No books found with ISBN ${isbnToRemove} in the selected library.`);
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      setState(prev => ({
        ...prev,
        booksFoundToRemove: booksFound,
        removeBooksModal: false,
        removeBookSearch: "",
        removeConfirmationModalVisible: true,
        isLoading: false,
      }));
    } catch (error) {
      handleError('Error searching for books to remove');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const filteredRacks = useMemo(() => {
    if (!state.selectedDepartment) return racks;
    return racks.filter(rack => rack.department === state.selectedDepartment);
  }, [racks, state.selectedDepartment]);

  const paginatedRackData = useMemo(() => {
    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = startIndex + state.itemsPerPage;
    return state.rackData
      .filter(book => book.library === state.selectedLibrary)
      .slice(startIndex, endIndex);
  }, [state.rackData, state.currentPage, state.itemsPerPage, state.selectedLibrary]);

  const totalBookPages = Math.ceil(
    state.rackData.filter(book => book.library === state.selectedLibrary).length / state.itemsPerPage
  );

  const handleBookPageChange = (newPage) => {
    setState(prev => ({ ...prev, currentPage: newPage }));
  };

  return (
    <div className="mt-3">
      <ToastContainer />
      <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
        <h4 className="text-xl font-bold text-navy-700 dark:text-white text-center sm:text-left">
          Rack Management
        </h4>
      </div>

      <div className="mb-6 rounded-[20px] bg-white p-2 sm:p-4 shadow-sm dark:bg-navy-700">
        <div className="mb-6 flex flex-col sm:flex-row flex-wrap items-center justify-between gap-2 gap-y-2">
          <div className="flex flex-col sm:flex-row sm:flex-nowrap items-center w-full gap-3 sm:gap-4">
            <div className="relative w-full sm:flex-grow min-w-0 max-w-lg">
              <MdSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search books..."
                value={state.searchTerm}
                onChange={(e) => setState({ ...state, searchTerm: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-8 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
              />
            </div>
            <div className="relative w-full sm:w-auto min-w-[160px]">
              <select
                value={state.selectedLibrary}
                onChange={e => setState(prev => ({
                  ...prev,
                  selectedLibrary: e.target.value,
                  currentPage: 1
                }))}
                className="appearance-none [-webkit-appearance:none] [-moz-appearance:none] pr-8 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all bg-white text-brand-500 shadow-sm dark:bg-navy-600 dark:text-white border-0 focus:ring-2 focus:ring-brand-500 focus:outline-none h-[42px] w-full sm:w-auto"
              >
                {libraries.map(library => (
                  <option key={library} value={library}>{library}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500 dark:text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <div className="flex flex-col sm:flex-row flex-nowrap items-center w-full sm:w-auto gap-3 sm:gap-4">
              <button
                onClick={() => setState({ ...state, addBooksModal: true })}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-2 py-2 text-xs sm:px-4 sm:py-3 sm:text-sm font-medium text-white transition-all hover:bg-brand-600 active:bg-brand-700"
              >
                <MdAdd className="h-5 w-5" />
                Add Books
              </button>
              <button
                onClick={() => setState(prev => ({ ...prev, removeBooksModal: true }))}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-red-500 px-2 py-2 text-xs sm:px-4 sm:py-3 sm:text-sm font-medium text-white transition-all hover:bg-red-600 active:bg-red-700"
              >
                <MdDelete className="h-5 w-5" />
                Remove Books
              </button>
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-green-500 px-2 py-2 text-xs sm:px-4 sm:py-3 sm:text-sm font-medium text-white transition-all hover:bg-green-600 active:bg-green-700">
                <MdDownload className="h-5 w-5" />
                Export
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
          <table className="w-full min-w-[700px] sm:min-w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-navy-700 dark:bg-navy-900">
                <th className="py-2 sm:py-4 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">BOOK NAME</th>
                <th className="py-2 sm:py-4 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">ISBN</th>
                <th className="py-2 sm:py-4 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">AUTHOR</th>
                <th className="py-2 sm:py-4 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">LIBRARY</th>
                <th className="py-2 sm:py-4 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">DEPARTMENT</th>
                <th className="py-2 sm:py-4 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">RACK</th>
                <th className="py-2 sm:py-4 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRackData.length === 0 ? (
                <tr>
                  <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center" colSpan="7">
                    No books found.
                  </td>
                </tr>
              ) : (
                paginatedRackData.map((book) => (
                  <tr
                    key={book._id}
                    className="border-b border-gray-200 last:border-none hover:bg-gray-50 dark:border-navy-700 dark:hover:bg-navy-700"
                  >
                    <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-navy-700 dark:text-white">{book.title}</td>
                    <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-mono text-gray-600 dark:text-gray-400">{book.isbn}</td>
                    <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">{book.author}</td>
                    <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">{book.library}</td>
                    <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">{book.department}</td>
                    <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">{book.rack}</td>
                    <td className="py-2 sm:py-4 px-2 sm:px-4 text-left text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      <button
                        onClick={() => handleDeleteBookFromRack(book._id)}
                        className="rounded-full p-2 text-red-600 hover:bg-gray-100 dark:hover:bg-navy-800"
                      >
                        <MdDelete className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalBookPages > 1 && (
          <div className="flex flex-wrap items-center justify-end gap-2 mt-4">
            <button
              onClick={() => handleBookPageChange(state.currentPage - 1)}
              disabled={state.currentPage === 1}
              className="rounded-lg bg-gray-100 px-3 py-2 text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-50 dark:bg-navy-700 dark:text-gray-300 dark:hover:bg-navy-600"
            >
              Previous
            </button>
            {[...Array(totalBookPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handleBookPageChange(index + 1)}
                className={`rounded-lg px-3 py-2 text-xs sm:text-sm font-medium ${
                  state.currentPage === index + 1
                    ? "bg-brand-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-navy-700 dark:text-gray-300 dark:hover:bg-navy-600"
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => handleBookPageChange(state.currentPage + 1)}
              disabled={state.currentPage === totalBookPages}
              className="rounded-lg bg-gray-100 px-3 py-2 text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-50 dark:bg-navy-700 dark:text-gray-300 dark:hover:bg-navy-600"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <div className="mb-4 flex flex-col sm:flex-row items-center justify-between mt-6 gap-2 sm:gap-0">
        <h4 className="text-xl font-bold text-navy-700 dark:text-white text-center sm:text-left">
          Racks
        </h4>
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <button
            onClick={() => setState(prev => ({ ...prev, addRackModal: true }))}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-2 py-2 text-xs sm:px-4 sm:py-3 sm:text-sm font-medium text-white transition-all hover:bg-brand-600 active:bg-brand-700 w-full sm:w-auto"
          >
            <MdAdd className="h-5 w-5" />
            Add New Rack
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {racks.filter(rack => rack.library === state.selectedLibrary).map((rack) => {
          const totalCapacity = rack.capacity || 50;
          const totalUsed = rack.used || 0;
          const percentage = (totalUsed / totalCapacity) * 100;

          return (
            <div
              key={rack.id}
              className="rounded-[20px] bg-white p-4 dark:bg-navy-700"
            >
              <div className="mb-4 flex items-center justify-between">
                <h5 className="text-lg font-bold text-navy-700 dark:text-white">
                  {rack.id}
                </h5>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const rackBooks = state.rackData.filter(
                        (book) => book.rack === rack.id && book.library === state.selectedLibrary
                      );
                      setState((prev) => ({
                        ...prev,
                        showBookDetails: rackBooks,
                        modal: true,
                        rackToRemove: rack.id,
                      }));
                    }}
                    className="rounded p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-navy-800"
                  >
                    <MdVisibility className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setState(prev => ({
                      ...prev,
                      deleteRackModal: true,
                      rackToRemove: rack.id,
                    }))}
                    className="rounded p-1 text-red-600 hover:bg-gray-100 dark:hover:bg-navy-800"
                  >
                    <MdDelete className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div
                  className="rounded-lg bg-gray-50 p-3 dark:bg-navy-800"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-navy-700 dark:text-white">
                        Total Usage
                      </span>
                      {percentage >= 90 ? (
                        <MdWarning className="h-5 w-5 text-amber-500" />
                      ) : (
                        <MdCheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>
                  {(rack.library || rack.department) && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {rack.library}{rack.library && rack.department && ' - '}{rack.department}
                    </p>
                  )}
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {totalUsed} / {totalCapacity} books
                    </span>
                    <span
                      className={`font-medium ${
                        percentage >= 90 ? "text-amber-500" : "text-green-500"
                      }`}
                    >
                      {Math.round(percentage)}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-navy-900">
                    <div
                      className={`h-full rounded-full ${
                        percentage >= 90 ? "bg-amber-500" : "bg-green-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {state.addRackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-navy-700">
            <h3 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">
              Add New Rack
            </h3>
            <input
              type="text"
              value={state.newRackName}
              onChange={(e) =>
                setState((prev) => ({ ...prev, newRackName: e.target.value }))
              }
              placeholder="Enter rack name"
              className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none dark:border-navy-600 dark:bg-navy-800 dark:text-white"
            />
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Department
              </label>
              <select
                value={state.newRackDepartment}
                onChange={(e) => setState(prev => ({ ...prev, newRackDepartment: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-brand-500 focus:outline-none dark:border-navy-600 dark:bg-navy-800 dark:text-white"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept} className="dark:bg-navy-800">
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() =>
                  setState((prev) => ({ ...prev, addRackModal: false }))
                }
                className="rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRack}
                className="rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600"
              >
                Add Rack
              </button>
            </div>
          </div>
        </div>
      )}

      {state.editRackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-navy-700">
            <h3 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">
              Edit Rack
            </h3>
            <input
              type="text"
              value={state.newRackName}
              onChange={(e) =>
                setState((prev) => ({ ...prev, newRackName: e.target.value }))
              }
              placeholder="Enter new rack name"
              className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() =>
                  setState((prev) => ({ ...prev, editRackModal: false }))
                }
                className="rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameRack}
                className="rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {state.modal && state.showBookDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 dark:bg-navy-700">
            <h3 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">
              Books in Rack {state.rackToRemove}
            </h3>
            <div className="max-h-96 overflow-y-auto">
              {state.showBookDetails.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <MdWarning className="mb-2 h-12 w-12 text-amber-500" />
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    There are no books in this rack.
                  </p>
                </div>
              ) : (
                state.showBookDetails.map((book) => (
                  <div
                    key={book._id}
                    className="mb-3 rounded-lg border border-gray-200 p-3 dark:border-navy-600"
                  >
                    <div className="flex items-center justify-between">
                      <h6 className="font-medium text-navy-700 dark:text-white">
                        {book.title}
                      </h6>
                      <button
                        onClick={() => handleDeleteBookFromRack(book._id)}
                        className="rounded p-1 text-red-600 hover:bg-gray-100 dark:hover:bg-navy-800"
                      >
                        <MdDelete className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    modal: false,
                    showBookDetails: null,
                    rackToRemove: null,
                  }))
                }
                className="rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {state.deleteRackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-navy-700">
            <h3 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">
              Delete Rack
            </h3>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Rack to Delete
              </label>
              <select
                value={state.rackToRemove || ""}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, rackToRemove: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-brand-500 focus:outline-none dark:border-navy-600 dark:bg-navy-800 dark:text-white"
              >
                <option value="">Select a rack</option>
                {racks.map((rack) => (
                  <option key={rack.id} value={rack.id} className="dark:bg-navy-800">
                    {rack.id}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() =>
                  setState((prev) => ({ ...prev, deleteRackModal: false, rackToRemove: null }))
                }
                className="rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveRack}
                className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
              >
                Delete Rack
              </button>
            </div>
          </div>
        </div>
      )}

      {state.removeConfirmationModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-navy-700">
            <h3 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">
              Confirm Removal
            </h3>
            <div className="mb-6 max-h-40 overflow-y-auto rounded-lg border border-gray-200 p-3 dark:border-navy-600">
              <p className="mb-2 text-sm font-medium text-navy-700 dark:text-white">Books Found:</p>
              {state.booksFoundToRemove.length === 0 ? (
                <div className="text-sm text-gray-600 dark:text-gray-400">No books to remove.</div>
              ) : (
                state.booksFoundToRemove.map(book => (
                  <div key={book._id} className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{book.title} ({book.isbn})</span>
                    <button
                      onClick={() => setState(prev => ({
                        ...prev,
                        booksFoundToRemove: prev.booksFoundToRemove.filter(b => b._id !== book._id)
                      }))}
                      className="rounded p-1 text-red-600 hover:bg-gray-100 dark:hover:bg-navy-800"
                    >
                      <MdDelete className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setState(prev => ({ ...prev, removeConfirmationModalVisible: false, booksFoundToRemove: [] }))}
                className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-navy-700"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    setState(prev => ({ ...prev, isLoading: true }));
                    for (const book of state.booksFoundToRemove) {
                      await axios.delete(`${API_BASE_URL}/rack-assignments/${book._id}`);
                    }
                    setState(prev => ({
                      ...prev,
                      rackData: prev.rackData.filter(book => !prev.booksFoundToRemove.some(b => b._id === book._id)),
                      removeConfirmationModalVisible: false,
                      booksFoundToRemove: [],
                      isLoading: false,
                    }));
                    handleSuccess("Selected book(s) removed successfully!");
                  } catch (error) {
                    handleError('Error removing books');
                    setState(prev => ({ ...prev, isLoading: false }));
                  }
                }}
                disabled={state.booksFoundToRemove.length === 0 || state.isLoading}
                className="rounded-lg bg-red-500 px-3 py-1.5 text-sm text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete Selected Books
              </button>
            </div>
          </div>
        </div>
      )}

      {state.addBooksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-navy-700">
            <h3 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">
              Add Books
            </h3>
            <div className="mb-6">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 transform">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 7V5C3 3.89543 3.89543 3 5 3H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M17 3H19C20.1046 3 21 3.89543 21 5V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M21 17V19C21 20.1046 20.1046 21 19 21H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M7 21H5C3.89543 21 3 20.1046 3 19V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={state.bookSearch}
                    onChange={(e) =>
                      setState((prev) => ({ ...prev, bookSearch: e.target.value }))
                    }
                    placeholder="Scan or enter ISBN (with spaces or commas)"
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-brand-500 focus:outline-none dark:border-navy-600 dark:bg-navy-800 dark:text-white text-gray-900"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleISBNScan(state.bookSearch);
                      }
                    }}
                  />
                </div>
                <button
                  onClick={() => handleISBNScan(state.bookSearch)}
                  disabled={state.isScanning}
                  className="rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {state.isScanning ? 'Scanning...' : 'Scan'}
                </button>
              </div>
            </div>
            {state.currentScanSessionBooks.length > 0 && (
              <div className="mb-4 max-h-40 overflow-y-auto rounded-lg border border-gray-200 p-3 dark:border-navy-600">
                <p className="mb-2 text-sm font-medium text-navy-700 dark:text-white">Scanned Books:</p>
                {state.currentScanSessionBooks.map(book => (
                  <div key={book.id} className="text-sm text-gray-600 dark:text-gray-400">
                    {book.title} ({book.isbn})
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end">
              <button
                onClick={() =>
                  setState((prev) => ({ ...prev, addBooksModal: false, bookSearch: '', currentScanSessionBooks: [], scannedBook: null }))
                }
                className="rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {state.scannedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-sm rounded-lg bg-white p-4 dark:bg-navy-700">
            <h3 className="mb-4 text-base font-bold text-navy-700 dark:text-white">
              Book Details & Assignment
            </h3>
            <div className="mb-6 max-h-[200px] overflow-y-auto">
              {state.currentScanSessionBooks.length > 0 && (
                <div className="mb-2">
                  <p className="text-sm font-medium text-navy-700 dark:text-white">Scanned Books in Session:</p>
                </div>
              )}
              {state.scannedBook && (
                <div className="mb-4 rounded-lg border border-gray-200 p-3 dark:border-navy-600">
                  <div className="space-y-3">
                    <div className="border-b border-gray-200 pb-2 dark:border-navy-600">
                      <span className="text-lg font-semibold text-navy-700 dark:text-white">{state.scannedBook.title}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 dark:text-gray-400">ISBN:</span>
                          <span className="text-navy-700 dark:text-white">{state.scannedBook.isbn}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 dark:text-gray-400">Author:</span>
                          <span className="text-navy-700 dark:text-white">{state.scannedBook.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 dark:text-gray-400">Category:</span>
                          <span className="text-navy-700 dark:text-white">{state.scannedBook.category}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 dark:text-gray-400">Size:</span>
                          <span className="text-navy-700 dark:text-white">{state.scannedBook.size}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 dark:text-gray-400">Year:</span>
                          <span className="text-navy-700 dark:text-white">{state.scannedBook.publicationYear}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {state.currentScanSessionBooks.filter(book => book.id !== (state.scannedBook?.id || null)).map((book) => (
                <div
                  key={book.id}
                  className={`mb-2 cursor-pointer rounded-lg border border-gray-200 p-2 ${book.assigned ? 'bg-green-100 dark:bg-green-900' : 'hover:bg-gray-50 dark:hover:bg-navy-800'} dark:border-navy-600`}
                  onClick={() => setState(prev => ({ ...prev, scannedBook: book }))}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${book.assigned ? 'text-green-800 dark:text-green-200' : 'text-navy-700 dark:text-white'}`}>{book.title}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{book.isbn}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mb-6 rounded-lg border border-gray-200 p-3 dark:border-navy-600">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <select
                    value={state.selectedDepartment}
                    onChange={(e) =>
                      setState((prev) => ({ ...prev, selectedDepartment: e.target.value, selectedRack: "" }))
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm focus:border-brand-500 focus:outline-none dark:border-navy-600 dark:bg-navy-800 dark:text-white text-gray-900"
                  >
                    <option value="">Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept} className="dark:bg-navy-800">
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={state.selectedRack}
                    onChange={(e) =>
                      setState((prev) => ({ ...prev, selectedRack: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm focus:border-brand-500 focus:outline-none dark:border-navy-600 dark:bg-navy-800 dark:text-white text-gray-900"
                  >
                    <option value="">Rack</option>
                    {filteredRacks.map((rack) => (
                      <option key={rack.id} value={rack.id} className="dark:bg-navy-800">
                        {rack.id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setState(prev => ({ ...prev, scannedBook: null, currentScanSessionBooks: [], selectedDepartment: "", selectedRack: "" }))}
                className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-navy-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignBooks}
                disabled={!state.selectedDepartment || !state.selectedRack || state.currentScanSessionBooks.filter(book => !book.assigned).length === 0 || state.isLoading}
                className="rounded-lg bg-brand-500 px-3 py-1.5 text-sm text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state.isLoading ? 'Assigning...' : 'Assign Book'}
              </button>
            </div>
          </div>
        </div>
      )}

      {state.removeBooksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-navy-700">
            <h3 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">
              Remove Book by ISBN
            </h3>
            <div className="mb-6">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <MdSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={state.removeBookSearch}
                    onChange={(e) =>
                      setState((prev) => ({ ...prev, removeBookSearch: e.target.value }))
                    }
                    placeholder="Enter ISBN to remove"
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-brand-500 focus:outline-none dark:border-navy-600 dark:bg-navy-800 dark:text-white text-gray-900"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleRemoveBookByIsbn();
                      }
                    }}
                  />
                </div>
                <button
                  onClick={handleRemoveBookByIsbn}
                  disabled={state.isLoading}
                  className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {state.isLoading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setState(prev => ({ ...prev, removeBooksModal: false, removeBookSearch: "" }))}
                className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-navy-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .dataTable thead th.sorting {
          position: relative;
          padding-right: 30px;
        }
        .dataTable thead th.sorting:before,
        .dataTable thead th.sorting:after {
          position: absolute;
          bottom: 0.9em;
          display: block;
          opacity: 0.3;
        }
        .dataTable thead th.sorting:before {
          right: 1em;
          content: "↑";
        }
        .dataTable thead th.sorting:after {
          right: 0.5em;
          content: "↓";
        }
        .dataTable thead th.sorting_asc:before,
        .dataTable thead th.sorting_desc:after {
          opacity: 1;
        }
        .dataTable thead th.sorting_asc_disabled:before,
        .dataTable thead th.sorting_desc_disabled:after {
          opacity: 0;
        }
        .dataTable thead th:active {
          outline: none;
        }
        @media screen and (max-width: 767px) {
          .dataTable_wrapper {
            text-align: center;
          }
        }
        .dataTable.table-sm > thead > tr > th {
          padding-right: 20px;
        }
        .dataTable.table-sm .sorting:before,
        .dataTable.table-sm .sorting_asc:before,
        .dataTable.table-sm .sorting_desc:before {
          top: 5px;
          right: 0.85em;
        }
        .dataTable.table-sm .sorting:after,
        .dataTable.table-sm .sorting_asc:after,
        .dataTable.table-sm .sorting_desc:after {
          top: 5px;
        }
      `}</style>
    </div>
  );
};

export default RackManager;