import { useState, useEffect, useRef } from "react";
import { Search, X, CornerDownLeft } from "lucide-react";
import type { ViewType } from "@/types";

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: ViewType) => void;
}

const searchableItems: { label: string; view: ViewType }[] = [
  { label: "Home / Dashboard", view: "home" },
  { label: "Parties", view: "parties" },
  { label: "Items", view: "items" },
  { label: "Sale Invoices", view: "sale-invoices" },
  { label: "Add Sale", view: "add-sale" },
  { label: "Estimates / Quotation", view: "estimates" },
  { label: "Payment In", view: "payment-in" },
  { label: "Laimsoft POS", view: "pos" },
  { label: "Purchase Bills", view: "purchase-bills" },
  { label: "Add Purchase", view: "add-purchase" },
  { label: "Payment Out", view: "payment-out" },
  { label: "Expenses", view: "expenses" },
  { label: "Add Expense", view: "add-expense" },
  { label: "Bank Accounts", view: "bank-accounts" },
  { label: "Cash In Hand", view: "cash-in-hand" },
  { label: "Reports", view: "reports" },
  { label: "Auto Backup", view: "sync-auto-backup" },
  { label: "Backup to Computer", view: "sync-backup-computer" },
  { label: "Backup to Drive", view: "sync-backup-drive" },
  { label: "Restore Backup", view: "sync-restore-backup" },
  { label: "Import Items", view: "utilities-import-items" },
  { label: "Barcode Generator", view: "utilities-barcode" },
  { label: "Update Items In Bulk", view: "utilities-bulk-update" },
  { label: "Import Parties", view: "utilities-import-parties" },
  { label: "Export Items", view: "utilities-export-items" },
  { label: "Recycle Bin", view: "utilities-recycle-bin" },
  { label: "Settings", view: "settings" },
];

export function GlobalSearch({ isOpen, onClose, onNavigate }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const filteredItems = query === "" 
    ? [
        { label: "Add Sale", view: "add-sale", isRecent: true },
        ...searchableItems.filter(i => i.view !== "add-sale").map(i => ({ ...i, isRecent: false }))
      ]
    : searchableItems.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        onNavigate(filteredItems[selectedIndex].view as ViewType);
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" 
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 flex items-center gap-3">
          <div className={`flex-1 flex items-center bg-[#f8fafc] rounded-full px-4 py-2 transition-all ${
            isFocused 
              ? "border border-[#60a5fa] shadow-[0_0_0_3px_rgba(96,165,250,0.15)]" 
              : "border border-gray-300"
          }`}>
            <Search className="w-4 h-4 text-gray-400" />
            <div className="w-[1px] h-4 bg-gray-300 mx-3"></div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Open anything like invoices, reports..."
              className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-500 focus:ring-0 focus:outline-none border-none"
            />
          </div>
          <div className="w-[1px] h-6 bg-gray-200 mx-1"></div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="max-h-[45vh] overflow-y-auto pb-2 scrollbar-thin">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No results found for "{query}"</div>
          ) : (
            filteredItems.map((item, index) => {
              const showRecentHeader = query === "" && index === 0;
              const showSuggestedHeader = query === "" && index === 1;

              return (
                <div key={item.label}>
                  {showRecentHeader && (
                    <div className="px-5 py-2 text-xs font-semibold text-gray-500">Recent Pages</div>
                  )}
                  {showSuggestedHeader && (
                    <div className="px-5 py-2 text-xs font-semibold text-gray-500 border-t border-gray-100 mt-1 pt-3">Suggested Pages</div>
                  )}
                  <button
                    onClick={() => onNavigate(item.view as ViewType)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center justify-between px-5 py-2.5 text-left text-sm transition-colors ${
                      index === selectedIndex ? "bg-[#eef4ff] text-gray-900" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span>{item.label}</span>
                    {index === selectedIndex && (
                      <CornerDownLeft className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
