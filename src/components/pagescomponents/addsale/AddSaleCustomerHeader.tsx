import { useRef } from "react";
import type { SaleTab, PartyOption } from "@/pages/AddSale";

interface AddSaleCustomerHeaderProps {
  activeTab: SaleTab;
  parties: PartyOption[];
  setActiveTabCustomer: (partyId: string) => void;
  updateTab: (partial: Partial<SaleTab>) => void;
  displayedInvoiceNo: string;
  displayedInvoiceDate: string;
}

export function AddSaleCustomerHeader({
  activeTab,
  parties,
  setActiveTabCustomer,
  updateTab,
  displayedInvoiceNo,
  displayedInvoiceDate,
}: AddSaleCustomerHeaderProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  let dateValue = "";
  if (displayedInvoiceDate) {
    const parts = displayedInvoiceDate.split('/');
    if (parts.length === 3) {
      dateValue = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }

  return (
    <div style={{ background: "#fff", padding: "25px 20px 80px 20px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <select
              style={{
                appearance: "none", border: "1px solid #d1d5db", borderRadius: 4,
                fontSize: 13, color: "#6b7280", background: "#fff",
                padding: "7px 32px 7px 12px", minWidth: 210, cursor: "pointer",
              }}
              value={activeTab.customerSearch}
              onChange={(e) => setActiveTabCustomer(e.target.value)}
            >
              <option value="">Select Party</option>
              {parties
                .filter(party => party.status !== 'inactive' || party.id.toString() === activeTab.customerSearch)
                .map((party) => (
                <option key={party.id} value={party.id}>
                  {party.name}
                </option>
              ))}
            </select>
            <span
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "#9ca3af",
              }}
            >
              ▾
            </span>
          </div>
          <input
            type="text"
            placeholder="Phone No."
            style={{
              border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13,
              color: "#6b7280", padding: "7px 12px", width: 150,
            }}
            value={activeTab.phoneNo}
            onChange={(e) => updateTab({ phoneNo: e.target.value })}
          />
        </div>

        <div style={{ fontSize: 13, textAlign: "right", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, marginBottom: 8 }}>
            <span style={{ color: "#6b7280" }}>Invoice Number</span>
            <span style={{ fontWeight: 600, color: "#1f2937" }}>{displayedInvoiceNo}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, position: "relative" }}>
            <span style={{ color: "#6b7280" }}>Invoice Date</span>
            <span style={{ fontWeight: 600, color: "#1f2937" }}>{displayedInvoiceDate}</span>
            <button 
              onClick={() => dateInputRef.current?.showPicker()}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#3b82f6", padding: 0, display: "flex", alignItems: "center" }}
            >
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </button>
            <input
              type="date"
              ref={dateInputRef}
              value={dateValue}
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  const [year, month, day] = val.split('-');
                  updateTab({ invoiceDate: `${day}/${month}/${year}` });
                }
              }}
              style={{ position: 'absolute', width: 0, height: 0, opacity: 0, overflow: 'hidden', bottom: 0, right: 0 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
