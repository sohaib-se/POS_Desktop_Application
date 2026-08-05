import { useState } from "react";
import { ChevronDown, Search, Filter, MoreVertical } from "lucide-react";
import type { BankAccount } from "./types";

interface AccountDetailProps {
  account: BankAccount;
  onDeposit: (action: string) => void;
}

export function AccountDetail({ account, onDeposit }: AccountDetailProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownItems = [
    "Bank to Cash Transfer",
    "Cash to Bank Transfer",
    "Bank to Bank Transfer",
    "Adjust Bank Balance",
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
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
                  className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${item === "Adjust Bank Balance"
                    ? "font-semibold text-gray-900"
                    : "text-gray-700"
                    }`}
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
          <Search className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
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
                Rs{" "}
                {Math.abs(Number(tx.amount)).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </span>
              <button className="text-gray-400 hover:text-gray-600 ml-2">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
