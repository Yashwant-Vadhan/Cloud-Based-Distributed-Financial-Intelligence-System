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

  // Auto-dismiss within 2-3 seconds (default 2500ms)
  useEffect(() => {
    const hideTimer = setTimeout(() => {
      setVisible(false);
      const removeTimer = setTimeout(() => onRemove(toast.id), 250);
      return () => clearTimeout(removeTimer);
    }, toast.duration || 2500);
    return () => clearTimeout(hideTimer);
  }, [toast, onRemove]);

  const styles = {
    success: { bar: "bg-emerald-500", border: "rgba(16, 185, 129, 0.25)", icon: "✅" },
    error:   { bar: "bg-red-500",     border: "rgba(239, 68, 68, 0.25)",     icon: "❌" },
    info:    { bar: "bg-blue-500",    border: "rgba(59, 130, 246, 0.25)",    icon: "ℹ️" },
    warning: { bar: "bg-amber-500",   border: "rgba(245, 158, 11, 0.25)",   icon: "⚠️" },
  };

  const s = styles[toast.type] || styles.info;

  return (
    <div
      style={{
        minWidth: "260px",
        maxWidth: "340px",
        transform: visible ? "translateX(0)" : "translateX(30px)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease-in-out",
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 32px 10px 14px",
        borderRadius: "10px",
        border: "1px solid",
        borderColor: s.border,
        boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
        overflow: "hidden",
        backgroundColor: "var(--bg-elevated, #ffffff)",
        color: "var(--text-primary, #1f2937)",
      }}
      className="border"
    >
      {/* Left colour bar */}
      <div
        className={s.bar}
        style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "3px", borderRadius: "10px 0 0 10px" }}
      />
      <span style={{ fontSize: "1rem", flexShrink: 0 }}>{s.icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: "0.825rem", fontWeight: 550, color: "var(--text-primary, #1f2937)" }}>
          {toast.message}
        </p>
      </div>
      {/* Close button */}
      <button
        onClick={() => { setVisible(false); setTimeout(() => onRemove(toast.id), 250); }}
        style={{
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
          right: "8px",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "1.1rem",
          color: "var(--text-muted, #9ca3af)",
          lineHeight: 1,
          padding: "2px 4px",
        }}
        onMouseEnter={e => e.target.style.color = "var(--text-primary, #374151)"}
        onMouseLeave={e => e.target.style.color = "var(--text-muted, #9ca3af)"}
      >
        ×
      </button>
    </div>
  );
}

/* ─── Toast Portal Container ─────────────────────────────────────────────── */
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
        gap: "8px",
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

  const addToast = (message, type = "info", duration = 2500) => {
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
