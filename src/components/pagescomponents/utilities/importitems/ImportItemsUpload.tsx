import { Upload } from "lucide-react";

export function ImportItemsUpload() {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">
        Upload your .xls/ .xlsx (excel sheet)
      </p>
      <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center bg-blue-50/50">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <Upload className="w-8 h-8 text-blue-500" />
        </div>
        <p className="text-sm text-gray-600 mb-2">Drag & Drop files here</p>
        <p className="text-sm text-gray-400 mb-4">or</p>
        <button className="bg-[#E53935] text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 mx-auto">
          <Upload className="w-4 h-4" />
          Upload File
        </button>
      </div>
    </div>
  );
}
