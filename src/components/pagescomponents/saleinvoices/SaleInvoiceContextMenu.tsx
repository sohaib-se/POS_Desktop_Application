import { Search, Pencil, Trash2 } from "lucide-react";
import type { SaleInvoiceViewRow } from "./types";
import type { SaleInvoiceEditData } from "@/types";

interface SaleInvoiceContextMenuProps {
  openRowMenuId: string | null;
  openRowMenuPosition: { left: number; top: number } | null;
  invoiceRows: SaleInvoiceViewRow[];
  openViewDialog: (invoice: SaleInvoiceViewRow) => void;
  setOpenRowMenuId: (id: string | null) => void;
  setOpenRowMenuPosition: (pos: { left: number; top: number } | null) => void;
  onEditInvoice: (invoice: SaleInvoiceViewRow) => void;
  handleDeleteInvoice: (invoice: SaleInvoiceViewRow) => void;
}

export function SaleInvoiceContextMenu({
  openRowMenuId,
  openRowMenuPosition,
  invoiceRows,
  openViewDialog,
  setOpenRowMenuId,
  setOpenRowMenuPosition,
  onEditInvoice,
  handleDeleteInvoice
}: SaleInvoiceContextMenuProps) {
  if (!openRowMenuId || !openRowMenuPosition) return null;

  const targetInvoice = invoiceRows.find((row) => row.id === openRowMenuId) ?? null;
  if (!targetInvoice) return null;

  return (
    <div
      className="fixed z-50 w-36 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
      style={{ left: openRowMenuPosition.left, top: openRowMenuPosition.top }}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
        onClick={() => {
          openViewDialog(targetInvoice);
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
          onEditInvoice(targetInvoice);
          setOpenRowMenuId(null);
          setOpenRowMenuPosition(null);
        }}
      >
        <Pencil className="w-4 h-4 text-gray-500" />
        Edit
      </button>
      <button
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
        onClick={() => handleDeleteInvoice(targetInvoice)}
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
    </div>
  );
}
