import type { SaleTab } from "@/pages/AddSale";
import { useSettings } from "@/hooks/useSettings";
import { Trash2 } from "lucide-react";

interface AddSaleBottomActionsProps {
  activeTab: SaleTab;
  updateTab: (partial: Partial<SaleTab>) => void;
  updateDiscountPercent: (value: string) => void;
  updateDiscountAmount: (value: string) => void;
  imageInputRef: React.RefObject<HTMLInputElement | null>;
  documentInputRef: React.RefObject<HTMLInputElement | null>;
  handleAttachmentSelection: (event: React.ChangeEvent<HTMLInputElement>, type: "image" | "document") => void;
  taxOptions: string[];
  taxAmount: number;
  roundOffDiff: number;
  roundedTotal: number;
  computedBalance: number;
  saveError: string;
  isSaving: boolean;
  handleSaveSale: () => void;
  isEditing: boolean;
}

export function AddSaleBottomActions({
  activeTab,
  updateTab,
  updateDiscountPercent,
  updateDiscountAmount,
  imageInputRef,
  documentInputRef,
  handleAttachmentSelection,
  taxOptions,
  taxAmount,
  roundOffDiff,
  roundedTotal,
  computedBalance,
  saveError,
  isSaving,
  handleSaveSale,
  isEditing,
}: AddSaleBottomActionsProps) {
  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const [isTransactionTaxEnabled] = useSettings('settings.isTransactionTaxEnabled', true);
  const [isTransactionDiscountEnabled] = useSettings('settings.isTransactionDiscountEnabled', true);
  const [isRoundOffTotalEnabled] = useSettings('settings.isRoundOffTotalEnabled', true);

  return (
    <>
      <div style={{ background: "#fff", padding: "20px 20px 24px 20px" }}>
        <div style={{ display: "flex", gap: 24 }}>

          {/* Left: attachments — same as BottomSection in estimate */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 170 }}>
            {/* Description */}
            {activeTab.showDescriptionInput ? (
              <textarea
                autoFocus rows={3}
                placeholder="Add description..."
                style={{ border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13, padding: "8px 10px", resize: "none", width: "100%", outline: "none" }}
                value={activeTab.description}
                onChange={(e) => updateTab({ description: e.target.value })}
                onBlur={(e) => {
                  if (!e.target.value.trim()) {
                    updateTab({ showDescriptionInput: false });
                  }
                }}
              />
            ) : (
              <button onClick={() => updateTab({ showDescriptionInput: true })}
                style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "#9ca3af", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", padding: 0 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                ADD DESCRIPTION
              </button>
            )}

            {/* Image — rich preview like estimate */}
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
                  <div style={{ cursor: "pointer" }} onClick={() => imageInputRef.current?.click()}>CHANGE</div>
                  <div style={{ cursor: "pointer" }} onClick={() => updateTab({ imageDataUrl: "", imageFileName: "" })}>DELETE</div>
                </div>
              </div>
            ) : (
              <button onClick={() => imageInputRef.current?.click()} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "#9ca3af", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", padding: 0 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                ADD IMAGE
              </button>
            )}

            {/* Document — rich preview like estimate */}
            {activeTab.documentDataUrl ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 220 }}>
                <div style={{ border: "1px dashed #d1d5db", padding: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ background: "#f8fafc", padding: "8px 10px", display: "flex", alignItems: "center", gap: 6, borderRadius: 2, width: "100%", overflow: "hidden" }}>
                    <svg width="14" height="14" fill="none" stroke="#059669" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                    <span style={{ color: "#059669", fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {activeTab.documentFileName || "Document"} added successfully
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px" }}>
                  <Trash2
                    size={16}
                    style={{ cursor: "pointer", color: "#f87171" }}
                    onClick={() => updateTab({ documentDataUrl: "", documentFileName: "" })}
                  />
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6, color: "#3b82f6", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
                    onClick={() => {
                      if (activeTab.documentDataUrl) {
                        const a = document.createElement("a");
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
              <button onClick={() => documentInputRef.current?.click()} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "#9ca3af", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", padding: 0 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                ADD DOCUMENT
              </button>
            )}
          </div>

          {/* Right: totals */}
          <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", gap: 12, fontSize: 13, minWidth: 370 }}>

            {/* Discount */}
            {isTransactionDiscountEnabled && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                <span style={{ color: "#6b7280", width: 68, textAlign: "right" }}>Discount</span>
                <input type="number"
                  min="0"
                  style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "5px 8px", width: 78, textAlign: "right", fontSize: 13, outline: "none" }}
                  value={activeTab.discountPercent}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || parseFloat(val) >= 0) {
                      updateDiscountPercent(val);
                    }
                  }}
                />
                <span style={{ color: "#9ca3af", fontSize: 12 }}>(%)</span>
                <span style={{ color: "#d1d5db", margin: "0 2px" }}>–</span>
                <input type="number"
                  min="0"
                  style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "5px 8px", width: 100, textAlign: "right", fontSize: 13, outline: "none" }}
                  value={activeTab.discountRs}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || parseFloat(val) >= 0) {
                      updateDiscountAmount(val);
                    }
                  }}
                />
                <span style={{ color: "#9ca3af", fontSize: 12 }}>(Rs)</span>
              </div>
            )}

            {/* Tax */}
            {isTransactionTaxEnabled && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                <span style={{ color: "#6b7280", width: 68, textAlign: "right" }}>Tax</span>
                <select
                  style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "5px 8px", width: 170, fontSize: 13, color: "#374151", background: "#fff", outline: "none" }}
                  value={activeTab.tax}
                  onChange={(e) => updateTab({ tax: e.target.value })}
                >
                  {taxOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <span style={{ color: "#374151", width: 62, textAlign: "right" }}>
                  {taxAmount > 0 ? taxAmount.toFixed(2) : "0"}
                </span>
              </div>
            )}

            {/* Round Off */}
            {isRoundOffTotalEnabled && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <input type="checkbox" checked={activeTab.roundOff}
                    onChange={(e) => updateTab({ roundOff: e.target.checked })}
                    style={{ width: 15, height: 15, accentColor: "#3b82f6", cursor: "pointer" }}
                  />
                  <span style={{ color: "#6b7280" }}>Round Off</span>
                </label>
                <input type="text" readOnly
                  style={{ border: "1px solid #e5e7eb", borderRadius: 4, padding: "5px 8px", width: 80, textAlign: "right", fontSize: 13, color: "#6b7280", background: "#f9fafb" }}
                  value={roundOffDiff !== 0 ? roundOffDiff.toFixed(2) : "0"}
                />
              </div>
            )}

            {/* Total */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
              <span style={{ color: "#374151", fontWeight: 600, width: 68, textAlign: "right" }}>Total</span>
              <input type="text" readOnly={activeTab.paymentMode === "cash"} disabled={activeTab.paymentMode === "cash"}
                style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "5px 10px", width: 210, textAlign: "right", fontSize: 13, fontWeight: 600, color: "#1f2937", background: activeTab.paymentMode === "cash" ? "#f9fafb" : "#fff", outline: "none" }}
                value={roundedTotal > 0 ? fmt(roundedTotal) : ""}
              />
            </div>

            {/* Received & Balance (Credit Only) */}
            {activeTab.paymentMode === "credit" && (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", marginRight: "auto" }}>
                    <input type="checkbox" checked={activeTab.receivedAll}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        updateTab({
                          receivedAll: checked,
                          // When checked: fill with total. When unchecked: clear so balance = full amount
                          received: checked ? String(roundedTotal) : "",
                        });
                      }}
                      style={{ width: 15, height: 15, accentColor: "#3b82f6", cursor: "pointer" }}
                    />
                    <span style={{ color: "#6b7280" }}>Received All</span>
                  </label>
                  <span style={{ color: "#6b7280", width: 68, textAlign: "right" }}>Received</span>
                  <input type="number"
                    style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "5px 10px", width: 210, textAlign: "right", fontSize: 13, color: "#1f2937", background: "#fff", outline: "none" }}
                    value={activeTab.received || ""}
                    onChange={(e) => {
                      updateTab({ received: e.target.value, receivedAll: false });
                    }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                  <span style={{ color: computedBalance < 0 ? "#b91c1c" : "#374151", fontWeight: 600, width: 120, textAlign: "right" }}>
                    {computedBalance < 0 ? "Change To Return" : "Balance"}
                  </span>
                  <input type="text" readOnly
                    style={{ border: "1px solid #e5e7eb", borderRadius: 4, padding: "5px 10px", width: 210, textAlign: "right", fontSize: 13, fontWeight: 600, color: computedBalance < 0 ? "#b91c1c" : "#1f2937", background: "#f9fafb" }}
                    value={fmt(Math.abs(computedBalance))}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => handleAttachmentSelection(event, "image")}
        />
        <input
          ref={documentInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
          hidden
          onChange={(event) => handleAttachmentSelection(event, "document")}
        />
      </div>

      {/* ── FOOTER ── */}
      <div style={{ background: "#fff", flexShrink: 0, padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, borderTop: "1px solid #e5e7eb" }}>
        <div style={{ fontSize: 12, color: "#b91c1c", minHeight: 16 }}>
          {saveError}
        </div>
        <button onClick={handleSaveSale}
          disabled={isSaving}
          style={{ padding: "7px 32px", fontSize: 13, fontWeight: 700, color: "#fff", background: isSaving ? "#93c5fd" : "#2563eb", border: "none", borderRadius: 4, cursor: isSaving ? "not-allowed" : "pointer", boxShadow: "0 1px 4px rgba(37,99,235,0.3)" }}>
          {isSaving ? "Saving..." : isEditing ? "Update" : "Save"}
        </button>
      </div>
    </>
  );
}
