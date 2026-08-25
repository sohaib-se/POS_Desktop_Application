import { Search, Pencil, Trash2 } from "lucide-react";

interface PaymentInRowMenuProps {
  openRowMenuId: string | null;
  openRowMenuPosition: { left: number; top: number } | null;
  records: any[];
  setViewingRecord: (record: any) => void;
  setOpenRowMenuId: (id: string | null) => void;
  setOpenRowMenuPosition: (pos: { left: number; top: number } | null) => void;
  setShowAddPayment: (show: boolean, record?: any) => void;
  handleDelete: (id: string) => void;
}

export function PaymentInRowMenu(props: PaymentInRowMenuProps) {
  if (!props.openRowMenuId || !props.openRowMenuPosition) return null;

  const targetItem = props.records.find((r) => r.id === props.openRowMenuId);
  if (!targetItem) return null;

  return (
    <div
      className="fixed z-50 min-w-36 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden py-1"
      style={{
        left: `${props.openRowMenuPosition.left}px`,
        top: `${props.openRowMenuPosition.top}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
        onClick={() => {
          props.setViewingRecord(targetItem);
          props.setOpenRowMenuId(null);
          props.setOpenRowMenuPosition(null);
        }}
      >
        <Search className="w-4 h-4 text-gray-500" />
        View
      </button>
      <button
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
        onClick={() => {
          props.setShowAddPayment(true, targetItem);
          props.setOpenRowMenuId(null);
          props.setOpenRowMenuPosition(null);
        }}
      >
        <Pencil className="w-4 h-4 text-gray-500" />
        Edit
      </button>
      <button
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
        onClick={() => {
          props.handleDelete(targetItem.id);
          props.setOpenRowMenuId(null);
          props.setOpenRowMenuPosition(null);
        }}
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
    </div>
  );
}
