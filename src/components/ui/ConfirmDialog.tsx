import { useEffect } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: string;
  icon?: "warning" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmColor = "#e53935",
  icon = "warning",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(2px)",
        animation: "fadeIn 0.15s ease-out",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .confirm-dialog-btn { transition: filter 0.15s, transform 0.1s; }
        .confirm-dialog-btn:hover { filter: brightness(0.93); transform: translateY(-1px); }
        .confirm-dialog-btn:active { transform: translateY(0); filter: brightness(0.85); }
      `}</style>
      <div
        style={{
          background: "#fff", borderRadius: 12, padding: "36px 32px 28px",
          width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          textAlign: "center", animation: "slideUp 0.18s ease-out",
        }}
      >
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: icon === "danger" ? "#fee2e2" : "#fff3e0",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 18px",
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
              stroke={icon === "danger" ? "#e53935" : "#f59e0b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="9" x2="12" y2="13" stroke={icon === "danger" ? "#e53935" : "#f59e0b"} strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="17" x2="12.01" y2="17" stroke={icon === "danger" ? "#e53935" : "#f59e0b"} strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 10 }}>{title}</div>
        <div style={{ fontSize: 13.5, color: "#6b7280", lineHeight: 1.6, marginBottom: 28, padding: "0 8px" }}>{message}</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="confirm-dialog-btn" onClick={onCancel}
            style={{ flex: 1, padding: "10px 0", fontSize: 14, fontWeight: 600, border: "1.5px solid #e5e7eb", borderRadius: 8, background: "#fff", color: "#374151", cursor: "pointer" }}>
            {cancelLabel}
          </button>
          <button className="confirm-dialog-btn" onClick={onConfirm}
            style={{ flex: 1, padding: "10px 0", fontSize: 14, fontWeight: 600, border: "none", borderRadius: 8, background: confirmColor, color: "#fff", cursor: "pointer" }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
