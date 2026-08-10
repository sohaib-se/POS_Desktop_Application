import { useEffect, useMemo, useState } from "react";
import { expenseCategories } from "@/data/mockData";
import type { ExpenseCategory } from "@/types";

import type { ExpenseTab, ExpenseRow, ExpenseItem } from "../components/pagescomponents/addexpense/types";
import { ExpenseTabs } from "../components/pagescomponents/addexpense/ExpenseTabs";
import { ExpenseHeader } from "../components/pagescomponents/addexpense/ExpenseHeader";
import { ExpenseTable } from "../components/pagescomponents/addexpense/ExpenseTable";
import { ExpenseSummary } from "../components/pagescomponents/addexpense/ExpenseSummary";
import { ExpenseFooter } from "../components/pagescomponents/addexpense/ExpenseFooter";
import { AddCategoryModal } from "../components/pagescomponents/addexpense/AddCategoryModal";
import { AddItemModal } from "../components/pagescomponents/addexpense/AddItemModal";

interface AddExpenseProps {
  onSave?: () => void;
  onShare?: () => void;
  onClose?: () => void;
}

let globalRowId = 3;
let globalTabId = 2;

function createDefaultRow(): ExpenseRow {
  return {
    id: globalRowId++,
    categoryId: "",
    category: "",
    note: "",
    paymentType: "Cash",
    amount: "",
  };
}

function createDefaultTab(id: number): ExpenseTab {
  return {
    id,
    label: `Expense #${id}`,
    expenseCategoryId: expenseCategories[0]?.id ?? "",
    expenseDate: new Date().toLocaleDateString("en-GB"),
    paymentType: "Cash",
    roundOff: true,
    rows: [createDefaultRow(), createDefaultRow()],
    description: "",
    showDescriptionInput: false,
    imageDataUrl: "",
    imageFileName: "",
    documentDataUrl: "",
    documentFileName: "",
  };
}

export function AddExpense({ onSave, onShare, onClose }: AddExpenseProps) {
  const [tabs, setTabs] = useState<ExpenseTab[]>([createDefaultTab(1)]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [isOpenAnimated, setIsOpenAnimated] = useState(false);
  const [nextExpenseNo, setNextExpenseNo] = useState("1");
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [expenseCategoryList, setExpenseCategoryList] =
    useState<ExpenseCategory[]>(expenseCategories);
  const [expenseCategoryMap, setExpenseCategoryMap] = useState<Record<string, ExpenseCategory>>(
    () =>
      expenseCategories.reduce<Record<string, ExpenseCategory>>((accumulator, category) => {
        accumulator[category.id] = category;
        return accumulator;
      }, {}),
  );

  const [showAddCategoryPopup, setShowAddCategoryPopup] = useState(false);
  const [expenseItemList, setExpenseItemList] = useState<ExpenseItem[]>([]);
  const [showAddItemPopup, setShowAddItemPopup] = useState(false);
  const [activeRowIdForNewItem, setActiveRowIdForNewItem] = useState<number | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsOpenAnimated(true));
    return () => cancelAnimationFrame(frame);
  }, []);

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
        setExpenseCategoryMap(
          categories.reduce<Record<string, ExpenseCategory>>((accumulator, category) => {
            accumulator[category.id] = category;
            return accumulator;
          }, {}),
        );
        setTabs((previousTabs) =>
          previousTabs.map((tab) => {
            if (!categories.length) {
              return { ...tab, expenseCategoryId: "" };
            }

            const selectedCategoryExists = categories.some(
              (category) => category.id === tab.expenseCategoryId,
            );

            return selectedCategoryExists
              ? tab
              : { ...tab, expenseCategoryId: categories[0].id };
          }),
        );
      } catch (error) {
        console.error(error);
      }
    };

    const loadExpenseItems = async () => {
      try {
        const response = await fetch("/api/expense_items");
        if (!response.ok) return;
        const items = await response.json();
        if (!cancelled) setExpenseItemList(items);
      } catch (error) {
        console.error(error);
      }
    };

    void loadExpenseCategories();
    void loadExpenseItems();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadNextExpenseNo = async () => {
      try {
        const response = await fetch("/api/expense_records");
        if (!response.ok) {
          return;
        }

        const records = (await response.json()) as Array<{ payment_no?: string | null; id?: string | null }>;
        if (cancelled) {
          return;
        }

        const highestPaymentNo = records.reduce((highest, record) => {
          const paymentNo = Number(record.payment_no ?? record.id ?? 0);
          return Number.isFinite(paymentNo) && paymentNo > highest ? paymentNo : highest;
        }, 0);

        setNextExpenseNo(String(highestPaymentNo + 1));
      } catch (error) {
        console.error(error);
      }
    };

    void loadNextExpenseNo();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
  const displayedExpenseNo = nextExpenseNo;
  const displayedExpenseDate = activeTab.expenseDate;

  const totalAmount = useMemo(() => {
    return activeTab.rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
  }, [activeTab.rows]);

  const updateTab = (partial: Partial<ExpenseTab>) => {
    setTabs((previousTabs) => previousTabs.map((tab) => (tab.id === activeTabId ? { ...tab, ...partial } : tab)));
  };

  const setActiveTabCategory = (categoryId: string) => {
    updateTab({ expenseCategoryId: categoryId });
  };

  const updateRow = (rowId: number, updates: Partial<ExpenseRow>) => {
    setTabs((previousTabs) =>
      previousTabs.map((tab) => {
        if (tab.id === activeTabId) {
          return {
            ...tab,
            rows: tab.rows.map((row) => (row.id === rowId ? { ...row, ...updates } : row)),
          };
        }
        return tab;
      })
    );
  };

  const addTab = () => {
    const id = globalTabId++;
    setTabs((previousTabs) => [...previousTabs, createDefaultTab(id)]);
    setActiveTabId(id);
  };

  const closeTab = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    if (tabs.length === 1) {
      return;
    }

    setTabs((previousTabs) => {
      const remainingTabs = previousTabs.filter((tab) => tab.id !== id);
      if (activeTabId === id) {
        setActiveTabId(remainingTabs[remainingTabs.length - 1].id);
      }
      return remainingTabs;
    });
  };

  const addRow = () => {
    updateTab({ rows: [...activeTab.rows, createDefaultRow()] });
  };

  const handleAttachmentSelection = (
    event: React.ChangeEvent<HTMLInputElement>,
    attachmentType: "image" | "document",
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      updateTab(
        attachmentType === "image"
          ? { imageDataUrl: "", imageFileName: "" }
          : { documentDataUrl: "", documentFileName: "" },
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      updateTab(
        attachmentType === "image"
          ? { imageDataUrl: result, imageFileName: file.name }
          : { documentDataUrl: result, documentFileName: file.name },
      );
    };
    reader.onerror = () => {
      updateTab(
        attachmentType === "image"
          ? { imageDataUrl: "", imageFileName: "" }
          : { documentDataUrl: "", documentFileName: "" },
      );
    };
    reader.readAsDataURL(file);
  };

  const handleSaveExpense = async () => {
    if (isSaving) {
      return;
    }

    if (!activeTab.expenseCategoryId) {
      setSaveError("Select an expense category before saving.");
      return;
    }

    setSaveError("");
    setIsSaving(true);

    try {
      const expenseCategoryName = expenseCategoryMap[activeTab.expenseCategoryId]?.name ?? "";
      const lineItems = activeTab.rows
        .map((row) => {
          const quantity = Number(row.note) || 0;
          const price = Number(row.paymentType) || 0;
          const amount = Number(row.amount) || quantity * price;

          return {
            itemId: row.categoryId || "",
            name: row.category,
            quantity,
            price,
            amount,
          };
        })
        .filter((row) => row.name || row.quantity || row.price || row.amount);


      const computedAmount = lineItems.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
      const roundOffAmount = activeTab.roundOff ? Math.round(computedAmount) - computedAmount : 0;

      const response = await fetch("/api/expense_records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: crypto.randomUUID(),
          expenseNo: displayedExpenseNo,
          categoryId: activeTab.expenseCategoryId,
          categoryName: expenseCategoryName,
          amount: computedAmount,
          paymentType: activeTab.paymentType,
          description: activeTab.description || null,
          lineItems,
          imageDataUrl: activeTab.imageDataUrl || null,
          imageFileName: activeTab.imageFileName || null,
          documentDataUrl: activeTab.documentDataUrl || null,
          documentFileName: activeTab.documentFileName || null,
          roundOff: activeTab.roundOff ? 1 : 0,
          roundOffAmount,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save expense");
      }

      window.dispatchEvent(
        new CustomEvent("expenses-refresh", {
          detail: {
            message: `Expense saved successfully for ${expenseCategoryName || "selected category"}.`,
          },
        }),
      );

      setNextExpenseNo(String(Number(displayedExpenseNo) + 1));

      onSave?.();
      onClose?.();
    } catch (error) {
      console.error(error);
      setSaveError("Failed to save the expense. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCategorySuccess = (createdCategory: ExpenseCategory) => {
    setExpenseCategoryList((previous) => {
      const next = [...previous, createdCategory];
      next.sort((a, b) => a.name.localeCompare(b.name));
      return next;
    });
    setExpenseCategoryMap((prev) => ({ ...prev, [createdCategory.id]: createdCategory }));
    setActiveTabCategory(createdCategory.id);
  };

  const handleItemSuccess = (createdItem: ExpenseItem) => {
    setExpenseItemList((previous) => {
      const next = [...previous, createdItem];
      next.sort((a, b) => a.name.localeCompare(b.name));
      return next;
    });
    
    if (activeRowIdForNewItem !== null) {
      setTabs((previousTabs) =>
        previousTabs.map((tab) => {
          if (tab.id === activeTabId) {
            return {
              ...tab,
              rows: tab.rows.map((row) => {
                if (row.id === activeRowIdForNewItem) {
                  const qty = Number(row.note) || 1;
                  return {
                    ...row,
                    categoryId: createdItem.id,
                    category: createdItem.name,
                    paymentType: String(createdItem.price),
                    note: String(qty),
                    amount: String(qty * createdItem.price),
                  };
                }
                return row;
              }),
            };
          }
          return tab;
        })
      );
      setActiveRowIdForNewItem(null);
    }
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#D0DCE7",
        opacity: isOpenAnimated ? 1 : 0,
        transform: isOpenAnimated ? "translate3d(0, 0, 0) scale(1)" : "translate3d(-48px, 48px, 0) scale(0.99)",
        transition: "opacity 120ms ease-out, transform 170ms cubic-bezier(0.2, 0.8, 0.2, 1)",
      }}
    >
      <ExpenseTabs
        tabs={tabs}
        activeTabId={activeTabId}
        setActiveTabId={setActiveTabId}
        closeTab={closeTab}
        addTab={addTab}
        onClose={onClose}
      />

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 0 }}>
        <ExpenseHeader
          activeTab={activeTab}
          expenseCategoryList={expenseCategoryList}
          setActiveTabCategory={setActiveTabCategory}
          setShowAddCategoryPopup={setShowAddCategoryPopup}
          displayedExpenseNo={displayedExpenseNo}
          displayedExpenseDate={displayedExpenseDate}
          updateTab={updateTab}
        />

        <ExpenseTable
          activeTab={activeTab}
          expenseItemList={expenseItemList}
          setShowAddItemPopup={setShowAddItemPopup}
          setActiveRowIdForNewItem={setActiveRowIdForNewItem}
          updateRow={updateRow}
          addRow={addRow}
          totalAmount={totalAmount}
        />

        <ExpenseSummary
          activeTab={activeTab}
          updateTab={updateTab}
          totalAmount={totalAmount}
          handleAttachmentSelection={handleAttachmentSelection}
        />
      </div>

      <ExpenseFooter
        saveError={saveError}
        isSaving={isSaving}
        onShare={onShare}
        handleSaveExpense={handleSaveExpense}
      />

      {showAddCategoryPopup && (
        <AddCategoryModal
          onClose={() => setShowAddCategoryPopup(false)}
          onSuccess={handleCategorySuccess}
        />
      )}

      {showAddItemPopup && (
        <AddItemModal
          onClose={() => setShowAddItemPopup(false)}
          onSuccess={handleItemSuccess}
        />
      )}
    </div>
  );
}
