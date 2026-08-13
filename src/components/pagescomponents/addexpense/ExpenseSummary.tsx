import { useEffect, useState } from "react";
import type React from "react";
import type { ExpenseTab } from "./types";
import { useSettings } from "@/hooks/useSettings";

interface ExpenseSummaryProps {
  activeTab: ExpenseTab;
  updateTab: (partial: Partial<ExpenseTab>) => void;
  totalAmount: number;
  handleAttachmentSelection: (
    event: React.ChangeEvent<HTMLInputElement>,
    attachmentType: "image" | "document"
  ) => void;
}

export function ExpenseSummary({
  activeTab,
  updateTab,
  totalAmount,
  handleAttachmentSelection,
}: ExpenseSummaryProps) {
  const [paymentOptions, setPaymentOptions] = useState<string[]>(["Cash"]);
  const [isRoundOffTotalEnabled] = useSettings('settings.isRoundOffTotalEnabled', true);

  useEffect(() => {
    let cancelled = false;
    const loadBankAccounts = async () => {
      try {
        const response = await fetch("/api/bank_accounts");
        if (!response.ok) return;
        const accounts = await response.json();
        if (!cancelled) {
          setPaymentOptions(["Cash", ...accounts.map((acc: any) => acc.name)]);
        }
      } catch (error) {
        console.error(error);
      }
    };

    void loadBankAccounts();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ background: "#fff", padding: "20px 20px 24px 20px" }}>
      <div style={{ display: "flex", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 170 }}>
          <div style={{ position: "relative", width: 160 }}>
            <label style={{ position: "absolute", top: -11, left: 10, background: "#fff", padding: "0 4px", color: "#94a3b8", fontSize: 12 }}>
              Payment Type
            </label>
            <select
              value={activeTab.paymentType}
              onChange={(event) => updateTab({ paymentType: event.target.value })}
              style={{ appearance: "none", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13, color: "#374151", background: "#fff", padding: "7px 30px 7px 12px", width: "100%", cursor: "pointer" }}
            >
              {paymentOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#6b7280" }}>▾</span>
          </div>
          <button
            type="button"
            style={{ background: "none", border: "none", color: "#1976d2", fontSize: 13, padding: 0, display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
            Add Payment type
          </button>
          {activeTab.showDescriptionInput ? (
            <textarea
              autoFocus
              rows={3}
              placeholder="Add description..."
              style={{ border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13, padding: "8px 10px", resize: "none", width: "100%", outline: "none" }}
              value={activeTab.description}
              onChange={(event) => updateTab({ description: event.target.value })}
            />
          ) : (
            <button
              onClick={() => updateTab({ showDescriptionInput: true })}
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "#9ca3af", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", padding: 0 }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              ADD DESCRIPTION
            </button>
          )}
          <button
            onClick={() => document.getElementById(`expense-image-${activeTab.id}`)?.click()}
            style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 4, color: "#a3a3a3", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", width: 120, justifyContent: "center" }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
            ADD IMAGE
          </button>
          <button
            onClick={() => document.getElementById(`expense-document-${activeTab.id}`)?.click()}
            style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 4, color: "#a3a3a3", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", width: 120, justifyContent: "center" }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
            ADD DOCUMENT
          </button>
          <div style={{ fontSize: 12, color: "#6b7280" }}>{activeTab.imageFileName ? `Image: ${activeTab.imageFileName}` : ""}</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>{activeTab.documentFileName ? `Document: ${activeTab.documentFileName}` : ""}</div>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", gap: 12, fontSize: 13, minWidth: 370 }}>
          {isRoundOffTotalEnabled && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={activeTab.roundOff}
                  onChange={(event) => updateTab({ roundOff: event.target.checked })}
                  style={{ width: 15, height: 15, accentColor: "#1976d2", cursor: "pointer" }}
                />
                <span style={{ color: "#6b7280" }}>Round Off</span>
              </label>
              <input
                type="text"
                readOnly
                style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "5px 8px", width: 62, textAlign: "right", fontSize: 13, color: "#6b7280", background: "#fff" }}
                value={activeTab.roundOff ? Math.round(totalAmount) - totalAmount : 0}
              />
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
            <span style={{ color: "#374151", fontWeight: 600, width: 68, textAlign: "right" }}>Total</span>
            <input
              type="text"
              readOnly
              style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "5px 10px", width: 210, textAlign: "right", fontSize: 13, fontWeight: 600, color: "#1f2937", background: "#fff", outline: "none" }}
              value={totalAmount > 0 ? totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ""}
            />
          </div>
        </div>
      </div>

      <input
        id={`expense-image-${activeTab.id}`}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => handleAttachmentSelection(event, "image")}
      />
      <input
        id={`expense-document-${activeTab.id}`}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
        hidden
        onChange={(event) => handleAttachmentSelection(event, "document")}
      />
    </div>
  );
}
