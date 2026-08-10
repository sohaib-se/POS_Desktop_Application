import { useState } from "react";
import type { ExpenseItem } from "./types";

interface AddItemModalProps {
  onClose: () => void;
  onSuccess: (createdItem: ExpenseItem) => void;
}

export function AddItemModal({ onClose, onSuccess }: AddItemModalProps) {
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [focusedField, setFocusedField] = useState<"name" | "price" | null>("name");

  const handleSave = async () => {
    const normalizedName = newItemName.trim();
    if (!normalizedName) return;
    try {
      const response = await fetch("/api/expense_items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: normalizedName, price: Number(newItemPrice) || 0 }),
      });
      if (!response.ok) throw new Error("Failed to save expense item");
      const createdItem = await response.json();
      
      onSuccess(createdItem);
      setNewItemName("");
      setNewItemPrice("");
      onClose();
    } catch (error) { 
      console.error(error); 
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)" }}>
      <div style={{ position: "absolute", inset: 0 }} onClick={onClose}></div>
      <div style={{ position: "relative", zIndex: 10, background: "#fff", borderRadius: 8, padding: 24, width: "100%", maxWidth: 400, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0 0 20px 0" }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1f2937", margin: 0 }}>Add Expense Item</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0 }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ position: "relative" }}>
            <label style={{ position: "absolute", top: -8, left: 10, background: "#fff", padding: "0 4px", color: focusedField === "name" ? "#007bff" : "#9ca3af", fontSize: 12, transition: "color 0.2s" }}>
              Item Name *
            </label>
            <input
              autoFocus
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onFocus={() => setFocusedField("name")}
              onBlur={() => setFocusedField(null)}
              style={{ width: "100%", border: focusedField === "name" ? "2px solid #007bff" : "1px solid #d1d5db", borderRadius: 6, padding: focusedField === "name" ? "9px 11px" : "10px 12px", fontSize: 14, color: "#1f2937", outline: "none", boxSizing: "border-box", transition: "border 0.2s, padding 0.2s" }}
            />
          </div>

          <div>
            <div style={{ fontSize: 14, color: "#007bff", borderBottom: "2px solid #007bff", width: "max-content", paddingBottom: 4, marginBottom: 12 }}>
              Pricing
            </div>
            <div style={{ position: "relative" }}>
              <input
                type="number"
                placeholder="Price"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                onFocus={() => setFocusedField("price")}
                onBlur={() => setFocusedField(null)}
                style={{ width: "100%", border: focusedField === "price" ? "2px solid #007bff" : "1px solid #d1d5db", borderRadius: 6, padding: focusedField === "price" ? "9px 11px" : "10px 12px", fontSize: 14, color: "#1f2937", outline: "none", boxSizing: "border-box", transition: "border 0.2s, padding 0.2s" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 4 }}>
            <button
              onClick={handleSave}
              style={{ padding: "8px 32px", border: "none", borderRadius: 4, background: "#007bff", color: "#fff", fontWeight: 500, cursor: "pointer" }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
