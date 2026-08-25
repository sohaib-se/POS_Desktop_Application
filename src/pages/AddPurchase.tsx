import { useState, useRef, useCallback, useEffect } from "react";
import type { PurchaseBillEditData } from "@/types";
import { PurchaseTabBar } from "@/components/pagescomponents/addpurchase/PurchaseTabBar";
import { PurchaseTopBar } from "@/components/pagescomponents/addpurchase/PurchaseTopBar";
import { CustomerSearchAndInvoice } from "@/components/pagescomponents/addpurchase/CustomerSearchAndInvoice";
import { PurchaseTable } from "@/components/pagescomponents/addpurchase/PurchaseTable";
import { PurchaseBottomSection } from "@/components/pagescomponents/addpurchase/PurchaseBottomSection";
import { PurchaseFooter } from "@/components/pagescomponents/addpurchase/PurchaseFooter";
import type {
  PurchaseRow,
  PurchaseTab,
  PartyOption,
  ItemOption,
  BankOption,
} from "@/components/pagescomponents/addpurchase/types";
import { AddPartyDialog } from "@/components/pagescomponents/parties/AddPartyDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/Toast";

interface AddPurchaseProps {
  onSave?: () => void;
  onShare?: () => void;
  onClose?: () => void;
  initialInvoice?: PurchaseBillEditData | null;
}

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
      { id: 1, itemId: "", item: "", qty: "", unit: "NONE", pricePerUnit: "" },
      { id: 2, itemId: "", item: "", qty: "", unit: "NONE", pricePerUnit: "" },
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
    paid: "",
    paidAll: false,
    paymentType: "Cash",
  };
}

function createEmptyRow(): PurchaseRow {
  return { id: globalRowId++, itemId: "", item: "", qty: "", unit: "NONE", pricePerUnit: "" };
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
  const [banks, setBanks] = useState<BankOption[]>([]);
  const [nextInvoiceNo, setNextInvoiceNo] = useState("1");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const documentInputRef = useRef<HTMLInputElement | null>(null);

  const [showAddParty, setShowAddParty] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [tabClosePendingId, setTabClosePendingId] = useState<number | null>(null);
  const [partyBeingEdited, setPartyBeingEdited] = useState<any>(null);
  const [activeTabParty, setActiveTabParty] = useState<"address" | "credit">("address");
  const [showShippingAddress, setShowShippingAddress] = useState(false);
  const [isSavingParty, setIsSavingParty] = useState(false);
  const [showCreditLimitError, setShowCreditLimitError] = useState(false);
  const [partyForm, setPartyForm] = useState({
    name: "", phoneNumber: "", email: "", billingAddress: "", shippingAddress: "",
    openingBalance: "", asOfDate: new Date().toLocaleDateString("en-IN"),
    balanceType: "to-pay" as "to-pay" | "to-receive",
    creditLimit: "no-limit" as "no-limit" | "custom", creditLimitAmount: "",
  });

  const resetPartyForm = () => {
    setPartyForm({
      name: "", phoneNumber: "", email: "", billingAddress: "", shippingAddress: "",
      openingBalance: "", asOfDate: new Date().toLocaleDateString("en-IN"),
      balanceType: "to-pay", creditLimit: "no-limit", creditLimitAmount: "",
    });
    setActiveTabParty("address");
  };

  const fetchParties = async () => {
    try {
      const res = await fetch("/api/parties");
      if (res.ok) {
        const data = await res.json();
        const sortedParties = data.sort((a: any, b: any) => a.name.localeCompare(b.name));
        setParties(sortedParties);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveParty = async () => {
    setIsSavingParty(true);
    try {
      const payload = {
        name: partyForm.name,
        phone: partyForm.phoneNumber,
        email: partyForm.email || null,
        address: partyForm.billingAddress || null,
        shippingAddress: partyForm.shippingAddress || null,
        balance: (Number(partyForm.openingBalance) || 0) * (partyForm.balanceType === "to-pay" ? -1 : 1),
        creditLimit: partyForm.creditLimit === "custom" ? Number(partyForm.creditLimitAmount) : null,
        type: "supplier"
      };
      const response = await fetch("/api/parties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const newParty = await response.json();
        if (newParty) {
          setParties((prev) => {
            const exists = prev.find(p => p.id === newParty.id);
            return exists ? prev : [...prev, newParty].sort((a, b) => a.name.localeCompare(b.name));
          });
        }
        setShowAddParty(false);
        resetPartyForm();
        if (newParty && newParty.id) {
          updateTab({ customerSearch: String(newParty.id), phoneNo: newParty.phone ?? "" });
        }
        fetchParties();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingParty(false);
    }
  };

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
              qty: String(Math.max(0, lineItem.quantity ?? 1)),
              unit: lineItem.unit ?? "NONE",
              pricePerUnit: String(Math.max(0, lineItem.price ?? 0)),
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
        paid: initialInvoice.balance !== undefined && initialInvoice.amount !== undefined ? String(Number(initialInvoice.amount) - Number(initialInvoice.balance)) : "",
        paidAll: initialInvoice.balance === 0,
        paymentType: String(initialInvoice.paymentMode || "Cash"),
      },
    ]);
    setActiveTabId(1);
    setSaveError("");
  }, [initialInvoice]);

  useEffect(() => {
    let cancelled = false;

    const loadLookupData = async () => {
      try {
        const [partiesResponse, itemsResponse, saleInvoicesResponse, banksResponse] = await Promise.all([
          fetch("/api/parties"),
          fetch("/api/items"),
          fetch("/api/purchase_bills"),
          fetch("/api/bank_accounts")
        ]);

        if (!partiesResponse.ok || !itemsResponse.ok || !saleInvoicesResponse.ok || !banksResponse.ok) {
          throw new Error("Failed to load purchase lookup data");
        }

        const loadedParties = (await partiesResponse.json()) as PartyOption[];
        const loadedItems = (await itemsResponse.json()) as ItemOption[];
        const purchaseBills = (await saleInvoicesResponse.json()) as Array<{ invoice_no?: string | null }>;
        const loadedBanks = (await banksResponse.json()) as BankOption[];

        if (cancelled) {
          return;
        }

        const sortedParties = [...loadedParties].sort((left, right) => left.name.localeCompare(right.name));
        setParties(sortedParties);
        setItems(loadedItems);
        setBanks(loadedBanks);
        setNextInvoiceNo(
          String(
            purchaseBills.reduce((highest, invoice) => {
              const invoiceNumber = Number(invoice.invoice_no ?? 0);
              return Number.isFinite(invoiceNumber) && invoiceNumber > highest ? invoiceNumber : highest;
            }, 0) + 1,
          ),
        );

      } catch (error) {
        console.error(error);
      }
    };

    void loadLookupData();

    return () => {
      cancelled = true;
    };
  }, []);

  // col widths: [#, ITEM, QTY, UNIT, PRICE/UNIT, AMOUNT]
  const { widths, startResize } = useColumnResize([42, 340, 90, 110, 130, 120]);

  const activeTab = tabs.find((t) => t.id === activeTabId)!;
  const displayedInvoiceNo = initialInvoice?.invoiceNo ?? nextInvoiceNo;
  const displayedInvoiceDate = initialInvoice?.date ?? formatDateForDisplay(new Date());

  const updateTab = (partial: Partial<PurchaseTab>) => {
    setTabs((prev) =>
      prev.map((t) => {
        if (t.id !== activeTabId) return t;

        const nextTab = { ...t, ...partial };

        if (partial.rows) {
          const nextTotalAmount = nextTab.rows.reduce(
            (s, r) => s + (parseFloat(r.qty) || 0) * (parseFloat(r.pricePerUnit) || 0),
            0
          );

          if (nextTab.discountPercent && parseFloat(nextTab.discountPercent) > 0) {
            const nextDiscountRs = (nextTotalAmount * parseFloat(nextTab.discountPercent)) / 100;
            nextTab.discountRs = nextTotalAmount > 0 ? nextDiscountRs.toFixed(2) : "";
          } else if (nextTab.discountRs && parseFloat(nextTab.discountRs) > 0) {
            const percentValue = nextTotalAmount > 0 ? (parseFloat(nextTab.discountRs) / nextTotalAmount) * 100 : 0;
            nextTab.discountPercent = nextTotalAmount > 0 ? percentValue.toFixed(2) : "";
          }
        }

        return nextTab;
      })
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
    const updatedRows = activeTab.rows.map((row) => {
      if (row.id !== rowId) {
        return row;
      }

      return {
        ...row,
        itemId,
        item: matchedItem?.name ?? "",
        unit: matchedItem?.primary_unit || matchedItem?.unit || row.unit,
        pricePerUnit:
          matchedItem && Number.isFinite(Number(matchedItem.purchase_price))
            ? String(Number(matchedItem.purchase_price ?? 0))
            : row.pricePerUnit,
        qty: "1",
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

    const paidAmountValue = Number(activeTab.paid || 0);
    const balanceValue = roundedValue - paidAmountValue;

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
          paymentType: activeTab.paymentType,
          paymentMode: paidAmountValue === 0 ? "credit" : (activeTab.paymentType === "Cash" ? "cash" : activeTab.paymentType),
          subtotal,
          discountPercent: Number(activeTab.discountPercent || 0),
          discountAmount: discountAmountValue,
          taxLabel: activeTab.tax,
          taxRate: taxRateValue,
          taxAmount: taxAmountValue,
          roundOff: activeTab.roundOff,
          roundOffAmount: roundOffAmountValue,
          amount: roundedValue,
          balance: balanceValue,
          description: activeTab.description,
          lineItems: validRows.map((row) => ({
            id: row.id,
            itemId: row.itemId,
            name: row.item,
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

      toast.success(isEditing ? "Purchase updated successfully!" : "Purchase saved successfully!");

      setTabs(prev => {
        const remaining = prev.filter(t => t.id !== activeTabId);
        if (remaining.length === 0) {
          setTimeout(() => { if (onClose) onClose(); }, 0);
          return prev;
        }
        setActiveTabId(remaining[remaining.length - 1].id);
        return remaining;
      });

      onSave?.();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save the purchase. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const hasUnsavedChanges = () => {
    return tabs.some(t =>
      t.customerSearch ||
      t.rows.some(r => r.item || r.qty || r.pricePerUnit) ||
      t.description ||
      t.discountPercent ||
      t.discountRs
    );
  };

  const handleCloseRequest = () => {
    if (hasUnsavedChanges()) {
      setShowDiscardDialog(true);
    } else {
      if (onClose) onClose();
    }
  };

  const addTab = () => {
    const id = globalTabId++;
    const newTab = createDefaultTab(id);
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(id);
  };

  const tabHasUnsavedChanges = (tab: PurchaseTab) =>
    !!(tab.customerSearch ||
      tab.rows.some(r => r.item || r.qty || r.pricePerUnit) ||
      tab.description ||
      tab.discountPercent ||
      tab.discountRs);

  const doCloseTab = (id: number) => {
    if (tabs.length === 1) {
      if (onClose) onClose();
      return;
    }
    setTabs((prev) => {
      const remaining = prev.filter((t) => t.id !== id);
      if (activeTabId === id) setActiveTabId(remaining[remaining.length - 1].id);
      return remaining;
    });
  };

  const closeTab = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const tab = tabs.find(t => t.id === id);
    if (tab && tabHasUnsavedChanges(tab)) {
      setTabClosePendingId(id);
    } else {
      doCloseTab(id);
    }
  };

  const updateRow = (rowId: number, field: keyof PurchaseRow, value: string) => {
    if ((field === "qty" || field === "pricePerUnit") && Number(value) < 0) return;

    const updatedRows = activeTab.rows.map((row) => {
      if (row.id !== rowId) return row;

      const updatedRow = { ...row, [field]: value };

      if (field === "unit" && updatedRow.itemId) {
        const matchedItem = items.find((item) => item.id === updatedRow.itemId);
        if (matchedItem && Number.isFinite(Number(matchedItem.purchase_price))) {
          const isSecondary = updatedRow.unit === matchedItem.secondary_unit;
          const convRate = Number(matchedItem.conversion_rate) || 1;
          const basePrice = Number(matchedItem.purchase_price);

          if (isSecondary && convRate > 0) {
            updatedRow.pricePerUnit = String(basePrice / convRate);
          } else {
            updatedRow.pricePerUnit = String(basePrice);
          }
        }
      }

      return updatedRow;
    });

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

  const removeRow = (rowId: number) => {
    updateTab({ rows: activeTab.rows.filter((r) => r.id !== rowId) });
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

  const computedBalance = roundedTotal - (Number(activeTab.paid) || 0);

  return (
    <>
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
        <PurchaseTabBar
        tabs={tabs}
        activeTabId={activeTabId}
        setActiveTabId={setActiveTabId}
        addTab={addTab}
        closeTab={closeTab}
        onClose={handleCloseRequest}
        parties={parties}
        displayedInvoiceNo={displayedInvoiceNo}
      />
      
      <PurchaseTopBar />

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 0 }}>
        <CustomerSearchAndInvoice
          activeTab={activeTab}
          parties={parties}
          setActiveTabCustomer={setActiveTabCustomer}
          updateTab={updateTab}
          displayedInvoiceNo={displayedInvoiceNo}
          displayedInvoiceDate={displayedInvoiceDate}
          setShowAddParty={setShowAddParty}
        />
        
        <PurchaseTable
          activeTab={activeTab}
          widths={widths}
          startResize={startResize}
          updateRowItem={updateRowItem}
          items={items}
          updateRow={updateRow}
          addRow={addRow}
          removeRow={removeRow}
          totalQty={totalQty}
          totalAmount={totalAmount}
          fmt={fmt}
        />
        
        <PurchaseBottomSection
          activeTab={activeTab}
          updateTab={updateTab}
          imageInputRef={imageInputRef}
          documentInputRef={documentInputRef}
          updateDiscountPercent={updateDiscountPercent}
          updateDiscountAmount={updateDiscountAmount}
          taxAmount={taxAmount}
          roundOffDiff={roundOffDiff}
          banks={banks}
          roundedTotal={roundedTotal}
          fmt={fmt}
          computedBalance={computedBalance}
          handleAttachmentSelection={handleAttachmentSelection}
        />
      </div>

      <PurchaseFooter
        saveError={saveError}
        onShare={onShare}
        handleSavePurchase={handleSavePurchase}
        isSaving={isSaving}
        initialInvoice={initialInvoice}
      />
      
      <AddPartyDialog
        showAddParty={showAddParty}
        setShowAddParty={setShowAddParty}
        partyBeingEdited={partyBeingEdited}
        setPartyBeingEdited={setPartyBeingEdited}
        resetPartyForm={resetPartyForm}
        partyForm={partyForm}
        setPartyForm={setPartyForm}
        activeTab={activeTabParty}
        setActiveTab={setActiveTabParty}
        showShippingAddress={showShippingAddress}
        setShowShippingAddress={setShowShippingAddress}
        handleSaveParty={handleSaveParty}
        isSavingParty={isSavingParty}
        partyPendingDelete={null}
        setPartyPendingDelete={() => {}}
        isDeletingParty={false}
        handleDeleteParty={async () => {}}
        showCreditLimitError={showCreditLimitError}
        setShowCreditLimitError={setShowCreditLimitError}
      />
    </div>

      <ConfirmDialog
        open={showDiscardDialog}
        title="Discard Changes?"
        message="You have unsaved changes. Are you sure you want to discard them? All unsaved changes will be lost."
        confirmLabel="Discard"
        cancelLabel="Cancel"
        confirmColor="#e53935"
        icon="warning"
        onConfirm={() => { setShowDiscardDialog(false); if (onClose) onClose(); }}
        onCancel={() => setShowDiscardDialog(false)}
      />

      <ConfirmDialog
        open={tabClosePendingId !== null}
        title="Discard Changes?"
        message="This tab has unsaved changes. Are you sure you want to close it?"
        confirmLabel="Discard"
        cancelLabel="Cancel"
        confirmColor="#e53935"
        icon="warning"
        onConfirm={() => { const id = tabClosePendingId!; setTabClosePendingId(null); doCloseTab(id); }}
        onCancel={() => setTabClosePendingId(null)}
      />
    </>
  );
}
