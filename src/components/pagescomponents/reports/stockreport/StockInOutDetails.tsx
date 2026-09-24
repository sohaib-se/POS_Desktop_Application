import { useSettings } from "@/hooks/useSettings";
import { useCallback, useEffect, useState, useMemo } from "react";
import { Printer, ArrowLeft, FileText } from "lucide-react";
import * as XLSXStyle from "xlsx-js-style";
import { getMonthKeyFromDate, formatDateDisplay, formatMonthLabel } from "../../saleinvoices/utils";

interface StockInOutDetailsProps {
  onBack: () => void;
}

interface Item {
  id: string;
  name: string;
  category?: string;
  purchase_price?: number | string;
  sale_price?: number | string;
  stock_quantity?: number | string;
}

interface AggregateData {
  itemId: string;
  itemName: string;
  category: string;
  beginningQuantity: number;
  quantityIn: number;
  purchaseAmount: number;
  quantityOut: number;
  saleAmount: number;
  closingQuantity: number;
}

const parseLineItems = (lineItemsJson: string | null | undefined) => {
    if (!lineItemsJson) return [];
    try {
      const parsed = JSON.parse(lineItemsJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
};

const parseLocalDate = (dStr: string | undefined | null) => {
  if (!dStr) return new Date(0);
  if (dStr.includes('/')) {
    const [dd, mm, yyyy] = dStr.split('/');
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }
  if (dStr.includes('-')) {
    const [yyyy, mm, dd] = dStr.split('-');
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }
  return new Date(dStr);
};

export function StockInOutDetails({ onBack }: StockInOutDetailsProps) {
  const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });
  const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
  const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;

  const [loading, setLoading] = useState(true);
  
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>("");

  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  const [rawItems, setRawItems] = useState<Item[]>([]);
  const [rawSales, setRawSales] = useState<any[]>([]);
  const [rawPurchases, setRawPurchases] = useState<any[]>([]);
  const [rawAdjustments, setRawAdjustments] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const loadRawData = useCallback(async () => {
    try {
        setLoading(true);
        const [itemsRes, salesRes, purchasesRes, adjustmentsRes] = await Promise.all([
          fetch("/api/items").catch(() => null),
          fetch("/api/sale_invoices").catch(() => null),
          fetch("/api/purchase_bills").catch(() => null),
          fetch("/api/adjust_stock_transactions").catch(() => null),
        ]);
        
        let items: Item[] = [];
        let sales: any[] = [];
        let purchases: any[] = [];
        let adjustments: any[] = [];
  
        if (itemsRes && itemsRes.ok) items = await itemsRes.json();
        if (salesRes && salesRes.ok) sales = await salesRes.json();
        if (purchasesRes && purchasesRes.ok) purchases = await purchasesRes.json();
        if (adjustmentsRes && adjustmentsRes.ok) adjustments = await adjustmentsRes.json();

        setRawItems(items);
        setRawSales(sales);
        setRawPurchases(purchases);
        setRawAdjustments(adjustments);

        const cats = new Set<string>();
        items.forEach(item => {
            if (item.category) cats.add(item.category);
        });
        setCategories(Array.from(cats).sort());

        const currentMonthKey = getMonthKeyFromDate(formatDateDisplay(new Date()));
        setSelectedMonthKey(currentMonthKey);

    } catch (error) {
        console.error("Failed to load stock in/out data", error);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRawData();
  }, [loadRawData]);

  const displayData = useMemo(() => {
      const itemMap = new Map<string, AggregateData>();

      rawItems.forEach(item => {
          itemMap.set(String(item.id), {
              itemId: String(item.id),
              itemName: item.name,
              category: item.category || "",
              beginningQuantity: Number(item.stock_quantity || 0),
              quantityIn: 0,
              purchaseAmount: 0,
              quantityOut: 0,
              saleAmount: 0,
              closingQuantity: 0
          });
      });

      let fromTime = 0;
      let toTime = Infinity;
      if (selectedMonthKey) {
          const [yyyy, mm] = selectedMonthKey.split('-');
          fromTime = new Date(Number(yyyy), Number(mm) - 1, 1).getTime();
          toTime = new Date(Number(yyyy), Number(mm), 0, 23, 59, 59, 999).getTime();
      }

      // Process Purchases (In)
      rawPurchases.forEach(purchase => {
          const purchaseTime = parseLocalDate(purchase.date).getTime();
          const isBeforeFrom = purchaseTime < fromTime;
          const isWithinRange = purchaseTime >= fromTime && purchaseTime <= toTime;
          
          if (isBeforeFrom || isWithinRange) {
              const lineItems = parseLineItems(purchase.line_items_json);
              lineItems.forEach((item: any) => {
                  const itemId = String(item.itemId || item.item_id);
                  const qty = Number(item.quantity || item.qty || 0);
                  const amount = Number(item.amount || 0);
                  
                  if (itemMap.has(itemId)) {
                      const data = itemMap.get(itemId)!;
                      if (isBeforeFrom) {
                          data.beginningQuantity += qty;
                      } else if (isWithinRange) {
                          data.quantityIn += qty;
                          data.purchaseAmount += amount;
                      }
                  }
              });
          }
      });

      // Process Adjustments (In)
      rawAdjustments.forEach(adj => {
          const adjTime = parseLocalDate(adj.date).getTime();
          const isBeforeFrom = adjTime < fromTime;
          const isWithinRange = adjTime >= fromTime && adjTime <= toTime;
          
          if ((isBeforeFrom || isWithinRange) && adj.adjustment_type === 'Add Stock') {
              const itemId = String(adj.item_id || adj.itemId);
              const qty = Number(adj.quantity || 0);
              const amount = qty * Number(adj.at_price || adj.atPrice || 0);
              
              if (itemMap.has(itemId)) {
                  const data = itemMap.get(itemId)!;
                  if (isBeforeFrom) {
                      data.beginningQuantity += qty;
                  } else if (isWithinRange) {
                      data.quantityIn += qty;
                      data.purchaseAmount += amount;
                  }
              }
          }
      });

      // Process Sales (Out)
      rawSales.forEach(sale => {
          const saleTime = parseLocalDate(sale.date).getTime();
          const isBeforeFrom = saleTime < fromTime;
          const isWithinRange = saleTime >= fromTime && saleTime <= toTime;
          
          if (isBeforeFrom || isWithinRange) {
              const lineItems = parseLineItems(sale.line_items_json);
              lineItems.forEach((item: any) => {
                  const itemId = String(item.itemId || item.item_id);
                  const qty = Number(item.quantity || item.qty || 0);
                  const amount = Number(item.amount || 0);
                  
                  if (itemMap.has(itemId)) {
                      const data = itemMap.get(itemId)!;
                      if (isBeforeFrom) {
                          data.beginningQuantity -= qty;
                      } else if (isWithinRange) {
                          data.quantityOut += qty;
                          data.saleAmount += amount;
                      }
                  }
              });
          }
      });

      let results = Array.from(itemMap.values());

      // Calculate Closing Quantity
      results.forEach(row => {
          row.closingQuantity = row.beginningQuantity + row.quantityIn - row.quantityOut;
      });

      // Apply Category Filter
      if (selectedCategory !== "All Categories") {
          results = results.filter(row => row.category === selectedCategory);
      }

      return results.sort((a, b) => a.itemName.localeCompare(b.itemName));
  }, [rawItems, rawSales, rawPurchases, rawAdjustments, selectedMonthKey, selectedCategory]);

  const totals = displayData.reduce((acc, row) => {
      acc.beginningQuantity += row.beginningQuantity;
      acc.quantityIn += row.quantityIn;
      acc.purchaseAmount += row.purchaseAmount;
      acc.quantityOut += row.quantityOut;
      acc.saleAmount += row.saleAmount;
      acc.closingQuantity += row.closingQuantity;
      return acc;
  }, {
      beginningQuantity: 0,
      quantityIn: 0,
      purchaseAmount: 0,
      quantityOut: 0,
      saleAmount: 0,
      closingQuantity: 0
  });

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

    const headers = ["ITEM NAME", "BEGINNING QUANTITY", "QUANTITY IN", "PURCHASE AMOUNT", "QUANTITY OUT", "SALE AMOUNT", "CLOSING QUANTITY"];

    const ws: Record<string, any> = {};

    headers.forEach((h, colIdx) => {
      const cellRef = XLSXStyle.utils.encode_cell({ r: 0, c: colIdx });
      ws[cellRef] = { v: h, t: "s", s: headerStyle };
    });

    displayData.forEach((row, rowIdx) => {
      const r = rowIdx + 1;
      const rowData = [
        { v: row.itemName, t: "s" as const },
        { v: row.beginningQuantity.toString(), t: "s" as const },
        { v: row.quantityIn.toString(), t: "s" as const },
        { v: row.purchaseAmount > 0 ? `${currencyStr} ${row.purchaseAmount.toFixed(2)}` : `${currencyStr} 0.00`, t: "s" as const },
        { v: row.quantityOut.toString(), t: "s" as const },
        { v: row.saleAmount > 0 ? `${currencyStr} ${row.saleAmount.toFixed(2)}` : `${currencyStr} 0.00`, t: "s" as const },
        { v: row.closingQuantity.toString(), t: "s" as const },
      ];

      rowData.forEach((cell, colIdx) => {
        const cellRef = XLSXStyle.utils.encode_cell({ r, c: colIdx });
        ws[cellRef] = { ...cell, s: colIdx >= 1 ? cellRight : cellLeft };
      });
    });

    const totalsRowIndex = displayData.length + 1;
    const totalsRowData = [
      { v: "TOTALS", t: "s" as const },
      { v: totals.beginningQuantity.toString(), t: "s" as const },
      { v: totals.quantityIn.toString(), t: "s" as const },
      { v: `${currencyStr} ${totals.purchaseAmount.toFixed(2)}`, t: "s" as const },
      { v: totals.quantityOut.toString(), t: "s" as const },
      { v: `${currencyStr} ${totals.saleAmount.toFixed(2)}`, t: "s" as const },
      { v: totals.closingQuantity.toString(), t: "s" as const },
    ];

    totalsRowData.forEach((cell, colIdx) => {
      const cellRef = XLSXStyle.utils.encode_cell({ r: totalsRowIndex, c: colIdx });
      ws[cellRef] = { 
        ...cell, 
        s: {
          ... (colIdx >= 1 ? cellRight : cellLeft),
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
      { wch: 24 }, // ITEM NAME
      { wch: 20 }, // BEGINNING QUANTITY
      { wch: 16 }, // QUANTITY IN
      { wch: 20 }, // PURCHASE AMOUNT
      { wch: 16 }, // QUANTITY OUT
      { wch: 20 }, // SALE AMOUNT
      { wch: 20 }, // CLOSING QUANTITY
    ];

    ws["!rows"] = [{ hpt: 22 }, ...displayData.map(() => ({ hpt: 18 })), { hpt: 22 }];

    const wb = XLSXStyle.utils.book_new();
    XLSXStyle.utils.book_append_sheet(wb, ws, "Stock InOut Details");

    XLSXStyle.writeFile(wb, "Stock_InOut_Details.xlsx");
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

    const title = "Stock In/Out Details";

    const rowsHTML = displayData.map((row) => {
      return `
        <tr>
          <td>${row.itemName}</td>
          <td class="right">${row.beginningQuantity}</td>
          <td class="right">${row.quantityIn}</td>
          <td class="right">${row.purchaseAmount > 0 ? `${currencyStr} ${row.purchaseAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}` : `${currencyStr} 0.00`}</td>
          <td class="right">${row.quantityOut}</td>
          <td class="right">${row.saleAmount > 0 ? `${currencyStr} ${row.saleAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}` : `${currencyStr} 0.00`}</td>
          <td class="right">${row.closingQuantity}</td>
        </tr>
      `;
    }).join("");

    const html = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h2 { text-align: center; margin-bottom: 5px; }
            h4 { text-align: center; margin-top: 0; color: #666; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: bold; }
            td.right, th.right { text-align: right; }
            td.center, th.center { text-align: center; }
            .totals { margin-top: 20px; font-weight: bold; font-size: 16px; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <h2>${title}</h2>
          <h4>Month: ${selectedMonthKey ? formatMonthLabel(selectedMonthKey) : 'All Time'} | Category: ${selectedCategory}</h4>
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th class="right">Beginning Quantity</th>
                <th class="right">Quantity In</th>
                <th class="right">Purchase Amount</th>
                <th class="right">Quantity Out</th>
                <th class="right">Sale Amount</th>
                <th class="right">Closing Quantity</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
            </tbody>
            <tfoot>
              <tr>
                <th>Total</th>
                <th class="right">${totals.beginningQuantity}</th>
                <th class="right">${totals.quantityIn}</th>
                <th class="right">${currencyStr} ${totals.purchaseAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</th>
                <th class="right">${totals.quantityOut}</th>
                <th class="right">${currencyStr} ${totals.saleAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</th>
                <th class="right">${totals.closingQuantity}</th>
              </tr>
            </tfoot>
          </table>
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
    <div className="h-full flex flex-col bg-[#F8F9FB] w-full">
      {/* Top Bar with Date Range and Export */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center ml-4">
              <span className="text-sm text-gray-500 mr-2">Filter by Month :</span>
              <input 
                type="month" 
                value={selectedMonthKey}
                onChange={(e) => setSelectedMonthKey(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
          </div>
        </div>

        <div className="flex items-center gap-3 pr-2">
          <button 
            onClick={handleExportExcel}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-sm"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
          </button>
          <button 
            onClick={handlePrint}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-sm"
          >
            <Printer className="w-4 h-4 text-teal-600" />
          </button>
        </div>
      </div>

      <div className="px-6 py-4">
         <h2 className="text-lg font-bold text-gray-800 tracking-wide">DETAILS</h2>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-white mx-4 mb-4 shadow-sm border border-gray-200 rounded-sm overflow-hidden">
        
        {/* Filters Bar */}
        <div className="p-4 border-b border-gray-100 flex items-center">
            <div className="flex items-center">
               <span className="text-xs text-gray-500 mr-3">Filter by Item Category</span>
               <select 
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 bg-gray-50 outline-none w-48"
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
               >
                   <option value="All Categories">All Categories</option>
                   {categories.map(cat => (
                       <option key={cat} value={cat}>{cat}</option>
                   ))}
               </select>
            </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-white sticky top-0 border-b border-gray-100 z-10">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-500 text-left border-r border-gray-100 w-1/4">
                  Item Name
                </th>
                <th className="px-4 py-3 font-semibold text-gray-500 text-right border-r border-gray-100">
                  Begining Quantity
                </th>
                <th className="px-4 py-3 font-semibold text-gray-500 text-right border-r border-gray-100">
                  Quantity In
                </th>
                <th className="px-4 py-3 font-semibold text-gray-500 text-right border-r border-gray-100">
                  Purchase Amount
                </th>
                <th className="px-4 py-3 font-semibold text-gray-500 text-right border-r border-gray-100">
                  Quantity Out
                </th>
                <th className="px-4 py-3 font-semibold text-gray-500 text-right border-r border-gray-100">
                  Sale Amount
                </th>
                <th className="px-4 py-3 font-semibold text-gray-500 text-right">
                  Closing Quantity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Loading data...
                  </td>
                </tr>
              ) : displayData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No data available for the selected period.
                  </td>
                </tr>
              ) : (
                displayData.map((row, index) => {
                    const isEven = index % 2 === 0;
                    return (
                      <tr key={row.itemId} className={`${isEven ? 'bg-white' : 'bg-[#FAFAFA]'}`}>
                          <td className="px-4 py-3 text-gray-800 border-r border-gray-100">{row.itemName}</td>
                          <td className="px-4 py-3 text-right text-gray-700 border-r border-gray-100">{row.beginningQuantity}</td>
                          <td className="px-4 py-3 text-right text-gray-700 border-r border-gray-100">{row.quantityIn}</td>
                          <td className="px-4 py-3 text-right text-gray-700 border-r border-gray-100">
                              {row.purchaseAmount > 0 ? `${currencyStr} ${row.purchaseAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}` : `${currencyStr} 0.00`}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-700 border-r border-gray-100">{row.quantityOut}</td>
                          <td className="px-4 py-3 text-right text-gray-700 border-r border-gray-100">
                              {row.saleAmount > 0 ? `${currencyStr} ${row.saleAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}` : `${currencyStr} 0.00`}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-800">{row.closingQuantity}</td>
                      </tr>
                    );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer Totals */}
        <div className="bg-white border-t border-gray-200 p-4 flex items-center text-[14px] sticky bottom-0">
          <div className="px-4 font-semibold text-gray-600 w-1/4 text-left">
            Total
          </div>
          <div className="flex-1 flex">
              <div className="flex-1 text-right px-4 font-semibold text-gray-800">{totals.beginningQuantity}</div>
              <div className="flex-1 text-right px-4 font-semibold text-gray-800">{totals.quantityIn}</div>
              <div className="flex-1 text-right px-4 font-semibold text-gray-800">{currencyStr} {totals.purchaseAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
              <div className="flex-1 text-right px-4 font-semibold text-gray-800">{totals.quantityOut}</div>
              <div className="flex-1 text-right px-4 font-semibold text-gray-800">{currencyStr} {totals.saleAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
              <div className="flex-1 text-right px-4 font-semibold text-gray-800">{totals.closingQuantity}</div>
          </div>
        </div>

      </div>
    </div>
  );
}
