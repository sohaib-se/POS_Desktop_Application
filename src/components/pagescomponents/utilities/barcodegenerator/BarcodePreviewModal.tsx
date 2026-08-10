import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { BarcodeLabel } from "./BarcodeLabel";
import type { BarcodeItem } from "./BarcodeGeneratorItemList";
import type { Item } from "@/types";

interface BarcodePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: BarcodeItem[];
  allItems?: Item[];
  companyName?: string;
}

export function BarcodePreviewModal({ open, onOpenChange, items, allItems = [], companyName = "" }: BarcodePreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 border-0 bg-transparent shadow-none" showCloseButton={false}>
        <DialogTitle className="sr-only">Barcode Preview</DialogTitle>
        <div className="bg-white rounded-lg flex flex-col h-full overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-[#F8FAFC]">
            <h3 className="text-lg font-semibold text-gray-700">Labels Preview</h3>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 rounded-md hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50 flex flex-wrap gap-8 justify-center items-start content-start">
            {items.map((item, index) => (
              <BarcodeLabel
                key={item.id + index}
                formData={item}
                items={allItems}
                companyName={companyName}
                className="transform scale-110 shadow-md bg-white m-4"
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
