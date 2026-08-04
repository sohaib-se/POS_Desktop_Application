import type { MouseEvent } from "react";
import type { SaleRow, SaleTab } from "./types";

// Resize handle between columns
const ResizeHandle = ({ col, startResize }: { col: number; startResize: (col: number, e: MouseEvent) => void }) => (
  <div
    onMouseDown={(e) => startResize(col, e)}
    style={{
      position: "absolute", right: 0, top: 0,
      width: 6, height: "100%", cursor: "col-resize",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 10,
    }}
  >
    <div style={{ width: 1, height: "60%", background: "#d1d5db" }} />
  </div>
);

interface EstimateTableProps {
  activeTab: SaleTab;
  updateRow: (rowId: number, field: keyof SaleRow, value: string) => void;
  addRow: () => void;
  widths: number[];
  startResize: (col: number, e: MouseEvent) => void;
  totalQty: number;
  totalAmount: number;
  fmt: (n: number) => string;
  unitOptions: string[];
}

export function EstimateTable({
  activeTab,
  updateRow,
  addRow,
  widths,
  startResize,
  totalQty,
  totalAmount,
  fmt,
  unitOptions
}: EstimateTableProps) {
  return (
    <div style={{ background: "#fff", paddingBottom: 80 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: widths[0] }} />
          <col style={{ width: widths[1] }} />
          <col style={{ width: widths[2] }} />
          <col style={{ width: widths[3] }} />
          <col style={{ width: widths[4] }} />
          <col style={{ width: widths[5] }} />
          <col style={{ width: 36 }} />
        </colgroup>
        <thead>
          <tr style={{ background: "#f3f6f9", borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb" }}>
            <th style={{ position: "relative", padding: "8px 0", textAlign: "center", fontSize: 12, fontWeight: 600, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
              #<ResizeHandle col={0} startResize={startResize} />
            </th>
            <th style={{ position: "relative", padding: "8px 10px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
              ITEM<ResizeHandle col={1} startResize={startResize} />
            </th>
            <th style={{ position: "relative", padding: "8px 10px", textAlign: "right", fontSize: 12, fontWeight: 600, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
              QTY<ResizeHandle col={2} startResize={startResize} />
            </th>
            <th style={{ position: "relative", padding: "8px 10px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
              UNIT<ResizeHandle col={3} startResize={startResize} />
            </th>
            <th style={{ position: "relative", padding: "8px 10px", textAlign: "right", fontSize: 12, fontWeight: 600, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
              PRICE/UNIT<ResizeHandle col={4} startResize={startResize} />
            </th>
            <th style={{ position: "relative", padding: "8px 10px", textAlign: "right", fontSize: 12, fontWeight: 600, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
              AMOUNT<ResizeHandle col={5} startResize={startResize} />
            </th>
            <th style={{ padding: "8px 6px", textAlign: "center", background: "#f3f6f9" }}>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "#3b82f6", padding: 0, display: "flex", alignItems: "center" }}>
                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" /></svg>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {activeTab.rows.map((row, idx) => {
            const amount = (parseFloat(row.qty) || 0) * (parseFloat(row.pricePerUnit) || 0);
            return (
              <tr key={row.id} style={{ borderBottom: "1px solid #f0f0f0" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fbff")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
              >
                <td style={{ textAlign: "center", color: "#9ca3af", fontSize: 13, padding: "5px 0", borderRight: "1px solid #e5e7eb" }}>
                  {idx + 1}
                </td>
                <td style={{ borderRight: "1px solid #e5e7eb", padding: "4px 8px" }}>
                  <input type="text"
                    style={{ width: "100%", border: "none", outline: "none", fontSize: 13, color: "#374151", background: "transparent" }}
                    value={row.item}
                    onChange={(e) => updateRow(row.id, "item", e.target.value)}
                  />
                </td>
                <td style={{ borderRight: "1px solid #e5e7eb", padding: "4px 8px" }}>
                  <input type="number"
                    style={{ width: "100%", border: "none", outline: "none", fontSize: 13, color: "#374151", background: "transparent", textAlign: "right" }}
                    value={row.qty}
                    onChange={(e) => updateRow(row.id, "qty", e.target.value)}
                  />
                </td>
                <td style={{ borderRight: "1px solid #e5e7eb", padding: "4px 8px" }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <select
                      style={{ flex: 1, border: "none", outline: "none", fontSize: 13, color: "#374151", background: "transparent", appearance: "none", cursor: "pointer" }}
                      value={row.unit}
                      onChange={(e) => updateRow(row.id, "unit", e.target.value)}
                    >
                      {unitOptions.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <span style={{ color: "#9ca3af", fontSize: 10, pointerEvents: "none" }}>▾</span>
                  </div>
                </td>
                <td style={{ borderRight: "1px solid #e5e7eb", padding: "4px 8px" }}>
                  <input type="number"
                    style={{ width: "100%", border: "none", outline: "none", fontSize: 13, color: "#374151", background: "transparent", textAlign: "right" }}
                    value={row.pricePerUnit}
                    onChange={(e) => updateRow(row.id, "pricePerUnit", e.target.value)}
                  />
                </td>
                <td style={{ borderRight: "1px solid #e5e7eb", padding: "4px 10px", textAlign: "right", fontSize: 13, color: "#374151" }}>
                  {amount > 0 ? fmt(amount) : ""}
                </td>
                <td />
              </tr>
            );
          })}
          <tr style={{ borderTop: "2px solid #e5e7eb", background: "#fafafa" }}>
            <td style={{ borderRight: "1px solid #e5e7eb" }} />
            <td style={{ padding: "8px 8px", borderRight: "1px solid #e5e7eb" }}>
              <button
                onClick={addRow}
                style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", border: "1px solid #93c5fd", borderRadius: 4, padding: "3px 10px", background: "#fff", cursor: "pointer", letterSpacing: "0.05em" }}
              >
                ADD ROW
              </button>
            </td>
            <td colSpan={2} style={{ padding: "8px 10px", fontSize: 12, fontWeight: 700, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
              <span style={{ float: "left" }}>TOTAL</span>
              <span style={{ float: "right" }}>{totalQty > 0 ? totalQty : 0}</span>
            </td>
            <td style={{ borderRight: "1px solid #e5e7eb" }} />
            <td style={{ padding: "8px 10px", textAlign: "right", fontSize: 13, fontWeight: 600, color: "#374151", borderRight: "1px solid #e5e7eb" }}>
              {totalAmount > 0 ? fmt(totalAmount) : "0"}
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    </div>
  );
}
