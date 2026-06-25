import { useState } from "react";
import { ToastContainer, useToast } from "./Toast";
import { useLanguage } from "../utils/AppContext";

// ─────────────────────────────────────────────────────────────────────────────
// Login Component
// ─────────────────────────────────────────────────────────────────────────────

function Login({ setIsLoggedIn }) {
  // eslint-disable-next-line no-unused-vars
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);

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

  // ── Stay Signed In Custom Modal state ─────────────────────────
  const [showStaySignedInModal, setShowStaySignedInModal] = useState(false);
  const [pendingLoginData, setPendingLoginData] = useState(null);

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
      setLoginMsg({ type: "error", text: t("fillAllFieldsError") });
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
          setLoginMsg({ type: "success", text: t("accountCreatedSuccess") });
          setIsSignup(false);
          setEmail("");
          setPassword("");
          setUsername("");
        } else {
          setLoginMsg({ type: "error", text: data.msg || t("signupFailedError") });
        }
      } else {
        setLoginMsg({ type: "info", text: t("waitLoggingInInfo") });
        const response = await fetch(`${AUTH_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();

        if (response.ok) {
          setPendingLoginData(data);
          setShowStaySignedInModal(true);
        } else {
          setLoginMsg({ type: "error", text: data.msg || t("invalidEmailPasswordError") });
        }
      }
    } catch (err) {
      setLoginMsg({ type: "error", text: t("cannotConnectServerError") });
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Custom Stay Signed In handler ────────────────────────────
  const handleStaySignedInChoice = (stay) => {
    if (!pendingLoginData) return;
    const { token, user } = pendingLoginData;

    if (stay) {
      localStorage.setItem("token", token);
      localStorage.setItem("userProfile", JSON.stringify(user));
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("staySignedIn", "true");
      // Clear sessionActive cookie if any
      document.cookie = "sessionActive=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    } else {
      localStorage.setItem("staySignedIn", "false");
      localStorage.setItem("token", token);
      localStorage.setItem("userProfile", JSON.stringify(user));
      localStorage.setItem("isLoggedIn", "true");
      // Set session cookie
      document.cookie = "sessionActive=true; path=/; SameSite=Lax";
    }

    sessionStorage.setItem("token", token);
    sessionStorage.setItem("userProfile", JSON.stringify(user));
    sessionStorage.setItem("isLoggedIn", "true");

    setLoginMsg({ type: "success", text: t("profileSavedSuccess") }); // or redirecting...
    setShowStaySignedInModal(false);
    setTimeout(() => setIsLoggedIn(true), 600);
  };

  // ── Password strength validation ──────────────────────────────
  const validatePassword = (pwd) => {
    if (!pwd || pwd.length < 6)
      return t("pwdMinLengthError");
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
      setForgotMsg({ type: "error", text: t("fillAllFieldsError") });
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
        text: data.msg || t("otpSentSuccess"),
      });
      setForgotStep(2);
      startOtpCooldown();
    } catch (err) {
      setForgotMsg({ type: "error", text: t("cannotConnectServerError") });
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2 — Verify OTP
  const handleForgotVerifyOTP = async () => {
    if (!forgotOtp.trim()) {
      setForgotMsg({ type: "error", text: t("fillAllFieldsError") });
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
        setForgotMsg({ type: "success", text: t("otpSentSuccess") }); // OTP verified fallback
      } else {
        setForgotMsg({ type: "error", text: data.msg || t("invalidOtpError") });
      }
    } catch (err) {
      setForgotMsg({ type: "error", text: t("cannotConnectServerError") });
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 3 — Reset Password
  const handleForgotResetPassword = async () => {
    const pwdError = validatePassword(newPassword);
    if (pwdError) { setForgotMsg({ type: "error", text: pwdError }); return; }
    if (newPassword !== confirmPassword) {
      setForgotMsg({ type: "error", text: t("passwordsDoNotMatchError") });
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
        setForgotMsg({ type: "success", text: t("pwdResetSuccess") });
        setTimeout(() => resetForgotState(), 2000);
      } else {
        setForgotMsg({ type: "error", text: data.msg || t("pwdResetFailError") });
      }
    } catch (err) {
      setForgotMsg({ type: "error", text: t("cannotConnectServerError") });
    } finally {
      setForgotLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Forgot Password Screen (3-step flow)
  // ─────────────────────────────────────────────────────────────
  if (showForgot) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-4 login-container">
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl w-full max-w-sm">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">{t("forgotPasswordTitle")}</h2>
          <p className="text-gray-400 text-center text-sm mb-5">
            {t("stepLabel")} {forgotStep} {t("stepOf")} 3 —{" "}
            {forgotStep === 1 ? t("enterEmailStep") : forgotStep === 2 ? t("enterOtpStep") : t("setNewPasswordStep")}
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
                type="email" placeholder={t("emailPlaceholder")}
                value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                autoComplete="email"
                className="border border-gray-200 p-3 w-full mb-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              />
              <button onClick={handleForgotRequestOTP} disabled={forgotLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white w-full py-3 rounded-xl font-bold transition-colors text-sm">
                {forgotLoading ? t("sendingBtn") : t("sendOtpBtn")}
              </button>
            </>
          )}

          {forgotStep === 2 && (
            <>
              <p className="text-sm text-gray-500 text-center mb-4">
                {t("otpSentTo")} <strong className="text-gray-800">{forgotEmail}</strong>
              </p>
              <input
                type="text" inputMode="numeric" pattern="[0-9]*"
                placeholder={t("otpPlaceholder")} value={forgotOtp}
                onChange={(e) => setForgotOtp(e.target.value.replace(/\D/, ""))}
                maxLength="6" autoComplete="one-time-code"
                className="border border-gray-200 p-3 w-full mb-4 rounded-xl text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button onClick={handleForgotVerifyOTP} disabled={forgotLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white w-full py-3 rounded-xl font-bold transition-colors mb-3 text-sm">
                {forgotLoading ? t("verifyingBtn") : t("verifyOtpBtn")}
              </button>
              <button onClick={handleForgotRequestOTP} disabled={otpCooldown > 0 || forgotLoading}
                className={`w-full py-2.5 rounded-xl font-bold transition-colors text-sm ${otpCooldown > 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>
                {otpCooldown > 0 ? `${t("resendOtpBtn")} (${otpCooldown}s)` : t("resendOtpBtn")}
              </button>
            </>
          )}

          {forgotStep === 3 && (
            <>
              <div className="relative mb-4">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={t("newPasswordPlaceholder")}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  className="border border-gray-200 p-3 pr-10 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="relative mb-4">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={t("confirmPasswordPlaceholder")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="border border-gray-200 p-3 pr-10 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <button onClick={handleForgotResetPassword} disabled={forgotLoading}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white w-full py-3 rounded-xl font-bold transition-colors text-sm">
                {forgotLoading ? t("resettingBtn") : t("resetPasswordBtn")}
              </button>
            </>
          )}

          <button onClick={resetForgotState}
            className="text-gray-400 hover:text-gray-600 text-center w-full mt-5 text-sm hover:underline">
            {t("backToLoginBtn")}
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Normal Login / Signup Screen
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-4 login-container relative">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* ── Custom Stay Signed In Modal dialog ───────────────────── */}
      {showStaySignedInModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fade-in">
          <div 
            className="bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-white/20 transform transition-all scale-100 flex flex-col items-center text-center animate-scale-up"
            style={{ animation: 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          >
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl mb-4 shadow-sm">
              🔐
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 leading-tight">
              {t("staySignedInPrompt")}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-6 leading-relaxed">
              {t("staySignedInDescription")}
            </p>
            <div className="flex flex-col w-full gap-2.5">
              <button
                onClick={() => handleStaySignedInChoice(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl font-bold transition-all shadow-md shadow-blue-150 text-sm"
              >
                {t("yesStaySignedIn")}
              </button>
              <button
                onClick={() => handleStaySignedInChoice(false)}
                className="w-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 py-2.5 rounded-xl font-semibold transition-all text-sm"
              >
                {t("noThanks")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Banner headline ─────────────────────────────── */}
      {!isSignup && (
        <div className="text-center mb-8 px-4 flex flex-col items-center">
          {/* SFIS Cloud Logo */}
          <img
            src="/sfis-cloud-logo.png"
            alt="SFIS Cloud Logo"
            style={{ height: '100px', width: 'auto', objectFit: 'contain', marginBottom: '20px', filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.25))' }}
            className="sm:h-[110px]"
          />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight drop-shadow-lg">
            {t("welcomeTo")}
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-orange-300">
              {t("smartFinancial")}{" "}
            </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-200">
              {t("intelligenceSystemText")}
            </span>
          </h1>
          <p className="text-blue-200 text-sm mt-2 font-medium tracking-wide">
            {t("aiInsightsFuture")}
          </p>
        </div>
      )}

      {/* ── Card ───────────────────────────────────────── */}
      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl w-full max-w-sm">
        <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-6">
          {isSignup ? t("createAccountTitle") : t("signInTitle")}
        </h2>

        <InlineMsg msg={loginMsg} />

        {isSignup && (
          <input
            type="text" placeholder={t("usernamePlaceholder")}
            value={username} autoComplete="username"
            className="border border-gray-200 p-3 w-full mb-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm transition-all"
            style={{ backgroundColor: '#ffffff', color: '#1f2937', WebkitTextFillColor: '#1f2937', caretColor: '#2563eb', pointerEvents: 'auto', cursor: 'text', opacity: 1 }}
            onChange={(e) => setUsername(e.target.value)}
          />
        )}

        <input
          type="email" placeholder={t("emailInputPlaceholder")}
          value={email} autoComplete="email"
          className="border border-gray-200 p-3 w-full mb-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm transition-all"
          style={{ backgroundColor: '#ffffff', color: '#1f2937', WebkitTextFillColor: '#1f2937', caretColor: '#2563eb', pointerEvents: 'auto', cursor: 'text', opacity: 1 }}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="relative mb-1">
          <input
            type={showPassword ? "text" : "password"}
            placeholder={t("passwordPlaceholder")}
            value={password}
            autoComplete={isSignup ? "new-password" : "current-password"}
            className="border border-gray-200 p-3 pr-10 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm transition-all bg-white"
            style={{ backgroundColor: '#ffffff', color: '#1f2937', WebkitTextFillColor: '#1f2937', caretColor: '#2563eb', pointerEvents: 'auto', cursor: 'text', opacity: 1 }}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>

        {!isSignup && (
          <div className="text-right mb-4 mt-2">
            <button onClick={() => setShowForgot(true)}
              className="text-blue-500 text-sm hover:underline font-medium">
              {t("forgotPasswordLink")}
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
              {isSignup ? t("creatingAccountBtn") : t("pleaseWaitBtn")}
            </>
          ) : (
            isSignup ? t("signUpBtn") : t("loginBtn")
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
          {isSignup ? t("alreadyHaveAccountLink") : t("dontHaveAccountLink")}
        </p>
      </div>
    </div>
  );
}

export default Login;