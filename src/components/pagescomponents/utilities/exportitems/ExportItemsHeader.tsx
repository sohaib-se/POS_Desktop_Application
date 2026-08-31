import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Loader2,
  Package,
  Tag,
  DollarSign,
  BarChart2,
  Calendar,
  Hash,
  Layers,
  ArrowRightLeft,
  Image,
  ShoppingCart,
  TrendingUp,
  Boxes,
} from "lucide-react";
import { useState } from "react";
import * as XLSX from "xlsx-js-style";

const FIELD_META = [
  { label: "Item Name",                  icon: Package,        color: "text-violet-500" },
  { label: "Category",                   icon: Tag,            color: "text-blue-500"   },
  { label: "Item Code",                  icon: Hash,           color: "text-cyan-500"   },
  { label: "Primary Unit",               icon: Layers,         color: "text-teal-500"   },
  { label: "Secondary Unit",             icon: Layers,         color: "text-teal-400"   },
  { label: "Conversion Rate",            icon: ArrowRightLeft, color: "text-indigo-500" },
  { label: "Item Image",                 icon: Image,          color: "text-pink-500"   },
  { label: "Sale Price",                 icon: DollarSign,     color: "text-green-500"  },
  { label: "Wholesale Price",            icon: TrendingUp,     color: "text-emerald-500"},
  { label: "Purchase Price",             icon: ShoppingCart,   color: "text-orange-500" },
  { label: "Minimum Wholesale Quantity", icon: BarChart2,      color: "text-amber-500"  },
  { label: "Opening Stock",              icon: Boxes,          color: "text-sky-500"    },
  { label: "At Price",                   icon: DollarSign,     color: "text-lime-600"   },
  { label: "As Of Date",                 icon: Calendar,       color: "text-rose-400"   },
  { label: "Manufacturing Date",         icon: Calendar,       color: "text-purple-500" },
  { label: "Expiry Date",                icon: Calendar,       color: "text-red-400"    },
];

export function ExportItemsHeader() {
  const [isExporting, setIsExporting] = useState(false);

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
    <div className="flex flex-col gap-6 animate-fadeIn">

      {/* ── Page Title Row ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#E53935]/10 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5 text-[#E53935]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#3B4256]">Export Items</h2>
            <p className="text-xs text-gray-400 mt-0.5">Download your complete inventory as an Excel spreadsheet</p>
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 bg-[#E53935] hover:bg-red-600 disabled:bg-red-300 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        >
          {isExporting
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Download className="w-4 h-4" />}
          {isExporting ? "Exporting…" : "Export to Excel"}
        </button>
      </div>

      {/* ── Two-column body ───────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-6">

        {/* Left column: info cards */}
        <div className="col-span-1 flex flex-col gap-4">

          {/* What you get */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-[#E53935] inline-block" />
              What you'll get
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#E53935] mt-0.5 shrink-0" />
                <span>All inventory items with full pricing details</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#E53935] mt-0.5 shrink-0" />
                <span>Current stock levels &amp; opening stock data</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#E53935] mt-0.5 shrink-0" />
                <span>Manufacturing &amp; expiry dates where available</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#E53935] mt-0.5 shrink-0" />
                <span>Excel-formatted with styled headers, ready to use</span>
              </li>
            </ul>
          </div>

          {/* Format info */}
          <div className="bg-[#F8FAFC] border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-blue-500 inline-block" />
              File details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Format</span>
                <span className="font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-xs">.xlsx</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Sheet name</span>
                <span className="font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-xs">Inventory</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Filename</span>
                <span className="font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-xs">Inventory_Items.xlsx</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Columns</span>
                <span className="font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-xs">{FIELD_META.length} fields</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: fields grid */}
        <div className="col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-green-500 inline-block" />
            Included fields
            <span className="ml-auto text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {FIELD_META.length} columns
            </span>
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {FIELD_META.map(({ label, icon: Icon, color }, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 px-3 py-2.5 rounded-lg transition-colors duration-150 group"
              >
                <Icon className={`w-3.5 h-3.5 ${color} shrink-0`} />
                <span className="text-xs font-medium text-gray-600 group-hover:text-gray-800 transition-colors">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
