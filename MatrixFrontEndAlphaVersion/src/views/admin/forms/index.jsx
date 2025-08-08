import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from 'components/card';
import { motion, AnimatePresence } from "framer-motion";

// Toast component
const Toast = ({ message, type, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: -50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -50 }}
    className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white flex items-center justify-between min-w-[300px]`}
  >
    <div className="flex items-center">
      {type === 'success' ? (
        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      <p>{message}</p>
    </div>
    <button onClick={onClose} className="ml-4 hover:text-gray-200">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </motion.div>
);

// PaginationControls component (copied and adapted from scanner)
const PaginationControls = ({ currentPage, totalPages, onPageChange, totalEntries, rowsPerPage }) => (
  <div className="mt-4 flex items-center justify-end">
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-navy-600 dark:text-gray-400 dark:hover:bg-navy-700"
    >
      Previous
    </button>
    <div className="flex items-center gap-1">
      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i + 1}
          onClick={() => onPageChange(i + 1)}
          className={`rounded-lg px-3 py-1 text-sm font-medium ${
            currentPage === i + 1
              ? 'bg-brand-500 text-white'
              : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-navy-700'
          }`}
        >
          {i + 1}
        </button>
      ))}
    </div>
    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages || totalPages === 0}
      className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-navy-600 dark:text-gray-400 dark:hover:bg-navy-700"
    >
      Next
    </button>
  </div>
);

const API_BASE_URL = 'http://localhost:5000'; // Match the student component's API URL

const Forms = () => {
  const [darkMode, setDarkMode] = useState(document.body.classList.contains("dark"));
  const [submissions, setSubmissions] = useState([]);
  const [customForms, setCustomForms] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [requestTypeFilter, setRequestTypeFilter] = useState('All');
  const [showCustomForms, setShowCustomForms] = useState(false);
  const [newForm, setNewForm] = useState({
    name: '',
    fields: [{ name: '', type: 'text' }],
    requireAuth: false,
    emailNotification: false,
  });
  const [editingForm, setEditingForm] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [showFormData, setShowFormData] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formModalTab, setFormModalTab] = useState('template'); // 'template' or 'form'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000); // Auto dismiss after 3 seconds
  };

  const formTemplates = [
    {
      name: 'Book Reservation Request',
      description: 'Reserve a book from the library.',
      fields: [
        { name: 'Book Name', type: 'text', required: true },
        { name: 'Author', type: 'text', required: true },
        { name: 'Book ID / ISBN', type: 'text', required: true },
        { name: 'Expected Return Date', type: 'date', required: true },
      ],
      requireAuth: true,
      emailNotification: true,
    },
    {
      name: 'Book Suggestion',
      description: 'Suggest a new book for the library.',
      fields: [
        { name: 'Book Title', type: 'text', required: true },
        { name: 'Author', type: 'text', required: false },
        { name: 'Book ID / ISBN', type: 'text', required: false },
        { name: 'Reason for Suggestion', type: 'textarea', required: false },
      ],
      requireAuth: true,
      emailNotification: true,
    },
    {
      name: 'Book Renewal Request',
      description: 'Request renewal for a borrowed book.',
      fields: [
        { name: 'Book ID', type: 'text', required: true },
        { name: 'Renewal Period (days)', type: 'number', required: true },
        { name: 'Reason for Renewal Request', type: 'textarea', required: false },
      ],
      requireAuth: true,
      emailNotification: true,
    },
    {
      name: 'Giveaway Request',
      description: 'Apply for library book giveaways.',
      fields: [
        { name: 'Book Title', type: 'text', required: true },
        { name: 'Quantity', type: 'number', required: true },
        { name: 'Reason for Request', type: 'textarea', required: true },
        { name: 'Upload File', type: 'file', required: false },
      ],
      requireAuth: true,
      emailNotification: true,
    },
    {
      name: 'Book Return Issue',
      description: 'Report a lost or damaged book.',
      fields: [
        { name: 'Book ID', type: 'text', required: true },
        { name: 'Type of Issue', type: 'select', options: 'Lost,Damaged', required: true },
        { name: 'Description of Issue', type: 'textarea', required: true },
        { name: 'Lost or Damaged Date', type: 'date', required: true },
      ],
      requireAuth: true,
      emailNotification: true,
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const [submissionsRes, formsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/form-submissions`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/api/form-submissions/custom`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setSubmissions(submissionsRes.data.data.map(sub => ({
          ...sub,
          selected: false,
          id: sub._id,
          submittedBy: sub.submittedBy.name,
          submittedByEmail: sub.submittedBy.email,
          department: sub.submittedBy.department,
          rollNumber: sub.rollNumber,
          submittedOn: new Date(sub.submittedOn).toLocaleString(),
          lastUpdated: new Date(sub.lastUpdated).toLocaleString(),
        })));
        setCustomForms(formsRes.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    // Poll for updates every 15 seconds
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${API_BASE_URL}/api/form-submissions`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSubmissions(response.data.data.map(sub => ({
          ...sub,
          selected: false,
          id: sub._id,
          submittedBy: sub.submittedBy.name,
          submittedByEmail: sub.submittedBy.email,
          department: sub.submittedBy.department,
          rollNumber: sub.rollNumber,
          submittedOn: new Date(sub.submittedOn).toLocaleString(),
          lastUpdated: new Date(sub.lastUpdated).toLocaleString(),
        })));
      } catch (err) {
        console.error('Failed to fetch submission updates:', err);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const getStats = () => {
    const total = submissions.length;
    const newCount = submissions.filter(sub => sub.status === 'New').length;
    const inReviewCount = submissions.filter(sub => sub.status === 'In Review').length;
    const resolvedCount = submissions.filter(sub => sub.status === 'Resolved').length;
    const deniedCount = submissions.filter(sub => sub.status === 'Denied').length;

    return { total, new: newCount, inReview: inReviewCount, resolved: resolvedCount, denied: deniedCount };
  };

  const handleView = (index) => {
    setSelectedSubmission(submissions[index]);
    setIsEditing(false);
  };

  const handleEdit = (index) => {
    setSelectedSubmission(submissions[index]);
    setEditForm({ ...submissions[index] });
    setIsEditing(true);
  };

  const handleStatusUpdate = async (submissionId, newStatus, adminComment = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}/api/form-submissions/${submissionId}/status`,
        { status: newStatus, adminComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSubmissions(submissions.map(sub =>
        sub._id === submissionId
          ? {
              ...sub,
              status: newStatus,
              adminComment,
              lastUpdated: new Date().toLocaleString(),
            }
          : sub
      ));
      setNotification({ type: 'success', message: 'Status updated successfully' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/api/form-submissions/${editForm._id}`,
        { formType: editForm.formType, formData: editForm.formData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmissions(submissions.map(sub =>
        sub._id === editForm._id ? { ...editForm, selected: sub.selected } : sub
      ));
    setSelectedSubmission(null);
    setIsEditing(false);
    setEditForm(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save edits');
    }
  };

  const handleCancelEdit = () => {
    setSelectedSubmission(null);
    setIsEditing(false);
    setEditForm(null);
  };

  const handleExport = () => {
    const selectedSubmissions = submissions.filter(sub => sub.selected);
    if (selectedSubmissions.length === 0) {
      alert('Please select at least one submission to export.');
      return;
    }
    const csvContent = [
      ['Form Type', 'Name', 'Email', 'Roll Number', 'Department', 'Submitted On', 'Status'],
      ...selectedSubmissions.map(sub => [
        sub.formType,
        sub.submittedBy,
        sub.submittedByEmail || 'N/A',
        sub.rollNumber || 'N/A',
        sub.department || 'N/A',
        sub.submittedOn,
        sub.status,
      ]),
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'form_submissions.csv';
    link.click();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All Status');
    setRequestTypeFilter('All');
  };

  const handleRequestTypeFilter = (type) => {
    setRequestTypeFilter(type === requestTypeFilter ? 'All' : type);
  };

  const handleCreateCustomForm = () => {
    setShowCustomForms(true);
    setNewForm({
      name: '',
      fields: [{ name: '', type: 'text' }],
      requireAuth: false,
      emailNotification: false,
    });
  };

  const handleAddField = () => {
    setNewForm({
      ...newForm,
      fields: [...newForm.fields, { name: '', type: 'text' }],
    });
  };

  const handleRemoveField = (index) => {
    setNewForm({
      ...newForm,
      fields: newForm.fields.filter((_, i) => i !== index),
    });
  };

  const handleFieldChange = (index, key, value) => {
    const newFields = [...newForm.fields];
    newFields[index] = { ...newFields[index], [key]: value };
    setNewForm({ ...newForm, fields: newFields });
  };

  const handleSaveCustomForm = async () => {
    if (!newForm.name || newForm.fields.some(field => !field.name)) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    // Check if a form with the same name already exists
    const existingForm = customForms.find(form => form.name?.toLowerCase() === newForm.name?.toLowerCase());
    if (existingForm) {
      showToast('A form with this name already exists. Please choose a different name.', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/api/form-submissions/custom`,
        newForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('Custom form created successfully! Students will be notified.', 'success');
      setCustomForms([...customForms, response.data.data]);
    setShowCustomForms(false);
    setNewForm({
      name: '',
      fields: [{ name: '', type: 'text' }],
      requireAuth: false,
        emailNotification: false,
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create custom form';
      showToast(
        errorMessage.includes('duplicate key error') ? 
        'A form with this name already exists. Please choose a different name.' : 
        errorMessage, 
        'error'
      );
    }
  };

  const handleEditForm = (form) => {
    setEditingForm(form);
    setNewForm({ ...form });
    setShowCustomForms(true);
  };

  const handleUpdateForm = async () => {
    if (!newForm.name || newForm.fields.some(field => !field.name)) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/api/form-submissions/custom/${editingForm._id}`,
        newForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('Custom form updated successfully!', 'success');
    setCustomForms(customForms.map(form => 
        form._id === editingForm._id ? { ...newForm, _id: editingForm._id } : form
    ));
    setShowCustomForms(false);
    setEditingForm(null);
    setNewForm({
      name: '',
      fields: [{ name: '', type: 'text' }],
      requireAuth: false,
        emailNotification: false,
      });
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update custom form', 'error');
    }
  };

  const handleDeleteCustomForm = async (formId) => {
    if (window.confirm('Are you sure you want to delete this form?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/api/form-submissions/custom/${formId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showToast('Custom form deleted successfully', 'success');
        setCustomForms(customForms.filter(form => form._id !== formId));
      } catch (error) {
        showToast(error.response?.data?.message || 'Failed to delete custom form', 'error');
      }
    }
  };

  const handleUseTemplate = (template) => {
    setNewForm({
      name: template.name,
      fields: template.fields,
      requireAuth: template.requireAuth,
      emailNotification: template.emailNotification,
    });
    setShowCustomForms(true);
    setEditingForm(null);
  };

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = searchTerm
      ? sub.formType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.submittedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sub.rollNumber && sub.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;

    const matchesStatus = statusFilter === 'All Status' ? true : sub.status === statusFilter;
    const matchesType = requestTypeFilter === 'All' ? true : sub.formType === requestTypeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = getStats();

  // Calculate paginated submissions
  const paginatedSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const totalPages = Math.ceil(filteredSubmissions.length / rowsPerPage);

  // Reset to first page when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, requestTypeFilter]);

  const renderSubmissionTable = () => {
    return (
      <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-navy-700 dark:bg-navy-800">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-navy-700 dark:bg-navy-900">
              <th className="py-4 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Form Type</th>
              <th className="py-4 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Email</th>
              <th className="py-4 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
              <th className="py-4 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Submitted On</th>
              <th className="py-4 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated</th>
              <th className="py-4 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSubmissions.map((submission, index) => (
              <tr
                key={submission._id}
                className="border-b border-gray-200 last:border-none hover:bg-gray-50 dark:border-navy-700 dark:hover:bg-navy-700"
              >
                <td className="py-4 px-2 sm:px-4">
                  <p className="font-medium text-navy-700 dark:text-white text-xs sm:text-base">{submission.formType}</p>
                </td>
                <td className="py-4 px-2 sm:px-4 text-xs sm:text-base">{submission.submittedByEmail || 'N/A'}</td>
                <td className="py-4 px-2 sm:px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    submission.status === 'Resolved'
                      ? 'bg-green-100 text-green-800'
                      : submission.status === 'Denied'
                      ? 'bg-red-100 text-red-800'
                      : submission.status === 'In Review'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {submission.status}
                  </span>
                </td>
                <td className="py-4 px-2 sm:px-4 text-xs sm:text-base">{submission.submittedOn}</td>
                <td className="py-4 px-2 sm:px-4 text-xs sm:text-base">{submission.lastUpdated}</td>
                <td className="py-4 px-2 sm:px-4">
                  <div className="flex flex-row items-center gap-2">
                    <button
                      onClick={() => handleView((currentPage - 1) * rowsPerPage + index)}
                      className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-navy-700"
                      aria-label="View"
                      title="View"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    </button>
                    {submission.status === 'New' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(submission._id, 'Resolved')}
                          className="rounded-full p-2 text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-navy-700"
                          aria-label="Approve"
                          title="Approve"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(submission._id, 'Denied')}
                          className="rounded-full p-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-navy-700"
                          aria-label="Deny"
                          title="Deny"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination Controls (scanner style) */}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalEntries={filteredSubmissions.length}
          rowsPerPage={rowsPerPage}
        />
      </div>
    );
  };

  const openFormModal = (tab = 'template') => {
    setShowFormModal(true);
    setFormModalTab(tab);
    setEditingForm(null);
    setNewForm({
      name: '',
      fields: [{ name: '', type: 'text' }],
      requireAuth: false,
      emailNotification: false,
    });
  };

  const openEditFormModal = (form) => {
    setShowFormModal(true);
    setFormModalTab('form');
    setEditingForm(form);
    setNewForm({ ...form });
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingForm(null);
    setNewForm({
      name: '',
      fields: [{ name: '', type: 'text' }],
      requireAuth: false,
      emailNotification: false,
    });
  };

  return (
    <div className="mt-3 h-full w-full rounded-[20px] bg-white p-4 md:p-6 shadow-lg dark:!bg-navy-800 dark:text-white transition-all duration-300 relative">
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
      {isLoading && (
        <div className="flex justify-center items-center mb-4">
          <div className="w-8 h-8 border-4 border-t-transparent border-brand-500 rounded-full animate-spin"></div>
        </div>
      )}
      {error && (
        <div className="mb-4 text-red-500 text-sm">{error}</div>
      )}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="linear rounded-xl bg-brand-500 px-4 py-2 text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-500 dark:active:bg-brand-600 w-full"
        >
          {showMobileMenu ? 'Hide Menu' : 'Show Menu'}
        </button>
      </div>
      {showMobileMenu && (
        <div className="md:hidden mb-6 space-y-2">
          <button
            className="linear rounded-xl bg-green-500 px-4 py-2 text-base font-medium text-white transition duration-200 hover:bg-green-600 active:bg-green-700 dark:bg-green-400 dark:hover:bg-green-500 dark:active:bg-green-600 w-full"
            onClick={() => openFormModal('form')}
          >
            Create Custom Form
          </button>
        </div>
      )}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-navy-700 dark:text-white">Student Request Manager</h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Manage and process student requests efficiently</p>
        </div>
        <div className="flex gap-3">
          <button
            className="linear rounded-xl bg-green-500 px-4 py-2 text-base font-medium text-white transition duration-200 hover:bg-green-600 active:bg-green-700 dark:bg-green-400 dark:hover:bg-green-500 dark:active:bg-green-600"
            onClick={() => openFormModal('form')}
          >
            Create Custom Form
          </button>
        </div>
      </header>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="!z-5 relative flex flex-col items-center justify-center rounded-xl border-[2px] border-gray-200 bg-white bg-clip-border p-4 text-center !shadow-xl shadow-base dark:border-gray-600 dark:!bg-navy-800 transition-all duration-300">
          <h2 className="text-gray-600 dark:text-gray-400 text-xs md:text-sm uppercase mb-2">Total Submissions</h2>
          <p className="text-xl md:text-2xl font-semibold text-navy-700 dark:text-white">{stats.total}</p>
          <span className="text-green-500 text-xs mt-1">+0 today</span>
        </Card>
        <Card className="!z-5 relative flex flex-col items-center justify-center rounded-xl border-[2px] border-gray-200 bg-white bg-clip-border p-4 text-center !shadow-xl shadow-base dark:border-gray-600 dark:!bg-navy-800 transition-all duration-300">
          <h2 className="text-gray-600 dark:text-gray-400 text-xs md:text-sm uppercase mb-2">New</h2>
          <p className="text-xl md:text-2xl font-semibold text-navy-700 dark:text-white">{stats.new}</p>
          <div className="w-full h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-900 mt-2">
            <div className="bg-blue-500 dark:bg-blue-400 h-full transition-all duration-300" style={{ width: `${(stats.new / stats.total) * 100}%` }}></div>
          </div>
        </Card>
        <Card className="!z-5 relative flex flex-col items-center justify-center rounded-xl border-[2px] border-gray-200 bg-white bg-clip-border p-4 text-center !shadow-xl shadow-base dark:border-gray-600 dark:!bg-navy-800 transition-all duration-300">
          <h2 className="text-gray-600 dark:text-gray-400 text-xs md:text-sm uppercase mb-2">In Review</h2>
          <p className="text-xl md:text-2xl font-semibold text-navy-700 dark:text-white">{stats.inReview}</p>
          <div className="w-full h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-900 mt-2">
            <div className="bg-yellow-500 dark:bg-yellow-400 h-full transition-all duration-300" style={{ width: `${(stats.inReview / stats.total) * 100}%` }}></div>
          </div>
        </Card>
        <Card className="!z-5 relative flex flex-col items-center justify-center rounded-xl border-[2px] border-gray-200 bg-white bg-clip-border p-4 text-center !shadow-xl shadow-base dark:border-gray-600 dark:!bg-navy-800 transition-all duration-300">
          <h2 className="text-gray-600 dark:text-gray-400 text-xs md:text-sm uppercase mb-2">Resolved</h2>
          <p className="text-xl md:text-2xl font-semibold text-navy-700 dark:text-white">{stats.resolved}</p>
          <div className="w-full h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-900 mt-2">
            <div className="bg-green-500 dark:bg-green-400 h-full transition-all duration-300" style={{ width: `${(stats.resolved / stats.total) * 100}%` }}></div>
          </div>
        </Card>
      </section>
      <section className="mb-6">
        <h3 className="text-gray-600 dark:text-gray-400 text-xs md:text-sm uppercase mb-2">Filter by Request Type</h3>
        <div className="flex flex-wrap gap-2">
          {['Book Reservation Request', 'Book Suggestion', 'Book Renewal Request', 'Giveaway Request', 'Book Return Issue'].map(type => (
            <button 
              key={type}
              className={`linear rounded-xl px-2 md:px-4 py-1 md:py-2 text-xs md:text-base font-medium transition duration-200 ${
                requestTypeFilter === type 
                  ? 'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-500 dark:active:bg-brand-600' 
                  : 'bg-lightPrimary text-navy-700 hover:bg-gray-200 active:bg-gray-300 dark:bg-navy-700 dark:text-white dark:hover:bg-navy-600 dark:active:bg-navy-700'
              }`}
              onClick={() => handleRequestTypeFilter(type)}
            >
              <span className="hidden sm:inline">{type}</span>
              <span className="sm:hidden">{type.split(' ')[0]}</span>
              <span className="ml-1 rounded-full bg-blue-500 px-1 md:px-2 py-0.5 text-xs text-white dark:bg-blue-400 animate-fadeIn">
                {submissions.filter(sub => sub.formType === type && sub.status === 'New').length}
              </span>
            </button>
          ))}
          <button
            className="linear rounded-xl bg-green-500 px-2 md:px-4 py-1 md:py-2 text-xs md:text-base font-medium text-white transition duration-200 hover:bg-green-600 active:bg-green-700 dark:bg-green-400 dark:hover:bg-green-500 dark:active:bg-green-600"
            onClick={() => openFormModal('form')}
          >
            <span className="hidden sm:inline">Custom Data</span>
            <span className="sm:hidden">Custom</span>
          </button>
        </div>
      </section>
      <section className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search..."
            className="!z-99 w-full rounded-xl border border-gray-200 bg-white bg-clip-border pl-11 pr-3 py-2 text-sm text-navy-700 outline-none transition duration-200 placeholder:!text-gray-500 focus:border-brand-500 dark:!border-navy-700 dark:!bg-navy-700 dark:text-white dark:placeholder:!text-white dark:focus:border-brand-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <select
          className="!z-99 flex w-full sm:w-min items-center justify-center rounded-xl border border-gray-200 bg-white bg-clip-border px-3 py-2 text-sm text-navy-700 outline-none transition duration-200 placeholder:!text-gray-500 focus:border-brand-500 dark:!border-navy-700 dark:!bg-navy-700 dark:text-white dark:placeholder:!text-white dark:focus:border-brand-400"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All Status">All Status</option>
          <option value="New">New</option>
          <option value="In Review">In Review</option>
          <option value="Resolved">Resolved</option>
          <option value="Denied">Denied</option>
        </select>
                    <button
          className="linear rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-navy-700 transition duration-200 hover:bg-gray-200 active:bg-gray-300 dark:bg-navy-700 dark:text-white dark:hover:bg-navy-600 dark:active:bg-navy-700"
          onClick={handleResetFilters}
                    >
          Reset Filters
                    </button>
      </section>
      {renderSubmissionTable()}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl border-2 border-gray-200 bg-white dark:bg-navy-800 p-4 md:p-6 shadow-2xl dark:border-gray-600 max-w-lg w-full transition-all duration-300 overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg md:text-xl font-bold text-navy-700 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-600 pb-3">
              {isEditing ? 'Edit Submission' : 'View Submission'}
            </h3>
            {isEditing ? (
              <div className="grid grid-cols-1 gap-4 py-2">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Form Type</label>
                  <input
                    type="text"
                    className="mt-1 !z-99 w-full rounded-xl border border-gray-200 bg-white bg-clip-border px-3 py-2 text-sm text-navy-700 outline-none transition duration-200 placeholder:!text-gray-500 focus:border-brand-500 dark:!border-navy-700 dark:!bg-navy-700 dark:text-white dark:placeholder:!text-white dark:focus:border-brand-400"
                    value={editForm.formType}
                    onChange={(e) => setEditForm({ ...editForm, formType: e.target.value })}
                  />
                </div>
                {Object.keys(editForm.formData || {}).map((key) => (
                  <div key={key}>
                    <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{key}</label>
                  <input
                    type="text"
                    className="mt-1 !z-99 w-full rounded-xl border border-gray-200 bg-white bg-clip-border px-3 py-2 text-sm text-navy-700 outline-none transition duration-200 placeholder:!text-gray-500 focus:border-brand-500 dark:!border-navy-700 dark:!bg-navy-700 dark:text-white dark:placeholder:!text-white dark:focus:border-brand-400"
                      value={editForm.formData[key] || ''}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        formData: { ...editForm.formData, [key]: e.target.value },
                      })}
                  />
                </div>
                ))}
                <div className="flex flex-col sm:flex-row gap-2 justify-end mt-4 border-t border-gray-200 dark:border-gray-600 pt-3">
                  <button
                    className="linear rounded-xl bg-brand-500 px-4 py-2 text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-500 dark:active:bg-brand-600"
                    onClick={handleSaveEdit}
                  >
                    Save
                  </button>
                  <button
                    className="linear rounded-xl bg-red-500 px-4 py-2 text-base font-medium text-white transition duration-200 hover:bg-red-600 active:bg-red-700 dark:bg-red-400 dark:hover:bg-red-500 dark:active:bg-red-600"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 py-2">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Form Type: </span>
                  <span className="text-navy-700 dark:text-white">{selectedSubmission.formType}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Submitted By: </span>
                  <span className="text-navy-700 dark:text-white">{selectedSubmission.submittedBy}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Email: </span>
                  <span className="text-navy-700 dark:text-white">{selectedSubmission.submittedByEmail || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Roll Number: </span>
                  <span className="text-navy-700 dark:text-white">{selectedSubmission.rollNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Department: </span>
                  <span className="text-navy-700 dark:text-white">{selectedSubmission.department || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Submitted On: </span>
                  <span className="text-navy-700 dark:text-white">{selectedSubmission.submittedOn}</span>
                </div>
                {Object.keys(selectedSubmission.formData || {}).map((key) => (
                  <div key={key}>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{key}: </span>
                    <span className="text-navy-700 dark:text-white">{selectedSubmission.formData[key] || '(Not provided)'}</span>
                  </div>
                ))}
                <div className="flex flex-col sm:flex-row gap-2 justify-end mt-4 border-t border-gray-200 dark:border-gray-600 pt-3">
                  <button
                    className="linear rounded-xl bg-green-500 px-4 py-2 text-base font-medium text-white transition duration-200 hover:bg-green-600 active:bg-green-700 dark:bg-green-400 dark:hover:bg-green-500 dark:active:bg-green-600"
                    onClick={() => handleStatusUpdate(selectedSubmission._id, 'Resolved')}
                  >
                    Approve
                  </button>
                  <button
                    className="linear rounded-xl bg-red-500 px-4 py-2 text-base font-medium text-white transition duration-200 hover:bg-red-600 active:bg-red-700 dark:bg-red-400 dark:hover:bg-red-500 dark:active:bg-red-600"
                    onClick={() => handleStatusUpdate(selectedSubmission._id, 'Denied')}
                  >
                    Deny
                  </button>
                  <button
                    className="linear rounded-xl bg-gray-100 px-4 py-2 text-base font-medium text-navy-700 transition duration-200 hover:bg-gray-200 active:bg-gray-300 dark:bg-navy-700 dark:text-white dark:hover:bg-navy-600 dark:active:bg-navy-700"
                    onClick={() => setSelectedSubmission(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {showCustomForms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl border-2 border-gray-200 bg-white dark:bg-navy-800 p-4 md:p-6 shadow-2xl dark:border-gray-600 max-w-6xl w-full transition-all duration-300 overflow-y-auto max-h-[90vh]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-gray-200 dark:border-gray-600 pb-3 gap-4">
              <div className="flex items-center gap-4">
                <h3 className="text-lg md:text-xl font-bold text-navy-700 dark:text-white">Custom Form Data</h3>
              </div>
              <button
                className="linear rounded-xl bg-gray-100 px-3 py-1 text-sm font-medium text-navy-700 transition duration-200 hover:bg-gray-200 active:bg-gray-300 dark:bg-navy-700 dark:text-white dark:hover:bg-navy-600 dark:active:bg-navy-700"
                onClick={() => setShowCustomForms(false)}
              >
                Close
              </button>
            </div>
            <div className="overflow-x-auto py-2">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-white">Form Name</th>
                    <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-white">Created At</th>
                    <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-white">Submissions</th>
                    <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customForms.map((form) => (
                    <tr key={form._id} className="border-b border-gray-200 dark:border-gray-600 last:border-b-0 hover:bg-gray-100 dark:hover:bg-navy-700 transition-all duration-200">
                      <td className="p-4 text-sm text-navy-700 dark:text-white">{form.name}</td>
                      <td className="p-4 text-sm text-navy-700 dark:text-white">{new Date(form.createdAt).toLocaleString()}</td>
                      <td className="p-4 text-sm text-navy-700 dark:text-white">
                        {submissions.filter(sub => sub.formType === form.name).length} submissions
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <button
                            className="linear rounded-xl bg-blue-500 px-3 py-1 text-sm font-medium text-white transition duration-200 hover:bg-blue-600 active:bg-blue-700 dark:bg-blue-400 dark:hover:bg-blue-500 dark:active:bg-blue-600"
                            onClick={() => {
                              setSelectedForm(form);
                              setShowFormData(true);
                            }}
                          >
                            View Data
                          </button>
                          <button
                            className="linear rounded-xl bg-yellow-500 px-3 py-1 text-sm font-medium text-black transition duration-200 hover:bg-yellow-600 active:bg-yellow-700 dark:bg-yellow-400 dark:hover:bg-yellow-500 dark:active:bg-yellow-600 dark:text-black"
                            onClick={() => openEditFormModal(form)}
                          >
                            Edit
                          </button>
                          <button
                            className="linear rounded-xl bg-red-500 px-3 py-1 text-sm font-medium text-white transition duration-200 hover:bg-red-600 active:bg-red-700 dark:bg-red-400 dark:hover:bg-red-500 dark:active:bg-red-600"
                            onClick={() => handleDeleteCustomForm(form._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {customForms.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                        No custom forms available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {showFormModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeFormModal}
        >
          <div
            className="rounded-2xl border-2 border-gray-200 bg-white dark:bg-navy-800 p-4 md:p-6 shadow-2xl dark:border-gray-600 max-w-4xl w-full transition-all duration-300 overflow-y-auto max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-600 pb-3">
              <div className="flex gap-2">
                <button
                  className={`px-4 py-2 rounded-t-lg font-medium transition-colors duration-200 ${formModalTab === 'template' ? 'bg-brand-500 text-white' : 'bg-gray-100 text-navy-700 dark:bg-navy-700 dark:text-white'}`}
                  onClick={() => setFormModalTab('template')}
                >
                  Choose Template
                </button>
                <button
                  className={`px-4 py-2 rounded-t-lg font-medium transition-colors duration-200 ${formModalTab === 'form' ? 'bg-brand-500 text-white' : 'bg-gray-100 text-navy-700 dark:bg-navy-700 dark:text-white'}`}
                  onClick={() => setFormModalTab('form')}
                >
                  {editingForm ? 'Edit Form' : 'Create Custom Form'}
                </button>
              </div>
              <button
                className="linear rounded-xl bg-gray-100 px-3 py-1 text-sm font-medium text-navy-700 transition duration-200 hover:bg-gray-200 active:bg-gray-300 dark:bg-navy-700 dark:text-white dark:hover:bg-navy-600 dark:active:bg-navy-700"
                onClick={closeFormModal}
              >
                Close
              </button>
            </div>
            {formModalTab === 'template' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-2">
                {formTemplates.map((template, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 hover:shadow-lg transition-all duration-200">
                    <h4 className="text-lg font-semibold text-navy-700 dark:text-white mb-2">{template.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{template.description}</p>
                    <div className="mb-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Fields:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {template.fields.map((field, fieldIndex) => (
                          <span key={fieldIndex} className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded">
                            {field.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      {template.requireAuth && (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          🔒 Auth Required
                        </span>
                      )}
                      {template.emailNotification && (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          📧 Email Notifications
                        </span>
                      )}
                    </div>
                    <button
                      className="linear rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-500 dark:active:bg-brand-600 w-full"
                      onClick={() => handleUseTemplate(template)}
                    >
                      Use This Template
                    </button>
                  </div>
                ))}
              </div>
            )}
            {formModalTab === 'form' && (
              <div className="grid gap-4 py-2 max-w-lg mx-auto">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Form Name</label>
                  <input
                    type="text"
                    className="mt-1 !z-99 w-full rounded-xl border border-gray-200 bg-white bg-clip-border px-3 py-2 text-sm text-navy-700 outline-none transition duration-200 placeholder:!text-gray-500 focus:border-brand-500 dark:!border-navy-700 dark:!bg-navy-700 dark:text-white dark:placeholder:!text-white dark:focus:border-brand-400"
                    value={newForm.name}
                    onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                    placeholder="Enter form name"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Fields</label>
                  {newForm.fields.map((field, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2">
                      <input
                        type="text"
                        className="flex-1 !z-99 rounded-xl border border-gray-200 bg-white bg-clip-border px-3 py-[7px] text-sm text-navy-700 outline-none transition duration-200 placeholder:!text-gray-500 focus:border-brand-500 dark:!border-navy-700 dark:!bg-navy-700 dark:text-white dark:placeholder:!text-white dark:focus:border-brand-400"
                        value={field.name}
                        onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                        placeholder="Field name"
                      />
                      <select
                        className="!z-99 rounded-xl border border-gray-200 bg-white bg-clip-border px-3 py-[7px] text-sm text-navy-700 outline-none transition duration-200 placeholder:!text-gray-500 focus:border-brand-500 dark:!border-navy-700 dark:!bg-navy-700 dark:text-white dark:placeholder:!text-white dark:focus:border-brand-400"
                        value={field.type}
                        onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="email">Email</option>
                        <option value="textarea">Text Area</option>
                        <option value="select">Select</option>
                        <option value="file">File</option>
                      </select>
                      {field.type === 'select' && (
                        <input
                          type="text"
                          className="flex-1 !z-99 rounded-xl border border-gray-200 bg-white bg-clip-border px-3 py-[7px] text-sm text-navy-700 outline-none transition duration-200 placeholder:!text-gray-500 focus:border-brand-500 dark:!border-navy-700 dark:!bg-navy-700 dark:text-white dark:placeholder:!text-white dark:focus:border-brand-400"
                          value={field.options || ''}
                          onChange={(e) => handleFieldChange(index, 'options', e.target.value)}
                          placeholder="Options (comma-separated)"
                        />
                      )}
                      {newForm.fields.length > 1 && (
                        <button
                          className="linear rounded-xl bg-red-500 px-3 py-1 text-sm font-medium text-white transition duration-200 hover:bg-red-600 active:bg-red-700 dark:bg-red-400 dark:hover:bg-red-500 dark:active:bg-red-600"
                          onClick={() => handleRemoveField(index)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    className="linear rounded-xl bg-blue-500 px-3 py-1 text-sm font-medium text-white transition duration-200 hover:bg-blue-600 active:bg-blue-700 dark:bg-blue-400 dark:hover:bg-blue-500 dark:active:bg-blue-600 mt-2"
                    onClick={handleAddField}
                  >
                    Add Field
                  </button>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Form Settings</label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id="requireAuth"
                      checked={newForm.requireAuth || false}
                      onChange={(e) => setNewForm({ ...newForm, requireAuth: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600 dark:border-gray-600 dark:bg-navy-900 dark:checked:bg-brand-400"
                    />
                    <label htmlFor="requireAuth" className="text-sm text-navy-700 dark:text-white">
                      Require Authentication
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="emailNotification"
                      checked={newForm.emailNotification || false}
                      onChange={(e) => setNewForm({ ...newForm, emailNotification: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600 dark:border-gray-600 dark:bg-navy-900 dark:checked:bg-brand-400"
                    />
                    <label htmlFor="emailNotification" className="text-sm text-navy-700 dark:text-white">
                      Email Notifications
                    </label>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 justify-end mt-6 border-t border-gray-200 dark:border-gray-600 pt-3">
                  <button
                    className="linear rounded-xl bg-green-500 px-4 py-2 text-base font-medium text-white transition duration-200 hover:bg-green-600 active:bg-green-700 dark:bg-green-400 dark:hover:bg-green-500 dark:active:bg-green-600"
                    onClick={editingForm ? handleUpdateForm : handleSaveCustomForm}
                  >
                    {editingForm ? 'Update Form' : 'Create Form'}
                  </button>
                  <button
                    className="linear rounded-xl bg-red-500 px-4 py-2 text-base font-medium text-white transition duration-200 hover:bg-red-600 active:bg-red-700 dark:bg-red-400 dark:hover:bg-red-500 dark:active:bg-red-600"
                    onClick={closeFormModal}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {showFormData && selectedForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl border-2 border-gray-200 bg-white dark:bg-navy-800 p-4 md:p-6 shadow-2xl dark:border-gray-600 max-w-4xl w-full transition-all duration-300 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-600 pb-3">
              <h3 className="text-lg md:text-xl font-bold text-navy-700 dark:text-white">Form Data: {selectedForm.name}</h3>
              <button
                className="linear rounded-xl bg-gray-100 px-3 py-1 text-sm font-medium text-navy-700 transition duration-200 hover:bg-gray-200 active:bg-gray-300 dark:bg-navy-700 dark:text-white dark:hover:bg-navy-600 dark:active:bg-navy-700"
                onClick={() => {
                  setShowFormData(false);
                  setSelectedForm(null);
                }}
              >
                Close
              </button>
            </div>
            <div className="overflow-x-auto py-2">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-white">Field Name</th>
                    <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-white">Type</th>
                    <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-white">Options</th>
                    <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-white">Required</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedForm.fields.map((field, index) => (
                    <tr key={index} className="border-b border-gray-200 dark:border-gray-600 last:border-b-0 hover:bg-gray-100 dark:hover:bg-navy-700 transition-all duration-200">
                      <td className="p-4 text-sm text-navy-700 dark:text-white">{field.name}</td>
                      <td className="p-4 text-sm text-navy-700 dark:text-white">{field.type}</td>
                      <td className="p-4 text-sm text-navy-700 dark:text-white">{field.options || '-'}</td>
                      <td className="p-4 text-sm text-navy-700 dark:text-white">
                        {field.required ? 'Yes' : 'No'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6">
              <h4 className="text-sm font-medium text-navy-700 dark:text-white mb-2">Form Settings</h4>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                    selectedForm.requireAuth ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200'
                  }`}>
                    {selectedForm.requireAuth ? '🔒 Auth Required' : 'No Auth Required'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                    selectedForm.emailNotification ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200'
                  }`}>
                    {selectedForm.emailNotification ? '📧 Email Notifications' : 'No Email Notifications'}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="text-sm font-medium text-navy-700 dark:text-white mb-2">Submissions</h4>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-600">
                      <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-white">Submitted By</th>
                      <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-white">Email</th>
                      <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-white">Roll Number</th>
                      <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-white">Submitted On</th>
                      <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-white">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions
                      .filter(sub => sub.formType === selectedForm.name)
                      .map((submission, index) => (
                        <tr key={index} className="border-b border-gray-200 dark:border-gray-600 last:border-b-0 hover:bg-gray-100 dark:hover:bg-navy-700 transition-all duration-200">
                          <td className="p-4 text-sm text-navy-700 dark:text-white">{submission.submittedBy}</td>
                          <td className="p-4 text-sm text-navy-700 dark:text-white">{submission.submittedByEmail || 'N/A'}</td>
                          <td className="p-4 text-sm text-navy-700 dark:text-white">{submission.rollNumber || 'N/A'}</td>
                          <td className="p-4 text-sm text-navy-700 dark:text-white">{submission.submittedOn}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                              submission.status === 'New' ? 'bg-blue-500 text-white dark:bg-blue-400' :
                              submission.status === 'In Review' ? 'bg-yellow-500 text-black dark:bg-yellow-400 dark:text-black' :
                              submission.status === 'Resolved' ? 'bg-green-500 text-white dark:bg-green-400' :
                              'bg-red-500 text-white dark:bg-red-400'
                            } animate-fadeIn`}>
                              {submission.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forms; 