import { useState, useEffect, useRef, useMemo } from "react";
import { Search, X, CornerDownLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ViewType } from "@/types";

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: ViewType) => void;
}

export function GlobalSearch({ isOpen, onClose, onNavigate }: GlobalSearchProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchableItems: { label: string; view: ViewType }[] = useMemo(() => [
    { label: t("sidebar.home"), view: "home" },
    { label: t("sidebar.parties"), view: "parties" },
    { label: t("sidebar.items"), view: "items" },
    { label: t("sidebar.saleInvoices"), view: "sale-invoices" },
    { label: t("header.addSale"), view: "add-sale" },
    { label: t("sidebar.estimates"), view: "estimates" },
    { label: t("sidebar.paymentIn"), view: "payment-in" },
    { label: t("sidebar.pos"), view: "pos" },
    { label: t("sidebar.purchaseBills"), view: "purchase-bills" },
    { label: t("header.addPurchase"), view: "add-purchase" },
    { label: t("sidebar.paymentOut"), view: "payment-out" },
    { label: t("sidebar.expenses"), view: "expenses" },
    { label: t("expenses.addExpense"), view: "add-expense" },
    { label: t("sidebar.bankAccounts"), view: "bank-accounts" },
    { label: t("sidebar.cashInHand"), view: "cash-in-hand" },
    { label: t("sidebar.reports"), view: "reports" },
    { label: t("sidebar.autoBackup"), view: "sync-auto-backup" },
    { label: t("sidebar.backupToComputer"), view: "sync-backup-computer" },
    { label: t("sidebar.restoreBackup"), view: "sync-restore-backup" },
    { label: t("sidebar.importItems"), view: "utilities-import-items" },
    { label: t("sidebar.barcodeGenerator"), view: "utilities-barcode" },
    { label: t("sidebar.updateItemsInBulk"), view: "utilities-bulk-update" },
    { label: t("sidebar.importParties"), view: "utilities-import-parties" },
    { label: t("sidebar.exportItems"), view: "utilities-export-items" },
    { label: t("sidebar.recycleBin"), view: "utilities-recycle-bin" },
    { label: t("sidebar.settings"), view: "settings" },
  ], [t]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const filteredItems = useMemo(() => {
    if (query === "") {
      const addSaleItem = searchableItems.find(i => i.view === "add-sale") || { label: t("header.addSale"), view: "add-sale" as ViewType };
      return [
        { ...addSaleItem, isRecent: true },
        ...searchableItems.filter(i => i.view !== "add-sale").map(i => ({ ...i, isRecent: false }))
      ];
    }
    return searchableItems.filter((item) =>
      item.label.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, searchableItems, t]);

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
              placeholder={t("globalSearch.placeholder")}
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
            <div className="py-8 text-center text-gray-500">{t("globalSearch.noResults", { query })}</div>
          ) : (
            filteredItems.map((item, index) => {
              const showRecentHeader = query === "" && index === 0;
              const showSuggestedHeader = query === "" && index === 1;

              return (
                <div key={item.label}>
                  {showRecentHeader && (
                    <div className="px-5 py-2 text-xs font-semibold text-gray-500">{t("globalSearch.recentPages")}</div>
                  )}
                  {showSuggestedHeader && (
                    <div className="px-5 py-2 text-xs font-semibold text-gray-500 border-t border-gray-100 mt-1 pt-3">{t("globalSearch.suggestedPages")}</div>
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
