import { useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Printer } from "lucide-react";
import { BarcodeLabel } from "./BarcodeLabel";
import type { BarcodeItem } from "./BarcodeGeneratorItemList";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Item } from "@/types";
import { useReactToPrint } from "react-to-print";

interface BarcodeGenerateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: BarcodeItem[];
  allItems?: Item[];
  companyName?: string;
}

export function BarcodeGenerateModal({ open, onOpenChange, items, allItems = [], companyName = "" }: BarcodeGenerateModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: "Barcode_Labels",
    onAfterPrint: () => onOpenChange(false)
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 border-0 bg-transparent shadow-none" showCloseButton={false}>
        <DialogTitle className="sr-only">Generate Barcodes</DialogTitle>
        <div className="bg-white rounded-lg flex flex-col h-full overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-[#F8FAFC]">
            <h3 className="text-lg font-semibold text-gray-700">Generate</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => onOpenChange(false)}
                className="p-1 rounded-md hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col items-center">
            <div className="w-full print-area" ref={contentRef}>
              {(() => {
                const allLabels = items.flatMap((item, index) => {
                  const count = parseInt(item.noOfLabels, 10) || 1;
                  return Array.from({ length: count }).map((_, i) => ({
                    item,
                    key: `${item.id}-${index}-${i}`
                  }));
                });

                const chunkedLabels = [];
                for (let i = 0; i < allLabels.length; i += 10) {
                  chunkedLabels.push(allLabels.slice(i, i + 10));
                }

                return chunkedLabels.map((pageLabels, pageIndex) => (
                  <div
                    key={pageIndex}
                    className="flex flex-wrap gap-8 justify-center items-start p-8 break-after-page print:h-[100vh] print:p-8"
                  >
                    {pageLabels.map(({ item, key }) => (
                      <BarcodeLabel
                        key={key}
                        formData={item}
                        items={allItems}
                        companyName={companyName}
                        className="bg-white shadow-sm break-inside-avoid"
                      />
                    ))}
                  </div>
                ));
              })()}
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 flex justify-end gap-4 bg-white">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-8 rounded-full border-gray-300 text-gray-600 font-semibold"
            >
              Save & Close
            </Button>
            <Button
              onClick={() => handlePrint()}
              className="px-8 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
