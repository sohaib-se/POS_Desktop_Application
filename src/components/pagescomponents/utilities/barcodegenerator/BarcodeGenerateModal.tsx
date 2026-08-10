import { useRef } from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
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
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 border-0 bg-transparent shadow-none">
        <DialogTitle className="sr-only">Generate Barcodes</DialogTitle>
        <div className="bg-white rounded-lg flex flex-col h-full overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-[#F8FAFC]">
            <h3 className="text-lg font-semibold text-gray-700">Labels</h3>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 rounded-md hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="px-8 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="w-64">
              <Select defaultValue="GENERIC">
                <SelectTrigger className="w-full text-sm text-gray-700 border-gray-300">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERIC">GENERIC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 bg-gray-50 flex items-center justify-center">
            <div className="flex flex-wrap gap-8 justify-center items-center print-area" ref={contentRef}>
              {items.map((item, index) => (
                <BarcodeLabel
                  key={item.id + index}
                  formData={item}
                  items={allItems}
                  companyName={companyName}
                  className="bg-white shadow-sm"
                />
              ))}
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
