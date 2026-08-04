import { useState, useRef, useCallback } from "react";
import type React from "react";
import type { ExpenseTab, ExpenseRow, ExpenseItem } from "./types";

interface ExpenseTableProps {
  activeTab: ExpenseTab;
  expenseItemList: ExpenseItem[];
  setShowAddItemPopup: (show: boolean) => void;
  setActiveRowIdForNewItem: (id: number | null) => void;
  updateRow: (rowId: number, field: keyof ExpenseRow, value: string) => void;
  addRow: () => void;
  totalAmount: number;
}

function useColumnResize(initial: number[]) {
  const [widths, setWidths] = useState(initial);
  const resizing = useRef<{ col: number; startX: number; startW: number } | null>(null);

  const startResize = useCallback((col: number, e: React.MouseEvent) => {
    e.preventDefault();
    resizing.current = { col, startX: e.clientX, startW: widths[col] };

    const onMove = (ev: MouseEvent) => {
      if (!resizing.current) return;
      const delta = ev.clientX - resizing.current.startX;
      const newW = Math.max(70, resizing.current.startW + delta);
      setWidths((previousWidths) => {
        const nextWidths = [...previousWidths];
        nextWidths[resizing.current!.col] = newW;
        return nextWidths;
      });
    };

    const onUp = () => {
      resizing.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [widths]);

  return { widths, startResize };
}

export function ExpenseTable({
  activeTab,
  expenseItemList,
  setShowAddItemPopup,
  setActiveRowIdForNewItem,
  updateRow,
  addRow,
  totalAmount,
}: ExpenseTableProps) {
  const { widths, startResize } = useColumnResize([42, 220, 260, 150, 150]);

  const ResizeHandle = ({ col }: { col: number }) => (
    <div
      onMouseDown={(event) => startResize(col, event)}
      style={{
        position: "absolute",
        right: 0,
        top: 0,
        width: 6,
        height: "100%",
        cursor: "col-resize",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
      }}
    >
      <div style={{ width: 1, height: "60%", background: "#d1d5db" }} />
    </div>
  );

  return (
    <div style={{ background: "#fff", paddingBottom: 80 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: widths[0] }} />
          <col style={{ width: widths[1] }} />
          <col style={{ width: widths[2] }} />
          <col style={{ width: widths[3] }} />
          <col style={{ width: widths[4] }} />
          <col style={{ width: 36 }} />
        </colgroup>
        <thead>
          <tr style={{ background: "#f3f6f9", borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb" }}>
            <th style={{ position: "relative", padding: "8px 0", textAlign: "center", fontSize: 12, fontWeight: 600, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
              #<ResizeHandle col={0} />
            </th>
            <th style={{ position: "relative", padding: "8px 10px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
              ITEM<ResizeHandle col={1} />
            </th>
            <th style={{ position: "relative", padding: "8px 10px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
              QTY<ResizeHandle col={2} />
            </th>
            <th style={{ position: "relative", padding: "8px 10px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
              PRICE<ResizeHandle col={3} />
            </th>
            <th style={{ position: "relative", padding: "8px 10px", textAlign: "right", fontSize: 12, fontWeight: 600, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
              AMOUNT<ResizeHandle col={4} />
            </th>
            <th style={{ padding: "8px 6px", textAlign: "center", background: "#f3f6f9" }}>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "#3b82f6", padding: 0, display: "flex", alignItems: "center" }}>
                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {activeTab.rows.map((row, index) => {
            return (
              <tr
                key={row.id}
                style={{ borderBottom: "1px solid #f0f0f0" }}
                onMouseEnter={(event) => (event.currentTarget.style.background = "#f8fbff")}
                onMouseLeave={(event) => (event.currentTarget.style.background = "")}
              >
                <td style={{ textAlign: "center", color: "#9ca3af", fontSize: 13, padding: "5px 0", borderRight: "1px solid #e5e7eb" }}>
                  {index + 1}
                </td>
                <td style={{ borderRight: "1px solid #e5e7eb", padding: "4px 8px" }}>
                  <select
                    style={{ width: "100%", border: "none", outline: "none", fontSize: 13, color: "#374151", background: "transparent", appearance: "none", cursor: "pointer" }}
                    value={row.category || ""}
                    onChange={(event) => {
                      const val = event.target.value;
                      if (val === "ADD_NEW_ITEM") {
                        setActiveRowIdForNewItem(row.id);
                        setShowAddItemPopup(true);
                      } else {
                        const selectedItem = expenseItemList.find(i => i.name === val);
                        updateRow(row.id, "category", val);
                        if (selectedItem) {
                          updateRow(row.id, "paymentType", String(selectedItem.price));
                          const qty = Number(row.note) || 0;
                          updateRow(row.id, "amount", String(qty * selectedItem.price));
                        }
                      }
                    }}
                  >
                    <option value="" disabled hidden>Item</option>
                    <option value="ADD_NEW_ITEM" style={{ color: "#3b82f6", fontWeight: "bold" }}>+ Add Expense Item</option>
                    {expenseItemList.map(item => (
                      <option key={item.id} value={item.name}>{item.name}</option>
                    ))}
                  </select>
                </td>
                <td style={{ borderRight: "1px solid #e5e7eb", padding: "4px 8px" }}>
                  <input
                    type="number"
                    style={{ width: "100%", border: "none", outline: "none", fontSize: 13, color: "#374151", background: "transparent", textAlign: "right" }}
                    value={row.note}
                    onChange={(event) => updateRow(row.id, "note", event.target.value)}
                    placeholder="Qty"
                  />
                </td>
                <td style={{ borderRight: "1px solid #e5e7eb", padding: "4px 8px" }}>
                  <input
                    type="number"
                    style={{ width: "100%", border: "none", outline: "none", fontSize: 13, color: "#374151", background: "transparent", textAlign: "right" }}
                    value={row.paymentType}
                    onChange={(event) => updateRow(row.id, "paymentType", event.target.value)}
                    placeholder="Price"
                  />
                </td>
                <td style={{ borderRight: "1px solid #e5e7eb", padding: "4px 8px" }}>
                  <input
                    type="number"
                    style={{ width: "100%", border: "none", outline: "none", fontSize: 13, color: "#374151", background: "transparent", textAlign: "right" }}
                    value={row.amount}
                    onChange={(event) => updateRow(row.id, "amount", event.target.value)}
                  />
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
            </td>
            <td style={{ padding: "8px 10px", textAlign: "right", fontSize: 13, fontWeight: 600, color: "#374151", borderRight: "1px solid #e5e7eb" }}>
              {totalAmount > 0 ? totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0"}
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    </div>
  );
}
