const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getProfile,
  updateProfile,
  sendOTP,
  forgotPasswordOTP,
  verifyForgotOTP,
  resetPassword,
  changePassword,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

// ── Existing routes ──────────────────────────────────────────
router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post("/send-otp", authMiddleware, sendOTP);           // Settings OTP email (authenticated)

// ── New routes ───────────────────────────────────────────────
// Forgot Password flow — all public (no auth token required)
router.post("/forgot-password", forgotPasswordOTP);          // Step 1: request OTP
router.post("/verify-forgot-otp", verifyForgotOTP);          // Step 2: verify OTP → get resetToken
router.post("/reset-password", resetPassword);               // Step 3: reset password using resetToken

// Settings Change Password — requires valid JWT (authenticated)
router.post("/change-password", authMiddleware, changePassword);

module.exports = router;