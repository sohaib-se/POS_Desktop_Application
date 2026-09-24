import { useSettings } from "@/hooks/useSettings";
import { useCallback, useEffect, useState, useMemo } from "react";
import { Printer, ArrowLeft } from "lucide-react";
import * as XLSXStyle from "xlsx-js-style";

interface StockDetailsProps {
  onBack: () => void;
}

interface Item {
  id: string;
  name: string;
  category?: string;
  purchase_price?: number | string;
  stock_quantity?: number | string;
}

export function StockDetails({ onBack }: StockDetailsProps) {
  const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });
  const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
  const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;

  const [loading, setLoading] = useState(true);
  const [rawItems, setRawItems] = useState<Item[]>([]);

  const loadRawData = useCallback(async () => {
    try {
        setLoading(true);
        const res = await fetch("/api/items");
        if (res.ok) {
            const data = await res.json();
            setRawItems(data);
        }
    } catch (error) {
        console.error("Failed to fetch items:", error);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRawData();
  }, [loadRawData]);

  const displayData = useMemo(() => {
      // Show all items, sorting by name
      const results = [...rawItems];
      return results.sort((a, b) => a.name.localeCompare(b.name));
  }, [rawItems]);

  const totalStockValue = useMemo(() => {
    return displayData.reduce((total, item) => {
        const price = Number(item.purchase_price || 0);
        const qty = Number(item.stock_quantity || 0);
        return total + (price * qty);
    }, 0);
  }, [displayData]);

  const handleExportExcel = () => {
    if (displayData.length === 0) return;

    const HEADER_BG = "4382FF";
    const HEADER_FONT_COLOR = "FFFFFF";

    const thinBorder = (color: string) => ({ style: "thin" as const, color: { rgb: color } });
    const allBorders = (color: string) => ({
      left: thinBorder(color),
      right: thinBorder(color),
      top: thinBorder(color),
      bottom: thinBorder(color),
    });

    const headerStyle: object = {
      font: { name: "Calibri", sz: 12, bold: true, color: { rgb: HEADER_FONT_COLOR } },
      fill: { patternType: "solid", fgColor: { rgb: HEADER_BG } },
      border: allBorders("CCCCCC"),
      alignment: { horizontal: "center", vertical: "center" },
    };

    const cellLeft: object = {
      font: { name: "Calibri", sz: 11 },
      border: allBorders("E0E0E0"),
      alignment: { horizontal: "left", vertical: "center" },
    };

    const cellRight: object = {
      font: { name: "Calibri", sz: 11 },
      border: allBorders("E0E0E0"),
      alignment: { horizontal: "right", vertical: "center" },
    };

    const headers = ["#", "ITEM NAME", "CATEGORY", "PURCHASE PRICE", "QUANTITY", "STOCK VALUE"];

    const ws: Record<string, any> = {};

    headers.forEach((h, colIdx) => {
      const cellRef = XLSXStyle.utils.encode_cell({ r: 0, c: colIdx });
      ws[cellRef] = { v: h, t: "s", s: headerStyle };
    });

    displayData.forEach((row, rowIdx) => {
      const r = rowIdx + 1;
      const price = Number(row.purchase_price || 0);
      const qty = Number(row.stock_quantity || 0);
      const stockValue = price * qty;
      
      const rowData = [
        { v: r.toString(), t: "s" as const },
        { v: row.name, t: "s" as const },
        { v: row.category || "---", t: "s" as const },
        { v: `${currencyStr} ${price.toFixed(2)}`, t: "s" as const },
        { v: qty.toString(), t: "s" as const },
        { v: `${currencyStr} ${stockValue.toFixed(2)}`, t: "s" as const },
      ];

      rowData.forEach((cell, colIdx) => {
        const cellRef = XLSXStyle.utils.encode_cell({ r, c: colIdx });
        ws[cellRef] = { ...cell, s: colIdx >= 3 ? cellRight : cellLeft };
      });
    });

    const totalsRowIndex = displayData.length + 1;
    const totalsRowData = [
      { v: "TOTALS", t: "s" as const },
      { v: "", t: "s" as const },
      { v: "", t: "s" as const },
      { v: "", t: "s" as const },
      { v: "", t: "s" as const },
      { v: `${currencyStr} ${totalStockValue.toFixed(2)}`, t: "s" as const },
    ];

    totalsRowData.forEach((cell, colIdx) => {
      const cellRef = XLSXStyle.utils.encode_cell({ r: totalsRowIndex, c: colIdx });
      ws[cellRef] = { 
        ...cell, 
        s: {
          ... (colIdx >= 3 ? cellRight : cellLeft),
          font: { name: "Calibri", sz: 11, bold: true },
          fill: { patternType: "solid", fgColor: { rgb: "F8F9FA" } },
        }
      };
    });

    ws["!ref"] = XLSXStyle.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: totalsRowIndex, c: headers.length - 1 },
    });

    ws["!cols"] = [
      { wch: 6 },  // #
      { wch: 24 }, // ITEM NAME
      { wch: 16 }, // CATEGORY
      { wch: 16 }, // PURCHASE PRICE
      { wch: 16 }, // QUANTITY
      { wch: 20 }, // STOCK VALUE
    ];

    ws["!rows"] = [{ hpt: 22 }, ...displayData.map(() => ({ hpt: 18 })), { hpt: 22 }];

    const wb = XLSXStyle.utils.book_new();
    XLSXStyle.utils.book_append_sheet(wb, ws, "Stock Details");

    XLSXStyle.writeFile(wb, "Stock_Details.xlsx");
  };

  const handlePrint = () => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const title = "Stock Details";

    const rowsHTML = displayData.map((row, i) => {
      const price = Number(row.purchase_price || 0);
      const qty = Number(row.stock_quantity || 0);
      const stockValue = price * qty;
      return `
        <tr>
          <td class="center">${i + 1}</td>
          <td>${row.name}</td>
          <td>${row.category || '---'}</td>
          <td class="right">${currencyStr} ${price.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          <td class="right">${qty}</td>
          <td class="right">${currencyStr} ${stockValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
        </tr>
      `;
    }).join("");

    const html = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h2 { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: bold; }
            td.right, th.right { text-align: right; }
            td.center, th.center { text-align: center; }
            .totals { margin-top: 20px; font-weight: bold; font-size: 16px; display: flex; justify-content: flex-end; }
          </style>
        </head>
        <body>
          <h2>${title}</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Item Name</th>
                <th>Category</th>
                <th class="right">Purchase Price</th>
                <th class="right">Quantity</th>
                <th class="right">Stock Value</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
            </tbody>
          </table>
          <div class="totals">
            <div>Total Stock Value: <span>${currencyStr} ${totalStockValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
          </div>
        </body>
      </html>
    `;

    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 250);
    } else {
      document.body.removeChild(iframe);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#F4F5F8] w-full">
      {/* Top action bar area */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full transition-colors -ml-2 text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <h1 className="text-xl font-semibold text-gray-800">Stock Details</h1>
        </div>

        <div className="flex items-center gap-6 pr-4">
          <button 
            onClick={handleExportExcel}
            className="flex flex-col items-center justify-center gap-1 text-gray-700 hover:text-gray-900"
          >
            <span className="bg-[#1D6F42] text-white text-[10px] font-bold px-1 py-0.5 rounded-sm leading-none flex items-center justify-center h-5">
              xls
            </span>
            <span className="text-[11px] font-medium leading-none">Excel Report</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-1 text-gray-700 hover:text-gray-900" onClick={handlePrint}>
            <Printer className="w-5 h-5" />
            <span className="text-[11px] font-medium leading-none">Print</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col pt-2 overflow-hidden bg-white mt-1 mx-2">
        <div className="bg-white flex-1 flex flex-col overflow-hidden">
          
          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-white sticky top-0 border-b border-gray-200 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-500 w-16 border-r border-gray-100 text-center">
                    #
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-500 border-r border-gray-100 text-left">
                    ITEM NAME
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-500 border-r border-gray-100 text-left">
                    CATEGORY
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-500 border-r border-gray-100 text-right">
                    PURCHASE PRICE
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-500 border-r border-gray-100 text-right">
                    QUANTITY
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-500 border-r border-gray-100 text-right">
                    STOCK VALUE
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Loading data...
                    </td>
                  </tr>
                ) : displayData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No stock items found.
                    </td>
                  </tr>
                ) : (
                  displayData.map((row, index) => {
                      const price = Number(row.purchase_price || 0);
                      const qty = Number(row.stock_quantity || 0);
                      const stockValue = price * qty;
                      return (
                        <tr key={row.id} className={`transition-colors hover:bg-gray-50/50`}>
                            <td className="px-4 py-3 text-gray-900 border-r border-white/50 text-center">{index + 1}</td>
                            <td className="px-4 py-3 text-gray-900 border-r border-white/50 text-left">{row.name}</td>
                            <td className="px-4 py-3 text-gray-900 border-r border-white/50 text-left">{row.category || '---'}</td>
                            <td className="px-4 py-3 border-r border-white/50 text-right text-gray-900">
                               {currencyStr} {price.toLocaleString(undefined, {minimumFractionDigits: 2})}
                            </td>
                            <td className="px-4 py-3 border-r border-white/50 text-right text-gray-900">
                               {qty}
                            </td>
                            <td className="px-4 py-3 border-r border-white/50 text-right font-medium text-gray-900">
                               {currencyStr} {stockValue.toLocaleString(undefined, {minimumFractionDigits: 2})}
                            </td>
                        </tr>
                      );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Footer Totals */}
          <div className="bg-white border-t border-gray-200 p-4 px-6 flex justify-end items-center text-[15px] sticky bottom-0 shadow-[0_-2px_4px_rgba(0,0,0,0.05)]">
            <div className="text-gray-600 font-medium">
              Total Stock Value: <span className="text-gray-900 ml-2">{currencyStr} {totalStockValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
