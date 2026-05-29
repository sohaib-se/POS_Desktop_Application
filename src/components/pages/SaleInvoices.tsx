import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Plus,
  ChevronDown,
  Download,
  Printer,
  Calendar,
  MoreVertical,
  Share2,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SaleInvoiceEditData, ViewType } from "@/types";
type SaleInvoiceApiRow = {
  id: string;
  invoice_no: string;
  date: string;
  party_name: string;
  party_id?: string | null;
  party_phone?: string | null;
  transaction_type: string;
  payment_type?: string | null;
  payment_mode?: string | null;
  subtotal?: number | null;
  discount_percent?: number | null;
  discount_amount?: number | null;
  tax_label?: string | null;
  tax_rate?: number | null;
  tax_amount?: number | null;
  round_off?: number | null;
  round_off_amount?: number | null;
  amount: number;
  balance: number;
  description?: string | null;
  line_items_json?: string | null;
};

type SaleInvoiceViewRow = {
  id: string;
  invoiceNo: string;
  date: string;
  partyId?: string;
  partyName: string;
  partyPhone?: string;
  transaction: string;
  paymentType: string;
  paymentMode?: string;
  amount: number;
  balance: number;
  monthKey: string;
  subtotal?: number;
  discountPercent?: number;
  discountAmount?: number;
  taxLabel?: string;
  taxRate?: number;
  taxAmount?: number;
  roundOff?: boolean;
  roundOffAmount?: number;
  description?: string;
  lineItemsJson?: string | null;
};

type SaleInvoiceLineItem = {
  id?: number;
  itemId?: string;
  name?: string;
  quantity?: number;
  unit?: string;
  price?: number;
  amount?: number;
};

interface SaleInvoicesProps {
  onViewChange: (view: ViewType) => void;
  onEditInvoice: (invoice: SaleInvoiceEditData) => void;
}

const fallbackSaleInvoices: SaleInvoiceViewRow[] = [
  {
    id: "1",
    invoiceNo: "9",
    date: "21/02/2026",
    partyName: "Khan",
    transaction: "Sale",
    paymentType: "Cash",
    amount: 160,
    balance: 160,
    monthKey: "2026-02",
  },
  {
    id: "2",
    invoiceNo: "8",
    date: "21/02/2026",
    partyName: "Khan",
    transaction: "Sale",
    paymentType: "Cash",
    amount: 200,
    balance: 200,
    monthKey: "2026-02",
  },
  {
    id: "3",
    invoiceNo: "7",
    date: "21/02/2026",
    partyName: "Cash Sale",
    transaction: "Sale",
    paymentType: "Cash",
    amount: 200,
    balance: 200,
    monthKey: "2026-02",
  },
  {
    id: "4",
    invoiceNo: "6",
    date: "20/02/2026",
    partyName: "Sohaib",
    transaction: "Sale",
    paymentType: "Cash",
    amount: 160,
    balance: 160,
    monthKey: "2026-02",
  },
];

function parseInvoiceDate(rawDate: string) {
  const match = rawDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsedDate = new Date(rawDate);
  return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
}

function getMonthKeyFromDate(rawDate: string) {
  const parsedDate = parseInvoiceDate(rawDate);
  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-");
  const parsedDate = new Date(Number(year), Number(month) - 1, 1);
  return parsedDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatDateDisplay(date: Date) {
  return date.toLocaleDateString("en-GB");
}

function createCsvContent(rows: SaleInvoiceViewRow[]) {
  const headers = ["Date", "Invoice No", "Party Name", "Transaction", "Payment Type", "Amount", "Balance"];
  const escapeCell = (value: string) => {
    const normalized = value.replace(/"/g, '""');
    return `"${normalized}"`;
  };

  const lines = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) =>
      [
        row.date,
        row.invoiceNo,
        row.partyName,
        row.transaction,
        row.paymentType,
        row.amount.toString(),
        row.balance.toString(),
      ]
        .map((cell) => escapeCell(cell))
        .join(","),
    ),
  ];

  return lines.join("\n");
}

function monthLabelForFilter(monthKey: string) {
  return monthKey ? formatMonthLabel(monthKey) : "All Months";
}

function parseLineItems(lineItemsJson?: string | null) {
  if (!lineItemsJson) {
    return [] as SaleInvoiceLineItem[];
  }

  try {
    const parsedValue = JSON.parse(lineItemsJson) as unknown;
    if (!Array.isArray(parsedValue)) {
      return [] as SaleInvoiceLineItem[];
    }

    return parsedValue as SaleInvoiceLineItem[];
  } catch {
    return [] as SaleInvoiceLineItem[];
  }
}

export function SaleInvoices({ onViewChange, onEditInvoice }: SaleInvoicesProps) {
  const [invoiceRows, setInvoiceRows] = useState<SaleInvoiceViewRow[]>(fallbackSaleInvoices);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [isMonthMenuOpen, setIsMonthMenuOpen] = useState(false);
  const [openRowMenuId, setOpenRowMenuId] = useState<string | null>(null);
  const [openRowMenuPosition, setOpenRowMenuPosition] = useState<{ left: number; top: number } | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<SaleInvoiceViewRow | null>(null);
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

  const handleDeleteInvoice = async (invoice: SaleInvoiceViewRow) => {
    const confirmed = window.confirm(`Delete invoice ${invoice.invoiceNo} for ${invoice.partyName}?`);
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/sale_invoices/${invoice.id}`, {
        method: "DELETE",
      });

      if (!response.ok && response.status !== 204) {
        throw new Error("Failed to delete sale invoice");
      }

      setInvoiceRows((previousRows) => previousRows.filter((row) => row.id !== invoice.id));
      setStatusMessage("Sale invoice deleted successfully.");
    } catch (error) {
      console.error(error);
      setStatusMessage("Failed to delete the selected sale invoice.");
    } finally {
      setOpenRowMenuId(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#D0DCE7] gap-1">
      <div className="p-4 bg-white flex items-center justify-between shrink-0 w-full">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">Sale Invoices</h2>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
        <button
          onClick={() => onViewChange("add-sale")}
          className="bg-[#E53935] hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Sale
        </button>
      </div>

      <div
        className="p-4 bg-white rounded-md shadow-sm flex items-center gap-4"
        style={{ marginLeft: "4px", marginRight: "4px" }}
      >
        <div className="relative flex items-center gap-2">
          <span className="text-sm text-gray-500">Filter by :</span>
          <button
            onClick={(event) => {
              event.stopPropagation();
              setIsMonthMenuOpen((previous) => !previous);
              setOpenRowMenuId(null);
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200"
          >
            {monthButtonLabel}
            <ChevronDown className="w-4 h-4" />
          </button>

          {isMonthMenuOpen && (
            <div
              className="absolute left-0 top-full mt-2 z-20 min-w-48 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                onClick={() => {
                  setSelectedMonthKey("");
                  setIsMonthMenuOpen(false);
                }}
              >
                All Months
              </button>
              {monthOptions.map((monthKey) => (
                <button
                  key={monthKey}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                  onClick={() => {
                    setSelectedMonthKey(monthKey);
                    setIsMonthMenuOpen(false);
                  }}
                >
                  {formatMonthLabel(monthKey)}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Selected month:</span>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            <Calendar className="w-4 h-4" />
            {monthButtonLabel}
          </button>
        </div>

        {showSearchInput && (
          <div className="flex items-center gap-2 ml-auto">
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by party name"
              className="w-72 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="p-2 rounded-lg hover:bg-gray-100"
                title="Clear search"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>
        )}
      </div>

      <div
        className="p-4 bg-white rounded-md shadow-sm"
        style={{ marginLeft: "4px", marginRight: "4px" }}
      >
        <div className="max-w-sm bg-[#F6F0FB] rounded-xl p-4 border border-[#E8D7F6]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-[#6B6B83]">Total Sales Amount</span>
            <span className="flex items-center gap-1 text-xs text-[#E53935] bg-[#FCE8EA] px-2 py-0.5 rounded-full">
              18.31% ↓
            </span>
          </div>
          <p className="text-xl font-bold text-[#1C1F2A]">
            Rs {totalSales.toLocaleString()}
          </p>
          <div className="flex items-center gap-3 text-xs text-[#6B6B83] mt-1">
            <span>Received: Rs {totalReceived.toLocaleString()}</span>
            <span>|</span>
            <span>Balance: Rs {totalBalance.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div
        className="flex-1 bg-white rounded-md shadow-sm overflow-hidden"
        style={{ marginLeft: "4px", marginRight: "4px" }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700">Transactions</h3>
          <div className="flex gap-2 items-center">
            <button
              onClick={(event) => {
                event.stopPropagation();
                setShowSearchInput((previous) => !previous);
                setIsMonthMenuOpen(false);
                setOpenRowMenuId(null);
                setOpenRowMenuPosition(null);
              }}
              className="p-2 hover:bg-gray-50 rounded-lg"
              title="Search"
            >
              <Search className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={(event) => {
                event.stopPropagation();
                handleDownloadCsv();
              }}
              className="p-2 hover:bg-gray-50 rounded-lg"
              title="Download CSV"
            >
              <Download className="w-4 h-4 text-gray-500" />
            </button>
            <button className="p-2 hover:bg-gray-50 rounded-lg" title="Print">
              <Printer className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Date
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Invoice no
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Party Name
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Transaction
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Payment Type
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">
                  Amount
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">
                  Balance
                </th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">{invoice.date}</td>
                  <td className="px-4 py-3">{invoice.invoiceNo}</td>
                  <td className="px-4 py-3">{invoice.partyName}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-green-600">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      {invoice.transaction}
                    </span>
                  </td>
                  <td className="px-4 py-3">{invoice.paymentType}</td>
                  <td className="px-4 py-3 text-right">Rs {invoice.amount}</td>
                  <td className="px-4 py-3 text-right">Rs {invoice.balance}</td>
                  <td className="px-4 py-3 relative">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1.5 hover:bg-gray-100 rounded" title="Print">
                        <Printer className="w-4 h-4 text-gray-500" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded" title="Share">
                        <Share2 className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        className="p-1.5 hover:bg-gray-100 rounded"
                        title="More actions"
                        onClick={(event) => {
                          event.stopPropagation();
                          setIsMonthMenuOpen(false);
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
              ))}
            </tbody>
          </table>

          {!visibleRows.length && (
            <div className="px-4 py-10 text-center text-sm text-gray-500">
              No transactions found for the selected month.
            </div>
          )}
        </div>

        {statusMessage && (
          <div className="px-4 py-2 text-sm text-gray-600 border-t border-gray-200 bg-gray-50">
            {statusMessage}
          </div>
        )}
      </div>

      <Dialog
        open={Boolean(viewingInvoice)}
        onOpenChange={(open) => {
          if (!open) {
            setViewingInvoice(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl w-[min(96vw,56rem)] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>

          {viewingInvoice && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="text-gray-500">Invoice No</div>
                  <div className="font-semibold text-gray-900">{viewingInvoice.invoiceNo}</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="text-gray-500">Date</div>
                  <div className="font-semibold text-gray-900">{viewingInvoice.date}</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="text-gray-500">Party Name</div>
                  <div className="font-semibold text-gray-900">{viewingInvoice.partyName}</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="text-gray-500">Payment Type</div>
                  <div className="font-semibold text-gray-900">{viewingInvoice.paymentType}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="text-gray-500">Subtotal</div>
                  <div className="font-semibold text-gray-900">Rs {Number(viewingInvoice.subtotal ?? 0).toLocaleString()}</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="text-gray-500">Discount</div>
                  <div className="font-semibold text-gray-900">Rs {Number(viewingInvoice.discountAmount ?? 0).toLocaleString()}</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="text-gray-500">Tax</div>
                  <div className="font-semibold text-gray-900">{viewingInvoice.taxLabel ?? "NONE"} - Rs {Number(viewingInvoice.taxAmount ?? 0).toLocaleString()}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="text-gray-500">Round Off</div>
                  <div className="font-semibold text-gray-900">Rs {Number(viewingInvoice.roundOffAmount ?? 0).toLocaleString()}</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="text-gray-500">Amount</div>
                  <div className="font-semibold text-gray-900">Rs {Number(viewingInvoice.amount).toLocaleString()}</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="text-gray-500">Balance</div>
                  <div className="font-semibold text-gray-900">Rs {Number(viewingInvoice.balance).toLocaleString()}</div>
                </div>
              </div>

              {viewingInvoice.description && (
                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="text-gray-500 mb-1">Description</div>
                  <div className="text-gray-900">{viewingInvoice.description}</div>
                </div>
              )}

              {parseLineItems(viewingInvoice.lineItemsJson).length > 0 && (
                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="text-gray-500 mb-2">Line Items</div>
                  <div className="overflow-hidden rounded-md border border-gray-200">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-600">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium">Item</th>
                          <th className="px-3 py-2 text-right font-medium">Qty</th>
                          <th className="px-3 py-2 text-left font-medium">Unit</th>
                          <th className="px-3 py-2 text-right font-medium">Price</th>
                          <th className="px-3 py-2 text-right font-medium">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parseLineItems(viewingInvoice.lineItemsJson).map((lineItem, index) => (
                          <tr key={lineItem.id ?? `${lineItem.name ?? "item"}-${index}`} className="border-t border-gray-100">
                            <td className="px-3 py-2 text-gray-900">{lineItem.name ?? "-"}</td>
                            <td className="px-3 py-2 text-right text-gray-700">{Number(lineItem.quantity ?? 0).toLocaleString()}</td>
                            <td className="px-3 py-2 text-gray-700">{lineItem.unit ?? "-"}</td>
                            <td className="px-3 py-2 text-right text-gray-700">Rs {Number(lineItem.price ?? 0).toLocaleString()}</td>
                            <td className="px-3 py-2 text-right text-gray-700">Rs {Number(lineItem.amount ?? 0).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setViewingInvoice(null)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {openRowMenuId && openRowMenuPosition && (
        <div
          className="fixed z-50 w-36 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
          style={{ left: openRowMenuPosition.left, top: openRowMenuPosition.top }}
          onClick={(event) => event.stopPropagation()}
        >
          {(() => {
            const targetInvoice = invoiceRows.find((row) => row.id === openRowMenuId) ?? null;

            if (!targetInvoice) {
              return null;
            }

            return (
              <>
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                  onClick={() => {
                    openViewDialog(targetInvoice);
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
                    onEditInvoice(targetInvoice);
                    setOpenRowMenuId(null);
                    setOpenRowMenuPosition(null);
                  }}
                >
                  <Pencil className="w-4 h-4 text-gray-500" />
                  Edit
                </button>
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  onClick={() => handleDeleteInvoice(targetInvoice)}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}