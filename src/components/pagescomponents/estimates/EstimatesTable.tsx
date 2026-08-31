import { useEffect, useRef, useState, type RefObject, type Dispatch, type SetStateAction } from "react";
import { useSettings } from "@/hooks/useSettings";
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
  const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });
  const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
  const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const placeholders = ["Party Name", "Invoice No.", "Date", "Amount"];
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
  }, [showSearchInput, searchQuery, setShowSearchInput]);

  return (
    <div
      className="bg-white rounded-md shadow-sm flex flex-col sticky top-0 z-10"
      style={{ marginLeft: "4px", marginRight: "4px", height: "100%", flexShrink: 0 }}
    >
      <div className="flex items-center justify-between px-6 pt-4 pb-2 border-b border-gray-200">
        <h3 className="text-base font-bold text-[#222B45] tracking-wide">
          TRANSACTIONS
        </h3>
        <div className="flex gap-2 items-center h-10" ref={searchContainerRef}>
          <div 
            className={`flex items-center overflow-hidden transition-all duration-300 ease-out rounded-full h-9 ${
              showSearchInput 
                ? "w-64 bg-white border border-blue-500 ring-4 ring-blue-50" 
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
        </div>
      </div>

      <div className="overflow-auto flex-1">
        <table className="w-full text-sm table-fixed">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="w-[12%] px-4 py-3 text-left font-medium text-gray-600">
                Date
              </th>
              <th className="w-[12%] px-4 py-3 text-left font-medium text-gray-600">
                Reference no
              </th>
              <th className="w-[26%] px-4 py-3 text-left font-medium text-gray-600">
                Party Name
              </th>
              <th className="w-[14%] px-4 py-3 text-right font-medium text-gray-600">
                Amount
              </th>
              <th className="w-[14%] px-4 py-3 text-right font-medium text-gray-600">
                Balance
              </th>
              <th className="w-[14%] px-4 py-3 text-left font-medium text-gray-600">
                Status
              </th>
              <th className="w-[8%] px-4 py-3 text-center font-medium text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-20 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3 text-gray-400">
                    <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                    <p className="text-gray-500 text-sm font-medium">No estimate records found</p>
                  </div>
                </td>
              </tr>
            ) : (
              records.map((estimate) => (
                <tr
                  key={estimate.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">{estimate.date}</td>
                  <td className="px-4 py-3">{estimate.referenceNo}</td>
                  <td className="px-4 py-3">{estimate.partyName}</td>
                  <td className="px-4 py-3 text-right">
                    {currencyStr} {estimate.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {currencyStr} {estimate.balance.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    {estimate.status === "Open" ? (
                      <span className="text-orange-500">{estimate.status}</span>
                    ) : estimate.status === "Converted" ? (
                      <span className="text-blue-600">
                        {estimate.convertedSaleNo ? `Sale Invoice no. ${estimate.convertedSaleNo}` : "Converted"}
                      </span>
                    ) : (
                      <span className="text-gray-500">{estimate.status}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 relative">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        className={`p-1.5 rounded flex items-center gap-1 transition-colors ${
                          estimate.status === "Converted" 
                            ? "invisible pointer-events-none" 
                            : "hover:bg-blue-50 text-blue-600 cursor-pointer"
                        }`}
                        title={estimate.status === "Converted" ? "Already Converted" : "Convert to Sale"}
                        onClick={() => {
                          if (estimate.status !== "Converted") {
                            onConvertEstimateToSale(estimate);
                          }
                        }}
                        disabled={estimate.status === "Converted"}
                      >
                        <ArrowRightCircle className="w-4 h-4" />
                        <span className="text-xs font-medium">Convert</span>
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
