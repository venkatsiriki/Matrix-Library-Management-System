import React, { useState, useMemo, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useForm } from 'react-hook-form';
import { MdCheckCircle, MdWarning } from 'react-icons/md';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getBorrowRecords } from '../../../api/borrowApi';
import axios from 'axios';
import FancyCircleLoader from 'components/FancyCircleLoader';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { FaCheckCircle, FaExclamationTriangle, FaSearch, FaRupeeSign } from 'react-icons/fa';

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity">
      <div className="bg-white dark:bg-navy-800 rounded-lg shadow-lg w-full max-w-md mx-4 p-6 relative animate-fadeIn">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        {title && <h3 className="text-lg font-bold mb-4 text-navy-700 dark:text-white">{title}</h3>}
        {children}
      </div>
    </div>
  );
};

// Fine Summary Card
const FineSummaryCard = ({ pendingFine, onClick }) => (
  <div
    className="bg-white/80 dark:bg-navy-800/80 rounded-lg shadow-lg p-4 flex items-center justify-between cursor-pointer backdrop-blur-md border border-gray-100 dark:border-navy-700"
    onClick={onClick}
    style={{ transition: 'box-shadow 0.2s' }}
    tabIndex={0}
    role="button"
    aria-label="Pay pending fine"
  >
    <div className="flex items-center gap-3">
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900">
        <FaRupeeSign className="text-red-500 text-2xl" />
      </span>
      <div>
        <div className="text-sm text-gray-500">Pending Fine</div>
        <div className="text-2xl font-bold text-red-600 dark:text-red-400">₹{pendingFine}</div>
      </div>
    </div>
    <span className="text-blue-600 font-semibold">Pay Now &rarr;</span>
  </div>
);

FineSummaryCard.propTypes = {
  pendingFine: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
};

// Borrow History Table
const FINE_RATE = 1; // ₹1 per day
function calculateFine(returnDate, status, finePaid) {
  if (status !== 'Overdue' || finePaid) return 0;
  const today = new Date();
  const due = new Date(returnDate);
  const diff = Math.ceil((today - due) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff * FINE_RATE : 0;
}
const BorrowHistoryTable = ({ history }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 dark:border-navy-700 dark:bg-navy-900">
            <th className="py-4 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Book Title</th>
            <th className="py-4 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Department</th>
            <th className="py-4 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Roll Number</th>
            <th className="py-4 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Borrow Date</th>
            <th className="py-4 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Due Date</th>
            <th className="py-4 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Return Date</th>
            <th className="py-4 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
            <th className="py-4 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Fine</th>
          </tr>
        </thead>
        <tbody>
          {history.map((record) => (
            <tr key={record._id} className="border-b border-gray-200 dark:border-navy-700">
              <td className="py-3 px-4">{record.book.title}</td>
              <td className="py-3 px-4">{record.student.department}</td>
              <td className="py-3 px-4">{record.student.rollNumber}</td>
              <td className="py-3 px-4">{new Date(record.borrowDate).toLocaleDateString()}</td>
              <td className="py-3 px-4">{new Date(record.dueDate).toLocaleDateString()}</td>
              <td className="py-3 px-4">{record.returnDate ? new Date(record.returnDate).toLocaleDateString() : '-'}</td>
              <td className="py-3 px-4">
                <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                  record.status === 'Returned'
                    ? 'bg-green-100 text-green-800'
                    : record.status === 'Overdue'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                  }`}>
                  {record.status}
                  </span>
                </td>
              <td className="py-3 px-4">{record.fine > 0 ? `₹${record.fine}` : '-'}</td>
              </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Extend Return Modal
const ExtendReturnModal = ({ isOpen, onClose, onSubmit, currentReturnDate, maxExtensionDate }) => {
  const [dateValue, setDateValue] = React.useState(currentReturnDate || '');

  React.useEffect(() => {
    if (isOpen) {
      setDateValue(currentReturnDate || '');
    }
  }, [isOpen, currentReturnDate]);

  const [error, setError] = React.useState('');

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!dateValue) {
      setError('Please select a date');
      return;
    }
    if (dateValue <= currentReturnDate) {
      setError('Date must be after current return date');
      return;
    }
    if (maxExtensionDate && dateValue > maxExtensionDate) {
      setError(`Date must be on or before ${maxExtensionDate}`);
      return;
    }
    onSubmit({ newReturnDate: dateValue });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Extend Return Date">
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-white">New Return Date</label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 bg-white text-gray-900 border-gray-300 dark:bg-navy-700 dark:text-white dark:border-white/10 dark:focus:border-blue-400"
            value={dateValue}
            min={currentReturnDate}
            max={maxExtensionDate}
            onChange={e => setDateValue(e.target.value)}
          />
          {error && <span className="text-red-500 text-xs">{error}</span>}
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-white" onClick={onClose}>Cancel</button>
          <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Submit</button>
        </div>
      </form>
    </Modal>
  );
};

// Pay Fine Modal
const PhonePeLogo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="20" fill="#6739B7"/>
    <g>
      <circle cx="20" cy="20" r="13" fill="#fff"/>
      <path d="M25.5 16.5h-5A1.5 1.5 0 0 0 19 18v3a1.5 1.5 0 0 0 1.5 1.5h5A1.5 1.5 0 0 0 27 21v-3a1.5 1.5 0 0 0-1.5-1.5Zm-2.5 4.5v-1h-1v-1h1v-1h1v1h1v1h-1v1h-1Z" fill="#6739B7"/>
    </g>
  </svg>
);

const BackArrow = ({ onClick }) => (
  <button onClick={onClick} className="absolute top-4 left-4 p-1 rounded-full bg-white/80 hover:bg-white shadow text-[#6739B7]" aria-label="Back">
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="#6739B7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  </button>
);

const SecuredByPhonePe = () => (
  <div className="flex items-center justify-center gap-2 mt-6 mb-2">
    <PhonePeLogo />
    <span className="text-xs text-[#6739B7] font-semibold">Secured by PhonePe</span>
  </div>
);

const Shimmer = () => (
  <div className="w-full flex flex-col items-center gap-4 animate-pulse py-8">
    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6739B7]/60 to-[#4F2D7F]/60" />
    <div className="w-2/3 h-6 rounded bg-gray-200/60" />
    <div className="w-1/2 h-4 rounded bg-gray-200/40" />
    <div className="w-1/3 h-4 rounded bg-gray-200/30" />
  </div>
);

const PayFineModal = ({ isOpen, onClose, fineAmount, onPay }) => {
  const [copied, setCopied] = React.useState(false);
  const [step, setStep] = React.useState('main'); // main | processing | success
  const upiId = 'library@upi';
  const qrPlaceholder = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=library@upi';

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handlePay = () => {
    setStep('processing');
    setTimeout(() => setStep('success'), 1600);
    setTimeout(() => {
      setStep('main');
      onPay();
    }, 3200);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={null}>
      <div className="relative rounded-2xl overflow-visible w-full max-w-md mx-auto shadow-2xl border border-[#E1CFFF] dark:border-navy-700" style={{background: 'none', boxShadow: 'none', border: 'none'}}>
        <BackArrow onClick={onClose} />
        <div className="flex flex-col items-center py-6 px-4 sm:px-8 rounded-2xl bg-white/95 dark:bg-navy-900/95" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)', border: '1.5px solid #E1CFFF'}}>
          <div className="flex flex-col items-center w-full">
            <div className="flex items-center gap-2 mb-2">
              <PhonePeLogo />
              <span className="text-2xl font-bold text-[#6739B7] dark:text-[#B39DDB] tracking-tight">PhonePe</span>
            </div>
            <div className="text-xs text-gray-500 mb-1">Pay to: <span className="font-semibold text-navy-700 dark:text-white">Matrix Library</span></div>
            <div className="text-xs text-gray-400 mb-2">Merchant UPI: <span className="font-mono text-gray-700 dark:text-gray-200">{upiId}</span></div>
          </div>
          {step === 'main' && (
            <>
              <div className="flex flex-col items-center gap-2 mb-4">
                <img src={qrPlaceholder} alt="UPI QR" className="w-36 h-36 rounded-lg shadow border border-gray-200 dark:border-navy-700 bg-white" />
                <button
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-[#F3E8FF] text-[#6739B7] font-semibold border border-[#E1CFFF] hover:bg-[#E1CFFF] transition"
                  onClick={handleCopy}
                  type="button"
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="#6739B7" d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1Zm3 4H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 18H8V7h11v16Z"/></svg>
                  {copied ? 'Copied!' : 'Copy UPI ID'}
                </button>
              </div>
              <div className="w-full flex flex-col items-center mb-4">
                <span className="text-xs text-gray-500 mb-1">Amount to Pay</span>
                <span className="text-3xl font-extrabold text-[#6739B7] dark:text-[#B39DDB]">₹{fineAmount}</span>
              </div>
              <button
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#6739B7] to-[#4F2D7F] text-white font-bold text-lg shadow hover:scale-105 transition-transform flex items-center justify-center gap-2"
                onClick={handlePay}
              >
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-2h2v2Zm1.07-7.75-.9.92C12.45 10.9 12 11.5 12 13h-2v-.5c0-.8.45-1.5 1.17-2.08l1.24-1.26A2 2 0 1 0 10 7H8a4 4 0 1 1 8 0c0 1.1-.45 2.1-1.17 2.75Z"/></svg>
                Pay with PhonePe
              </button>
            </>
          )}
          {step === 'processing' && <Shimmer />}
          {step === 'success' && (
            <div className="flex flex-col items-center gap-2 w-full animate-fadeIn py-8">
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="30" fill="#4CAF50"/><path d="M18 32l8 8 16-16" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="text-lg font-bold text-green-600">Payment Successful</span>
            </div>
          )}
          <SecuredByPhonePe />
          <div className="w-full flex justify-center mt-2 mb-1">
            <a href="https://support.phonepe.com/" target="_blank" rel="noopener noreferrer" className="text-xs text-[#6739B7] underline hover:text-[#4F2D7F]">Need help?</a>
          </div>
          <button
            className="mt-2 w-full py-2 px-4 rounded-xl bg-gray-200 text-gray-700 dark:bg-navy-700 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-navy-600 transition"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Main BorrowHistory Component
const MAX_EXTENSION_DAYS = 7;
const initialHistory = [
  {
    id: 1,
    bookId: 'BK1001',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    genre: 'Classic',
    rack: 'A1',
    borrowDate: '2024-05-01',
    returnDate: '2024-05-15',
    status: 'Returned',
    finePaid: false,
    remarks: 'No damage'
  },
  {
    id: 2,
    bookId: 'BK1002',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    genre: 'Classic',
    rack: 'A2',
    borrowDate: '2024-05-10',
    returnDate: '2024-05-24',
    status: 'Overdue',
    finePaid: false,
    remarks: 'Slightly torn cover'
  },
  {
    id: 3,
    bookId: 'BK1003',
    title: '1984',
    author: 'George Orwell',
    genre: 'Dystopian',
    rack: 'B1',
    borrowDate: '2024-05-20',
    returnDate: null,
    status: 'Active',
    finePaid: false,
    remarks: ''
  },
  {
    id: 4,
    bookId: 'BK1004',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    genre: 'Romance',
    rack: 'A3',
    borrowDate: '2024-04-15',
    returnDate: '2024-04-29',
    status: 'Returned',
    finePaid: false,
    remarks: 'Returned late'
  },
  {
    id: 5,
    bookId: 'BK1005',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    genre: 'Fiction',
    rack: 'B2',
    borrowDate: '2024-03-10',
    returnDate: '2024-03-24',
    status: 'Returned',
    finePaid: false,
    remarks: ''
  },
  {
    id: 6,
    bookId: 'BK1006',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    genre: 'History',
    rack: 'C1',
    borrowDate: '2024-05-05',
    returnDate: '2024-05-19',
    status: 'Returned',
    finePaid: false,
    remarks: 'Excellent condition'
  },
  {
    id: 7,
    bookId: 'BK1007',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    genre: 'Adventure',
    rack: 'C2',
    borrowDate: '2024-05-12',
    returnDate: null,
    status: 'Active',
    finePaid: false,
    remarks: ''
  }
];

const BorrowHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [extendModal, setExtendModal] = useState({ open: false, row: null });
  const [payFineModal, setPayFineModal] = useState({ open: false, row: null, fine: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageHistory = history.slice(startIndex, endIndex);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const records = await getBorrowRecords('/borrow-records/student');
        setHistory(records);
      } catch (error) {
        console.error('Error fetching borrow history:', error);
        toast.error('Failed to fetch borrow history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Calculate total pending fine
  const pendingFine = useMemo(
    () => history.reduce((sum, item) => sum + (item.fine && !item.finePaid ? item.fine : 0), 0),
    [history]
  );

  // Get user email from localStorage or context (adjust as needed)
  const userEmail = React.useMemo(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        return JSON.parse(user).email;
      } catch {
        return '';
      }
    }
    return '';
  }, []);

  // Handlers
  const handleExtend = (row) => {
    setExtendModal({ open: true, row });
  };
  const handleExtendSubmit = (data) => {
    // Dummy API simulation
    setTimeout(() => {
      setHistory((prev) =>
        prev.map((item) =>
          item.id === extendModal.row.id
            ? { ...item, returnDate: data.newReturnDate }
            : item
        )
      );
      setExtendModal({ open: false, row: null });
      toast.success('Return date extended successfully!');
    }, 700);
  };
  const handlePayFine = (row, fine) => {
    setPayFineModal({ open: true, row, fine });
  };
  const handleCompletePayment = () => {
    // Dummy API simulation
    setTimeout(() => {
      setHistory((prev) =>
        prev.map((item) =>
          item.id === payFineModal.row.id
            ? { ...item, finePaid: true }
            : item
        )
      );
      setPayFineModal({ open: false, row: null, fine: 0 });
      toast.success('Fine payment successful!');
    }, 700);
  };
  const handleFineSummaryClick = () => {
    // Open modal for first unpaid fine
    const firstUnpaid = history.find(
      (item) => item.fine > 0 && !item.finePaid
    );
    if (firstUnpaid) {
      setPayFineModal({
        open: true,
        row: firstUnpaid,
        fine: firstUnpaid.fine,
      });
    } else {
      toast.info('No pending fines!');
    }
  };

  // For Extend Modal: calculate max extension date
  const getMaxExtensionDate = (currentReturnDate) => {
    const date = new Date(currentReturnDate);
    date.setDate(date.getDate() + MAX_EXTENSION_DAYS);
    return date.toISOString().split('T')[0];
  };

  // PaginationControls component (from admin scanner)
  const PaginationControls = ({ currentPage, totalPages, onPageChange, totalEntries }) => (
    <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
        Showing {history.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, history.length)} of {history.length} entries
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded-lg border border-gray-300 px-3 py-1 text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-navy-600 dark:text-gray-400 dark:hover:bg-navy-700"
          aria-label="Previous page"
        >
          Previous
        </button>
        <div className="flex items-center gap-1">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => onPageChange(i + 1)}
              className={`rounded-lg px-3 py-1 text-xs sm:text-sm font-medium ${
                currentPage === i + 1
                  ? 'bg-brand-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-navy-700'
              }`}
              aria-label={`Page ${i + 1}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded-lg border border-gray-300 px-3 py-1 text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-navy-600 dark:text-gray-400 dark:hover:bg-navy-700"
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <FancyCircleLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-transparent px-2 sm:px-4 md:px-8">
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="w-full flex flex-row justify-end mt-8 px-0 sm:px-4 md:px-8">
        <div className="max-w-xs w-full">
          <FineSummaryCard pendingFine={pendingFine} onClick={handleFineSummaryClick} />
        </div>
      </div>
      <div className="w-full flex flex-col items-center mt-8 px-0 sm:px-4 md:px-8">
        <div className="w-full max-w-6xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 w-full gap-2">
            <h4 className="text-xl sm:text-2xl font-bold text-navy-700 dark:text-white">Borrow History</h4>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <FaSearch className="text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by book or status..."
                className="rounded-lg border border-gray-200 dark:border-navy-700 px-3 py-2 text-sm w-full max-w-xs bg-white dark:bg-navy-900 text-navy-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                aria-label="Search borrow history"
              />
            </div>
          </div>
          <div className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-navy-700 dark:bg-navy-900">
                  <th className="py-4 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Book Title</th>
                  <th className="py-4 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Department</th>
                  <th className="py-4 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Roll Number</th>
                  <th className="py-4 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Borrow Date</th>
                  <th className="py-4 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Due Date</th>
                  <th className="py-4 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Return Date</th>
                  <th className="py-4 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                  <th className="py-4 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Fine</th>
                </tr>
              </thead>
              <tbody>
                {currentPageHistory.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-6 text-center text-gray-400">
                      No borrow history found.
                    </td>
                  </tr>
                ) : (
                  currentPageHistory.map((record, idx) => (
                    <tr
                      key={record._id || record.id || idx}
                      className={`border-b border-gray-200 last:border-none hover:bg-gray-50 dark:border-navy-700 dark:hover:bg-navy-700`}
                    >
                      <td className="py-4 px-4 font-medium text-navy-700 dark:text-white">{record.book?.title || '-'}</td>
                      <td className="py-4 px-4">{record.student?.department || '-'}</td>
                      <td className="py-4 px-4 font-mono text-sm">{record.student?.rollNumber || '-'}</td>
                      <td className="py-4 px-4">{record.borrowDate ? new Date(record.borrowDate).toLocaleDateString() : '-'}</td>
                      <td className="py-4 px-4">{record.dueDate ? new Date(record.dueDate).toLocaleDateString() : '-'}</td>
                      <td className="py-4 px-4">{record.returnDate ? new Date(record.returnDate).toLocaleDateString() : '-'}</td>
                      <td className="py-4 px-4">
                        <span className={`rounded-full px-3 py-1 text-sm font-medium ${
                          record.status === 'Returned'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200'
                            : record.status === 'Overdue'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200'
                            : 'bg-gray-100 text-gray-600 dark:bg-navy-700 dark:text-gray-400'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {record.fine > 0 && !record.finePaid ? (
                          <span className="text-red-600 font-bold">₹{record.fine}</span>
                        ) : record.fine > 0 && record.finePaid ? (
                          <span className="text-green-600 font-bold">₹{record.fine}</span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalEntries={history.length}
            />
          </div>
        </div>
      </div>
      <ExtendReturnModal
        isOpen={extendModal.open}
        onClose={() => setExtendModal({ open: false, row: null })}
        onSubmit={handleExtendSubmit}
        currentReturnDate={extendModal.row?.returnDate || ''}
        maxExtensionDate={extendModal.row ? getMaxExtensionDate(extendModal.row.returnDate) : ''}
      />
      <PayFineModal
        isOpen={payFineModal.open}
        onClose={() => setPayFineModal({ open: false, row: null, fine: 0 })}
        fineAmount={payFineModal.fine}
        onPay={handleCompletePayment}
      />
    </div>
  );
};

export default BorrowHistory;