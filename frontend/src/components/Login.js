import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Login Component
// Fixes applied:
//   Issue 1 — Controlled inputs (value=) + autoComplete attributes prevent
//             automatic pre-filling on page load. Fields start empty.
//   Issue 3 — Token stored in sessionStorage (not localStorage) so auth is
//             cleared when the browser is closed.
//   Issue 4 — Full 3-step Forgot Password flow (email → OTP → new password)
//             works without login. No Current Password required.
// ─────────────────────────────────────────────────────────────────────────────

function Login({ setIsLoggedIn }) {
  // ── Login / Signup state ──────────────────────────────────────
  const [isSignup, setIsSignup]   = useState(false);
  const [username, setUsername]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");

  // ── Forgot Password state ─────────────────────────────────────
  const [showForgot, setShowForgot]         = useState(false);
  const [forgotStep, setForgotStep]         = useState(1);   // 1=email, 2=otp, 3=newpass
  const [forgotEmail, setForgotEmail]       = useState("");
  const [forgotOtp, setForgotOtp]           = useState("");
  const [resetToken, setResetToken]         = useState("");
  const [newPassword, setNewPassword]       = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotMsg, setForgotMsg]           = useState({ type: "", text: "" });
  const [otpCooldown, setOtpCooldown]       = useState(0);
  const [forgotLoading, setForgotLoading]   = useState(false);

  const AUTH_URL = process.env.REACT_APP_AUTH_URL;

  // ── Login / Signup handler ────────────────────────────────────
  const handleSubmit = async () => {
    if (email === "" || password === "" || (isSignup && username === "")) {
      alert("Fill all fields");
      return;
    }

    try {
      if (isSignup) {
        const response = await fetch(`${AUTH_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });
        const data = await response.json();
        if (response.ok) {
          alert("Signup successful! Please login.");
          setIsSignup(false);
          setEmail("");
          setPassword("");
          setUsername("");
        } else {
          alert(data.msg || "Signup failed");
        }
      } else {
        const response = await fetch(`${AUTH_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();

        if (response.ok) {
          // ── Issue 3 Fix: sessionStorage — cleared on browser close ──
          sessionStorage.setItem("token", data.token);
          sessionStorage.setItem("userProfile", JSON.stringify(data.user));
          sessionStorage.setItem("isLoggedIn", "true");
          setIsLoggedIn(true);
        } else {
          alert(data.msg || "Invalid credentials");
        }
      }
    } catch (err) {
      alert("Error connecting to Auth service");
    }
  };

  // ── Password strength validation ──────────────────────────────
  const validatePassword = (pwd) => {
    if (!pwd || pwd.length < 6)
      return "Password must be at least 6 characters.";
    return null;
  };

  // ── Forgot Password helpers ───────────────────────────────────
  const startOtpCooldown = () => {
    setOtpCooldown(60);
    const interval = setInterval(() => {
      setOtpCooldown((c) => {
        if (c <= 1) { clearInterval(interval); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const resetForgotState = () => {
    setShowForgot(false);
    setForgotStep(1);
    setForgotEmail("");
    setForgotOtp("");
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
    setForgotMsg({ type: "", text: "" });
    setOtpCooldown(0);
  };

  // Step 1 — Request OTP (public, no auth needed)
  const handleForgotRequestOTP = async () => {
    if (!forgotEmail.trim()) {
      setForgotMsg({ type: "error", text: "Please enter your email address." });
      return;
    }
    setForgotLoading(true);
    setForgotMsg({ type: "", text: "" });

    try {
      const response = await fetch(`${AUTH_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await response.json();

      // Always show the safe message regardless of whether email exists
      setForgotMsg({
        type: "success",
        text: data.msg || "If this email is registered, an OTP has been sent.",
      });
      setForgotStep(2);
      startOtpCooldown();
    } catch (err) {
      setForgotMsg({ type: "error", text: "Cannot connect to server. Try again." });
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2 — Verify OTP
  const handleForgotVerifyOTP = async () => {
    if (!forgotOtp.trim()) {
      setForgotMsg({ type: "error", text: "Please enter the OTP." });
      return;
    }
    setForgotLoading(true);
    setForgotMsg({ type: "", text: "" });

    try {
      const response = await fetch(`${AUTH_URL}/auth/verify-forgot-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, otp: forgotOtp }),
      });
      const data = await response.json();

      if (response.ok) {
        setResetToken(data.resetToken);
        setForgotStep(3);
        setForgotMsg({ type: "success", text: "OTP verified! Set your new password below." });
      } else {
        setForgotMsg({ type: "error", text: data.msg || "Invalid OTP. Please try again." });
      }
    } catch (err) {
      setForgotMsg({ type: "error", text: "Cannot connect to server. Try again." });
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 3 — Reset Password
  const handleForgotResetPassword = async () => {
    const pwdError = validatePassword(newPassword);
    if (pwdError) {
      setForgotMsg({ type: "error", text: pwdError });
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotMsg({ type: "error", text: "Passwords do not match." });
      return;
    }
    setForgotLoading(true);
    setForgotMsg({ type: "", text: "" });

    try {
      const response = await fetch(`${AUTH_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword }),
      });
      const data = await response.json();

      if (response.ok) {
        setForgotMsg({
          type: "success",
          text: "Password reset successful! Redirecting to login…",
        });
        // Return to login page after short delay
        setTimeout(() => resetForgotState(), 2000);
      } else {
        setForgotMsg({ type: "error", text: data.msg || "Failed to reset password." });
      }
    } catch (err) {
      setForgotMsg({ type: "error", text: "Cannot connect to server. Try again." });
    } finally {
      setForgotLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Forgot Password Screen (3-step flow)
  // ─────────────────────────────────────────────────────────────
  if (showForgot) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-96">
          {/* Header */}
          <h2 className="text-2xl font-bold text-center mb-1">Forgot Password</h2>
          <p className="text-gray-400 text-center text-sm mb-5">
            Step {forgotStep} of 3 —{" "}
            {forgotStep === 1
              ? "Enter Your Email"
              : forgotStep === 2
              ? "Enter OTP"
              : "Set New Password"}
          </p>

          {/* Step indicator bar */}
          <div className="flex gap-1 mb-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full ${
                  s <= forgotStep ? "bg-blue-500" : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          {/* Message box */}
          {forgotMsg.text && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm text-center ${
                forgotMsg.type === "error"
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {forgotMsg.text}
            </div>
          )}

          {/* ── Step 1: Email ── */}
          {forgotStep === 1 && (
            <>
              <input
                type="email"
                placeholder="Your registered email address"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                autoComplete="email"
                className="border p-2 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={handleForgotRequestOTP}
                disabled={forgotLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white w-full py-2 rounded-lg font-bold transition-colors"
              >
                {forgotLoading ? "Sending…" : "Send OTP"}
              </button>
            </>
          )}

          {/* ── Step 2: OTP ── */}
          {forgotStep === 2 && (
            <>
              <p className="text-sm text-gray-500 text-center mb-4">
                OTP sent to <strong className="text-gray-800">{forgotEmail}</strong>
              </p>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="000000"
                value={forgotOtp}
                onChange={(e) => setForgotOtp(e.target.value.replace(/\D/, ""))}
                maxLength="6"
                autoComplete="one-time-code"
                className="border p-2 w-full mb-4 rounded-lg text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={handleForgotVerifyOTP}
                disabled={forgotLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white w-full py-2 rounded-lg font-bold transition-colors mb-3"
              >
                {forgotLoading ? "Verifying…" : "Verify OTP"}
              </button>
              <button
                onClick={handleForgotRequestOTP}
                disabled={otpCooldown > 0 || forgotLoading}
                className={`w-full py-2 rounded-lg font-bold transition-colors text-sm ${
                  otpCooldown > 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                {otpCooldown > 0
                  ? `Resend OTP (${otpCooldown}s)`
                  : "Resend OTP"}
              </button>
            </>
          )}

          {/* ── Step 3: New Password ── */}
          {forgotStep === 3 && (
            <>
              <input
                type="password"
                placeholder="New Password (min. 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="border p-2 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="border p-2 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={handleForgotResetPassword}
                disabled={forgotLoading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white w-full py-2 rounded-lg font-bold transition-colors"
              >
                {forgotLoading ? "Resetting…" : "Reset Password"}
              </button>
            </>
          )}

          {/* Back to Login */}
          <button
            onClick={resetForgotState}
            className="text-gray-400 hover:text-gray-600 text-center w-full mt-5 text-sm hover:underline"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Normal Login / Signup Screen
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-96">
        <h2 className="text-3xl font-bold text-center mb-6">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h2>

        {/* Username — only for signup */}
        {isSignup && (
          <input
            type="text"
            placeholder="Username"
            value={username}
            autoComplete="username"
            className="border p-2 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            onChange={(e) => setUsername(e.target.value)}
          />
        )}

        {/* Email — controlled input prevents auto-fill on page load */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          autoComplete="email"
          className="border p-2 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password — controlled input; autoComplete allows browser suggestion on focus only */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          autoComplete="current-password"
          className="border p-2 w-full mb-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Forgot Password link — only visible on login mode */}
        {!isSignup && (
          <div className="text-right mb-4 mt-1">
            <button
              onClick={() => setShowForgot(true)}
              className="text-blue-500 text-sm hover:underline"
            >
              Forgot Password?
            </button>
          </div>
        )}

        {isSignup && <div className="mb-4" />}

        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded-lg font-bold transition-colors"
        >
          {isSignup ? "Sign Up" : "Login"}
        </button>

        <p
          onClick={() => {
            setIsSignup(!isSignup);
            // Clear fields when switching between login and signup
            setEmail("");
            setPassword("");
            setUsername("");
          }}
          className="text-blue-500 text-center mt-4 cursor-pointer hover:underline"
        >
          {isSignup
            ? "Already have an account? Login"
            : "Don't have an account? Create one"}
        </p>
      </div>
    </div>
  );
}

export default Login;