import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaExclamationTriangle,
  FaBarcode,
  FaTimes,
  FaMoneyBill,
  FaChartBar,
  FaBook,
  FaUndo,
  FaPlus,
  FaUser,
  FaCalendar,
  FaBookOpen,
  FaClock,
  FaRupeeSign,
  FaStar,
  FaListAlt,
  FaEnvelope,
  FaCalendarPlus,
  FaEnvelopeOpenText,
} from "react-icons/fa";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../../store/actions/index";
import {
  getBorrowRecords,
  borrowBook,
  returnBook,
  updateBorrowRecord,
  sendReminder,
  markFinePaid,
  waiveFine,
  getBooks,
  getStudentByRollNumber,
  getStudentBorrowHistory,
  sendEmailNotification,
  extendBorrowPeriod,
} from "../../../api/borrowApi";
import Card from "../../../components/card";

const LIBRARY_CONFIG = {
  MAX_BOOKS_PER_STUDENT: 4,
  DEFAULT_GRACE_PERIOD: 7,
  DEFAULT_FINE_RATE: 1,
  MAX_FINE: 50,
  BRANCHES: ["CSE", "ECE", "MECH", "IT", "CIVIL", "EEE", "MCA"],
  BOOK_CONDITIONS: ["New", "Good", "Used", "Damaged"],
};

const BorrowHistory = ({ setBreadcrumbItems, user }) => {
  document.title = "Library Manager";

  const breadcrumbItems = [
    { title: "Aditya University", link: "#" },
    { title: "Library", link: "#" },
    { title: "Library Manager", link: "#" },
  ];

  const isAdmin = user?.role === "admin";
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    setBreadcrumbItems("Library Manager", breadcrumbItems);
    const fetchData = async () => {
      try {
        let recordsData;
        if (selectedStudent) {
          recordsData = await getStudentBorrowHistory(selectedStudent._id);
        } else {
        const endpoint = isAdmin ? "/borrow-records" : "/borrow-records/student";
          recordsData = await getBorrowRecords(endpoint);
        }
        const booksData = isAdmin ? await getBooks() : [];
        
        setRecords(recordsData);
        setBooksState(booksData);
      } catch (err) {
        console.error("Fetch error:", err.message, err.response?.data);
        setError("Failed to fetch data from server");
      }
    };
    fetchData();
  }, [setBreadcrumbItems, isAdmin, selectedStudent]);

  const [records, setRecords] = useState([]);
  const [booksState, setBooksState] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modal, setModal] = useState(false);
  const [actionRecord, setActionRecord] = useState(null);
  const [newDueDate, setNewDueDate] = useState("");
  const [maxBooks, setMaxBooks] = useState(LIBRARY_CONFIG.MAX_BOOKS_PER_STUDENT);
  const [borrowModal, setBorrowModal] = useState(false);
  const [scannedStudent, setScannedStudent] = useState(null);
  const [scannedBook, setScannedBook] = useState(null);
  const [borrowDate, setBorrowDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(
    new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [conditionAtIssue, setConditionAtIssue] = useState("New");
  const [notes, setNotes] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [borrowStep, setBorrowStep] = useState(1);
  const [returnModal, setReturnModal] = useState(false);
  const [returnStep, setReturnStep] = useState(1);
  const [returnStudent, setReturnStudent] = useState(null);
  const [returnBarcodeInput, setReturnBarcodeInput] = useState("");
  const [selectedBorrowedBook, setSelectedBorrowedBook] = useState(null);
  const [returnCondition, setReturnCondition] = useState("Good");
  const [returnNotes, setReturnNotes] = useState("");
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [exportModal, setExportModal] = useState(false);
  const [newNotes, setNewNotes] = useState("");
  const [fineModal, setFineModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [fineAmount, setFineAmount] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [emailAllLoading, setEmailAllLoading] = useState(false);

  const canBorrow = (student, book) => {
    const currentBooks = records.filter(
      (r) => r.student._id === student._id && r.status !== "Returned"
    ).length;
    if (currentBooks >= maxBooks) {
      return { allowed: false, message: `Student has already borrowed ${maxBooks} books.` };
    }
    if (book.status !== "Available") {
      return { allowed: false, message: `Book is ${book.status.toLowerCase()} and cannot be borrowed.` };
    }
    if (book.available <= 0) {
      return { allowed: false, message: "No copies of this book are available." };
    }
    if (student.year === "1st" && book.categories.includes("Competitive Exams")) {
      return { allowed: false, message: "First-year students cannot borrow Competitive Exams books." };
    }
    return { allowed: true };
  };

  const handleBorrowBook = async () => {
    try {
      if (!scannedStudent || !scannedBook) {
        throw new Error("Please select a student and a book.");
      }
      if (!dueDate) {
        throw new Error("Please set a due date.");
      }

      const canBorrowResult = canBorrow(scannedStudent, scannedBook);
      if (!canBorrowResult.allowed) {
        throw new Error(canBorrowResult.message);
      }

      const newRecord = await borrowBook({
        studentId: scannedStudent._id,
        bookId: scannedBook.id,
        dueDate,
        conditionAtIssue,
        notes,
        issuedBy: user.name || user.email || 'Admin',
      });

      setRecords([...records, newRecord]);
      setBooksState(
        booksState.map((b) =>
          b.id === scannedBook.id ? { ...b, available: b.available - 1 } : b
        )
      );

      setSuccess(`Book "${scannedBook.title}" successfully borrowed by ${scannedStudent.name}!`);
      setBorrowModal(false);
      setBorrowStep(1);
      setScannedStudent(null);
      setScannedBook(null);
      setBarcodeInput("");
      setDueDate(new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
      setBorrowDate(new Date().toISOString().split("T")[0]);
      setConditionAtIssue("New");
      setNotes("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleBarcodeScan = async () => {
    if (borrowStep === 1) {
      try {
        const student = await getStudentByRollNumber(barcodeInput);
        setScannedStudent(student);
        setBarcodeInput("");
        setBorrowStep(2);
      } catch (error) {
        setError("Invalid student ID. Please try again.");
        setTimeout(() => setError(""), 3000);
      }
    } else if (borrowStep === 2) {
      const book = booksState.find((b) => b.isbn === barcodeInput);
      if (book) {
        const canBorrowResult = canBorrow(scannedStudent, book);
        if (!canBorrowResult.allowed) {
          setError(canBorrowResult.message);
          setTimeout(() => setError(""), 3000);
          return;
        }
        setScannedBook(book);
        setBarcodeInput("");
      } else {
        setError("Invalid book ISBN. Please try again.");
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  const handleReturnBarcodeScan = async () => {
    try {
      const student = await getStudentByRollNumber(returnBarcodeInput);
      setReturnStudent(student);
      setReturnBarcodeInput("");
      setReturnStep(2);
    } catch (error) {
      setError("Invalid student ID. Please try again.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleBookReturn = async (record) => {
    try {
      if (!record) {
        throw new Error("No book selected for return.");
      }

      const updatedRecord = await returnBook(record._id, {
        returnCondition,
        returnNotes,
      });

      setRecords(
        records.map((r) => (r._id === record._id ? updatedRecord : r))
      );
      setBooksState(
        booksState.map((b) =>
          b.id === record.book.id ? { ...b, available: b.available + 1 } : b
        )
      );

      setSuccess(`Book "${record.book.title}" successfully returned!`);
      setReturnModal(false);
      setReturnStep(1);
      setReturnStudent(null);
      setSelectedBorrowedBook(null);
      setReturnBarcodeInput("");
      setReturnCondition("Good");
      setReturnNotes("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleMarkReturned = async (recordId) => {
    try {
      const record = records.find((r) => r._id === recordId);
      if (!record) {
        throw new Error("Record not found.");
      }
      if (record.status === "Returned") {
        throw new Error("This book has already been returned.");
      }

      const updatedRecord = await returnBook(recordId, {
        returnCondition: "Good",
        returnNotes: "",
      });

      setRecords(
        records.map((r) => (r._id === recordId ? updatedRecord : r))
      );
      setBooksState(
        booksState.map((b) =>
          b.id === record.book.id ? { ...b, available: b.available + 1 } : b
        )
      );

      setSuccess("Book successfully marked as returned!");
      setModal(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleSendReminder = async (recordId, type = 'due') => {
    try {
      await sendEmailNotification(recordId, { type });
      setSuccess(`${type === 'fine' ? 'Fine reminder' : 'Due date reminder'} sent successfully!`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleExtendDueDate = async () => {
    try {
      if (!actionRecord) {
        throw new Error("No book selected for extending due date.");
      }

      if (!newDueDate) {
        throw new Error("Please select a new due date.");
      }

      const updatedRecord = await extendBorrowPeriod(actionRecord._id, newDueDate);
      setRecords(
        records.map((r) => (r._id === actionRecord._id ? updatedRecord : r))
      );
      setSuccess("Due date extended successfully!");
      setModal(false);
      setActionRecord(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleMarkFinePaid = async (recordId) => {
    try {
      const record = records.find((r) => r._id === recordId);
      if (!record) {
        throw new Error("Record not found.");
      }
      if (record.fine <= 0) {
        throw new Error("There is no fine to be paid for this record.");
      }
      if (record.paymentStatus === "Paid") {
        throw new Error("This fine has already been paid.");
      }
      if (record.paymentStatus === "Waived") {
        throw new Error("This fine has been waived and doesn't require payment.");
      }

      const updatedRecord = await markFinePaid(recordId, "cash");
      setRecords(
        records.map((r) => (r._id === recordId ? updatedRecord : r))
      );

      if (updatedRecord.status === "Returned" && !record.returnDate) {
        setBooksState(
          booksState.map((b) =>
            b.id === record.book.id ? { ...b, available: b.available + 1 } : b
          )
        );
      }

      const successMessage =
        updatedRecord.status === "Returned" && !record.returnDate
          ? `Fine of ₹${record.fine} marked as paid and book returned!`
          : `Fine of ₹${record.fine} marked as paid!`;
      setSuccess(successMessage);
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleWaiveFine = async (recordId) => {
    try {
      const record = records.find((r) => r._id === recordId);
      if (!record) {
        throw new Error("Record not found.");
      }
      if (record.fine <= 0) {
        throw new Error("There is no fine to be waived for this record.");
      }
      if (record.paymentStatus === "Paid") {
        throw new Error("This fine has already been paid and cannot be waived.");
      }
      if (record.paymentStatus === "Waived") {
        throw new Error("This fine has already been waived.");
      }

      const updatedRecord = await waiveFine(recordId);
      setRecords(
        records.map((r) => (r._id === recordId ? updatedRecord : r))
      );

      setSuccess(`Fine of ₹${record.fine} waived successfully!`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleAddFine = async () => {
    try {
      if (!selectedRecord || !fineAmount || isNaN(fineAmount)) {
        throw new Error('Please enter a valid fine amount');
      }

      const updatedRecord = await updateBorrowRecord(selectedRecord._id, {
        fine: Number(fineAmount),
        paymentStatus: 'Pending'
      });

      setRecords(
        records.map((r) => (r._id === selectedRecord._id ? updatedRecord : r))
      );
      setSuccess('Fine added successfully!');
      setFineModal(false);
      setSelectedRecord(null);
      setFineAmount('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch = searchTerm
        ? (record.student && record.student.rollNumber && record.student.rollNumber.includes(searchTerm)) ||
          (record.student && record.student.name && record.student.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (record.book && record.book.title && record.book.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (record.book && record.book.isbn && record.book.isbn.includes(searchTerm))
        : true;
      const matchesStatus =
        filterStatus === "All" ||
        record.status === filterStatus ||
        (filterStatus === "Fines" && record.fine > 0);
      return matchesSearch && matchesStatus;
    });
  }, [records, searchTerm, filterStatus]);

  const mostBorrowedBooks = booksState
    .filter(book => book && book.id && book.title) // Add title check
    .map((book) => ({
      title: book.title,
      count: records.filter((r) => r.book && r.book.id === book.id).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const avgReturnTime =
    records
      .filter((r) => r.returnDate)
      .reduce((sum, r) => {
        const borrow = new Date(r.borrowDate);
        const returnDate = new Date(r.returnDate);
        return sum + (returnDate - borrow) / (24 * 60 * 60 * 1000);
      }, 0) / (records.filter((r) => r.returnDate).length || 1);

  const topOverdueStudents = Array.from(
    new Set(records.filter(r => r.student).map((r) => JSON.stringify(r.student))) // Add null check
  )
    .map((s) => JSON.parse(s))
    .map((student) => ({
      name: student.name,
      rollNumber: student.rollNumber,
      overdueCount: records.filter(
        (r) =>
          r.student && r.student.rollNumber === student.rollNumber && r.status === "Overdue" // Add null check
      ).length,
    }))
    .sort((a, b) => b.overdueCount - a.overdueCount)
    .slice(0, 5);

  const fineSummaryByMonth = Array.from({ length: 6 }, (_, i) => {
    const month = new Date(2025, i, 1).toLocaleString("en-IN", {
      month: "long",
    });
    return {
      month,
      totalFine: records
        .filter((r) => new Date(r.borrowDate).getMonth() === i && r.fine > 0)
        .reduce((sum, r) => sum + r.fine, 0),
    };
  });

  const bookDemandByDepartment = LIBRARY_CONFIG.BRANCHES.map((branch) => ({
    branch,
    count: records.filter((r) => r.student && r.student.branch === branch).length, // Add null check
  }));

  const handleNextStep = () => {
    if (borrowStep === 1 && scannedStudent) {
      setBorrowStep(2);
      setBarcodeInput("");
      setError("");
    }
  };

  const handleBackStep = () => {
    if (borrowStep === 2) {
      setBorrowStep(1);
      setScannedBook(null);
      setBarcodeInput("");
      setError("");
    }
  };

  const handleReturnNextStep = () => {
    if (returnStep === 1 && returnStudent) {
      setReturnStep(2);
    } else if (returnStep === 2 && selectedBorrowedBook) {
      setReturnStep(3);
    }
  };

  const handleReturnBackStep = () => {
    if (returnStep === 2) {
      setReturnStep(1);
      setSelectedBorrowedBook(null);
      setReturnBarcodeInput("");
    } else if (returnStep === 3) {
      setReturnStep(2);
      setReturnCondition("Good");
      setReturnNotes("");
    }
  };

  const handleExportSelected = () => {
    if (selectedRecords.length === 0) {
      setError("Please select at least one record to export");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setExportModal(true);
  };

  const exportActiveRecords = () => {
    const activeRecords = selectedRecords.filter(
      (record) => record.status === "Borrowed"
    );
    exportToCSV(activeRecords, "active_records");
  };

  const exportOverdueRecords = () => {
    const overdueRecords = selectedRecords.filter(
      (record) => record.status === "Overdue"
    );
    exportToCSV(overdueRecords, "overdue_records");
  };

  const exportReturnedRecords = () => {
    const returnedRecords = selectedRecords.filter(
      (record) => record.status === "Returned"
    );
    exportToCSV(returnedRecords, "returned_records");
  };

  const exportFineRecords = () => {
    const fineRecords = selectedRecords.filter((record) => record.fine > 0);
    exportToCSV(fineRecords, "fine_records");
  };

  const exportAnalytics = () => {
    const analytics = {
      totalRecords: selectedRecords.length,
      activeCount: selectedRecords.filter((r) => r.status === "Borrowed").length,
      overdueCount: selectedRecords.filter((r) => r.status === "Overdue").length,
      returnedCount: selectedRecords.filter((r) => r.status === "Returned").length,
      totalFines: selectedRecords.reduce((sum, r) => sum + (r.fine || 0), 0),
      averageBorrowDuration:
        selectedRecords
          .filter((r) => r.returnDate)
          .reduce((sum, r) => {
            const borrow = new Date(r.borrowDate);
            const returnDate = new Date(r.returnDate);
            return sum + (returnDate - borrow) / (24 * 60 * 60 * 1000);
          }, 0) / (selectedRecords.filter((r) => r.returnDate).length || 1),
      branchStats: LIBRARY_CONFIG.BRANCHES.reduce((acc, branch) => {
        const branchRecords = selectedRecords.filter((r) => r.student.branch === branch);
        acc[branch] = {
          total: branchRecords.length,
          active: branchRecords.filter((r) => r.status === "Borrowed").length,
          overdue: branchRecords.filter((r) => r.status === "Overdue").length,
          returned: branchRecords.filter((r) => r.status === "Returned").length,
          fines: branchRecords.reduce((sum, r) => sum + (r.fine || 0), 0),
        };
        return acc;
      }, {}),
    };

    const csvContent = [
      ["Metric", "Value"].join(","),
      ["Total Records", analytics.totalRecords].join(","),
      ["Active Records", analytics.activeCount].join(","),
      ["Overdue Records", analytics.overdueCount].join(","),
      ["Returned Records", analytics.returnedCount].join(","),
      ["Total Fines", analytics.totalFines].join(","),
      ["Average Borrow Duration (days)", analytics.averageBorrowDuration.toFixed(2)].join(","),
      ["", ""].join(","),
      ["Branch-wise Statistics", ""].join(","),
      ["Branch", "Total", "Active", "Overdue", "Returned", "Fines (₹)"].join(","),
      ...LIBRARY_CONFIG.BRANCHES.map(branch => {
        const stats = analytics.branchStats[branch];
        return [
          branch,
          stats.total,
          stats.active,
          stats.overdue,
          stats.returned,
          stats.fines,
        ].join(",");
      }),
    ].join("\n");

    downloadCSV(csvContent, "analytics_summary");
  };

  const exportToCSV = (records, filename) => {
    const headers = [
      "Student Name",
      "Roll Number",
      "Branch",
      "Year",
      "Book Title",
      "ISBN",
      "Category",
      "Location",
      "Condition at Issue",
      "Borrow Date",
      "Due Date",
      "Return Date",
      "Status",
      "Fine (₹)",
      "Payment Status",
      "Payment Method",
      "Admin Action",
      "Notes",
      "Issued By",
    ];

    const csvContent = [
      headers.join(","),
      ...records.map((record) => {
        return [
          `"${record.student.name}"`,
          record.student.rollNumber,
          record.student.branch,
          record.student.year,
          `"${record.book.title}"`,
          record.book.isbn,
          record.book.categories.join(";"),
          record.book.rack,
          record.conditionAtIssue || "New",
          new Date(record.borrowDate).toISOString().split("T")[0],
          new Date(record.dueDate).toISOString().split("T")[0],
          record.returnDate ? new Date(record.returnDate).toISOString().split("T")[0] : "",
          record.status,
          record.fine || "0",
          record.paymentStatus || "",
          record.paymentMethod || "",
          `"${record.adminAction || ""}"`,
          `"${record.notes || ""}"`,
          record.issuedBy || "",
        ].join(",");
      }),
    ].join("\n");

    downloadCSV(csvContent, filename);
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportModal(false);
  };

  const handleRecordSelect = (record) => {
    setSelectedRecords((prev) => {
      const isSelected = prev.some((r) => r._id === record._id);
      if (isSelected) {
        return prev.filter((r) => r._id !== record._id);
      } else {
        return [...prev, record];
      }
    });
  };

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  // Handler for sending bulk emails
  const handleEmailAll = async () => {
    setEmailAllLoading(true);
    setError("");
    setSuccess("");
    try {
      // Call the backend API endpoint to send bulk emails
      // You need to implement this endpoint in your backend
      const response = await fetch("/api/borrow-records/email-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to send emails");
      setSuccess("Emails sent to all relevant users!");
    } catch (err) {
      setError("Failed to send emails to all users.");
    } finally {
      setEmailAllLoading(false);
      setTimeout(() => { setSuccess(""); setError(""); }, 3000);
    }
  };

  return (
    <motion.div
      className="mt-3 h-full w-full rounded-[20px] bg-white p-6 shadow-3xl dark:!bg-navy-800 dark:text-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
            Library Borrowing System
          </h1>
          <p className="text-base lg:text-lg text-gray-600 dark:text-gray-300">
            {isAdmin
              ? "Manage book borrowing, returns, and fines efficiently"
              : "View your borrowing history"}
          </p>
        </div>
        {isAdmin && (
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              onClick={() => setBorrowModal(true)}
              className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-white text-sm lg:text-lg font-medium hover:bg-brand-600"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaPlus />
              <span className="hidden sm:inline">Borrow Book</span>
              <span className="sm:hidden">Borrow</span>
            </motion.button>
            <motion.button
              onClick={() => setReturnModal(true)}
              className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-white text-sm lg:text-lg font-medium hover:bg-brand-600"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaUndo />
              <span className="hidden sm:inline">Return Book</span>
              <span className="sm:hidden">Return</span>
            </motion.button>
            <motion.button
              onClick={handleExportSelected}
              className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2 text-white text-sm lg:text-lg font-medium hover:bg-green-600"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaBarcode />
              <span className="hidden sm:inline">Export Selected</span>
              <span className="sm:hidden">Export</span>
            </motion.button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            className="mb-4 rounded-lg border-l-4 border-red-500 bg-red-100 p-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="flex items-center">
              <FaExclamationTriangle className="mr-2 h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </motion.div>
        )}
        {success && (
          <motion.div
            className="mb-4 rounded-lg border-l-4 border-green-500 bg-green-100 p-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="flex items-center">
              <FaBarcode className="mr-2 h-5 w-5 text-green-600" />
              <p className="text-green-800">{success}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Search
        </h3>
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student roll number, name, book title, or ISBN..."
            className="w-full rounded-xl border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 pl-10 pr-4 py-3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap border-b border-gray-200 dark:border-navy-600">
        {[
          {
            id: "0",
            label: "All Records",
            icon: FaListAlt,
            count: records.length,
          },
          {
            id: "1",
            label: "Active",
            icon: FaBook,
            count: records.filter((r) => r.status === "Borrowed").length,
          },
          {
            id: "2",
            label: "Overdue",
            icon: FaExclamationTriangle,
            count: records.filter((r) => r.status === "Overdue").length,
          },
          {
            id: "3",
            label: "Returned",
            icon: FaBarcode,
            count: records.filter((r) => r.status === "Returned").length,
          },
          {
            id: "4",
            label: "Fines",
            icon: FaMoneyBill,
            count: records.filter((r) => r.fine > 0).length,
          },
          ...(isAdmin
            ? [
                {
                  id: "5",
                  label: "Analytics",
                  icon: FaChartBar,
                  count: null,
                },
              ]
            : []),
        ].map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() =>
              setFilterStatus(
                tab.id === "0"
                  ? "All"
                  : tab.id === "1"
                  ? "Borrowed"
                  : tab.id === "2"
                  ? "Overdue"
                  : tab.id === "3"
                  ? "Returned"
                  : tab.id === "4"
                  ? "Fines"
                  : "Analytics"
              )
            }
            className={`flex items-center gap-2 px-4 py-3 text-base font-medium transition-colors
              ${
                filterStatus ===
                (tab.id === "0"
                  ? "All"
                  : tab.id === "1"
                  ? "Borrowed"
                  : tab.id === "2"
                  ? "Overdue"
                  : tab.id === "3"
                  ? "Returned"
                  : tab.id === "4"
                  ? "Fines"
                  : "Analytics")
                  ? "border-b-2 border-brand-500 text-brand-500 dark:text-brand-400 dark:border-brand-400 bg-gray-100 dark:bg-navy-900"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white bg-transparent dark:bg-transparent"
              }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <tab.icon className="h-5 w-5" />
            {tab.label}
            {tab.count !== null && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-navy-700 dark:text-gray-200">
                {tab.count}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {filterStatus !== "Analytics" && filterStatus !== "Fines" ? (
          <Card extra="!p-[20px] w-full mt-6">
            <h4 className="mb-6 text-xl font-bold text-navy-700 dark:text-white">Borrow Records</h4>
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-navy-700 dark:bg-navy-900">
                    <th className="py-4 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Roll Number</th>
                    <th className="py-4 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Book</th>
                    <th className="py-4 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Borrow Date</th>
                    <th className="py-4 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Due Date</th>
                    <th className="py-4 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Return Date</th>
                    <th className="py-4 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="py-4 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Fine (₹)</th>
                    {isAdmin && (
                      <th className="py-4 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 8 : 7} className="px-6 py-6 text-center text-gray-400">
                        No borrow records available
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((record) => (
                      <tr key={record._id} className="border-b border-gray-200 last:border-none hover:bg-gray-50 dark:border-navy-700 dark:hover:bg-navy-700">
                        <td className="py-4 px-4 font-medium text-navy-700 dark:text-white">
                          {record.student?.rollNumber || 'Unknown Roll No.'}
                        </td>
                        <td className="py-4 px-4">{record.book?.title || 'Unknown Book'}</td>
                        <td className="py-4 px-4">{new Date(record.borrowDate).toLocaleDateString("en-IN")}</td>
                        <td className="py-4 px-4">{new Date(record.dueDate).toLocaleDateString("en-IN")}</td>
                        <td className="py-4 px-4">{record.returnDate ? new Date(record.returnDate).toLocaleDateString("en-IN") : "-"}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            record.status === "Returned"
                              ? "bg-green-100 text-green-800"
                              : record.status === "Overdue"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">{record.fine > 0 ? `₹${record.fine}` : "-"}</td>
                        {isAdmin && (
                          <td className="py-4 px-4">
                            <div className="flex gap-2">
                              {record.status !== "Returned" && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSendReminder(record._id);
                                    }}
                                    className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-full p-2 flex items-center justify-center"
                                    title="Send Email Reminder"
                                  >
                                    <FaEnvelope className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActionRecord(record);
                                      setModal(true);
                                      setNewDueDate(new Date(record.dueDate).toISOString().split('T')[0]);
                                    }}
                                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-full p-2 flex items-center justify-center"
                                    title="Extend Due Date"
                                  >
                                    <FaCalendarPlus className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedRecord(record);
                                      setFineModal(true);
                                    }}
                                    className="bg-red-100 text-red-700 hover:bg-red-200 rounded-full p-2 flex items-center justify-center"
                                    title="Add Fine"
                                  >
                                    <FaRupeeSign className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {filteredRecords.length > itemsPerPage && (
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalEntries={filteredRecords.length}
                  itemsPerPage={itemsPerPage}
                />
              )}
            </div>
          </Card>
        ) : filterStatus === "Fines" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-lg border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-800"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-navy-700 dark:bg-navy-800">
                <thead className="bg-gray-50">
                  <tr className="dark:bg-navy-900">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-200 dark:border-navy-700">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-200 dark:border-navy-700">Book</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-200 dark:border-navy-700">Borrow Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-200 dark:border-navy-700">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-200 dark:border-navy-700">Return Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-200 dark:border-navy-700">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-200 dark:border-navy-700">Fine (₹)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-200 dark:border-navy-700">Payment Status</th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-200 dark:border-navy-700">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-navy-800 divide-y divide-gray-200 dark:divide-navy-700">
                  {filteredRecords
                    .filter((r) => r.fine > 0)
                    .map((record) => (
                      <motion.tr
                        key={record._id}
                        className="hover:bg-gray-50 dark:hover:bg-navy-700 dark:text-white"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <td className="px-6 py-4 dark:text-white dark:border-navy-700">
                          {record.student.name} ({record.student.rollNumber})
                        </td>
                        <td className="px-6 py-4 dark:text-white dark:border-navy-700">{record.book.title}</td>
                        <td className="px-6 py-4 dark:text-white dark:border-navy-700">
                          {new Date(record.borrowDate).toLocaleDateString(
                            "en-IN"
                          )}
                        </td>
                        <td className="px-6 py-4 dark:text-white dark:border-navy-700">
                          {new Date(record.dueDate).toLocaleDateString("en-IN")}
                        </td>
                        <td className="px-6 py-4 dark:text-white dark:border-navy-700">
                          {record.returnDate
                            ? new Date(record.returnDate).toLocaleDateString(
                                "en-IN"
                              )
                            : "-"}
                        </td>
                        <td className="px-6 py-4 dark:text-white dark:border-navy-700">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              record.status === "Returned"
                                ? "bg-green-100 text-green-800"
                                : record.status === "Overdue"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-red-600 dark:text-red-400 dark:border-navy-700">
                          ₹{record.fine}
                        </td>
                        <td className="px-6 py-4 dark:text-white dark:border-navy-700">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              record.paymentStatus === "Paid"
                                ? "bg-green-100 text-green-800"
                                : record.paymentStatus === "Waived"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {record.paymentStatus || "Pending"}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4 dark:text-white dark:border-navy-700">
                            <div className="flex gap-2">
                              {record.paymentStatus !== "Paid" &&
                                record.paymentStatus !== "Waived" && (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSendReminder(record._id, 'fine');
                                      }}
                                      className="bg-yellow-200 text-yellow-800 hover:bg-yellow-300 rounded-full p-2 flex items-center gap-1"
                                      title="Send Fine Email Reminder"
                                    >
                                      <FaEnvelope className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMarkFinePaid(record._id);
                                      }}
                                      className="bg-green-200 text-green-800 hover:bg-green-300 rounded-full p-2 flex items-center gap-1"
                                      title="Mark Fine Paid"
                                    >
                                      <FaRupeeSign className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleWaiveFine(record._id);
                                      }}
                                      className="bg-blue-200 text-blue-800 hover:bg-blue-300 rounded-full p-2 flex items-center gap-1"
                                      title="Waive Fine"
                                    >
                                      <FaUndo className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          filterStatus === "Analytics" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {/* Overview Cards */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Total Records</h3>
                    <FaBook className="h-6 w-6 opacity-80" />
              </div>
                  <p className="text-3xl font-bold mt-2">{records.length}</p>
              </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Active Borrows</h3>
                    <FaBookOpen className="h-6 w-6 opacity-80" />
              </div>
                  <p className="text-3xl font-bold mt-2">
                    {records.filter((r) => r.status === "Borrowed").length}
                  </p>
              </div>
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Overdue</h3>
                    <FaClock className="h-6 w-6 opacity-80" />
                  </div>
                  <p className="text-3xl font-bold mt-2">
                    {records.filter((r) => r.status === "Overdue").length}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Total Fines</h3>
                    <FaRupeeSign className="h-6 w-6 opacity-80" />
                  </div>
                  <p className="text-3xl font-bold mt-2">
                    ₹{records.reduce((sum, r) => sum + (r.fine || 0), 0)}
                  </p>
                </div>
              </motion.div>

              {/* Branch Statistics */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="col-span-1 md:col-span-2 bg-white dark:bg-navy-800 rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Branch Statistics</h3>
                  <FaChartBar className="h-6 w-6 text-brand-500" />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-navy-700">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Branch</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Active</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Overdue</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Fines</th>
                      </tr>
                    </thead>
                    <tbody>
                      {LIBRARY_CONFIG.BRANCHES.map((branch) => {
                        const branchRecords = records.filter((r) => r.student.branch === branch);
                        return (
                          <tr key={branch} className="border-b border-gray-100 dark:border-navy-700 hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors">
                            <td className="py-3 px-4 text-sm font-medium">{branch}</td>
                            <td className="py-3 px-4 text-sm text-center">
                              {branchRecords.filter((r) => r.status === "Borrowed").length}
                            </td>
                            <td className="py-3 px-4 text-sm text-center">
                              {branchRecords.filter((r) => r.status === "Overdue").length}
                            </td>
                            <td className="py-3 px-4 text-sm text-center">
                              ₹{branchRecords.reduce((sum, r) => sum + (r.fine || 0), 0)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* Most Borrowed Books */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="col-span-1 bg-white dark:bg-navy-800 rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Most Borrowed Books</h3>
                  <FaStar className="h-6 w-6 text-yellow-500" />
                </div>
                <div className="space-y-4">
                  {Array.from(
                    booksState.reduce((acc, book) => {
                      if (book && book.id && book.title) {
                        acc.set(book.id, {
                          title: book.title,
                          isbn: book.isbn || 'N/A',
                          timesLoaned: book.timesLoaned || 0,
                        });
                      }
                      return acc;
                    }, new Map())
                  )
                    .sort(([, a], [, b]) => b.timesLoaned - a.timesLoaned)
                    .slice(0, 5)
                    .map(([id, book], index) => (
                      <div
                        key={id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-navy-700 hover:bg-gray-100 dark:hover:bg-navy-600 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-semibold text-brand-500">#{index + 1}</span>
                          <div>
                            <p className="font-medium">{book.title}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">ISBN: {book.isbn}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-semibold">{book.timesLoaned}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">times</span>
                        </div>
                      </div>
                    ))}
              </div>
              </motion.div>
            </motion.div>
          )
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-navy-800 rounded-lg p-6 w-full max-w-md"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {actionRecord.status === "Returned"
                    ? "View Borrow Record"
                    : "Update Borrow Record"}
                </h3>
                <button
                  onClick={() => {
                    setModal(false);
                    setActionRecord(null);
                    setNewDueDate("");
                    setNewNotes("");
                  }}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">
                    Student Name
                  </label>
                  <input
                    type="text"
                    value={actionRecord.student.name}
                    readOnly
                    className="mt-1 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Book Title</label>
                  <input
                    type="text"
                    value={actionRecord.book.title}
                    readOnly
                    className="mt-1 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 w-full"
                  />
                </div>
                {actionRecord.status !== "Returned" && (
                  <div>
                    <label className="block text-sm font-medium">
                      New Due Date
                    </label>
                    <input
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="mt-1 rounded-lg border border-gray-300 px-3 py-2 w-full"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium">Notes</label>
                  <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="mt-1 rounded-lg border border-gray-300 px-3 py-2 w-full"
                    readOnly={actionRecord.status === "Returned"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Admin Action
                  </label>
                  <input
                    type="text"
                    value={actionRecord.adminAction || ""}
                    readOnly
                    className="mt-1 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Fine</label>
                  <input
                    type="text"
                    value={actionRecord.fine > 0 ? `₹${actionRecord.fine}` : "-"}
                    readOnly
                    className="mt-1 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 w-full"
                  />
                </div>
                {actionRecord.fine > 0 && (
                  <div>
                    <label className="block text-sm font-medium">
                      Payment Status
                    </label>
                    <input
                      type="text"
                      value={actionRecord.paymentStatus || "Pending"}
                      readOnly
                      className="mt-1 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 w-full"
                    />
                  </div>
                )}
                {actionRecord.status !== "Returned" && (
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setModal(false);
                        setActionRecord(null);
                        setNewDueDate("");
                        setNewNotes("");
                      }}
                      className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleExtendDueDate}
                      className="bg-brand-500 text-white rounded-lg px-4 py-2"
                    >
                      Update
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {borrowModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-navy-800 rounded-lg p-6 w-full max-w-md"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Borrow Book</h3>
                <button
                  onClick={() => {
                    setBorrowModal(false);
                    setBorrowStep(1);
                    setScannedStudent(null);
                    setScannedBook(null);
                    setBarcodeInput("");
                    setError("");
                  }}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="space-y-4">
                {borrowStep === 1 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium">
                        Scan Student ID
                      </label>
                      <div className="relative">
                        <FaUser className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={barcodeInput}
                          onChange={(e) => setBarcodeInput(e.target.value)}
                          className="mt-1 rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 text-gray-900 dark:text-white pl-10 pr-4 py-2 w-full"
                          placeholder="Enter student roll number"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setBorrowModal(false);
                          setBorrowStep(1);
                          setScannedStudent(null);
                          setScannedBook(null);
                          setBarcodeInput("");
                        }}
                        className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleBarcodeScan}
                        className="bg-brand-500 text-white rounded-lg px-4 py-2"
                      >
                        Scan
                      </button>
                    </div>
                  </>
                )}
                {borrowStep === 2 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium">
                        Selected Student
                      </label>
                      <input
                        type="text"
                        value={`${scannedStudent.name} (${scannedStudent.rollNumber})`}
                        readOnly
                        className="mt-1 rounded-lg border border-gray-300 dark:border-navy-600 bg-gray-100 dark:bg-navy-700 text-gray-900 dark:text-white px-3 py-2 w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Scan Book ISBN
                      </label>
                      <div className="relative">
                        <FaBarcode className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={barcodeInput}
                          onChange={(e) => setBarcodeInput(e.target.value)}
                          className="mt-1 rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 text-gray-900 dark:text-white pl-10 pr-4 py-2 w-full"
                          placeholder="Enter book ISBN"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="flex justify-between gap-2">
                      <button
                        onClick={handleBackStep}
                        className="bg-gray-200 text-gray-800 dark:bg-navy-700 dark:text-white rounded-lg px-4 py-2"
                      >
                        Back
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setBorrowModal(false);
                            setBorrowStep(1);
                            setScannedStudent(null);
                            setScannedBook(null);
                            setBarcodeInput("");
                          }}
                          className="bg-gray-200 text-gray-800 dark:bg-navy-700 dark:text-white rounded-lg px-4 py-2"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={scannedBook ? handleBorrowBook : handleBarcodeScan}
                          className="bg-brand-500 text-white dark:bg-brand-600 rounded-lg px-4 py-2"
                        >
                          Scan
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {returnModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-navy-800 rounded-lg p-6 w-full max-w-md"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Return Book</h3>
                <button
                  onClick={() => {
                    setReturnModal(false);
                    setReturnStep(1);
                    setReturnStudent(null);
                    setSelectedBorrowedBook(null);
                    setReturnBarcodeInput("");
                    setReturnCondition("Good");
                    setReturnNotes("");
                  }}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="space-y-4">
                {returnStep === 1 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium">
                        Scan Student ID
                      </label>
                      <div className="relative">
                        <FaUser className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={returnBarcodeInput}
                          onChange={(e) => setReturnBarcodeInput(e.target.value)}
                          className="mt-1 rounded-lg border border-gray-300 pl-10 pr-4 py-2 w-full"
                          placeholder="Enter student roll number"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setReturnModal(false);
                          setReturnStep(1);
                          setReturnStudent(null);
                          setSelectedBorrowedBook(null);
                          setReturnBarcodeInput("");
                        }}
                        className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleReturnBarcodeScan}
                        className="bg-brand-500 text-white rounded-lg px-4 py-2"
                      >
                        Scan
                      </button>
                    </div>
                  </>
                )}
                {returnStep === 2 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium">
                        Selected Student
                      </label>
                      <input
                        type="text"
                        value={`${returnStudent.name} (${returnStudent.rollNumber})`}
                        readOnly
                        className="mt-1 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Select Borrowed Book
                      </label>
                      <select
                        value={selectedBorrowedBook?._id || ""}
                        onChange={(e) => {
                          const record = records.find(
                            (r) => r._id === e.target.value
                          );
                          setSelectedBorrowedBook(record);
                        }}
                        className="mt-1 rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 text-gray-900 dark:text-white px-3 py-2 w-full"
                      >
                        <option value="">Select a book</option>
                        {records
                          .filter(
                            (r) =>
                              r.student && 
                              r.book &&
                              r.student._id.toString() ===
                                returnStudent._id.toString() &&
                              r.status !== "Returned"
                          )
                          .map((record) => (
                            <option key={record._id} value={record._id}>
                              {record.book?.title || 'Unknown Book'} (ISBN: {record.book?.isbn || 'N/A'})
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="flex justify-between gap-2">
                      <button
                        onClick={handleReturnBackStep}
                        className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2"
                      >
                        Back
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setReturnModal(false);
                            setReturnStep(1);
                            setReturnStudent(null);
                            setSelectedBorrowedBook(null);
                            setReturnBarcodeInput("");
                          }}
                          className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleReturnNextStep}
                          className="bg-brand-500 text-white rounded-lg px-4 py-2"
                          disabled={!selectedBorrowedBook}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </>
                )}
                {returnStep === 3 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium">
                        Selected Student
                      </label>
                      <input
                        type="text"
                        value={`${returnStudent.name} (${returnStudent.rollNumber})`}
                        readOnly
                        className="mt-1 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Selected Book
                      </label>
                      <input
                        type="text"
                        value={selectedBorrowedBook.book.title}
                        readOnly
                        className="mt-1 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Return Condition
                      </label>
                      <select
                        value={returnCondition}
                        onChange={(e) => setReturnCondition(e.target.value)}
                        className="mt-1 rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 text-gray-900 dark:text-white px-3 py-2 w-full"
                      >
                        {LIBRARY_CONFIG.BOOK_CONDITIONS.map((condition) => (
                          <option key={condition} value={condition}>
                            {condition}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Return Notes
                      </label>
                      <textarea
                        value={returnNotes}
                        onChange={(e) => setReturnNotes(e.target.value)}
                        className="mt-1 rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 text-gray-900 dark:text-white px-3 py-2 w-full"
                      />
                    </div>
                    <div className="flex justify-between gap-2">
                      <button
                        onClick={handleReturnBackStep}
                        className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2"
                      >
                        Back
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setReturnModal(false);
                            setReturnStep(1);
                            setReturnStudent(null);
                            setSelectedBorrowedBook(null);
                            setReturnBarcodeInput("");
                            setReturnCondition("Good");
                            setReturnNotes("");
                          }}
                          className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleBookReturn(selectedBorrowedBook)}
                          className="bg-brand-500 text-white rounded-lg px-4 py-2"
                        >
                          Return
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {exportModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-navy-800 rounded-lg p-6 w-full max-w-md"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Export Records</h3>
                <button onClick={() => setExportModal(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className="space-y-4">
                <button
                  onClick={exportActiveRecords}
                  className="w-full bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600"
                >
                  Export Active Records
                </button>
                <button
                  onClick={exportOverdueRecords}
                  className="w-full bg-red-500 text-white rounded-lg px-4 py-2 hover:bg-red-600"
                >
                  Export Overdue Records
                </button>
                <button
                  onClick={exportReturnedRecords}
                  className="w-full bg-green-500 text-white rounded-lg px-4 py-2 hover:bg-green-600"
                >
                  Export Returned Records
                </button>
                <button
                  onClick={exportFineRecords}
                  className="w-full bg-yellow-500 text-white rounded-lg px-4 py-2 hover:bg-yellow-600"
                >
                  Export Fine Records
                </button>
                <button
                  onClick={exportAnalytics}
                  className="w-full bg-purple-500 text-white rounded-lg px-4 py-2 hover:bg-purple-600"
                >
                  Export Analytics
                </button>
                <button
                  onClick={() => setExportModal(false)}
                  className="w-full bg-gray-200 text-gray-800 rounded-lg px-4 py-2"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {fineModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-navy-800 rounded-lg p-6 w-full max-w-md"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add Fine</h3>
                <button
                  onClick={() => {
                    setFineModal(false);
                    setSelectedRecord(null);
                    setFineAmount('');
                  }}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Student Name</label>
                  <input
                    type="text"
                    value={selectedRecord?.student.name || ''}
                    readOnly
                    className="mt-1 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Book Title</label>
                  <input
                    type="text"
                    value={selectedRecord?.book.title || ''}
                    readOnly
                    className="mt-1 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Fine Amount (₹)</label>
                  <input
                    type="number"
                    value={fineAmount}
                    onChange={(e) => setFineAmount(e.target.value)}
                    min="0"
                    step="1"
                    className="mt-1 rounded-lg border border-gray-300 px-3 py-2 w-full"
                    placeholder="Enter fine amount"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setFineModal(false);
                      setSelectedRecord(null);
                      setFineAmount('');
                    }}
                    className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddFine}
                    className="bg-brand-500 text-white rounded-lg px-4 py-2"
                  >
                    Add Fine
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const mapStateToProps = (state) => ({
  user: state?.auth?.user || { role: 'admin' } // Providing a default admin role if auth is not set up
});

export default connect(mapStateToProps, { setBreadcrumbItems })(BorrowHistory);

const PaginationControls = ({ currentPage, totalPages, onPageChange, totalEntries, itemsPerPage }) => (
  <div className="mt-4 flex items-center justify-end">
    <div className="flex items-center gap-2">
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
        disabled={currentPage === totalPages}
        className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-navy-600 dark:text-gray-400 dark:hover:bg-navy-700"
      >
        Next
      </button>
    </div>
  </div>
);