import { Pencil, Trash2, Eye } from "lucide-react";

interface PaymentOutRowMenuProps {
  openRowMenuId: string | null;
  openRowMenuPosition: { left: number; top: number } | null;
  records: any[];
  setShowAddPayment: (show: boolean, record?: any) => void;
  handleDelete: (id: string) => void;
  setOpenRowMenuId: (id: string | null) => void;
  setOpenRowMenuPosition: (pos: { left: number; top: number } | null) => void;
  onPrint: (record: any) => void;
}

export function PaymentOutRowMenu({
  openRowMenuId,
  openRowMenuPosition,
  records,
  setShowAddPayment,
  handleDelete,
  setOpenRowMenuId,
  setOpenRowMenuPosition,
  onPrint,
}: PaymentOutRowMenuProps) {
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
          onPrint(targetItem);
          setOpenRowMenuId(null);
          setOpenRowMenuPosition(null);
        }}
      >
        <Eye className="w-4 h-4 text-gray-500" />
        Preview
      </button>
      <button
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
        onClick={() => {
          setShowAddPayment(true, targetItem);
          setOpenRowMenuId(null);
          setOpenRowMenuPosition(null);
        }}
      >
        <Pencil className="w-4 h-4 text-gray-500" />
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
