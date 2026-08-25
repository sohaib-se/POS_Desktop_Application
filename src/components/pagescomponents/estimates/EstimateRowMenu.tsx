import { Eye, Pencil, Trash2 } from "lucide-react";
import type { EstimateRecord } from "./types";

interface EstimateRowMenuProps {
  openRowMenuId: string | null;
  openRowMenuPosition: { left: number; top: number } | null;
  records: EstimateRecord[];
  setViewingRecord: (record: EstimateRecord | null) => void;
  onEditEstimate: (record: EstimateRecord) => void;
  handleDelete: (id: string) => void;
  setOpenRowMenuId: (id: string | null) => void;
  setOpenRowMenuPosition: (pos: { left: number; top: number } | null) => void;
}

export function EstimateRowMenu({
  openRowMenuId,
  openRowMenuPosition,
  records,
  setViewingRecord,
  onEditEstimate,
  handleDelete,
  setOpenRowMenuId,
  setOpenRowMenuPosition,
}: EstimateRowMenuProps) {
  if (!openRowMenuId || !openRowMenuPosition) return null;
  
  const targetItem = records.find((r) => r.id === openRowMenuId);
  if (!targetItem) return null;

  return (
    <div
      className="fixed z-50 min-w-36 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden py-1"
      style={{
        left: `${openRowMenuPosition.left}px`,
        top: `${openRowMenuPosition.top}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
        onClick={() => {
          setViewingRecord(targetItem);
          setOpenRowMenuId(null);
          setOpenRowMenuPosition(null);
        }}
      >
        <Eye className="w-4 h-4 text-gray-500" />
        Preview
      </button>
      <button
        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
          targetItem.status === "Converted" 
            ? "opacity-50 cursor-not-allowed text-gray-400" 
            : "hover:bg-gray-50 text-gray-700"
        }`}
        disabled={targetItem.status === "Converted"}
        onClick={() => {
          if (targetItem.status === "Converted") return;
          onEditEstimate(targetItem);
          setOpenRowMenuId(null);
          setOpenRowMenuPosition(null);
        }}
        title={targetItem.status === "Converted" ? "Cannot edit a converted estimate" : ""}
      >
        <Pencil className={`w-4 h-4 ${targetItem.status === "Converted" ? "text-gray-400" : "text-gray-500"}`} />
        Edit
      </button>
      <button
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
        onClick={() => {
          handleDelete(targetItem.id);
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
