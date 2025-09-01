const express = require("express");
const passport = require("passport");
const router = express.Router();

console.log("🔧 Loading auth routes...");

// Test route
router.get("/test", (req, res) => {
  console.log("✅ Test route hit!");
  res.send("Auth routes working ✅");
});

// Google OAuth routes
router.get("/google", (req, res) => {
  console.log("🔗 Google OAuth route hit!");
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res);
});

router.get("/google/callback", (req, res) => {
  console.log("🔄 Google callback route hit!");
  passport.authenticate("google", { failureRedirect: "/" })(req, res, () => {
    console.log("✅ Google auth successful, redirecting...");
    res.redirect(process.env.POST_LOGIN_REDIRECT || "https://matrix-library-management-system.vercel.app/student");
  });
});

console.log("✅ Auth routes loaded!");

module.exports = router;
