import { useEffect, useState } from "react";
import ReactDOM from "react-dom";

/* ─── Single Toast item ───────────────────────────────────────────────────── */
function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false);

  // Slide-in after mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 20);
    return () => clearTimeout(t);
  }, []);

  // Auto-dismiss
  useEffect(() => {
    const hideTimer = setTimeout(() => {
      setVisible(false);
      const removeTimer = setTimeout(() => onRemove(toast.id), 350);
      return () => clearTimeout(removeTimer);
    }, toast.duration || 3500);
    return () => clearTimeout(hideTimer);
  }, [toast, onRemove]);

  const styles = {
    success: { bar: "bg-emerald-500", bg: "bg-white border-emerald-400", icon: "✅", text: "text-gray-800",   sub: "text-emerald-600" },
    error:   { bar: "bg-red-500",     bg: "bg-white border-red-400",     icon: "❌", text: "text-gray-800",   sub: "text-red-600"     },
    info:    { bar: "bg-blue-500",    bg: "bg-white border-blue-400",    icon: "ℹ️", text: "text-gray-800",   sub: "text-blue-600"    },
    warning: { bar: "bg-amber-500",   bg: "bg-white border-amber-400",   icon: "⚠️", text: "text-gray-800",  sub: "text-amber-600"   },
  };

  const s = styles[toast.type] || styles.info;

  return (
    <div
      style={{
        minWidth: "280px",
        maxWidth: "360px",
        transform: visible ? "translateX(0)" : "translateX(110%)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease",
        position: "relative",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "14px 40px 14px 18px",
        borderRadius: "14px",
        border: "1px solid",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        overflow: "hidden",
      }}
      className={`${s.bg} border`}
    >
      {/* Left colour bar */}
      <div
        className={s.bar}
        style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "4px", borderRadius: "14px 0 0 14px" }}
      />
      <span style={{ fontSize: "1.1rem", flexShrink: 0, marginTop: "2px" }}>{s.icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "#1f2937" }}>
          {toast.message}
        </p>
      </div>
      {/* Close button */}
      <button
        onClick={() => { setVisible(false); setTimeout(() => onRemove(toast.id), 350); }}
        style={{
          position: "absolute",
          top: "8px",
          right: "10px",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "1.2rem",
          color: "#9ca3af",
          lineHeight: 1,
          padding: "2px 4px",
        }}
        onMouseEnter={e => e.target.style.color = "#374151"}
        onMouseLeave={e => e.target.style.color = "#9ca3af"}
      >
        ×
      </button>
    </div>
  );
}

/* ─── Toast Portal Container ─────────────────────────────────────────────── */
// Uses ReactDOM.createPortal so it ALWAYS renders at document.body level,
// bypassing any CSS overflow / transform containment from parent layouts.
export function ToastContainer({ toasts, removeToast }) {
  if (typeof document === "undefined") return null;

  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "16px",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div key={t.id} style={{ pointerEvents: "auto" }}>
          <ToastItem toast={t} onRemove={removeToast} />
        </div>
      ))}
    </div>,
    document.body
  );
}

/* ─── useToast hook ──────────────────────────────────────────────────────── */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info", duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toast = {
    success: (msg, dur) => addToast(msg, "success", dur),
    error:   (msg, dur) => addToast(msg, "error",   dur),
    info:    (msg, dur) => addToast(msg, "info",    dur),
    warning: (msg, dur) => addToast(msg, "warning", dur),
  };

  return { toasts, toast, removeToast };
}
