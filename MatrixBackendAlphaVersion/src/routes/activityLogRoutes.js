const express = require("express");
const router = express.Router();
const {
  checkIn,
  checkOut,
  transfer,
  getTodayLogs,
  getSeatAvailability,
  getStudentAnalytics,
  getLibraryLeaderboard,
  getOverallAnalysisData,
  getAllActivityLogs,
} = require("../controllers/activityLogController");
const authMiddleware = require("../middleware/auth");
const restrictTo = require("../middleware/restrictTo");

// Protected routes (require authentication and admin role)
router.post("/check-in", authMiddleware, restrictTo(["admin"]), checkIn);
router.post("/check-out", authMiddleware, restrictTo(["admin"]), checkOut);
router.post("/transfer", authMiddleware, restrictTo(["admin"]), transfer);
router.get("/today", authMiddleware, restrictTo(["admin"]), getTodayLogs);

// Overall Analysis routes (admin only)
router.get("/overall-analysis/data", authMiddleware, restrictTo(["admin"]), getOverallAnalysisData);
router.get("/all", authMiddleware, restrictTo(["admin"]), getAllActivityLogs);

// Public route for seat availability
router.get("/seats", getSeatAvailability);

// Student routes
router.get("/analytics", authMiddleware, restrictTo(["student"]), getStudentAnalytics);
router.get("/leaderboard", authMiddleware, restrictTo(["student"]), getLibraryLeaderboard);

module.exports = router;
