import { useSettings } from "@/hooks/useSettings";
import { useCallback, useEffect, useState, useMemo } from "react";
import { Printer, ArrowLeft } from "lucide-react";

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
    
    const headers = ["#", "ITEM NAME", "CATEGORY", "PURCHASE PRICE", "QUANTITY", "STOCK VALUE"];
    const rows = displayData.map((row, index) => {
        const price = Number(row.purchase_price || 0);
        const qty = Number(row.stock_quantity || 0);
        const stockValue = price * qty;
        
        return [
            String(index + 1),
            `"${row.name.replace(/"/g, '""')}"`,
            `"${row.category || ''}"`,
            price.toFixed(2),
            qty.toString(),
            stockValue.toFixed(2)
        ];
    });

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Stock_Details.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <button className="flex flex-col items-center justify-center gap-1 text-gray-700 hover:text-gray-900" onClick={() => window.print()}>
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
