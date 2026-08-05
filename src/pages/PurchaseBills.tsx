import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AddPurchase } from "@/pages/AddPurchase";
import type { PurchaseBillEditData } from "@/types";
import type { PurchaseBillApiRow, PurchaseBillViewRow } from "../components/pagescomponents/purchasebills/types";
import {
  fallbackPurchaseBills,
  getMonthKeyFromDate,
  formatDateDisplay,
  createCsvContent,
  monthLabelForFilter,
} from "../components/pagescomponents/purchasebills/utils";
import { PurchaseBillHeader } from "../components/pagescomponents/purchasebills/PurchaseBillHeader";
import { PurchaseBillFilters } from "../components/pagescomponents/purchasebills/PurchaseBillFilters";
import { PurchaseBillSummary } from "../components/pagescomponents/purchasebills/PurchaseBillSummary";
import { PurchaseBillTable } from "../components/pagescomponents/purchasebills/PurchaseBillTable";
import { PurchaseBillContextMenu } from "../components/pagescomponents/purchasebills/PurchaseBillContextMenu";
import { PurchaseBillDialog } from "../components/pagescomponents/purchasebills/PurchaseBillDialog";

export function PurchaseBills() {
  const [invoiceRows, setInvoiceRows] = useState<PurchaseBillViewRow[]>([]);
  const [showAddPurchase, setShowAddPurchase] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<PurchaseBillEditData | null>(null);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [isMonthMenuOpen, setIsMonthMenuOpen] = useState(false);
  const [openRowMenuId, setOpenRowMenuId] = useState<string | null>(null);
  const [openRowMenuPosition, setOpenRowMenuPosition] = useState<{ left: number; top: number } | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<PurchaseBillViewRow | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (showSearchInput) {
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  }, [showSearchInput]);

  useEffect(() => {
    if (!statusMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setStatusMessage("");
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [statusMessage]);

  useEffect(() => {
    const closeMenus = () => {
      setIsMonthMenuOpen(false);
      setOpenRowMenuId(null);
      setOpenRowMenuPosition(null);
    };

    window.addEventListener("click", closeMenus);
    window.addEventListener("scroll", closeMenus, true);

    return () => {
      window.removeEventListener("click", closeMenus);
      window.removeEventListener("scroll", closeMenus, true);
    };
  }, []);

  const loadPurchaseBills = useCallback(async (preserveMonthSelection = false) => {
    try {
      const response = await fetch("/api/purchase_bills");
      if (!response.ok) {
        throw new Error("Failed to load purchase bills");
      }

      const purchaseBills = (await response.json()) as PurchaseBillApiRow[];
      const normalizedRows = purchaseBills.map((invoice) => ({
        id: invoice.id,
        invoiceNo: invoice.invoice_no,
        date: invoice.date,
        partyName: invoice.party_name,
        partyId: invoice.party_id ?? undefined,
        partyPhone: invoice.party_phone ?? undefined,
        transaction: invoice.transaction_type,
        paymentType: invoice.payment_type ?? invoice.payment_mode ?? "",
        paymentMode: invoice.payment_mode ?? undefined,
        amount: Number(invoice.amount ?? 0),
        balance: Number(invoice.balance ?? 0),
        monthKey: getMonthKeyFromDate(invoice.date),
        subtotal: Number(invoice.subtotal ?? 0),
        discountPercent: Number(invoice.discount_percent ?? 0),
        discountAmount: Number(invoice.discount_amount ?? 0),
        taxLabel: invoice.tax_label ?? undefined,
        taxRate: Number(invoice.tax_rate ?? 0),
        taxAmount: Number(invoice.tax_amount ?? 0),
        roundOff: Boolean(invoice.round_off),
        roundOffAmount: Number(invoice.round_off_amount ?? 0),
        description: invoice.description ?? undefined,
        lineItemsJson: invoice.line_items_json ?? null,
      }));

      setInvoiceRows(normalizedRows);
      if (!preserveMonthSelection) {
        setSelectedMonthKey((previousMonthKey) => {
          if (previousMonthKey) {
            return previousMonthKey;
          }

          const currentMonthKey = getMonthKeyFromDate(formatDateDisplay(new Date()));
          const currentMonthExists = normalizedRows.some((row) => row.monthKey === currentMonthKey);
          if (currentMonthExists) {
            return currentMonthKey;
          }

          return normalizedRows[0]?.monthKey ?? "";
        });
      }
      setStatusMessage("");
    } catch (error) {
      console.error(error);
      setInvoiceRows(fallbackPurchaseBills);
      setStatusMessage("Showing fallback purchase bills because the database could not be loaded.");
    }
  }, []);

  useEffect(() => {
    void loadPurchaseBills();
  }, [loadPurchaseBills]);

  useEffect(() => {
    const handleRefresh = (event: Event) => {
      const customEvent = event as CustomEvent<{ message?: string }>;
      void loadPurchaseBills(true).then(() => {
        if (customEvent.detail?.message) {
          setStatusMessage(customEvent.detail.message);
        }
      });
    };

    window.addEventListener("purchase-bills-refresh", handleRefresh as EventListener);

    return () => {
      window.removeEventListener("purchase-bills-refresh", handleRefresh as EventListener);
    };
  }, [loadPurchaseBills]);

  const monthOptions = useMemo(() => {
    const uniqueMonths = new Set(invoiceRows.map((row) => row.monthKey));
    return Array.from(uniqueMonths).sort((left, right) => right.localeCompare(left));
  }, [invoiceRows]);

  const selectedMonthRows = useMemo(() => {
    if (!selectedMonthKey) {
      return invoiceRows;
    }

    return invoiceRows.filter((row) => row.monthKey === selectedMonthKey);
  }, [invoiceRows, selectedMonthKey]);

  const visibleRows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return selectedMonthRows;
    }

    return selectedMonthRows.filter((row) => row.partyName.toLowerCase().includes(normalizedQuery));
  }, [searchQuery, selectedMonthRows]);

  const totalPurchase = visibleRows.reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalPaid = visibleRows.filter((invoice) => invoice.balance === 0).reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalUnpaid = visibleRows.reduce((sum, invoice) => sum + invoice.balance, 0);

  const currentMonthKey = getMonthKeyFromDate(formatDateDisplay(new Date()));
  const monthButtonLabel = selectedMonthKey === currentMonthKey ? "This Month" : monthLabelForFilter(selectedMonthKey);

  const handleDownloadCsv = () => {
    const csvContent = createCsvContent(selectedMonthRows);
    const fileName = selectedMonthKey ? `purchase-bills-${selectedMonthKey}.csv` : "purchase-bills-all-months.csv";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openViewDialog = (invoice: PurchaseBillViewRow) => {
    setViewingInvoice(invoice);
  };

  const handleDeleteInvoice = async (invoice: PurchaseBillViewRow) => {
    const confirmed = window.confirm(`Delete invoice ${invoice.invoiceNo} for ${invoice.partyName}?`);
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/purchase_bills/${invoice.id}`, {
        method: "DELETE",
      });

      if (!response.ok && response.status !== 204) {
        throw new Error("Failed to delete purchase bill");
      }

      setInvoiceRows((previousRows) => previousRows.filter((row) => row.id !== invoice.id));
      setStatusMessage("Purchase bill deleted successfully.");
    } catch (error) {
      console.error(error);
      setStatusMessage("Failed to delete the selected purchase bill.");
    } finally {
      setOpenRowMenuId(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#D0DCE7] gap-1 overflow-y-auto">
      <PurchaseBillHeader
        onAddPurchase={() => { setEditingInvoice(null); setShowAddPurchase(true); }}
      />

      <PurchaseBillFilters
        monthButtonLabel={monthButtonLabel}
        isMonthMenuOpen={isMonthMenuOpen}
        setIsMonthMenuOpen={setIsMonthMenuOpen}
        setOpenRowMenuId={setOpenRowMenuId}
        monthOptions={monthOptions}
        setSelectedMonthKey={setSelectedMonthKey}
      />

      <PurchaseBillSummary
        totalPurchase={totalPurchase}
        totalPaid={totalPaid}
        totalUnpaid={totalUnpaid}
      />

      <PurchaseBillTable
        showSearchInput={showSearchInput}
        setShowSearchInput={setShowSearchInput}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchInputRef={searchInputRef}
        setIsMonthMenuOpen={setIsMonthMenuOpen}
        setOpenRowMenuId={setOpenRowMenuId}
        setOpenRowMenuPosition={setOpenRowMenuPosition}
        openRowMenuId={openRowMenuId}
        handleDownloadCsv={handleDownloadCsv}
        visibleRows={visibleRows}
        statusMessage={statusMessage}
      />

      <PurchaseBillDialog
        viewingInvoice={viewingInvoice}
        setViewingInvoice={setViewingInvoice}
      />

      <PurchaseBillContextMenu
        openRowMenuId={openRowMenuId}
        openRowMenuPosition={openRowMenuPosition}
        invoiceRows={invoiceRows}
        openViewDialog={openViewDialog}
        setOpenRowMenuId={setOpenRowMenuId}
        setOpenRowMenuPosition={setOpenRowMenuPosition}
        onEditInvoice={(invoice) => {
          setEditingInvoice(invoice as any);
          setShowAddPurchase(true);
        }}
        handleDeleteInvoice={handleDeleteInvoice}
      />

      {showAddPurchase && (
        <div className="fixed inset-0 z-[100]">
          <AddPurchase
            initialInvoice={editingInvoice}
            onClose={() => {
              setShowAddPurchase(false);
              setEditingInvoice(null);
            }}
            onSave={() => {
              void loadPurchaseBills(true);
            }}
          />
        </div>
      )}
    </div>
  );
}
