import { Search, Printer } from "lucide-react";
import { Card, CardContent } from "./ui";
import type { ItemTransactionRow } from "./types";

type TransactionsCardProps = {
  filteredItemTransactions: ItemTransactionRow[];
  showTransactionSearch: boolean;
  transactionSearchTerm: string;
  onSetShowTransactionSearch: (show: boolean) => void;
  onSetTransactionSearchTerm: (term: string) => void;
  onPrintTransactions: () => void;
  onExportExcel: () => void;
};

export function TransactionsCard({
  filteredItemTransactions,
  showTransactionSearch,
  transactionSearchTerm,
  onSetShowTransactionSearch,
  onSetTransactionSearchTerm,
  onPrintTransactions,
  onExportExcel,
}: TransactionsCardProps) {
  return (
    <Card className="bg-white rounded-md flex flex-col flex-1 overflow-hidden shadow-sm p-0">
      <CardContent className="p-0">
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <h3 className="text-base font-bold text-[#222B45] tracking-wide">
            TRANSACTIONS
          </h3>
          <div className="flex gap-2 items-center">
            {showTransactionSearch && (
              <div className="flex items-center bg-[#F7F9FB] rounded-lg px-3 py-1.5 border border-[#E3EAF2] w-64 mr-2">
                <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={transactionSearchTerm}
                  onChange={(e) => onSetTransactionSearchTerm(e.target.value)}
                  onBlur={() => {
                    setTimeout(() => {
                      onSetShowTransactionSearch(false);
                      onSetTransactionSearchTerm("");
                    }, 150);
                  }}
                  className="w-full bg-transparent border-none outline-none text-sm"
                  autoFocus
                />
              </div>
            )}
            {!showTransactionSearch && (
              <button
                onClick={() => onSetShowTransactionSearch(true)}
                className="p-1.5 hover:bg-[#F7F9FB] rounded"
              >
                <Search className="w-4 h-4 text-[#7B8A9A]" />
              </button>
            )}
            <button
              onClick={onPrintTransactions}
              className="p-1.5 hover:bg-[#F7F9FB] rounded"
            >
              <Printer className="w-4 h-4 text-[#7B8A9A]" />
            </button>
            <button
              onClick={onExportExcel}
              className="p-1.5 hover:bg-[#F7F9FB] rounded relative"
            >
              <span className="bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                xls
              </span>
            </button>
          </div>
        </div>
        <div className="border-t border-[#E3EAF2] rounded-b-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F7F9FB] sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-[#7B8A9A] text-xs tracking-wide align-middle">
                  TYPE{" "}
                </th>
                <th className="px-4 py-2 text-left font-semibold text-[#7B8A9A] text-xs tracking-wide align-middle">
                  INVOICE/#{" "}
                </th>
                <th className="px-4 py-2 text-left font-semibold text-[#7B8A9A] text-xs tracking-wide align-middle">
                  NAME{" "}
                </th>
                <th className="px-4 py-2 text-left font-semibold text-[#7B8A9A] text-xs tracking-wide align-middle">
                  DATE{" "}
                </th>
                <th className="px-4 py-2 text-right font-semibold text-[#7B8A9A] text-xs tracking-wide align-middle">
                  QUANTITY{" "}
                </th>
                <th className="px-4 py-2 text-right font-semibold text-[#7B8A9A] text-xs tracking-wide align-middle">
                  PRICE/U...{" "}
                </th>
                <th className="px-4 py-2 text-left font-semibold text-[#7B8A9A] text-xs tracking-wide align-middle">
                  STATUS{" "}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItemTransactions.length ? (
                filteredItemTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-[#E3EAF2] hover:bg-[#F5F8FA]"
                  >
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex items-center gap-1.5 ${
                          transaction.type === "Sale"
                            ? "text-[#43A047]"
                            : "text-[#E53935]"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            transaction.type === "Sale"
                              ? "bg-[#43A047]"
                              : "bg-[#E53935]"
                          }`}
                        ></span>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-4 py-2">{transaction.invoiceNo}</td>
                    <td className="px-4 py-2">{transaction.partyName}</td>
                    <td className="px-4 py-2">{transaction.date}</td>
                    <td className="px-4 py-2 text-right">
                      {Number(transaction.quantity).toLocaleString()}{" "}
                      {transaction.unit || ""}
                    </td>
                    <td className="px-4 py-2 text-right">
                      Rs {Number(transaction.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          transaction.status === "Paid"
                            ? "bg-[#E6F4EA] text-[#43A047]"
                            : transaction.status === "Unpaid"
                              ? "bg-[#FDEAEA] text-[#E53935]"
                              : "bg-[#F7F9FB] text-[#7B8A9A]"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No transactions found for this item
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
