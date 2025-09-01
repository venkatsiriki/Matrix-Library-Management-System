const express = require("express");
const passport = require("passport");
const router = express.Router();
const { login, getMe, register } = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

// Regular auth routes
router.post("/login", login);
router.post("/register", register);
router.get("/me", authMiddleware, getMe);

// Google OAuth routes
router.get("/google", 
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect(process.env.POST_LOGIN_REDIRECT);
  }
);

module.exports = router;
