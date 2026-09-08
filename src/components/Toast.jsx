import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = "info", title = "") => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    const newToast = { id, message, type, title };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const toast = {
    success: (msg, title) => addToast(msg, "success", title || "Berhasil"),
    error: (msg, title) => addToast(msg, "error", title || "Terjadi Kesalahan"),
    warning: (msg, title) => addToast(msg, "warning", title || "Peringatan"),
    info: (msg, title) => addToast(msg, "info", title || "Informasi"),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* TOAST CONTAINER */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-4">
        {toasts.map((t) => {
          let bgClass = "bg-white border-gray-200 text-gray-800 shadow-xl shadow-gray-900/10";
          let icon = <Info className="h-5 w-5 text-blue-500 shrink-0" />;
          let barColor = "bg-blue-500";

          if (t.type === "success") {
            bgClass = "bg-emerald-950 border-emerald-800/60 text-white shadow-xl shadow-emerald-950/20";
            icon = <CheckCircle2 className="h-5 w-5 text-[#D8FF00] shrink-0" />;
            barColor = "bg-[#D8FF00]";
          } else if (t.type === "error") {
            bgClass = "bg-rose-950 border-rose-800/60 text-white shadow-xl shadow-rose-950/20";
            icon = <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />;
            barColor = "bg-rose-500";
          } else if (t.type === "warning") {
            bgClass = "bg-amber-950 border-amber-800/60 text-white shadow-xl shadow-amber-950/20";
            icon = <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />;
            barColor = "bg-amber-400";
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto relative flex items-start gap-3 rounded-2xl border p-4 transition-all duration-300 transform translate-y-0 opacity-100 backdrop-blur-md ${bgClass}`}
              role="alert"
            >
              <div className="mt-0.5">{icon}</div>
              <div className="flex-1 min-w-0">
                {t.title && (
                  <p className="text-xs font-bold tracking-wide uppercase opacity-90">
                    {t.title}
                  </p>
                )}
                <p className="text-xs font-medium leading-relaxed mt-0.5 break-words">
                  {t.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="opacity-60 hover:opacity-100 p-1 rounded-lg transition"
                aria-label="Close notification"
              >
                <X size={14} />
              </button>
              <div className={`absolute bottom-0 left-4 right-4 h-0.5 rounded-full opacity-40 ${barColor}`} />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if used outside provider
    return {
      success: (msg) => console.log("[Toast Success]", msg),
      error: (msg) => console.error("[Toast Error]", msg),
      warning: (msg) => console.warn("[Toast Warning]", msg),
      info: (msg) => console.info("[Toast Info]", msg),
    };
  }
  return context;
}
