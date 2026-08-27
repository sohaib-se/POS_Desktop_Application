import { useSettings } from "@/hooks/useSettings";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Calendar, Search, Printer, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { formatDateDisplay } from "../../saleinvoices/utils";
import type { SaleInvoiceEditData, PurchaseBillEditData } from "@/types";
import { SaleInvoiceDialog } from "../../saleinvoices/SaleInvoiceDialog";
import { PurchaseBillDialog } from "../../purchasebills/PurchaseBillDialog";
import { AddPurchase } from "../../../../pages/AddPurchase";
import { EnterPasscodeScreen } from "@/components/common/EnterPasscodeScreen";
import { ConfirmDeleteModal } from "@/components/common/ConfirmDeleteModal";

interface DaybookReportProps {
  onBack: () => void;
  onEditInvoice?: (invoice: SaleInvoiceEditData) => void;
}

interface TransactionRow {
  id: string; // use string id for uniqueness across both
  originalId: number;
  date: string;
  type: "Sale" | "Purchase";
  invoiceNo: string;
  partyName: string;
  paymentType: string;
  amount: number;
  balance: number;
  rawInvoice: any; // Store the raw invoice data for viewing and editing
}

export function DaybookReport({ onBack, onEditInvoice }: DaybookReportProps) {
  const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });
  const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
  const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;

  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const getTodayYMD = () => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayYMD());

  // Table state
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const placeholders = ["Party Name", "Invoice No.", "Amount"];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showSearchInput &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        !searchQuery
      ) {
        setShowSearchInput(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSearchInput, searchQuery]);

  // Menu state
  const [openRowMenuId, setOpenRowMenuId] = useState<string | null>(null);
  const [openRowMenuPosition, setOpenRowMenuPosition] = useState<{ left: number; top: number } | null>(null);

  // Dialog states
  const [viewingSale, setViewingSale] = useState<any | null>(null);
  const [viewingPurchase, setViewingPurchase] = useState<any | null>(null);
  const [editingPurchase, setEditingPurchase] = useState<PurchaseBillEditData | null>(null);
  const [showAddPurchase, setShowAddPurchase] = useState(false);

  const [isPasscodeEnabled] = useSettings('settings.isPasscodeEnabled', false);
  const [isPasscodeForTransactionEnabled] = useSettings('settings.isPasscodeForTransactionEnabled', false);
  const [passcodeAction, setPasscodeAction] = useState<{ type: 'edit' | 'delete', payload: TransactionRow } | null>(null);
  const [deleteModalState, setDeleteModalState] = useState<{isOpen: boolean, tx: TransactionRow | null}>({isOpen: false, tx: null});
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditClick = (tx: TransactionRow) => {
    if (isPasscodeEnabled && isPasscodeForTransactionEnabled) {
      setPasscodeAction({ type: 'edit', payload: tx });
    } else {
      handleEditTransaction(tx);
    }
  };

  const handleDeleteClick = (tx: TransactionRow) => {
    if (isPasscodeEnabled && isPasscodeForTransactionEnabled) {
      setPasscodeAction({ type: 'delete', payload: tx });
    } else {
      handleDeleteTransaction(tx);
    }
  };

  const handlePasscodeSuccess = () => {
    if (passcodeAction?.type === 'edit') {
      handleEditTransaction(passcodeAction.payload);
    } else if (passcodeAction?.type === 'delete') {
      handleDeleteTransaction(passcodeAction.payload);
    }
    setPasscodeAction(null);
  };

  useEffect(() => {
    if (showSearchInput) {
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  }, [showSearchInput]);

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

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const [salesRes, purchasesRes] = await Promise.all([
        fetch("/api/sale_invoices").catch(() => null),
        fetch("/api/purchase_bills").catch(() => null)
      ]);
      
      let allTx: TransactionRow[] = [];
      const parts = selectedDate.split('-');
      const targetDateString = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : formatDateDisplay(new Date());
      
      if (salesRes && salesRes.ok) {
        const sales = await salesRes.json();
        allTx = allTx.concat(sales
          .filter((s: any) => s.date === targetDateString)
          .map((s: any) => ({
            id: `sale-${s.id}`,
            originalId: s.id,
            date: s.date,
            type: "Sale" as const,
            invoiceNo: s.invoice_no,
            partyName: s.party_name,
            paymentType: s.payment_type ?? s.payment_mode ?? "",
            amount: Number(s.amount || 0),
            balance: Number(s.balance || 0),
            rawInvoice: {
              id: s.id,
              invoiceNo: s.invoice_no,
              date: s.date,
              partyName: s.party_name,
              partyId: s.party_id ?? undefined,
              partyPhone: s.party_phone ?? undefined,
              transaction: s.transaction_type,
              paymentType: s.payment_type ?? s.payment_mode ?? "",
              paymentMode: s.payment_mode ?? undefined,
              amount: Number(s.amount ?? 0),
              balance: Number(s.balance ?? 0),
              subtotal: Number(s.subtotal ?? 0),
              discountPercent: Number(s.discount_percent ?? 0),
              discountAmount: Number(s.discount_amount ?? 0),
              taxLabel: s.tax_label ?? undefined,
              taxRate: Number(s.tax_rate ?? 0),
              taxAmount: Number(s.tax_amount ?? 0),
              roundOff: Boolean(s.round_off),
              roundOffAmount: Number(s.round_off_amount ?? 0),
              description: s.description ?? undefined,
              lineItemsJson: s.line_items_json ?? null,
            }
          }))
        );
      }
      
      if (purchasesRes && purchasesRes.ok) {
        const purchases = await purchasesRes.json();
        allTx = allTx.concat(purchases
          .filter((p: any) => p.date === targetDateString)
          .map((p: any) => ({
            id: `purchase-${p.id}`,
            originalId: p.id,
            date: p.date,
            type: "Purchase" as const,
            invoiceNo: p.invoice_no,
            partyName: p.party_name,
            paymentType: p.payment_type ?? p.payment_mode ?? "",
            amount: Number(p.amount || 0),
            balance: Number(p.balance || 0),
            rawInvoice: {
              id: p.id,
              invoiceNo: p.invoice_no,
              date: p.date,
              partyName: p.party_name,
              partyId: p.party_id ?? undefined,
              partyPhone: p.party_phone ?? undefined,
              transaction: p.transaction_type,
              paymentType: p.payment_type ?? p.payment_mode ?? "",
              paymentMode: p.payment_mode ?? undefined,
              amount: Number(p.amount ?? 0),
              balance: Number(p.balance ?? 0),
              subtotal: Number(p.subtotal ?? 0),
              discountPercent: Number(p.discount_percent ?? 0),
              discountAmount: Number(p.discount_amount ?? 0),
              taxLabel: p.tax_label ?? undefined,
              taxRate: Number(p.tax_rate ?? 0),
              taxAmount: Number(p.tax_amount ?? 0),
              roundOff: Boolean(p.round_off),
              roundOffAmount: Number(p.round_off_amount ?? 0),
              description: p.description ?? undefined,
              lineItemsJson: p.line_items_json ?? null,
            }
          }))
        );
      }
      
      // Sort by date descending (though they are all today, maybe by ID as fallback)
      allTx.sort((a, b) => b.originalId - a.originalId);
      
      setTransactions(allTx);

    } catch (error) {
      console.error("Failed to load transactions", error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  const visibleRows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return transactions;
    }
    return transactions.filter((row) => {
        const partyMatch = row.partyName.toLowerCase().includes(normalizedQuery);
        const invoiceMatch = row.invoiceNo.toLowerCase().includes(normalizedQuery);
        const amountMatch = row.amount.toString().toLowerCase().includes(normalizedQuery);
        return partyMatch || invoiceMatch || amountMatch;
    });
  }, [searchQuery, transactions]);

  const totalSales = transactions.filter(r => r.type === 'Sale').reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalPurchases = transactions.filter(r => r.type === 'Purchase').reduce((sum, invoice) => sum + invoice.amount, 0);

  const isToday = selectedDate === getTodayYMD();
  const displayDateStr = selectedDate.split('-').reverse().join('/');

  const handleDownloadCsv = () => {
    // simplified csv download for reporting
    const headers = ["Date", "Type", "Invoice No", "Party Name", "Payment Type", "Amount", "Balance"];
    const rows = visibleRows.map(row => 
      [row.date, row.type, row.invoiceNo, row.partyName, row.paymentType, row.amount, row.balance].join(",")
    );
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `daybook-${displayDateStr.replace(/\//g, '-')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDeleteTransaction = (tx: TransactionRow) => {
    setDeleteModalState({isOpen: true, tx});
  };

  const confirmDelete = async () => {
    const tx = deleteModalState.tx;
    if (!tx) return;

    try {
      setIsDeleting(true);
      const isSale = tx.type === "Sale";
      const endpoint = isSale ? `/api/sale_invoices/${tx.originalId}` : `/api/purchase_bills/${tx.originalId}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      if (!response.ok && response.status !== 204) {
        throw new Error(`Failed to delete ${tx.type.toLowerCase()}`);
      }

      setTransactions((prev) => prev.filter((row) => row.id !== tx.id));
      setDeleteModalState({isOpen: false, tx: null});
    } catch (error) {
      console.error(error);
      alert(`Failed to delete the selected transaction.`);
    } finally {
      setIsDeleting(false);
      setOpenRowMenuId(null);
    }
  };

  const handleViewTransaction = (tx: TransactionRow) => {
    if (tx.type === "Sale") {
      setViewingSale(tx.rawInvoice);
    } else {
      setViewingPurchase(tx.rawInvoice);
    }
  };

  const handleEditTransaction = (tx: TransactionRow) => {
    if (tx.type === "Sale") {
      if (onEditInvoice) onEditInvoice(tx.rawInvoice);
    } else {
      setEditingPurchase(tx.rawInvoice);
      setShowAddPurchase(true);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#D0DCE7] gap-1 overflow-y-auto w-full">
      {/* Header matching SaleInvoiceHeader */}
      <div className="p-4 bg-white flex items-center justify-between shrink-0 w-full rounded-md mt-1 mx-1">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full mr-1 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Daybook Report</h2>
        </div>
      </div>

      {/* Filters matching SaleInvoiceFilters */}
      <div
        className="p-4 bg-white rounded-md shadow-sm flex items-center gap-4 shrink-0"
        style={{ marginLeft: "4px", marginRight: "4px" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">Filter By day:</span>
          <input 
            type="date"
            className="px-3 py-2 border border-gray-300 bg-gray-50 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008AC9] transition-all shadow-sm hover:border-gray-400 w-44"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div
        className="p-4 bg-white rounded-md shadow-sm shrink-0 flex gap-4"
        style={{ marginLeft: "4px", marginRight: "4px" }}
      >
        <div className="flex-1 max-w-sm bg-[#F6F0FB] rounded-xl p-4 border border-[#E8D7F6]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-[#6B6B83]">{isToday ? "Today's " : ""}Total Sales</span>
          </div>
          <p className="text-xl font-bold text-[#1C1F2A]">
            {currencyStr} {totalSales.toLocaleString()}
          </p>
        </div>
        
        <div className="flex-1 max-w-sm bg-[#E6F4EA] rounded-xl p-4 border border-[#CEEAD6]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-[#3D7D50]">{isToday ? "Today's " : ""}Purchase Bill</span>
          </div>
          <p className="text-xl font-bold text-[#134D25]">
            {currencyStr} {totalPurchases.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Table matching SaleInvoiceTable */}
      <div
        className="bg-white rounded-md shadow-sm flex flex-col sticky top-0 z-10"
        style={{ marginLeft: "4px", marginRight: "4px", height: "100%", flexShrink: 0 }}
      >
        <div className="flex items-center justify-between px-6 pt-4 pb-2 border-b border-gray-200">
          <h3 className="text-base font-bold text-[#222B45] tracking-wide">
            TRANSACTIONS FOR {displayDateStr}
          </h3>
          <div className="flex gap-2 items-center h-10" ref={searchContainerRef}>
            <div 
              className={`flex items-center overflow-hidden transition-all duration-300 ease-out rounded-full h-9 ${
                showSearchInput 
                  ? "w-64 bg-white border border-blue-500 ring-4 ring-blue-50 mr-2" 
                  : "w-9 bg-transparent border border-transparent hover:bg-gray-100 cursor-pointer"
              }`}
              onClick={(e) => {
                if (!showSearchInput) {
                  e.stopPropagation();
                  setShowSearchInput(true);
                  setTimeout(() => searchInputRef.current?.focus(), 150);
                }
              }}
            >
              <div className="flex items-center justify-center h-full w-9 shrink-0">
                <Search className={`w-4 h-4 ${showSearchInput ? "text-gray-400" : "text-gray-500"}`} />
              </div>
              <div className={`relative flex-1 h-full flex items-center transition-opacity duration-200 ${
                  showSearchInput ? "opacity-100 delay-100" : "opacity-0"
                }`}>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none focus:ring-0 focus:outline-none focus:border-transparent text-sm h-full w-full pr-3 relative z-10"
                />
                {!searchQuery && (
                  <div className="absolute left-0 pointer-events-none flex items-center h-full w-full overflow-hidden text-gray-400 text-sm">
                    <span className="whitespace-pre">Search </span>
                    <div className="relative h-full flex-1 overflow-hidden">
                      {placeholders.map((ph, idx) => (
                        <span
                          key={ph}
                          className={`absolute top-0 left-0 flex items-center h-full transition-all duration-700 ease-in-out ${
                            idx === placeholderIndex ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                          }`}
                        >
                          {ph}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="p-1.5 hover:bg-[#F7F9FB] rounded"
              title="Print"
            >
              <Printer className="w-4 h-4 text-[#7B8A9A]" />
            </button>
            <button
              onClick={(event) => {
                event.stopPropagation();
                handleDownloadCsv();
              }}
              className="p-1.5 hover:bg-[#F7F9FB] rounded relative"
              title="Download Excel/CSV"
            >
              <span className="bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                xls
              </span>
            </button>
          </div>
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Invoice no</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Party Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Payment Type</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Amount</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Balance</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-500">
                    Loading transactions...
                  </td>
                </tr>
              ) : visibleRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-500">
                    No transactions found for the selected date.
                  </td>
                </tr>
              ) : (
                visibleRows.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">{invoice.date}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 ${invoice.type === 'Sale' ? 'text-green-600' : 'text-blue-600'}`}>
                        <span className={`w-2 h-2 rounded-full ${invoice.type === 'Sale' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                        {invoice.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">{invoice.invoiceNo}</td>
                    <td className="px-4 py-3">{invoice.partyName}</td>
                    <td className="px-4 py-3">{invoice.paymentType}</td>
                    <td className="px-4 py-3 text-right">{currencyStr} {invoice.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{currencyStr} {invoice.balance.toLocaleString()}</td>
                    <td className="px-4 py-3 relative">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-1.5 hover:bg-gray-100 rounded" title="Print">
                          <Printer className="w-4 h-4 text-gray-500" />
                        </button>

                        <button
                          className="p-1.5 hover:bg-gray-100 rounded"
                          title="More actions"
                          onClick={(event) => {
                            event.stopPropagation();
                            const targetRect = event.currentTarget.getBoundingClientRect();
                            const menuWidth = 144;
                            const menuHeight = 96;
                            const nextLeft = Math.max(8, Math.min(targetRect.right - menuWidth, window.innerWidth - menuWidth - 8));
                            const nextTop = targetRect.bottom + menuHeight > window.innerHeight
                              ? Math.max(8, targetRect.top - menuHeight - 8)
                              : targetRect.bottom + 8;

                            setOpenRowMenuPosition((previousPosition) =>
                              openRowMenuId === invoice.id && previousPosition
                                ? null
                                : { left: nextLeft, top: nextTop },
                            );
                            setOpenRowMenuId((previous) =>
                              previous === invoice.id ? null : invoice.id,
                            );
                          }}
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {openRowMenuId && openRowMenuPosition && (
        <div
          className="fixed z-50 w-36 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
          style={{ left: openRowMenuPosition.left, top: openRowMenuPosition.top }}
          onClick={(event) => event.stopPropagation()}
        >
          {(() => {
            const tx = visibleRows.find((row) => row.id === openRowMenuId);
            if (!tx) return null;
            return (
              <>
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                  onClick={() => {
                    handleViewTransaction(tx);
                    setOpenRowMenuId(null);
                  }}
                >
                  <Search className="w-4 h-4 text-gray-500" />
                  View
                </button>
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                  onClick={() => {
                    handleEditClick(tx);
                    setOpenRowMenuId(null);
                  }}
                >
                  <Pencil className="w-4 h-4 text-gray-500" />
                  Edit
                </button>
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  onClick={() => {
                    handleDeleteClick(tx);
                    setOpenRowMenuId(null);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            );
          })()}
        </div>
      )}

      {/* Dialogs */}
      <SaleInvoiceDialog viewingInvoice={viewingSale} setViewingInvoice={setViewingSale} />
      <PurchaseBillDialog viewingInvoice={viewingPurchase} setViewingInvoice={setViewingPurchase} />

      {/* Add Purchase Dialog for editing */}
      {showAddPurchase && (
        <div className="fixed inset-0 z-[100]">
          <AddPurchase
            initialInvoice={editingPurchase}
            onClose={() => {
              setShowAddPurchase(false);
              setEditingPurchase(null);
            }}
            onSave={() => {
              void loadTransactions();
            }}
          />
        </div>
      )}

      {passcodeAction && (
        <EnterPasscodeScreen
          onSuccess={handlePasscodeSuccess}
          onCancel={() => setPasscodeAction(null)}
        />
      )}

      <ConfirmDeleteModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({isOpen: false, tx: null})}
        onConfirm={confirmDelete}
        title={`Delete ${deleteModalState.tx?.type} Invoice`}
        message={`Are you sure you want to delete ${deleteModalState.tx?.type.toLowerCase()} invoice ${deleteModalState.tx?.invoiceNo} for ${deleteModalState.tx?.partyName}? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </div>
  );
}
