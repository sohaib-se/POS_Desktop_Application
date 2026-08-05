import { FileSpreadsheet, Upload } from "lucide-react";

export function ImportPartiesActions() {
  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-4">
          Download .xls/.xlsx (excel sheet) template file to enter Data
        </p>
        <div className="w-24 h-24 mx-auto mb-4 bg-blue-100 rounded-xl flex items-center justify-center">
          <FileSpreadsheet className="w-12 h-12 text-blue-500" />
        </div>
        <button className="bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-medium">
          Download
        </button>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600 mb-4">
          Upload your .xls/ .xlsx (excel sheet)
        </p>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8">
          <div className="w-24 h-24 mx-auto mb-4 bg-blue-100 rounded-xl flex items-center justify-center">
            <Upload className="w-12 h-12 text-blue-500" />
          </div>
          <p className="text-sm text-gray-500">
            Drag and drop or{" "}
            <span className="text-blue-500 cursor-pointer">
              Click here to Browse
            </span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            formatted excel file to continue
          </p>
        </div>
      </div>
    </div>
  );
}
