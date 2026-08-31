import type { ExpenseCategory } from "@/types";
import { useSettings } from "@/hooks/useSettings";
import type { ExpenseItem, ExpenseRecord } from "./types";
import { useState, useEffect, useRef } from "react";
import { Search, FolderOpen, Tag } from "lucide-react";
import { ExpenseRowActions } from "./ExpenseRecordContextMenu";

interface ExpensesDetailsProps {
  activeTab: "category" | "items";
  selectedCategory: ExpenseCategory | null;
  selectedExpenseItem: ExpenseItem | null;
  expenseRecordList: ExpenseRecord[];
  onEditRecord?: (record: ExpenseRecord) => void;
  onDeleteRecord?: (record: ExpenseRecord) => void;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB");
  } catch {
    return dateStr;
  }
}

export function ExpensesDetails({
  activeTab,
  selectedCategory,
  selectedExpenseItem,
  expenseRecordList,
  onEditRecord,
  onDeleteRecord,
}: ExpensesDetailsProps) {
  const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });
  const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
  const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;

  // Right-click context menu has been replaced by inline three-dots action buttons.
  // openRowMenuId / openRowMenuPosition state and handleContextMenu are no longer needed.

  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  const placeholders = ["Exp No.", "Payment Type", "Amount"];
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

  const categoryRecords = selectedCategory
    ? expenseRecordList.filter(
        (r) => r.category_id === selectedCategory.id && Number(r.amount) > 0
      )
    : [];

  const filteredCategoryRecords = categoryRecords.filter(record => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const expNoMatch = record.expense_no?.toLowerCase().includes(query);
    const typeMatch = record.payment_type?.toLowerCase().includes(query);
    const amountMatch = record.amount?.toString().includes(query);
    return expNoMatch || typeMatch || amountMatch;
  });

  const categoryTotal = categoryRecords.reduce(
    (sum, r) => sum + Number(r.amount),
    0
  );

  // Records for a specific item (any record that has a line_item containing this item)
  const itemRecords = selectedExpenseItem
    ? expenseRecordList.filter((r) => {
        if (!r.line_items_json) return false;
        try {
          const items = JSON.parse(r.line_items_json) as Array<{
            name?: string;
            itemId?: string;
          }>;
          return items.some(
            (li) =>
              li.name === selectedExpenseItem.name ||
              li.itemId === selectedExpenseItem.id
          );
        } catch {
          return false;
        }
      })
    : [];

  const filteredItemRecords = itemRecords.filter(record => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const expNoMatch = record.expense_no?.toLowerCase().includes(query);
    const typeMatch = record.payment_type?.toLowerCase().includes(query);
    const amountMatch = record.amount?.toString().includes(query);
    return expNoMatch || typeMatch || amountMatch;
  });

  // Total amount spent on selected item across all records
  const itemTotal = selectedExpenseItem
    ? expenseRecordList.reduce((sum, r) => {
        if (!r.line_items_json) return sum;
        try {
          const items = JSON.parse(r.line_items_json) as Array<{
            name?: string;
            itemId?: string;
            amount?: number;
          }>;
          const match = items.find(
            (li) =>
              li.name === selectedExpenseItem.name ||
              li.itemId === selectedExpenseItem.id
          );
          return sum + Number(match?.amount ?? 0);
        } catch {
          return sum;
        }
      }, 0)
    : 0;

  return (
    <div className="flex-1 flex flex-col gap-1">
      {activeTab === "category" ? (
        selectedCategory ? (
          <>
            {/* Category Info Card */}
            <div className="bg-white rounded-md shadow-sm px-6 pt-6 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    {selectedCategory.name.toUpperCase()}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#E53935]">
                    Total : {currencyStr} {categoryTotal.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="flex-1 bg-white rounded-md shadow-sm overflow-hidden flex flex-col">
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
                <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 text-xs">
                      DATE
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 text-xs">
                      EXP NO.
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 text-xs">
                      PAYMENT TYPE
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600 text-xs">
                      AMOUNT
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-600 text-xs w-12">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategoryRecords.length > 0 ? (
                    filteredCategoryRecords.map((record) => (
                      <tr
                        key={record.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">
                          {formatDate(record.created_at)}
                        </td>
                        <td className="px-4 py-3">{record.expense_no ?? "-"}</td>
                        <td className="px-4 py-3">{record.payment_type}</td>
                        <td className="px-4 py-3 text-right">
                          {Number(record.amount).toFixed(2)}
                        </td>
                        <td className="px-2 py-3 text-center w-12">
                          <ExpenseRowActions
                            record={record}
                            onEditRecord={(r) => onEditRecord && onEditRecord(r)}
                            onDeleteRecord={(r) => onDeleteRecord && onDeleteRecord(r)}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-10 text-center text-gray-400 text-sm"
                      >
                        No transactions found for this category.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Empty Category Info Card */}
            <div className="bg-white rounded-md shadow-sm px-6 pt-6 pb-4">
              <div className="flex items-center h-10">
                <p className="text-sm text-gray-400">No expense category selected. Add a category from the left panel.</p>
              </div>
            </div>

            {/* Empty Transactions Card */}
            <div className="flex-1 bg-white rounded-md shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 pt-4 pb-2 border-b border-gray-200">
                <h3 className="text-base font-bold text-[#222B45] tracking-wide">TRANSACTIONS</h3>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center py-16 select-none">
                <div className="mb-3 flex items-center justify-center w-14 h-14 rounded-full bg-gray-100">
                  <FolderOpen className="w-7 h-7 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-500">No expense category selected</p>
                <p className="mt-1 text-xs text-gray-400">Add a category from the left panel to get started.</p>
              </div>
            </div>
          </>
        )
      ) : (
        selectedExpenseItem ? (
          <>
            {/* Item Info Card */}
            <div className="bg-white rounded-md shadow-sm px-6 pt-6 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    {selectedExpenseItem.name.toUpperCase()}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Price : {currencyStr} {selectedExpenseItem.price.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#E53935]">
                    Total : {currencyStr} {itemTotal.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Item Transactions Table */}
            <div className="flex-1 bg-white rounded-md shadow-sm overflow-hidden flex flex-col">
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
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 text-xs">
                      DATE
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 text-xs">
                      EXP NO.
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 text-xs">
                      PAYMENT TYPE
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600 text-xs">
                      AMOUNT
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-600 text-xs w-12">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItemRecords.length > 0 ? (
                    filteredItemRecords.map((record) => {
                      // Extract this item's amount from line_items_json
                      let itemAmt = 0;
                      try {
                        const items = JSON.parse(
                          record.line_items_json ?? "[]"
                        ) as Array<{
                          name?: string;
                          itemId?: string;
                          amount?: number;
                        }>;
                        const match = items.find(
                          (li) =>
                            li.name === selectedExpenseItem.name ||
                            li.itemId === selectedExpenseItem.id
                        );
                        itemAmt = Number(match?.amount ?? 0);
                      } catch {
                        itemAmt = 0;
                      }
                      return (
                        <tr
                          key={record.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="px-4 py-3">
                            {formatDate(record.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            {record.expense_no ?? "-"}
                          </td>
                          <td className="px-4 py-3">{record.payment_type}</td>
                          <td className="px-4 py-3 text-right">
                            {itemAmt.toFixed(2)}
                          </td>
                          <td className="px-2 py-3 text-center w-12">
                            <ExpenseRowActions
                              record={record}
                              onEditRecord={(r) => onEditRecord && onEditRecord(r)}
                              onDeleteRecord={(r) => onDeleteRecord && onDeleteRecord(r)}
                            />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-10 text-center text-gray-400 text-sm"
                      >
                        No transactions found for this item.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Empty Item Info Card */}
            <div className="bg-white rounded-md shadow-sm px-6 pt-6 pb-4">
              <div className="flex items-center h-10">
                <p className="text-sm text-gray-400">No expense item selected. Add an item from the left panel.</p>
              </div>
            </div>

            {/* Empty Transactions Card */}
            <div className="flex-1 bg-white rounded-md shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 pt-4 pb-2 border-b border-gray-200">
                <h3 className="text-base font-bold text-[#222B45] tracking-wide">TRANSACTIONS</h3>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center py-16 select-none">
                <div className="mb-3 flex items-center justify-center w-14 h-14 rounded-full bg-gray-100">
                  <Tag className="w-7 h-7 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-500">No expense item selected</p>
                <p className="mt-1 text-xs text-gray-400">Add an item from the left panel to get started.</p>
              </div>
            </div>
          </>
        )
      )}

    </div>
  );
}
