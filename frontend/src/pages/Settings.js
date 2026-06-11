import React, { useState, useEffect } from "react";
import { ToastContainer, useToast } from "../components/Toast";
import { useLanguage, useTheme } from "../utils/AppContext";

// ─────────────────────────────────────────────────────────────────────────────
// Settings Page
// ─────────────────────────────────────────────────────────────────────────────
function Settings() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const [step, setStep]                   = useState("input"); // 'input' | 'otp'
  const [otpInput, setOtpInput]           = useState("");
  const [generatedOtp, setGeneratedOtp]   = useState("");
  const [userEmail, setUserEmail]         = useState("");
  const [statusMsg, setStatusMsg]         = useState({ type: "", text: "" });
  const [showPwdCurrent, setShowPwdCurrent] = useState(false);
  const [showPwdNew, setShowPwdNew]         = useState(false);
  const [showPwdConfirm, setShowPwdConfirm] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const AUTH_URL = process.env.REACT_APP_AUTH_URL;
  const { toasts, toast, removeToast } = useToast();

  // Load the user's email from their profile (backend)
  useEffect(() => {
    const fetchProfile = async () => {
      const token = sessionStorage.getItem("token");
      try {
        const response = await fetch(`${AUTH_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.email) setUserEmail(data.email);
      } catch (err) {
        console.error("Settings profile fetch error:", err);
      }
    };
    fetchProfile();
  }, [AUTH_URL]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  // Step 1 — Validate inputs, then send OTP to the user's email
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: "", text: "" });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setStatusMsg({ type: "error", text: "New passwords do not match!" });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setStatusMsg({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    if (!userEmail) {
      setStatusMsg({ type: "error", text: "No registered email found. Please update your profile first." });
      return;
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);

    const token = sessionStorage.getItem("token");
    try {
      const response = await fetch(`${AUTH_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: userEmail, otp: newOtp }),
      });
      if (response.ok) {
        setStatusMsg({ type: "success", text: `OTP sent to ${userEmail}. Check your inbox.` });
        setStep("otp");
      } else {
        setStatusMsg({ type: "error", text: "Failed to send OTP email. Check server logs." });
      }
    } catch (error) {
      setStatusMsg({ type: "error", text: "Cannot connect to server." });
    }
  };

  // Step 2 — Verify OTP, then call the backend to change the password
  const handleVerifyAndSave = async () => {
    setStatusMsg({ type: "", text: "" });
    if (otpInput !== generatedOtp) {
      setStatusMsg({ type: "error", text: "Invalid OTP. Please check your email." });
      return;
    }

    const token = sessionStorage.getItem("token");
    try {
      const response = await fetch(`${AUTH_URL}/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setStatusMsg({ type: "success", text: "Password changed successfully! Use your new password next time you log in." });
        setStep("input");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setOtpInput("");
        setGeneratedOtp("");
      } else {
        setStatusMsg({ type: "error", text: data.msg || "Failed to change password." });
      }
    } catch (err) {
      setStatusMsg({ type: "error", text: "Cannot connect to server." });
    }
  };

  const handleCancel = () => {
    setStep("input");
    setOtpInput("");
    setGeneratedOtp("");
    setStatusMsg({ type: "", text: "" });
  };

  // ── Theme definitions ──────────────────────────────────────────
  const themes = [
    {
      id: "light",
      label: t("themeLight"),
      dots: ["#2563eb", "#f1f5f9", "#1e293b"],
      bg: "bg-gradient-to-br from-slate-100 to-white",
      border: "border-blue-500",
      badge: "bg-blue-100 text-blue-700",
    },
    {
      id: "dark",
      label: t("themeDark"),
      dots: ["#3b82f6", "#0f172a", "#94a3b8"],
      bg: "bg-gradient-to-br from-slate-900 to-slate-800",
      border: "border-slate-400",
      badge: "bg-slate-800 text-slate-200",
    },
    {
      id: "midnight",
      label: t("themeMidnight"),
      dots: ["#f59e0b", "#0b132b", "#8da9c4"],
      bg: "bg-gradient-to-br from-[#0b132b] to-[#1c2541]",
      border: "border-amber-400",
      badge: "bg-amber-900 text-amber-200",
    },
    {
      id: "forest",
      label: t("themeForest"),
      dots: ["#10b981", "#0f2212", "#a7f3d0"],
      bg: "bg-gradient-to-br from-[#0f2212] to-[#19381f]",
      border: "border-emerald-500",
      badge: "bg-emerald-900 text-emerald-200",
    },
    {
      id: "cyberpunk",
      label: t("themeCyberpunk"),
      dots: ["#ff007f", "#120136", "#00f0ff"],
      bg: "bg-gradient-to-br from-[#120136] to-[#03001e]",
      border: "border-pink-500",
      badge: "bg-pink-950 text-pink-200",
    },
  ];

  // ── Language definitions ───────────────────────────────────────
  const languages = [
    { code: "en", label: "English", native: "English" },
    { code: "hi", label: "Hindi",   native: "हिन्दी" },
    { code: "ta", label: "Tamil",   native: "தமிழ்" },
  ];

  // ── Eye icon helper ────────────────────────────────────────────
  const EyeToggle = ({ show, toggle }) => (
    <button
      type="button"
      onClick={toggle}
      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
    >
      {show ? (
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
  );

  return (
    <div className="p-6 bg-gray-100 h-[calc(100vh-56px)] md:h-[calc(100vh-64px)] overflow-y-auto">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">{t("settings")}</h2>

      {/* ── Row 1: Language + Theme ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* ── Language Selector ── */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-indigo-500">
          <h3 className="text-xl font-bold mb-1 text-indigo-600 flex items-center gap-2">
            <span>🌐</span> {t("changeLanguage")}
          </h3>
          <p className="text-sm text-gray-400 mb-4">Choose your preferred display language</p>
          <div className="flex flex-col gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  toast.success(`Language changed to ${lang.native}`);
                }}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-200 font-semibold text-sm
                  ${language === lang.code
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md shadow-indigo-100"
                    : "border-gray-200 bg-gray-50 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                  }`}
              >
                <span className="text-base">{lang.native}</span>
                <span className="text-xs text-gray-400">{lang.label}</span>
                {language === lang.code && (
                  <span className="ml-2 w-2.5 h-2.5 bg-indigo-500 rounded-full inline-block flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Security / Change Password Section ── */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-red-500 flex flex-col">
          <h3 className="text-xl font-bold mb-4 text-red-600 flex items-center gap-2">
            <span>🔐</span> {t("securityLogin")}
          </h3>

          {statusMsg.text && (
            <div className={`mb-4 p-3 rounded-lg text-sm text-center ${statusMsg.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
              {statusMsg.text}
            </div>
          )}

          {step === "input" ? (
            <form onSubmit={handleRequestOTP} className="space-y-3 flex-grow">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">{t("currentPassword")}</label>
                <div className="relative">
                  <input
                    type={showPwdCurrent ? "text" : "password"}
                    name="currentPassword"
                    placeholder="••••••••"
                    value={passwordData.currentPassword}
                    className="border p-2 pr-10 w-full rounded-lg bg-gray-50 focus:border-red-400 outline-none"
                    onChange={handlePasswordChange}
                    required
                  />
                  <EyeToggle show={showPwdCurrent} toggle={() => setShowPwdCurrent(v => !v)} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">{t("newPassword")}</label>
                <div className="relative">
                  <input
                    type={showPwdNew ? "text" : "password"}
                    name="newPassword"
                    placeholder="New Password"
                    value={passwordData.newPassword}
                    className="border p-2 pr-10 w-full rounded-lg bg-gray-50 focus:border-red-400 outline-none"
                    onChange={handlePasswordChange}
                    required
                  />
                  <EyeToggle show={showPwdNew} toggle={() => setShowPwdNew(v => !v)} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">{t("confirmNewPassword")}</label>
                <div className="relative">
                  <input
                    type={showPwdConfirm ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm New Password"
                    value={passwordData.confirmPassword}
                    className="border p-2 pr-10 w-full rounded-lg bg-gray-50 focus:border-red-400 outline-none"
                    onChange={handlePasswordChange}
                    required
                  />
                  <EyeToggle show={showPwdConfirm} toggle={() => setShowPwdConfirm(v => !v)} />
                </div>
              </div>
              <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold transition-all shadow-md mt-2">
                {t("sendOtp")} {userEmail || "Email"}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-2">An OTP has been sent to</p>
                <p className="font-bold text-gray-800">{userEmail}</p>
              </div>
              <input
                type="text" maxLength="6" placeholder="000000"
                value={otpInput} onChange={(e) => setOtpInput(e.target.value)}
                className="border-2 border-red-200 p-4 w-full rounded-lg text-center text-3xl font-mono tracking-[1rem] focus:border-red-500 outline-none"
              />
              <div className="flex gap-3">
                <button onClick={handleCancel} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-bold">{t("cancel")}</button>
                <button onClick={handleVerifyAndSave} className="flex-[2] bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold">{t("verifyChange")}</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 2: Application Theme (full width) ──────────────── */}
      <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-purple-500">
        <h3 className="text-xl font-bold mb-1 text-purple-600 flex items-center gap-2">
          <span>🎨</span> {t("appTheme")}
        </h3>
        <p className="text-sm text-gray-400 mb-5">Select a visual theme to personalise your experience</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {themes.map((th) => (
            <button
              key={th.id}
              onClick={() => {
                setTheme(th.id);
                toast.success(`Theme changed to ${th.label}`);
              }}
              className={`relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer group
                ${theme === th.id ? `${th.border} shadow-lg scale-105` : "border-gray-200 hover:scale-102 hover:shadow-md hover:border-gray-300"}`}
            >
              {/* Preview swatch */}
              <div className={`w-full h-16 rounded-xl ${th.bg} flex items-center justify-center gap-1.5 p-2 overflow-hidden`}>
                {th.dots.map((color, i) => (
                  <span
                    key={i}
                    className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Label */}
              <span className={`text-xs font-bold text-center leading-tight px-1.5 py-0.5 rounded-md ${th.badge}`}>
                {th.label}
              </span>

              {/* Active indicator */}
              {theme === th.id && (
                <span className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
              )}
            </button>
          ))}
        </div>

        {/* Current theme info bar */}
        <div className="mt-5 p-3 bg-purple-50 rounded-xl flex items-center gap-3 border border-purple-100">
          <span className="text-purple-500 text-xl">✨</span>
          <p className="text-sm text-purple-700 font-medium">
            Active theme: <strong>{themes.find(t => t.id === theme)?.label}</strong>
            {" — "}Theme colours will apply across all pages. More themes coming soon!
          </p>
        </div>
      </div>
    </div>
  );
}

export default Settings;