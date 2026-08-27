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
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/Toast";

interface AddExpenseProps {
  onSave?: () => void;
  onShare?: () => void;
  onClose?: () => void;
  initialExpense?: any;
}

let globalRowId = 3;
let globalTabId = 2;

function createDefaultRow(): ExpenseRow {
  return {
    id: globalRowId++,
    categoryId: "",
    category: "",
    note: "",
    paymentType: "",
    amount: "",
  };
}

function createDefaultTab(id: number): ExpenseTab {
  return {
    id,
    label: `Expense #${id}`,
    expenseCategoryId: "",
    expenseDate: new Date().toISOString().split("T")[0],
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

export function AddExpense({ onSave, onShare, onClose, initialExpense }: AddExpenseProps) {
  const [tabs, setTabs] = useState<ExpenseTab[]>(() => {
    if (initialExpense) {
      let parsedItems: any[] = [];
      try {
        parsedItems = JSON.parse(initialExpense.line_items_json || "[]");
      } catch (e) {}

      const rows = parsedItems.length > 0 ? parsedItems.map((item: any) => ({
        id: globalRowId++,
        categoryId: item.itemId || "",
        category: item.name || "",
        note: String(item.quantity || ""),
        paymentType: String(item.price || ""),
        amount: String(item.amount || "")
      })) : [createDefaultRow()];

      const createdDate = initialExpense.created_at ? new Date(initialExpense.created_at) : new Date();
      const dateStr = !isNaN(createdDate.getTime()) ? createdDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0];

      return [{
        id: 1,
        label: `Expense #1`,
        expenseCategoryId: initialExpense.category_id || "",
        expenseDate: dateStr,
        paymentType: initialExpense.payment_type || "Cash",
        roundOff: initialExpense.round_off === 1,
        rows,
        description: initialExpense.description || "",
        showDescriptionInput: !!initialExpense.description,
        imageDataUrl: "",
        imageFileName: "",
        documentDataUrl: "",
        documentFileName: "",
        expenseRecordId: initialExpense.id
      }];
    }
    return [createDefaultTab(1)];
  });
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
  const [tabToClose, setTabToClose] = useState<number | null>(null);
  const [showCloseAllDialog, setShowCloseAllDialog] = useState(false);

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
        const response = await fetch("/api/expense_records", {
          cache: "no-store",
        });
        if (!response.ok) {
          return;
        }

        const records = (await response.json()) as Array<{ expense_no?: string | null; id?: string | null }>;
        if (cancelled) {
          return;
        }

        const highestExpenseNo = records.reduce((highest, record) => {
          const expenseNo = Number(record.expense_no ?? 0);
          return Number.isFinite(expenseNo) && expenseNo > highest ? expenseNo : highest;
        }, 0);

        setNextExpenseNo(String(highestExpenseNo + 1));
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
  const displayedExpenseNo = initialExpense?.expense_no ? String(initialExpense.expense_no) : String(nextExpenseNo);
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

  const removeRow = (rowId: number) => {
    setTabs((previousTabs) =>
      previousTabs.map((tab) => {
        if (tab.id === activeTabId) {
          return {
            ...tab,
            rows: tab.rows.filter((row) => row.id !== rowId),
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

  const closeTab = (id: number, event?: React.MouseEvent, force = false) => {
    event?.stopPropagation();

    if (!force) {
      const tabData = tabs.find((t) => t.id === id);
      const hasData = tabData && (
        tabData.expenseCategoryId !== "" ||
        tabData.description !== "" ||
        tabData.rows.some((r) => r.category !== "" || r.note !== "" || r.paymentType !== "")
      );

      if (hasData) {
        setTabToClose(id);
        return;
      }
    }

    if (tabs.length === 1) {
      onClose?.();
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

  const handleCloseModal = () => {
    const hasData = tabs.some((tabData) => 
      tabData.expenseCategoryId !== "" ||
      tabData.description !== "" ||
      tabData.rows.some((r) => r.category !== "" || r.note !== "" || r.paymentType !== "")
    );

    if (hasData) {
      setShowCloseAllDialog(true);
    } else {
      onClose?.();
    }
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
          id: activeTab.expenseRecordId || crypto.randomUUID(),
          isUpdate: !!activeTab.expenseRecordId,
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

      toast.success(
        activeTab.expenseRecordId 
          ? "Expense updated successfully!" 
          : "Expense saved successfully!"
      );

      setNextExpenseNo(String(Number(displayedExpenseNo) + 1));

      onSave?.();
      closeTab(activeTabId, undefined, true);
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
        tabs={tabs.map(tab => ({ ...tab, label: `Expense #${displayedExpenseNo}` }))}
        activeTabId={activeTabId}
        setActiveTabId={setActiveTabId}
        closeTab={closeTab}
        addTab={addTab}
        onClose={handleCloseModal}
      />

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 0, background: "#fff" }}>
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
          removeRow={removeRow}
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

      <ConfirmDialog
        open={tabToClose !== null}
        title="Close Tab"
        message="Are you sure you want to close this tab? Any unsaved data will be lost."
        confirmLabel="Close Tab"
        cancelLabel="Cancel"
        onConfirm={() => {
          if (tabToClose !== null) {
            closeTab(tabToClose, undefined, true);
            setTabToClose(null);
          }
        }}
        onCancel={() => setTabToClose(null)}
      />

      <ConfirmDialog
        open={showCloseAllDialog}
        title="Close Add Expense"
        message="Are you sure you want to close? Any unsaved data across all tabs will be lost."
        confirmLabel="Close"
        cancelLabel="Cancel"
        onConfirm={() => {
          setShowCloseAllDialog(false);
          onClose?.();
        }}
        onCancel={() => setShowCloseAllDialog(false)}
      />
    </div>
  );
}
