import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { BarcodeLabel } from "./BarcodeLabel";
import type { BarcodeItem } from "./BarcodeGeneratorItemList";
import type { Item } from "@/types";
import type { LabelSize } from "./barcodeTypes";

interface BarcodePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: BarcodeItem[];
  allItems?: Item[];
  companyName?: string;
  labelSize?: LabelSize;
}

export function BarcodePreviewModal({
  open,
  onOpenChange,
  items,
  allItems = [],
  companyName = "",
  labelSize,
}: BarcodePreviewModalProps) {
  const size: LabelSize = labelSize ?? {
    id: "2x50x25",
    name: "2 Labels (50x25mm)",
    widthMm: 50,
    heightMm: 25,
    columns: 2,
    perPage: 20,
  };

  // Expand items based on noOfLabels
  const allLabels = items.flatMap((item, itemIndex) => {
    const count = Math.max(1, Math.min(parseInt(item.noOfLabels, 10) || 1, 500));
    return Array.from({ length: count }).map((_, i) => ({
      item,
      key: `${item.id}-${itemIndex}-${i}`,
    }));
  });

  // Group into pages
  const pages: typeof allLabels[] = [];
  for (let i = 0; i < allLabels.length; i += size.perPage) {
    pages.push(allLabels.slice(i, i + size.perPage));
  }

  const totalLabels = allLabels.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[85vh] flex flex-col p-0 border-0 bg-transparent shadow-none"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Barcode Preview</DialogTitle>
        <div className="bg-white rounded-lg flex flex-col h-full overflow-hidden">

          {/* ── Header ───────────────────────────────────────── */}
          <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-[#F8FAFC]">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-700">Labels Preview</h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {totalLabels} label{totalLabels !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">{size.name}</span>
              <button
                onClick={() => onOpenChange(false)}
                className="p-1 rounded-md hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* ── Scrollable preview area ───────────────────────── */}
          <div className="flex-1 overflow-y-auto bg-gray-50/50">
            {pages.map((pageLabels, pageIndex) => (
              <div key={pageIndex} className="mb-4">
                {/* Page indicator */}
                <div className="text-center py-2">
                  <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-200">
                    Page {pageIndex + 1}
                  </span>
                </div>

                <div
                  className="flex flex-wrap gap-4 justify-center items-start p-6 bg-white mx-4 rounded-lg border border-gray-200"
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${Math.min(size.columns, 4)}, 1fr)`,
                    gap: "16px",
                  }}
                >
                  {pageLabels.map(({ item, key }) => (
                    <BarcodeLabel
                      key={key}
                      formData={item}
                      items={allItems}
                      companyName={companyName}
                      widthMm={size.widthMm}
                      heightMm={size.heightMm}
                      className="shadow-md"
                    />
                  ))}
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                No items selected for preview
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
