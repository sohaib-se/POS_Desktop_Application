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
      {(targetItem.attachmentImagePath || targetItem.attachmentDocumentPath) && (
        <button
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
          onClick={() => {
            const getExtension = (path: string) => {
              const match = path.match(/\.[0-9a-z]+$/i);
              return match ? match[0] : "";
            };

            if (targetItem.attachmentImagePath) {
              const ext = getExtension(targetItem.attachmentImagePath);
              const a = document.createElement('a');
              a.href = targetItem.attachmentImagePath;
              a.download = `estimate_${targetItem.referenceNo}_image${ext}`;
              a.target = '_blank';
              a.click();
            }
            if (targetItem.attachmentDocumentPath) {
              setTimeout(() => {
                const ext = getExtension(targetItem.attachmentDocumentPath!);
                const a = document.createElement('a');
                a.href = targetItem.attachmentDocumentPath!;
                a.download = `estimate_${targetItem.referenceNo}_document${ext}`;
                a.target = '_blank';
                a.click();
              }, 100);
            }
            setOpenRowMenuId(null);
            setOpenRowMenuPosition(null);
          }}
        >
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
          Download Attachments
        </button>
      )}
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
