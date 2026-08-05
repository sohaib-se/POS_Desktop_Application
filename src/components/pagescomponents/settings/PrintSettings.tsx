import { useState } from "react";
import { CheckRow } from "./shared/SharedComponents";

export function PrintSettings() {
  const [activePrinter, setActivePrinter] = useState<"regular" | "thermal">(
    "regular",
  );
  const [activeTab, setActiveTab] = useState<"layout" | "colors">("layout");

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 16,
          borderBottom: "1px solid #e5e7eb",
          marginBottom: 20,
        }}
      >
        {(["regular", "thermal"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setActivePrinter(p)}
            style={{
              paddingBottom: 8,
              fontSize: 12,
              fontWeight: 500,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              borderBottom:
                activePrinter === p
                  ? "2px solid #2563eb"
                  : "2px solid transparent",
              color: activePrinter === p ? "#2563eb" : "#6b7280",
            }}
          >
            {p === "regular" ? "REGULAR PRINTER" : "THERMAL PRINTER"}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["layout", "colors"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 500,
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              background: activeTab === t ? "#dbeafe" : "transparent",
              color: activeTab === t ? "#1d4ed8" : "#6b7280",
            }}
          >
            {t === "layout" ? "CHANGE LAYOUT" : "CHANGE COLORS"}
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div>
          {activeTab === "layout" && (
            <>
              <CheckRow label="Total Item Quantity" defaultChecked />
              <CheckRow label="Amount with Decimal e.g. 0.00" defaultChecked />
              <CheckRow label="Received Amount" />
              <div
                style={{
                  borderTop: "1px solid #e5e7eb",
                  paddingTop: 16,
                  marginTop: 8,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#111827",
                    marginBottom: 10,
                  }}
                >
                  Print Company Info / Header
                </div>
                <CheckRow label="Make Regular Printer Default" defaultChecked />
                <CheckRow label="Print entry header on all pages" />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  <input
                    type="checkbox"
                    defaultChecked
                    style={{
                      accentColor: "#2563eb",
                      width: 15,
                      height: 15,
                      cursor: "pointer",
                    }}
                  />
                  <span style={{ fontSize: 13, color: "#374151" }}>
                    Company Logo
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: "#2563eb",
                      cursor: "pointer",
                    }}
                  >
                    (Change)
                  </span>
                </div>
                <CheckRow
                  label="Print repeat header in all pages"
                  defaultChecked
                />
              </div>
            </>
          )}
          {activeTab === "colors" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 12,
              }}
            >
              {[
                { name: "Tax Theme 6", bg: "#8b5cf6" },
                { name: "Double Divine", bg: "#374151" },
                { name: "French Elite", bg: "#d97706" },
                { name: "Theme 1", bg: "#2563eb" },
              ].map((theme) => (
                <button
                  key={theme.name}
                  style={{
                    padding: 10,
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    background: "#fff",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: 48,
                      background: theme.bg,
                      borderRadius: 6,
                      marginBottom: 6,
                    }}
                  />
                  <span style={{ fontSize: 11, color: "#6b7280" }}>
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: 16,
            background: "#f9fafb",
          }}
        >
          <div style={{ background: "#fff", borderRadius: 8, padding: 20 }}>
            <div
              style={{
                background: "#2563eb",
                color: "#fff",
                textAlign: "center",
                padding: "6px 0",
                marginBottom: 12,
                borderRadius: 4,
              }}
            >
              <strong style={{ fontSize: 12 }}>TAX INVOICE</strong>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <div style={{ fontSize: 10 }}>
                <strong>Laimsoft</strong>
                <div style={{ color: "#6b7280" }}>Phone: 3198224949</div>
              </div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  background: "#e5e7eb",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#6b7280",
                }}
              >
                A
              </div>
            </div>
            <table
              style={{
                width: "100%",
                fontSize: 10,
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr style={{ background: "#2563eb", color: "#fff" }}>
                  {["#", "Item name", "Qty", "Price/unit", "Amount"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: "3px 5px",
                          textAlign: "left",
                          fontWeight: 500,
                        }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: "3px 5px" }}>1</td>
                  <td style={{ padding: "3px 5px" }}>Sample Item</td>
                  <td style={{ padding: "3px 5px" }}>2</td>
                  <td style={{ padding: "3px 5px" }}>Rs 1,568.00</td>
                  <td style={{ padding: "3px 5px" }}>Rs 3,136.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
