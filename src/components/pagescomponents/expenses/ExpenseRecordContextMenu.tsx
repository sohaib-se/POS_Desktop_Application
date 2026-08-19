import { Pencil, Trash2 } from "lucide-react";
import type { ExpenseRecord } from "./types";

interface ExpenseRecordContextMenuProps {
  openRowMenuId: string | null;
  openRowMenuPosition: { left: number; top: number } | null;
  records: ExpenseRecord[];
  setOpenRowMenuId: (id: string | null) => void;
  setOpenRowMenuPosition: (pos: { left: number; top: number } | null) => void;
  onEditRecord: (record: ExpenseRecord) => void;
  handleDeleteRecord: (record: ExpenseRecord) => void;
}

export function ExpenseRecordContextMenu({
  openRowMenuId,
  openRowMenuPosition,
  records,
  setOpenRowMenuId,
  setOpenRowMenuPosition,
  onEditRecord,
  handleDeleteRecord
}: ExpenseRecordContextMenuProps) {
  if (!openRowMenuId || !openRowMenuPosition) return null;

  const targetRecord = records.find((r) => r.id === openRowMenuId) ?? null;
  if (!targetRecord) return null;

  return (
    <div
      className="fixed z-50 w-36 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
      style={{ left: openRowMenuPosition.left, top: openRowMenuPosition.top }}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
        onClick={() => {
          onEditRecord(targetRecord);
          setOpenRowMenuId(null);
          setOpenRowMenuPosition(null);
        }}
      >
        <Pencil className="w-4 h-4 text-gray-500" />
        View/Edit
      </button>
      <button
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
        onClick={() => {
          handleDeleteRecord(targetRecord);
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
