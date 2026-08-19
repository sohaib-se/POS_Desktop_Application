import { useState } from "react";
import { useSettings } from "@/hooks/useSettings";
import { ChevronDown, Filter, MoreVertical } from "lucide-react";
import type { BankAccount } from "./types";

interface AccountDetailProps {
  account: BankAccount;
  onDeposit: (action: string) => void;
  onEditTransaction?: (tx: any) => void;
  onDeleteTransaction?: (txId: string) => void;
}

export function AccountDetail({ account, onDeposit, onEditTransaction, onDeleteTransaction }: AccountDetailProps) {
  const [txContextMenu, setTxContextMenu] = useState<{ x: number, y: number, txId: string } | null>(null);
  const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });
  const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
  const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;

  const [dropdownOpen, setDropdownOpen] = useState(false);

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

      {/* Account meta */}
      <div className="flex items-center gap-8 px-6 py-3 border-b border-gray-100 text-sm text-gray-500">
        <div>
          <span className="mr-2">Bank Name</span>
          <span className="font-medium text-gray-800">{account.bankName}</span>
        </div>
        <div>
          <span className="mr-2">Account Number</span>
          <span className="font-medium text-gray-800">
            {account.accountNumber}
          </span>
        </div>
      </div>

      {/* Transactions */}
      <div className="flex-1 overflow-auto">
        <div className="flex items-center justify-between px-6 py-3">
          <h4 className="text-sm font-semibold text-gray-800">Transactions</h4>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-4 px-6 py-2 border-b border-gray-100 text-xs text-gray-500 font-medium">
          {["Payment Type", "Name", "Date", "Amount"].map((col) => (
            <div key={col} className="flex items-center gap-1">
              {col}
              <Filter className="w-3 h-3" />
            </div>
          ))}
        </div>

        {/* Rows */}
        {account.transactions.map((tx, i) => (
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
