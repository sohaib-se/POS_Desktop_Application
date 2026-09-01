import { useState, useEffect, useRef } from "react";
import { useSettings } from "@/hooks/useSettings";
import { ChevronDown, MoreVertical, Search } from "lucide-react";
import type { BankAccount } from "./types";

interface AccountDetailProps {
  account: BankAccount;
  onDeposit: (action: string) => void;
  onEditTransaction?: (tx: any) => void;
  onDeleteTransaction?: (txId: string) => void;
}
const parseLocalDate = (dStr: string) => {
  if (!dStr) return new Date();
  if (dStr.includes('/')) {
    const [dd, mm, yyyy] = dStr.split('/');
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }
  if (dStr.includes('-')) {
    const [yyyy, mm, dd] = dStr.split('-');
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }
  return new Date(dStr);
};

export function AccountDetail({ account, onDeposit, onEditTransaction, onDeleteTransaction }: AccountDetailProps) {
  const [txContextMenu, setTxContextMenu] = useState<{ x: number, y: number, txId: string } | null>(null);
  const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });
  const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
  const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [monthFilter, setMonthFilter] = useState(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${mm}`;
  });

  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const placeholders = ["Payment Type", "Name", "Date", "Amount"];
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

  const visibleTransactions = account.transactions.filter((tx: any) => {
    if (monthFilter) {
      const txDate = parseLocalDate(tx.date);
      const txMonth = String(txDate.getMonth() + 1).padStart(2, '0');
      const txYear = txDate.getFullYear();
      if (`${txYear}-${txMonth}` !== monthFilter) {
        return false;
      }
    }

    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    const typeMatch = tx.type?.toLowerCase().includes(lowerQuery);
    const nameMatch = tx.name?.toLowerCase().includes(lowerQuery);
    const dateMatch = tx.date?.toLowerCase().includes(lowerQuery);
    const amountMatch = String(tx.amount).includes(lowerQuery);
    return typeMatch || nameMatch || dateMatch || amountMatch;
  });

  const dropdownItems = [
    "Bank to Cash Transfer",
    "Cash to Bank Transfer",
    "Bank to Bank Transfer",
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden" onClick={() => setTxContextMenu(null)}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">
          {account.name}
        </h3>
        <div className="relative">
          <div className="flex items-center">
            <button
              onClick={() => onDeposit("deposit")}
              className="border border-[#E53935] text-[#E53935] text-sm font-medium px-4 py-1.5 rounded-l-full hover:bg-red-50 transition-colors"
            >
              Deposit / Withdraw
            </button>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="border border-[#E53935] border-l-0 text-[#E53935] px-2 py-1.5 rounded-r-full hover:bg-red-50 transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-48">
              {dropdownItems.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setDropdownOpen(false);
                    onDeposit(item);
                  }}
                  className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>


      {/* Transactions */}
      <div className="flex-1 overflow-auto">
        <div className="flex items-center justify-between px-6 py-3">
          <h4 className="text-sm font-semibold text-gray-800">Transactions</h4>
          <div className="flex gap-2 items-center h-10" ref={searchContainerRef}>
            <input
              type="month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-100 focus:border-blue-400 h-9"
            />
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

        {/* Table header */}
        <div className="grid grid-cols-4 px-6 py-2 border-b border-gray-100 text-xs text-gray-500 font-medium">
          {["Payment Type", "Name", "Date", "Amount"].map((col) => (
            <div key={col} className="flex items-center gap-1">
              {col}
            </div>
          ))}
        </div>

        {/* Rows */}
        {visibleTransactions.map((tx: any, i: number) => (
          <div
            key={i}
            className={`grid grid-cols-4 px-6 py-3 border-b border-gray-50 items-center text-sm hover:bg-gray-50 ${i % 2 === 0 ? "bg-blue-50/30" : ""
              }`}
          >
            <div className="font-medium text-gray-800">{tx.type}</div>
            <div className="text-gray-700">{tx.name.replace(' (Payment In)', '').replace(' (Payment Out)', '').replace(' (Received)', '')}</div>
            <div className="text-gray-600">{tx.date}</div>
            <div className="flex items-center justify-between">
              <span className={`font-medium ${Number(tx.amount) < 0 ? 'text-[#E53935]' : 'text-green-600'}`}>
                {currencyStr}{" "}
                {Math.abs(Number(tx.amount)).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </span>
              <button 
                className="text-gray-400 hover:text-gray-600 ml-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setTxContextMenu({ x: e.clientX, y: e.clientY, txId: tx.id });
                }}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {txContextMenu && (
        <div
          className="fixed bg-white border border-gray-200 shadow-xl rounded-md z-50 overflow-hidden w-32"
          style={{ top: txContextMenu.y, left: txContextMenu.x - 100 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => {
              const tx = account.transactions.find((t: any) => t.id === txContextMenu.txId);
              if (tx) onEditTransaction?.(tx);
              setTxContextMenu(null);
            }}
          >
            Edit
          </button>
          <button
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            onClick={() => {
              onDeleteTransaction?.(txContextMenu.txId);
              setTxContextMenu(null);
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
