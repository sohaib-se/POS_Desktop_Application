import type { RefObject, Dispatch, SetStateAction } from "react";
import { Search, Printer, Share2, MoreVertical, ArrowRightCircle } from "lucide-react";
import type { EstimateRecord } from "./types";

interface EstimatesTableProps {
  records: EstimateRecord[];
  showSearchInput: boolean;
  setShowSearchInput: (show: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
  openRowMenuId: string | null;
  setOpenRowMenuId: Dispatch<SetStateAction<string | null>>;
  setOpenRowMenuPosition: Dispatch<SetStateAction<{ left: number; top: number } | null>>;
  onConvertEstimateToSale: (estimate: EstimateRecord) => void;
}

export function EstimatesTable({
  records,
  showSearchInput,
  setShowSearchInput,
  searchQuery,
  setSearchQuery,
  searchInputRef,
  openRowMenuId,
  setOpenRowMenuId,
  setOpenRowMenuPosition,
  onConvertEstimateToSale,
}: EstimatesTableProps) {
  return (
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
                  {estimate.status === "Converted" && estimate.convertedSaleNo && (
                    <div className="text-[10px] text-gray-500 mt-1">Sale #{estimate.convertedSaleNo}</div>
                  )}
                </td>
                <td className="px-4 py-3 relative">
                  <div className="flex items-center justify-center gap-2">
                    <button className="p-1.5 hover:bg-gray-100 rounded" title="Print">
                      <Printer className="w-4 h-4 text-gray-500" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-100 rounded" title="Share">
                      <Share2 className="w-4 h-4 text-gray-500" />
                    </button>
                    {estimate.status !== "Converted" && (
                      <button 
                        className="p-1.5 hover:bg-blue-50 text-blue-600 rounded flex items-center gap-1 transition-colors" 
                        title="Convert to Sale"
                        onClick={() => onConvertEstimateToSale(estimate)}
                      >
                        <ArrowRightCircle className="w-4 h-4" />
                        <span className="text-xs font-medium">Convert</span>
                      </button>
                    )}
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
  );
}
