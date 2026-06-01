import { useState, useRef, useCallback, useEffect } from "react";
import type { PurchaseBillEditData } from "@/types";

interface PurchaseRow {
  id: number;
  itemId: string;
  item: string;
  size: string;
  qty: string;
  unit: string;
  pricePerUnit: string;
}

interface PurchaseTab {
  id: number;
  label: string;
  paymentMode: "credit" | "cash";
  customerSearch: string;
  phoneNo: string;
  rows: PurchaseRow[];
  discountPercent: string;
  discountRs: string;
  tax: string;
  roundOff: boolean;
  description: string;
  showDescriptionInput: boolean;
  imageDataUrl: string;
  imageFileName: string;
  documentDataUrl: string;
  documentFileName: string;
}

interface PartyOption {
  id: number;
  name: string;
  phone: string;
  balance: number;
  type: "customer" | "supplier" | "both";
}

interface ItemOption {
  id: string;
  name: string;
  purchase_price?: number;
  unit: string;
  batch_json?: string | null;
}

interface AddPurchaseProps {
  onSave?: () => void;
  onShare?: () => void;
  onClose?: () => void;
  initialInvoice?: PurchaseBillEditData | null;
}

const unitOptions = [
  "NONE", "PCS", "KG", "G", "L", "ML", "M", "CM", "MM",
  "DOZEN", "BOX", "PACK", "BAG", "BOTTLE", "CAN", "SET",
];
const taxOptions = ["NONE", "GST 5%", "GST 12%", "GST 18%", "GST 28%"];

let globalRowId = 3;
let globalTabId = 2;

function createDefaultTab(id: number): PurchaseTab {
  return {
    id,
    label: `Purchase #${id}`,
    paymentMode: "credit",
    customerSearch: "",
    phoneNo: "",
    rows: [
      { id: 1, itemId: "", item: "", size: "", qty: "", unit: "NONE", pricePerUnit: "" },
      { id: 2, itemId: "", item: "", size: "", qty: "", unit: "NONE", pricePerUnit: "" },
    ],
    discountPercent: "",
    discountRs: "",
    tax: "NONE",
    roundOff: true,
    description: "",
    showDescriptionInput: false,
    imageDataUrl: "",
    imageFileName: "",
    documentDataUrl: "",
    documentFileName: "",
  };
}

function createEmptyRow(): PurchaseRow {
  return { id: globalRowId++, itemId: "", item: "", size: "", qty: "", unit: "NONE", pricePerUnit: "" };
}

function parseTaxRate(tax: string) {
  if (tax === "NONE") {
    return 0;
  }

  return parseFloat(tax.replace(/[^0-9.]/g, "")) / 100;
}

function parseLineItems(lineItemsJson?: string | null) {
  if (!lineItemsJson) {
    return [] as Array<{
      id?: number;
      itemId?: string;
      name?: string;
      quantity?: number;
      unit?: string;
      price?: number;
      amount?: number;
    }>;
  }

  try {
    const parsedValue = JSON.parse(lineItemsJson) as unknown;
    if (!Array.isArray(parsedValue)) {
      return [] as Array<{
        id?: number;
        itemId?: string;
        name?: string;
        quantity?: number;
        unit?: string;
        price?: number;
        amount?: number;
      }>;
    }

    return parsedValue as Array<{
      id?: number;
      itemId?: string;
      name?: string;
      size?: string;
      quantity?: number;
      unit?: string;
      price?: number;
      amount?: number;
    }>;
  } catch {
    return [] as Array<{
      id?: number;
      itemId?: string;
      name?: string;
      quantity?: number;
      unit?: string;
      price?: number;
      amount?: number;
    }>;
  }
}

function formatDateForDisplay(date: Date) {
  return date.toLocaleDateString("en-GB");
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
      const newW = Math.max(50, resizing.current.startW + delta);
      setWidths((prev) => {
        const next = [...prev];
        next[resizing.current!.col] = newW;
        return next;
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

export function AddPurchase({ onSave, onShare, onClose, initialInvoice }: AddPurchaseProps) {
  const [tabs, setTabs] = useState<PurchaseTab[]>([createDefaultTab(1)]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [isOpenAnimated, setIsOpenAnimated] = useState(false);
  const [parties, setParties] = useState<PartyOption[]>([]);
  const [items, setItems] = useState<ItemOption[]>([]);
  const [nextInvoiceNo, setNextInvoiceNo] = useState("1");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const documentInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsOpenAnimated(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!initialInvoice) {
      setTabs([createDefaultTab(1)]);
      setActiveTabId(1);
      setSaveError("");
      setIsSaving(false);
      return;
    }

    const parsedRows = parseLineItems(initialInvoice.lineItemsJson);
    const paymentMode = String(initialInvoice.paymentMode ?? initialInvoice.paymentType ?? "Credit").toLowerCase() === "cash"
      ? "cash"
      : "credit";

    setTabs([
      {
        id: 1,
        label: `Purchase #${initialInvoice.invoiceNo}`,
        paymentMode,
        customerSearch: initialInvoice.partyId ?? "",
        phoneNo: initialInvoice.partyPhone ?? "",
        rows: parsedRows.length
          ? [
              ...parsedRows.map((lineItem) => ({
                id: globalRowId++,
                itemId: lineItem.itemId ?? "",
                item: lineItem.name ?? "",
                size: (lineItem as any).size ?? "",
                qty: String(lineItem.quantity ?? ""),
                unit: lineItem.unit ?? "NONE",
                pricePerUnit: String(lineItem.price ?? ""),
              })),
              createEmptyRow(),
            ]
          : [createEmptyRow(), createEmptyRow()],
        discountPercent: String(initialInvoice.discountPercent ?? ""),
        discountRs: String(initialInvoice.discountAmount ?? ""),
        tax: initialInvoice.taxLabel ?? "NONE",
        roundOff: Boolean(initialInvoice.roundOff),
        description: initialInvoice.description ?? "",
        showDescriptionInput: Boolean(initialInvoice.description),
        imageDataUrl: "",
        imageFileName: "",
        documentDataUrl: "",
        documentFileName: "",
      },
    ]);
    setActiveTabId(1);
    setSaveError("");
  }, [initialInvoice]);

  useEffect(() => {
    let cancelled = false;

    const loadLookupData = async () => {
      try {
        const [partiesResponse, itemsResponse, saleInvoicesResponse] = await Promise.all([
          fetch("/api/parties"),
          fetch("/api/items"),
          fetch("/api/purchase_bills"),
        ]);

        if (!partiesResponse.ok || !itemsResponse.ok || !saleInvoicesResponse.ok) {
          throw new Error("Failed to load purchase lookup data");
        }

        const loadedParties = (await partiesResponse.json()) as PartyOption[];
        const loadedItems = (await itemsResponse.json()) as ItemOption[];
        const purchaseBills = (await saleInvoicesResponse.json()) as Array<{ invoice_no?: string | null }>;

        if (cancelled) {
          return;
        }

        const sortedParties = [...loadedParties].sort((left, right) => left.name.localeCompare(right.name));
        setParties(sortedParties);
        setItems(loadedItems);
        setNextInvoiceNo(
          String(
            purchaseBills.reduce((highest, invoice) => {
              const invoiceNumber = Number(invoice.invoice_no ?? 0);
              return Number.isFinite(invoiceNumber) && invoiceNumber > highest ? invoiceNumber : highest;
            }, 0) + 1,
          ),
        );

        setTabs((previousTabs) => {
          if (!previousTabs.length || previousTabs[0].customerSearch) {
            return previousTabs;
          }

          const defaultParty = sortedParties[0];
          if (!defaultParty) {
            return previousTabs;
          }

          return previousTabs.map((tab) => ({
            ...tab,
            customerSearch: String(defaultParty.id),
            phoneNo: defaultParty.phone,
          }));
        });
      } catch (error) {
        console.error(error);
      }
    };

    void loadLookupData();

    return () => {
      cancelled = true;
    };
  }, []);

  function parseSizesFromBatchJson(batchJson?: string | null) {
    if (!batchJson) return [] as string[];
    try {
      const parsed = JSON.parse(batchJson);
      if (!Array.isArray(parsed)) return [] as string[];
      const sizes = parsed
        .map((b: any) => (b && (b.size ?? b.size_of_batch ?? b.batch_size) ? String(b.size ?? b.size_of_batch ?? b.batch_size) : ""))
        .filter(Boolean);
      return Array.from(new Set(sizes));
    } catch {
      return [] as string[];
    }
  }

  // col widths: [#, ITEM, QTY, UNIT, SIZE, PRICE/UNIT, AMOUNT]
  const { widths, startResize } = useColumnResize([42, 340, 90, 110, 90, 130, 120]);

  const activeTab = tabs.find((t) => t.id === activeTabId)!;
  const displayedInvoiceNo = initialInvoice?.invoiceNo ?? nextInvoiceNo;
  const displayedInvoiceDate = initialInvoice?.date ?? formatDateForDisplay(new Date());

  const updateTab = (partial: Partial<PurchaseTab>) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, ...partial } : t))
    );
  };

  const setActiveTabCustomer = (partyId: string) => {
    const matchedParty = parties.find((party) => String(party.id) === partyId);
    updateTab({
      customerSearch: partyId,
      phoneNo: matchedParty?.phone ?? "",
    });
  };

  const updateRowItem = (rowId: number, itemId: string) => {
    const matchedItem = items.find((item) => item.id === itemId);
    const availableSizes = parseSizesFromBatchJson(matchedItem?.batch_json ?? null);
    const updatedRows = activeTab.rows.map((row) => {
      if (row.id !== rowId) {
        return row;
      }

      return {
        ...row,
        itemId,
        item: matchedItem?.name ?? "",
        size: availableSizes.length ? availableSizes[0] : "",
        unit: matchedItem?.unit ?? row.unit,
        pricePerUnit:
          matchedItem && Number.isFinite(Number(matchedItem.purchase_price))
            ? String(Number(matchedItem.purchase_price ?? 0))
            : row.pricePerUnit,
      };
    });

    updateTab({ rows: updatedRows });
  };

  const updateDiscountPercent = (value: string) => {
    const percentValue = Number(value || 0);
    const nextDiscountAmount = Number.isFinite(percentValue)
      ? (totalAmount * percentValue) / 100
      : 0;

    updateTab({
      discountPercent: value,
      discountRs: totalAmount > 0 ? nextDiscountAmount.toFixed(2) : "",
    });
  };

  const updateDiscountAmount = (value: string) => {
    const amountValue = Number(value || 0);
    const percentValue = totalAmount > 0 ? (amountValue / totalAmount) * 100 : 0;

    updateTab({
      discountRs: value,
      discountPercent: Number.isFinite(percentValue) ? percentValue.toFixed(2) : "",
    });
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

  const handleSavePurchase = async () => {
    if (isSaving) {
      return;
    }

    const selectedParty = parties.find((party) => String(party.id) === activeTab.customerSearch) ?? parties[0];
    if (!selectedParty) {
      setSaveError("Add at least one party before saving the purchase.");
      return;
    }

    const validRows = activeTab.rows.filter((row) => row.item || row.qty || row.pricePerUnit);
    const subtotal = validRows.reduce(
      (sum, row) => sum + (Number(row.qty) || 0) * (Number(row.pricePerUnit) || 0),
      0,
    );
    const discountAmountValue = Number(activeTab.discountRs || 0);
    const taxRateValue = parseTaxRate(activeTab.tax);
    const taxAmountValue = subtotal * taxRateValue;
    const grandTotalValue = subtotal + taxAmountValue - discountAmountValue;
    const roundedValue = activeTab.roundOff ? Math.round(grandTotalValue) : grandTotalValue;
    const roundOffAmountValue = roundedValue - grandTotalValue;

    setSaveError("");
    setIsSaving(true);

    try {
      const isEditing = Boolean(initialInvoice);
      const response = await fetch(isEditing ? `/api/purchase_bills/${initialInvoice?.id}` : "/api/purchase_bills", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceNo: isEditing ? initialInvoice?.invoiceNo : nextInvoiceNo,
          date: displayedInvoiceDate,
          partyId: String(selectedParty.id),
          partyName: selectedParty.name,
          partyPhone: activeTab.phoneNo,
          paymentType: activeTab.paymentMode === "cash" ? "Cash" : "Credit",
          paymentMode: activeTab.paymentMode,
          subtotal,
          discountPercent: Number(activeTab.discountPercent || 0),
          discountAmount: discountAmountValue,
          taxLabel: activeTab.tax,
          taxRate: taxRateValue,
          taxAmount: taxAmountValue,
          roundOff: activeTab.roundOff,
          roundOffAmount: roundOffAmountValue,
          amount: roundedValue,
          balance: activeTab.paymentMode === "cash" ? 0 : roundedValue,
          description: activeTab.description,
          lineItems: validRows.map((row) => ({
            id: row.id,
            itemId: row.itemId,
            name: row.item,
            size: row.size,
            quantity: Number(row.qty) || 0,
            unit: row.unit,
            price: Number(row.pricePerUnit) || 0,
            amount: (Number(row.qty) || 0) * (Number(row.pricePerUnit) || 0),
          })),
          imageDataUrl: activeTab.imageDataUrl || null,
          imageFileName: activeTab.imageFileName || null,
          documentDataUrl: activeTab.documentDataUrl || null,
          documentFileName: activeTab.documentFileName || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save purchase");
      }

      const savedInvoice = (await response.json()) as { invoiceNo?: string };
      if (!isEditing && savedInvoice.invoiceNo) {
        setNextInvoiceNo(String(Number(savedInvoice.invoiceNo) + 1));
      } else if (!isEditing) {
        setNextInvoiceNo((previousInvoiceNo) => String(Number(previousInvoiceNo) + 1));
      }

      window.dispatchEvent(
        new CustomEvent("purchase-bills-refresh", {
          detail: {
            message: isEditing
              ? "Purchase bill updated successfully."
              : "Purchase bill saved successfully.",
          },
        }),
      );

      onSave?.();
      onClose?.();
    } catch (error) {
      console.error(error);
      setSaveError("Failed to save the purchase. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const addTab = () => {
    const id = globalTabId++;
    const newTab = createDefaultTab(id);
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(id);
  };

  const closeTab = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    setTabs((prev) => {
      const remaining = prev.filter((t) => t.id !== id);
      if (activeTabId === id) setActiveTabId(remaining[remaining.length - 1].id);
      return remaining;
    });
  };

  const updateRow = (rowId: number, field: keyof PurchaseRow, value: string) => {
    let updatedRows = activeTab.rows.map((row) =>
      row.id === rowId ? { ...row, [field]: value } : row
    );

    // Helper to check if a row is empty
    const isEmpty = (row: PurchaseRow) => !row.itemId && !row.item && !row.qty && !row.pricePerUnit;

    // Remove consecutive empty rows from the end, keeping exactly one
    while (updatedRows.length > 2 && isEmpty(updatedRows[updatedRows.length - 1])) {
      const secondLast = updatedRows[updatedRows.length - 2];
      if (isEmpty(secondLast)) {
        // If second-to-last is also empty, remove the last one
        updatedRows.pop();
      } else {
        // If second-to-last is NOT empty, keep one empty row and stop
        break;
      }
    }

    // Ensure there's at least one empty row at the end for input
    const lastRow = updatedRows[updatedRows.length - 1];
    if (!isEmpty(lastRow)) {
      // If last row is not empty, add a new empty row
      updatedRows.push(createEmptyRow());
    }

    updateTab({ rows: updatedRows });
  };

  const addRow = () => {
    updateTab({
      rows: [
        ...activeTab.rows,
        createEmptyRow(),
      ],
    });
  };

  const totalQty = activeTab.rows.reduce((s, r) => s + (parseFloat(r.qty) || 0), 0);
  const totalAmount = activeTab.rows.reduce(
    (s, r) => s + (parseFloat(r.qty) || 0) * (parseFloat(r.pricePerUnit) || 0), 0
  );
  const taxRate = parseTaxRate(activeTab.tax);
  const taxAmount = totalAmount * taxRate;
  const discountAmount = activeTab.discountRs ? parseFloat(activeTab.discountRs) : 0;
  const grandTotal = totalAmount + taxAmount - discountAmount;
  const roundedTotal = activeTab.roundOff ? Math.round(grandTotal) : grandTotal;
  const roundOffDiff = roundedTotal - grandTotal;

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const showSizeColumn = activeTab.rows.some((r) => {
    const item = items.find((it) => it.id === r.itemId);
    const sizes = parseSizesFromBatchJson(item?.batch_json ?? null);
    return sizes.length > 1;
  });

  // Resize handle between columns
  const ResizeHandle = ({ col }: { col: number }) => (
    <div
      onMouseDown={(e) => startResize(col, e)}
      style={{
        position: "absolute", right: 0, top: 0,
        width: 6, height: "100%", cursor: "col-resize",
        display: "flex", alignItems: "center", justifyContent: "center",
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

      {/* ── TAB BAR ── */}
      <div style={{ background: "#c4d3de", display: "flex", alignItems: "flex-end", padding: "2px 10px 0 10px", gap: 4, flexShrink: 0 }}>
        {tabs.map((tab) => {
          const active = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "7px 20px",
                background: active ? "#fff" : "#d4dfe9",
                color: active ? "#1f2937" : "#6b7280",
                fontWeight: active ? 500 : 400,
                fontSize: 13,
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
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
                  <span
                    style={{
                      position: "absolute",
                      left: -10,
                      bottom: 0,
                      width: 10,
                      height: 10,
                      borderBottomRightRadius: 10,
                      boxShadow: "5px 5px 0 5px #fff",
                      pointerEvents: "none",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      right: -10,
                      bottom: 0,
                      width: 10,
                      height: 10,
                      borderBottomLeftRadius: 10,
                      boxShadow: "-5px 5px 0 5px #fff",
                      pointerEvents: "none",
                    }}
                  />
                </>
              )}
              <span>{tab.label}</span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => closeTab(tab.id, e)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    padding: "2px 6px", borderRadius: 4,
                    color: "#9ca3af", fontSize: 12, lineHeight: 1,
                    display: "flex", alignItems: "center",
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
          title="New Purchase"
          style={{
            marginBottom: 0, marginLeft: 4, width: 26, height: 26, borderRadius: "50%",
            background: "#3b82f6", color: "#fff", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 300, alignSelf: "center", flexShrink: 0,
            boxShadow: "0 1px 4px rgba(59,130,246,0.4)",
          }}
        >
          +
        </button>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close add purchase"
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

      {/* ── TOP BAR (Sale / Credit+Cash / Lite Mode) ── */}
      <div style={{ background: "#fff", flexShrink: 0, padding: "8px 20px", display: "flex", alignItems: "center", gap: 20, borderBottom: "1px solid #e5e7eb" }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#1f2937" }}>Purchase</span>

        {/* Credit ← toggle → Cash */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            onClick={() => updateTab({ paymentMode: "credit" })}
            style={{ fontSize: 13, fontWeight: 500, cursor: "pointer", userSelect: "none", color: activeTab.paymentMode === "credit" ? "#2563eb" : "#9ca3af" }}
          >Credit</span>
          <button
            onClick={() => updateTab({ paymentMode: activeTab.paymentMode === "credit" ? "cash" : "credit" })}
            style={{
              width: 38, height: 20, borderRadius: 10, border: "none", cursor: "pointer",
              background: "#2563eb", position: "relative", padding: 0, flexShrink: 0,
            }}
          >
            <span style={{
              position: "absolute", top: 2, width: 16, height: 16, borderRadius: "50%",
              background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              transition: "left 0.15s",
              left: activeTab.paymentMode === "cash" ? 20 : 2,
            }} />
          </button>
          <span
            onClick={() => updateTab({ paymentMode: "cash" })}
            style={{ fontSize: 13, fontWeight: 500, cursor: "pointer", userSelect: "none", color: activeTab.paymentMode === "cash" ? "#2563eb" : "#9ca3af" }}
          >Cash</span>
        </div>

      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 0 }}>

        {/* Customer Search + Invoice */}
        <div style={{ background: "#fff", padding: "25px 20px 80px 20px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ position: "relative" }}>
                <select
                  style={{ appearance: "none", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13, color: "#6b7280", background: "#fff", padding: "7px 32px 7px 12px", minWidth: 210, cursor: "pointer" }}
                  value={activeTab.customerSearch}
                  onChange={(e) => setActiveTabCustomer(e.target.value)}
                >
                  <option value="">Select Party</option>
                  {parties.map((party) => (
                    <option key={party.id} value={party.id}>
                      {party.name}
                    </option>
                  ))}
                </select>
                <span
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    color: "#9ca3af",
                  }}
                >
                  ▾
                </span>
              </div>
              <input
                type="text"
                placeholder="Phone No."
                style={{ border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13, color: "#6b7280", padding: "7px 12px", width: 150 }}
                value={activeTab.phoneNo}
                onChange={(e) => updateTab({ phoneNo: e.target.value })}
              />
            </div>

            <div style={{ fontSize: 13, textAlign: "right", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, marginBottom: 8 }}>
                <span style={{ color: "#6b7280" }}>Invoice Number</span>
                <span style={{ fontWeight: 600, color: "#1f2937" }}>{displayedInvoiceNo}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
                <span style={{ color: "#6b7280" }}>Invoice Date</span>
                <span style={{ fontWeight: 600, color: "#1f2937" }}>{displayedInvoiceDate}</span>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "#3b82f6", padding: 0 }}>
                  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── TABLE ── */}
        <div style={{ background: "#fff", paddingBottom: 80 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: widths[0] }} />
              <col style={{ width: widths[1] }} />
              <col style={{ width: widths[2] }} />
              <col style={{ width: widths[3] }} />
              <col style={{ width: widths[4] }} />
              <col style={{ width: widths[5] }} />
              <col style={{ width: widths[6] }} />
              <col style={{ width: 36 }} />
            </colgroup>
            <thead>
              <tr style={{ background: "#f3f6f9", borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb" }}>
                {/* # */}
                <th style={{ position: "relative", padding: "8px 0", textAlign: "center", fontSize: 12, fontWeight: 600, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
                  #<ResizeHandle col={0} />
                </th>
                {/* ITEM */}
                <th style={{ position: "relative", padding: "8px 10px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
                  ITEM<ResizeHandle col={1} />
                </th>
                {/* QTY */}
                <th style={{ position: "relative", padding: "8px 10px", textAlign: "right", fontSize: 12, fontWeight: 600, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
                  QTY<ResizeHandle col={2} />
                </th>
                {/* UNIT */}
                <th style={{ position: "relative", padding: "8px 10px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
                  UNIT<ResizeHandle col={3} />
                </th>
                <th style={{ position: "relative", padding: "8px 10px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
                  {showSizeColumn ? "SIZE" : ""}<ResizeHandle col={4} />
                </th>
                {/* PRICE/UNIT */}
                <th style={{ position: "relative", padding: "8px 10px", textAlign: "right", fontSize: 12, fontWeight: 600, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
                  PRICE/UNIT<ResizeHandle col={5} />
                </th>
                {/* AMOUNT */}
                <th style={{ position: "relative", padding: "8px 10px", textAlign: "right", fontSize: 12, fontWeight: 600, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
                  AMOUNT<ResizeHandle col={6} />
                </th>
                {/* + col */}
                <th style={{ padding: "8px 6px", textAlign: "center", background: "#f3f6f9" }}>
                  <button style={{ background: "none", border: "none", cursor: "pointer", color: "#3b82f6", padding: 0, display: "flex", alignItems: "center" }}>
                    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" /></svg>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {activeTab.rows.map((row, idx) => {
                const amount = (parseFloat(row.qty) || 0) * (parseFloat(row.pricePerUnit) || 0);
                return (
                  <tr key={row.id} style={{ borderBottom: "1px solid #f0f0f0" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fbff")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                  >
                    {/* # */}
                    <td style={{ textAlign: "center", color: "#9ca3af", fontSize: 13, padding: "5px 0", borderRight: "1px solid #e5e7eb" }}>
                      {idx + 1}
                    </td>
                    {/* ITEM */}
                    <td style={{ borderRight: "1px solid #e5e7eb", padding: "4px 8px" }}>
                      <select
                        style={{ width: "100%", border: "none", outline: "none", fontSize: 13, color: "#374151", background: "transparent", appearance: "none", cursor: "pointer" }}
                        value={row.itemId}
                        onChange={(e) => updateRowItem(row.id, e.target.value)}
                      >
                        <option value="">Select Item</option>
                        {items.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    {/* QTY */}
                    <td style={{ borderRight: "1px solid #e5e7eb", padding: "4px 8px" }}>
                      <input type="number"
                        style={{ width: "100%", border: "none", outline: "none", fontSize: 13, color: "#374151", background: "transparent", textAlign: "right" }}
                        value={row.qty}
                        onChange={(e) => updateRow(row.id, "qty", e.target.value)}
                      />
                    </td>
                    {/* UNIT */}
                    <td style={{ borderRight: "1px solid #e5e7eb", padding: "4px 8px" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <select
                          style={{ flex: 1, border: "none", outline: "none", fontSize: 13, color: "#374151", background: "transparent", appearance: "none", cursor: "pointer" }}
                          value={row.unit}
                          onChange={(e) => updateRow(row.id, "unit", e.target.value)}
                        >
                          {unitOptions.map((u) => <option key={u} value={u}>{u}</option>)}
                        </select>
                        <span style={{ color: "#9ca3af", fontSize: 10, pointerEvents: "none" }}>▾</span>
                      </div>
                    </td>
                    {/* SIZE */}
                    <td style={{ borderRight: "1px solid #e5e7eb", padding: "4px 8px" }}>
                      {showSizeColumn ? (
                        <select
                          style={{ width: "100%", border: "none", outline: "none", fontSize: 13, color: "#374151", background: "transparent", appearance: "none", cursor: "pointer" }}
                          value={row.size}
                          onChange={(e) => updateRow(row.id, "size", e.target.value)}
                        >
                          <option value="">Select Size</option>
                          {(() => {
                            const item = items.find((it) => it.id === row.itemId);
                            const sizes = parseSizesFromBatchJson(item?.batch_json ?? null);
                            return sizes.map((s) => <option key={s} value={s}>{s}</option>);
                          })()}
                        </select>
                      ) : null}
                    </td>
                    {/* PRICE/UNIT */}
                    <td style={{ borderRight: "1px solid #e5e7eb", padding: "4px 8px" }}>
                      <input type="number"
                        style={{ width: "100%", border: "none", outline: "none", fontSize: 13, color: "#374151", background: "transparent", textAlign: "right" }}
                        value={row.pricePerUnit}
                        onChange={(e) => updateRow(row.id, "pricePerUnit", e.target.value)}
                      />
                    </td>
                    {/* AMOUNT */}
                    <td style={{ borderRight: "1px solid #e5e7eb", padding: "4px 10px", textAlign: "right", fontSize: 13, color: "#374151" }}>
                      {amount > 0 ? fmt(amount) : ""}
                    </td>
                    <td />
                  </tr>
                );
              })}

              {/* TOTAL ROW */}
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
                <td colSpan={3} style={{ padding: "8px 10px", fontSize: 12, fontWeight: 700, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
                  <span style={{ float: "left" }}>TOTAL</span>
                  <span style={{ float: "right" }}>{totalQty > 0 ? totalQty : 0}</span>
                </td>
                <td style={{ borderRight: "1px solid #e5e7eb" }} />
                <td style={{ padding: "8px 10px", textAlign: "right", fontSize: 13, fontWeight: 600, color: "#374151", borderRight: "1px solid #e5e7eb" }}>
                  {totalAmount > 0 ? fmt(totalAmount) : "0"}
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── BOTTOM SECTION ── */}
        <div style={{ background: "#fff", padding: "20px 20px 24px 20px" }}>
          <div style={{ display: "flex", gap: 24 }}>

            {/* Left: attachments */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 170 }}>
              {activeTab.showDescriptionInput ? (
                <textarea
                  autoFocus rows={3}
                  placeholder="Add description..."
                  style={{ border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13, padding: "8px 10px", resize: "none", width: "100%", outline: "none" }}
                  value={activeTab.description}
                  onChange={(e) => updateTab({ description: e.target.value })}
                />
              ) : (
                <button onClick={() => updateTab({ showDescriptionInput: true })}
                  style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "#9ca3af", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", padding: 0 }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                  ADD DESCRIPTION
                </button>
              )}
              <button
                onClick={() => imageInputRef.current?.click()}
                style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "#9ca3af", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", padding: 0 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                ADD IMAGE
              </button>
              <button
                onClick={() => documentInputRef.current?.click()}
                style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "#9ca3af", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", padding: 0 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                ADD DOCUMENT
              </button>
              {activeTab.imageFileName && (
                <div style={{ fontSize: 12, color: "#6b7280" }}>Image: {activeTab.imageFileName}</div>
              )}
              {activeTab.documentFileName && (
                <div style={{ fontSize: 12, color: "#6b7280" }}>Document: {activeTab.documentFileName}</div>
              )}
            </div>

            {/* Right: totals */}
            <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", gap: 12, fontSize: 13, minWidth: 370 }}>

              {/* Discount */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                <span style={{ color: "#6b7280", width: 68, textAlign: "right" }}>Discount</span>
                <input type="number"
                  style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "5px 8px", width: 78, textAlign: "right", fontSize: 13, outline: "none" }}
                  value={activeTab.discountPercent}
                  onChange={(e) => updateDiscountPercent(e.target.value)}
                />
                <span style={{ color: "#9ca3af", fontSize: 12 }}>(%)</span>
                <span style={{ color: "#d1d5db", margin: "0 2px" }}>–</span>
                <input type="number"
                  style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "5px 8px", width: 100, textAlign: "right", fontSize: 13, outline: "none" }}
                  value={activeTab.discountRs}
                  onChange={(e) => updateDiscountAmount(e.target.value)}
                />
                <span style={{ color: "#9ca3af", fontSize: 12 }}>(Rs)</span>
              </div>

              {/* Tax */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                <span style={{ color: "#6b7280", width: 68, textAlign: "right" }}>Tax</span>
                <select
                  style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "5px 8px", width: 170, fontSize: 13, color: "#374151", background: "#fff", outline: "none" }}
                  value={activeTab.tax}
                  onChange={(e) => updateTab({ tax: e.target.value })}
                >
                  {taxOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <span style={{ color: "#374151", width: 62, textAlign: "right" }}>
                  {taxAmount > 0 ? taxAmount.toFixed(2) : "0"}
                </span>
              </div>

              {/* Round Off */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <input type="checkbox" checked={activeTab.roundOff}
                    onChange={(e) => updateTab({ roundOff: e.target.checked })}
                    style={{ width: 15, height: 15, accentColor: "#3b82f6", cursor: "pointer" }}
                  />
                  <span style={{ color: "#6b7280" }}>Round Off</span>
                </label>
                <input type="text" readOnly
                  style={{ border: "1px solid #e5e7eb", borderRadius: 4, padding: "5px 8px", width: 80, textAlign: "right", fontSize: 13, color: "#6b7280", background: "#f9fafb" }}
                  value={roundOffDiff !== 0 ? roundOffDiff.toFixed(2) : "0"}
                />
              </div>

              {/* Total */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                <span style={{ color: "#374151", fontWeight: 600, width: 68, textAlign: "right" }}>Total</span>
                <input type="text" readOnly
                  style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "5px 10px", width: 210, textAlign: "right", fontSize: 13, fontWeight: 600, color: "#1f2937", background: "#fff", outline: "none" }}
                  value={roundedTotal > 0 ? fmt(roundedTotal) : ""}
                />
              </div>
            </div>
          </div>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => handleAttachmentSelection(event, "image")}
          />
          <input
            ref={documentInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
            hidden
            onChange={(event) => handleAttachmentSelection(event, "document")}
          />
        </div>

      </div>{/* end scroll */}

      {/* ── FOOTER ── */}
      <div style={{ background: "#fff", flexShrink: 0, padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, borderTop: "1px solid #e5e7eb" }}>
        <div style={{ fontSize: 12, color: "#b91c1c", minHeight: 16 }}>
          {saveError}
        </div>
        <div style={{ display: "flex", border: "1px solid #d1d5db", borderRadius: 4, overflow: "hidden" }}>
          <button onClick={onShare}
            style={{ padding: "7px 20px", fontSize: 13, fontWeight: 500, color: "#374151", background: "#fff", border: "none", cursor: "pointer" }}>
            Share
          </button>
          <button style={{ padding: "7px 8px", fontSize: 13, color: "#6b7280", background: "#fff", border: "none", borderLeft: "1px solid #d1d5db", cursor: "pointer" }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
          </button>
        </div>
        <button onClick={handleSavePurchase}
          disabled={isSaving}
          style={{ padding: "7px 32px", fontSize: 13, fontWeight: 700, color: "#fff", background: isSaving ? "#93c5fd" : "#2563eb", border: "none", borderRadius: 4, cursor: isSaving ? "not-allowed" : "pointer", boxShadow: "0 1px 4px rgba(37,99,235,0.3)" }}>
          {isSaving ? "Saving..." : initialInvoice ? "Update" : "Save"}
        </button>
      </div>

    </div>
  );
}
