import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSettings } from "@/hooks/useSettings";
import type { SaleInvoiceEditData, ViewType } from "@/types";
import type {
  SaleInvoiceApiRow,
  SaleInvoiceViewRow,
} from "../components/pagescomponents/saleinvoices/types";
import {
  fallbackSaleInvoices,
  getMonthKeyFromDate,
  formatDateDisplay,
  createCsvContent,
  monthLabelForFilter,
} from "../components/pagescomponents/saleinvoices/utils";
import { SaleInvoiceHeader } from "../components/pagescomponents/saleinvoices/SaleInvoiceHeader";
import { SaleInvoiceFilters } from "../components/pagescomponents/saleinvoices/SaleInvoiceFilters";
import { SaleInvoiceSummary } from "../components/pagescomponents/saleinvoices/SaleInvoiceSummary";
import { SaleInvoiceTable } from "../components/pagescomponents/saleinvoices/SaleInvoiceTable";
import { SaleInvoiceContextMenu } from "../components/pagescomponents/saleinvoices/SaleInvoiceContextMenu";
import { SaleInvoiceDialog } from "../components/pagescomponents/saleinvoices/SaleInvoiceDialog";
import { EnterPasscodeScreen } from "@/components/common/EnterPasscodeScreen";
import { ConfirmDeleteModal } from "@/components/common/ConfirmDeleteModal";

interface SaleInvoicesProps {
  onViewChange: (view: ViewType) => void;
  onEditInvoice: (invoice: SaleInvoiceEditData) => void;
  onBack?: () => void;
}

export function SaleInvoices({ onViewChange, onEditInvoice, onBack }: SaleInvoicesProps) {
  const [invoiceRows, setInvoiceRows] = useState<SaleInvoiceViewRow[]>([]);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(
    getMonthKeyFromDate(formatDateDisplay(new Date()))
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [openRowMenuId, setOpenRowMenuId] = useState<string | null>(null);
  const [openRowMenuPosition, setOpenRowMenuPosition] = useState<{ left: number; top: number } | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<SaleInvoiceViewRow | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [isPasscodeEnabled] = useSettings('settings.isPasscodeEnabled', false);
  const [isPasscodeForTransactionEnabled] = useSettings('settings.isPasscodeForTransactionEnabled', false);
  const [passcodeAction, setPasscodeAction] = useState<{ type: 'edit' | 'delete', payload: SaleInvoiceViewRow } | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<SaleInvoiceViewRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const loadSaleInvoices = useCallback(async (preserveMonthSelection = false) => {
    try {
      const response = await fetch("/api/sale_invoices");
      if (!response.ok) {
        throw new Error("Failed to load sale invoices");
      }

      const saleInvoices = (await response.json()) as SaleInvoiceApiRow[];
      const normalizedRows = saleInvoices.map((invoice) => ({
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
          return previousMonthKey || currentMonthKey;
        });
      }
      setStatusMessage("");
    } catch (error) {
      console.error(error);
      setInvoiceRows(fallbackSaleInvoices);
      setStatusMessage("Showing fallback sale invoices because the database could not be loaded.");
    }
  }, []);

  useEffect(() => {
    void loadSaleInvoices();
  }, [loadSaleInvoices]);

  useEffect(() => {
    const handleRefresh = (event: Event) => {
      const customEvent = event as CustomEvent<{ message?: string }>;
      void loadSaleInvoices(true).then(() => {
        if (customEvent.detail?.message) {
          setStatusMessage(customEvent.detail.message);
        }
      });
    };

    window.addEventListener("sale-invoices-refresh", handleRefresh as EventListener);

    return () => {
      window.removeEventListener("sale-invoices-refresh", handleRefresh as EventListener);
    };
  }, [loadSaleInvoices]);

  const monthOptions = useMemo(() => {
    const uniqueMonths = new Set(invoiceRows.map((row) => row.monthKey));
    uniqueMonths.add(getMonthKeyFromDate(formatDateDisplay(new Date())));
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
    return selectedMonthRows.filter((row) => {
      const matchName = row.partyName.toLowerCase().includes(normalizedQuery);
      const matchInvoice = String(row.invoiceNo ?? "").toLowerCase().includes(normalizedQuery);
      const matchAmount = String(row.amount ?? "").includes(normalizedQuery);
      return matchName || matchInvoice || matchAmount;
    });
  }, [searchQuery, selectedMonthRows]);

  const totalSales = visibleRows.reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalReceived = visibleRows.filter((invoice) => invoice.balance === 0).reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalBalance = visibleRows.reduce((sum, invoice) => sum + invoice.balance, 0);

  const currentMonthKey = getMonthKeyFromDate(formatDateDisplay(new Date()));
  const monthButtonLabel = selectedMonthKey === currentMonthKey ? "This Month" : monthLabelForFilter(selectedMonthKey);

  const handleDownloadCsv = () => {
    const csvContent = createCsvContent(selectedMonthRows);
    const fileName = selectedMonthKey ? `sale-invoices-${selectedMonthKey}.csv` : "sale-invoices-all-months.csv";
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

  const openViewDialog = (invoice: SaleInvoiceViewRow) => {
    setViewingInvoice(invoice);
  };

  const handleDeleteInvoice = async () => {
    if (!invoiceToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/sale_invoices/${invoiceToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok && response.status !== 204) {
        throw new Error("Failed to delete sale invoice");
      }

      setInvoiceRows((previousRows) => previousRows.filter((row) => row.id !== invoiceToDelete.id));
      setStatusMessage("Sale invoice deleted successfully.");
      setInvoiceToDelete(null);
    } catch (error) {
      console.error(error);
      setStatusMessage("Failed to delete the selected sale invoice.");
    } finally {
      setIsDeleting(false);
      setOpenRowMenuId(null);
    }
  };

  const handleEditClick = (invoice: SaleInvoiceViewRow) => {
    if (isPasscodeEnabled && isPasscodeForTransactionEnabled) {
      setPasscodeAction({ type: 'edit', payload: invoice });
    } else {
      onEditInvoice(invoice);
    }
  };

  const handleDeleteClick = (invoice: SaleInvoiceViewRow) => {
    setOpenRowMenuId(null);
    if (isPasscodeEnabled && isPasscodeForTransactionEnabled) {
      setPasscodeAction({ type: 'delete', payload: invoice });
    } else {
      setInvoiceToDelete(invoice);
    }
  };

  const handlePasscodeSuccess = () => {
    if (passcodeAction?.type === 'edit') {
      onEditInvoice(passcodeAction.payload);
    } else if (passcodeAction?.type === 'delete') {
      setInvoiceToDelete(passcodeAction.payload);
    }
    setPasscodeAction(null);
  };

  return (
    <div className="h-full flex flex-col bg-[#D0DCE7] gap-1 overflow-y-auto">
      <SaleInvoiceHeader onViewChange={onViewChange} onBack={onBack} />

      <SaleInvoiceFilters
        selectedMonthKey={selectedMonthKey}
        setSelectedMonthKey={setSelectedMonthKey}
      />

      <SaleInvoiceSummary
        totalSales={totalSales}
        totalReceived={totalReceived}
        totalBalance={totalBalance}
      />

      <SaleInvoiceTable
        showSearchInput={showSearchInput}
        setShowSearchInput={setShowSearchInput}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchInputRef={searchInputRef}
        setOpenRowMenuId={setOpenRowMenuId}
        setOpenRowMenuPosition={setOpenRowMenuPosition}
        openRowMenuId={openRowMenuId}
        handleDownloadCsv={handleDownloadCsv}
        visibleRows={visibleRows}
        statusMessage={statusMessage}
      />

      <SaleInvoiceDialog
        viewingInvoice={viewingInvoice}
        setViewingInvoice={setViewingInvoice}
      />

      <SaleInvoiceContextMenu
        openRowMenuId={openRowMenuId}
        openRowMenuPosition={openRowMenuPosition}
        invoiceRows={invoiceRows}
        openViewDialog={openViewDialog}
        setOpenRowMenuId={setOpenRowMenuId}
        setOpenRowMenuPosition={setOpenRowMenuPosition}
        onEditInvoice={handleEditClick}
        handleDeleteInvoice={handleDeleteClick}
      />

      {passcodeAction && (
        <EnterPasscodeScreen
          onSuccess={handlePasscodeSuccess}
          onCancel={() => setPasscodeAction(null)}
        />
      )}

      <ConfirmDeleteModal
        isOpen={!!invoiceToDelete}
        onClose={() => setInvoiceToDelete(null)}
        onConfirm={handleDeleteInvoice}
        title="Delete Sale Invoice"
        message={invoiceToDelete ? `Are you sure you want to delete invoice ${invoiceToDelete.invoiceNo} for ${invoiceToDelete.partyName}? This action cannot be undone.` : ""}
        isDeleting={isDeleting}
      />
    </div>
  );
}