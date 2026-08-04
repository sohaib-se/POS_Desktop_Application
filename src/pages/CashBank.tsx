import { useState, useEffect } from "react";
import {
  Plus,
  Printer,
  Landmark,
  Wallet,
  CreditCard,
  AlignJustify,
  MoreVertical,
  Filter,
  Trash2,
  Info
} from "lucide-react";

interface CashBankProps {
  subView: string;
}

// ─── Shared Modal ─────────────────────────────────────────────────────────────

function Modal({ open, onClose, title, children }: { open: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 relative">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Adjust Cash Modal ────────────────────────────────────────────────────────

function AdjustCashModal({ open, onClose, currentCash, onSuccess }: { open: boolean, onClose: () => void, currentCash: number, onSuccess: () => void }) {
  const [mode, setMode] = useState("add");
  const [amount, setAmount] = useState<number | string>("");
  const [date, setDate] = useState(new Date().toLocaleDateString("en-GB"));
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const updatedCash =
    mode === "add"
      ? currentCash + Number(amount)
      : currentCash - Number(amount);

  const handleSave = async () => {
    if (!description || !amount) return;
    setIsSaving(true);
    try {
      const type = mode === "add" ? "Increase Cash" : "Decrease Cash";
      const res = await fetch("/api/cash_transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: description,
          type,
          amount: Number(amount),
          date
        })
      });
      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Adjust Cash">
      <div className="space-y-5">
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={mode === "add"}
              onChange={() => setMode("add")}
              className="accent-[#E53935] w-4 h-4"
            />
            <span className="text-sm text-gray-800">Add Cash</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={mode === "reduce"}
              onChange={() => setMode("reduce")}
              className="accent-[#E53935] w-4 h-4"
            />
            <span className="text-sm text-gray-800">Reduce Cash</span>
          </label>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Enter Amount<span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
              Rs
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1.5">
            Updated Cash:{" "}
            <span className="text-gray-800 font-medium">
              Rs {updatedCash.toLocaleString()}
            </span>
          </p>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Adjustment Date
          </label>
          <div className="relative">
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-400"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-base">
              📅
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Description<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter Description"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-5 mt-2">
        <button
          onClick={onClose}
          className="px-5 py-2 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-[#E53935] text-white rounded-full text-sm font-medium hover:bg-red-600 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </Modal>
  );
}

function DetailsModal({ open, onClose, transaction }: { open: boolean, onClose: () => void, transaction: any }) {
  if (!transaction) return null;
  return (
    <Modal open={open} onClose={onClose} title="Transaction Details">
      <div className="space-y-4">
        <div>
          <span className="block text-sm text-gray-500">Date</span>
          <span className="text-gray-900 font-medium">{transaction.date}</span>
        </div>
        <div>
          <span className="block text-sm text-gray-500">Name / Description</span>
          <span className="text-gray-900 font-medium">{transaction.name.replace(' (Payment In)', '').replace(' (Payment Out)', '').replace(' (Received)', '')}</span>
        </div>
        <div>
          <span className="block text-sm text-gray-500">Type</span>
          <span className="text-gray-900 font-medium">{transaction.type}</span>
        </div>
        <div>
          <span className="block text-sm text-gray-500">Amount</span>
          <span className="text-gray-900 font-medium">Rs {Number(transaction.amount).toLocaleString()}</span>
        </div>
      </div>
    </Modal>
  );
}

// ─── Main CashBank Component ──────────────────────────────────────────────────

export function CashBank({ subView }: CashBankProps) {
  const [showAddBank, setShowAddBank] = useState(false);
  const [showAdjustCash, setShowAdjustCash] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; transaction: any } | null>(null);
  const [detailsTransaction, setDetailsTransaction] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/cash_transactions");
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (e) {
      console.error("Failed to load cash transactions", e);
    }
  };

  useEffect(() => {
    if (subView === "cash-in-hand") {
      fetchTransactions();
    }
  }, [subView]);

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const totalCash = transactions.reduce((acc, tx) => {
    const type = String(tx.type).toLowerCase();
    const isCashIn = type.includes("in") || type === "sale" || type.includes("add") || type.includes("increase") || type === "pos sale";
    return isCashIn ? acc + Number(tx.amount) : acc - Number(tx.amount);
  }, 0);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/cash_transactions?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchTransactions();
      } else {
        alert("Cannot delete a system transaction here. Delete the original invoice instead.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
      setContextMenu(null);
    }
  };

  if (subView === "bank-accounts") {
    return (
      <div className="h-full flex flex-col bg-[#D0DCE7] gap-1 p-1">
        <div
          className="bg-white rounded-md shadow-sm p-6 flex-1 overflow-auto"
          style={{ marginLeft: "4px", marginRight: "4px" }}
        >
          <div className="text-center py-12">
            <div className="w-32 h-32 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl transform rotate-6"></div>
              <div className="absolute inset-0 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                <Landmark className="w-16 h-16 text-gray-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-yellow-800 text-lg">$</span>
              </div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-yellow-300 rounded-full flex items-center justify-center">
                <span className="text-yellow-800 text-sm">$</span>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Manage Multiple Bank Accounts
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              With Vyapar, you can organize multiple bank accounts and track all
              your financial transactions in one place.
            </p>

            <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
              <div className="bg-blue-50 rounded-xl p-4 text-left">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <Printer className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">
                  Print Bank Details on Invoices
                </h3>
                <p className="text-xs text-gray-500">
                  Share your bank account information on invoices so customers
                  can pay you easily.
                </p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-left">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">
                  Unlimited Payment Types
                </h3>
                <p className="text-xs text-gray-500">
                  Record payments received through banks, cards, or any method
                  you prefer.
                </p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-left">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                  <Wallet className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">
                  Maintain Accurate Records
                </h3>
                <p className="text-xs text-gray-500">
                  Keep your financial entries organised for better clarity and
                  reporting.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAddBank(true)}
              className="bg-[#E53935] hover:bg-red-600 text-white px-6 py-3 rounded-lg text-sm font-medium flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Add Bank Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (subView === "cash-in-hand") {
    return (
      <div className="h-full flex flex-col bg-[#D0DCE7] gap-1">
        {/* Header */}
        <div className="bg-white shadow-sm px-6 py-3 flex items-center justify-between mx-1 mt-1 rounded-md">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-gray-900">
              Cash In Hand
            </h2>
            <span className="text-base font-bold text-green-600">
              Rs {totalCash.toLocaleString()}
            </span>
          </div>
          <button
            onClick={() => setShowAdjustCash(true)}
            className="bg-[#E53935] hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <AlignJustify className="w-4 h-4" />
            Adjust Cash
          </button>
        </div>

        {/* Transactions */}
        <div className="flex-1 overflow-auto mx-1 mb-1">
          <div className="bg-white rounded-md shadow-sm min-h-full">
            <div className="px-6 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">
                Transactions
              </h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Type", "Name", "Date", "Amount"].map((col) => (
                    <th
                      key={col}
                      className="px-6 py-2.5 text-left text-xs font-medium text-gray-500"
                    >
                      <div className="flex items-center gap-1">
                        {col}
                        <Filter className="w-3 h-3" />
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => {
                  const type = String(tx.type).toLowerCase();
                  const isCashIn = type.includes("in") || type === "sale" || type.includes("add") || type.includes("increase") || type === "pos sale";
                  return (
                    <tr
                      key={tx.id}
                      className={`border-b border-gray-50 hover:bg-gray-50 ${i % 2 === 0 ? "bg-blue-50/20" : ""
                        }`}
                    >
                      <td className="px-6 py-3 font-medium text-gray-800">
                        {tx.type}
                      </td>
                      <td className="px-6 py-3 text-gray-700">{tx.name.replace(' (Payment In)', '').replace(' (Payment Out)', '').replace(' (Received)', '')}</td>
                      <td className="px-6 py-3 text-gray-600">{tx.date}</td>
                      <td
                        className={`px-6 py-3 font-medium ${isCashIn
                          ? "text-green-600"
                          : "text-red-500"
                          }`}
                      >
                        Rs {tx.amount}
                      </td>
                      <td className="px-4 py-3 relative">
                        <button
                          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            setContextMenu({ x: rect.right - 140, y: rect.bottom, transaction: tx });
                          }}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <AdjustCashModal
          open={showAdjustCash}
          onClose={() => setShowAdjustCash(false)}
          currentCash={totalCash}
          onSuccess={fetchTransactions}
        />
        <DetailsModal
          open={!!detailsTransaction}
          onClose={() => setDetailsTransaction(null)}
          transaction={detailsTransaction}
        />
        {contextMenu && (
          <div
            className="fixed z-50 w-36 bg-white rounded-lg shadow-xl border border-gray-100 py-1"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setDetailsTransaction(contextMenu.transaction);
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Info className="w-4 h-4" />
              Details
            </button>
            <button
              onClick={() => handleDelete(contextMenu.transaction.id)}
              disabled={isDeleting}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center bg-white">
      <div className="text-center text-gray-500">
        <Landmark className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-lg">Select a Cash & Bank option from the sidebar</p>
      </div>
    </div>
  );
}
