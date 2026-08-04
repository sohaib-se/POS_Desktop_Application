import { useEffect, useState } from "react";
import { expenseCategories } from "@/data/mockData";
import type { ExpenseCategory } from "@/types";
import type { ExpenseItem } from "../components/pagescomponents/expenses/types";

import { ExpensesTabs } from "../components/pagescomponents/expenses/ExpensesTabs";
import { ExpensesSidebar } from "../components/pagescomponents/expenses/ExpensesSidebar";
import { ExpensesDetails } from "../components/pagescomponents/expenses/ExpensesDetails";
import { CategoryModals } from "../components/pagescomponents/expenses/CategoryModals";
import { ItemModals } from "../components/pagescomponents/expenses/ItemModals";

interface ExpensesProps {
  onAddExpense?: () => void;
}

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

  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [itemBeingEdited, setItemBeingEdited] = useState<ExpenseItem | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);
  const [itemPendingDelete, setItemPendingDelete] = useState<ExpenseItem | null>(null);

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
      <ExpensesTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex gap-1 overflow-hidden">
        <ExpensesSidebar
          activeTab={activeTab}
          expenseCategoryList={expenseCategoryList}
          expenseItemList={expenseItemList}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedExpenseItem={selectedExpenseItem}
          setSelectedExpenseItem={setSelectedExpenseItem}
          onAddExpense={onAddExpense}
          openEditCategoryDialog={openEditCategoryDialog}
          setCategoryPendingDelete={setCategoryPendingDelete}
          openEditItemDialog={openEditItemDialog}
          setItemPendingDelete={setItemPendingDelete}
        />

        <ExpensesDetails
          activeTab={activeTab}
          selectedCategory={selectedCategory}
          selectedExpenseItem={selectedExpenseItem}
        />
      </div>

      <CategoryModals
        showAddCategory={showAddCategory}
        setShowAddCategory={setShowAddCategory}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        categoryBeingEdited={categoryBeingEdited}
        setCategoryBeingEdited={setCategoryBeingEdited}
        handleCreateCategory={handleCreateCategory}
        categoryPendingDelete={categoryPendingDelete}
        setCategoryPendingDelete={setCategoryPendingDelete}
        isDeletingCategory={isDeletingCategory}
        handleDeleteCategory={handleDeleteCategory}
      />

      <ItemModals
        showAddItem={showAddItem}
        setShowAddItem={setShowAddItem}
        newItemName={newItemName}
        setNewItemName={setNewItemName}
        newItemPrice={newItemPrice}
        setNewItemPrice={setNewItemPrice}
        itemBeingEdited={itemBeingEdited}
        setItemBeingEdited={setItemBeingEdited}
        handleCreateItem={handleCreateItem}
        itemPendingDelete={itemPendingDelete}
        setItemPendingDelete={setItemPendingDelete}
        isDeletingItem={isDeletingItem}
        handleDeleteItem={handleDeleteItem}
      />
    </div>
  );
}
