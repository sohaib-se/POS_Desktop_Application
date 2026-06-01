import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { expenseCategories } from "@/data/mockData";
import type { ExpenseCategory } from "@/types";

interface ExpensesProps {
  onAddExpense?: () => void;
}

export function Expenses({ onAddExpense }: ExpensesProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<ExpenseCategory | null>(expenseCategories[0]);
  const [activeTab, setActiveTab] = useState<"category" | "items">("category");

  return (
    <div className="h-full flex flex-col bg-[#D0DCE7] gap-1">
      {/* Top Header Tabs */}
      <div
        className="p-0 bg-white rounded-none flex items-center justify-between shrink-0 w-full"
        style={{ minHeight: "56px" }}
      >
        <div className="flex w-full">
          {(["category", "items"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-sm font-medium pb-2 border-b-2 transition-colors ${
                activeTab === tab
                  ? "text-[#E53935] border-[#E53935]"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-1 overflow-hidden">
        {/* Left Panel - Categories/Items */}
        <div className="w-80 flex flex-col bg-white rounded-md shadow-sm overflow-hidden">
          {/* Search and Add Button */}
          <div className="p-4 border-b border-gray-200 flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded">
              <Search className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={onAddExpense}
              className="bg-[#E53935] hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-600 text-xs">
                    {activeTab === "category" ? "CATEGORY" : "ITEM"} ↑
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-gray-600 text-xs">
                    AMOUNT
                  </th>
                </tr>
              </thead>
              <tbody>
                {expenseCategories.map((cat) => (
                  <tr
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat)}
                    className={`cursor-pointer border-b border-gray-100 ${
                      selectedCategory?.id === cat.id
                        ? "bg-[#E3F2FD]"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3 text-gray-900">{cat.name}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {cat.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Panel - Category/Item Details */}
        <div className="flex-1 flex flex-col gap-1">
          {selectedCategory && (
            <>
              {/* Category Info Card */}
              {activeTab === "category" && (
                <div className="bg-white rounded-md shadow-sm px-6 pt-6 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-1">
                        {selectedCategory.name.toUpperCase()}
                      </h2>
                      <p className="text-sm text-gray-500">Indirect Expense</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#E53935]">
                        Total : Rs 500.00
                      </p>
                      <p className="text-sm text-[#E53935]">
                        Balance : Rs 0.00
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Transactions Table */}
              <div className="flex-1 bg-white rounded-md shadow-sm overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-600 text-xs">
                        DATE ⚲
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600 text-xs">
                        EXP NO. ⚲
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600 text-xs">
                        PARTY ⚲
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600 text-xs">
                        PAYMENT TYPE ⚲
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600 text-xs">
                        AMOUNT ⚲
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600 text-xs">
                        BALANCE ⚲
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 bg-[#E3F2FD]">
                      <td className="px-4 py-3">26/02/2026</td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3">Cash</td>
                      <td className="px-4 py-3 text-right">500</td>
                      <td className="px-4 py-3 text-right">0</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
