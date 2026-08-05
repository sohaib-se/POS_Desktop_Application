import { ChevronDown } from "lucide-react";
import { CheckRow, Hint, RadioRow, PrefixField } from "../shared/SharedComponents";
import { COL, SH, HR, selStyle, inputStyle, nudgeBtn } from "../shared/styles";

export function TransactionTab() {
  return (
    <div style={{ padding: "24px 0" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
        {/* Col 1 – Transaction Header */}
        <div style={COL}>
          <div style={SH}>Transaction Header</div>
          <hr style={HR} />
          <CheckRow label="Invoice/Bill No." hint defaultChecked />
          <CheckRow label="Add Time on Transactions" hint />
          <CheckRow label="Cash Sale by default" hint />
          <CheckRow label="Billing Name of Parties" hint />
          <CheckRow label="Customers P.O. Details on Transactions" hint />
        </div>

        {/* Col 2 – Items Table */}
        <div style={{ ...COL, borderLeft: "1px solid #e5e7eb" }}>
          <div style={SH}>Items Table</div>
          <hr style={HR} />
          <CheckRow
            label="Inclusive/Exclusive Tax on Rate(Price/Unit)"
            hint
            defaultChecked
          />
          <CheckRow
            label="Display Purchase Price of Items"
            hint
            defaultChecked
          />
          <CheckRow label="Show last 5 Sale Price of Items" hint />
          <CheckRow label="Show last 5 Purchase Price of Items" hint />
          <CheckRow label="Free Item Quantity" hint />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
            }}
          >
            <input
              type="checkbox"
              style={{
                accentColor: "#2563eb",
                width: 15,
                height: 15,
                cursor: "pointer",
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 13, color: "#374151" }}>Count</span>
            <span style={{ fontSize: 12, color: "#2563eb", cursor: "pointer" }}>
              Change Text
            </span>
            <Hint />
          </div>
        </div>

        {/* Col 3 – Taxes, Discount & Totals */}
        <div style={{ ...COL, borderLeft: "1px solid #e5e7eb" }}>
          <div style={SH}>Taxes, Discount &amp; Totals</div>
          <hr style={HR} />
          <CheckRow label="Transaction wise Tax" hint defaultChecked />
          <CheckRow label="Transaction wise Discount" hint defaultChecked />
          <CheckRow label="Round Off Total" hint defaultChecked />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: 14,
              marginTop: 4,
            }}
          >
            <select style={selStyle}>
              <option>Nearest</option>
              <option>Round Up</option>
              <option>Round Down</option>
            </select>
            <span style={{ fontSize: 13, color: "#374151" }}>To</span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #d1d5db",
                borderRadius: 5,
                overflow: "hidden",
              }}
            >
              <input
                type="number"
                defaultValue={1}
                style={{
                  ...inputStyle,
                  width: 50,
                  border: "none",
                  borderRadius: 0,
                }}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  borderLeft: "1px solid #d1d5db",
                }}
              >
                <button style={nudgeBtn}>▲</button>
                <button style={{ ...nudgeBtn, borderTop: "1px solid #d1d5db" }}>
                  ▼
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        {/* More Transaction Features */}
        <div style={COL}>
          <div style={SH}>More Transaction Features</div>
          <hr style={HR} />
          <CheckRow label="Quick Entry" hint />
          <CheckRow label="Do not Show Invoice Preview" hint />
          <CheckRow
            label={
              <span>
                Enable <span style={{ color: "#2563eb" }}>Passcode</span> for{" "}
                <span style={{ color: "#2563eb" }}>transaction</span>{" "}
                edit/delete
              </span>
            }
            hint
          />
          <CheckRow label="Discount During Payments" hint />
          <CheckRow label="Link Payments to Invoices" hint />
          <CheckRow label="Due Dates and Payment Terms" hint />
        </div>

        {/* Transaction Prefixes */}
        <div style={{ ...COL, borderLeft: "1px solid #e5e7eb" }}>
          <div style={SH}>Transaction Prefixes</div>
          <hr style={HR} />
          {/* Firm selector */}
          <div
            style={{
              border: "1px solid #d1d5db",
              borderRadius: 6,
              padding: "8px 12px",
              marginBottom: 16,
              position: "relative",
            }}
          >
            <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 4 }}>
              Firm
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 13, color: "#374151" }}>My Company</span>
              <ChevronDown size={14} color="#6b7280" />
            </div>
          </div>
          {/* Prefixes box */}
          <div
            style={{
              border: "1px solid #d1d5db",
              borderRadius: 6,
              padding: "12px 14px",
            }}
          >
            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 10 }}>
              Prefixes
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              {[
                ["Sale", "Credit Note"],
                ["Sale Order", "Purchase Order"],
                ["Estimate", "Proforma Invoice"],
                ["Delivery Challan", "Payment In"],
              ].map(([a, b]) => (
                <>
                  <PrefixField key={a} label={a} />
                  <PrefixField key={b} label={b} />
                </>
              ))}
            </div>
          </div>
        </div>

        {/* Billing Type */}
        <div style={{ ...COL, borderLeft: "1px solid #e5e7eb" }}>
          <div style={SH}>Billing Type</div>
          <hr style={HR} />
          <RadioRow label="Lite Sale" checked={false} />
          <RadioRow label="Full Sale" checked={true} />
        </div>
      </div>
    </div>
  );
}
