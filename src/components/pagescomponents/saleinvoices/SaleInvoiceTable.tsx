import { Search, Printer, MoreVertical } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useEffect, useRef, useState } from "react";
import type { SaleInvoiceViewRow } from "./types";
import type { MutableRefObject, Dispatch, SetStateAction } from "react";

interface SaleInvoiceTableProps {
  showSearchInput: boolean;
  setShowSearchInput: (show: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchInputRef: MutableRefObject<HTMLInputElement | null>;
  setOpenRowMenuId: Dispatch<SetStateAction<string | null>>;
  setOpenRowMenuPosition: Dispatch<SetStateAction<{ left: number; top: number } | null>>;
  openRowMenuId: string | null;
  handleDownloadCsv: () => void;
  visibleRows: SaleInvoiceViewRow[];
  statusMessage: string;
}

export function SaleInvoiceTable({
  showSearchInput,
  setShowSearchInput,
  searchQuery,
  setSearchQuery,
  searchInputRef,
  setOpenRowMenuId,
  setOpenRowMenuPosition,
  openRowMenuId,
  handleDownloadCsv,
  visibleRows,
  statusMessage
}: SaleInvoiceTableProps) {
  const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });
  const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
  const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const placeholders = ["Customer Name", "Invoice No.", "Amount"];
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
                  <span className={`inline-flex items-center gap-1.5 ${invoice.transaction?.includes('Returned') ? 'text-amber-600' : 'text-green-600'}`}>
                    <span className={`w-2 h-2 rounded-full ${invoice.transaction?.includes('Returned') ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                    {invoice.transaction}
                  </span>
                </td>
                <td className="px-4 py-3">{invoice.paymentType}</td>
                <td className="px-4 py-3 text-right">{currencyStr} {invoice.amount}</td>
                <td className="px-4 py-3 text-right">{currencyStr} {invoice.balance}</td>
                <td className="px-4 py-3 relative">
                  <div className="flex items-center justify-center gap-2">
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
  );
}
