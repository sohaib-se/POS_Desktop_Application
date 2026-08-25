import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export type ToastType = "success" | "error";

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

// Global emitter for toasts
const toastListeners = new Set<(toast: ToastMessage) => void>();
let nextId = 0;

export const toast = {
  success: (message: string) => {
    const t = { id: nextId++, message, type: "success" as const };
    toastListeners.forEach(listener => listener(t));
  },
  error: (message: string) => {
    const t = { id: nextId++, message, type: "error" as const };
    toastListeners.forEach(listener => listener(t));
  }
};

export function Toaster() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const listener = (toast: ToastMessage) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 3000);
    };
    toastListeners.add(listener);
    return () => { toastListeners.delete(listener); };
  }, []);

  return (
    <div style={{ position: "fixed", top: 24, right: 24, zIndex: 99999, display: "flex", flexDirection: "column", gap: 10 }}>
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}

function ToastItem({ toast }: { toast: ToastMessage }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
    const timer = setTimeout(() => setIsLeaving(true), 2700);
    return () => clearTimeout(timer);
  }, []);

  const bg = toast.type === "success" ? "#10b981" : "#ef4444";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: bg,
        color: "#fff",
        padding: "12px 20px",
        borderRadius: 8,
        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2), 0 8px 10px -6px rgba(0,0,0,0.1)",
        transform: isVisible && !isLeaving ? "translateX(0) scale(1)" : "translateX(30px) scale(0.95)",
        opacity: isVisible && !isLeaving ? 1 : 0,
        transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
      }}
    >
      {toast.type === "success" ? (
        <CheckCircle2 size={20} strokeWidth={2.5} />
      ) : (
        <XCircle size={20} strokeWidth={2.5} />
      )}
      <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: "0.01em" }}>{toast.message}</span>
    </div>
  );
}
