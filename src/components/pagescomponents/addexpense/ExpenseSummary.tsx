import { useEffect, useState, useRef } from "react";
import type React from "react";
import type { ExpenseTab } from "./types";
import { useSettings } from "@/hooks/useSettings";
import { Trash2 } from "lucide-react";

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

  const imageRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);

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

  const roundOffDiff = activeTab.roundOff ? Math.round(totalAmount) - totalAmount : 0;
  const roundedTotal = activeTab.roundOff ? Math.round(totalAmount) : totalAmount;

  return (
    <div style={{ background: "#fff", padding: "20px 20px 24px 20px" }}>
      <div style={{ display: "flex", gap: 24 }}>
        {/* Left: attachments and description */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 170 }}>


          {activeTab.showDescriptionInput ? (
            <textarea
              autoFocus
              rows={3}
              placeholder="Add description..."
              style={{ border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13, padding: "8px 10px", resize: "none", width: "100%", outline: "none" }}
              value={activeTab.description}
              onChange={(event) => updateTab({ description: event.target.value })}
              onBlur={(e) => {
                if (!e.target.value.trim()) {
                  updateTab({ showDescriptionInput: false });
                }
              }}
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

          {activeTab.imageDataUrl ? (
            <div
              style={{ position: "relative", width: 220, height: 140, border: "1px solid #e5e7eb", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}
              onMouseEnter={(e) => { (e.currentTarget.lastChild as HTMLElement).style.opacity = "1"; }}
              onMouseLeave={(e) => { (e.currentTarget.lastChild as HTMLElement).style.opacity = "0"; }}
            >
              <img src={activeTab.imageDataUrl} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} alt="Attachment" />
              <div
                style={{
                  position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: "rgba(0,0,0,0.55)",
                  display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px",
                  opacity: 0, transition: "opacity 0.2s ease-in-out", color: "#fff", fontSize: 12, fontWeight: 600, letterSpacing: "0.02em"
                }}
              >
                <div style={{ cursor: "pointer" }} onClick={() => imageRef.current?.click()}>CHANGE</div>
                <div style={{ cursor: "pointer" }} onClick={() => updateTab({ imageDataUrl: "", imageFileName: "" })}>DELETE</div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => imageRef.current?.click()}
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "#9ca3af", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", padding: 0 }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
              ADD IMAGE
            </button>
          )}

          {activeTab.documentDataUrl ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 220 }}>
              <div style={{ border: "1px dashed #d1d5db", padding: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ background: "#f8fafc", padding: "8px 10px", display: "flex", alignItems: "center", gap: 6, borderRadius: 2, width: "100%", overflow: "hidden" }}>
                  <svg width="14" height="14" fill="none" stroke="#059669" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                  <span style={{ color: "#059669", fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {activeTab.documentFileName} added successfully
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "space-between", padding: "0 4px" }}>
                <Trash2 size={16} style={{ cursor: "pointer", color: "#f87171" }} onClick={() => updateTab({ documentDataUrl: "", documentFileName: "" })} />
                <div
                  style={{ display: "flex", alignItems: "center", gap: 6, color: "#3b82f6", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
                  onClick={() => {
                     if (activeTab.documentDataUrl) {
                       const a = document.createElement('a');
                       a.href = activeTab.documentDataUrl;
                       a.download = activeTab.documentFileName || "document";
                       a.click();
                     }
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                  Download
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => docRef.current?.click()}
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "#9ca3af", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", padding: 0 }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
              ADD DOCUMENT
            </button>
          )}

          <input
            ref={imageRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => handleAttachmentSelection(event, "image")}
          />
          <input
            ref={docRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
            hidden
            onChange={(event) => handleAttachmentSelection(event, "document")}
          />
        </div>

        {/* Right: totals */}
        <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", gap: 12, fontSize: 13, minWidth: 370 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
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
          </div>
          {isRoundOffTotalEnabled && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={activeTab.roundOff}
                  onChange={(event) => updateTab({ roundOff: event.target.checked })}
                  style={{ width: 15, height: 15, accentColor: "#3b82f6", cursor: "pointer" }}
                />
                <span style={{ color: "#6b7280" }}>Round Off</span>
              </label>
              <input
                type="text"
                readOnly
                style={{ border: "1px solid #e5e7eb", borderRadius: 4, padding: "5px 8px", width: 80, textAlign: "right", fontSize: 13, color: "#6b7280", background: "#f9fafb" }}
                value={roundOffDiff !== 0 ? roundOffDiff.toFixed(2) : "0"}
              />
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
            <span style={{ color: "#374151", fontWeight: 600, width: 68, textAlign: "right" }}>Total</span>
            <input
              type="text"
              readOnly
              style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "5px 10px", width: 210, textAlign: "right", fontSize: 13, fontWeight: 600, color: "#1f2937", background: "#fff", outline: "none" }}
              value={roundedTotal > 0 ? roundedTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ""}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
