import { useCallback, useEffect, useState, useMemo } from "react";
import { ChevronDown, Printer, ArrowLeft } from "lucide-react";
import { getMonthKeyFromDate, formatDateDisplay, monthLabelForFilter, formatMonthLabel } from "../../saleinvoices/utils";

interface PartyReportByItemProps {
  onBack: () => void;
}

interface PartyItemData {
  partyId: number;
  partyName: string;
  saleQty: number;
  saleAmount: number;
  purchaseQty: number;
  purchaseAmount: number;
}

export function PartyReportByItem({ onBack }: PartyReportByItemProps) {
  const [loading, setLoading] = useState(true);
  
  // Filter state
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>("");
  const [isMonthMenuOpen, setIsMonthMenuOpen] = useState(false);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState<string>("All Items");
  const [isItemMenuOpen, setIsItemMenuOpen] = useState(false);

  useEffect(() => {
    const closeMenus = () => {
      setIsMonthMenuOpen(false);
      setIsCategoryMenuOpen(false);
      setIsItemMenuOpen(false);
    };
    window.addEventListener("click", closeMenus);
    return () => window.removeEventListener("click", closeMenus);
  }, []);

  const parseLineItems = (lineItemsJson: string | null | undefined) => {
    if (!lineItemsJson) return [];
    try {
      const parsed = JSON.parse(lineItemsJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const [rawParties, setRawParties] = useState<any[]>([]);
  const [rawSales, setRawSales] = useState<any[]>([]);
  const [rawPurchases, setRawPurchases] = useState<any[]>([]);
  const [rawItems, setRawItems] = useState<any[]>([]);

  const loadRawData = useCallback(async () => {
    try {
        setLoading(true);
        const [partiesRes, salesRes, purchasesRes, itemsRes] = await Promise.all([
          fetch("/api/parties").catch(() => null),
          fetch("/api/sale_invoices").catch(() => null),
          fetch("/api/purchase_bills").catch(() => null),
          fetch("/api/items").catch(() => null),
        ]);
        
        let parties: any[] = [];
        let sales: any[] = [];
        let purchases: any[] = [];
        let items: any[] = [];
  
        if (partiesRes && partiesRes.ok) parties = await partiesRes.json();
        if (salesRes && salesRes.ok) sales = await salesRes.json();
        if (purchasesRes && purchasesRes.ok) purchases = await purchasesRes.json();
        if (itemsRes && itemsRes.ok) items = await itemsRes.json();

        setRawParties(parties);
        setRawSales(sales);
        setRawPurchases(purchases);
        setRawItems(items);

        const months = new Set<string>();
        sales.forEach(s => {
          if (s.date) months.add(getMonthKeyFromDate(s.date));
        });
        purchases.forEach(p => {
            if (p.date) months.add(getMonthKeyFromDate(p.date));
        });

        const sortedMonths = Array.from(months).sort((a, b) => b.localeCompare(a));
        setAvailableMonths(sortedMonths);

        const currentMonthKey = getMonthKeyFromDate(formatDateDisplay(new Date()));
        let defaultMonth = currentMonthKey;
        if (sortedMonths.length > 0 && !sortedMonths.includes(currentMonthKey)) {
            defaultMonth = sortedMonths[0];
        }
        setSelectedMonthKey(defaultMonth);

    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRawData();
  }, [loadRawData]);


  const categories = useMemo(() => {
      const cats = new Set<string>();
      rawItems.forEach(item => {
          if (item.category) cats.add(item.category);
      });
      return Array.from(cats).sort();
  }, [rawItems]);

  const itemsForDropdown = useMemo(() => {
      if (selectedCategory === "All Categories") {
          return rawItems;
      }
      return rawItems.filter(i => i.category === selectedCategory);
  }, [rawItems, selectedCategory]);


  const displayData = useMemo(() => {
      const partyMap = new Map<number, PartyItemData>();

      rawParties.forEach(party => {
          partyMap.set(party.id, {
              partyId: party.id,
              partyName: party.name,
              saleQty: 0,
              saleAmount: 0,
              purchaseQty: 0,
              purchaseAmount: 0,
          });
      });

      const filteredSales = selectedMonthKey 
          ? rawSales.filter(s => getMonthKeyFromDate(s.date) === selectedMonthKey)
          : rawSales;
          
      const filteredPurchases = selectedMonthKey 
          ? rawPurchases.filter(p => getMonthKeyFromDate(p.date) === selectedMonthKey)
          : rawPurchases;

      // Create a set of valid item IDs based on filter
      let validItemIds: Set<string> | null = null; // null means all
      if (selectedItem !== "All Items") {
          validItemIds = new Set([selectedItem]);
      } else if (selectedCategory !== "All Categories") {
          const ids = itemsForDropdown.map(i => String(i.id));
          validItemIds = new Set(ids);
      }

      // Process Sales
      filteredSales.forEach(sale => {
          const partyId = sale.party_id;
          if (!partyId) return;

          let saleQty = 0;
          let saleAmt = 0;
          const lineItems = parseLineItems(sale.line_items_json);

          lineItems.forEach((item: any) => {
              const itemId = String(item.itemId);
              if (validItemIds && !validItemIds.has(itemId)) return;

              saleQty += Number(item.quantity || item.qty || 0);
              saleAmt += Number(item.amount || 0);
          });

          if (saleQty > 0 || saleAmt > 0) {
              if (!partyMap.has(partyId)) {
                  partyMap.set(partyId, {
                      partyId: partyId,
                      partyName: sale.party_name || "Unknown Party",
                      saleQty: 0,
                      saleAmount: 0,
                      purchaseQty: 0,
                      purchaseAmount: 0,
                  });
              }
              const existing = partyMap.get(partyId)!;
              existing.saleQty += saleQty;
              existing.saleAmount += saleAmt;
          }
      });

      // Process Purchases
      filteredPurchases.forEach(purchase => {
          const partyId = purchase.party_id;
          if (!partyId) return;

          let purQty = 0;
          let purAmt = 0;
          const lineItems = parseLineItems(purchase.line_items_json);

          lineItems.forEach((item: any) => {
              const itemId = String(item.itemId);
              if (validItemIds && !validItemIds.has(itemId)) return;

              purQty += Number(item.quantity || item.qty || 0);
              purAmt += Number(item.amount || 0);
          });

          if (purQty > 0 || purAmt > 0) {
              if (!partyMap.has(partyId)) {
                  partyMap.set(partyId, {
                      partyId: partyId,
                      partyName: purchase.party_name || "Unknown Party",
                      saleQty: 0,
                      saleAmount: 0,
                      purchaseQty: 0,
                      purchaseAmount: 0,
                  });
              }
              const existing = partyMap.get(partyId)!;
              existing.purchaseQty += purQty;
              existing.purchaseAmount += purAmt;
          }
      });

      return Array.from(partyMap.values())
        .filter(p => p.saleQty > 0 || p.saleAmount > 0 || p.purchaseQty > 0 || p.purchaseAmount > 0)
        .sort((a, b) => a.partyName.localeCompare(b.partyName));
  }, [rawParties, rawSales, rawPurchases, selectedMonthKey, selectedCategory, selectedItem, itemsForDropdown]);

  const totalSaleQty = displayData.reduce((sum, item) => sum + item.saleQty, 0);
  const totalSaleAmount = displayData.reduce((sum, item) => sum + item.saleAmount, 0);
  const totalPurchaseQty = displayData.reduce((sum, item) => sum + item.purchaseQty, 0);
  const totalPurchaseAmount = displayData.reduce((sum, item) => sum + item.purchaseAmount, 0);

  const handleExportExcel = () => {
    if (displayData.length === 0) return;
    const headers = ["#", "PARTY NAME", "SALE QUANTITY", "SALE AMOUNT", "PURCHASE QUANTITY", "PURCHASE AMOUNT"];
    const rows = displayData.map((row, index) => [
      index + 1,
      `"${row.partyName.replace(/"/g, '""')}"`,
      row.saleQty,
      row.saleAmount.toFixed(2),
      row.purchaseQty,
      row.purchaseAmount.toFixed(2)
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Party_Report_By_Item.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentMonthKey = getMonthKeyFromDate(formatDateDisplay(new Date()));
  const monthButtonLabel = selectedMonthKey === currentMonthKey ? "This Month" : monthLabelForFilter(selectedMonthKey);
  const itemButtonLabel = selectedItem === "All Items" ? "All Items" : (rawItems.find(i => String(i.id) === selectedItem)?.name || selectedItem);

  return (
    <div className="h-full flex flex-col bg-[#F4F5F8] w-full">
      {/* Top action bar area */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full transition-colors -ml-2 text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="relative">
                <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setIsMonthMenuOpen(!isMonthMenuOpen);
                    setIsCategoryMenuOpen(false);
                    setIsItemMenuOpen(false);
                }}
                className="flex items-center gap-2 text-xl font-semibold text-gray-800 -ml-2 hover:bg-gray-50 px-2 py-1 rounded"
                >
                <span>{monthButtonLabel}</span>
                <ChevronDown className="w-5 h-5 text-gray-500" />
                </button>

                {isMonthMenuOpen && (
                <div 
                    className="absolute left-0 top-full mt-1 z-20 w-48 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                    onClick={() => {
                        setSelectedMonthKey("");
                        setIsMonthMenuOpen(false);
                    }}
                    >
                    All Time
                    </button>
                    {availableMonths.map((monthKey) => (
                    <button
                        key={monthKey}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                        onClick={() => {
                        setSelectedMonthKey(monthKey);
                        setIsMonthMenuOpen(false);
                        }}
                    >
                        {formatMonthLabel(monthKey)}
                    </button>
                    ))}
                </div>
                )}
            </div>

            {/* Category Filter */}
            <div className="relative ml-4">
                <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setIsCategoryMenuOpen(!isCategoryMenuOpen);
                    setIsMonthMenuOpen(false);
                    setIsItemMenuOpen(false);
                }}
                className="flex items-center justify-between w-48 px-3 py-1.5 border border-gray-300 rounded bg-white text-sm hover:bg-gray-50"
                >
                <span className="text-gray-700 truncate">{selectedCategory}</span>
                <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                </button>

                {isCategoryMenuOpen && (
                <div 
                    className="absolute left-0 top-full mt-1 z-20 w-48 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden max-h-64 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 border-b border-gray-100"
                        onClick={() => {
                            setSelectedCategory("All Categories");
                            setSelectedItem("All Items");
                            setIsCategoryMenuOpen(false);
                        }}
                    >
                        All Categories
                    </button>
                    {categories.map((cat) => (
                    <button
                        key={cat}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 truncate"
                        title={cat}
                        onClick={() => {
                            setSelectedCategory(cat);
                            setSelectedItem("All Items");
                            setIsCategoryMenuOpen(false);
                        }}
                    >
                        {cat}
                    </button>
                    ))}
                </div>
                )}
            </div>

            {/* Item Filter */}
            <div className="relative ml-2">
                <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setIsItemMenuOpen(!isItemMenuOpen);
                    setIsMonthMenuOpen(false);
                    setIsCategoryMenuOpen(false);
                }}
                className="flex items-center justify-between w-48 px-3 py-1.5 border border-gray-300 rounded bg-white text-sm hover:bg-gray-50"
                >
                <span className="text-gray-700 truncate">{itemButtonLabel}</span>
                <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                </button>

                {isItemMenuOpen && (
                <div 
                    className="absolute left-0 top-full mt-1 z-20 w-48 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden max-h-64 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 border-b border-gray-100"
                        onClick={() => {
                            setSelectedItem("All Items");
                            setIsItemMenuOpen(false);
                        }}
                    >
                        All Items
                    </button>
                    {itemsForDropdown.sort((a,b) => a.name.localeCompare(b.name)).map((item) => (
                    <button
                        key={item.id}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 truncate"
                        title={item.name}
                        onClick={() => {
                            setSelectedItem(String(item.id));
                            setIsItemMenuOpen(false);
                        }}
                    >
                        {item.name}
                    </button>
                    ))}
                </div>
                )}
            </div>
          </div>
          
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
              <thead className="bg-white sticky top-0 border-b border-gray-200 z-10">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-500 w-16 border-r border-gray-100 text-center">
                    #
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-500 border-r border-gray-100 text-center">
                    PARTY NAME
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-500 border-r border-gray-100 text-center">
                    SALE QUANTITY
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-500 border-r border-gray-100 text-center">
                    SALE AMOUNT
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-500 border-r border-gray-100 text-center">
                    PURCHASE QUANTITY
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-500 border-r border-gray-100 text-center">
                    PURCHASE AMOUNT
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
                      No records found.
                    </td>
                  </tr>
                ) : (
                  displayData.map((row, index) => (
                      <tr 
                        key={row.partyId} 
                        className={`transition-colors hover:bg-gray-50/50 ${index % 2 === 0 ? 'bg-[#D6EAF8]' : 'bg-white'}`}
                      >
                        <td className="px-4 py-3 text-gray-900 border-r border-white/50 text-center">{index + 1}</td>
                        <td className="px-4 py-3 text-gray-900 font-medium border-r border-white/50 text-center">{row.partyName}</td>
                        <td className="px-4 py-3 text-gray-900 border-r border-white/50 text-center">{row.saleQty}</td>
                        <td className="px-4 py-3 border-r border-white/50 text-gray-900 text-center">
                          Rs {row.saleAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </td>
                        <td className="px-4 py-3 text-gray-900 border-r border-white/50 text-center">{row.purchaseQty}</td>
                        <td className="px-4 py-3 border-r border-white/50 text-gray-900 text-center">
                          Rs {row.purchaseAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </td>
                      </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Totals */}
          <div className="bg-white border-t border-gray-200 p-4 px-6 flex justify-between items-center text-[15px] sticky bottom-0">
            <div className="flex gap-4">
               <div className="text-gray-600">
                 Total:
               </div>
            </div>
            <div className="flex gap-16 ml-auto mr-12 text-center text-gray-900">
                <div>{totalSaleQty}</div>
                <div>Rs {totalSaleAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                <div>{totalPurchaseQty}</div>
                <div>Rs {totalPurchaseAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
