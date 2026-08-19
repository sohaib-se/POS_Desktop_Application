import { useState, useRef, useCallback, useEffect } from "react";
import type { SaleInvoiceEditData } from "@/types";
import type { BillPreviewSaleData } from "@/components/pagescomponents/previewbill/BillPreviewData";
import { AddSaleTabBar } from "@/components/pagescomponents/addsale/AddSaleTabBar";
import { AddSaleTopBar } from "@/components/pagescomponents/addsale/AddSaleTopBar";
import { AddSaleCustomerHeader } from "@/components/pagescomponents/addsale/AddSaleCustomerHeader";
import { AddSaleTable } from "@/components/pagescomponents/addsale/AddSaleTable";
import { AddSaleBottomActions } from "@/components/pagescomponents/addsale/AddSaleBottomActions";
import { BillPreviewPage } from "@/components/pagescomponents/previewbill/BillPreviewPage";
import { BarcodeScanModal } from "@/components/pagescomponents/addsale/BarcodeScanModal";
import { useSettings } from "@/hooks/useSettings";

export interface SaleRow {
  id: number;
  itemId: string;
  item: string;
  qty: string;
  unit: string;
  pricePerUnit: string;
}

export interface SaleTab {
  id: number;
  label: string;
  paymentMode: "credit" | "cash";
  customerSearch: string;
  phoneNo: string;
  invoiceDate?: string;
  rows: SaleRow[];
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
  received: string;
  receivedAll: boolean;
  isPreviewMode?: boolean;
  previewData?: BillPreviewSaleData;
}

export interface PartyOption {
  id: number;
  name: string;
  phone: string;
  balance: number;
  type: "customer" | "supplier" | "both";
  status?: 'active' | 'inactive';
}

export interface ItemOption {
  id: string;
  name: string;
  code?: string;
  sale_price?: number;
  unit: string;
  primary_unit?: string | null;
  secondary_unit?: string | null;
  conversion_rate?: number | null;
  mfg_date?: string | null;
  exp_date?: string | null;
  wholesale_price?: number;
  min_stock?: number | null;
  status?: 'active' | 'inactive';
  stock_quantity?: number;
}

interface AddSaleProps {
  onSave?: () => void;
  onShare?: () => void;
  onClose?: () => void;
  onPreview?: (data: BillPreviewSaleData) => void;
  initialInvoice?: SaleInvoiceEditData | null;
  isConversion?: boolean;
}


const taxOptions = ["NONE", "GST 5%", "GST 12%", "GST 18%", "GST 28%"];

let globalRowId = 3;
let globalTabId = 2;

function createDefaultTab(id: number): SaleTab {
  const isCashSaleByDefault = JSON.parse(localStorage.getItem('settings.isCashSaleByDefault') || 'false');
  return {
    id,
    label: `Sale #${id}`,
    paymentMode: isCashSaleByDefault ? "cash" : "credit",
    customerSearch: "",
    phoneNo: "",
    invoiceDate: formatDateForDisplay(new Date()),
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
    received: "",
    receivedAll: false,
  };
}
function createEmptyRow(): SaleRow {
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
      size?: string;
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
        size?: string;
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
      size?: string;
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

export function AddSale({ onSave, onShare, onClose, onPreview, initialInvoice, isConversion }: AddSaleProps) {
  const [tabs, setTabs] = useState<SaleTab[]>([createDefaultTab(1)]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [isOpenAnimated, setIsOpenAnimated] = useState(false);
  const [parties, setParties] = useState<PartyOption[]>([]);
  const [items, setItems] = useState<ItemOption[]>([]);
  const [nextInvoiceNo, setNextInvoiceNo] = useState("1");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [stopSaleOnNegativeStock] = useSettings('settings.stopSaleOnNegativeStock', false);
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
        label: isConversion ? `New Sale` : `Sale #${initialInvoice.invoiceNo}`,
        paymentMode,
        customerSearch: initialInvoice.partyId ?? initialInvoice.partyName ?? "",
        phoneNo: initialInvoice.partyPhone ?? "",
        invoiceDate: isConversion ? formatDateForDisplay(new Date()) : (initialInvoice.date ?? formatDateForDisplay(new Date())),
        rows: parsedRows.length
          ? [
            ...parsedRows.map((lineItem: any) => ({
              id: globalRowId++,
              itemId: lineItem.itemId ?? "",
              item: lineItem.item ?? lineItem.name ?? "",
              qty: String(lineItem.qty ?? lineItem.quantity ?? ""),
              unit: lineItem.unit ?? "NONE",
              pricePerUnit: String(lineItem.pricePerUnit ?? lineItem.price ?? ""),
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
        received: "",
        receivedAll: false,
        isPreviewMode: false,
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
          fetch("/api/sale_invoices"),
        ]);

        if (!partiesResponse.ok || !itemsResponse.ok || !saleInvoicesResponse.ok) {
          throw new Error("Failed to load sale lookup data");
        }

        const loadedParties = (await partiesResponse.json()) as PartyOption[];
        const loadedItems = (await itemsResponse.json()) as ItemOption[];
        const saleInvoices = (await saleInvoicesResponse.json()) as Array<{ invoice_no?: string | null }>;

        if (cancelled) {
          return;
        }

        const sortedParties = [...loadedParties].sort((left, right) => left.name.localeCompare(right.name));
        setParties(sortedParties);
        setItems(loadedItems);
        setNextInvoiceNo(
          String(
            saleInvoices.reduce((highest, invoice) => {
              const invoiceNumber = Number(invoice.invoice_no ?? 0);
              return Number.isFinite(invoiceNumber) && invoiceNumber > highest ? invoiceNumber : highest;
            }, 0) + 1,
          ),
        );

        setTabs((previousTabs) => {
          return previousTabs.map(tab => {
            let updatedCustomerSearch = tab.customerSearch;
            if (updatedCustomerSearch && !loadedParties.find(p => String(p.id) === updatedCustomerSearch)) {
              const matchedParty = loadedParties.find(p => p.name === updatedCustomerSearch);
              if (matchedParty) {
                updatedCustomerSearch = String(matchedParty.id);
              }
            }

            return {
              ...tab,
              customerSearch: updatedCustomerSearch,
              rows: tab.rows.map(row => {
                if (!row.itemId && row.item) {
                  const matchedItem = loadedItems.find(i => i.name === row.item);
                  if (matchedItem) {
                    return { ...row, itemId: String(matchedItem.id) };
                  }
                }
                return row;
              })
            };
          });
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

  // col widths: [#, ITEM, QTY, UNIT, PRICE/UNIT, AMOUNT]
  const { widths, startResize } = useColumnResize([42, 340, 90, 110, 130, 120]);

  const activeTab = tabs.find((t) => t.id === activeTabId)!;
  const displayedInvoiceNo = initialInvoice?.invoiceNo ?? nextInvoiceNo;
  const displayedInvoiceDate = activeTab.invoiceDate ?? (initialInvoice?.date ?? formatDateForDisplay(new Date()));


  const updateTab = (partial: Partial<SaleTab>) => {
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

    const updatedRows = activeTab.rows.map((row) => {
      if (row.id !== rowId) {
        return row;
      }

      const nextUnit = matchedItem
        ? matchedItem.primary_unit || matchedItem.unit || "NONE"
        : row.unit;

      let nextPricePerUnit = row.pricePerUnit;
      if (matchedItem && Number.isFinite(Number(matchedItem.sale_price))) {
        const qty = Number(row.qty) || 0;
        const isSecondary = nextUnit === matchedItem.secondary_unit;
        const convRate = Number(matchedItem.conversion_rate) || 1;
        const primaryQtyEquiv = isSecondary && convRate > 0 ? qty / convRate : qty;

        let basePrice = Number(matchedItem.sale_price);

        if (
          Number.isFinite(Number(matchedItem.min_stock)) &&
          Number(matchedItem.min_stock) > 0 &&
          primaryQtyEquiv >= Number(matchedItem.min_stock)
        ) {
          basePrice = Number(matchedItem.wholesale_price || matchedItem.sale_price);
        }

        if (isSecondary && convRate > 0) {
          nextPricePerUnit = String(basePrice / convRate);
        } else {
          nextPricePerUnit = String(basePrice);
        }
      }

      return {
        ...row,
        itemId,
        item: matchedItem?.name ?? "",
        unit: nextUnit,
        pricePerUnit: nextPricePerUnit,
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

  const handleSaveSale = async () => {
    if (isSaving) {
      return;
    }

    const isCredit = activeTab.paymentMode === "credit";
    const selectedParty = activeTab.customerSearch
      ? parties.find((party) => String(party.id) === activeTab.customerSearch)
      : null;

    if (isCredit && !selectedParty) {
      setSaveError("Please select a party for credit sale.");
      return;
    }

    const validRows = activeTab.rows.filter((row) => row.item || row.qty || row.pricePerUnit);

    if (stopSaleOnNegativeStock) {
      const itemQtyMap = new Map<string, number>();
      for (const row of validRows) {
        if (!row.itemId) continue;
        const item = items.find((i) => String(i.id) === row.itemId);
        if (!item) continue;

        const qty = Number(row.qty) || 0;
        const isSecondary = row.unit === item.secondary_unit;
        const convRate = Number(item.conversion_rate) || 1;
        const primaryQtyEquiv = isSecondary && convRate > 0 ? qty / convRate : qty;
        
        itemQtyMap.set(row.itemId, (itemQtyMap.get(row.itemId) || 0) + primaryQtyEquiv);
      }

      for (const [itemId, totalQty] of itemQtyMap.entries()) {
        const item = items.find((i) => String(i.id) === itemId);
        if (item) {
          const currentStock = item.stock_quantity || 0;
          if (totalQty > currentStock) {
            setSaveError(`Cannot sell ${totalQty} of ${item.name}. Current stock is only ${currentStock}.`);
            return;
          }
        }
      }
    }

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
      const isEditing = Boolean(initialInvoice) && !isConversion;
      const response = await fetch(isEditing ? `/api/sale_invoices/${initialInvoice?.id}` : "/api/sale_invoices", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceNo: isEditing ? initialInvoice?.invoiceNo : nextInvoiceNo,
          convertedFromEstimateId: isConversion ? initialInvoice?.id : undefined,
          date: activeTab.invoiceDate || displayedInvoiceDate,
          partyId: selectedParty ? String(selectedParty.id) : null,
          partyName: selectedParty ? selectedParty.name : "Cash Sale",
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
          balance: activeTab.paymentMode === "cash" ? 0 : Math.max(0, computedBalance),
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
        throw new Error("Failed to save sale");
      }

      const savedInvoice = (await response.json()) as { invoiceNo?: string; id?: string };
      if (!isEditing && savedInvoice.invoiceNo) {
        setNextInvoiceNo(String(Number(savedInvoice.invoiceNo) + 1));
      } else if (!isEditing) {
        setNextInvoiceNo((previousInvoiceNo) => String(Number(previousInvoiceNo) + 1));
      }

      window.dispatchEvent(
        new CustomEvent("sale-invoices-refresh", {
          detail: {
            message: isEditing
              ? "Sale invoice updated successfully."
              : "Sale invoice saved successfully.",
          },
        }),
      );

      onSave?.();

      // Build preview data from the current tab state and invoke the preview callback.
      if (onPreview) {
        const receivedAmt = activeTab.paymentMode === "cash"
          ? roundedValue
          : (activeTab.receivedAll ? roundedValue : parseFloat(activeTab.received) || 0);
        const balanceAmt = activeTab.paymentMode === "cash"
          ? 0
          : Math.max(0, roundedValue - receivedAmt);

        // Use the actual invoice number returned by the API — not the React state
        // variable (nextInvoiceNo at this point still holds the pre-bump value,
        // but savedInvoice.invoiceNo is the authoritative value from the server).
        const actualInvoiceNo = isEditing
          ? (initialInvoice?.invoiceNo ?? nextInvoiceNo)
          : (savedInvoice.invoiceNo ?? nextInvoiceNo);

        const previewData: BillPreviewSaleData = {
          invoiceNo: actualInvoiceNo,
          date: activeTab.invoiceDate || displayedInvoiceDate,
          partyName: selectedParty ? selectedParty.name : "Cash Sale",
          partyPhone: activeTab.phoneNo || null,
          paymentMode: activeTab.paymentMode,
          subtotal,
          discountPercent: Number(activeTab.discountPercent || 0),
          discountAmount: discountAmountValue,
          taxLabel: activeTab.tax,
          taxRate: taxRateValue,
          taxAmount: taxAmountValue,
          roundOff: activeTab.roundOff,
          roundOffAmount: roundOffAmountValue,
          grandTotal: roundedValue,
          received: receivedAmt,
          balance: balanceAmt,
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
        };
        updateTab({ isPreviewMode: true, previewData });
        return;
      }

      onClose?.();

    } catch (error) {
      console.error(error);
      setSaveError("Failed to save the sale. Please try again.");
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

  const updateRow = (rowId: number, field: keyof SaleRow, value: string) => {
    const updatedRows = activeTab.rows.map((row) => {
      if (row.id !== rowId) return row;

      const updatedRow = { ...row, [field]: value };

      if ((field === "unit" || field === "qty") && updatedRow.itemId) {
        const matchedItem = items.find((item) => item.id === updatedRow.itemId);
        if (matchedItem && Number.isFinite(Number(matchedItem.sale_price))) {
          const qty = Number(updatedRow.qty) || 0;
          const isSecondary = updatedRow.unit === matchedItem.secondary_unit;
          const convRate = Number(matchedItem.conversion_rate) || 1;
          const primaryQtyEquiv = isSecondary && convRate > 0 ? qty / convRate : qty;

          let basePrice = Number(matchedItem.sale_price);

          if (
            Number.isFinite(Number(matchedItem.min_stock)) &&
            Number(matchedItem.min_stock) > 0 &&
            primaryQtyEquiv >= Number(matchedItem.min_stock)
          ) {
            basePrice = Number(matchedItem.wholesale_price || matchedItem.sale_price);
          }

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
    const isEmpty = (row: SaleRow) => !row.itemId && !row.item && !row.qty && !row.pricePerUnit;

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

  const handleBarcodeModalSave = (newRows: Omit<SaleRow, "id">[]) => {
    // Filter out existing empty rows (keep non-empty ones)
    const existingNonEmpty = activeTab.rows.filter(
      (r) => r.itemId || r.item || r.qty || r.pricePerUnit
    );
    const scannedRows: SaleRow[] = newRows.map((r) => ({ ...r, id: globalRowId++ }));
    // Merge: for items already in table, increase qty; for new ones, append
    const merged = [...existingNonEmpty];
    for (const scanned of scannedRows) {
      const existingIdx = merged.findIndex((r) => r.itemId === scanned.itemId);
      if (existingIdx >= 0) {
        const existing = merged[existingIdx];
        const newQty = (parseFloat(existing.qty) || 0) + (parseFloat(scanned.qty) || 0);
        merged[existingIdx] = { ...existing, qty: String(newQty) };
      } else {
        merged.push(scanned);
      }
    }
    // Always have one trailing empty row
    merged.push(createEmptyRow());
    updateTab({ rows: merged });
    setShowBarcodeModal(false);
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

  const receivedValue = activeTab.receivedAll ? roundedTotal : parseFloat(activeTab.received) || 0;
  let computedBalance = 0;
  if (activeTab.paymentMode === "credit") {
    computedBalance = roundedTotal - receivedValue;
  }

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
      <AddSaleTabBar
        tabs={tabs}
        activeTabId={activeTabId}
        setActiveTabId={setActiveTabId}
        addTab={addTab}
        closeTab={closeTab}
        onClose={onClose}
      />

      {activeTab.isPreviewMode && activeTab.previewData ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <BillPreviewPage
            sale={activeTab.previewData}
            onClose={() => updateTab({ isPreviewMode: false })}
          />
        </div>
      ) : (
        <>
          <AddSaleTopBar
            activeTab={activeTab}
            updateTab={updateTab}
          />

          {/* ── SCROLLABLE CONTENT ── */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 0 }}>
            <AddSaleCustomerHeader
              activeTab={activeTab}
              parties={parties}
              setActiveTabCustomer={setActiveTabCustomer}
              updateTab={updateTab}
              displayedInvoiceNo={displayedInvoiceNo}
              displayedInvoiceDate={displayedInvoiceDate}
            />

            <AddSaleTable
              activeTab={activeTab}
              items={items}
              updateRowItem={updateRowItem}
              updateRow={updateRow}
              addRow={addRow}
              widths={widths}
              startResize={startResize}
              totalQty={totalQty}
              totalAmount={totalAmount}
              onBarcodeClick={() => setShowBarcodeModal(true)}
            />

            <AddSaleBottomActions
              activeTab={activeTab}
              updateTab={updateTab}
              updateDiscountPercent={updateDiscountPercent}
              updateDiscountAmount={updateDiscountAmount}
              imageInputRef={imageInputRef}
              documentInputRef={documentInputRef}
              handleAttachmentSelection={handleAttachmentSelection}
              taxOptions={taxOptions}
              taxAmount={taxAmount}
              roundOffDiff={roundOffDiff}
              roundedTotal={roundedTotal}
              computedBalance={computedBalance}
              saveError={saveError}
              isSaving={isSaving}
              handleSaveSale={handleSaveSale}
              onShare={onShare}
              isEditing={Boolean(initialInvoice)}
            />
          </div>{/* end scroll */}
        </>
      )}

      {/* Barcode Scan Modal */}
      {showBarcodeModal && (
        <BarcodeScanModal
          items={items}
          onSave={handleBarcodeModalSave}
          onClose={() => setShowBarcodeModal(false)}
        />
      )}
    </div>
  );
}