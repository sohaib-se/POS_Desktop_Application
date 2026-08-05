import { useState } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import type { BankAccount } from "./types";

interface AccountListViewProps {
  accounts: BankAccount[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onContextMenu?: (e: React.MouseEvent, id: string) => void;
}

export function AccountListView({ accounts, selectedId, onSelect, onContextMenu }: AccountListViewProps) {
  const [search, setSearch] = useState("");
  const filtered = accounts.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="w-72 flex-shrink-0 border-r border-gray-200 flex flex-col">
      {/* Search */}
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Account/Amount"
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-300"
          />
        </div>
      </div>

      {/* Column headers */}
      <div className="flex items-center px-4 py-2 border-b border-gray-100 text-xs text-gray-500 font-medium">
        <div className="flex-1 flex items-center gap-1">
          Account Name
          <ArrowUpDown className="w-3 h-3" />
        </div>
        <div className="text-right">Amount</div>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-auto">
        {filtered.map((acc) => (
          <div
            key={acc.id}
            onClick={() => onSelect(acc.id)}
            onContextMenu={(e) => onContextMenu?.(e, acc.id)}
            className={`flex items-center px-4 py-3 cursor-pointer border-b border-gray-50 hover:bg-blue-50 transition-colors ${selectedId === acc.id ? "bg-blue-50" : ""
              }`}
          >
            <div className="flex-1 text-sm font-medium text-gray-800">
              {acc.name}
            </div>
            <div className="text-sm font-medium text-green-600">
              {acc.balance.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
