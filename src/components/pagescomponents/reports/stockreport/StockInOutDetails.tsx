import { useCallback, useEffect, useState, useMemo } from "react";
import { Printer, ArrowLeft, Calendar, FileText } from "lucide-react";

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

const parseDateString = (dateStr: string | undefined | null) => {
    if (!dateStr) return 0;
    if (dateStr.includes("/")) {
        const parts = dateStr.split("/");
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            return new Date(year, month, day).getTime();
        }
    }
    const t = new Date(dateStr).getTime();
    return isNaN(t) ? 0 : t;
};

export function StockInOutDetails({ onBack }: StockInOutDetailsProps) {
  const [loading, setLoading] = useState(true);
  
  // Date Filter State
  const defaultFrom = new Date();
  defaultFrom.setDate(1); // First day of current month
  const defaultTo = new Date();
  
  const formatDateForInput = (d: Date) => d.toISOString().split('T')[0];
  
  const [fromDate, setFromDate] = useState(formatDateForInput(defaultFrom));
  const [toDate, setToDate] = useState(formatDateForInput(defaultTo));

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

      const fromTime = new Date(fromDate).getTime();
      const toTime = new Date(toDate).setHours(23, 59, 59, 999); // End of toDate

      // Process Purchases (In)
      rawPurchases.forEach(purchase => {
          const purchaseTime = parseDateString(purchase.date);
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
          const adjTime = parseDateString(adj.date);
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
          const saleTime = parseDateString(sale.date);
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
  }, [rawItems, rawSales, rawPurchases, rawAdjustments, fromDate, toDate, selectedCategory]);

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
    
    const headers = ["Item Name", "Begining Quantity", "Quantity In", "Purchase Amount", "Quantity Out", "Sale Amount", "Closing Quantity"];
    const rows = displayData.map((row) => [
        `"${row.itemName.replace(/"/g, '""')}"`,
        row.beginningQuantity.toString(),
        row.quantityIn.toString(),
        row.purchaseAmount.toFixed(2),
        row.quantityOut.toString(),
        row.saleAmount.toFixed(2),
        row.closingQuantity.toString()
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Stock_InOut_Details.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col bg-[#F8F9FB] w-full">
      {/* Top Bar with Date Range and Export */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center border border-gray-300 rounded px-3 py-1.5 bg-white shadow-sm">
             <span className="text-gray-500 text-sm mr-2">From</span>
             <input 
                type="date" 
                className="outline-none text-sm text-gray-700 bg-transparent"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
             />
             <Calendar className="w-4 h-4 text-gray-400 mx-2" />
             <span className="text-gray-500 text-sm mr-2 ml-2">To</span>
             <input 
                type="date" 
                className="outline-none text-sm text-gray-700 bg-transparent"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
             />
             <Calendar className="w-4 h-4 text-gray-400 ml-2" />
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
            onClick={() => window.print()}
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
                              {row.purchaseAmount > 0 ? `Rs ${row.purchaseAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}` : 'Rs 0.00'}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-700 border-r border-gray-100">{row.quantityOut}</td>
                          <td className="px-4 py-3 text-right text-gray-700 border-r border-gray-100">
                              {row.saleAmount > 0 ? `Rs ${row.saleAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}` : 'Rs 0.00'}
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
              <div className="flex-1 text-right px-4 font-semibold text-gray-800">Rs {totals.purchaseAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
              <div className="flex-1 text-right px-4 font-semibold text-gray-800">{totals.quantityOut}</div>
              <div className="flex-1 text-right px-4 font-semibold text-gray-800">Rs {totals.saleAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
              <div className="flex-1 text-right px-4 font-semibold text-gray-800">{totals.closingQuantity}</div>
          </div>
        </div>

      </div>
    </div>
  );
}
