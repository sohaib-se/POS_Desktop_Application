import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { PosTab, PosRow, PartyOption, ItemOption, BankOption } from "../components/pagescomponents/laimsoftpos/types";
import type { SaleInvoiceEditData } from "@/types";
import { TopHeaderBar } from "../components/pagescomponents/laimsoftpos/TopHeaderBar";
import { SearchInput } from "../components/pagescomponents/laimsoftpos/SearchInput";
import { PosTable } from "../components/pagescomponents/laimsoftpos/PosTable";
import { ActionButtons } from "../components/pagescomponents/laimsoftpos/ActionButtons";
import { RightPanel } from "../components/pagescomponents/laimsoftpos/RightPanel";
import { Modals } from "../components/pagescomponents/laimsoftpos/Modals";
import { ConfirmActionModal } from "@/components/common/ConfirmActionModal";
import { useSettings } from "@/hooks/useSettings";
import { AddPartyDialog } from "../components/pagescomponents/parties/AddPartyDialog";
import {
  type SalePrintData,
  useCompanyInfo,
  InvoiceThemeContent,
} from "../components/pagescomponents/settings/tabs/PrintTab";

interface LaimsoftPosProps {
  onClose?: () => void;
  initialInvoice?: SaleInvoiceEditData | null;
}

export interface SavedSaleRecord {
  id: string;
  invoiceNo: string;
  date: string;
  partyName: string;
  partyId?: string | null;
  partyPhone?: string | null;
  paymentMode?: string | null;
  paymentType?: string | null;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  amount: number;
  balance: number;
  description?: string | null;
  lineItemsJson?: string | null;
  createdAt?: string;
}

let globalRowId = 1;
let globalTabId = 1;

function createEmptyTab(invoiceNo: string): PosTab {
  const isCashSaleByDefault = JSON.parse(localStorage.getItem('settings.isCashSaleByDefault') || 'false');
  return {
    id: globalTabId++,
    invoiceNo,
    date: new Date().toISOString().split("T")[0],
    rows: [],
    paymentMode: "Cash",
    amountReceived: "0.00",
    isAmountReceivedDirty: false,
    customerSelectedId: null,
    customerSearchText: isCashSaleByDefault ? "Cash Sale" : "",
    searchQuery: "",
    selectedRowId: null,
    discountPercent: "",
    discountAmount: "",
    description: "",
    editingInvoiceId: null,
    draftSnapshot: null,
  };
}

export function LaimsoftPos({ onClose, initialInvoice }: LaimsoftPosProps) {
  const [parties, setParties] = useState<PartyOption[]>([]);
  const [items, setItems] = useState<ItemOption[]>([]);
  const [banks, setBanks] = useState<BankOption[]>([]);
  const [savedSales, setSavedSales] = useState<SavedSaleRecord[]>([]);
  const [nextInvoiceNo, setNextInvoiceNo] = useState("1");
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [alertState, setAlertState] = useState<{ isOpen: boolean; title: string; message: string }>({ isOpen: false, title: "", message: "" });
  const [confirmCloseState, setConfirmCloseState] = useState<{ isOpen: boolean; type: 'tab' | 'all'; tabId?: number }>({ isOpen: false, type: 'tab' });
  const initialInvoiceLoadedRef = useRef(false);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Tabs State
  const [tabs, setTabs] = useState<PosTab[]>([createEmptyTab("1")]);
  const [activeTabId, setActiveTabId] = useState<number>(tabs[0].id);

  // Search Dropdown State
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchSelectedIndex, setSearchSelectedIndex] = useState(0);


  // Modals State
  const [activeModal, setActiveModal] = useState<
    "quantity" | "unit" | "discount" | "description" | "no_selection" | null
  >(null);

  // Modal Local States
  const [modalQuantity, setModalQuantity] = useState("");
  const [modalUnit, setModalUnit] = useState("");
  const [modalDiscountPercent, setModalDiscountPercent] = useState("");
  const [modalDiscountAmount, setModalDiscountAmount] = useState("");
  const [modalDescription, setModalDescription] = useState("");
  const [stopSaleOnNegativeStock] = useSettings('settings.stopSaleOnNegativeStock', false);

  // Add Party State
  const [showAddParty, setShowAddParty] = useState(false);
  const [showCreditLimitError, setShowCreditLimitError] = useState(false);
  const [isSavingParty, setIsSavingParty] = useState(false);
  const [activePartyTab, setActivePartyTab] = useState<"address" | "credit">("address");
  const [showShippingAddress, setShowShippingAddress] = useState(false);
  const [partyForm, setPartyForm] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    billingAddress: "",
    shippingAddress: "",
    openingBalance: "",
    asOfDate: new Date().toLocaleDateString("en-IN"),
    balanceType: "to-receive" as "to-pay" | "to-receive",
    creditLimit: "no-limit" as "no-limit" | "custom",
    creditLimitAmount: "",
  });

  const resetPartyForm = () => {
    setPartyForm({
      name: "",
      phoneNumber: "",
      email: "",
      billingAddress: "",
      shippingAddress: "",
      openingBalance: "",
      asOfDate: new Date().toLocaleDateString("en-IN"),
      balanceType: "to-receive",
      creditLimit: "no-limit",
      creditLimitAmount: "",
    });
    setActivePartyTab("address");
  };

  const handleSaveParty = async (options?: { closeDialog?: boolean; resetForm?: boolean }) => {
    if (!partyForm.name.trim() || isSavingParty) return;

    if (partyForm.creditLimit === 'custom' && partyForm.creditLimitAmount && partyForm.balanceType === 'to-receive') {
      const openingBalance = Number(partyForm.openingBalance || 0);
      const creditLimitAmount = Number(partyForm.creditLimitAmount || 0);
      if (Math.abs(openingBalance) > creditLimitAmount) {
        setShowCreditLimitError(true);
        return;
      }
    }

    const shouldCloseDialog = options?.closeDialog ?? true;
    const shouldResetForm = options?.resetForm ?? true;
    setIsSavingParty(true);
    
    try {
      const openingBalance = Number(partyForm.openingBalance || 0);
      const balance = Number.isFinite(openingBalance)
        ? partyForm.balanceType === 'to-pay'
          ? -Math.abs(openingBalance)
          : Math.abs(openingBalance)
        : 0;

      const response = await fetch('/api/parties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: partyForm.name,
          phone: partyForm.phoneNumber,
          email: partyForm.email,
          address: partyForm.billingAddress,
          shippingAddress: partyForm.shippingAddress,
          balance,
          creditLimit: partyForm.creditLimit === 'custom' ? Number(partyForm.creditLimitAmount) : null,
          asOfDate: partyForm.asOfDate,
          type: 'customer',
        }),
      });

      if (!response.ok) throw new Error('Failed to save party');

      const createdParty = await response.json();

      const normalizedParty: PartyOption = {
        id: createdParty.id,
        name: createdParty.name,
        phone: createdParty.phone || "",
        balance: Number(createdParty.balance ?? 0),
        type: createdParty.type || "customer",
      };

      setParties((prev) => [...prev, normalizedParty].sort((a, b) => a.name.localeCompare(b.name)));
      
      updateTab({
          customerSelectedId: normalizedParty.id,
          customerSearchText: normalizedParty.name,
      });

      showToast(`Party ${normalizedParty.name} added successfully!`, "success");

      if (shouldResetForm) resetPartyForm();
      if (shouldCloseDialog) setShowAddParty(false);

    } catch (error) {
      console.error(error);
      showToast("Failed to save party. Please try again.", "error");
    } finally {
      setIsSavingParty(false);
    }
  };

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isScanSuccess, setIsScanSuccess] = useState(false);
  const scanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressDropdownRef = useRef(false);
  const lastScanRef = useRef<{ code: string; time: number } | null>(null);

  const companyInfo = useCompanyInfo();
  const [directPrintSale, setDirectPrintSale] = useState<SalePrintData | null>(null);

  useEffect(() => {
    return () => {
      if (scanTimerRef.current) {
        clearTimeout(scanTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setIsScanSuccess(false);
    if (scanTimerRef.current) {
      clearTimeout(scanTimerRef.current);
    }
  }, [activeTabId]);

  useEffect(() => {
    if (!directPrintSale) return;

    const activePrinter = (localStorage.getItem("print_activePrinter") as "regular" | "thermal") || "regular";
    const isThermal = activePrinter === "thermal";

    const timer = setTimeout(() => {
      const invoiceEl = document.querySelector("#pos-direct-print-container .pos-print-content") as HTMLElement | null;
      if (!invoiceEl) {
        window.print();
        setDirectPrintSale(null);
        return;
      }

      const printContainer = document.createElement("div");
      printContainer.id = "__pos_invoice_print_only__";
      const clone = invoiceEl.cloneNode(true) as HTMLElement;
      clone.style.zoom = "1";
      clone.style.transform = "none";
      clone.style.transformOrigin = "unset";
      clone.style.width = isThermal ? "380px" : "900px";
      printContainer.appendChild(clone);
      document.body.appendChild(printContainer);

      const styleEl = document.createElement("style");
      styleEl.id = "__pos_invoice_print_style__";
      styleEl.textContent = `
        @media print {
          @page {
            size: auto;
            margin: ${isThermal ? "2mm" : "10mm"};
          }
          body > *:not(#__pos_invoice_print_only__) {
            display: none !important;
          }
          #__pos_invoice_print_only__ {
            display: block !important;
            visibility: visible !important;
            position: static !important;
            margin: 0 auto !important;
            padding: 0 !important;
            background: #fff !important;
            width: ${isThermal ? "380px" : "900px"} !important;
            box-sizing: border-box !important;
          }
          #__pos_invoice_print_only__ * {
            visibility: visible !important;
          }
        }
      `;
      document.head.appendChild(styleEl);

      const cleanup = () => {
        if (document.body.contains(printContainer)) {
          document.body.removeChild(printContainer);
        }
        if (document.head.contains(styleEl)) {
          document.head.removeChild(styleEl);
        }
        window.removeEventListener("afterprint", cleanup);
        setDirectPrintSale(null);
      };

      window.addEventListener("afterprint", cleanup);
      window.print();
      setTimeout(cleanup, 3000);
    }, 60);

    return () => clearTimeout(timer);
  }, [directPrintSale]);

  const activeTab = useMemo(
    () => tabs.find((t) => t.id === activeTabId) || tabs[0],
    [tabs, activeTabId]
  );
  const selectedRow = useMemo(
    () => activeTab.rows.find((r) => r.id === activeTab.selectedRowId),
    [activeTab.rows, activeTab.selectedRowId]
  );

  useEffect(() => {
    let cancelled = false;

    const loadLookupData = async () => {
      try {
        const [partiesResponse, itemsResponse, saleInvoicesResponse, banksResponse] =
          await Promise.all([
            fetch("/api/parties"),
            fetch("/api/items"),
            fetch("/api/sale_invoices"),
            fetch("/api/bank_accounts"),
          ]);

        if (
          !partiesResponse.ok ||
          !itemsResponse.ok ||
          !saleInvoicesResponse.ok ||
          !banksResponse.ok
        )
          return;

        const loadedParties = (await partiesResponse.json()) as PartyOption[];
        const loadedItems = (await itemsResponse.json()) as ItemOption[];
        const saleInvoices = (await saleInvoicesResponse.json()) as any[];
        const loadedBanks = (await banksResponse.json()) as BankOption[];

        if (cancelled) return;

        setParties([...loadedParties].sort((a, b) => a.name.localeCompare(b.name)));
        setItems(loadedItems);
        setBanks(loadedBanks);

        const loadedSales: SavedSaleRecord[] = saleInvoices.map((inv: any) => ({
          id: String(inv.id),
          invoiceNo: String(inv.invoice_no ?? inv.invoiceNo ?? ""),
          date: inv.date || new Date().toISOString().split("T")[0],
          partyName: inv.party_name ?? inv.partyName ?? "Cash Sale",
          partyId: inv.party_id ?? inv.partyId ?? null,
          partyPhone: inv.party_phone ?? inv.partyPhone ?? null,
          paymentMode: inv.payment_mode ?? inv.paymentMode ?? "Cash",
          paymentType: inv.payment_type ?? inv.paymentType ?? "Cash",
          subtotal: Number(inv.subtotal ?? 0),
          discountPercent: Number(inv.discount_percent ?? inv.discountPercent ?? 0),
          discountAmount: Number(inv.discount_amount ?? inv.discountAmount ?? 0),
          amount: Number(inv.amount ?? 0),
          balance: Number(inv.balance ?? 0),
          description: inv.description ?? "",
          lineItemsJson: inv.line_items_json ?? inv.lineItemsJson ?? null,
          createdAt: inv.created_at ?? inv.createdAt ?? "",
        }));

        loadedSales.sort((a, b) => {
          const numA = Number(a.invoiceNo);
          const numB = Number(b.invoiceNo);
          if (Number.isFinite(numA) && Number.isFinite(numB)) return numA - numB;
          if (a.createdAt && b.createdAt) return a.createdAt.localeCompare(b.createdAt);
          return a.invoiceNo.localeCompare(b.invoiceNo, undefined, { numeric: true });
        });

        setSavedSales(loadedSales);

        const nextNo = String(
          saleInvoices.reduce((highest, invoice) => {
            const invNo = Number(invoice.invoice_no ?? invoice.invoiceNo ?? 0);
            return Number.isFinite(invNo) && invNo > highest ? invNo : highest;
          }, 0) + 1
        );
        setNextInvoiceNo(nextNo);

        setTabs((prev) => {
          if (prev.length === 1 && prev[0].rows.length === 0 && prev[0].invoiceNo === "1") {
            return [{ ...prev[0], invoiceNo: nextNo }];
          }
          return prev;
        });
      } catch (error) {
        console.error(error);
      }
    };

    void loadLookupData();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Once lookup data (items, parties) is loaded, populate the tab if we have an initialInvoice to edit
  useEffect(() => {
    if (!initialInvoice || initialInvoiceLoadedRef.current || items.length === 0) return;
    initialInvoiceLoadedRef.current = true;

    // Parse line items from JSON
    let parsedRows: PosRow[] = [];
    if (initialInvoice.lineItemsJson) {
      try {
        const lineItems = JSON.parse(initialInvoice.lineItemsJson) as Array<{
          itemId?: string;
          name?: string;
          quantity?: number;
          unit?: string;
          price?: number;
        }>;
        parsedRows = lineItems.map((li) => ({
          id: globalRowId++,
          itemId: li.itemId ?? "",
          itemCode: items.find((i) => String(i.id) === li.itemId)?.code ?? "",
          itemName: li.name ?? "",
          qty: String(li.quantity ?? 1),
          unit: li.unit ?? "NONE",
          pricePerUnit: String(li.price ?? 0),
        }));
      } catch {
        // ignore parse errors
      }
    }

    // Determine payment mode
    const paymentMode = initialInvoice.paymentMode ?? "Cash";

    // Find matching party
    const matchedParty = parties.find(
      (p) => initialInvoice.partyId && String(p.id) === String(initialInvoice.partyId)
    ) ?? null;

    const totalAmount = parsedRows.reduce(
      (sum, r) => sum + (Number(r.qty) || 0) * (Number(r.pricePerUnit) || 0),
      0
    );
    const discountAmount = Number(initialInvoice.discountAmount ?? 0);
    const discountPercent = Number(initialInvoice.discountPercent ?? 0);
    const amountReceived = String(
      matchedParty ? (totalAmount - discountAmount - (initialInvoice.balance ?? 0)) : (totalAmount - discountAmount)
    );

    setTabs((prev) => [
      {
        ...prev[0],
        invoiceNo: initialInvoice.invoiceNo,
        date: initialInvoice.date,
        rows: parsedRows,
        paymentMode,
        amountReceived,
        isAmountReceivedDirty: true,
        customerSelectedId: matchedParty ? matchedParty.id : null,
        customerSearchText: matchedParty ? matchedParty.name : (initialInvoice.partyName === "Cash Sale" ? "Cash Sale" : initialInvoice.partyName),
        searchQuery: "",
        selectedRowId: null,
        discountPercent: discountPercent > 0 ? String(discountPercent) : "",
        discountAmount: discountAmount > 0 ? String(discountAmount) : "",
        description: initialInvoice.description ?? "",
        editingInvoiceId: initialInvoice.id,
        draftSnapshot: null,
      },
      ...prev.slice(1),
    ]);
  }, [initialInvoice, items, parties]);

  const updateTab = (partial: Partial<PosTab>) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, ...partial } : t))
    );
  };

  const handleDeleteSelectedRow = () => {
    if (activeTab.selectedRowId === null) return;
    const newRows = activeTab.rows.filter((r) => r.id !== activeTab.selectedRowId);
    updateTab({ rows: newRows, selectedRowId: null });
  };

  const openModal = (modalName: "quantity" | "unit" | "discount" | "description") => {
    if ((modalName === "quantity" || modalName === "unit") && !selectedRow) {
      setActiveModal("no_selection");
      return;
    }

    if (modalName === "quantity") setModalQuantity(selectedRow!.qty);
    if (modalName === "unit") setModalUnit(selectedRow!.unit);
    if (modalName === "discount") {
      setModalDiscountPercent(activeTab.discountPercent);
      setModalDiscountAmount(activeTab.discountAmount);
    }
    if (modalName === "description") setModalDescription(activeTab.description);

    setActiveModal(modalName);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeModal !== null) {
        if (e.key === "Escape") setActiveModal(null);
        return;
      }

      if (e.ctrlKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        handleNewBill();
      } else if (e.ctrlKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        handleSaveSale();
      } else if (e.ctrlKey && e.key === "ArrowLeft") {
        e.preventDefault();
        handleNavigatePrevSale();
      } else if (e.ctrlKey && e.key === "ArrowRight") {
        e.preventDefault();
        handleNavigateNextSale();
      } else if (e.key === "F11") {
        e.preventDefault();
        const customerInput = document.getElementById("customer-search-input");
        if (customerInput) {
          customerInput.focus();
        }
      } else if (e.ctrlKey && e.key.toLowerCase() === "w") {
        e.preventDefault();
        requestCloseTab(activeTabId);
      } else if (
        (e.key === "Delete" || e.key === "Backspace") &&
        activeTab.selectedRowId !== null
      ) {
        if (
          document.activeElement?.tagName === "INPUT" ||
          document.activeElement?.tagName === "SELECT"
        )
          return;
        e.preventDefault();
        handleDeleteSelectedRow();
      } else if (e.key === "F2") {
        e.preventDefault();
        openModal("quantity");
      } else if (e.key === "F4") {
        e.preventDefault();
        handleDeleteSelectedRow();
      } else if (e.key === "F6") {
        e.preventDefault();
        openModal("unit");
      } else if (e.key === "F9") {
        e.preventDefault();
        openModal("discount");
      } else if (e.key === "F12") {
        e.preventDefault();
        openModal("description");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, nextInvoiceNo, activeModal]);

  const subTotalAmount = useMemo(() => {
    return activeTab.rows.reduce((acc, row) => {
      const qty = Number(row.qty) || 0;
      const price = Number(row.pricePerUnit) || 0;
      return acc + qty * price;
    }, 0);
  }, [activeTab.rows]);

  const totalAmount = useMemo(() => {
    const discount = Number(activeTab.discountAmount) || 0;
    return Math.max(0, subTotalAmount - discount);
  }, [subTotalAmount, activeTab.discountAmount]);

  const effectiveAmountReceived = activeTab.isAmountReceivedDirty
    ? activeTab.amountReceived
    : totalAmount.toFixed(2);

  const changeToReturn = useMemo(() => {
    const received = Number(effectiveAmountReceived) || 0;
    return Math.max(0, received - totalAmount);
  }, [effectiveAmountReceived, totalAmount]);

  const isCashSale = activeTab.customerSelectedId === null;
  const receivedLessThanTotal =
    isCashSale && (Number(effectiveAmountReceived) || 0) < totalAmount;

  const populateTabFromSale = useCallback(
    (sale: SavedSaleRecord, currentTab: PosTab): PosTab => {
      let parsedRows: PosRow[] = [];
      if (sale.lineItemsJson) {
        try {
          const lineItems = JSON.parse(sale.lineItemsJson) as Array<any>;
          parsedRows = lineItems.map((li: any) => {
            const matchedItem = items.find(
              (it) => String(it.id) === String(li.itemId ?? li.item_id) || it.name === (li.name ?? li.itemName)
            );
            return {
              id: globalRowId++,
              itemId: matchedItem ? String(matchedItem.id) : String(li.itemId ?? li.item_id ?? ""),
              itemCode: matchedItem?.code ?? li.itemCode ?? li.code ?? "",
              itemName: li.name ?? li.itemName ?? matchedItem?.name ?? "",
              qty: String(li.quantity ?? li.qty ?? 1),
              unit: li.unit ?? matchedItem?.primary_unit ?? matchedItem?.unit ?? "NONE",
              pricePerUnit: String(li.price ?? li.pricePerUnit ?? 0),
            };
          });
        } catch {
          parsedRows = [];
        }
      }

      const matchedParty = parties.find(
        (p) => (sale.partyId && String(p.id) === String(sale.partyId)) || p.name === sale.partyName
      ) ?? null;

      const totalAmount = parsedRows.reduce(
        (sum, r) => sum + (Number(r.qty) || 0) * (Number(r.pricePerUnit) || 0),
        0
      );
      const discountAmount = Number(sale.discountAmount ?? 0);
      const discountPercent = Number(sale.discountPercent ?? 0);
      const computedTotal = totalAmount - discountAmount;

      let amountReceived = "0.00";
      if (sale.partyName === "Cash Sale" || !matchedParty || Number(sale.balance || 0) === 0) {
        amountReceived = (Number(sale.amount) || computedTotal).toFixed(2);
      } else {
        amountReceived = Math.max(0, (Number(sale.amount) || computedTotal) - Number(sale.balance || 0)).toFixed(2);
      }

      let paymentMode = sale.paymentMode || sale.paymentType || "Cash";
      if (paymentMode.toLowerCase() === "cash" || paymentMode.toLowerCase() === "credit") {
        paymentMode = "Cash";
      } else {
        const bankMatch = banks.find((b) => b.name.toLowerCase() === paymentMode.toLowerCase());
        if (bankMatch) paymentMode = bankMatch.name;
      }

      return {
        ...currentTab,
        invoiceNo: sale.invoiceNo,
        date: sale.date,
        rows: parsedRows,
        paymentMode,
        amountReceived,
        isAmountReceivedDirty: true,
        customerSelectedId: matchedParty ? matchedParty.id : null,
        customerSearchText: matchedParty ? matchedParty.name : (sale.partyName || "Cash Sale"),
        searchQuery: "",
        selectedRowId: null,
        discountPercent: discountPercent > 0 ? String(discountPercent) : "",
        discountAmount: discountAmount > 0 ? String(discountAmount) : "",
        description: sale.description ?? "",
        editingInvoiceId: sale.id,
      };
    },
    [banks, items, parties]
  );

  const currentIndex = useMemo(() => {
    if (!activeTab.editingInvoiceId) {
      return savedSales.length;
    }
    const idx = savedSales.findIndex((s) => String(s.id) === String(activeTab.editingInvoiceId));
    if (idx !== -1) return idx;
    const noIdx = savedSales.findIndex((s) => String(s.invoiceNo) === String(activeTab.invoiceNo));
    return noIdx !== -1 ? noIdx : savedSales.length;
  }, [activeTab.editingInvoiceId, activeTab.invoiceNo, savedSales]);

  const canNavigatePrev = currentIndex > 0 && savedSales.length > 0;
  const canNavigateNext = currentIndex < savedSales.length;

  const prevInvoiceNo = canNavigatePrev ? savedSales[currentIndex - 1]?.invoiceNo : null;
  const nextInvoiceNoDisplay = canNavigateNext
    ? (currentIndex + 1 >= savedSales.length
        ? (activeTab.draftSnapshot?.invoiceNo || nextInvoiceNo)
        : savedSales[currentIndex + 1]?.invoiceNo)
    : null;

  const handleNavigatePrevSale = () => {
    if (currentIndex <= 0 || savedSales.length === 0) return;

    const targetIndex = currentIndex - 1;
    const targetSale = savedSales[targetIndex];
    if (!targetSale) return;

    setTabs((prevTabs) =>
      prevTabs.map((t) => {
        if (t.id !== activeTabId) return t;

        const draftSnapshot = !t.editingInvoiceId
          ? {
              invoiceNo: t.invoiceNo,
              date: t.date,
              rows: t.rows,
              paymentMode: t.paymentMode,
              amountReceived: t.amountReceived,
              isAmountReceivedDirty: t.isAmountReceivedDirty,
              customerSelectedId: t.customerSelectedId,
              customerSearchText: t.customerSearchText,
              discountPercent: t.discountPercent,
              discountAmount: t.discountAmount,
              description: t.description,
            }
          : t.draftSnapshot;

        const updatedTab = populateTabFromSale(targetSale, t);
        return {
          ...updatedTab,
          draftSnapshot,
        };
      })
    );
  };

  const handleNavigateNextSale = () => {
    if (currentIndex >= savedSales.length) return;

    const targetIndex = currentIndex + 1;

    setTabs((prevTabs) =>
      prevTabs.map((t) => {
        if (t.id !== activeTabId) return t;

        if (targetIndex >= savedSales.length) {
          const isCashSaleByDefault = JSON.parse(
            localStorage.getItem("settings.isCashSaleByDefault") || "false"
          );
          if (t.draftSnapshot) {
            const snapshot = t.draftSnapshot;
            return {
              ...t,
              invoiceNo: snapshot.invoiceNo || nextInvoiceNo,
              date: snapshot.date || new Date().toISOString().split("T")[0],
              rows: snapshot.rows || [],
              paymentMode: snapshot.paymentMode || "Cash",
              amountReceived: snapshot.amountReceived || "0.00",
              isAmountReceivedDirty: Boolean(snapshot.isAmountReceivedDirty),
              customerSelectedId: snapshot.customerSelectedId ?? null,
              customerSearchText:
                snapshot.customerSearchText ?? (isCashSaleByDefault ? "Cash Sale" : ""),
              searchQuery: "",
              selectedRowId: null,
              discountPercent: snapshot.discountPercent || "",
              discountAmount: snapshot.discountAmount || "",
              description: snapshot.description || "",
              editingInvoiceId: null,
              draftSnapshot: snapshot,
            };
          } else {
            return {
              ...t,
              invoiceNo: nextInvoiceNo,
              date: new Date().toISOString().split("T")[0],
              rows: [],
              paymentMode: "Cash",
              amountReceived: "0.00",
              isAmountReceivedDirty: false,
              customerSelectedId: null,
              customerSearchText: isCashSaleByDefault ? "Cash Sale" : "",
              searchQuery: "",
              selectedRowId: null,
              discountPercent: "",
              discountAmount: "",
              description: "",
              editingInvoiceId: null,
              draftSnapshot: null,
            };
          }
        }

        const targetSale = savedSales[targetIndex];
        if (!targetSale) return t;

        const updatedTab = populateTabFromSale(targetSale, t);
        return {
          ...updatedTab,
          draftSnapshot: t.draftSnapshot,
        };
      })
    );
  };

  const handleNewBill = () => {
    const newTab = createEmptyTab(nextInvoiceNo);
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  const requestCloseTab = (idToClose: number) => {
    const tabToClose = tabs.find(t => t.id === idToClose);
    if (tabToClose && tabToClose.rows.length > 0) {
      setConfirmCloseState({ isOpen: true, type: 'tab', tabId: idToClose });
    } else {
      performCloseTab(idToClose);
    }
  };

  const requestCloseAll = () => {
    const hasAnyUnsaved = tabs.some(t => t.rows.length > 0);
    if (hasAnyUnsaved) {
      setConfirmCloseState({ isOpen: true, type: 'all' });
    } else {
      if (onClose) onClose();
    }
  };

  const confirmCloseAction = () => {
    if (confirmCloseState.type === 'tab' && confirmCloseState.tabId !== undefined) {
      performCloseTab(confirmCloseState.tabId);
    } else if (confirmCloseState.type === 'all') {
      if (onClose) onClose();
    }
    setConfirmCloseState({ isOpen: false, type: 'tab' });
  };

  const performCloseTab = (idToClose: number) => {
    setTabs((prev) => {
      if (prev.length <= 1) {
        if (onClose) onClose();
        return prev;
      }
      const newTabs = prev.filter((t) => t.id !== idToClose);
      if (activeTabId === idToClose) {
        setActiveTabId(newTabs[newTabs.length - 1].id);
      }
      return newTabs;
    });
  };

  const filteredItems = useMemo(() => {
    if (!activeTab.searchQuery) return [];
    const query = activeTab.searchQuery.toLowerCase();
    return items
      .filter(
        (item) =>
          item.name.toLowerCase().startsWith(query) ||
          item.code?.toLowerCase().startsWith(query)
      )
      .slice(0, 50);
  }, [items, activeTab.searchQuery]);

  const handleSearchFocus = () => {
    if (suppressDropdownRef.current) {
      suppressDropdownRef.current = false;
      setSearchFocused(false);
      return;
    }
    setSearchFocused(true);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const currentValue = (e.target as HTMLInputElement).value.trim();
      if (currentValue) {
        // If this exact code was scanned and added within the last 250ms (scanner burst), ignore the trailing Enter
        if (
          lastScanRef.current &&
          lastScanRef.current.code === currentValue.toLowerCase() &&
          Date.now() - lastScanRef.current.time < 250
        ) {
          e.preventDefault();
          return;
        }

        const exactMatch = items.find(
          (item) => item.code && item.code.trim().toLowerCase() === currentValue.toLowerCase()
        );

        if (exactMatch) {
          e.preventDefault();
          lastScanRef.current = { code: exactMatch.code?.trim().toLowerCase() || "", time: Date.now() };
          handleSelectItem(exactMatch);
          return;
        } else if (filteredItems.length === 0) {
          e.preventDefault();
          showToast(`Item with barcode "${currentValue}" not found`, "error");
          if (searchInputRef.current) {
            searchInputRef.current.select();
          }
          return;
        }
      }
    }

    if (!searchFocused || filteredItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSearchSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSearchSelectedIndex(
        (prev) => (prev - 1 + filteredItems.length) % filteredItems.length
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelectItem(filteredItems[searchSelectedIndex]);
    } else if (e.key === "Escape") {
      setSearchFocused(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIsScanSuccess(false);
    if (scanTimerRef.current) {
      clearTimeout(scanTimerRef.current);
    }

    if (value) {
      const exactMatch = items.find(
        (item) => item.code && item.code.trim().toLowerCase() === value.trim().toLowerCase()
      );

      if (exactMatch) {
        lastScanRef.current = { code: exactMatch.code?.trim().toLowerCase() || "", time: Date.now() };
        handleSelectItem(exactMatch);
        return;
      }
    }

    updateTab({ searchQuery: value });
    setSearchSelectedIndex(0);
    setSearchFocused(true);
  };

  const getCalculatedRow = (row: PosRow): PosRow => {
    const matchedItem = items.find((item) => item.id === row.itemId);
    if (!matchedItem) return row;

    let nextPricePerUnit = row.pricePerUnit;
    const qty = Number(row.qty) || 0;
    const isSecondary = row.unit === matchedItem.secondary_unit;
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

    return { ...row, pricePerUnit: nextPricePerUnit };
  };

  const handleSelectItem = (item: ItemOption) => {
    const existingRowIndex = activeTab.rows.findIndex((r) => r.itemId === item.id);
    const barcode = item.code || "";
    const currentTabId = activeTabId;

    if (existingRowIndex >= 0) {
      const nextRows = [...activeTab.rows];
      nextRows[existingRowIndex].qty = String(
        Number(nextRows[existingRowIndex].qty) + 1
      );
      nextRows[existingRowIndex] = getCalculatedRow(nextRows[existingRowIndex]);
      updateTab({ rows: nextRows, searchQuery: barcode });
    } else {
      let newRow: PosRow = {
        id: globalRowId++,
        itemId: item.id,
        itemCode: item.code || "",
        itemName: item.name,
        qty: "1",
        unit: item.primary_unit || item.unit || "NONE",
        pricePerUnit: String(item.sale_price || 0),
      };
      newRow = getCalculatedRow(newRow);
      updateTab({ rows: [...activeTab.rows, newRow], searchQuery: barcode });
    }

    suppressDropdownRef.current = true;
    setSearchFocused(false);
    setIsScanSuccess(true);

    if (scanTimerRef.current) {
      clearTimeout(scanTimerRef.current);
    }

    // Display barcode and green background for 300 milliseconds, then reset input box for new scan
    scanTimerRef.current = setTimeout(() => {
      setIsScanSuccess(false);
      setTabs((prev) =>
        prev.map((t) => (t.id === currentTabId ? { ...t, searchQuery: "" } : t))
      );
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 300);

    if (searchInputRef.current) {
      searchInputRef.current.value = barcode;
      searchInputRef.current.focus();
      searchInputRef.current.select();
    }
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
        searchInputRef.current.select();
      }
    }, 30);
  };

  const updateRow = (id: number, field: keyof PosRow, value: string) => {
    const newRows = activeTab.rows.map((r) => {
      if (r.id === id) {
        const updated = { ...r, [field]: value };
        if (field === "qty" || field === "unit") {
          return getCalculatedRow(updated);
        }
        return updated;
      }
      return r;
    });
    updateTab({ rows: newRows });
  };

  const saveModal = () => {
    if (activeModal === "quantity" && selectedRow) {
      updateRow(selectedRow.id, "qty", modalQuantity);
    } else if (activeModal === "unit" && selectedRow) {
      updateRow(selectedRow.id, "unit", modalUnit);
    } else if (activeModal === "discount") {
      updateTab({
        discountPercent: modalDiscountPercent,
        discountAmount: modalDiscountAmount,
      });
    } else if (activeModal === "description") {
      updateTab({ description: modalDescription });
    }
    setActiveModal(null);
  };

  const handleDiscountPercentChange = (val: string) => {
    setModalDiscountPercent(val);
    const p = Number(val) || 0;
    setModalDiscountAmount(((subTotalAmount * p) / 100).toFixed(2));
  };

  const handleDiscountAmountChange = (val: string) => {
    setModalDiscountAmount(val);
    const a = Number(val) || 0;
    if (subTotalAmount > 0) {
      setModalDiscountPercent(((a / subTotalAmount) * 100).toFixed(2));
    } else {
      setModalDiscountPercent("0");
    }
  };

  const filteredCustomers = useMemo(() => {
    return parties.filter((p) => p.status !== "inactive");
  }, [parties]);

  const handleSaveSale = async () => {
    if (isSaving) return;

    const validRows = activeTab.rows.filter((r) => r.itemId);
    if (validRows.length === 0) {
      setAlertState({ isOpen: true, title: "No Items Added", message: "Please add at least one item to save the sale." });
      return;
    }

    if (stopSaleOnNegativeStock) {
      const itemQtyMap = new Map<string, number>();
      for (const row of validRows) {
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
            setAlertState({ isOpen: true, title: "Insufficient Stock", message: `Cannot sell ${totalQty} of ${item.name}. Current stock is only ${currentStock}.` });
            return;
          }
        }
      }
    }

    if (receivedLessThanTotal) {
      setAlertState({ isOpen: true, title: "Invalid Amount", message: "Received amount cannot be less than the total." });
      return;
    }

    setIsSaving(true);

    const selectedParty = activeTab.customerSelectedId
      ? parties.find((p) => p.id === activeTab.customerSelectedId)
      : null;

    let receivedAmt = Number(effectiveAmountReceived) || 0;
    if (receivedAmt === 0 && isCashSale) {
      receivedAmt = totalAmount;
    }
    const computedBalance = Math.max(0, totalAmount - receivedAmt);
    const finalBalance = isCashSale ? 0 : computedBalance;
    const finalPaymentType = isCashSale ? "Cash" : (finalBalance > 0 ? "Credit" : "Cash");

    // Normalize paymentMode: POS only has Cash or Bank options, never Credit
    // If state is somehow "Credit" (from old init), treat it as cash
    const normalizedPaymentMode = activeTab.paymentMode.toLowerCase() === "cash" || activeTab.paymentMode.toLowerCase() === "credit"
      ? "cash"
      : activeTab.paymentMode; // bank name stays as-is

    const payload = {
      invoiceNo: activeTab.invoiceNo,
      date: activeTab.date,
      partyId: selectedParty?.id ? String(selectedParty.id) : null,
      partyName: selectedParty ? selectedParty.name : "Cash Sale",
      partyPhone: selectedParty?.phone || null,
      paymentType: finalPaymentType,
      paymentMode: normalizedPaymentMode,
      subtotal: subTotalAmount,
      discountPercent: Number(activeTab.discountPercent) || 0,
      discountAmount: Number(activeTab.discountAmount) || 0,
      taxLabel: "NONE",
      taxRate: 0,
      taxAmount: 0,
      roundOff: true,
      roundOffAmount: 0,
      amount: totalAmount,
      balance: finalBalance,
      description: activeTab.description || "POS Sale",
      lineItems: validRows.map((r) => ({
        id: String(Date.now() + Math.random()),
        itemId: r.itemId,
        name: r.itemName,
        quantity: Number(r.qty) || 1,
        unit: r.unit,
        price: Number(r.pricePerUnit) || 0,
        amount: (Number(r.qty) || 1) * (Number(r.pricePerUnit) || 0),
      })),
    };

    try {
      const isEditing = Boolean(activeTab.editingInvoiceId);
      const currentEditingId = activeTab.editingInvoiceId;
      const url = isEditing && currentEditingId ? `/api/sale_invoices/${currentEditingId}` : "/api/sale_invoices";
      const method = isEditing && currentEditingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save sale");

      const savedInvoice = (await response.json()) as { invoiceNo?: string; id?: string };

      const saleDataForPrint: SalePrintData = {
        records: validRows.map((r) => ({
          id: r.id,
          itemName: r.itemName,
          quantity: Number(r.qty) || 1,
          unit: r.unit === "NONE" ? "" : r.unit,
          pricePerUnit: Number(r.pricePerUnit) || 0,
          amount: (Number(r.qty) || 1) * (Number(r.pricePerUnit) || 0),
        })),
        invoiceNo: String(savedInvoice.invoiceNo || activeTab.invoiceNo),
        invoiceDate: activeTab.date,
        customerName: selectedParty ? selectedParty.name : (activeTab.customerSearchText || "Cash Sale"),
        customerContact: selectedParty?.phone || "",
        customerPhone: selectedParty?.phone || "",
        received: receivedAmt,
        paymentMode: activeTab.paymentMode || "Cash",
        previousBalance: selectedParty?.balance || 0,
        discount: Number(activeTab.discountAmount) || 0,
        discountPercent: Number(activeTab.discountPercent) || 0,
        description: activeTab.description || "POS Sale",
        documentTitle: "Invoice",
      };

      if (isEditing && currentEditingId) {
        window.dispatchEvent(
          new CustomEvent("sale-invoices-refresh", {
            detail: { message: `Sale #${activeTab.invoiceNo} updated successfully.` },
          })
        );

        setSavedSales((prev) =>
          prev.map((s) =>
            s.id === currentEditingId
              ? {
                  ...s,
                  partyName: payload.partyName,
                  partyId: payload.partyId,
                  partyPhone: payload.partyPhone,
                  paymentMode: payload.paymentMode,
                  paymentType: payload.paymentType,
                  subtotal: payload.subtotal,
                  discountPercent: payload.discountPercent,
                  discountAmount: payload.discountAmount,
                  amount: payload.amount,
                  balance: payload.balance,
                  description: payload.description,
                  lineItemsJson: JSON.stringify(payload.lineItems),
                }
              : s
          )
        );
        setDirectPrintSale(saleDataForPrint);
        return;
      }

      const nextInvNo = savedInvoice.invoiceNo 
        ? String(Number(savedInvoice.invoiceNo) + 1)
        : String(Number(activeTab.invoiceNo) + 1);

      setNextInvoiceNo(nextInvNo);

      window.dispatchEvent(
        new CustomEvent("sale-invoices-refresh", {
          detail: { message: `Sale #${activeTab.invoiceNo} completed successfully.` },
        })
      );

      const newlySavedSale: SavedSaleRecord = {
        id: String(savedInvoice.id || Date.now()),
        invoiceNo: String(savedInvoice.invoiceNo || activeTab.invoiceNo),
        date: activeTab.date,
        partyName: payload.partyName,
        partyId: payload.partyId,
        partyPhone: payload.partyPhone,
        paymentMode: payload.paymentMode,
        paymentType: payload.paymentType,
        subtotal: payload.subtotal,
        discountPercent: payload.discountPercent,
        discountAmount: payload.discountAmount,
        amount: payload.amount,
        balance: payload.balance,
        description: payload.description,
        lineItemsJson: JSON.stringify(payload.lineItems),
        createdAt: new Date().toISOString(),
      };

      setSavedSales((prev) => {
        const nextList = [...prev, newlySavedSale];
        nextList.sort((a, b) => {
          const numA = Number(a.invoiceNo);
          const numB = Number(b.invoiceNo);
          if (Number.isFinite(numA) && Number.isFinite(numB)) return numA - numB;
          if (a.createdAt && b.createdAt) return a.createdAt.localeCompare(b.createdAt);
          return a.invoiceNo.localeCompare(b.invoiceNo, undefined, { numeric: true });
        });
        return nextList;
      });

      // Reset active tab for next sale
      const isCashSaleByDefault = JSON.parse(localStorage.getItem('settings.isCashSaleByDefault') || 'false');
      
      setTabs(prev => {
        const remaining = prev.filter(t => t.id !== activeTabId);
        
        if (remaining.length === 0) {
          return [{
            ...prev[0],
            invoiceNo: nextInvNo,
            customerSelectedId: null,
            customerSearchText: isCashSaleByDefault ? "Cash Sale" : "",
            rows: [],
            amountReceived: "0.00",
            isAmountReceivedDirty: false,
            paymentMode: "Cash",
            discountPercent: "",
            discountAmount: "",
            description: "",
            searchQuery: "",
            selectedRowId: null,
            editingInvoiceId: null,
            draftSnapshot: null,
          }];
        }

        const updated = remaining.map(t => ({ ...t, invoiceNo: nextInvNo }));
        setActiveTabId(updated[updated.length - 1].id);
        return updated;
      });

      setDirectPrintSale(saleDataForPrint);
    } catch (error) {
      console.error(error);
      showToast("Failed to save sale. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    { key: "no", label: "#", width: "w-12" },
    { key: "code", label: "ITEM CODE", width: "w-[120px]" },
    { key: "name", label: "ITEM NAME", width: "flex-1" },
    { key: "qty", label: "QTY", width: "w-[80px]" },
    { key: "unit", label: "UNIT", width: "w-[80px]" },
    { key: "price", label: "PRICE/UNIT", width: "w-[120px]" },
    { key: "total", label: "TOTAL(Rs)", width: "w-[120px]" },
  ];

  return (
    <div
      className="flex flex-col h-screen w-screen bg-[#f0f2f5] overflow-hidden"
      onClick={() => {
        setSearchFocused(false);
      }}
    >
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-4 left-4 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-semibold transition-all duration-300 animate-slide-in-right ${
            toast.type === "success"
              ? "bg-gradient-to-r from-green-500 to-emerald-600"
              : "bg-gradient-to-r from-red-500 to-rose-600"
          }`}
          style={{ minWidth: 280 }}
        >
          <span className="text-lg">{toast.type === "success" ? "✅" : "❌"}</span>
          <span>{toast.message}</span>
        </div>
      )}
      <TopHeaderBar
        tabs={tabs}
        activeTabId={activeTabId}
        setActiveTabId={setActiveTabId}
        handleCloseTab={requestCloseTab}
        handleNewBill={handleNewBill}
        onClose={requestCloseAll}
      />

      <div className="flex flex-1 p-2 gap-2 overflow-hidden">
        <div className="flex-1 flex flex-col bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
          <SearchInput
            activeTab={activeTab}
            searchInputRef={searchInputRef}
            filteredItems={filteredItems}
            searchFocused={searchFocused}
            searchSelectedIndex={searchSelectedIndex}
            handleSearchChange={handleSearchChange}
            handleSearchKeyDown={handleSearchKeyDown}
            setSearchFocused={setSearchFocused}
            setSearchSelectedIndex={setSearchSelectedIndex}
            handleSelectItem={handleSelectItem}
            isScanSuccess={isScanSuccess}
            onSearchFocus={handleSearchFocus}
          />

          <PosTable
            activeTab={activeTab}
            updateTab={updateTab}
            updateRow={updateRow}
            columns={columns}
          />

          <ActionButtons
            openModal={openModal}
            handleDeleteSelectedRow={handleDeleteSelectedRow}
          />
        </div>

        <RightPanel
          activeTab={activeTab}
          updateTab={updateTab}
          banks={banks}
          totalAmount={totalAmount}
          effectiveAmountReceived={effectiveAmountReceived}
          changeToReturn={changeToReturn}
          receivedLessThanTotal={receivedLessThanTotal}
          isSaving={isSaving}
          handleSaveSale={handleSaveSale}
          filteredCustomers={filteredCustomers}
          onAddParty={() => setShowAddParty(true)}
          canNavigatePrev={canNavigatePrev}
          canNavigateNext={canNavigateNext}
          onNavigatePrev={handleNavigatePrevSale}
          onNavigateNext={handleNavigateNextSale}
          prevInvoiceNo={prevInvoiceNo}
          nextInvoiceNo={nextInvoiceNoDisplay}
          isEditing={Boolean(activeTab.editingInvoiceId)}
        />
      </div>

      {/* Modals */}
      <ConfirmActionModal
        isOpen={alertState.isOpen}
        onClose={() => setAlertState({ isOpen: false, title: "", message: "" })}
        onConfirm={() => setAlertState({ isOpen: false, title: "", message: "" })}
        title={alertState.title}
        message={alertState.message}
        confirmText="OK"
        hideCancel={true}
      />

      <ConfirmActionModal
        isOpen={confirmCloseState.isOpen}
        onClose={() => setConfirmCloseState({ isOpen: false, type: 'tab' })}
        onConfirm={confirmCloseAction}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to discard them and close?"
        confirmText="Discard & Close"
        cancelText="Cancel"
      />

      <Modals
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        selectedRow={selectedRow}
        modalQuantity={modalQuantity}
        setModalQuantity={setModalQuantity}
        modalUnit={modalUnit}
        setModalUnit={setModalUnit}
        subTotalAmount={subTotalAmount}
        modalDiscountPercent={modalDiscountPercent}
        modalDiscountAmount={modalDiscountAmount}
        handleDiscountPercentChange={handleDiscountPercentChange}
        handleDiscountAmountChange={handleDiscountAmountChange}
        modalDescription={modalDescription}
        setModalDescription={setModalDescription}
        saveModal={saveModal}
        items={items}
      />

      <AddPartyDialog
        showAddParty={showAddParty}
        setShowAddParty={setShowAddParty}
        partyBeingEdited={null}
        setPartyBeingEdited={() => {}}
        resetPartyForm={resetPartyForm}
        partyForm={partyForm}
        setPartyForm={setPartyForm}
        activeTab={activePartyTab}
        setActiveTab={setActivePartyTab}
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

      {/* Hidden print container for direct POS printing without preview */}
      {directPrintSale && (
        <div
          id="pos-direct-print-container"
          aria-hidden="true"
          style={{
            position: "fixed",
            left: "-9999px",
            top: "-9999px",
            width: ((localStorage.getItem("print_activePrinter") || "regular") === "thermal") ? "380px" : "900px",
            opacity: 0,
            pointerEvents: "none",
            zIndex: -1,
          }}
        >
          <div className="pos-print-content">
            <InvoiceThemeContent
              saleData={directPrintSale}
              activePrinter={((localStorage.getItem("print_activePrinter") as any) || "regular")}
              selectedThemeId={
                localStorage.getItem("print_selectedThemeId") ||
                (((localStorage.getItem("print_activePrinter") || "regular") === "thermal") ? "thermal1" : "tally")
              }
              selectedColor={localStorage.getItem("print_selectedColor") || "#a78bfa"}
              companyInfo={companyInfo}
            />
          </div>
        </div>
      )}
    </div>
  );
}
