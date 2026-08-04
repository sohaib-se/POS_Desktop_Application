import { useEffect, useState, type ReactNode } from "react";
import { Search, Plus, X } from "lucide-react";
import { expenseCategories } from "@/data/mockData";
import type { ExpenseCategory } from "@/types";

interface ExpenseItem {
  id: string;
  name: string;
  price: number;
  category_id?: string;
}

interface ExpensesProps {
  onAddExpense?: () => void;
}

type ExpenseCategoryContextMenuState = {
  category: ExpenseCategory;
  x: number;
  y: number;
};

type ExpenseItemContextMenuState = {
  item: ExpenseItem;
  x: number;
  y: number;
};

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
};

type DialogContentProps = {
  children: ReactNode;
  className?: string;
};

type DialogHeaderProps = {
  children: ReactNode;
};

type DialogTitleProps = {
  children: ReactNode;
  className?: string;
};

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 overflow-y-auto">
      <div
        className="absolute inset-0"
        onClick={() => onOpenChange(false)}
      ></div>
      <div className="relative z-10 w-full flex justify-center p-4">
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ children, className }: DialogContentProps) => (
  <div
    className={`bg-white rounded-lg p-6 w-full max-w-lg relative shadow-xl ${className || ""}`}
  >
    {children}
  </div>
);

const DialogHeader = ({ children }: DialogHeaderProps) => (
  <div className="mb-4">{children}</div>
);

const DialogTitle = ({ children, className }: DialogTitleProps) => (
  <h2 className={`text-lg font-semibold ${className || ""}`}>{children}</h2>
);

export function Expenses({ onAddExpense }: ExpensesProps) {
  const [expenseCategoryList, setExpenseCategoryList] =
    useState<ExpenseCategory[]>(expenseCategories);
  const [selectedCategory, setSelectedCategory] =
    useState<ExpenseCategory | null>(expenseCategories[0]);
  const [activeTab, setActiveTab] = useState<"category" | "items">("category");
  const [expenseItemList, setExpenseItemList] = useState<ExpenseItem[]>([]);
  const [selectedExpenseItem, setSelectedExpenseItem] = useState<ExpenseItem | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryBeingEdited, setCategoryBeingEdited] =
    useState<ExpenseCategory | null>(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [categoryPendingDelete, setCategoryPendingDelete] =
    useState<ExpenseCategory | null>(null);
  const [categoryContextMenu, setCategoryContextMenu] =
    useState<ExpenseCategoryContextMenuState | null>(null);

  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [itemBeingEdited, setItemBeingEdited] = useState<ExpenseItem | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);
  const [itemPendingDelete, setItemPendingDelete] = useState<ExpenseItem | null>(null);
  const [itemContextMenu, setItemContextMenu] = useState<ExpenseItemContextMenuState | null>(null);

  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategoryList = expenseCategoryList.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredItemList = expenseItemList.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    let cancelled = false;

    const loadExpenseCategories = async () => {
      try {
        const response = await fetch("/api/expense_categories");
        if (!response.ok) {
          throw new Error("Failed to load expense categories");
        }

        const categories = (await response.json()) as ExpenseCategory[];
        if (cancelled) {
          return;
        }

        setExpenseCategoryList(categories);
        setSelectedCategory((previousCategory) => {
          if (!categories.length) {
            return null;
          }

          if (
            previousCategory &&
            categories.some((category) => category.id === previousCategory.id)
          ) {
            return (
              categories.find(
                (category) => category.id === previousCategory.id,
              ) ?? categories[0]
            );
          }

          return categories[0];
        });
      } catch (error) {
        console.error(error);
      }
    };

    void loadExpenseCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadExpenseItems = async () => {
      try {
        const response = await fetch("/api/expense_items");
        if (!response.ok) {
          throw new Error("Failed to load expense items");
        }

        const items = (await response.json()) as ExpenseItem[];
        if (cancelled) {
          return;
        }

        setExpenseItemList(items);
        if (items.length > 0) {
          setSelectedExpenseItem(items[0]);
        }
      } catch (error) {
        console.error(error);
      }
    };

    void loadExpenseItems();

    return () => {
      cancelled = true;
    };
  }, []);

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

  const handleCreateCategory = async () => {
    const normalizedName = newCategoryName.trim();
    if (!normalizedName) {
      return;
    }

    const alreadyExists = expenseCategoryList.some(
      (category) =>
        category.name.toLowerCase() === normalizedName.toLowerCase() &&
        category.id !== categoryBeingEdited?.id,
    );

    if (alreadyExists) {
      return;
    }

    try {
      const response = await fetch("/api/expense_categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: categoryBeingEdited?.id,
          name: normalizedName,
          amount: categoryBeingEdited?.amount ?? 0,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save expense category");
      }

      const updatedCategory = (await response.json()) as ExpenseCategory;

      setExpenseCategoryList((previousCategories) => {
        const hasExistingCategory = previousCategories.some(
          (category) => category.id === updatedCategory.id,
        );

        const nextCategories = hasExistingCategory
          ? previousCategories.map((category) =>
              category.id === updatedCategory.id ? updatedCategory : category,
            )
          : [...previousCategories, updatedCategory];

        return nextCategories.sort((a, b) => a.name.localeCompare(b.name));
      });
      setSelectedCategory(updatedCategory);
      setNewCategoryName("");
      setCategoryBeingEdited(null);
      setShowAddCategory(false);
    } catch (error) {
      console.error(error);
    }
  };

  const openEditCategoryDialog = (category: ExpenseCategory) => {
    setCategoryBeingEdited(category);
    setNewCategoryName(category.name);
    setShowAddCategory(true);
  };

  const handleDeleteCategory = async (category: ExpenseCategory) => {
    if (isDeletingCategory) {
      return;
    }

    setIsDeletingCategory(true);

    try {
      const response = await fetch(`/api/expense_categories/${category.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete expense category");
      }

      setExpenseCategoryList((previousCategories) => {
        const nextCategories = previousCategories.filter(
          (entry) => entry.id !== category.id,
        );

        setSelectedCategory((previousCategory) => {
          if (previousCategory?.id !== category.id) {
            return previousCategory;
          }

          return nextCategories[0] ?? null;
        });

        return nextCategories;
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeletingCategory(false);
      setCategoryPendingDelete(null);
    }
  };

  const handleCreateItem = async () => {
    const normalizedName = newItemName.trim();
    if (!normalizedName) {
      return;
    }

    const alreadyExists = expenseItemList.some(
      (item) =>
        item.name.toLowerCase() === normalizedName.toLowerCase() &&
        item.id !== itemBeingEdited?.id,
    );

    if (alreadyExists) {
      return;
    }

    try {
      const response = await fetch("/api/expense_items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: itemBeingEdited?.id,
          name: normalizedName,
          price: Number(newItemPrice) || 0,
          category_id: itemBeingEdited?.category_id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save expense item");
      }

      const updatedItem = (await response.json()) as ExpenseItem;

      setExpenseItemList((previousItems) => {
        const hasExistingItem = previousItems.some(
          (item) => item.id === updatedItem.id,
        );

        const nextItems = hasExistingItem
          ? previousItems.map((item) =>
              item.id === updatedItem.id ? updatedItem : item,
            )
          : [...previousItems, updatedItem];

        return nextItems.sort((a, b) => a.name.localeCompare(b.name));
      });
      setSelectedExpenseItem(updatedItem);
      setNewItemName("");
      setNewItemPrice("");
      setItemBeingEdited(null);
      setShowAddItem(false);
    } catch (error) {
      console.error(error);
    }
  };

  const openEditItemDialog = (item: ExpenseItem) => {
    setItemBeingEdited(item);
    setNewItemName(item.name);
    setNewItemPrice(String(item.price));
    setShowAddItem(true);
  };

  const handleDeleteItem = async (item: ExpenseItem) => {
    if (isDeletingItem) {
      return;
    }

    setIsDeletingItem(true);

    try {
      const response = await fetch(`/api/expense_items/${item.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete expense item");
      }

      setExpenseItemList((previousItems) => {
        const nextItems = previousItems.filter(
          (entry) => entry.id !== item.id,
        );

        setSelectedExpenseItem((previousItem) => {
          if (previousItem?.id !== item.id) {
            return previousItem;
          }

          return nextItems[0] ?? null;
        });

        return nextItems;
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeletingItem(false);
      setItemPendingDelete(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#D0DCE7] gap-1">
      {/* Top Header Tabs */}
      <div
        className="p-0 bg-white rounded-none flex items-center justify-between shrink-0 w-full"
        style={{ minHeight: "56px" }}
      >
        <div className="flex w-full">
          {(["category", "items"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-sm font-medium pb-2 border-b-2 transition-colors ${
                activeTab === tab
                  ? "text-[#E53935] border-[#E53935]"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-1 overflow-hidden">
        {/* Left Panel - Categories/Items */}
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

        {/* Right Panel - Category/Item Details */}
        <div className="flex-1 flex flex-col gap-1">
          {activeTab === "category" ? (
            selectedCategory && (
              <>
                {/* Category Info Card */}
                <div className="bg-white rounded-md shadow-sm px-6 pt-6 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-1">
                        {selectedCategory.name.toUpperCase()}
                      </h2>
                      <p className="text-sm text-gray-500">Indirect Expense</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#E53935]">
                        Total : Rs {selectedCategory.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Transactions Table */}
                <div className="flex-1 bg-white rounded-md shadow-sm overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-600 text-xs">
                          DATE ⚲
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600 text-xs">
                          EXP NO. ⚲
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600 text-xs">
                          PARTY ⚲
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600 text-xs">
                          PAYMENT TYPE ⚲
                        </th>
                        <th className="px-4 py-3 text-right font-medium text-gray-600 text-xs">
                          AMOUNT ⚲
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 bg-[#E3F2FD]">
                        <td className="px-4 py-3">26/02/2026</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3">Cash</td>
                        <td className="px-4 py-3 text-right">500</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )
          ) : (
            selectedExpenseItem && (
              <>
                {/* Item Info Card */}
                <div className="bg-white rounded-md shadow-sm px-6 pt-6 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-1">
                        {selectedExpenseItem.name.toUpperCase()}
                      </h2>
                      <p className="text-sm text-gray-500">Expense Item</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#E53935]">
                        Price : Rs {selectedExpenseItem.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Transactions Table - Empty or similar logic if needed */}
                <div className="flex-1 bg-white rounded-md shadow-sm overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-600 text-xs">
                          DATE ⚲
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600 text-xs">
                          EXP NO. ⚲
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600 text-xs">
                          PARTY ⚲
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600 text-xs">
                          PAYMENT TYPE ⚲
                        </th>
                        <th className="px-4 py-3 text-right font-medium text-gray-600 text-xs">
                          AMOUNT ⚲
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                    </tbody>
                  </table>
                </div>
              </>
            )
          )}
        </div>
      </div>

      {/* Add Category Modal */}
      <Dialog
        open={showAddCategory}
        onOpenChange={(isOpen: boolean) => {
          setShowAddCategory(isOpen);
          if (!isOpen) {
            setNewCategoryName("");
            setCategoryBeingEdited(null);
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                {categoryBeingEdited ? "Edit Category" : "Add Category"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowAddCategory(false);
                  setNewCategoryName("");
                  setCategoryBeingEdited(null);
                }}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close add category popup"
              >
                <X className="h-4 w-4" />
              </button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="e.g. Grocery"
              />
            </div>
            <button
              onClick={handleCreateCategory}
              disabled={!newCategoryName.trim()}
              className="w-full bg-[#E53935] text-white py-2 rounded-lg text-sm font-medium"
            >
              {categoryBeingEdited ? "Update" : "Create"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(categoryPendingDelete)}
        onOpenChange={(isOpen: boolean) => {
          if (!isOpen && !isDeletingCategory) {
            setCategoryPendingDelete(null);
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {categoryPendingDelete
                ? `Are you sure you want to delete ${categoryPendingDelete.name}? This action cannot be undone.`
                : "Are you sure you want to delete this category?"}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={isDeletingCategory}
                onClick={() => setCategoryPendingDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingCategory || !categoryPendingDelete}
                onClick={() => {
                  if (!categoryPendingDelete) {
                    return;
                  }

                  void handleDeleteCategory(categoryPendingDelete);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60"
              >
                {isDeletingCategory ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Item Modal */}
      <Dialog
        open={showAddItem}
        onOpenChange={(isOpen: boolean) => {
          setShowAddItem(isOpen);
          if (!isOpen) {
            setNewItemName("");
            setNewItemPrice("");
            setItemBeingEdited(null);
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                {itemBeingEdited ? "Edit Item" : "Add Item"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowAddItem(false);
                  setNewItemName("");
                  setNewItemPrice("");
                  setItemBeingEdited(null);
                }}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close add item popup"
              >
                <X className="h-4 w-4" />
              </button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name
              </label>
              <input
                type="text"
                value={newItemName}
                onChange={(event) => setNewItemName(event.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="e.g. Printer Paper"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                value={newItemPrice}
                onChange={(event) => setNewItemPrice(event.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="0"
              />
            </div>
            <button
              onClick={handleCreateItem}
              disabled={!newItemName.trim() || !newItemPrice}
              className="w-full bg-[#E53935] text-white py-2 rounded-lg text-sm font-medium"
            >
              {itemBeingEdited ? "Update" : "Create"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(itemPendingDelete)}
        onOpenChange={(isOpen: boolean) => {
          if (!isOpen && !isDeletingItem) {
            setItemPendingDelete(null);
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {itemPendingDelete
                ? `Are you sure you want to delete ${itemPendingDelete.name}? This action cannot be undone.`
                : "Are you sure you want to delete this item?"}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={isDeletingItem}
                onClick={() => setItemPendingDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingItem || !itemPendingDelete}
                onClick={() => {
                  if (!itemPendingDelete) {
                    return;
                  }

                  void handleDeleteItem(itemPendingDelete);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60"
              >
                {isDeletingItem ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
