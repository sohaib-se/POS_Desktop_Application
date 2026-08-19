import { useState, useRef, useEffect } from "react";
import type { ItemOption, SaleRow } from "@/pages/AddSale";

interface ScannedEntry {
  tempId: number;
  itemId: string;
  itemName: string;
  itemCode: string;
  qty: number;
}

interface BarcodeScanModalProps {
  items: ItemOption[];
  onSave: (rows: Omit<SaleRow, "id">[]) => void;
  onClose: () => void;
}

let tempIdCounter = 1;

export function BarcodeScanModal({ items, onSave, onClose }: BarcodeScanModalProps) {
  const [inputVal, setInputVal] = useState("");
  const [entries, setEntries] = useState<ScannedEntry[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus input when modal opens
    inputRef.current?.focus();
  }, []);

  const handleAdd = () => {
    const query = inputVal.trim();
    if (!query) return;

    // Match by item code (code field) or item name
    const matched = items.find(
      (item) =>
        (item.code && item.code.toLowerCase() === query.toLowerCase()) ||
        item.name.toLowerCase() === query.toLowerCase() ||
        String(item.id) === query
    );

    if (!matched) {
      setErrorMsg(`No item found for "${query}"`);
      setTimeout(() => setErrorMsg(""), 3000);
      setInputVal("");
      return;
    }

    setErrorMsg("");

    // If item already in list, increment qty
    const existing = entries.find((e) => e.itemId === matched.id);
    if (existing) {
      setEntries((prev) =>
        prev.map((e) =>
          e.itemId === matched.id ? { ...e, qty: e.qty + 1 } : e
        )
      );
    } else {
      setEntries((prev) => [
        ...prev,
        {
          tempId: tempIdCounter++,
          itemId: matched.id,
          itemName: matched.name,
          itemCode: matched.code ?? String(matched.id),
          qty: 1,
        },
      ]);
    }

    setInputVal("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  const updateQty = (tempId: number, val: string) => {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      setEntries((prev) => prev.map((e) => (e.tempId === tempId ? { ...e, qty: num } : e)));
    }
  };

  const removeEntry = (tempId: number) => {
    setEntries((prev) => prev.filter((e) => e.tempId !== tempId));
  };

  const handleSave = () => {
    if (entries.length === 0) {
      onClose();
      return;
    }

    const rows: Omit<SaleRow, "id">[] = entries.map((entry) => {
      const matchedItem = items.find((i) => i.id === entry.itemId);
      const unit = matchedItem?.primary_unit || matchedItem?.unit || "NONE";
      const price = matchedItem?.sale_price ? String(matchedItem.sale_price) : "";
      return {
        itemId: entry.itemId,
        item: entry.itemName,
        qty: String(entry.qty),
        unit,
        pricePerUnit: price,
      };
    });

    onSave(rows);
  };

  return (
    // Backdrop
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal */}
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          width: 420,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px 12px 20px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
            Scan code/serial
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6b7280",
              fontSize: 20,
              lineHeight: 1,
              padding: "2px 4px",
              borderRadius: 4,
            }}
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "16px 20px", flex: 1 }}>
          {/* Input row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <label style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
              Enter code/serial:
            </label>
            <span style={{ fontSize: 12, color: "#6b7280" }}>
              {entries.length} Entered
            </span>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter/Scan"
              style={{
                flex: 1,
                border: "1.5px solid #d1d5db",
                borderRadius: 6,
                padding: "8px 12px",
                fontSize: 13,
                color: "#111827",
                outline: "none",
                background: "#f9fafb",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
            />
            <button
              onClick={handleAdd}
              style={{
                background: "#3b82f6",
                border: "none",
                borderRadius: 6,
                padding: "8px 16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                flexShrink: 0,
              }}
              title="Add item"
            >
              {/* Checkmark icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
          </div>

          {/* Error message */}
          {errorMsg && (
            <div style={{ fontSize: 12, color: "#ef4444", marginBottom: 10, padding: "6px 10px", background: "#fef2f2", borderRadius: 5, border: "1px solid #fecaca" }}>
              {errorMsg}
            </div>
          )}

          {/* Scanned entries */}
          <div style={{ maxHeight: 260, overflowY: "auto" }}>
            {entries.length === 0 && (
              <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "24px 0" }}>
                No items scanned yet. Enter a code or item name above.
              </p>
            )}
            {entries.map((entry) => (
              <div
                key={entry.tempId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                {/* Item info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#111827", lineHeight: 1.3 }}>
                    {entry.itemName}
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                    {entry.itemCode}
                  </div>
                </div>

                {/* Quantity field */}
                <div
                  style={{
                    position: "relative",
                    borderRadius: 5,
                    border: "1px solid #d1d5db",
                    padding: "4px 8px",
                    width: 80,
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: -7,
                      left: 6,
                      background: "#fff",
                      fontSize: 10,
                      color: "#6b7280",
                      padding: "0 2px",
                    }}
                  >
                    Quantity
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={entry.qty}
                    onChange={(e) => updateQty(entry.tempId, e.target.value)}
                    style={{
                      width: "100%",
                      border: "none",
                      outline: "none",
                      fontSize: 13,
                      color: "#374151",
                      background: "transparent",
                    }}
                  />
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeEntry(entry.tempId)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#9ca3af",
                    flexShrink: 0,
                    padding: 2,
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                  }}
                  title="Remove"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            padding: "14px 20px",
            borderTop: "1px solid #e5e7eb",
            background: "#f9fafb",
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "#fff",
              border: "1.5px solid #d1d5db",
              borderRadius: 6,
              padding: "8px 24px",
              fontSize: 14,
              fontWeight: 500,
              color: "#374151",
              cursor: "pointer",
            }}
          >
            Close
          </button>
          <button
            onClick={handleSave}
            disabled={entries.length === 0}
            style={{
              background: entries.length > 0 ? "#3b82f6" : "#93c5fd",
              border: "none",
              borderRadius: 6,
              padding: "8px 28px",
              fontSize: 14,
              fontWeight: 500,
              color: "#fff",
              cursor: entries.length > 0 ? "pointer" : "not-allowed",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
