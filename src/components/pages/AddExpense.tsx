import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { expenseCategories } from "@/data/mockData";
import type { ExpenseCategory } from "@/types";

interface ExpenseRow {
  id: number;
  categoryId: string;
  category: string;
  note: string;
  paymentType: string;
  amount: string;
}

interface ExpenseTab {
  id: number;
  label: string;
  expenseCategoryId: string;
  expenseDate: string;
  paymentType: string;
  roundOff: boolean;
  rows: ExpenseRow[];
  description: string;
  showDescriptionInput: boolean;
  imageDataUrl: string;
  imageFileName: string;
  documentDataUrl: string;
  documentFileName: string;
}

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

function useColumnResize(initial: number[]) {
  const [widths, setWidths] = useState(initial);
  const resizing = useRef<{ col: number; startX: number; startW: number } | null>(null);

  const startResize = useCallback((col: number, e: React.MouseEvent) => {
    e.preventDefault();
    resizing.current = { col, startX: e.clientX, startW: widths[col] };

    const onMove = (ev: MouseEvent) => {
      if (!resizing.current) return;
      const delta = ev.clientX - resizing.current.startX;
      const newW = Math.max(70, resizing.current.startW + delta);
      setWidths((previousWidths) => {
        const nextWidths = [...previousWidths];
        nextWidths[resizing.current!.col] = newW;
        return nextWidths;
      });
    };

    const onUp = () => {
      resizing.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [widths]);

  return { widths, startResize };
}

export function AddExpense({ onSave, onShare, onClose }: AddExpenseProps) {
  const [tabs, setTabs] = useState<ExpenseTab[]>([createDefaultTab(1)]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [isOpenAnimated, setIsOpenAnimated] = useState(false);
  const [nextExpenseNo, setNextExpenseNo] = useState("1");
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [expenseCategoryMap, setExpenseCategoryMap] = useState<Record<string, ExpenseCategory>>({});

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsOpenAnimated(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const categoryLookup = expenseCategories.reduce<Record<string, ExpenseCategory>>((accumulator, category) => {
      accumulator[category.id] = category;
      return accumulator;
    }, {});
    setExpenseCategoryMap(categoryLookup);
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

  const { widths, startResize } = useColumnResize([42, 220, 260, 150, 150]);

  const totalAmount = useMemo(() => {
    return activeTab.rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
  }, [activeTab.rows]);

  const updateTab = (partial: Partial<ExpenseTab>) => {
    setTabs((previousTabs) => previousTabs.map((tab) => (tab.id === activeTabId ? { ...tab, ...partial } : tab)));
  };

  const setActiveTabCategory = (categoryId: string) => {
    updateTab({ expenseCategoryId: categoryId });
  };

  const updateRow = (rowId: number, field: keyof ExpenseRow, value: string) => {
    updateTab({
      rows: activeTab.rows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
    });
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
        .map((row, index) => {
          const quantity = Number(row.note) || 0;
          const price = Number(row.paymentType) || 0;
          const amount = Number(row.amount) || quantity * price;

          return {
            id: row.id,
            itemId: row.categoryId || String(index + 1),
            name: row.category,
            quantity,
            unit: "PCS",
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
          paymentNo: displayedExpenseNo,
          date: displayedExpenseDate,
          partyName: expenseCategoryName || "Expense",
          expenseCategoryId: activeTab.expenseCategoryId,
          expenseCategoryName,
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

  const ResizeHandle = ({ col }: { col: number }) => (
    <div
      onMouseDown={(event) => startResize(col, event)}
      style={{
        position: "absolute",
        right: 0,
        top: 0,
        width: 6,
        height: "100%",
        cursor: "col-resize",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
      }}
    >
      <div style={{ width: 1, height: "60%", background: "#d1d5db" }} />
    </div>
  );

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
      <div style={{ background: "#c4d3de", display: "flex", alignItems: "flex-end", padding: "2px 10px 0 10px", gap: 4, flexShrink: 0 }}>
        {tabs.map((tab) => {
          const active = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 20px",
                background: active ? "#fff" : "#d4dfe9",
                color: active ? "#1f2937" : "#6b7280",
                fontWeight: active ? 500 : 400,
                fontSize: 13,
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                cursor: "pointer",
                borderBottom: active ? "2px solid #fff" : "none",
                userSelect: "none",
                boxShadow: active ? "0 -1px 3px rgba(0,0,0,0.06)" : "none",
                minWidth: 225,
                position: "relative",
                overflow: "visible",
              }}
            >
              {active && (
                <>
                  <span style={{ position: "absolute", left: -10, bottom: 0, width: 10, height: 10, borderBottomRightRadius: 10, boxShadow: "5px 5px 0 5px #fff", pointerEvents: "none" }} />
                  <span style={{ position: "absolute", right: -10, bottom: 0, width: 10, height: 10, borderBottomLeftRadius: 10, boxShadow: "-5px 5px 0 5px #fff", pointerEvents: "none" }} />
                </>
              )}
              <span>{tab.label}</span>
              {tabs.length > 1 && (
                <button
                  onClick={(event) => closeTab(tab.id, event)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "2px 6px",
                    borderRadius: 4,
                    color: "#9ca3af",
                    fontSize: 12,
                    lineHeight: 1,
                    display: "flex",
                    alignItems: "center",
                    marginLeft: "auto",
                    marginRight: -10,
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
        <button
          onClick={addTab}
          title="New Expense"
          style={{
            marginBottom: 0,
            marginLeft: 4,
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: "#3b82f6",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: 300,
            alignSelf: "center",
            flexShrink: 0,
            boxShadow: "0 1px 4px rgba(59,130,246,0.4)",
          }}
        >
          +
        </button>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close add expense"
            style={{
              marginLeft: "auto",
              marginBottom: 0,
              width: 24,
              height: 24,
              background: "#374151",
              border: "none",
              cursor: "pointer",
              color: "#ffffff",
              padding: 0,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              alignSelf: "center",
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 0 }}>
        <div style={{ background: "#fff", padding: "25px 20px 40px 20px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div style={{ position: "relative" }}>
              <label style={{ position: "absolute", top: -11, left: 10, background: "#fff", padding: "0 4px", color: "#94a3b8", fontSize: 12 }}>
                Expense Category<span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                style={{ appearance: "none", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13, color: "#374151", background: "#fff", padding: "7px 32px 7px 12px", minWidth: 225, cursor: "pointer", textTransform: "lowercase" }}
                value={activeTab.expenseCategoryId}
                onChange={(event) => setActiveTabCategory(event.target.value)}
              >
                {expenseCategories.map((category) => (
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

        <div style={{ background: "#fff", paddingBottom: 80 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: widths[0] }} />
              <col style={{ width: widths[1] }} />
              <col style={{ width: widths[2] }} />
              <col style={{ width: widths[3] }} />
              <col style={{ width: widths[4] }} />
              <col style={{ width: 36 }} />
            </colgroup>
            <thead>
              <tr style={{ background: "#f3f6f9", borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ position: "relative", padding: "8px 0", textAlign: "center", fontSize: 12, fontWeight: 600, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
                  #<ResizeHandle col={0} />
                </th>
                <th style={{ position: "relative", padding: "8px 10px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
                  ITEM<ResizeHandle col={1} />
                </th>
                <th style={{ position: "relative", padding: "8px 10px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
                  QTY<ResizeHandle col={2} />
                </th>
                <th style={{ position: "relative", padding: "8px 10px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
                  PRICE/UNIT<ResizeHandle col={3} />
                </th>
                <th style={{ position: "relative", padding: "8px 10px", textAlign: "right", fontSize: 12, fontWeight: 600, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
                  AMOUNT<ResizeHandle col={4} />
                </th>
                <th style={{ padding: "8px 6px", textAlign: "center", background: "#f3f6f9" }}>
                  <button style={{ background: "none", border: "none", cursor: "pointer", color: "#3b82f6", padding: 0, display: "flex", alignItems: "center" }}>
                    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v8M8 12h8" />
                    </svg>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {activeTab.rows.map((row, index) => {
                return (
                  <tr
                    key={row.id}
                    style={{ borderBottom: "1px solid #f0f0f0" }}
                    onMouseEnter={(event) => (event.currentTarget.style.background = "#f8fbff")}
                    onMouseLeave={(event) => (event.currentTarget.style.background = "")}
                  >
                    <td style={{ textAlign: "center", color: "#9ca3af", fontSize: 13, padding: "5px 0", borderRight: "1px solid #e5e7eb" }}>
                      {index + 1}
                    </td>
                    <td style={{ borderRight: "1px solid #e5e7eb", padding: "4px 8px" }}>
                      <input
                        type="text"
                        style={{ width: "100%", border: "none", outline: "none", fontSize: 13, color: "#374151", background: "transparent" }}
                        value={row.category}
                        onChange={(event) => updateRow(row.id, "category", event.target.value)}
                        placeholder="Item"
                      />
                    </td>
                    <td style={{ borderRight: "1px solid #e5e7eb", padding: "4px 8px" }}>
                      <input
                        type="number"
                        style={{ width: "100%", border: "none", outline: "none", fontSize: 13, color: "#374151", background: "transparent", textAlign: "right" }}
                        value={row.note}
                        onChange={(event) => updateRow(row.id, "note", event.target.value)}
                        placeholder="Qty"
                      />
                    </td>
                    <td style={{ borderRight: "1px solid #e5e7eb", padding: "4px 8px" }}>
                      <input
                        type="number"
                        style={{ width: "100%", border: "none", outline: "none", fontSize: 13, color: "#374151", background: "transparent", textAlign: "right" }}
                        value={row.paymentType}
                        onChange={(event) => updateRow(row.id, "paymentType", event.target.value)}
                        placeholder="Price/Unit"
                      />
                    </td>
                    <td style={{ borderRight: "1px solid #e5e7eb", padding: "4px 8px" }}>
                      <input
                        type="number"
                        style={{ width: "100%", border: "none", outline: "none", fontSize: 13, color: "#374151", background: "transparent", textAlign: "right" }}
                        value={row.amount}
                        onChange={(event) => updateRow(row.id, "amount", event.target.value)}
                      />
                    </td>
                    <td />
                  </tr>
                );
              })}

              <tr style={{ borderTop: "2px solid #e5e7eb", background: "#fafafa" }}>
                <td style={{ borderRight: "1px solid #e5e7eb" }} />
                <td style={{ padding: "8px 8px", borderRight: "1px solid #e5e7eb" }}>
                  <button
                    onClick={addRow}
                    style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", border: "1px solid #93c5fd", borderRadius: 4, padding: "3px 10px", background: "#fff", cursor: "pointer", letterSpacing: "0.05em" }}
                  >
                    ADD ROW
                  </button>
                </td>
                <td colSpan={2} style={{ padding: "8px 10px", fontSize: 12, fontWeight: 700, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
                  <span style={{ float: "left" }}>TOTAL</span>
                </td>
                <td style={{ padding: "8px 10px", textAlign: "right", fontSize: 13, fontWeight: 600, color: "#374151", borderRight: "1px solid #e5e7eb" }}>
                  {totalAmount > 0 ? totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0"}
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ background: "#fff", padding: "20px 20px 24px 20px" }}>
          <div style={{ display: "flex", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 170 }}>
              <div style={{ position: "relative", width: 160 }}>
                <label style={{ position: "absolute", top: -11, left: 10, background: "#fff", padding: "0 4px", color: "#94a3b8", fontSize: 12 }}>
                  Payment Type
                </label>
                <select
                  value={activeTab.paymentType}
                  onChange={(event) => updateTab({ paymentType: event.target.value })}
                  style={{ appearance: "none", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13, color: "#374151", background: "#fff", padding: "7px 30px 7px 12px", width: "100%", cursor: "pointer" }}
                >
                  <option>Cash</option>
                  <option>Bank Transfer</option>
                  <option>Cheque</option>
                </select>
                <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#6b7280" }}>▾</span>
              </div>
              <button
                type="button"
                style={{ background: "none", border: "none", color: "#1976d2", fontSize: 13, padding: 0, display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
                Add Payment type
              </button>
              {activeTab.showDescriptionInput ? (
                <textarea
                  autoFocus
                  rows={3}
                  placeholder="Add description..."
                  style={{ border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13, padding: "8px 10px", resize: "none", width: "100%", outline: "none" }}
                  value={activeTab.description}
                  onChange={(event) => updateTab({ description: event.target.value })}
                />
              ) : (
                <button
                  onClick={() => updateTab({ showDescriptionInput: true })}
                  style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "#9ca3af", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", padding: 0 }}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  ADD DESCRIPTION
                </button>
              )}
              <button
                onClick={() => document.getElementById(`expense-image-${activeTab.id}`)?.click()}
                style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 4, color: "#a3a3a3", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", width: 120, justifyContent: "center" }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                ADD IMAGE
              </button>
              <button
                onClick={() => document.getElementById(`expense-document-${activeTab.id}`)?.click()}
                style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 4, color: "#a3a3a3", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", width: 120, justifyContent: "center" }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                ADD DOCUMENT
              </button>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{activeTab.imageFileName ? `Image: ${activeTab.imageFileName}` : ""}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{activeTab.documentFileName ? `Document: ${activeTab.documentFileName}` : ""}</div>
            </div>

            <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", gap: 12, fontSize: 13, minWidth: 370 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={activeTab.roundOff}
                    onChange={(event) => updateTab({ roundOff: event.target.checked })}
                    style={{ width: 15, height: 15, accentColor: "#1976d2", cursor: "pointer" }}
                  />
                  <span style={{ color: "#6b7280" }}>Round Off</span>
                </label>
                <input
                  type="text"
                  readOnly
                  style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "5px 8px", width: 62, textAlign: "right", fontSize: 13, color: "#6b7280", background: "#fff" }}
                  value={activeTab.roundOff ? Math.round(totalAmount) - totalAmount : 0}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                <span style={{ color: "#374151", fontWeight: 600, width: 68, textAlign: "right" }}>Total</span>
                <input
                  type="text"
                  readOnly
                  style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "5px 10px", width: 210, textAlign: "right", fontSize: 13, fontWeight: 600, color: "#1f2937", background: "#fff", outline: "none" }}
                  value={totalAmount > 0 ? totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ""}
                />
              </div>
            </div>
          </div>

          <input
            id={`expense-image-${activeTab.id}`}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => handleAttachmentSelection(event, "image")}
          />
          <input
            id={`expense-document-${activeTab.id}`}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
            hidden
            onChange={(event) => handleAttachmentSelection(event, "document")}
          />
        </div>
      </div>

      <div style={{ background: "#fff", flexShrink: 0, padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, borderTop: "1px solid #e5e7eb" }}>
        <div style={{ fontSize: 12, color: "#b91c1c", minHeight: 16 }}>
          {saveError}
        </div>
        <div style={{ display: "flex", border: "1px solid #d1d5db", borderRadius: 4, overflow: "hidden" }}>
          <button
            onClick={onShare}
            style={{ padding: "7px 20px", fontSize: 13, fontWeight: 500, color: "#374151", background: "#fff", border: "none", cursor: "pointer" }}
          >
            Share
          </button>
          <button style={{ padding: "7px 8px", fontSize: 13, color: "#6b7280", background: "#fff", border: "none", borderLeft: "1px solid #d1d5db", cursor: "pointer" }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>
        <button
          onClick={handleSaveExpense}
          disabled={isSaving}
          style={{ padding: "7px 32px", fontSize: 13, fontWeight: 700, color: "#fff", background: isSaving ? "#93c5fd" : "#2563eb", border: "none", borderRadius: 4, cursor: isSaving ? "not-allowed" : "pointer", boxShadow: "0 1px 4px rgba(37,99,235,0.3)" }}
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}