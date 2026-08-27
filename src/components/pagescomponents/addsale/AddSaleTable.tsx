import { useState, useRef, useEffect } from "react";
import type { SaleTab, SaleRow, ItemOption } from "@/pages/AddSale";
import { Trash2 } from "lucide-react";

// ── Item Search Cell (same as EstimateTable) ────────────────────────────────
interface ItemSearchCellProps {
  row: SaleRow;
  items: ItemOption[];
  updateRowItem: (rowId: number, itemId: string) => void;
  updateRow: (rowId: number, field: keyof SaleRow, value: string) => void;
}

function ItemSearchCell({ row, items, updateRowItem, updateRow }: ItemSearchCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(row.item);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(row.item);
  }, [row.item]);

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredItems = items
    .filter((i) => i.status !== "inactive" || i.id === row.itemId)
    .filter((i) =>
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.code && i.code.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", height: "100%" }}>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          updateRow(row.id, "item", e.target.value);
          if (!isOpen) setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        style={{
          width: "100%", height: "100%", minHeight: 28,
          border: "none", boxShadow: "none",
          outline: "none", fontSize: 13, color: "#374151",
          background: "transparent", padding: "0 4px",
          borderRadius: 4
        }}
        placeholder="Select Item"
      />
      {isOpen && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0,
          background: "#fff", border: "1px solid #e5e7eb",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
          zIndex: 50, maxHeight: 250, overflowY: "auto",
          minWidth: 400,
          marginTop: 8,
          borderRadius: 4
        }}>
          <div style={{ display: "flex", padding: "8px 12px", borderBottom: "1px solid #e5e7eb", fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>
            <div style={{ flex: 2 }}>ITEM</div>
            <div style={{ flex: 1, textAlign: "right" }}>SALE PRICE</div>
            <div style={{ flex: 1, textAlign: "right" }}>PURCHASE PRICE</div>
            <div style={{ flex: 1, textAlign: "right" }}>STOCK</div>
          </div>
          {filteredItems.map((item) => {
            const salePrice = item.sale_price ?? 0;
            const stock = item.stock_quantity ?? 0;
            return (
              <div
                key={item.id}
                onClick={() => {
                  updateRowItem(row.id, item.id);
                  setIsOpen(false);
                }}
                style={{
                  display: "flex", padding: "8px 12px", fontSize: 13,
                  cursor: "pointer", borderBottom: "1px solid #f3f4f6"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <div style={{ flex: 2, color: "#374151" }}>{item.name}</div>
                <div style={{ flex: 1, textAlign: "right", color: "#4b5563" }}>{salePrice}</div>
                <div style={{ flex: 1, textAlign: "right", color: "#4b5563" }}>—</div>
                <div style={{ flex: 1, textAlign: "right", color: stock < 0 ? "#ef4444" : "#4b5563" }}>{stock}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Unit Dropdown (same as EstimateTable) ───────────────────────────────────
function UnitDropdown({ value, options, onChange, disabled }: { value: string; options: string[]; onChange: (v: string) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: globalThis.MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (disabled) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, color: "#9ca3af", height: "100%", userSelect: "none" }}>
        <span>{value}</span>
        <span style={{ color: "#9ca3af", fontSize: 10 }}>▾</span>
      </div>
    );
  }

  return (
    <div ref={ref} style={{ position: "relative", width: "100%", height: "100%" }}>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", fontSize: 13, color: "#374151", height: "100%", userSelect: "none" }}
      >
        <span>{value}</span>
        <span style={{ color: "#9ca3af", fontSize: 10 }}>▾</span>
      </div>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0,
          background: "#fff", border: "1px solid #e5e7eb",
          borderRadius: 4, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
          zIndex: 100, minWidth: 100, overflow: "hidden"
        }}>
          {options.map((u) => (
            <div
              key={u}
              onMouseDown={(e) => { e.preventDefault(); onChange(u); setOpen(false); }}
              style={{ padding: "8px 12px", fontSize: 13, color: u === value ? "#3b82f6" : "#374151", cursor: "pointer", fontWeight: u === value ? 600 : 400 }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              {u}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Resize Handle ────────────────────────────────────────────────────────────
const ResizeHandle = ({ col, startResize }: { col: number; startResize: (col: number, e: React.MouseEvent) => void }) => (
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

// ── Main Table ───────────────────────────────────────────────────────────────
interface AddSaleTableProps {
  activeTab: SaleTab;
  items: ItemOption[];
  updateRowItem: (rowId: number, itemId: string) => void;
  updateRow: (rowId: number, field: keyof SaleRow, value: string) => void;
  removeRow: (rowId: number) => void;
  addRow: () => void;
  widths: number[];
  startResize: (col: number, e: React.MouseEvent) => void;
  totalQty: number;
  totalAmount: number;
  onBarcodeClick?: () => void;
}

export function AddSaleTable({
  activeTab,
  items,
  updateRowItem,
  updateRow,
  removeRow,
  addRow,
  widths,
  startResize,
  totalQty,
  totalAmount,
  onBarcodeClick,
}: AddSaleTableProps) {
  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="sale-table-container" style={{ background: "#fff", paddingBottom: 80 }}>
      <style>{`
        .sale-table-container tbody td input,
        .sale-table-container tbody td select {
          outline: none !important;
          box-shadow: none !important;
          border: none !important;
          background: transparent;
          width: 100%;
        }
        .sale-table-container tbody td:focus-within {
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
            {/* # / Barcode column */}
            <th style={{ position: "relative", padding: onBarcodeClick ? "5px 6px" : "8px 0", textAlign: "center", fontSize: 12, fontWeight: 600, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
              {onBarcodeClick ? (
                <div
                  onClick={onBarcodeClick}
                  style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    border: "2px solid #374151", borderRadius: 5,
                    padding: "3px 4px", background: "#fff", cursor: "pointer",
                  }}
                  title="Barcode Scanner"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 5.5V4a1 1 0 011-1h2" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 18.5V20a1 1 0 001 1h2" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 5.5V4a1 1 0 00-1-1h-2" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 18.5V20a1 1 0 01-1 1h-2" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="6" y1="7" x2="6" y2="17" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="8.5" y1="7" x2="8.5" y2="17" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"/>
                    <line x1="11" y1="7" x2="11" y2="17" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="13" y1="7" x2="13" y2="17" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"/>
                    <line x1="15.5" y1="7" x2="15.5" y2="17" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="18" y1="7" x2="18" y2="17" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
              ) : (
                <span>#</span>
              )}
              <ResizeHandle col={0} startResize={startResize} />
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
          </tr>
        </thead>
        <tbody>
          {activeTab.rows.map((row) => {
            const amount = (parseFloat(row.qty) || 0) * (parseFloat(row.pricePerUnit) || 0);

            // Build unit options for this row's matched item
            const matchedItem = items.find((item) => item.id === row.itemId);
            let currentUnitOptions = ["NONE"];
            if (matchedItem) {
              currentUnitOptions = [];
              if (matchedItem.primary_unit) currentUnitOptions.push(matchedItem.primary_unit);
              else if (matchedItem.unit && matchedItem.unit !== "NONE") currentUnitOptions.push(matchedItem.unit);
              if (matchedItem.secondary_unit) currentUnitOptions.push(matchedItem.secondary_unit);
              if (currentUnitOptions.length === 0) currentUnitOptions = ["NONE"];
            }

            return (
              <tr
                key={row.id}
                style={{ borderBottom: "1px solid #f0f0f0" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fbff")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
              >
                {/* # — Trash icon (only visible on rows with data) */}
                <td style={{ textAlign: "center", color: "#9ca3af", fontSize: 13, padding: "5px 0", borderRight: "1px solid #e5e7eb" }}>
                  {(row.itemId || row.item || row.qty || row.pricePerUnit) && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                      <Trash2
                        size={14}
                        style={{ cursor: "pointer", color: "#9ca3af" }}
                        onClick={() => removeRow(row.id)}
                        onMouseEnter={(e) => e.currentTarget.style.color = "#ef4444"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "#9ca3af"}
                      />
                    </div>
                  )}
                </td>
                {/* ITEM */}
                <td style={{ borderRight: "1px solid #e5e7eb", padding: "4px 8px" }}>
                  <ItemSearchCell
                    row={row}
                    items={items}
                    updateRowItem={updateRowItem}
                    updateRow={updateRow}
                  />
                </td>
                {/* QTY */}
                <td style={{ borderRight: "1px solid #e5e7eb", padding: "4px 8px" }}>
                  <input
                    type="number"
                    min="0"
                    style={{ width: "100%", border: "none", outline: "none", fontSize: 13, color: "#374151", background: "transparent", textAlign: "right" }}
                    value={row.qty}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || parseFloat(val) >= 0) {
                        updateRow(row.id, "qty", val);
                      }
                    }}
                  />
                </td>
                {/* UNIT */}
                <td style={{ borderRight: "1px solid #e5e7eb", padding: "4px 8px" }}>
                  <UnitDropdown
                    value={row.unit}
                    options={currentUnitOptions}
                    onChange={(v) => updateRow(row.id, "unit", v)}
                    disabled={!row.itemId}
                  />
                </td>
                {/* PRICE/UNIT */}
                <td style={{ borderRight: "1px solid #e5e7eb", padding: "4px 8px" }}>
                  <input
                    type="number"
                    min="0"
                    style={{ width: "100%", border: "none", outline: "none", fontSize: 13, color: "#374151", background: "transparent", textAlign: "right" }}
                    value={row.pricePerUnit}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || parseFloat(val) >= 0) {
                        updateRow(row.id, "pricePerUnit", val);
                      }
                    }}
                  />
                </td>
                {/* AMOUNT */}
                <td style={{ borderRight: "1px solid #e5e7eb", padding: "4px 8px" }}>
                  <input
                    type="number"
                    min="0"
                    style={{ width: "100%", border: "none", outline: "none", fontSize: 13, color: "#374151", background: "transparent", textAlign: "right" }}
                    value={amount > 0 ? parseFloat(amount.toFixed(2)) : ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || parseFloat(val) >= 0) {
                        const newAmt = parseFloat(val) || 0;
                        const q = parseFloat(row.qty) || 1;
                        if (newAmt > 0) {
                          updateRow(row.id, "pricePerUnit", String((newAmt / q).toFixed(2)));
                        } else {
                          updateRow(row.id, "pricePerUnit", "");
                        }
                      }
                    }}
                  />
                </td>
              </tr>
            );
          })}

          {/* TOTAL ROW */}
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
