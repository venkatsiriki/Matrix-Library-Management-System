const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const session = require("express-session");
const passport = require("passport");
const configurePassport = require("./config/passport");
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

// Trust reverse proxy (needed for correct secure cookies on Render/HTTPS)
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all Vercel domains (main and preview URLs)
    if (origin.includes('vercel.app') || origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // Log blocked origins for debugging
    console.log('CORS blocked origin:', origin);
    
    // Temporarily allow all origins for debugging
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Disposition']
};

app.use(cors(corsOptions));
app.use(express.json());

// Sessions (needed for Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "matrixSecret",
    resave: false,
    // Set true so the browser receives a session cookie before OAuth starts
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

// Passport
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// Root route for health/info
app.get("/", (req, res) => {
  res.send("Welcome to Matrix LMS Backend 🎉");
});

// Health check route
app.get("/api", (req, res) => {
  res.json({ 
    message: "Matrix LMS API is running", 
    status: "success",
    timestamp: new Date().toISOString()
  });
});

// Debug route to test routing
app.get("/api/debug", (req, res) => {
  res.json({ 
    message: "Debug route working", 
    routes: ["/api/books", "/api/auth", "/api/students"],
    timestamp: new Date().toISOString()
  });
});

// OAuth routes (moved before main routes to avoid conflicts)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL) {
  app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"], session: true }));
  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login", session: true }),
    (req, res) => {
      res.redirect(process.env.POST_LOGIN_REDIRECT || "https://matrix-library-management-system.vercel.app/student/dashboard");
    }
  );
} else {
  // Fallback routes when Google OAuth is not configured
  app.get("/api/auth/google", (req, res) => {
    res.json({ message: "Google OAuth not configured", error: "Missing environment variables" });
  });
  app.get("/api/auth/google/callback", (req, res) => {
    res.json({ message: "Google OAuth not configured", error: "Missing environment variables" });
  });
}

// Simple test route first
app.get("/api/test", (req, res) => {
  res.json({ message: "API test route working", timestamp: new Date().toISOString() });
});

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
