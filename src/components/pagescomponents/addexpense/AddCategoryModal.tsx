import { useState } from "react";
import type { ExpenseCategory } from "@/types";

interface AddCategoryModalProps {
  onClose: () => void;
  onSuccess: (createdCategory: ExpenseCategory) => void;
}

export function AddCategoryModal({ onClose, onSuccess }: AddCategoryModalProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState("Indirect Expense");
  const [focusedField, setFocusedField] = useState<"name" | "type" | null>("name");

  const handleSave = async () => {
    const normalizedName = newCategoryName.trim();
    if (!normalizedName) return;
    try {
      const response = await fetch("/api/expense_categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: normalizedName, type: newCategoryType, amount: 0 }),
      });
      if (!response.ok) throw new Error("Failed to save expense category");
      const createdCategory = (await response.json()) as ExpenseCategory;
      
      onSuccess(createdCategory);
      setNewCategoryName("");
      setNewCategoryType("Indirect Expense");
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
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1f2937", margin: 0 }}>Add Expense Category</h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0 }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ position: "relative" }}>
            <label style={{ position: "absolute", top: -8, left: 10, background: "#fff", padding: "0 4px", color: focusedField === "name" ? "#007bff" : "#9ca3af", fontSize: 12, transition: "color 0.2s" }}>
              Expense Category
            </label>
            <input
              autoFocus
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onFocus={() => setFocusedField("name")}
              onBlur={() => setFocusedField(null)}
              style={{ width: "100%", border: focusedField === "name" ? "2px solid #007bff" : "1px solid #d1d5db", borderRadius: 6, padding: focusedField === "name" ? "9px 11px" : "10px 12px", fontSize: 14, color: "#1f2937", outline: "none", boxSizing: "border-box", transition: "border 0.2s, padding 0.2s" }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <label style={{ position: "absolute", top: -8, left: 10, background: "#fff", padding: "0 4px", color: focusedField === "type" ? "#007bff" : "#9ca3af", fontSize: 12, transition: "color 0.2s" }}>
              Expense Type
            </label>
            <select
              value={newCategoryType}
              onChange={(e) => setNewCategoryType(e.target.value)}
              onFocus={() => setFocusedField("type")}
              onBlur={() => setFocusedField(null)}
              style={{ width: "100%", appearance: "none", border: focusedField === "type" ? "2px solid #007bff" : "1px solid #d1d5db", borderRadius: 6, padding: focusedField === "type" ? "9px 11px" : "10px 12px", fontSize: 14, color: "#1f2937", outline: "none", cursor: "pointer", boxSizing: "border-box", transition: "border 0.2s, padding 0.2s" }}
            >
              <option value="Direct Expense">Direct Expense</option>
              <option value="Indirect Expense">Indirect Expense</option>
            </select>
            <span style={{ position: "absolute", right: 12, top: "50%", transform: focusedField === "type" ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)", transition: "transform 0.2s", pointerEvents: "none", color: focusedField === "type" ? "#007bff" : "#6b7280", display: "flex", alignItems: "center" }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 4 }}>
            <button
              onClick={onClose}
              style={{ padding: "8px 24px", border: "1px solid #d1d5db", borderRadius: 4, background: "#fff", color: "#007bff", fontWeight: 500, cursor: "pointer" }}
            >
              Cancel
            </button>
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
