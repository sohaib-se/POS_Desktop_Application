import { useState, useRef, useEffect } from "react";
import {
  Search,
  Plus,
  ChevronDown,
  Download,
  Printer,
  Calendar,
  Building2,
  MoreVertical,
  Share2,
  Calculator,
  Camera,
  FilePlus2,
  Info,
  Settings,
  X,
  Pencil,
  Trash2,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function PaymentOut() {
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [selectedParty, setSelectedParty] = useState("khan");
  const [records, setRecords] = useState<any[]>([]);
  const [viewingRecord, setViewingRecord] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [openRowMenuId, setOpenRowMenuId] = useState<string | null>(null);
  const [openRowMenuPosition, setOpenRowMenuPosition] = useState<{ left: number; top: number } | null>(null);

  useEffect(() => {
    fetch('/api/payment_out_records')
      .then(res => res.json())
      .then(data => setRecords(data))
      .catch(err => console.error("Failed to fetch payment_out_records:", err));
  }, []);

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

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        const response = await fetch(`/api/payment_out_records/${id}`, { method: "DELETE" });
        if (!response.ok && response.status !== 204) {
          throw new Error("Failed to delete transaction");
        }
        setRecords((prev) => prev.filter((r) => r.id !== id));
      } catch (error) {
        console.error("Delete error:", error);
        alert("Failed to delete the selected transaction.");
      }
    }
  };

  const totalAmount = records.reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = totalAmount;
  const totalOpen = 840;

  const partyOptions = [
    { value: "khan", label: "Khan", balance: 100 },
    { value: "cash-sale", label: "Cash Sale", balance: 200 },
    { value: "supplier-a", label: "Supplier A", balance: 340 },
  ];

  const selectedPartyBalance =
    partyOptions.find((party) => party.value === selectedParty)?.balance ?? 0;

  return (
    <div className="h-full flex flex-col bg-[#D0DCE7] gap-1 overflow-y-auto">
      {/* Header */}
      <div className="p-4 bg-white flex items-center justify-between shrink-0 w-full">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">Payment-Out</h2>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
        <button
          onClick={() => setShowAddPayment(true)}
          className="bg-[#E53935] hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Payment-Out
        </button>
      </div>

      {/* Filters */}
      <div
        className="p-4 bg-white rounded-md shadow-sm flex items-center gap-4 shrink-0"
        style={{ marginLeft: "4px", marginRight: "4px" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Filter by :</span>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200">
            This Month
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Between</span>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            <Calendar className="w-4 h-4" />
            01/02/2026
          </button>
          <span className="text-sm text-gray-500">To</span>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            <Calendar className="w-4 h-4" />
            28/02/2026
          </button>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200">
          <Building2 className="w-4 h-4" />
          All Firms
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Summary Cards */}
      <div
        className="p-4 bg-white rounded-md shadow-sm shrink-0"
        style={{ marginLeft: "4px", marginRight: "4px" }}
      >
        <div className="max-w-sm bg-[#F6F0FB] rounded-xl p-4 border border-[#E8D7F6]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-[#6B6B83]">Total Amount</span>
            <span className="flex items-center gap-1 text-xs text-[#E53935] bg-[#FCE8EA] px-2 py-0.5 rounded-full">
              100% ↓
            </span>
          </div>
          <p className="text-xl font-bold text-[#1C1F2A]">
            Rs {totalAmount.toLocaleString()}
          </p>
          <div className="flex items-center gap-3 text-xs text-[#6B6B83] mt-1">
            <span>Paid: Rs {totalPaid.toFixed(2)}</span>
            <span>|</span>
            <span>Open: Rs {totalOpen.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div
        className="bg-white rounded-md shadow-sm flex flex-col sticky top-0 z-10"
        style={{ marginLeft: "4px", marginRight: "4px", height: "100%", flexShrink: 0 }}
      >
        <div className="flex items-center justify-between px-6 pt-4 pb-2 border-b border-gray-200">
          <h3 className="text-base font-bold text-[#222B45] tracking-wide">
            TRANSACTIONS
          </h3>
          <div className="flex gap-2 items-center">
            {showSearchInput && (
              <div className="flex items-center bg-[#F7F9FB] rounded-lg px-3 py-1.5 border border-[#E3EAF2] w-64 mr-2">
                <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => {
                    setTimeout(() => {
                      setShowSearchInput(false);
                      setSearchQuery("");
                    }, 150);
                  }}
                  className="w-full bg-transparent border-none outline-none text-sm"
                  autoFocus
                />
              </div>
            )}
            {!showSearchInput && (
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  setShowSearchInput(true);
                }}
                className="p-1.5 hover:bg-[#F7F9FB] rounded"
                title="Search"
              >
                <Search className="w-4 h-4 text-[#7B8A9A]" />
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="p-1.5 hover:bg-[#F7F9FB] rounded"
              title="Print"
            >
              <Printer className="w-4 h-4 text-[#7B8A9A]" />
            </button>
            <button
              onClick={() => {}}
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
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Date
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Party Name
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">
                  Total Amount
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">
                  Paid
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Payment Type
                </th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {records.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">{payment.date}</td>
                  <td className="px-4 py-3">{payment.partyName}</td>
                  <td className="px-4 py-3 text-right">
                    Rs {payment.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    Rs {payment.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">{payment.paymentType}</td>
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
                          const targetRect = event.currentTarget.getBoundingClientRect();
                          const menuWidth = 144;
                          const menuHeight = 116; // rough height for 3 items
                          const nextLeft = Math.max(8, Math.min(targetRect.right - menuWidth, window.innerWidth - menuWidth - 8));
                          const nextTop = targetRect.bottom + menuHeight > window.innerHeight
                            ? Math.max(8, targetRect.top - menuHeight - 8)
                            : targetRect.bottom + 8;

                          setOpenRowMenuPosition((previousPosition) =>
                            openRowMenuId === payment.id && previousPosition
                              ? null
                              : { left: nextLeft, top: nextTop },
                          );
                          setOpenRowMenuId((previous) =>
                            previous === payment.id ? null : payment.id,
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
        </div>
      </div>

      {/* Add Payment-Out Modal */}
      <Dialog open={showAddPayment} onOpenChange={setShowAddPayment}>
        <DialogContent
          showCloseButton={false}
          className="w-[50rem] max-w-none overflow-hidden rounded-lg border-0 bg-white p-0 shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
          style={{ width: "50rem", maxWidth: "50rem", minWidth: "50rem" }}
        >
          <div className="flex flex-col bg-white">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-[18px] font-semibold text-slate-900">
                Payment-Out
              </h2>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded hover:bg-slate-100 text-slate-500"
                  aria-label="Calculator"
                >
                  <Calculator className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="relative flex h-8 w-8 items-center justify-center rounded hover:bg-slate-100 text-slate-500"
                  aria-label="Settings"
                >
                  <Settings className="h-5 w-5" />
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#E53935]" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddPayment(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8B97A8] text-white hover:bg-[#748396]"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              <div className="grid grid-cols-[320px_minmax(0,1fr)] gap-10">
                {/* Left column */}
                <div className="flex flex-col gap-5">
                  <div>
                    <div className="relative">
                      <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-slate-500 z-10">
                        Party <span className="text-[#E53935]">*</span>
                      </label>
                      <select
                        value={selectedParty}
                        onChange={(e) => setSelectedParty(e.target.value)}
                        className="h-11 w-full rounded border border-slate-300 bg-white px-3 text-[14px] text-slate-900 outline-none focus:border-[#1976D2] appearance-none pr-8"
                      >
                        <option value="">Select Party</option>
                        {partyOptions.map((party) => (
                          <option key={party.value} value={party.value}>
                            {party.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                    <p className="mt-1.5 text-[12px] font-medium text-[#E53935]">
                      BAL: {selectedPartyBalance}
                    </p>
                  </div>

                  <div className="relative w-[180px]">
                    <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-slate-500 z-10">
                      Payment Type
                    </label>
                    <select className="h-11 w-full rounded border border-slate-300 bg-white px-3 text-[14px] text-slate-900 outline-none focus:border-[#1976D2] appearance-none pr-8">
                      <option>Cash</option>
                      <option>Bank Transfer</option>
                      <option>Cheque</option>
                      <option>UPI</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>

                  <button
                    type="button"
                    className="inline-flex w-fit items-center gap-1.5 text-[14px] font-medium text-[#1976D2]"
                  >
                    <Plus className="h-4 w-4" />
                    Add Payment type
                  </button>

                  <button
                    type="button"
                    className="inline-flex w-fit items-center gap-2 rounded border border-slate-300 bg-white px-4 py-2.5 text-[13px] font-semibold uppercase tracking-wide text-slate-400 shadow-sm"
                  >
                    <FilePlus2 className="h-4 w-4" />
                    Add Description
                  </button>

                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center text-slate-400"
                    aria-label="Add attachment"
                  >
                    <Camera className="h-5 w-5" />
                  </button>
                </div>

                {/* Right column */}
                <div
                  className="flex flex-col justify-between"
                  style={{ minHeight: "280px" }}
                >
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className="mb-1.5 block text-[12px] text-slate-500">
                        Payment No
                      </label>
                      <input
                        type="text"
                        defaultValue="5"
                        className="h-8 w-full border-0 border-b border-slate-300 bg-transparent px-0 text-[14px] text-slate-900 outline-none focus:border-[#1976D2]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[12px] text-slate-500">
                        Date
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          defaultValue="21/02/2026"
                          className="h-8 w-full border-0 border-b border-slate-300 bg-transparent px-0 pr-8 text-[14px] text-slate-900 outline-none focus:border-[#1976D2]"
                        />
                        <Calendar className="absolute right-0 top-1.5 h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-auto pt-8">
                    <label className="text-[13px] text-slate-500 whitespace-nowrap">
                      Paid
                    </label>
                    <input
                      type="number"
                      className="h-9 w-52 rounded border border-slate-300 bg-white px-3 text-[14px] text-slate-900 outline-none focus:border-[#1976D2]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="flex items-center gap-3 text-[14px] text-slate-500"
                >
                  <span className="relative inline-flex h-5 w-9 items-center rounded-full bg-slate-300">
                    <span className="h-4 w-4 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform" />
                  </span>
                  <span className="font-medium text-[#5E6B84]">
                    Enable Link Payments to Bills
                  </span>
                  <Info className="h-4 w-4 text-slate-400" />
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex h-9 items-center rounded-md border border-slate-300 bg-white px-5 text-[14px] font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                  >
                    Share
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="h-9 rounded bg-[#1E88F7] px-8 text-[14px] font-semibold text-white shadow-[0_4px_12px_rgba(30,136,247,0.3)] hover:bg-[#1878dd]"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {openRowMenuId && openRowMenuPosition && (
        <div
          className="fixed z-50 min-w-36 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden py-1"
          style={{
            left: `${openRowMenuPosition.left}px`,
            top: `${openRowMenuPosition.top}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {(() => {
            const targetItem = records.find((r) => r.id === openRowMenuId);
            if (!targetItem) return null;

            return (
              <>
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                  onClick={() => {
                    setViewingRecord(targetItem);
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
                    setShowAddPayment(true);
                    setOpenRowMenuId(null);
                    setOpenRowMenuPosition(null);
                  }}
                >
                  <Pencil className="w-4 h-4 text-gray-500" />
                  Edit
                </button>
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  onClick={() => {
                    handleDelete(targetItem.id);
                    setOpenRowMenuId(null);
                    setOpenRowMenuPosition(null);
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

      {/* View Dialog */}
      <Dialog
        open={Boolean(viewingRecord)}
        onOpenChange={(isOpen) => {
          if (!isOpen) setViewingRecord(null);
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-md rounded-lg border-0 bg-white p-0 shadow-xl"
        >
          {viewingRecord && (
            <div className="flex flex-col bg-white">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">View Transaction</h2>
                <button
                  onClick={() => setViewingRecord(null)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500 text-sm">Date</span>
                  <span className="font-medium">{viewingRecord.date}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500 text-sm">Ref. No</span>
                  <span className="font-medium">{viewingRecord.receiptNo || '-'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500 text-sm">Party Name</span>
                  <span className="font-medium">{viewingRecord.partyName}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500 text-sm">Payment Type</span>
                  <span className="font-medium">{viewingRecord.paymentType}</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-gray-500 text-sm">Amount</span>
                  <span className="font-bold text-gray-900">Rs {viewingRecord.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
