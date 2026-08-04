import React, { useRef, useState } from "react";
import { Search, Printer, Share2, MoreVertical } from "lucide-react";

interface PaymentOutTableProps {
  records: any[];
  openRowMenuId: string | null;
  setOpenRowMenuId: React.Dispatch<React.SetStateAction<string | null>>;
  setOpenRowMenuPosition: React.Dispatch<React.SetStateAction<{ left: number; top: number } | null>>;
}

export function PaymentOutTable({
  records,
  openRowMenuId,
  setOpenRowMenuId,
  setOpenRowMenuPosition,
}: PaymentOutTableProps) {
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const filteredRecords = records.filter(record => 
    record.partyName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    record.reference?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                Ref. no.
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
            {filteredRecords.map((payment) => (
              <tr
                key={payment.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-3">{payment.date}</td>
                <td className="px-4 py-3">{payment.reference || ""}</td>
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
  );
}
