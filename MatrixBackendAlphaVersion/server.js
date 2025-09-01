require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const session = require("express-session");
const passport = require("passport");
const connectDB = require("./src/config/db");
const configurePassport = require("./src/config/passport");

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (origin.includes('vercel.app') || origin.includes('localhost')) {
      return callback(null, true);
    }
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Disposition']
}));
app.use(express.json());

// Debug middleware - log all requests
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

// Sessions (needed for Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "matrixSecret",
    resave: false,
    saveUninitialized: false,
  })
);

// Passport
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// Routes
try {
  const authRoutes = require("./routes/auth");
  app.use("/api/auth", authRoutes);
  console.log("✅ Auth routes loaded successfully");
  
  // Debug: List all routes
  console.log("🔍 Available routes:");
  console.log("   - GET /api/auth/test");
  console.log("   - GET /api/auth/google");
  console.log("   - GET /api/auth/google/callback");
} catch (error) {
  console.error("❌ Error loading auth routes:", error);
}

// Root route
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

// Direct test route
app.get("/api/auth/test-direct", (req, res) => {
  res.send("Direct test route working ✅");
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Test routes:`);
      console.log(`   - Direct: http://localhost:${PORT}/api/auth/test-direct`);
      console.log(`   - Auth: http://localhost:${PORT}/api/auth/test`);
      console.log(`   - Google: http://localhost:${PORT}/api/auth/google`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
