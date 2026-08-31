import { Search, Pencil, Trash2, Download } from "lucide-react";
import type { PurchaseBillViewRow } from "./types";

interface PurchaseBillContextMenuProps {
  openRowMenuId: string | null;
  openRowMenuPosition: { left: number; top: number } | null;
  invoiceRows: PurchaseBillViewRow[];
  openViewDialog: (invoice: PurchaseBillViewRow) => void;
  setOpenRowMenuId: (id: string | null) => void;
  setOpenRowMenuPosition: (pos: { left: number; top: number } | null) => void;
  onEditInvoice: (invoice: PurchaseBillViewRow) => void;
  handleDeleteInvoice: (invoice: PurchaseBillViewRow) => void;
}

export function PurchaseBillContextMenu({
  openRowMenuId,
  openRowMenuPosition,
  invoiceRows,
  openViewDialog,
  setOpenRowMenuId,
  setOpenRowMenuPosition,
  onEditInvoice,
  handleDeleteInvoice
}: PurchaseBillContextMenuProps) {
  if (!openRowMenuId || !openRowMenuPosition) return null;

  const targetInvoice = invoiceRows.find((row) => row.id === openRowMenuId) ?? null;
  if (!targetInvoice) return null;

  const hasAttachment = Boolean(targetInvoice.attachmentImagePath || targetInvoice.attachmentDocumentPath);

  return (
    <div
      className="fixed z-50 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
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
      {hasAttachment && (
        <button
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
          onClick={() => {
            const getExtension = (path: string) => {
              const match = path.match(/\.[0-9a-z]+$/i);
              return match ? match[0] : "";
            };

            if (targetInvoice.attachmentImagePath) {
              const ext = getExtension(targetInvoice.attachmentImagePath);
              const a = document.createElement("a");
              a.href = targetInvoice.attachmentImagePath;
              a.download = `purchase_bill_${targetInvoice.invoiceNo}_image${ext}`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }
            if (targetInvoice.attachmentDocumentPath) {
              const docPath = targetInvoice.attachmentDocumentPath;
              const ext = getExtension(docPath);
              setTimeout(() => {
                const a = document.createElement("a");
                a.href = docPath;
                a.download = `purchase_bill_${targetInvoice.invoiceNo}_doc${ext}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }, 100);
            }
            setOpenRowMenuId(null);
            setOpenRowMenuPosition(null);
          }}
        >
          <Download className="w-4 h-4 text-gray-500" />
          Download Attachments
        </button>
      )}
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
