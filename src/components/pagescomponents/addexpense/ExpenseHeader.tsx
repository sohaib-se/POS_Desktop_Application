import type { ExpenseTab } from "./types";
import type { ExpenseCategory } from "@/types";

interface ExpenseHeaderProps {
  activeTab: ExpenseTab;
  expenseCategoryList: ExpenseCategory[];
  setActiveTabCategory: (categoryId: string) => void;
  setShowAddCategoryPopup: (show: boolean) => void;
  displayedExpenseNo: string;
  displayedExpenseDate: string;
  updateTab: (partial: Partial<ExpenseTab>) => void;
}

export function ExpenseHeader({
  activeTab,
  expenseCategoryList,
  setActiveTabCategory,
  setShowAddCategoryPopup,
  displayedExpenseNo,
  displayedExpenseDate,
  updateTab,
}: ExpenseHeaderProps) {
  return (
    <div style={{ background: "#fff", padding: "25px 20px 40px 20px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div style={{ position: "relative" }}>
          <label style={{ position: "absolute", top: -11, left: 10, background: "#fff", padding: "0 4px", color: "#94a3b8", fontSize: 12 }}>
            Expense Category<span style={{ color: "#ef4444" }}>*</span>
          </label>
          <select
            style={{ appearance: "none", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13, color: "#374151", background: "#fff", padding: "7px 32px 7px 12px", minWidth: 225, cursor: "pointer", textTransform: "lowercase" }}
            value={activeTab.expenseCategoryId}
            onChange={(event) => {
              if (event.target.value === "ADD_NEW_CATEGORY") {
                setShowAddCategoryPopup(true);
              } else {
                setActiveTabCategory(event.target.value);
              }
            }}
          >
            <option value="ADD_NEW_CATEGORY" style={{ color: "#3b82f6", fontWeight: "bold" }}>+ Add Expense Category</option>
            {expenseCategoryList.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#0f172a" }}>
            ▾
          </span>
        </div>

        <div style={{ fontSize: 13, textAlign: "right", flexShrink: 0, minWidth: 280 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, marginBottom: 12 }}>
            <span style={{ color: "#94a3b8", width: 88, textAlign: "right" }}>Expense No</span>
            <input
              type="text"
              readOnly
              value={displayedExpenseNo}
              style={{ border: "none", borderBottom: "1px solid #d1d5db", outline: "none", background: "transparent", width: 170, textAlign: "center", color: "#1f2937", paddingBottom: 4 }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
            <span style={{ color: "#94a3b8", width: 88, textAlign: "right" }}>Date</span>
            <input
              type="text"
              value={displayedExpenseDate}
              onChange={(event) => updateTab({ expenseDate: event.target.value })}
              style={{ border: "none", outline: "none", background: "transparent", width: 120, textAlign: "center", color: "#111827" }}
            />
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "#1976d2", padding: 0 }}>
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
