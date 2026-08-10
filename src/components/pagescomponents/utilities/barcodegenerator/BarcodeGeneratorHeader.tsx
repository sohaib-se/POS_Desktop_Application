import { Info, Settings } from "lucide-react";

export function BarcodeGeneratorHeader() {
  return (
    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
      <div className="flex items-center gap-2">
        <h3 className="text-xl font-bold text-[#3B4256]">Barcode Generator</h3>
        <Info className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>Printer: <span className="text-gray-700">Label Printer</span></span>
        <span>Size: <span className="text-gray-700">2 Labels (50x25mm)</span></span>
        <div className="h-6 w-px bg-gray-300"></div>
        <Settings className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
      </div>
    </div>
  );
}
