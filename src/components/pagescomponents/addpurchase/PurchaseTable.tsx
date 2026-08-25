import React, { useState, useRef, useEffect } from "react";
import { Trash2 } from "lucide-react";
import type { PurchaseTab, ItemOption, PurchaseRow } from "./types";
import { unitOptions } from "./constants";

interface PurchaseTableProps {
  activeTab: PurchaseTab;
  widths: number[];
  startResize: (col: number, e: React.MouseEvent) => void;
  updateRowItem: (rowId: number, itemId: string) => void;
  items: ItemOption[];
  updateRow: (rowId: number, field: keyof PurchaseRow, value: string) => void;
  addRow: () => void;
  removeRow: (rowId: number) => void;
  totalQty: number;
  totalAmount: number;
  fmt: (n: number) => string;
}

// Searchable item cell (replaces plain <select>)
function ItemCell({
  row,
  items,
  updateRowItem,
}: {
  row: PurchaseRow;
  items: ItemOption[];
  updateRowItem: (rowId: number, itemId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedItem = items.find(i => i.id === row.itemId);
  const filteredItems = items.filter(i =>
    (i.status !== "inactive" || i.id === row.itemId) &&
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <input
        type="text"
        value={open ? search : (selectedItem ? selectedItem.name : row.item)}
        onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
        onFocus={() => { setSearch(selectedItem ? selectedItem.name : row.item); }}
        onClick={() => { setOpen(true); setSearch(selectedItem ? selectedItem.name : row.item); }}
        placeholder="Search item..."
        className="focus:ring-0 focus:outline-none"
        style={{ width: "100%", border: "none", outline: "none", boxShadow: "none", fontSize: 13, color: "#374151", background: "transparent" }}
      />
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: -8, width: 290,
          background: "#fff", border: "1px solid #e5e7eb", borderRadius: 4,
          marginTop: 2, boxShadow: "0 4px 12px -2px rgba(0,0,0,0.12)",
          zIndex: 50, maxHeight: 260, overflowY: "auto",
        }}>
          {filteredItems.length === 0 ? (
            <div style={{ padding: "12px 16px", fontSize: 13, color: "#9ca3af" }}>No items found</div>
          ) : filteredItems.map(item => (
            <div
              key={item.id}
              onPointerDown={(e) => {
                e.preventDefault();
                updateRowItem(row.id, item.id);
                setSearch("");
                setOpen(false);
              }}
              style={{ padding: "9px 16px", cursor: "pointer", borderBottom: "1px solid #f3f4f6" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ fontSize: 13, fontWeight: 500, color: "#1f2937" }}>{item.name}</div>
              {item.purchase_price !== undefined && (
                <div style={{ fontSize: 11, color: "#9ca3af" }}>
                  Purchase price: ₹{item.purchase_price}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PurchaseTable({
  activeTab,
  widths,
  startResize,
  updateRowItem,
  items,
  updateRow,
  addRow,
  removeRow,
  totalQty,
  totalAmount,
  fmt,
}: PurchaseTableProps) {
  const ResizeHandle = ({ col }: { col: number }) => (
    <div
      onMouseDown={(e) => startResize(col, e)}
      style={{
        position: "absolute", right: 0, top: 0,
        width: 6, height: "100%", cursor: "col-resize",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10,
      }}
    >
      <div style={{ width: 1, height: "60%", background: "#d1d5db" }} />
    </div>
  );

  const cellStyle: React.CSSProperties = {
    borderRight: "1px solid #e5e7eb",
    borderBottom: "1px solid #e5e7eb",
  };

  const focusCell: React.CSSProperties = {
    outline: "none",
    position: "relative",
  };

  return (
    <div className="purchase-table-container" style={{ background: "#fff", paddingBottom: 80 }}>
      <style>{`
        .purchase-table-container tbody td input, 
        .purchase-table-container tbody td select {
          outline: none !important;
          box-shadow: none !important;
          border: none !important;
          background: transparent;
          width: 100%;
        }
        .purchase-table-container tbody td:focus-within {
          outline: 2px solid #3b82f6;
          outline-offset: -2px;
        }
      `}</style>
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: widths[0] }} />
          <col style={{ width: widths[1] }} />
          <col style={{ width: widths[2] }} />
          <col style={{ width: widths[3] }} />
          <col style={{ width: widths[4] }} />
          <col style={{ width: widths[5] }} />
        </colgroup>
        <thead>
          <tr style={{ background: "#f3f6f9", borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb" }}>
            <th style={{ position: "relative", padding: "8px 0", textAlign: "center", fontSize: 12, fontWeight: 600, color: "#6b7280", ...cellStyle, letterSpacing: "0.04em" }}>
              #<ResizeHandle col={0} />
            </th>
            <th style={{ position: "relative", padding: "8px 10px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", ...cellStyle, letterSpacing: "0.04em" }}>
              ITEM<ResizeHandle col={1} />
            </th>
            <th style={{ position: "relative", padding: "8px 10px", textAlign: "right", fontSize: 12, fontWeight: 600, color: "#6b7280", ...cellStyle, letterSpacing: "0.04em" }}>
              QTY<ResizeHandle col={2} />
            </th>
            <th style={{ position: "relative", padding: "8px 10px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", ...cellStyle, letterSpacing: "0.04em" }}>
              UNIT<ResizeHandle col={3} />
            </th>
            <th style={{ position: "relative", padding: "8px 10px", textAlign: "right", fontSize: 12, fontWeight: 600, color: "#6b7280", ...cellStyle, letterSpacing: "0.04em" }}>
              PRICE/UNIT<ResizeHandle col={4} />
            </th>
            <th style={{ position: "relative", padding: "8px 10px", textAlign: "right", fontSize: 12, fontWeight: 600, color: "#6b7280", ...cellStyle, letterSpacing: "0.04em" }}>
              AMOUNT<ResizeHandle col={5} />
            </th>
          </tr>
        </thead>
        <tbody>
          {activeTab.rows.map((row, idx) => {
            const amount = (parseFloat(row.qty) || 0) * (parseFloat(row.pricePerUnit) || 0);
            return (
              <tr
                key={row.id}
                style={{ borderBottom: "1px solid #f0f0f0" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fbff")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
              >
                {/* # */}
                <td className="group" style={{ textAlign: "center", color: "#9ca3af", fontSize: 13, padding: "5px 0", ...cellStyle, position: "relative" }}>
                  <div className="group-hover:hidden flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <div className="hidden group-hover:flex items-center justify-center">
                    <Trash2 
                      size={14} 
                      style={{ cursor: "pointer", color: "#9ca3af" }} 
                      onClick={() => removeRow(row.id)} 
                      onMouseEnter={(e) => e.currentTarget.style.color = "#ef4444"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "#9ca3af"}
                    />
                  </div>
                </td>

                {/* ITEM — searchable typeahead */}
                <td style={{ ...cellStyle, padding: "4px 8px" }}>
                  <ItemCell row={row} items={items} updateRowItem={updateRowItem} />
                </td>

                {/* QTY */}
                <td style={{ ...cellStyle, padding: "4px 8px" }}>
                  <input
                    type="number"
                    min="1"
                    onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === '0') { if (e.key === '0' && e.currentTarget.value.length > 0) return; e.preventDefault(); } }}
                    style={{ width: "100%", ...focusCell, fontSize: 13, color: "#374151", background: "transparent", textAlign: "right", border: "none", outline: "none", boxShadow: "none" }}
                    value={row.qty}
                    onChange={(e) => updateRow(row.id, "qty", e.target.value)}
                    onBlur={(e) => {
                      if (!e.target.value || Number(e.target.value) <= 0) {
                        updateRow(row.id, "qty", "1");
                      }
                    }}
                  />
                </td>

                {/* UNIT */}
                <td style={{ ...cellStyle, padding: "4px 8px" }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <select
                      style={{ flex: 1, border: "none", outline: "none", boxShadow: "none", fontSize: 13, color: "#374151", background: "transparent", appearance: "none", cursor: "pointer" }}
                      value={row.unit}
                      onChange={(e) => updateRow(row.id, "unit", e.target.value)}
                    >
                      {(() => {
                        const item = items.find(i => i.id === row.itemId);
                        if (!item) return unitOptions.map(u => <option key={u} value={u}>{u}</option>);
                        const options = [];
                        if (item.primary_unit) options.push(<option key={item.primary_unit} value={item.primary_unit}>{item.primary_unit}</option>);
                        if (item.secondary_unit) options.push(<option key={item.secondary_unit} value={item.secondary_unit}>{item.secondary_unit}</option>);
                        if (options.length === 0 && item.unit) options.push(<option key={item.unit} value={item.unit}>{item.unit}</option>);
                        if (options.length === 0) return unitOptions.map(u => <option key={u} value={u}>{u}</option>);
                        return options;
                      })()}
                    </select>
                    <span style={{ color: "#9ca3af", fontSize: 10, pointerEvents: "none" }}>▾</span>
                  </div>
                </td>

                {/* PRICE/UNIT */}
                <td style={{ ...cellStyle, padding: "4px 8px" }}>
                  <input
                    type="number"
                    min="1"
                    onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                    style={{ width: "100%", ...focusCell, fontSize: 13, color: "#374151", background: "transparent", textAlign: "right", border: "none", outline: "none", boxShadow: "none" }}
                    value={row.pricePerUnit}
                    onChange={(e) => updateRow(row.id, "pricePerUnit", e.target.value)}
                    onBlur={(e) => {
                      if (!e.target.value || Number(e.target.value) <= 0) {
                        updateRow(row.id, "pricePerUnit", "1");
                      }
                    }}
                  />
                </td>

                {/* AMOUNT */}
                <td style={{ ...cellStyle, padding: "4px 10px", textAlign: "right", fontSize: 13, color: "#374151" }}>
                  {amount > 0 ? fmt(amount) : ""}
                </td>
              </tr>
            );
          })}

          {/* Footer row */}
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
          </tr>
        </tbody>
      </table>
    </div>
  );
}
