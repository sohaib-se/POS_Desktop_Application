import type { SaleTab } from "@/pages/AddSale";
import { useSettings } from "@/hooks/useSettings";

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
  onShare?: () => void;
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
  onShare,
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

          {/* Left: attachments */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 170 }}>
            {activeTab.showDescriptionInput ? (
              <textarea
                autoFocus rows={3}
                placeholder="Add description..."
                style={{ border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13, padding: "8px 10px", resize: "none", width: "100%", outline: "none" }}
                value={activeTab.description}
                onChange={(e) => updateTab({ description: e.target.value })}
              />
            ) : (
              <button onClick={() => updateTab({ showDescriptionInput: true })}
                style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "#9ca3af", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", padding: 0 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                ADD DESCRIPTION
              </button>
            )}
            <button
              onClick={() => imageInputRef.current?.click()}
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "#9ca3af", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", padding: 0 }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
              ADD IMAGE
            </button>
            <button
              onClick={() => documentInputRef.current?.click()}
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "#9ca3af", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", padding: 0 }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
              ADD DOCUMENT
            </button>
            {activeTab.imageFileName && (
              <div style={{ fontSize: 12, color: "#6b7280" }}>Image: {activeTab.imageFileName}</div>
            )}
            {activeTab.documentFileName && (
              <div style={{ fontSize: 12, color: "#6b7280" }}>Document: {activeTab.documentFileName}</div>
            )}
          </div>

          {/* Right: totals */}
          <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", gap: 12, fontSize: 13, minWidth: 370 }}>

            {/* Discount */}
            {isTransactionDiscountEnabled && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                <span style={{ color: "#6b7280", width: 68, textAlign: "right" }}>Discount</span>
                <input type="number"
                  style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "5px 8px", width: 78, textAlign: "right", fontSize: 13, outline: "none" }}
                  value={activeTab.discountPercent}
                  onChange={(e) => updateDiscountPercent(e.target.value)}
                />
                <span style={{ color: "#9ca3af", fontSize: 12 }}>(%)</span>
                <span style={{ color: "#d1d5db", margin: "0 2px" }}>–</span>
                <input type="number"
                  style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "5px 8px", width: 100, textAlign: "right", fontSize: 13, outline: "none" }}
                  value={activeTab.discountRs}
                  onChange={(e) => updateDiscountAmount(e.target.value)}
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
                        updateTab({ receivedAll: checked, received: checked ? String(roundedTotal) : activeTab.received });
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
        <div style={{ display: "flex", border: "1px solid #d1d5db", borderRadius: 4, overflow: "hidden" }}>
          <button onClick={onShare}
            style={{ padding: "7px 20px", fontSize: 13, fontWeight: 500, color: "#374151", background: "#fff", border: "none", cursor: "pointer" }}>
            Share
          </button>
          <button style={{ padding: "7px 8px", fontSize: 13, color: "#6b7280", background: "#fff", border: "none", borderLeft: "1px solid #d1d5db", cursor: "pointer" }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
          </button>
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
