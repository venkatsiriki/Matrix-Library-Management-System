const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const activityLogRoutes = require("./routes/activityLogRoutes");
const formRoutes = require("./routes/formRoutes");
const digitalLibraryRoutes = require("./routes/digitalLibraryRoutes");
const borrowRoutes = require("./routes/borrowRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const bookRoutes = require("./routes/bookRoutes");
const rackRoutes = require("./routes/racks");
const rackAssignmentRoutes = require("./routes/rackAssignments");
const errorHandler = require("./middleware/error");

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Disposition']
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/activity-logs", activityLogRoutes);
app.use("/api/form-submissions", formRoutes);
app.use("/api/digital-library", digitalLibraryRoutes);
app.use("/api/borrow-records", borrowRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/racks", rackRoutes);
app.use("/api/rack-assignments", rackAssignmentRoutes);

// Error Handler
app.use(errorHandler);

// ✅ Export the app instance only — no app.listen here
module.exports = app;
