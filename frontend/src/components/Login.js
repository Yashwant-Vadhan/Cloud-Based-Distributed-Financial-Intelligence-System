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
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl w-[92%] max-w-[420px] text-white">
          {/* Header */}
          <h2 className="text-2xl font-bold text-center mb-1 text-gray-100">Forgot Password</h2>
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
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                  s <= forgotStep ? "bg-blue-500" : "bg-slate-800"
                }`}
              />
            ))}
          </div>

          {/* Message box */}
          {forgotMsg.text && (
            <div
              className={`mb-4 p-3 rounded-xl text-sm text-center font-medium ${
                forgotMsg.type === "error"
                  ? "bg-red-950/40 text-red-400 border border-red-900/30"
                  : "bg-green-950/40 text-green-400 border border-green-900/30"
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
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all mb-4 text-sm"
              />
              <button
                onClick={handleForgotRequestOTP}
                disabled={forgotLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/20 text-sm active:scale-[0.98]"
              >
                {forgotLoading ? "Sending…" : "Send OTP"}
              </button>
            </>
          )}

          {/* ── Step 2: OTP ── */}
          {forgotStep === 2 && (
            <>
              <p className="text-sm text-gray-400 text-center mb-4">
                OTP sent to <strong className="text-gray-200">{forgotEmail}</strong>
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
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all mb-4 outline-none"
              />
              <button
                onClick={handleForgotVerifyOTP}
                disabled={forgotLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/20 text-sm active:scale-[0.98] mb-3"
              >
                {forgotLoading ? "Verifying…" : "Verify OTP"}
              </button>
              <button
                onClick={handleForgotRequestOTP}
                disabled={otpCooldown > 0 || forgotLoading}
                className={`w-full py-3 rounded-xl font-bold transition-all duration-300 text-sm ${
                  otpCooldown > 0
                    ? "bg-slate-950/40 text-slate-500 cursor-not-allowed border border-slate-900"
                    : "bg-slate-950/60 hover:bg-slate-900 border border-slate-800 text-gray-300 hover:text-white"
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
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all mb-4 text-sm"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all mb-4 text-sm"
              />
              <button
                onClick={handleForgotResetPassword}
                disabled={forgotLoading}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-green-500/20 text-sm active:scale-[0.98]"
              >
                {forgotLoading ? "Resetting…" : "Reset Password"}
              </button>
            </>
          )}

          {/* Back to Login */}
          <button
            onClick={resetForgotState}
            className="text-gray-400 hover:text-blue-400 text-center w-full mt-5 text-sm hover:underline transition-colors"
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
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4">
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl w-[92%] max-w-[420px] text-white">
        
        {/* Fancy Welcome Title */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 mb-3 text-2xl animate-pulse">
            💎
          </div>
          <p className="text-[10px] uppercase tracking-widest text-blue-400 font-bold mb-1">
            Welcome to
          </p>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-blue-300 via-indigo-200 to-white bg-clip-text text-transparent leading-tight">
            Financial Intelligence System
          </h1>
          <p className="text-gray-400 text-xs mt-2 font-medium">
            {isSignup ? "Create your secure account to begin" : "Sign in to access your dashboard"}
          </p>
        </div>

        {/* Username — only for signup */}
        {isSignup && (
          <input
            type="text"
            placeholder="Username"
            value={username}
            autoComplete="username"
            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all mb-4 text-sm"
            onChange={(e) => setUsername(e.target.value)}
          />
        )}

        {/* Email — controlled input prevents auto-fill on page load */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          autoComplete="email"
          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all mb-4 text-sm"
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password — controlled input; autoComplete allows browser suggestion on focus only */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          autoComplete="current-password"
          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all mb-1 text-sm"
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Forgot Password link — only visible on login mode */}
        {!isSignup && (
          <div className="text-right mb-4 mt-1">
            <button
              onClick={() => setShowForgot(true)}
              className="text-blue-400 hover:text-blue-300 text-xs transition-colors hover:underline"
            >
              Forgot Password?
            </button>
          </div>
        )}

        {isSignup && <div className="mb-4" />}

        <button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 text-sm active:scale-[0.98]"
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
          className="text-blue-400 hover:text-blue-300 text-center mt-5 cursor-pointer text-xs font-semibold hover:underline transition-colors"
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