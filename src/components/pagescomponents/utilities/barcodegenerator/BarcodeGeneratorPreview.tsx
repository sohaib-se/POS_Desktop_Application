import { Info } from "lucide-react";
import { BarcodeLabel } from "./BarcodeLabel";
import type { BarcodeFormData } from "./BarcodeGeneratorForm";
import type { Item } from "@/types";

interface BarcodeGeneratorPreviewProps {
  formData: BarcodeFormData;
  items?: Item[];
  companyName?: string;
}

export function BarcodeGeneratorPreview({ formData, items = [], companyName = "" }: BarcodeGeneratorPreviewProps) {
  return (
    <div className="w-[350px] border-l border-gray-200 pl-8 flex flex-col items-center">
      <div className="flex items-center gap-2 mb-6 w-full justify-center">
        <h4 className="font-semibold text-gray-700">Preview</h4>
        <Info className="w-4 h-4 text-indigo-500 cursor-pointer" />
      </div>
      
      <div className="flex-1 w-full flex items-center justify-center relative min-h-[300px]">
        {/* Background dotted line for preview visualization */}
        <div className="absolute inset-0 border-[2px] border-dashed border-gray-200 rounded-lg -z-10 bg-gray-50/50"></div>
        <BarcodeLabel formData={formData} items={items} companyName={companyName} className="scale-[1.1] shadow-lg transform hover:scale-[1.15] transition-transform duration-300" />
      </div>
    </div>
  );
}
