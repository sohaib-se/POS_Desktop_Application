import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import * as xlsx from "xlsx-js-style";
import { toast } from "@/components/ui/Toast";

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
  "Low Threshold Quantity": string | number;
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
        try {
          const workbook = xlsx.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          const expectedHeaders = [
            "Item Name",
            "Category",
            "Item Code",
            "Primary Unit",
            "Secondary Unit",
            "Conversion Rate",
            "Item Image",
            "Sale Price",
            "Wholesale Price",
            "Purchase Price",
            "Minimum Wholesale Quantity",
            "Low Threshold Quantity",
            "Opening Stock",
            "At Price",
            "As Of Date",
            "Manufacturing Date",
            "Expiry Date",
          ];

          const headerRow = xlsx.utils.sheet_to_json<string[]>(worksheet, { header: 1 })[0] || [];
          
          const isValid = expectedHeaders.every(header => headerRow.includes(header));
          if (!isValid) {
            toast.error("Invalid file format. Please make sure the file matches the sample format exactly.");
            return;
          }

          const json = xlsx.utils.sheet_to_json<ImportedItem>(worksheet);
          const validItems = json.filter(item => item["Item Name"] && String(item["Item Name"]).trim() !== "");
          
          if (validItems.length === 0) {
            toast.error("No valid items found in the file.");
            return;
          }
          
          onItemsImported(validItems);
        } catch (error) {
          console.error(error);
          toast.error("Failed to parse the file. Please ensure it is a valid Excel file.");
        }
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
