import { useState, useMemo, useRef, useEffect } from "react";
import type { ExpenseTab } from "./types";
import type { ExpenseCategory } from "@/types";
import { Plus, ChevronDown } from "lucide-react";

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
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedCategory = useMemo(() => {
    return expenseCategoryList.find((c) => c.id === activeTab.expenseCategoryId);
  }, [expenseCategoryList, activeTab.expenseCategoryId]);

  const filteredCategories = expenseCategoryList.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background: "#fff", padding: "25px 20px 80px 20px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ position: "relative", width: 280 }} ref={dropdownRef}>
            <label style={{ position: "absolute", top: -8, left: 12, background: "#fff", padding: "0 4px", fontSize: 12, color: "#3b82f6", fontWeight: 500, zIndex: 1 }}>
              Expense Category <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                type="text"
                value={open ? search : (selectedCategory ? selectedCategory.name : "")}
                onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
                onFocus={() => { setSearch(""); }}
                onClick={() => { setOpen(true); setSearch(""); }}
                placeholder="Search Category"
                style={{ border: "1.5px solid #3b82f6", borderRadius: 4, padding: "8px 30px 8px 12px", width: "100%", height: 38, fontSize: 13, color: "#1f2937", outline: "none" }}
              />
              <ChevronDown size={16} color="#1f2937" style={{ position: "absolute", right: 10, pointerEvents: "none" }} />
            </div>

            {open && (
              <div style={{ position: "absolute", top: "100%", left: 0, width: 320, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 4, marginTop: 4, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", zIndex: 50 }}>
                <div
                  style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setShowAddCategoryPopup(true);
                    setOpen(false);
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500, color: "#3b82f6", fontSize: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: "50%", border: "1.5px solid #3b82f6" }}>
                      <Plus size={12} strokeWidth={3} />
                    </div>
                    Add Expense Category
                  </div>
                </div>
                <div style={{ maxHeight: 300, overflowY: "auto" }}>
                  {filteredCategories.map((c) => (
                    <div
                      key={c.id}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        setActiveTabCategory(c.id);
                        setOpen(false);
                      }}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid #f3f4f6" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#1f2937" }}>{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ fontSize: 13, textAlign: "right", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, marginBottom: 8 }}>
            <span style={{ color: "#6b7280" }}>Expense No.</span>
            <input
              type="text"
              readOnly
              value={displayedExpenseNo}
              style={{
                border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13, color: "#1f2937",
                padding: "3px 8px", width: 120, fontWeight: 600, background: "#f9fafb"
              }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
            <span style={{ color: "#6b7280" }}>Date</span>
            <input
              type="date"
              value={displayedExpenseDate}
              onChange={(e) => updateTab({ expenseDate: e.target.value })}
              style={{
                border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13, color: "#1f2937",
                padding: "3px 8px", width: 120, fontWeight: 600, cursor: "pointer"
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
