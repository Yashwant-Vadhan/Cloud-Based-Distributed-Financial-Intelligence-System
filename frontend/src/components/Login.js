import { useState } from "react";
import { ToastContainer, useToast } from "./Toast";

// ─────────────────────────────────────────────────────────────────────────────
// Login Component
// ─────────────────────────────────────────────────────────────────────────────

function Login({ setIsLoggedIn }) {
  // ── Login / Signup state ──────────────────────────────────────
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginMsg, setLoginMsg] = useState({ type: "", text: "" });

  // ── Forgot Password state ─────────────────────────────────────
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotMsg, setForgotMsg] = useState({ type: "", text: "" });
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [forgotLoading, setForgotLoading] = useState(false);

  const { toasts, removeToast } = useToast();
  const AUTH_URL = process.env.REACT_APP_AUTH_URL;

  // ── In-page message box helper ────────────────────────────────
  const InlineMsg = ({ msg }) => {
    if (!msg.text) return null;
    const styles = {
      error: "bg-red-50 border-red-200 text-red-700",
      success: "bg-emerald-50 border-emerald-200 text-emerald-700",
      info: "bg-blue-50 border-blue-200 text-blue-700",
      warning: "bg-amber-50 border-amber-200 text-amber-700",
    };
    return (
      <div className={`mb-4 p-3 rounded-xl border text-sm text-center font-medium ${styles[msg.type] || styles.info}`}>
        {msg.text}
      </div>
    );
  };

  // ── Login / Signup handler ────────────────────────────────────
  const handleSubmit = async () => {
    if (email === "" || password === "" || (isSignup && username === "")) {
      setLoginMsg({ type: "error", text: "Please fill in all fields." });
      return;
    }
    setLoginMsg({ type: "", text: "" });
    setLoginLoading(true);

    try {
      if (isSignup) {
        const response = await fetch(`${AUTH_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });
        const data = await response.json();
        if (response.ok) {
          setLoginMsg({ type: "success", text: "Account created! Please log in." });
          setIsSignup(false);
          setEmail("");
          setPassword("");
          setUsername("");
        } else {
          setLoginMsg({ type: "error", text: data.msg || "Signup failed. Try again." });
        }
      } else {
        setLoginMsg({ type: "info", text: "Please wait while we log you in…" });
        const response = await fetch(`${AUTH_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();

        if (response.ok) {
          sessionStorage.setItem("token", data.token);
          sessionStorage.setItem("userProfile", JSON.stringify(data.user));
          sessionStorage.setItem("isLoggedIn", "true");
          setLoginMsg({ type: "success", text: "Login successful! Redirecting…" });
          setTimeout(() => setIsLoggedIn(true), 600);
        } else {
          setLoginMsg({ type: "error", text: data.msg || "Invalid email or password." });
        }
      }
    } catch (err) {
      setLoginMsg({ type: "error", text: "Cannot connect to server. Please try again." });
    } finally {
      setLoginLoading(false);
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

  // Step 1 — Request OTP
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
    if (pwdError) { setForgotMsg({ type: "error", text: pwdError }); return; }
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
        setForgotMsg({ type: "success", text: "Password reset successful! Redirecting to login…" });
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
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-4">
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl w-full max-w-sm">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">Forgot Password</h2>
          <p className="text-gray-400 text-center text-sm mb-5">
            Step {forgotStep} of 3 —{" "}
            {forgotStep === 1 ? "Enter Your Email" : forgotStep === 2 ? "Enter OTP" : "Set New Password"}
          </p>

          {/* Step indicator */}
          <div className="flex gap-1 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= forgotStep ? "bg-blue-500" : "bg-gray-200"}`} />
            ))}
          </div>

          <InlineMsg msg={forgotMsg} />

          {forgotStep === 1 && (
            <>
              <input
                type="email" placeholder="Your registered email address"
                value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                autoComplete="email"
                className="border border-gray-200 p-3 w-full mb-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              />
              <button onClick={handleForgotRequestOTP} disabled={forgotLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white w-full py-3 rounded-xl font-bold transition-colors text-sm">
                {forgotLoading ? "Sending…" : "Send OTP"}
              </button>
            </>
          )}

          {forgotStep === 2 && (
            <>
              <p className="text-sm text-gray-500 text-center mb-4">
                OTP sent to <strong className="text-gray-800">{forgotEmail}</strong>
              </p>
              <input
                type="text" inputMode="numeric" pattern="[0-9]*"
                placeholder="000000" value={forgotOtp}
                onChange={(e) => setForgotOtp(e.target.value.replace(/\D/, ""))}
                maxLength="6" autoComplete="one-time-code"
                className="border border-gray-200 p-3 w-full mb-4 rounded-xl text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button onClick={handleForgotVerifyOTP} disabled={forgotLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white w-full py-3 rounded-xl font-bold transition-colors mb-3 text-sm">
                {forgotLoading ? "Verifying…" : "Verify OTP"}
              </button>
              <button onClick={handleForgotRequestOTP} disabled={otpCooldown > 0 || forgotLoading}
                className={`w-full py-2.5 rounded-xl font-bold transition-colors text-sm ${otpCooldown > 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>
                {otpCooldown > 0 ? `Resend OTP (${otpCooldown}s)` : "Resend OTP"}
              </button>
            </>
          )}

          {forgotStep === 3 && (
            <>
              <input type="password" placeholder="New Password (min. 6 characters)"
                value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="border border-gray-200 p-3 w-full mb-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              />
              <input type="password" placeholder="Confirm New Password"
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="border border-gray-200 p-3 w-full mb-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              />
              <button onClick={handleForgotResetPassword} disabled={forgotLoading}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white w-full py-3 rounded-xl font-bold transition-colors text-sm">
                {forgotLoading ? "Resetting…" : "Reset Password"}
              </button>
            </>
          )}

          <button onClick={resetForgotState}
            className="text-gray-400 hover:text-gray-600 text-center w-full mt-5 text-sm hover:underline">
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-4">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* ── Banner headline ─────────────────────────────── */}
      {!isSignup && (
        <div className="text-center mb-8 px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight drop-shadow-lg">
            Welcome to
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-orange-300">
              Smart Financial{" "}
            </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-200">
              Intelligence System
            </span>
          </h1>
          <p className="text-blue-200 text-sm mt-2 font-medium tracking-wide">
            AI-powered insights for your financial future
          </p>
        </div>
      )}

      {/* ── Card ───────────────────────────────────────── */}
      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl w-full max-w-sm">
        <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-6">
          {isSignup ? "Create Account" : "Sign In"}
        </h2>

        <InlineMsg msg={loginMsg} />

        {isSignup && (
          <input
            type="text" placeholder="Username"
            value={username} autoComplete="username"
            className="border border-gray-200 p-3 w-full mb-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm transition-all"
            onChange={(e) => setUsername(e.target.value)}
          />
        )}

        <input
          type="email" placeholder="Email"
          value={email} autoComplete="email"
          className="border border-gray-200 p-3 w-full mb-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm transition-all"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password" placeholder="Password"
          value={password} autoComplete="current-password"
          className="border border-gray-200 p-3 w-full mb-1 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm transition-all"
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />

        {!isSignup && (
          <div className="text-right mb-4 mt-2">
            <button onClick={() => setShowForgot(true)}
              className="text-blue-500 text-sm hover:underline font-medium">
              Forgot Password?
            </button>
          </div>
        )}
        {isSignup && <div className="mb-4" />}

        <button
          onClick={handleSubmit}
          disabled={loginLoading}
          className="relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 text-white w-full py-3 rounded-xl font-bold transition-all shadow-md shadow-blue-200 text-sm flex items-center justify-center gap-2"
        >
          {loginLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {isSignup ? "Creating Account…" : "Please wait…"}
            </>
          ) : (
            isSignup ? "Sign Up" : "Login"
          )}
        </button>

        <p
          onClick={() => {
            setIsSignup(!isSignup);
            setEmail(""); setPassword(""); setUsername("");
            setLoginMsg({ type: "", text: "" });
          }}
          className="text-blue-500 text-center mt-5 cursor-pointer hover:underline text-sm font-medium"
        >
          {isSignup ? "Already have an account? Login" : "Don't have an account? Create one"}
        </p>
      </div>
    </div>
  );
}

export default Login;