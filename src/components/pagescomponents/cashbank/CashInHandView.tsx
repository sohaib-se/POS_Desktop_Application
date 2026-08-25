import { useState } from "react";
import { AlignJustify, Filter, MoreVertical, Info, Trash2, Pencil } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { EnterPasscodeScreen } from "@/components/common/EnterPasscodeScreen";
import { ConfirmDeleteModal } from "@/components/common/ConfirmDeleteModal";
import { AdjustCashModal } from "./AdjustCashModal";
import { DetailsModal } from "./DetailsModal";

interface CashInHandViewProps {
  totalCash: number;
  transactions: any[];
  showAdjustCash: boolean;
  setShowAdjustCash: (show: boolean) => void;
  fetchTransactions: () => void;
  contextMenu: { x: number; y: number; transaction: any } | null;
  setContextMenu: (menu: { x: number; y: number; transaction: any } | null) => void;
  detailsTransaction: any | null;
  setDetailsTransaction: (tx: any | null) => void;
  editingTransaction: any | null;
  setEditingTransaction: (tx: any | null) => void;
  handleDelete: (id: string) => void;
  handleEdit: (tx: any, updatedAmount: number) => void;
  isDeleting: boolean;
}

export function CashInHandView({
  totalCash,
  transactions,
  showAdjustCash,
  setShowAdjustCash,
  fetchTransactions,
  contextMenu,
  setContextMenu,
  detailsTransaction,
  setDetailsTransaction,
  editingTransaction,
  setEditingTransaction,
  handleDelete,
  handleEdit,
  isDeleting
}: CashInHandViewProps) {
  const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });
  const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
  const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;

  const [isPasscodeEnabled] = useSettings('settings.isPasscodeEnabled', false);
  const [isPasscodeForTransactionEnabled] = useSettings('settings.isPasscodeForTransactionEnabled', false);
  const [passcodeAction, setPasscodeAction] = useState<{ type: 'delete', payload: string } | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editingAdjustTx, setEditingAdjustTx] = useState<any>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmationId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmationId) {
      if (isPasscodeEnabled && isPasscodeForTransactionEnabled) {
        setPasscodeAction({ type: 'delete', payload: deleteConfirmationId });
      } else {
        handleDelete(deleteConfirmationId);
      }
      setDeleteConfirmationId(null);
    }
  };

  const handlePasscodeSuccess = () => {
    if (passcodeAction?.type === 'delete') {
      handleDelete(passcodeAction.payload);
    }
    setPasscodeAction(null);
  };

  const openEdit = (tx: any) => {
    setEditingTransaction(tx);
    setEditAmount(Math.abs(Number(tx.amount)).toString());
    setContextMenu(null);
  };

  const isTransfer = (tx: any) =>
    String(tx.id).endsWith('-cash') ||
    String(tx.name || '').toLowerCase().includes('transfer');

  const isAdjustCash = (tx: any) =>
    tx.type === 'Increase Cash' || tx.type === 'Decrease Cash';

  return (
    <div className="h-full flex flex-col bg-[#D0DCE7] gap-1">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-3 flex items-center justify-between mx-1 mt-1 rounded-md">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-gray-900">
            Cash In Hand
          </h2>
          <span className="text-base font-bold text-green-600">
            {currencyStr} {totalCash.toLocaleString()}
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
                      {currencyStr} {tx.amount}
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
        open={showAdjustCash || !!editingAdjustTx}
        onClose={() => {
          setShowAdjustCash(false);
          setEditingAdjustTx(null);
        }}
        currentCash={totalCash}
        onSuccess={fetchTransactions}
        editingTransaction={editingAdjustTx}
      />
      <DetailsModal
        open={!!detailsTransaction}
        onClose={() => setDetailsTransaction(null)}
        transaction={detailsTransaction}
      />

      {/* Edit Transfer Modal */}
      {editingTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Edit Transaction</h2>
            <p className="text-xs text-gray-500 mb-4">
              {editingTransaction.type} — {editingTransaction.name}
              {isTransfer(editingTransaction) && (
                <span className="ml-1 text-blue-500 font-medium">(Syncs with bank account)</span>
              )}
            </p>
            <label className="block text-sm text-gray-600 mb-1">Amount</label>
            <input
              type="number"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:border-blue-400"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingTransaction(null)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleEdit(editingTransaction, Number(editAmount))}
                className="px-4 py-2 text-sm rounded-lg bg-[#E53935] text-white hover:bg-red-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {contextMenu && (
        <div
          className="fixed z-50 w-36 bg-white rounded-lg shadow-xl border border-gray-100 py-1"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          {isAdjustCash(contextMenu.transaction) && (
            <button
              onClick={() => {
                setEditingAdjustTx(contextMenu.transaction);
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
          )}
          <button
            onClick={() => {
              handleDeleteClick(contextMenu.transaction.id);
              setContextMenu(null);
            }}
            disabled={isDeleting}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}

      {passcodeAction && (
        <EnterPasscodeScreen
          onSuccess={handlePasscodeSuccess}
          onCancel={() => setPasscodeAction(null)}
        />
      )}

      <ConfirmDeleteModal
        isOpen={!!deleteConfirmationId}
        onClose={() => setDeleteConfirmationId(null)}
        onConfirm={confirmDelete}
        title="Delete Transaction"
        message="Are you sure you want to permanently delete this transaction? This action cannot be undone and will affect your cash balance."
        isDeleting={isDeleting}
      />
    </div>
  );
}
