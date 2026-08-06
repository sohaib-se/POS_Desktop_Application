import { FileSpreadsheet, Download, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import * as XLSX from "xlsx-js-style";

export function ExportItemsHeader() {
  const [isExporting, setIsExporting] = useState(false);
  const exportFields = [
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
    "Opening Stock",
    "At Price",
    "As Of Date",
    "Manufacturing Date",
    "Expiry Date"
  ];

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const res = await fetch('/api/items');
      if (!res.ok) throw new Error("Failed to fetch items");
      const items = await res.json();
      
      const data = items.map((item: any) => ({
        "Item Name": item.name || "",
        "Category": item.category || "",
        "Item Code": item.code || "",
        "Primary Unit": item.primary_unit || item.unit || "",
        "Secondary Unit": item.secondary_unit || "",
        "Conversion Rate": item.conversion_rate || "",
        "Item Image": item.img_path || "",
        "Sale Price": item.sale_price || 0,
        "Wholesale Price": item.wholesale_price || 0,
        "Purchase Price": item.purchase_price || 0,
        "Minimum Wholesale Quantity": "",
        "Opening Stock": item.stock_quantity || 0,
        "At Price": item.at_price || "",
        "As Of Date": item.created_at ? new Date(item.created_at).toLocaleDateString() : "",
        "Manufacturing Date": item.mfg_date || "",
        "Expiry Date": item.exp_date || ""
      }));

      const ws = XLSX.utils.json_to_sheet(data);

      // Apply styling to the header row
      const range = XLSX.utils.decode_range(ws['!ref'] || "A1");
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!ws[address]) continue;
        ws[address].s = {
          fill: { fgColor: { rgb: "4472C4" } }, // Blue shade matching standard Excel theme
          font: { color: { rgb: "FFFFFF" }, bold: true, sz: 12 }, // White, bold, slightly larger font
          alignment: { horizontal: "center", vertical: "center" }
        };
      }
      // Increase row height for the header
      if (!ws['!rows']) ws['!rows'] = [];
      ws['!rows'][0] = { hpt: 25 };

      // Set default column widths
      ws['!cols'] = Array(range.e.c + 1).fill({ wch: 15 });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inventory");
      XLSX.writeFile(wb, "Inventory_Items.xlsx");
    } catch (error) {
      console.error("Error exporting items:", error);
      alert("Failed to export items.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-50 to-white px-5 py-5 flex flex-col items-center border-b border-red-100">
        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 border-[3px] border-red-50">
          <FileSpreadsheet className="w-6 h-6 text-[#E53935]" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Export Inventory Data</h2>
        <p className="text-gray-500 text-sm text-center max-w-md mb-4">
          Download a comprehensive spreadsheet containing all your inventory items, pricing details, and current stock levels.
        </p>
        <button 
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 bg-[#E53935] hover:bg-red-600 disabled:bg-red-400 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
        >
          {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          {isExporting ? "Exporting..." : "Export to Excel"}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="px-5 py-5">
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
          Included Fields
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-0">
          {exportFields.map((field, idx) => (
            <div key={idx} className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#E53935]" />
              <span className="text-xs font-medium">{field}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
