import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import * as xlsx from "xlsx-js-style";

export interface ImportedItem {
  "Item Name": string;
  "Category": string;
  "Item Code": string;
  "Primary Unit": string;
  "Secondary Unit": string;
  "Conversion Rate": string | number;
  "Item Image": string;
  "Sale Price": string | number;
  "Wholesale Price": string | number;
  "Purchase Price": string | number;
  "Minimum Wholesale Quantity": string | number;
  "Opening Stock": string | number;
  "At Price": string | number;
  "As Of Date": string;
  "Manufacturing Date": string;
  "Expiry Date": string;
}

interface ImportItemsUploadProps {
  onItemsImported: (items: ImportedItem[]) => void;
}

export function ImportItemsUpload({ onItemsImported }: ImportItemsUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (data) {
        const workbook = xlsx.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = xlsx.utils.sheet_to_json<ImportedItem>(worksheet);
        onItemsImported(json);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">
        Upload your .xls/ .xlsx (excel sheet)
      </p>
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-100"
            : "border-blue-300 bg-blue-50/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <Upload className="w-8 h-8 text-blue-500" />
        </div>
        <p className="text-sm text-gray-600 mb-2">Drag & Drop files here</p>
        <p className="text-sm text-gray-400 mb-4">or</p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleChange}
          accept=".xls,.xlsx"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-[#E53935] text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 mx-auto hover:bg-red-600 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload File
        </button>
      </div>
    </div>
  );
}
