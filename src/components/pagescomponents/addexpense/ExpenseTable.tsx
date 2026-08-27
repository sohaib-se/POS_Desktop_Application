import { useState, useRef, useCallback, useEffect } from "react";
import type { MouseEvent } from "react";
import type { ExpenseTab, ExpenseRow, ExpenseItem } from "./types";
import { Trash2, Plus } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface ItemSearchCellProps {
  row: ExpenseRow;
  items: ExpenseItem[];
  updateRow: (rowId: number, updates: Partial<ExpenseRow>) => void;
  handleItemSelect: (rowId: number, itemName: string) => void;
}

function ItemSearchCell({ row, items, updateRow, handleItemSelect }: ItemSearchCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(row.category || "");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(row.category || "");
  }, [row.category]);

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredItems = items.filter((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", height: "100%" }}>
      <input
        type="text"
        value={isOpen ? searchTerm : (row.category || "")}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          updateRow(row.id, { category: e.target.value });
          if (!isOpen) setIsOpen(true);
        }}
        onFocus={() => { setIsOpen(true); setSearchTerm(""); }}
        onClick={() => { setIsOpen(true); setSearchTerm(""); }}
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
            <div style={{ flex: 2 }}>EXPENSE ITEMS</div>
            <div style={{ flex: 1, textAlign: "right" }}>PRICE</div>
          </div>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                handleItemSelect(row.id, item.name);
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
              <div style={{ flex: 1, textAlign: "right", color: "#4b5563" }}>{item.price}</div>
            </div>
          ))}
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              handleItemSelect(row.id, "ADD_NEW_ITEM");
              setIsOpen(false);
            }}
            style={{
              padding: "12px 16px", borderBottom: "1px solid #e5e7eb", display: "flex",
              justifyContent: "space-between", alignItems: "center", cursor: "pointer"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500, color: "#3b82f6", fontSize: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: "50%", border: "1.5px solid #3b82f6" }}>
                <Plus size={12} strokeWidth={3} />
              </div>
              Add Expense Item
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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

function useColumnResize(initial: number[]) {
  const [widths, setWidths] = useState(initial);
  const resizing = useRef<{ col: number; startX: number; startW: number } | null>(null);

  const startResize = useCallback((col: number, e: MouseEvent) => {
    e.preventDefault();
    resizing.current = { col, startX: e.clientX, startW: widths[col] };

    const onMove = (ev: globalThis.MouseEvent) => {
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

interface ExpenseTableProps {
  activeTab: ExpenseTab;
  expenseItemList: ExpenseItem[];
  setShowAddItemPopup: (show: boolean) => void;
  setActiveRowIdForNewItem: (id: number | null) => void;
  updateRow: (rowId: number, updates: Partial<ExpenseRow>) => void;
  removeRow: (rowId: number) => void;
  addRow: () => void;
  totalAmount: number;
}

export function ExpenseTable({
  activeTab,
  expenseItemList,
  setShowAddItemPopup,
  setActiveRowIdForNewItem,
  updateRow,
  removeRow,
  addRow,
  totalAmount,
}: ExpenseTableProps) {
  const { widths, startResize } = useColumnResize([42, 340, 150, 150, 150]);
  const [rowToRemove, setRowToRemove] = useState<number | null>(null);

  const handleItemSelect = (rowId: number, itemName: string) => {
    if (itemName === "ADD_NEW_ITEM") {
      setActiveRowIdForNewItem(rowId);
      setShowAddItemPopup(true);
    } else {
      const selectedItem = expenseItemList.find(i => i.name === itemName);
      if (selectedItem) {
        const qty = 1;
        updateRow(rowId, {
          categoryId: selectedItem.id,
          category: selectedItem.name,
          paymentType: String(selectedItem.price),
          note: String(qty),
          amount: String(qty * selectedItem.price),
        });
      } else {
        updateRow(rowId, { category: itemName });
      }
    }
  };

  const handleRemove = (rowId: number) => {
    const row = activeTab.rows.find(r => r.id === rowId);
    if (row && (row.category !== "" || row.note !== "" || row.paymentType !== "")) {
      setRowToRemove(rowId);
    } else {
      removeRow(rowId);
    }
  };

  return (
    <div className="expense-table-container" style={{ background: "#fff", paddingBottom: 80 }}>
      <style>{`
        .expense-table-container tbody td input, 
        .expense-table-container tbody td select {
          outline: none !important;
          box-shadow: none !important;
          border: none !important;
          background: transparent;
          width: 100%;
        }
        .expense-table-container tbody td:focus-within {
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
        </colgroup>
        <thead>
          <tr style={{ background: "#f3f6f9", borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb" }}>
            <th style={{ position: "relative", padding: "8px 0", textAlign: "center", fontSize: 12, fontWeight: 600, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
              #<ResizeHandle col={0} startResize={startResize} />
            </th>
            <th style={{ position: "relative", padding: "8px 10px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
              EXPENSE ITEM<ResizeHandle col={1} startResize={startResize} />
            </th>
            <th style={{ position: "relative", padding: "8px 10px", textAlign: "right", fontSize: 12, fontWeight: 600, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
              QTY<ResizeHandle col={2} startResize={startResize} />
            </th>
            <th style={{ position: "relative", padding: "8px 10px", textAlign: "right", fontSize: 12, fontWeight: 600, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
              PRICE<ResizeHandle col={3} startResize={startResize} />
            </th>
            <th style={{ position: "relative", padding: "8px 10px", textAlign: "right", fontSize: 12, fontWeight: 600, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
              AMOUNT<ResizeHandle col={4} startResize={startResize} />
            </th>
          </tr>
        </thead>
        <tbody>
          {activeTab.rows.map((row) => {
            return (
              <tr
                key={row.id}
                style={{ borderBottom: "1px solid #f0f0f0" }}
                onMouseEnter={(event) => (event.currentTarget.style.background = "#f8fbff")}
                onMouseLeave={(event) => (event.currentTarget.style.background = "")}
              >
                <td style={{ textAlign: "center", color: "#9ca3af", fontSize: 13, padding: "5px 0", borderRight: "1px solid #e5e7eb" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                    <Trash2 
                      size={14} 
                      style={{ cursor: "pointer", color: "#9ca3af" }} 
                      onClick={() => handleRemove(row.id)} 
                      onMouseEnter={(e) => e.currentTarget.style.color = "#ef4444"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "#9ca3af"}
                    />
                  </div>
                </td>
                <td style={{ borderRight: "1px solid #e5e7eb", padding: "4px 8px" }}>
                  <ItemSearchCell row={row} items={expenseItemList} updateRow={updateRow} handleItemSelect={handleItemSelect} />
                </td>
                <td style={{ borderRight: "1px solid #e5e7eb", padding: "4px 8px" }}>
                  <input
                    type="number"
                    min="1"
                    style={{ width: "100%", border: "none", outline: "none", fontSize: 13, color: "#374151", background: "transparent", textAlign: "right" }}
                    value={row.note}
                    onChange={(event) => {
                      const newQty = event.target.value;
                      if (newQty === "" || parseFloat(newQty) > 0) {
                        const price = Number(row.paymentType) || 0;
                        updateRow(row.id, { note: newQty, amount: String((Number(newQty) || 0) * price) });
                      }
                    }}
                    placeholder="Qty"
                  />
                </td>
                <td style={{ borderRight: "1px solid #e5e7eb", padding: "4px 8px" }}>
                  <input
                    type="number"
                    min="1"
                    style={{ width: "100%", border: "none", outline: "none", fontSize: 13, color: "#374151", background: "transparent", textAlign: "right" }}
                    value={row.paymentType}
                    onChange={(event) => {
                      const newPrice = event.target.value;
                      if (newPrice === "" || parseFloat(newPrice) > 0) {
                        const qty = Number(row.note) || 0;
                        updateRow(row.id, { paymentType: newPrice, amount: String(qty * (Number(newPrice) || 0)) });
                      }
                    }}
                    placeholder="Price"
                  />
                </td>
                <td style={{ borderRight: "1px solid #e5e7eb", padding: "4px 8px" }}>
                  <input
                    type="number"
                    style={{ width: "100%", border: "none", outline: "none", fontSize: 13, color: "#374151", background: "transparent", textAlign: "right" }}
                    value={row.amount}
                    onChange={(event) => {
                      const val = event.target.value;
                      if (val === "" || parseFloat(val) > 0) {
                        const newAmt = parseFloat(val) || 0;
                        const q = parseFloat(row.note) || 1;
                        if (newAmt > 0) {
                          updateRow(row.id, { amount: val, paymentType: String((newAmt / q).toFixed(2)) });
                        } else {
                          updateRow(row.id, { amount: val, paymentType: "" });
                        }
                      } else {
                        updateRow(row.id, { amount: val });
                      }
                    }}
                  />
                </td>
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
          </tr>
        </tbody>
      </table>

      <ConfirmDialog
        open={rowToRemove !== null}
        title="Delete Expense Item"
        message="Are you sure you want to delete this expense item? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => {
          if (rowToRemove !== null) {
            removeRow(rowToRemove);
            setRowToRemove(null);
          }
        }}
        onCancel={() => setRowToRemove(null)}
      />
    </div>
  );
}
