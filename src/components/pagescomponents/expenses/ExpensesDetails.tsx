import type { ExpenseCategory } from "@/types";
import type { ExpenseItem } from "./types";

interface ExpensesDetailsProps {
  activeTab: "category" | "items";
  selectedCategory: ExpenseCategory | null;
  selectedExpenseItem: ExpenseItem | null;
}

export function ExpensesDetails({
  activeTab,
  selectedCategory,
  selectedExpenseItem,
}: ExpensesDetailsProps) {
  return (
    <div className="flex-1 flex flex-col gap-1">
      {activeTab === "category" ? (
        selectedCategory && (
          <>
            {/* Category Info Card */}
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
                    Total : Rs {selectedCategory.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

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
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 bg-[#E3F2FD]">
                    <td className="px-4 py-3">26/02/2026</td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3">Cash</td>
                    <td className="px-4 py-3 text-right">500</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )
      ) : (
        selectedExpenseItem && (
          <>
            {/* Item Info Card */}
            <div className="bg-white rounded-md shadow-sm px-6 pt-6 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    {selectedExpenseItem.name.toUpperCase()}
                  </h2>
                  <p className="text-sm text-gray-500">Expense Item</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#E53935]">
                    Price : Rs {selectedExpenseItem.price.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Transactions Table - Empty or similar logic if needed */}
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
                  </tr>
                </thead>
                <tbody>
                </tbody>
              </table>
            </div>
          </>
        )
      )}
    </div>
  );
}
