import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from 'axios';
import InputField from "components/fields/InputField";
import Card from "components/card";
import FancyCircleLoader from "components/FancyCircleLoader";
import PropTypes from "prop-types";
import { FaInfoCircle } from "react-icons/fa";
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

const staticForms = [
  {
    id: "book-reservation",
    title: "Book Reservation Request",
    description: "Reserve a book from the library.",
    fields: [
      { label: "Book Name", type: "text", required: true },
      { label: "Author", type: "text", required: true },
      { label: "Book ID / ISBN", type: "text", required: true },
      { label: "Expected Return Date", type: "date", required: true },
    ],
  },
  {
    id: "book-suggestion",
    title: "Book Suggestion",
    description: "Suggest a new book for the library.",
    fields: [
      { label: "Book Title", type: "text", required: true },
      { label: "Author", type: "text", required: false },
      { label: "Book ID / ISBN", type: "text", required: false },
      { label: "Reason for Suggestion", type: "textarea", required: false },
    ],
  },
  {
    id: "book-renewal",
    title: "Book Renewal Request",
    description: "Request renewal for a borrowed book.",
    fields: [
      { label: "Book ID", type: "text", required: true },
      { label: "Renewal Period (days)", type: "number", required: true },
      { label: "Reason for Renewal Request", type: "textarea", required: false },
    ],
  },
  {
    id: "book-giveaway",
    title: "Giveaway Request",
    description: "Apply for library book giveaways.",
    fields: [
      { label: "Book Title", type: "text", required: true },
      { label: "Quantity", type: "number", required: true },
      { label: "Reason for Request", type: "textarea", required: true },
      { label: "Upload File", type: "file", required: false },
    ],
  },
  {
    id: "book-return-issue",
    title: "Book Return Issue",
    description: "Report a lost or damaged book.",
    fields: [
      { label: "Book ID", type: "text", required: true },
      { label: "Type of Issue", type: "select", options: "Lost,Damaged", required: true },
      { label: "Description of Issue", type: "textarea", required: true },
      { label: "Lost or Damaged Date", type: "date", required: true },
    ],
  },
];

const API_BASE_URL = 'http://localhost:5000'; // Backend API URL

const StudentFormCenter = () => {
  const [forms, setForms] = useState(staticForms);
  const [customForms, setCustomForms] = useState([]); // Separate state for custom forms
  const [selectedForm, setSelectedForm] = useState(null);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [showFormModal, setShowFormModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [newCustomForms, setNewCustomForms] = useState([]); // Track newly added custom forms
  const [showNewFormBadge, setShowNewFormBadge] = useState(false);
  const [toast, setToast] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const [customFormsRes, submissionsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/form-submissions/custom`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/api/form-submissions/my-submissions`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);
        
        const customFormsData = customFormsRes.data.data.map(form => ({
          id: form._id,
          title: form.name,
          description: form.description || `Custom form: ${form.name}`,
          fields: form.fields.map(field => ({
            label: field.name,
            type: field.type,
            required: field.required,
            options: field.options,
          })),
          isCustom: true,
          createdAt: form.createdAt || new Date(),
        }));

        // Check for new custom forms
        const storedForms = JSON.parse(localStorage.getItem('viewedCustomForms') || '[]');
        const newForms = customFormsData.filter(form => 
          !storedForms.includes(form.id) && 
          new Date(form.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Forms newer than 7 days
        );

        setNewCustomForms(newForms);
        setShowNewFormBadge(newForms.length > 0);
        setCustomForms(customFormsData);
        
        setSubmissionHistory(submissionsRes.data.data.map(sub => ({
          ...sub,
          submittedOn: new Date(sub.submittedOn).toLocaleString(),
          lastUpdated: new Date(sub.lastUpdated).toLocaleString()
        })));
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to fetch data. Please ensure you are logged in and the server is running.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    // Poll for updates every 30 seconds
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('No auth token found');
          return;
        }
        const [customFormsRes, submissionsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/form-submissions/custom`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/api/form-submissions/my-submissions`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        const customFormsData = customFormsRes.data.data.map(form => ({
          id: form._id,
          title: form.name,
          description: form.description || `Custom form: ${form.name}`,
          fields: form.fields.map(field => ({
            label: field.name,
            type: field.type,
            required: field.required,
            options: field.options,
          })),
          isCustom: true,
          createdAt: form.createdAt || new Date(),
        }));

        // Check for new forms since last poll
        const storedForms = JSON.parse(localStorage.getItem('viewedCustomForms') || '[]');
        const newForms = customFormsData.filter(form => 
          !storedForms.includes(form.id) && 
          new Date(form.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );

        if (newForms.length > 0) {
          setNewCustomForms(newForms);
          setShowNewFormBadge(true);
        }

        setCustomForms(customFormsData);
        setSubmissionHistory(submissionsRes.data.data.map(sub => ({
          ...sub,
          submittedOn: new Date(sub.submittedOn).toLocaleString(),
          lastUpdated: new Date(sub.lastUpdated).toLocaleString()
        })));
      } catch (err) {
        console.error('Failed to fetch updates:', err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const markFormAsViewed = (formId) => {
    const storedForms = JSON.parse(localStorage.getItem('viewedCustomForms') || '[]');
    if (!storedForms.includes(formId)) {
      const updatedForms = [...storedForms, formId];
      localStorage.setItem('viewedCustomForms', JSON.stringify(updatedForms));
      setNewCustomForms(prev => prev.filter(f => f.id !== formId));
      if (newCustomForms.length <= 1) {
        setShowNewFormBadge(false);
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    selectedForm.fields.forEach((field) => {
      if (field.required && !formData[field.label]) {
        errors[field.label] = "This field is required.";
      }
    });
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No auth token found. Please log in again.');
      }
      
      console.log('Selected Form:', selectedForm);
      console.log('Form Data:', formData);
      
      // Send as regular JSON instead of FormData since we don't have actual files
      const requestData = {
        formType: selectedForm.title,
        formData: {}
      };

      // Map the frontend field labels to backend field names
      selectedForm.fields.forEach(field => {
        const value = formData[field.label];
        if (value !== undefined) {
          requestData.formData[field.label] = value;
        }
      });

      console.log('Request Data:', requestData);

      const response = await axios.post(
        `${API_BASE_URL}/api/form-submissions`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
    setShowFormModal(false);
    setPreviewData({ form: selectedForm, data: formData });
    setShowPreviewModal(true);
    setFormData({});
    setFormErrors({});
    setSelectedForm(null);
      
      // Update submission history after successful submission
      const historyResponse = await axios.get(
        `${API_BASE_URL}/api/form-submissions/my-submissions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmissionHistory(historyResponse.data.data.map(sub => ({
        ...sub,
        submittedOn: new Date(sub.submittedOn).toLocaleString(),
        lastUpdated: new Date(sub.lastUpdated).toLocaleString()
      })));
      showToast('Form submitted successfully! You can view it in your submission history.', 'success');
    } catch (err) {
      console.error('Submission error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to submit form. Please try again.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormFields = (fields) => {
    // Tooltip content for unclear fields
    const tooltipMap = {
      "Reason for Suggestion": "Explain why you think this book should be added to the library.",
      "Type of Issue": "Specify if the book is lost or damaged.",
      "Reason for Request": "Describe why you are requesting this giveaway.",
      "Reason for Renewal Request": "Provide a reason for needing more time with the book.",
      "Description of Issue": "Describe the issue with the book (lost or damaged)."
    };
    return fields.map((field, index) => {
      const error = formErrors[field.label];
      const hasTooltip = tooltipMap[field.label];
      return (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.07 }}
          className="mb-4 relative"
        >
          <label className="text-sm text-navy-700 dark:text-white ml-3 font-bold flex items-center gap-1">
            {field.label}
            {hasTooltip && (
              <span className="group relative inline-block" tabIndex={0} aria-label={tooltipMap[field.label]}>
                <FaInfoCircle className="text-brand-500 cursor-pointer" />
                <span className="absolute left-6 top-1 z-10 hidden group-focus:block group-hover:block bg-navy-900 text-white text-xs rounded px-2 py-1 shadow-lg min-w-[180px]" role="tooltip">
                  {tooltipMap[field.label]}
                </span>
              </span>
            )}
          </label>
          {field.type === "textarea" ? (
            <textarea
              id={`field-${index}`}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              required={field.required}
              className="mt-2 flex w-full items-center justify-center rounded-xl border bg-white/0 p-3 text-sm outline-none border-gray-200 dark:!border-white/10 dark:text-white"
              rows="4"
              value={formData[field.label] || ""}
              onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })}
            />
          ) : field.type === "select" ? (
            <select
              className="mt-2 flex h-12 w-full items-center justify-center rounded-xl border bg-white/0 p-3 text-sm outline-none border-gray-200 dark:!border-white/10 dark:text-white dark:bg-navy-800 [&>option]:dark:bg-navy-800 [&>option]:bg-white"
              required={field.required}
              value={formData[field.label] || ""}
              onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })}
            >
              <option value="" className="dark:bg-navy-800 bg-white">Select {field.label}</option>
              {field.options?.split(",").map((option) => (
                <option key={option} value={option} className="dark:bg-navy-800 bg-white">
                  {option}
                </option>
              ))}
            </select>
          ) : field.type === "file" ? (
            <input
              type="file"
              id={`field-${index}`}
              className="mt-2 flex h-12 w-full items-center justify-center rounded-xl border bg-white/0 p-3 text-sm outline-none border-gray-200 dark:!border-white/10 dark:text-white"
              onChange={(e) => setFormData({ ...formData, [field.label]: e.target.files[0] })}
            />
          ) : (
            <InputField
              label={null}
              id={`field-${index}`}
              type={field.type}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              required={field.required}
              extra="mb-1"
              onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })}
              value={formData[field.label] || ""}
            />
          )}
          {field.type === "file" && formData[field.label] && (
            <div className="text-xs text-gray-500 ml-2">Selected: {formData[field.label].name}</div>
          )}
          {error && (
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: [0, -8, 8, -8, 8, 0] }}
              transition={{ duration: 0.4 }}
              className="text-xs text-red-500 ml-2"
            >
              {error}
            </motion.div>
          )}
        </motion.div>
      );
    });
  };

  const renderSubmissionHistory = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-[200px]">
          <FancyCircleLoader />
        </div>
      );
    }

    if (error) {
      return <div className="text-center py-4 text-red-500">{error}</div>;
    }

    if (!submissionHistory.length) {
      return <div className="text-center py-4">No submissions found</div>;
    }

    // Determine if any submission has an admin comment
    const hasAdminComment = submissionHistory.some(sub => sub.adminComment);

    return (
      <div className="mt-3">
        <h4 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
          Submission History
        </h4>
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-navy-700 dark:bg-navy-900">
                <th className="py-4 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Form Type</th>
                <th className="py-4 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="py-4 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Submitted On</th>
                <th className="py-4 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated</th>
                {hasAdminComment && (
                  <th className="py-4 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Admin Comment</th>
                )}
              </tr>
            </thead>
            <tbody>
              {submissionHistory.map((submission, index) => (
                <tr key={submission._id} className="border-b border-gray-200 dark:border-navy-700 hover:bg-brand-50 dark:hover:bg-navy-900 transition-colors">
                  <td className="py-3 px-4">{submission.formType}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                      submission.status === 'Resolved'
                        ? 'bg-green-100 text-green-800'
                        : submission.status === 'Denied'
                        ? 'bg-red-100 text-red-800'
                        : submission.status === 'In Review'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {/* Status icon */}
                      {submission.status === 'Resolved' && (
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      )}
                      {submission.status === 'Denied' && (
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      )}
                      {submission.status === 'In Review' && (
                        <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" /></svg>
                      )}
                      {submission.status !== 'Resolved' && submission.status !== 'Denied' && submission.status !== 'In Review' && (
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /></svg>
                      )}
                      {submission.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{submission.submittedOn}</td>
                  <td className="py-3 px-4">{submission.lastUpdated}</td>
                  {hasAdminComment && (
                    <td className="py-3 px-4">{submission.adminComment || '-'}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderFormList = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {/* Static Forms */}
        {staticForms.map((form, index) => (
          <motion.div
            key={form.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              extra={`p-4 cursor-pointer ${form.isHighlighted ? 'border-2 border-brand-500 dark:border-brand-400' : ''}`}
              onClick={() => {
                setSelectedForm(form);
                setShowFormModal(true);
              }}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/20">
                  <svg className="h-6 w-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-2">
                    {form.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {form.description}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}

        {/* Custom Forms with enhanced styling */}
        {customForms.map((form) => (
          <motion.div
            key={form.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (staticForms.length + customForms.indexOf(form)) * 0.1 }}
          >
            <Card
              extra={`p-4 cursor-pointer ${
                newCustomForms.some(f => f.id === form.id)
                  ? 'border-2 border-brand-500 dark:border-brand-400 bg-gradient-to-r from-brand-50 to-white dark:from-navy-800 dark:to-navy-900'
                  : ''
              }`}
              onClick={() => {
                setSelectedForm(form);
                setShowFormModal(true);
                markFormAsViewed(form.id);
              }}
            >
              <div className="relative">
                {newCustomForms.some(f => f.id === form.id) && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-brand-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1"
                  >
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    New
                  </motion.span>
                )}
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/20">
                    <svg className="h-6 w-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-2 flex items-center gap-2">
                      {form.title}
                      <span className="text-xs bg-brand-500 text-white px-2 py-1 rounded">
                        Custom
                      </span>
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {form.description}
                    </p>
                    {newCustomForms.some(f => f.id === form.id) && (
                      <p className="text-xs text-brand-500 mt-2 flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Recently added by admin
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000); // Auto dismiss after 3 seconds
  };

  // Focus trap and ESC to close modal
  useEffect(() => {
    if (!showFormModal) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowFormModal(false);
        setSelectedForm(null);
        setFormData({});
        setFormErrors({});
      }
      if (e.key === "Tab" && modalRef.current) {
        const focusableEls = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstEl = focusableEls[0];
        const lastEl = focusableEls[focusableEls.length - 1];
        if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        } else if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showFormModal]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <FancyCircleLoader />
      </div>
    );
  }

  return (
    <div className="mt-3 relative">
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-navy-700 dark:text-white">
          Library Forms
        </h2>
        <div className="flex items-center">
          {showNewFormBadge && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mr-4 bg-brand-500 text-white px-3 py-1 rounded-full text-sm"
            >
              {newCustomForms.length} New Form{newCustomForms.length > 1 ? 's' : ''}!
            </motion.span>
          )}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-white"
          >
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
        </div>
      </div>

      {showHistory ? renderSubmissionHistory() : renderFormList()}

      <AnimatePresence>
        {showFormModal && selectedForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            aria-modal="true"
            role="dialog"
            tabIndex={-1}
            style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(75,0,130,0.15) 0%, rgba(0,0,0,0.7) 100%)" }}
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full max-w-lg rounded-[20px] bg-white p-6 dark:bg-navy-800 shadow-2xl border border-brand-100 dark:border-brand-400 backdrop-blur-md relative"
              role="document"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-bold text-navy-700 dark:text-white">
                  {selectedForm.title}
                  </h4>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {selectedForm.description}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowFormModal(false);
                    setSelectedForm(null);
                    setFormData({});
                    setFormErrors({});
                  }}
                  className="text-xl font-bold text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleFormSubmit} aria-label={`Form for ${selectedForm.title}`}>
                {renderFormFields(selectedForm.fields)}
                {error && (
                  <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: [0, -8, 8, -8, 8, 0] }}
                    transition={{ duration: 0.4 }}
                    className="mb-4 text-red-500 text-sm"
                  >
                    {error}
                  </motion.div>
                )}
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowFormModal(false);
                      setSelectedForm(null);
                      setFormData({});
                      setFormErrors({});
                    }}
                    className="linear rounded-[10px] bg-gray-100 px-4 py-2 text-base font-medium text-navy-700 transition duration-200 hover:bg-gray-200 active:bg-gray-300 dark:bg-navy-700 dark:text-white dark:hover:bg-navy-600 dark:active:bg-navy-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="linear rounded-[10px] bg-brand-500 px-4 py-2 text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-500 dark:active:bg-brand-600 disabled:opacity-50 flex items-center gap-2"
                    aria-busy={isLoading}
                  >
                    {isLoading ? <FancyCircleLoader /> : 'Submit'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPreviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full max-w-lg rounded-[20px] bg-white p-6 dark:bg-navy-800"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-bold text-navy-700 dark:text-white">
                    Form Submission Preview
                  </h4>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Review your submission for {previewData.form.title}
                  </p>
                </div>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-xl font-bold text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              <div className="mb-6 grid grid-cols-1 gap-3">
                {Object.entries(previewData.data).map(([key, value], index) => (
                  <div key={index}>
                    <span className="text-sm font-medium text-navy-700 dark:text-white">
                      {key}:
                          </span>
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      {value instanceof File ? value.name : value || "(Not provided)"}
                          </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="linear rounded-[10px] bg-brand-500 px-4 py-2 text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-500 dark:active:bg-brand-600"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

StudentFormCenter.propTypes = {};

export default StudentFormCenter; 