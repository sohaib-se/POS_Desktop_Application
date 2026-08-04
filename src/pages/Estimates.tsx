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
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AddEstimate } from "@/pages/AddEstimate";

export function Estimates() {
  const [showAddEstimate, setShowAddEstimate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [viewingRecord, setViewingRecord] = useState<any>(null);
  const [openRowMenuId, setOpenRowMenuId] = useState<string | null>(null);
  const [openRowMenuPosition, setOpenRowMenuPosition] = useState<{ left: number; top: number } | null>(null);

  useEffect(() => {
    fetch('/api/estimates')
      .then(res => res.json())
      .then(data => setRecords(data))
      .catch(err => console.error("Failed to fetch estimates:", err));
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
    if (window.confirm("Are you sure you want to delete this estimate?")) {
      try {
        const response = await fetch(`/api/estimates/${id}`, { method: "DELETE" });
        if (!response.ok && response.status !== 204) {
          throw new Error("Failed to delete estimate");
        }
        setRecords((prev) => prev.filter((r) => r.id !== id));
      } catch (error) {
        console.error("Delete error:", error);
        alert("Failed to delete the selected estimate.");
      }
    }
  };

  const totalQuotations = records.reduce((sum, est) => sum + est.amount, 0);
  const totalConverted = records
    .filter((e) => e.status === "Converted")
    .reduce((sum, est) => sum + est.amount, 0);

  return (
    <>
      <div className="h-full flex flex-col bg-[#D0DCE7] gap-1 overflow-y-auto">
        {/* Header */}
        <div className="p-4 bg-white flex items-center justify-between shrink-0 w-full">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Estimate/Quotation
            </h2>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
          <button
            onClick={() => setShowAddEstimate(true)}
            className="bg-[#E53935] hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Estimate
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
              <span className="text-sm text-[#6B6B83]">Total Quotations</span>
              <span className="flex items-center gap-1 text-xs text-[#E53935] bg-[#FCE8EA] px-2 py-0.5 rounded-full">
                509.09% ↓
              </span>
            </div>
            <p className="text-xl font-bold text-[#1C1F2A]">
              Rs {totalQuotations.toLocaleString()}
            </p>
            <div className="flex items-center gap-3 text-xs text-[#6B6B83] mt-1">
              <span>Converted: Rs {totalConverted.toFixed(2)}</span>
              <span>|</span>
              <span>
                Open: Rs {(totalQuotations - totalConverted).toFixed(2)}
              </span>
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
                    Reference no
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Party Name
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">
                    Balance
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {records.map((estimate) => (
                  <tr
                    key={estimate.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">{estimate.date}</td>
                    <td className="px-4 py-3">{estimate.referenceNo}</td>
                    <td className="px-4 py-3">{estimate.partyName}</td>
                    <td className="px-4 py-3 text-right">
                      Rs {estimate.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      Rs {estimate.balance.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          estimate.status === "Open"
                            ? "bg-orange-100 text-orange-700"
                            : estimate.status === "Converted"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {estimate.status}
                      </span>
                    </td>
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
                              openRowMenuId === estimate.id && previousPosition
                                ? null
                                : { left: nextLeft, top: nextTop },
                            );
                            setOpenRowMenuId((previous) =>
                              previous === estimate.id ? null : estimate.id,
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
      </div>

      {showAddEstimate && (
        <div className="fixed inset-0 z-[100]">
          <AddEstimate onClose={() => setShowAddEstimate(false)} />
        </div>
      )}

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
                    setShowAddEstimate(true);
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
                <h2 className="text-lg font-semibold text-gray-900">View Estimate</h2>
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
                  <span className="font-medium">{viewingRecord.referenceNo}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500 text-sm">Party Name</span>
                  <span className="font-medium">{viewingRecord.partyName}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500 text-sm">Status</span>
                  <span className="font-medium">{viewingRecord.status}</span>
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
    </>
  );
}
