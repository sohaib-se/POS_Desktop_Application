import { useState, useRef, useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";
import { Search, MoreVertical } from "lucide-react";
import { Card, CardContent } from "./ui";
import type { ItemTransactionRow } from "./types";
import { ItemTransactionContextMenu } from "./ItemTransactionContextMenu";
import { EnterPasscodeScreen } from "@/components/common/EnterPasscodeScreen";
type TransactionsCardProps = {
  filteredItemTransactions: ItemTransactionRow[];
  showTransactionSearch: boolean;
  transactionSearchTerm: string;
  onSetShowTransactionSearch: (show: boolean) => void;
  onSetTransactionSearchTerm: (term: string) => void;
  onExportExcel: () => void;
  onViewTransaction?: (transaction: ItemTransactionRow) => void;
  onEditTransaction?: (transaction: ItemTransactionRow) => void;
  onDeleteTransaction?: (transaction: ItemTransactionRow) => void;
};

export function TransactionsCard({
  filteredItemTransactions,
  showTransactionSearch,
  transactionSearchTerm,
  onSetShowTransactionSearch,
  onSetTransactionSearchTerm,
  onExportExcel,
  onViewTransaction,
  onEditTransaction,
  onDeleteTransaction,
}: TransactionsCardProps) {
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const placeholders = ["Customer Name", "Invoice No.", "Amount"];
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
        showTransactionSearch &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        !transactionSearchTerm
      ) {
        onSetShowTransactionSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTransactionSearch, transactionSearchTerm, onSetShowTransactionSearch]);

  const [openRowMenuId, setOpenRowMenuId] = useState<string | null>(null);
  const [openRowMenuPosition, setOpenRowMenuPosition] = useState<{ left: number; top: number } | null>(null);

  const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });
  const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
  const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;

  const [isPasscodeEnabled] = useSettings('settings.isPasscodeEnabled', false);
  const [isPasscodeForTransactionEnabled] = useSettings('settings.isPasscodeForTransactionEnabled', false);
  const [passcodeAction, setPasscodeAction] = useState<{ type: 'edit' | 'delete', payload: ItemTransactionRow } | null>(null);

  const handleEditClick = (transaction: ItemTransactionRow) => {
    if (isPasscodeEnabled && isPasscodeForTransactionEnabled) {
      setPasscodeAction({ type: 'edit', payload: transaction });
    } else {
      onEditTransaction?.(transaction);
    }
  };

  const handleDeleteClick = (transaction: ItemTransactionRow) => {
    if (isPasscodeEnabled && isPasscodeForTransactionEnabled) {
      setPasscodeAction({ type: 'delete', payload: transaction });
    } else {
      onDeleteTransaction?.(transaction);
    }
  };

  const handlePasscodeSuccess = () => {
    if (passcodeAction?.type === 'edit' && onEditTransaction) {
      onEditTransaction(passcodeAction.payload);
    } else if (passcodeAction?.type === 'delete' && onDeleteTransaction) {
      onDeleteTransaction(passcodeAction.payload);
    }
    setPasscodeAction(null);
  };

  return (
    <Card className="bg-white rounded-md flex flex-col flex-1 overflow-hidden shadow-sm p-0">
      <CardContent className="p-0">
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <h3 className="text-base font-bold text-[#222B45] tracking-wide">
            TRANSACTIONS
          </h3>
          <div className="flex gap-2 items-center h-10" ref={searchContainerRef}>
            <div 
              className={`flex items-center overflow-hidden transition-all duration-300 ease-out rounded-full h-9 ${
                showTransactionSearch 
                  ? "w-64 bg-white border border-blue-500 ring-4 ring-blue-50" 
                  : "w-9 bg-transparent border border-transparent hover:bg-gray-100 cursor-pointer"
              }`}
              onClick={(e) => {
                if (!showTransactionSearch) {
                  e.stopPropagation();
                  onSetShowTransactionSearch(true);
                  setTimeout(() => searchInputRef.current?.focus(), 150);
                }
              }}
            >
              <div className="flex items-center justify-center h-full w-9 shrink-0">
                <Search className={`w-4 h-4 ${showTransactionSearch ? "text-gray-400" : "text-gray-500"}`} />
              </div>
              <div className={`relative flex-1 h-full flex items-center transition-opacity duration-200 ${
                  showTransactionSearch ? "opacity-100 delay-100" : "opacity-0"
                }`}>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={transactionSearchTerm}
                  onChange={(e) => onSetTransactionSearchTerm(e.target.value)}
                  className="bg-transparent border-none outline-none focus:ring-0 focus:outline-none focus:border-transparent text-sm h-full w-full pr-3 relative z-10"
                />
                {!transactionSearchTerm && (
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
                <th className="px-4 py-2 text-center font-semibold text-[#7B8A9A] text-xs tracking-wide align-middle w-12">
                  {" "}
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
                    <td className="px-4 py-2">
                      {transaction.date
                        ? new Date(transaction.date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : ""}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {Number(transaction.quantity).toLocaleString()}{" "}
                      {transaction.unit || ""}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {currencyStr} {Number(transaction.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-2">
                      {transaction.status ? (
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
                      ) : null}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {transaction.type !== "Opening Stock" && (
                        <button
                          className="p-1.5 hover:bg-gray-100 rounded"
                          title="More actions"
                          onClick={(event) => {
                            event.stopPropagation();
                            const targetRect = event.currentTarget.getBoundingClientRect();
                            const menuWidth = 144;
                            const menuHeight = 96;
                            const nextLeft = Math.max(8, Math.min(targetRect.right - menuWidth, window.innerWidth - menuWidth - 8));
                            const nextTop = targetRect.bottom + menuHeight > window.innerHeight
                              ? Math.max(8, targetRect.top - menuHeight - 8)
                              : targetRect.bottom + 8;

                            setOpenRowMenuPosition((previousPosition) =>
                              openRowMenuId === transaction.id && previousPosition
                                ? null
                                : { left: nextLeft, top: nextTop },
                            );
                            setOpenRowMenuId((previous) =>
                              previous === transaction.id ? null : transaction.id,
                            );
                          }}
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                      )}
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

      <ItemTransactionContextMenu
        openRowMenuId={openRowMenuId}
        openRowMenuPosition={openRowMenuPosition}
        transactions={filteredItemTransactions}
        setOpenRowMenuId={setOpenRowMenuId}
        setOpenRowMenuPosition={setOpenRowMenuPosition}
        openViewDialog={onViewTransaction}
        onEditTransaction={handleEditClick}
        handleDeleteTransaction={handleDeleteClick}
      />

      {passcodeAction && (
        <EnterPasscodeScreen
          onSuccess={handlePasscodeSuccess}
          onCancel={() => setPasscodeAction(null)}
        />
      )}
    </Card>
  );
}
