import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import type { ExpenseCategory } from "@/types";
import type {
  ExpenseItem,
  ExpenseCategoryContextMenuState,
  ExpenseItemContextMenuState,
} from "./types";

interface ExpensesSidebarProps {
  activeTab: "category" | "items";
  expenseCategoryList: ExpenseCategory[];
  expenseItemList: ExpenseItem[];
  selectedCategory: ExpenseCategory | null;
  setSelectedCategory: (cat: ExpenseCategory) => void;
  selectedExpenseItem: ExpenseItem | null;
  setSelectedExpenseItem: (item: ExpenseItem) => void;
  onAddExpense?: () => void;
  openEditCategoryDialog: (cat: ExpenseCategory) => void;
  setCategoryPendingDelete: (cat: ExpenseCategory) => void;
  openEditItemDialog: (item: ExpenseItem) => void;
  setItemPendingDelete: (item: ExpenseItem) => void;
}

export function ExpensesSidebar({
  activeTab,
  expenseCategoryList,
  expenseItemList,
  selectedCategory,
  setSelectedCategory,
  selectedExpenseItem,
  setSelectedExpenseItem,
  onAddExpense,
  openEditCategoryDialog,
  setCategoryPendingDelete,
  openEditItemDialog,
  setItemPendingDelete,
}: ExpensesSidebarProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryContextMenu, setCategoryContextMenu] =
    useState<ExpenseCategoryContextMenuState | null>(null);
  const [itemContextMenu, setItemContextMenu] =
    useState<ExpenseItemContextMenuState | null>(null);

  const filteredCategoryList = expenseCategoryList.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredItemList = expenseItemList.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getContextMenuStyle = (x: number, y: number) => {
    if (typeof window === "undefined") {
      return { left: x, top: y };
    }

    const menuWidth = 160;
    const menuHeight = 80;
    const viewportPadding = 8;

    let left = x;
    let top = y;

    if (left + menuWidth > window.innerWidth - viewportPadding) {
      left = Math.max(
        viewportPadding,
        window.innerWidth - menuWidth - viewportPadding,
      );
    }

    if (top + menuHeight > window.innerHeight - viewportPadding) {
      top = Math.max(viewportPadding, y - menuHeight);
    }

    return { left, top };
  };

  useEffect(() => {
    if (!categoryContextMenu) {
      return;
    }

    const closeMenu = () => setCategoryContextMenu(null);

    window.addEventListener("click", closeMenu);
    window.addEventListener("resize", closeMenu);
    window.addEventListener("scroll", closeMenu, true);

    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("resize", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
    };
  }, [categoryContextMenu]);

  useEffect(() => {
    if (!itemContextMenu) {
      return;
    }

    const closeMenu = () => setItemContextMenu(null);

    window.addEventListener("click", closeMenu);
    window.addEventListener("resize", closeMenu);
    window.addEventListener("scroll", closeMenu, true);

    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("resize", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
    };
  }, [itemContextMenu]);

  return (
    <div className="w-80 flex flex-col bg-white rounded-md shadow-sm overflow-hidden">
      {/* Search and Add Button */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-2 min-h-[65px]">
        <div className="flex-1 min-w-0">
          {isSearching ? (
            <input
              autoFocus
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => {
                setTimeout(() => {
                  setIsSearching(false);
                  setSearchQuery("");
                }, 200);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E53935]"
            />
          ) : (
            <button
              className="p-2 hover:bg-gray-100 rounded"
              onClick={() => setIsSearching(true)}
            >
              <Search className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>

        <button
          onClick={onAddExpense}
          className="bg-[#E53935] hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-600 text-xs">
                {activeTab === "category" ? "CATEGORY" : "ITEM"} ↑
              </th>
              <th className="px-4 py-2 text-right font-medium text-gray-600 text-xs">
                AMOUNT
              </th>
            </tr>
          </thead>
          <tbody>
            {activeTab === "category" ? (
              filteredCategoryList.map((cat) => (
                <tr
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    setCategoryContextMenu({
                      category: cat,
                      x: event.clientX,
                      y: event.clientY,
                    });
                  }}
                  className={`cursor-pointer border-b border-gray-100 ${
                    selectedCategory?.id === cat.id
                      ? "bg-[#E3F2FD]"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <td className="px-4 py-3 text-gray-900">{cat.name}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {cat.amount}
                  </td>
                </tr>
              ))
            ) : (
              filteredItemList.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedExpenseItem(item)}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    setItemContextMenu({
                      item: item,
                      x: event.clientX,
                      y: event.clientY,
                    });
                  }}
                  className={`cursor-pointer border-b border-gray-100 ${
                    selectedExpenseItem?.id === item.id
                      ? "bg-[#E3F2FD]"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <td className="px-4 py-3 text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {item.price}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {categoryContextMenu && (
        <div
          className="fixed z-50 min-w-40 rounded-md border bg-white p-1 shadow-md"
          style={getContextMenuStyle(
            categoryContextMenu.x,
            categoryContextMenu.y,
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            onClick={() => {
              setSelectedCategory(categoryContextMenu.category);
              openEditCategoryDialog(categoryContextMenu.category);
              setCategoryContextMenu(null);
            }}
            className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-gray-100"
          >
            View/Edit
          </button>
          <button
            onClick={() => {
              const category = categoryContextMenu.category;
              setCategoryContextMenu(null);
              setCategoryPendingDelete(category);
            }}
            className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      )}

      {itemContextMenu && (
        <div
          className="fixed z-50 min-w-40 rounded-md border bg-white p-1 shadow-md"
          style={getContextMenuStyle(
            itemContextMenu.x,
            itemContextMenu.y,
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            onClick={() => {
              setSelectedExpenseItem(itemContextMenu.item);
              openEditItemDialog(itemContextMenu.item);
              setItemContextMenu(null);
            }}
            className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-gray-100"
          >
            View/Edit
          </button>
          <button
            onClick={() => {
              const item = itemContextMenu.item;
              setItemContextMenu(null);
              setItemPendingDelete(item);
            }}
            className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
