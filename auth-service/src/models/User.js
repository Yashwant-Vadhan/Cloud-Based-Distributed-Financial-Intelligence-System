const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  // Fields for forgot-password OTP flow (hashed, with expiry)
  otpHash: {
    type: String
  },
  otpExpiry: {
    type: Date
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// NOTE: No pre-save hook here — password hashing is done ONCE manually in the controller.
// This prevents any risk of double-hashing.

module.exports = mongoose.model("User", userSchema);