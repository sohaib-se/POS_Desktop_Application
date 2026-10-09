import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSettings } from "@/hooks/useSettings";
import { AddPurchase } from "@/pages/AddPurchase";
import type { PurchaseBillEditData } from "@/types";
import type { PurchaseBillApiRow, PurchaseBillViewRow } from "../components/pagescomponents/purchasebills/types";
import {
  fallbackPurchaseBills,
  getMonthKeyFromDate,
  formatDateDisplay,
} from "../components/pagescomponents/purchasebills/utils";
import { exportPurchaseBillsToExcel } from "@/utils/exportPurchaseBillsExcel";
import { PurchaseBillHeader } from "../components/pagescomponents/purchasebills/PurchaseBillHeader";
import { PurchaseBillFilters } from "../components/pagescomponents/purchasebills/PurchaseBillFilters";
import { PurchaseBillSummary } from "../components/pagescomponents/purchasebills/PurchaseBillSummary";
import { PurchaseBillTable } from "../components/pagescomponents/purchasebills/PurchaseBillTable";
import { PurchaseBillContextMenu } from "../components/pagescomponents/purchasebills/PurchaseBillContextMenu";
import { PurchaseBillDialog } from "../components/pagescomponents/purchasebills/PurchaseBillDialog";

import { ConfirmDeleteModal } from "@/components/common/ConfirmDeleteModal";
import { PrintTab, type SalePrintData } from "@/components/pagescomponents/settings/tabs/PrintTab";

interface PurchaseBillsProps {
  onBack?: () => void;
}

export function PurchaseBills({ onBack }: PurchaseBillsProps = {}) {
  const [invoiceRows, setInvoiceRows] = useState<PurchaseBillViewRow[]>([]);
  const [showAddPurchase, setShowAddPurchase] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<PurchaseBillEditData | null>(null);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [openRowMenuId, setOpenRowMenuId] = useState<string | null>(null);
  const [openRowMenuPosition, setOpenRowMenuPosition] = useState<{ left: number; top: number } | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<PurchaseBillViewRow | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });
  const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
  const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;
  const [deleteModalState, setDeleteModalState] = useState<{isOpen: boolean, invoice: PurchaseBillViewRow | null}>({isOpen: false, invoice: null});
  const [isDeleting, setIsDeleting] = useState(false);
  const [printingInvoice, setPrintingInvoice] = useState<SalePrintData | null>(null);
  const [blockedEditModal, setBlockedEditModal] = useState<{
    invoiceNo: string;
    partyName: string;
  } | null>(null);

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
        attachmentImagePath: invoice.attachment_image_path ?? null,
        attachmentImageName: invoice.attachment_image_name ?? null,
        attachmentDocumentPath: invoice.attachment_document_path ?? null,
        attachmentDocumentName: invoice.attachment_document_name ?? null,
      }));

      setInvoiceRows(normalizedRows);
      if (!preserveMonthSelection) {
        setSelectedMonthKey((previousMonthKey) => {
          if (previousMonthKey) {
            return previousMonthKey;
          }

          return getMonthKeyFromDate(formatDateDisplay(new Date()));
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
      const partyMatch = row.partyName.toLowerCase().includes(normalizedQuery);
      const invoiceMatch = row.invoiceNo.toLowerCase().includes(normalizedQuery);
      const amountMatch = row.amount.toString().toLowerCase().includes(normalizedQuery);
      
      return partyMatch || invoiceMatch || amountMatch;
    });
  }, [searchQuery, selectedMonthRows]);

  const totalPurchase = visibleRows.reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalPaid = visibleRows.filter((invoice) => invoice.balance === 0).reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalUnpaid = visibleRows.reduce((sum, invoice) => sum + invoice.balance, 0);


  const handleDownloadCsv = () => {
    exportPurchaseBillsToExcel(
      visibleRows.map((r) => ({
        date: r.date,
        invoiceNo: r.invoiceNo,
        partyName: r.partyName,
        transaction: r.transaction ?? "",
        paymentType: r.paymentType ?? "",
        amount: r.amount,
        balance: r.balance,
      })),
      selectedMonthKey || "all",
      currencyStr
    );
  };

  const openViewDialog = (invoice: PurchaseBillViewRow) => {
    setViewingInvoice(invoice);
  };

  const handleDeleteInvoice = (invoice: PurchaseBillViewRow) => {
    setDeleteModalState({isOpen: true, invoice});
  };

  const confirmDelete = async () => {
    const invoice = deleteModalState.invoice;
    if (!invoice) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/purchase_bills/${invoice.id}`, {
        method: "DELETE",
      });

      if (response.status === 409) {
        setBlockedEditModal({
          invoiceNo: invoice.invoiceNo,
          partyName: invoice.partyName,
        });
        setDeleteModalState({ isOpen: false, invoice: null });
        return;
      }

      if (!response.ok && response.status !== 204) {
        throw new Error("Failed to delete purchase bill");
      }

      setInvoiceRows((previousRows) => previousRows.filter((row) => row.id !== invoice.id));
      // Notify Cash In Hand page to re-fetch — the linked cash_purchase_ transaction was also deleted server-side.
      window.dispatchEvent(new CustomEvent('purchase-bills-refresh'));
      setStatusMessage("Purchase bill deleted successfully.");
      setDeleteModalState({isOpen: false, invoice: null});
    } catch (error) {
      console.error(error);
      setStatusMessage("Failed to delete the selected purchase bill.");
    } finally {
      setIsDeleting(false);
      setOpenRowMenuId(null);
    }
  };

  const handleEditClick = async (invoice: PurchaseBillViewRow) => {
    try {
      const res = await fetch(`/api/purchase_bills?checkConsumed=${invoice.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.consumed) {
          setBlockedEditModal({
            invoiceNo: invoice.invoiceNo,
            partyName: invoice.partyName,
          });
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setEditingInvoice(invoice as any);
    setShowAddPurchase(true);
  };

  const handleDeleteClick = (invoice: PurchaseBillViewRow) => {
    handleDeleteInvoice(invoice);
  };



  const handlePrintClick = (invoice: PurchaseBillViewRow) => {
    let parsedItems: SalePrintData['records'] = [];
    if (invoice.lineItemsJson) {
      try {
        const rawItems = JSON.parse(invoice.lineItemsJson) as Array<any>;
        parsedItems = rawItems.map((item: any) => ({
          id: item.id,
          itemName: item.name ?? item.itemName ?? item.item_name ?? '',
          quantity: Number(item.quantity ?? item.qty ?? 0),
          unit: item.unit && item.unit !== 'NONE' ? item.unit : '',
          pricePerUnit: Number(item.price ?? item.pricePerUnit ?? item.price_per_unit ?? 0),
          amount: Number(item.amount ?? 0),
        }));
      } catch {
        parsedItems = [];
      }
    }

    const received = invoice.paymentMode === 'cash' || invoice.paymentType?.toLowerCase() === 'cash'
      ? invoice.amount
      : invoice.amount - invoice.balance;

    const saleData: SalePrintData = {
      records: parsedItems,
      invoiceNo: invoice.invoiceNo,
      invoiceDate: invoice.date,
      customerName: invoice.partyName,
      customerContact: invoice.partyPhone,
      customerPhone: invoice.partyPhone,
      received,
      paymentMode: invoice.paymentMode ?? invoice.paymentType ?? 'Credit',
      previousBalance: 0,
      discount: invoice.discountAmount ?? 0,
      discountPercent: invoice.discountPercent ?? 0,
      taxPercent: invoice.taxRate != null ? invoice.taxRate * 100 : 0,
      description: invoice.description,
      documentTitle: "Purchase Invoice",
    };

    setPrintingInvoice(saleData);
  };

  return (
    <div className="h-full flex flex-col bg-[#D0DCE7] gap-1 overflow-y-auto">
      <PurchaseBillHeader
        onAddPurchase={() => { setEditingInvoice(null); setShowAddPurchase(true); }}
        onBack={onBack}
      />

      <PurchaseBillFilters
        selectedMonthKey={selectedMonthKey}
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
        onEditInvoice={handleEditClick}
        handleDeleteInvoice={handleDeleteClick}
        onPrintInvoice={handlePrintClick}
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


      <ConfirmDeleteModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({isOpen: false, invoice: null})}
        onConfirm={confirmDelete}
        title="Delete Purchase Bill"
        message={`Are you sure you want to delete purchase invoice ${deleteModalState.invoice?.invoiceNo} for ${deleteModalState.invoice?.partyName}? This action cannot be undone.`}
        isDeleting={isDeleting}
      />

      {/* Print Preview Modal */}
      {printingInvoice && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: '#f3f4f6',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <PrintTab
            isPreviewMode={true}
            saleData={printingInvoice}
            onClose={() => setPrintingInvoice(null)}
          />
        </div>
      )}

      {/* Blocked Edit Warning Modal */}
      {blockedEditModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setBlockedEditModal(null)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 to-orange-500" />
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-11 h-11 rounded-full bg-amber-50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-gray-900 leading-tight">
                    Cannot Edit This Purchase Bill
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Invoice #{blockedEditModal.invoiceNo} -{" "}
                    <span className="font-medium text-gray-700">{blockedEditModal.partyName}</span>
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800 leading-relaxed">
                Sales have already been made from this purchase bill (the remaining stock and the stock quantity are not equal).
                To edit this purchase bill, you must first delete or edit the sales that consumed stock from this batch.
              </div>

              <div className="flex justify-end mt-5">
                <button
                  onClick={() => setBlockedEditModal(null)}
                  className="px-6 py-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
