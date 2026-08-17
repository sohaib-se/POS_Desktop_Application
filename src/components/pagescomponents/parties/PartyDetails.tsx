import { useState } from "react";
import { useSettings } from "@/hooks/useSettings";
import { Edit2, Mail, Search, Printer, MoreVertical, Pencil as PencilIcon, Trash2 as TrashIcon } from "lucide-react";
import type { Party, Transaction, SaleInvoiceEditData, PurchaseBillEditData } from "@/types";
import { AddPurchase } from "@/pages/AddPurchase";
import { SaleInvoiceDialog } from "@/components/pagescomponents/saleinvoices/SaleInvoiceDialog";
import { PurchaseBillDialog } from "@/components/pagescomponents/purchasebills/PurchaseBillDialog";
import { ViewPaymentInModal } from "@/components/pagescomponents/paymentin/ViewPaymentInModal";
import { ViewPaymentOutDialog } from "@/components/pagescomponents/payementout/ViewPaymentOutDialog";
import type { SaleInvoiceViewRow } from "@/components/pagescomponents/saleinvoices/types";
import type { PurchaseBillViewRow } from "@/components/pagescomponents/purchasebills/types";

export type PartyTransactionRow = {
  id: string;
  type: Transaction["type"];
  invoiceNo?: string;
  date: string;
  partyName: string;
  amount: number;
  balance: number;
  paymentType?: string;
  status?: Transaction["status"];
  partyId?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawRow?: any;
};

interface PartyDetailsProps {
  isLoading: boolean;
  selectedParty: Party | null;
  filteredPartyTransactions: PartyTransactionRow[];
  showTransactionSearch: boolean;
  setShowTransactionSearch: (show: boolean) => void;
  transactionSearchTerm: string;
  setTransactionSearchTerm: (term: string) => void;
  handlePrintTransactions: () => void;
  handleExportExcel: () => void;
  openEditPartyDialog: (party: Party) => void;
  isReportView?: boolean;
  loadPartiesAndTransactions?: () => Promise<void>;
  onEditSaleInvoice?: (invoice: SaleInvoiceEditData) => void;
}

export function PartyDetails({
  isLoading,
  selectedParty,
  filteredPartyTransactions,
  showTransactionSearch,
  setShowTransactionSearch,
  transactionSearchTerm,
  setTransactionSearchTerm,
  handlePrintTransactions,
  handleExportExcel,
  openEditPartyDialog,
  isReportView,
  loadPartiesAndTransactions,
  onEditSaleInvoice,
}: PartyDetailsProps) {
  const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });
  const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
  const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;

  const [openRowMenuId, setOpenRowMenuId] = useState<string | null>(null);
  const [openRowMenuPosition, setOpenRowMenuPosition] = useState<{ left: number; top: number } | null>(null);

  const [editingPurchaseInvoice, setEditingPurchaseInvoice] = useState<PurchaseBillEditData | null>(null);
  const [viewingSaleInvoice, setViewingSaleInvoice] = useState<SaleInvoiceViewRow | null>(null);
  const [viewingPurchaseBill, setViewingPurchaseBill] = useState<PurchaseBillViewRow | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [viewingPaymentIn, setViewingPaymentIn] = useState<any | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [viewingPaymentOut, setViewingPaymentOut] = useState<any | null>(null);

  const handleDeleteTransaction = async (transaction: PartyTransactionRow) => {
    const confirmed = window.confirm(`Delete ${transaction.type} transaction ${transaction.invoiceNo || transaction.id}?`);
    if (!confirmed) return;

    try {
      let endpoint = '';
      if (transaction.type === 'Sale') endpoint = `/api/sale_invoices/${transaction.id}`;
      else if (transaction.type === 'Purchase') endpoint = `/api/purchase_bills/${transaction.id}`;
      else if (transaction.type === 'Payment-In') endpoint = `/api/payment_in_records/${transaction.id}`;
      else if (transaction.type === 'Payment-Out') endpoint = `/api/payment_out_records/${transaction.id}`;
      else {
        alert('Cannot delete this type of transaction directly.');
        return;
      }

      const response = await fetch(endpoint, { method: "DELETE" });
      if (!response.ok && response.status !== 204) {
        throw new Error("Failed to delete transaction");
      }
      if (loadPartiesAndTransactions) {
        await loadPartiesAndTransactions();
      }
    } catch (error) {
      console.error(error);
      alert('Failed to delete transaction.');
    } finally {
      setOpenRowMenuId(null);
      setOpenRowMenuPosition(null);
    }
  };

  const selectedPartyBalanceLabel =
    selectedParty && selectedParty.balance > 0
      ? "Amount to Receive"
      : selectedParty && selectedParty.balance < 0
      ? "Amount to Pay"
      : "Balance Settled";

  const selectedPartyBalanceAmount = selectedParty
    ? Math.abs(selectedParty.balance).toFixed(2)
    : "0.00";

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center bg-white rounded-md mb-1 shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53935]"></div>
        </div>
      ) : selectedParty ? (
        <>
          {/* Party Details Card */}
          <div className="bg-white rounded-md shadow-sm mb-1">
            <div className="p-5 border-b border-gray-200 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedParty.name}
                  </h2>
                  {!isReportView && (
                    <Edit2
                      onClick={() => openEditPartyDialog(selectedParty)}
                      className="w-4 h-4 text-blue-500 cursor-pointer"
                    />
                  )}
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600"
                    onClick={() => {
                      if (selectedParty?.phone) {
                        const formattedPhone = selectedParty.phone.replace(/[^0-9+]/g, "");
                        window.open(`https://wa.me/${formattedPhone}`, "_blank");
                      }
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4 text-white"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                  </button>
                  <button
                    className="w-9 h-9 rounded-full bg-orange-400 flex items-center justify-center hover:bg-orange-500"
                    onClick={() => {
                      if (selectedParty?.email) {
                        window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${selectedParty.email}`, "_blank");
                      }
                    }}
                  >
                    <Mail className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Party Info */}
              <div className="flex gap-10">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Phone Number</p>
                  <p className="text-sm text-gray-900">{selectedParty.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Email</p>
                  <p className="text-sm text-gray-900">{selectedParty.email || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Credit / Balance</p>
                  <p className="text-sm text-gray-900">{selectedPartyBalanceLabel}</p>
                  <p
                    className={`text-sm font-semibold ${
                      selectedParty.balance > 0
                        ? "text-green-600"
                        : selectedParty.balance < 0
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    {currencyStr} {selectedPartyBalanceAmount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="flex-1 bg-white rounded-md flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 shrink-0">
              <h3 className="text-base font-semibold text-gray-900">Transactions</h3>
              <div className="flex gap-2 items-center">
                {showTransactionSearch && (
                  <div className="flex items-center bg-gray-50 rounded px-3 py-1.5 border border-gray-200 w-64 mr-2">
                    <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={transactionSearchTerm}
                      onChange={(e) => setTransactionSearchTerm(e.target.value)}
                      onBlur={() => {
                        setTimeout(() => {
                          setShowTransactionSearch(false);
                          setTransactionSearchTerm("");
                        }, 150);
                      }}
                      className="w-full bg-transparent border-none outline-none text-sm"
                      autoFocus
                    />
                  </div>
                )}
                {!showTransactionSearch && (
                  <button
                    onClick={() => setShowTransactionSearch(true)}
                    className="p-1.5 hover:bg-gray-100 rounded"
                  >
                    <Search className="w-4 h-4 text-gray-500" />
                  </button>
                )}
                <button
                  onClick={handlePrintTransactions}
                  className="p-1.5 hover:bg-gray-100 rounded"
                >
                  <Printer className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={handleExportExcel}
                  className="p-1.5 hover:bg-gray-100 rounded relative"
                >
                  <span className="bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    xls
                  </span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">
                      <div className="flex items-center gap-2">
                        <span>Type</span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">
                      <div className="flex items-center gap-2">
                        <span>Number</span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">
                      <div className="flex items-center gap-2">
                        <span>Date</span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">
                      <div className="flex items-center justify-end gap-2">
                        <span>Total</span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">
                      <div className="flex items-center justify-end gap-2">
                        <span>Balance</span>
                      </div>
                    </th>
                    <th className="px-2 py-3 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPartyTransactions.length > 0 ? (
                    filteredPartyTransactions.map((t) => (
                      <tr
                        key={t.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">
                          <span
                            className={`${
                              t.type === "Sale"
                                ? "text-green-600"
                                : t.type === "Purchase"
                                ? "text-red-600"
                                : "text-blue-600"
                            }`}
                          >
                            {t.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{t.invoiceNo}</td>
                        <td className="px-4 py-3 text-gray-700">{t.date}</td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {currencyStr} {t.amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {currencyStr} {t.balance.toFixed(2)}
                        </td>
                        <td className="px-2 py-3 text-center relative">
                          {!isReportView && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const rect = e.currentTarget.getBoundingClientRect();
                                const menuWidth = 120;
                                const menuHeight = 80;
                                const nextLeft = Math.max(8, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8));
                                const nextTop = rect.bottom + menuHeight > window.innerHeight
                                  ? Math.max(8, rect.top - menuHeight - 8)
                                  : rect.bottom + 8;
                                setOpenRowMenuPosition(
                                  openRowMenuId === t.id && openRowMenuPosition
                                    ? null
                                    : { left: nextLeft, top: nextTop }
                                );
                                setOpenRowMenuId((prev) => (prev === t.id ? null : t.id));
                              }}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-400 mx-auto cursor-pointer" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        No transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Select a party to view details
        </div>
      )}
      
      {openRowMenuId && openRowMenuPosition && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setOpenRowMenuId(null);
              setOpenRowMenuPosition(null);
            }}
          />
          <div
            className="fixed z-50 w-36 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
            style={{ left: openRowMenuPosition.left, top: openRowMenuPosition.top }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
              onClick={() => {
                const invoice = filteredPartyTransactions.find(t => t.id === openRowMenuId);
                if (invoice?.rawRow) {
                  const raw = invoice.rawRow;
                  if (invoice.type === 'Sale') {
                    setViewingSaleInvoice({
                      id: raw.id, invoiceNo: raw.invoice_no, date: raw.date, partyName: raw.party_name,
                      partyId: raw.party_id, partyPhone: raw.party_phone, transaction: raw.transaction_type,
                      paymentType: raw.payment_type || raw.payment_mode || "", paymentMode: raw.payment_mode,
                      amount: Number(raw.amount || 0), balance: Number(raw.balance || 0), monthKey: "",
                      subtotal: Number(raw.subtotal || 0), discountPercent: Number(raw.discount_percent || 0),
                      discountAmount: Number(raw.discount_amount || 0), taxLabel: raw.tax_label,
                      taxRate: Number(raw.tax_rate || 0), taxAmount: Number(raw.tax_amount || 0),
                      roundOff: Boolean(raw.round_off), roundOffAmount: Number(raw.round_off_amount || 0),
                      description: raw.description, lineItemsJson: raw.line_items_json
                    });
                  } else if (invoice.type === 'Purchase') {
                    setViewingPurchaseBill({
                      id: raw.id, invoiceNo: raw.invoice_no, date: raw.date, partyName: raw.party_name,
                      partyId: raw.party_id, partyPhone: raw.party_phone, transaction: raw.transaction_type,
                      paymentType: raw.payment_type || raw.payment_mode || "", paymentMode: raw.payment_mode,
                      amount: Number(raw.amount || 0), balance: Number(raw.balance || 0), monthKey: "",
                      subtotal: Number(raw.subtotal || 0), discountPercent: Number(raw.discount_percent || 0),
                      discountAmount: Number(raw.discount_amount || 0), taxLabel: raw.tax_label,
                      taxRate: Number(raw.tax_rate || 0), taxAmount: Number(raw.tax_amount || 0),
                      roundOff: Boolean(raw.round_off), roundOffAmount: Number(raw.round_off_amount || 0),
                      description: raw.description, lineItemsJson: raw.line_items_json
                    });
                  } else if (invoice.type === 'Payment-In') {
                    setViewingPaymentIn({
                      id: raw.id, type: raw.transaction_type, receiptNo: raw.receipt_no, date: raw.date,
                      partyName: raw.party_name, paymentMode: raw.payment_mode, amount: Number(raw.amount || 0),
                      description: raw.description, monthKey: "", status: raw.status, partyId: raw.party_id
                    });
                  } else if (invoice.type === 'Payment-Out') {
                    setViewingPaymentOut({
                      id: raw.id, type: raw.transaction_type, receiptNo: raw.receipt_no, date: raw.date,
                      partyName: raw.party_name, paymentMode: raw.payment_mode, amount: Number(raw.amount || 0),
                      description: raw.description, monthKey: "", status: raw.status, partyId: raw.party_id
                    });
                  }
                }
                setOpenRowMenuId(null);
                setOpenRowMenuPosition(null);
              }}
            >
              <Search className="w-4 h-4 text-gray-500" />
              View
            </button>
            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
              onClick={() => {
                const invoice = filteredPartyTransactions.find(t => t.id === openRowMenuId);
                if (invoice?.rawRow) {
                  const raw = invoice.rawRow;
                  if (invoice.type === 'Sale' && onEditSaleInvoice) {
                    onEditSaleInvoice({
                      id: raw.id, invoiceNo: raw.invoice_no, date: raw.date, partyName: raw.party_name,
                      partyId: raw.party_id, partyPhone: raw.party_phone,
                      paymentType: raw.payment_type || raw.payment_mode || "", paymentMode: raw.payment_mode,
                      amount: Number(raw.amount || 0), balance: Number(raw.balance || 0),
                      subtotal: Number(raw.subtotal || 0), discountPercent: Number(raw.discount_percent || 0),
                      discountAmount: Number(raw.discount_amount || 0), taxLabel: raw.tax_label,
                      taxRate: Number(raw.tax_rate || 0), taxAmount: Number(raw.tax_amount || 0),
                      roundOff: Boolean(raw.round_off), roundOffAmount: Number(raw.round_off_amount || 0),
                      description: raw.description, lineItemsJson: raw.line_items_json
                    });
                  } else if (invoice.type === 'Purchase') {
                    setEditingPurchaseInvoice({
                      id: raw.id, invoiceNo: raw.invoice_no, date: raw.date, partyName: raw.party_name,
                      partyId: raw.party_id, partyPhone: raw.party_phone,
                      paymentType: raw.payment_type || raw.payment_mode || "", paymentMode: raw.payment_mode,
                      amount: Number(raw.amount || 0), balance: Number(raw.balance || 0),
                      subtotal: Number(raw.subtotal || 0), discountPercent: Number(raw.discount_percent || 0),
                      discountAmount: Number(raw.discount_amount || 0), taxLabel: raw.tax_label,
                      taxRate: Number(raw.tax_rate || 0), taxAmount: Number(raw.tax_amount || 0),
                      roundOff: Boolean(raw.round_off), roundOffAmount: Number(raw.round_off_amount || 0),
                      description: raw.description, lineItemsJson: raw.line_items_json
                    });
                  } else {
                    alert(`Edit for ${invoice.type} is not directly supported from the party view yet.`);
                  }
                }
                setOpenRowMenuId(null);
                setOpenRowMenuPosition(null);
              }}
            >
              <PencilIcon className="w-4 h-4 text-gray-500" />
              Edit
            </button>
            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              onClick={() => {
                const invoice = filteredPartyTransactions.find(t => t.id === openRowMenuId);
                if (invoice) {
                  handleDeleteTransaction(invoice);
                } else {
                  setOpenRowMenuId(null);
                  setOpenRowMenuPosition(null);
                }
              }}
            >
              <TrashIcon className="w-4 h-4" />
              Delete
            </button>
          </div>
        </>
      )}

      {/* Render Dialogs */}
      <SaleInvoiceDialog viewingInvoice={viewingSaleInvoice} setViewingInvoice={setViewingSaleInvoice} />
      <PurchaseBillDialog viewingInvoice={viewingPurchaseBill} setViewingInvoice={setViewingPurchaseBill} />
      <ViewPaymentInModal viewingRecord={viewingPaymentIn} setViewingRecord={setViewingPaymentIn} />
      <ViewPaymentOutDialog viewingRecord={viewingPaymentOut} setViewingRecord={setViewingPaymentOut} />

      {editingPurchaseInvoice && (
        <div className="fixed inset-0 z-[100]">
          <AddPurchase
            initialInvoice={editingPurchaseInvoice}
            onClose={() => setEditingPurchaseInvoice(null)}
            onSave={() => {
              setEditingPurchaseInvoice(null);
              if (loadPartiesAndTransactions) loadPartiesAndTransactions();
            }}
          />
        </div>
      )}
    </div>
  );
}
