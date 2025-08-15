import React, { useEffect, useState } from "react";
import Card from "components/card";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const SECTIONS = [
  { value: '', label: 'All Sections' },
  { value: 'Central Library', label: 'Central Library' },
  { value: 'Reference', label: 'Reference' },
  { value: 'Reference - Study Section', label: 'Reference - Study Section' },
  { value: 'Reading Room', label: 'Reading Room' },
  { value: 'E-Library', label: 'E-Library' },
];
const DEPARTMENTS = [
  '', 'CSE', 'ECE', 'MECH', 'IT', 'CIVIL', 'EEE', 'MCA', 'MBA', 'MTECH', 'AIML', 'CSE-AIML', 'CSE-DS', 'CSE-CS', 'CSE-IOT', 'CSE-CYBER'
];

function exportToCSV(data, filename) {
  const headers = ['Roll Number', 'Section', 'Department', 'Status', 'Time In', 'Time Out', 'Date'];
  const rows = data.map(log => [
    log.rollNumber,
    log.section,
    log.department || log.branch || '-',
    log.status,
    log.timeIn || '-',
    log.timeOut || '-',
    log.date || '-',
  ]);
  const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const OverallAnalysis = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [section, setSection] = useState('');
  const [department, setDepartment] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchData = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);
      if (section) params.append('section', section);
      if (department) params.append('department', department);
      if (search) params.append('search', search);
      params.append('page', page);
      params.append('limit', 10);
      
              const response = await axios.get(`${API_URL}/api/activity-logs/overall-analysis/data?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setLogs(response.data.logs);
      setCurrentPage(response.data.pagination.currentPage);
      setTotalPages(response.data.pagination.totalPages);
      setTotalCount(response.data.pagination.totalCount);
    } catch (err) {
      setError('Failed to fetch check-in/check-out data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    fetchData(1);
  }, [fromDate, toDate, section, department, search]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchData(newPage);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);
      
              const response = await axios.get(`${API_URL}/api/activity-logs/all?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const filename = `activity_logs_${fromDate || 'all'}_to_${toDate || 'all'}.csv`;
      exportToCSV(response.data, filename);
    } catch (err) {
      alert('Failed to export data');
      console.error('Export error:', err);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={!currentPage > 1}
        className="px-3 py-2 mx-1 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-navy-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-navy-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
    );

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 mx-1 text-sm font-medium rounded-md ${
            currentPage === i
              ? 'bg-brand-500 text-white'
              : 'text-gray-500 dark:text-gray-400 bg-white dark:bg-navy-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-navy-700'
          }`}
        >
          {i}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-3 py-2 mx-1 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-navy-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-navy-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    );

    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} results
        </div>
        <div className="flex items-center space-x-1">
          {pages}
        </div>
      </div>
    );
  };

  return (
    <Card extra="w-full h-full p-6 flex flex-col items-center justify-center">
      {/* Controls */}
      <div className="w-full flex flex-col gap-2 mb-6">
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <label className="flex flex-col text-xs font-medium text-gray-700 dark:text-gray-200">
            From Date
            <input 
              type="date" 
              value={fromDate} 
              onChange={e => setFromDate(e.target.value)} 
              className="border rounded px-2 py-1 mt-1 bg-white dark:bg-navy-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400" 
            />
          </label>
          <label className="flex flex-col text-xs font-medium text-gray-700 dark:text-gray-200">
            To Date
            <input 
              type="date" 
              value={toDate} 
              onChange={e => setToDate(e.target.value)} 
              className="border rounded px-2 py-1 mt-1 bg-white dark:bg-navy-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400" 
            />
          </label>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full">
          <input
            type="text"
            placeholder="Search by name or roll number..."
            className="border rounded-lg px-3 py-2 w-full md:w-1/3 bg-white dark:bg-navy-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="border rounded-lg px-3 py-2 w-full md:w-1/4 bg-white dark:bg-navy-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400"
            value={section}
            onChange={e => setSection(e.target.value)}
          >
            {SECTIONS.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-white dark:bg-navy-800 text-gray-900 dark:text-white">{opt.label}</option>
            ))}
          </select>
          <select
            className="border rounded-lg px-3 py-2 w-full md:w-1/4 bg-white dark:bg-navy-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400"
            value={department}
            onChange={e => setDepartment(e.target.value)}
          >
            <option value="" className="bg-white dark:bg-navy-800 text-gray-900 dark:text-white">All Departments</option>
            {DEPARTMENTS.filter(d => d).map(dep => (
              <option key={dep} value={dep} className="bg-white dark:bg-navy-800 text-gray-900 dark:text-white">{dep}</option>
            ))}
          </select>
          <button
            className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-4 py-2 rounded-lg transition"
            onClick={handleExport}
          >
            Export
          </button>
        </div>
      </div>
      {/* Table */}
      {loading ? (
        <p className="text-gray-600 dark:text-gray-300">Loading check-in/check-out data...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="w-full">
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-navy-700 dark:bg-navy-900">
                  <th className="py-4 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Roll Number</th>
                  <th className="py-4 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Section</th>
                  <th className="py-4 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Department</th>
                  <th className="py-4 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                  <th className="py-4 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Time In</th>
                  <th className="py-4 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Time Out</th>
                  <th className="py-4 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-2 sm:px-4 py-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center">
                      No check-in/check-out data found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log, idx) => {
                    let logDate = log.date || log.createdAt || '';
                    if (logDate) logDate = logDate.split('T')[0];
                    return (
                      <tr
                        key={log._id || idx}
                        className="border-b border-gray-200 last:border-none hover:bg-gray-50 dark:border-navy-700 dark:hover:bg-navy-700"
                      >
                        <td className="py-4 px-2 sm:px-4 text-xs sm:text-base font-medium text-navy-700 dark:text-white">
                          {log.rollNumber}
                        </td>
                        <td className="py-4 px-2 sm:px-4 text-xs sm:text-base text-gray-700 dark:text-gray-300">
                          {log.section}
                        </td>
                        <td className="py-4 px-2 sm:px-4 text-xs sm:text-base text-gray-700 dark:text-gray-300">
                          {log.department || log.branch || '-'}
                        </td>
                        <td className="py-4 px-2 sm:px-4 text-xs sm:text-base">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium ${
                              log.status === 'Checked In'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="py-4 px-2 sm:px-4 text-xs sm:text-base text-gray-700 dark:text-gray-300">
                          {log.timeIn ? log.timeIn : '-'}
                        </td>
                        <td className="py-4 px-2 sm:px-4 text-xs sm:text-base text-gray-700 dark:text-gray-300">
                          {log.timeOut ? log.timeOut : '-'}
                        </td>
                        <td className="py-4 px-2 sm:px-4 text-xs sm:text-base text-gray-700 dark:text-gray-300">
                          {logDate}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {renderPagination()}
        </div>
      )}
      <p className="mt-4 text-gray-600 dark:text-gray-300">Live check-in and check-out data from the ID scanner.</p>
    </Card>
  );
};

export default OverallAnalysis; 