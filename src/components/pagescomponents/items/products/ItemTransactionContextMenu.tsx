import { Search, Pencil, Trash2 } from "lucide-react";
import type { ItemTransactionRow } from "./types";

interface ItemTransactionContextMenuProps {
  openRowMenuId: string | null;
  openRowMenuPosition: { left: number; top: number } | null;
  transactions: ItemTransactionRow[];
  openViewDialog?: (transaction: ItemTransactionRow) => void;
  setOpenRowMenuId: (id: string | null) => void;
  setOpenRowMenuPosition: (pos: { left: number; top: number } | null) => void;
  onEditTransaction?: (transaction: ItemTransactionRow) => void;
  handleDeleteTransaction?: (transaction: ItemTransactionRow) => void;
}

export function ItemTransactionContextMenu({
  openRowMenuId,
  openRowMenuPosition,
  transactions,
  openViewDialog,
  setOpenRowMenuId,
  setOpenRowMenuPosition,
  onEditTransaction,
  handleDeleteTransaction
}: ItemTransactionContextMenuProps) {
  if (!openRowMenuId || !openRowMenuPosition) return null;

  const targetTransaction = transactions.find((row) => row.id === openRowMenuId) ?? null;
  if (!targetTransaction) return null;

  return (
    <div
      className="fixed z-50 w-36 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
      style={{ left: openRowMenuPosition.left, top: openRowMenuPosition.top }}
      onClick={(event) => event.stopPropagation()}
    >
      {targetTransaction.type !== "Add Stock" && targetTransaction.type !== "Reduce Stock" && (
        <>
          <button
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
            onClick={() => {
              openViewDialog?.(targetTransaction);
              setOpenRowMenuId(null);
              setOpenRowMenuPosition(null);
            }}
          >
            <Search className="w-4 h-4 text-gray-500" />
            View
          </button>
          <button
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
            onClick={() => {
              onEditTransaction?.(targetTransaction);
              setOpenRowMenuId(null);
              setOpenRowMenuPosition(null);
            }}
          >
            <Pencil className="w-4 h-4 text-gray-500" />
            Edit
          </button>
        </>
      )}
      <button
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
        onClick={() => {
          handleDeleteTransaction?.(targetTransaction);
          setOpenRowMenuId(null);
          setOpenRowMenuPosition(null);
        }}
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
    </div>
  );
}
