import { useState } from "react";
import type { ExpenseItem } from "./types";

interface AddItemModalProps {
  onClose: () => void;
  onSuccess: (createdItem: ExpenseItem) => void;
}

export function AddItemModal({ onClose, onSuccess }: AddItemModalProps) {
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");

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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1f2937", margin: 0 }}>Add Expense Item</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0 }}>✕</button>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ position: "relative" }}>
            <label style={{ position: "absolute", top: -8, left: 10, background: "#fff", padding: "0 4px", color: "#3b82f6", fontSize: 12 }}>Item Name *</label>
            <input
              autoFocus
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              style={{ width: "100%", border: "2px solid #3b82f6", borderRadius: 6, padding: "10px 12px", fontSize: 14, color: "#1f2937", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ fontSize: 14, color: "#3b82f6", borderBottom: "2px solid #3b82f6", width: "max-content", paddingBottom: 4 }}>Pricing</div>
          <div style={{ position: "relative" }}>
            <input
              type="number"
              placeholder="Price"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
              style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 6, padding: "10px 12px", fontSize: 14, color: "#1f2937", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
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
