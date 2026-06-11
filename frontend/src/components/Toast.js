import { useEffect, useState } from "react";

/* ─── Single Toast item ─────────────────────────────────────────────────────── */
function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false);

  // Slide-in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Auto-dismiss
  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300); // wait for slide-out
    }, toast.duration || 3500);
    return () => clearTimeout(t);
  }, [toast, onRemove]);

  const styles = {
    success: {
      bar:  "bg-emerald-500",
      bg:   "bg-emerald-50 border-emerald-200",
      icon: "✅",
      text: "text-emerald-800",
    },
    error: {
      bar:  "bg-red-500",
      bg:   "bg-red-50 border-red-200",
      icon: "❌",
      text: "text-red-800",
    },
    info: {
      bar:  "bg-blue-500",
      bg:   "bg-blue-50 border-blue-200",
      icon: "ℹ️",
      text: "text-blue-800",
    },
    warning: {
      bar:  "bg-amber-500",
      bg:   "bg-amber-50 border-amber-200",
      icon: "⚠️",
      text: "text-amber-800",
    },
  };

  const s = styles[toast.type] || styles.info;

  return (
    <div
      className={`
        relative flex items-start gap-3 p-4 pr-10 rounded-xl border shadow-lg
        transition-all duration-300 ease-out overflow-hidden
        ${s.bg}
        ${visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
      style={{ minWidth: "280px", maxWidth: "360px" }}
    >
      {/* Left colour bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${s.bar}`} />

      <span className="text-lg flex-shrink-0 mt-0.5">{s.icon}</span>

      <p className={`text-sm font-semibold leading-snug flex-1 ${s.text}`}>
        {toast.message}
      </p>

      {/* Close button */}
      <button
        onClick={() => { setVisible(false); setTimeout(() => onRemove(toast.id), 300); }}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}

/* ─── Toast Container ───────────────────────────────────────────────────────── */
export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-5 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
}

/* ─── useToast hook ─────────────────────────────────────────────────────────── */
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
