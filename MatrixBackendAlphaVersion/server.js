require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");

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
