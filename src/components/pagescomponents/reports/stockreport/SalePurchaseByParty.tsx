import { useCallback, useEffect, useState, useMemo } from "react";
import { ChevronDown, Printer, ArrowLeft } from "lucide-react";
import { getMonthKeyFromDate, formatDateDisplay, monthLabelForFilter, formatMonthLabel } from "../../saleinvoices/utils";

interface SalePurchaseByPartyProps {
  onBack: () => void;
}

interface AggregateData {
  partyId: number;
  partyName: string;
  totalSaleAmount: number;
  totalPurchaseAmount: number;
}

export function SalePurchaseByParty({ onBack }: SalePurchaseByPartyProps) {
  const [loading, setLoading] = useState(true);
  
  // Filter state
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>("");
  const [isMonthMenuOpen, setIsMonthMenuOpen] = useState(false);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  
  const [selectedPartyFilter, setSelectedPartyFilter] = useState<string>("All Firms"); // From screenshot: "All Firms"
  const [isPartyMenuOpen, setIsPartyMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const closeMenus = () => {
      setIsMonthMenuOpen(false);
      setIsPartyMenuOpen(false);
    };
    window.addEventListener("click", closeMenus);
    return () => window.removeEventListener("click", closeMenus);
  }, []);

  const [rawParties, setRawParties] = useState<any[]>([]);
  const [rawSales, setRawSales] = useState<any[]>([]);
  const [rawPurchases, setRawPurchases] = useState<any[]>([]);

  const loadRawData = useCallback(async () => {
    try {
        setLoading(true);
        const [partiesRes, salesRes, purchasesRes] = await Promise.all([
          fetch("/api/parties").catch(() => null),
          fetch("/api/sale_invoices").catch(() => null),
          fetch("/api/purchase_bills").catch(() => null),
        ]);
        
        let parties: any[] = [];
        let sales: any[] = [];
        let purchases: any[] = [];
  
        if (partiesRes && partiesRes.ok) parties = await partiesRes.json();
        if (salesRes && salesRes.ok) sales = await salesRes.json();
        if (purchasesRes && purchasesRes.ok) purchases = await purchasesRes.json();

        setRawParties(parties);
        setRawSales(sales);
        setRawPurchases(purchases);

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

  const isAllParties = selectedPartyFilter === "All Firms";

  const displayData = useMemo(() => {
      const filteredSales = selectedMonthKey 
          ? rawSales.filter(s => getMonthKeyFromDate(s.date) === selectedMonthKey)
          : rawSales;

      const filteredPurchases = selectedMonthKey 
          ? rawPurchases.filter(p => getMonthKeyFromDate(p.date) === selectedMonthKey)
          : rawPurchases;

      const partyMap = new Map<number, AggregateData>();

      rawParties.forEach(party => {
          partyMap.set(party.id, {
              partyId: party.id,
              partyName: party.name,
              totalSaleAmount: 0,
              totalPurchaseAmount: 0,
          });
      });

      filteredSales.forEach(sale => {
          const partyId = sale.party_id;
          if (partyId) {
              const amount = Number(sale.amount || 0);
              if (partyMap.has(partyId)) {
                  partyMap.get(partyId)!.totalSaleAmount += amount;
              } else {
                  partyMap.set(partyId, {
                      partyId: partyId,
                      partyName: sale.party_name || "Unknown Party",
                      totalSaleAmount: amount,
                      totalPurchaseAmount: 0,
                  });
              }
          }
      });

      filteredPurchases.forEach(purchase => {
          const partyId = purchase.party_id;
          if (partyId) {
              const amount = Number(purchase.amount || 0);
              if (partyMap.has(partyId)) {
                  partyMap.get(partyId)!.totalPurchaseAmount += amount;
              } else {
                  partyMap.set(partyId, {
                      partyId: partyId,
                      partyName: purchase.party_name || "Unknown Party",
                      totalSaleAmount: 0,
                      totalPurchaseAmount: amount,
                  });
              }
          }
      });

      let results = Array.from(partyMap.values());
      
      // Filter out parties with 0 sales and 0 purchases
      results = results.filter(p => p.totalSaleAmount > 0 || p.totalPurchaseAmount > 0);

      // Apply firm filter
      if (!isAllParties) {
         results = results.filter(p => String(p.partyId) === selectedPartyFilter || p.partyName === selectedPartyFilter);
      }

      // Apply search filter
      if (searchQuery.trim()) {
         const lowerQ = searchQuery.toLowerCase();
         results = results.filter(p => p.partyName.toLowerCase().includes(lowerQ));
      }

      return results.sort((a, b) => a.partyName.localeCompare(b.partyName));
  }, [rawParties, rawSales, rawPurchases, selectedMonthKey, selectedPartyFilter, isAllParties, searchQuery]);

  const totalSale = displayData.reduce((sum, item) => sum + item.totalSaleAmount, 0);
  const totalPurchase = displayData.reduce((sum, item) => sum + item.totalPurchaseAmount, 0);

  const handleExportExcel = () => {
    if (displayData.length === 0) return;
    
    const headers = ["#", "PARTY NAME", "SALE AMOUNT", "PURCHASE AMOUNT"];
    const rows = displayData.map((row, index) => [
        String(index + 1),
        `"${row.partyName.replace(/"/g, '""')}"`,
        row.totalSaleAmount > 0 ? row.totalSaleAmount.toFixed(2) : '---',
        row.totalPurchaseAmount > 0 ? row.totalPurchaseAmount.toFixed(2) : '---'
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Sale_Purchase_By_Party.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentMonthKey = getMonthKeyFromDate(formatDateDisplay(new Date()));
  const monthButtonLabel = selectedMonthKey === currentMonthKey ? "This Month" : monthLabelForFilter(selectedMonthKey);
  const partyButtonLabel = isAllParties ? "All Firms" : (rawParties.find(p => String(p.id) === selectedPartyFilter)?.name || selectedPartyFilter);

  return (
    <div className="h-full flex flex-col bg-[#F4F5F8] w-full">
      {/* Top action bar area */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full transition-colors -ml-2 text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="relative">
                <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setIsMonthMenuOpen(!isMonthMenuOpen);
                    setIsPartyMenuOpen(false);
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

            {/* Date Range Display (Mocked based on image) */}
            {selectedMonthKey && (
              <div className="flex items-center bg-gray-100 rounded border border-gray-300 ml-4 overflow-hidden">
                <div className="px-3 py-1.5 bg-gray-400 text-white text-sm font-medium">Between</div>
                <div className="px-3 py-1.5 text-sm text-gray-700 font-medium">
                  {/* Just showing a static date range for demo, can be calculated from monthKey */}
                  01/{selectedMonthKey.split('-')[1]}/{selectedMonthKey.split('-')[0]} To 31/{selectedMonthKey.split('-')[1]}/{selectedMonthKey.split('-')[0]}
                </div>
              </div>
            )}

            {/* Party/Firm Filter */}
            <div className="relative ml-4">
                <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setIsPartyMenuOpen(!isPartyMenuOpen);
                    setIsMonthMenuOpen(false);
                }}
                className="flex items-center justify-between w-56 px-3 py-1.5 border border-gray-300 rounded bg-white text-sm hover:bg-gray-50"
                >
                <span className="text-gray-700 truncate">{partyButtonLabel}</span>
                <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                </button>

                {isPartyMenuOpen && (
                <div 
                    className="absolute left-0 top-full mt-1 z-20 w-56 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden max-h-64 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 border-b border-gray-100"
                        onClick={() => {
                            setSelectedPartyFilter("All Firms");
                            setIsPartyMenuOpen(false);
                        }}
                    >
                        All Firms
                    </button>
                    {rawParties.sort((a,b) => a.name.localeCompare(b.name)).map((party) => (
                    <button
                        key={party.id}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 truncate"
                        title={party.name}
                        onClick={() => {
                            setSelectedPartyFilter(String(party.id));
                            setIsPartyMenuOpen(false);
                        }}
                    >
                        {party.name}
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
          
          <div className="px-4 py-3 border-b border-gray-200">
             <input 
                type="text" 
                placeholder="Search..." 
                className="w-64 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
             />
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-white sticky top-0 border-b border-gray-200 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-500 w-16 border-r border-gray-100 text-center">
                    #
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-500 border-r border-gray-100 text-left">
                    <div className="flex items-center justify-between">
                       <span>PARTY NAME</span>
                       {/* Filter icon placeholder */}
                       <svg className="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                    </div>
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-500 border-r border-gray-100 text-right">
                    <div className="flex items-center justify-between">
                       <span>SALE AMOUNT</span>
                       <svg className="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                    </div>
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-500 border-r border-gray-100 text-right">
                    <div className="flex items-center justify-between">
                       <span>PURCHASE AMOUNT</span>
                       <svg className="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      Loading data...
                    </td>
                  </tr>
                ) : displayData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  displayData.map((row, index) => {
                      const isBlueBg = index === 0; // The screenshot highlights row 1 with light blue, but we'll stick to a normal hover effect unless requested, actually let's use standard even/odd or hover.
                      return (
                        <tr key={row.partyId} className={`transition-colors hover:bg-gray-50/50 ${isBlueBg ? 'bg-[#DDEEF6]' : ''}`}>
                            <td className="px-4 py-3 text-gray-900 border-r border-white/50 text-center">{index + 1}</td>
                            <td className="px-4 py-3 text-gray-900 border-r border-white/50 text-left">{row.partyName}</td>
                            <td className="px-4 py-3 border-r border-white/50 text-right">
                               {row.totalSaleAmount > 0 ? (
                                   <span className="text-green-500">Rs {row.totalSaleAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                               ) : (
                                   <span className="text-gray-500">---</span>
                               )}
                            </td>
                            <td className="px-4 py-3 border-r border-white/50 text-right">
                               {row.totalPurchaseAmount > 0 ? (
                                   <span className="text-red-500">Rs {row.totalPurchaseAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                               ) : (
                                   <span className="text-gray-500">---</span>
                               )}
                            </td>
                        </tr>
                      );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Totals */}
          <div className="bg-white border-t border-gray-200 p-4 px-6 flex justify-between items-center text-[15px] sticky bottom-0 shadow-[0_-2px_4px_rgba(0,0,0,0.05)]">
            <div className="text-gray-600">
              Total Sale Amount: <span className="text-green-500 ml-1">Rs {totalSale.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            <div className="text-gray-600">
              Total Purchase Amount: <span className="text-red-500 ml-1">Rs {totalPurchase.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
