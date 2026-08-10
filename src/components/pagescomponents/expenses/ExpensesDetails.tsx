import type { ExpenseCategory } from "@/types";
import type { ExpenseItem, ExpenseRecord } from "./types";

interface ExpensesDetailsProps {
  activeTab: "category" | "items";
  selectedCategory: ExpenseCategory | null;
  selectedExpenseItem: ExpenseItem | null;
  expenseRecordList: ExpenseRecord[];
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
}: ExpensesDetailsProps) {
  const categoryRecords = selectedCategory
    ? expenseRecordList.filter(
        (r) => r.category_id === selectedCategory.id && Number(r.amount) > 0
      )
    : [];

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
        selectedCategory && (
          <>
            {/* Category Info Card */}
            <div className="bg-white rounded-md shadow-sm px-6 pt-6 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    {selectedCategory.name.toUpperCase()}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedCategory.type ?? "Indirect Expense"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#E53935]">
                    Total : Rs {categoryTotal.toFixed(2)}
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
                      PAYMENT TYPE ⚲
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600 text-xs">
                      AMOUNT ⚲
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categoryRecords.length > 0 ? (
                    categoryRecords.map((record) => (
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
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-10 text-center text-gray-400 text-sm"
                      >
                        No transactions found for this category.
                      </td>
                    </tr>
                  )}
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
                  <p className="text-sm text-gray-500">
                    Price : Rs {selectedExpenseItem.price.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#E53935]">
                    Total : Rs {itemTotal.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Item Transactions Table */}
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
                      PAYMENT TYPE ⚲
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600 text-xs">
                      AMOUNT ⚲
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {itemRecords.length > 0 ? (
                    itemRecords.map((record) => {
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
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-10 text-center text-gray-400 text-sm"
                      >
                        No transactions found for this item.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )
      )}
    </div>
  );
}
