import { FileSpreadsheet } from "lucide-react";

export function ExportItemsHeader() {
  return (
    <div className="text-center py-12">
      <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-gray-300" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Items</h3>
      <p className="text-gray-500 mb-6">
        Export all your items to an Excel file
      </p>
      <button className="bg-[#E53935] text-white px-6 py-2 rounded-lg text-sm font-medium">
        Export to Excel
      </button>
    </div>
  );
}
