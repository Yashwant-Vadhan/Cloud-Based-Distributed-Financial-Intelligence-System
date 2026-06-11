const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// ─────────────────────────────────────────────────────────────
// Helper: create nodemailer transporter
// ─────────────────────────────────────────────────────────────
function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

// ─────────────────────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Hash password ONCE — no pre-save hook in User model, so no double-hash risk
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.json({ msg: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    // Compare plain password with single-hashed stored password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid password" });
    }

    const token = jwt.sign(
      { user_id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        user_id: user._id,
        username: user.username,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET PROFILE
// ─────────────────────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id).select("-password -otpHash -otpExpiry");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// UPDATE PROFILE
// ─────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { username, email, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.user_id,
      { username, email, phone },
      { new: true }
    ).select("-password -otpHash -otpExpiry");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// SEND OTP (Settings page — authenticated user, sends email with OTP)
// NOTE: OTP is generated client-side and passed in body; backend just sends the email.
// ─────────────────────────────────────────────────────────────
exports.sendOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Password Change Verification Code",
      text: `Your OTP for password change is: ${otp}\n\nThis OTP is valid for 10 minutes. Do not share it with anyone.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email error details:", error);
        return res
          .status(500)
          .json({ message: "Failed to send email", error: error.message });
      }
      res.status(200).json({ message: "Email sent!" });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// CHANGE PASSWORD — Settings page (authenticated)
// Verifies current password, then hashes new password ONCE and saves.
// ─────────────────────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ msg: "Current password and new password are required." });
  }

  try {
    const user = await User.findById(req.user.user_id);
    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }

    // Verify current password against stored hash
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Current password is incorrect." });
    }

    // Hash new password ONCE — no pre-save hook, no double-hash risk
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ msg: "Password changed successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// FORGOT PASSWORD — Step 1: Request OTP (public, no auth required)
// Generates a 6-digit OTP, hashes it, stores with 10-min expiry, sends email.
// Always returns a safe message to avoid revealing whether the email exists.
// ─────────────────────────────────────────────────────────────
exports.forgotPasswordOTP = async (req, res) => {
  const { email } = req.body;
  const SAFE_MSG =
    "If this email is registered, an OTP has been sent.";

  if (!email) {
    return res.status(400).json({ msg: "Email is required." });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // Return safe message — do NOT reveal that email doesn't exist
      return res.status(200).json({ msg: SAFE_MSG });
    }

    // Generate a 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the OTP before storing — never store plain OTP
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otpHash = otpHash;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP via email (non-blocking; safe message returned regardless)
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}\n\nThis OTP expires in 10 minutes. Do not share it with anyone.\n\nIf you did not request this, you can safely ignore this email.`,
    };
    transporter.sendMail(mailOptions, (error) => {
      if (error) console.error("Forgot-password email error:", error);
    });

    return res.status(200).json({ msg: SAFE_MSG });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// FORGOT PASSWORD — Step 2: Verify OTP (public, no auth required)
// Verifies OTP hash and expiry. Returns a short-lived resetToken (JWT, 10 min).
// OTP can only be used once — resetToken is required to reset password.
// ─────────────────────────────────────────────────────────────
exports.verifyForgotOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ msg: "Email and OTP are required." });
  }

  try {
    const user = await User.findOne({ email });

    if (!user || !user.otpHash || !user.otpExpiry) {
      return res.status(400).json({ msg: "Invalid or expired OTP." });
    }

    // Check expiry
    if (new Date() > user.otpExpiry) {
      return res
        .status(400)
        .json({ msg: "OTP has expired. Please request a new one." });
    }

    // Compare entered OTP against stored hash
    const isMatch = await bcrypt.compare(otp, user.otpHash);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid OTP. Please try again." });
    }

    // Issue a short-lived reset token (10 min) — separate secret from login JWT
    const resetToken = jwt.sign(
      { user_id: user._id, email: user.email, purpose: "password_reset" },
      process.env.JWT_SECRET + "_reset",
      { expiresIn: "10m" }
    );

    return res.status(200).json({ msg: "OTP verified successfully.", resetToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// FORGOT PASSWORD — Step 3: Reset Password (public, uses resetToken)
// Validates the resetToken, hashes the new password ONCE, saves to DB.
// Clears otpHash/otpExpiry so the OTP cannot be reused.
// ─────────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  if (!resetToken || !newPassword) {
    return res
      .status(400)
      .json({ msg: "Reset token and new password are required." });
  }

  try {
    // Verify the reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET + "_reset");
    } catch (e) {
      return res
        .status(400)
        .json({ msg: "Reset link has expired or is invalid. Please start over." });
    }

    if (decoded.purpose !== "password_reset") {
      return res.status(400).json({ msg: "Invalid reset token." });
    }

    const user = await User.findById(decoded.user_id);
    if (!user) {
      return res.status(400).json({ msg: "User not found." });
    }

    // Ensure OTP session has not already been consumed
    if (!user.otpHash) {
      return res.status(400).json({
        msg: "This reset session has already been used. Please request a new OTP.",
      });
    }

    // Hash new password ONCE — no pre-save hook, so no double-hash
    user.password = await bcrypt.hash(newPassword, 10);

    // Invalidate OTP — cannot be reused after successful reset
    user.otpHash = undefined;
    user.otpExpiry = undefined;

    await user.save();

    return res.status(200).json({
      msg: "Password reset successful. You can now log in with your new password.",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};