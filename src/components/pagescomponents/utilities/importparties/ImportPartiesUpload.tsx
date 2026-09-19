import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import * as xlsx from "xlsx-js-style";

import { toast } from "@/components/ui/Toast";

export interface ImportedParty {
  "Party Name": string;
  "Phone Number": string;
  "Email": string;
  "Billing Address": string;
  "Shipping Address": string;
  "Opening Balance": string | number;
  "Credit Limit": string | number;
}

interface ImportPartiesUploadProps {
  onPartiesImported: (parties: ImportedParty[]) => void;
}

export function ImportPartiesUpload({ onPartiesImported }: ImportPartiesUploadProps) {
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
            "Party Name",
            "Phone Number",
            "Email",
            "Billing Address",
            "Shipping Address",
            "Opening Balance",
            "Credit Limit",
          ];

          const headerRow = xlsx.utils.sheet_to_json<string[]>(worksheet, { header: 1 })[0] || [];
          const cleanHeaderRow = (headerRow as (string | undefined)[]).map(h => String(h ?? "").trim());

          const isValid = expectedHeaders.every(header => cleanHeaderRow.includes(header));
          if (!isValid) {
            toast.error("Invalid file format. Please make sure the file matches the sample format exactly.");
            return;
          }

          const json = xlsx.utils.sheet_to_json<ImportedParty>(worksheet);
          const validParties = json.filter(party => party["Party Name"] && String(party["Party Name"]).trim() !== "");

          if (validParties.length === 0) {
            toast.error("No valid parties found in the file.");
            return;
          }

          onPartiesImported(validParties);
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

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col">
      <p className="text-sm text-gray-500 mb-2">
        Upload your .xls/ .xlsx (excel sheet)
      </p>
      <div 
        className={`bg-[#F8FBFF] p-8 rounded-xl border border-dashed transition-colors flex flex-col items-center justify-center text-center h-64
          ${isDragging ? 'border-blue-500 bg-blue-100' : 'border-[#4382FF]'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="w-16 h-16 bg-[#E3EFFF] rounded-full flex items-center justify-center mb-4">
          <Upload className="w-8 h-8 text-[#4382FF]" />
        </div>
        
        <p className="text-sm text-gray-600 mb-2">
          Drag & Drop files here
        </p>
        <p className="text-xs text-gray-400 mb-4">or</p>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleChange}
          accept=".xls,.xlsx"
          className="hidden"
        />
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="bg-[#E53935] text-white px-6 py-2 rounded-md flex items-center gap-2 hover:bg-red-700 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload File
        </button>
      </div>
    </div>
  );
}
