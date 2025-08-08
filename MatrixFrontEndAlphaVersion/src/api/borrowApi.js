import axios from "axios";
import { API_URL } from './config';

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getBooks = async () => {
  try {
    const response = await axios.get(`${API_URL}/books`, {
      headers: getAuthHeader(),
    });
    console.log("Books response:", response.data);
    return response.data; // Returns the books array directly
  } catch (error) {
    console.error("getBooks error:", error.response?.data, error.message);
    throw error;
  }
};

export const getBorrowRecords = async (endpoint = "/borrow-records") => {
  try {
    const response = await axios.get(`${API_URL}${endpoint}`, {
      headers: getAuthHeader(),
    });
    console.log("BorrowRecords response:", response.data);
    return response.data.data.records; // Matches { status: 'success', data: { records: [...] } }
  } catch (error) {
    console.error("getBorrowRecords error:", error.response?.data, error.message);
    throw error;
  }
};

export const getStudentByRollNumber = async (rollNumber) => {
  try {
    const response = await axios.get(`${API_URL}/students/${rollNumber}`, {
      headers: getAuthHeader(),
    });
    console.log("Student response:", response.data);
    return response.data; // Returns student object
  } catch (error) {
    console.error("getStudentByRollNumber error:", error.response?.data, error.message);
    throw error;
  }
};

export const borrowBook = async ({ studentId, bookId, dueDate, conditionAtIssue, notes, issuedBy }) => {
  try {
    const response = await axios.post(
      `${API_URL}/borrow-records/borrow`,
      { studentId, bookId, dueDate, conditionAtIssue, notes, issuedBy },
      { headers: getAuthHeader() }
    );
    console.log("BorrowBook response:", response.data);
    return response.data.data.record;
  } catch (error) {
    console.error("borrowBook error:", error.response?.data, error.message);
    throw error;
  }
};

export const returnBook = async (id, data) => {
  const response = await axios.patch(`${API_URL}/borrow-records/${id}/return`, data, { headers: getAuthHeader() });
  return response.data.data.record;
};

export const updateBorrowRecord = async (id, data) => {
  try {
    const response = await axios.patch(
      `${API_URL}/borrow-records/${id}`,
      data,
      { headers: getAuthHeader() }
    );
    console.log("UpdateBorrowRecord response:", response.data);
    return response.data.data.record;
  } catch (error) {
    console.error("updateBorrowRecord error:", error.response?.data, error.message);
    throw error;
  }
};

export const sendReminder = async (id) => {
  try {
    const response = await axios.post(
      `${API_URL}/borrow-records/${id}/reminder`,
      {},
      { headers: getAuthHeader() }
    );
    console.log("SendReminder response:", response.data);
    return response.data;
  } catch (error) {
    console.error("sendReminder error:", error.response?.data, error.message);
    throw error;
  }
};

export const markFinePaid = async (id, paymentMethod) => {
  try {
    const response = await axios.patch(
      `${API_URL}/borrow-records/${id}/fine/paid`,
      { paymentMethod },
      { headers: getAuthHeader() }
    );
    console.log("MarkFinePaid response:", response.data);
    return response.data.data.record;
  } catch (error) {
    console.error("markFinePaid error:", error.response?.data, error.message);
    throw error;
  }
};

export const waiveFine = async (id) => {
  try {
    const response = await axios.patch(
      `${API_URL}/borrow-records/${id}/fine/waived`,
      {},
      { headers: getAuthHeader() }
    );
    console.log("WaiveFine response:", response.data);
    return response.data.data.record;
  } catch (error) {
    console.error("waiveFine error:", error.response?.data, error.message);
    throw error;
  }
};

export const getStudentBorrowHistory = async (studentId) => {
  try {
    const response = await axios.get(`${API_URL}/borrow-records/student/${studentId}`, {
      headers: getAuthHeader(),
    });
    console.log("Student borrow history response:", response.data);
    return response.data.data.records;
  } catch (error) {
    console.error("getStudentBorrowHistory error:", error.response?.data, error.message);
    throw error;
  }
};

export const getStudentAnalytics = async () => {
  try {
    const response = await axios.get(`${API_URL}/activity-logs/analytics`, {
      headers: getAuthHeader(),
    });
    console.log("Student analytics response:", response.data);
    return response.data.data.analytics;
  } catch (error) {
    console.error("getStudentAnalytics error:", error.response?.data, error.message);
    throw error;
  }
};

export const getCurrentStudent = async () => {
  try {
    const response = await axios.get(`${API_URL}/students/profile/me`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("getCurrentStudent error:", error.response?.data, error.message);
    throw error;
  }
};

export const updateCurrentStudent = async (studentData) => {
  try {
    const response = await axios.put(`${API_URL}/students/profile/me`, studentData, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("updateCurrentStudent error:", error.response?.data, error.message);
    throw error;
  }
};

// Search books with location information
export const searchBooksWithLocation = async (searchQuery) => {
  try {
    const response = await axios.get(`${API_URL}/books/search/location?query=${encodeURIComponent(searchQuery)}`, {
      headers: getAuthHeader(),
    });
    console.log("SearchBooksWithLocation response:", response.data);
    return response.data; // Return the direct response since the backend returns the formatted data
  } catch (error) {
    console.error('Error searching books:', error.response?.data, error.message);
    throw error;
  }
};

export const getAdminAnalytics = async () => {
  try {
    const response = await axios.get(`${API_URL}/borrow-records/admin-analytics`, { headers: getAuthHeader() });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    throw error;
  }
};

export const sendEmailNotification = async (id, { type = 'due' } = {}) => {
  try {
    const response = await axios.post(
      `${API_URL}/borrow-records/${id}/reminder`,
      { type },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error("Send email notification error:", error);
    throw error;
  }
};

export const extendBorrowPeriod = async (id, dueDate) => {
  try {
    const response = await axios.patch(
      `${API_URL}/borrow-records/${id}/extend`,
      { dueDate },
      { headers: getAuthHeader() }
    );
    return response.data.data.record;
  } catch (error) {
    console.error("Extend borrow period error:", error);
    throw error;
  }
};

export const getNotifications = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data.notifications;
};

export const markAllNotificationsRead = async () => {
  const token = localStorage.getItem('token');
  await axios.patch(`${API_URL}/notifications/mark-all-read`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const markNotificationRead = async (id) => {
  const token = localStorage.getItem('token');
  await axios.patch(`${API_URL}/notifications/${id}/mark-read`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getLibraryLeaderboard = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get('/api/activity-logs/leaderboard', {
    headers: { Authorization: `Bearer ${token}` },
  });
  // The leaderboard is in response.data.data.leaderboard
  return response.data.data.leaderboard;
};