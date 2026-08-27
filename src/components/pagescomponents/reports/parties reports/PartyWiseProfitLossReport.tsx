import { useSettings } from "@/hooks/useSettings";
import { useCallback, useEffect, useState, useMemo } from "react";
import { ChevronDown, Printer, ArrowLeft } from "lucide-react";
import { getMonthKeyFromDate, formatDateDisplay } from "../../saleinvoices/utils";

interface PartyWiseProfitLossReportProps {
  onBack: () => void;
}

interface AggregateData {
  type: 'aggregate';
  partyId: number;
  partyName: string;
  phoneNo: string;
  totalSaleAmount: number;
  profitOrLoss: number;
}

interface TransactionData {
  type: 'transaction';
  saleId: number;
  date: string;
  invoiceNo: string;
  saleAmount: number;
  profitOrLoss: number;
}

type DisplayData = AggregateData | TransactionData;

export function PartyWiseProfitLossReport({ onBack }: PartyWiseProfitLossReportProps) {
  const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });
  const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
  const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;

  const [loading, setLoading] = useState(true);
  
  // Filter state
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(
    getMonthKeyFromDate(formatDateDisplay(new Date()))
  );
  
  const [selectedPartyFilter, setSelectedPartyFilter] = useState<string>("All parties");
  const [isPartyMenuOpen, setIsPartyMenuOpen] = useState(false);

  useEffect(() => {
    const closeMenus = () => {
      setIsPartyMenuOpen(false);
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
  const [rawItems, setRawItems] = useState<any[]>([]);

  const loadRawData = useCallback(async () => {
    try {
        setLoading(true);
        const [partiesRes, salesRes, itemsRes] = await Promise.all([
          fetch("/api/parties").catch(() => null),
          fetch("/api/sale_invoices").catch(() => null),
          fetch("/api/items").catch(() => null),
        ]);
        
        let parties: any[] = [];
        let sales: any[] = [];
        let items: any[] = [];
  
        if (partiesRes && partiesRes.ok) parties = await partiesRes.json();
        if (salesRes && salesRes.ok) sales = await salesRes.json();
        if (itemsRes && itemsRes.ok) items = await itemsRes.json();

        setRawParties(parties);
        setRawSales(sales);
        setRawItems(items);



    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRawData();
  }, [loadRawData]);

  const isAllParties = selectedPartyFilter === "All parties";

  const displayData = useMemo(() => {
      const itemPurchasePriceMap = new Map<string, number>();
      rawItems.forEach(item => {
        itemPurchasePriceMap.set(String(item.id), Number(item.purchase_price || 0));
      });

      const filteredSales = selectedMonthKey 
          ? rawSales.filter(s => getMonthKeyFromDate(s.date) === selectedMonthKey)
          : rawSales;

      if (isAllParties) {
          const partyMap = new Map<number, AggregateData>();

          rawParties.forEach(party => {
              partyMap.set(party.id, {
                  type: 'aggregate',
                  partyId: party.id,
                  partyName: party.name,
                  phoneNo: party.phone || "",
                  totalSaleAmount: 0,
                  profitOrLoss: 0,
              });
          });

          filteredSales.forEach(sale => {
              const partyId = sale.party_id;
              if (partyId) {
                  const amount = Number(sale.amount || 0);
                  let totalCost = 0;
                  const lineItems = parseLineItems(sale.line_items_json);
                  lineItems.forEach((item: any) => {
                      const itemId = String(item.itemId);
                      const qty = Number(item.quantity || item.qty || 0);
                      const cost = itemPurchasePriceMap.get(itemId) || 0;
                      totalCost += (qty * cost);
                  });

                  const subtotal = Number(sale.subtotal || 0);
                  const discount = Number(sale.discount_amount || 0);
                  const netSaleAmount = subtotal - discount;
                  const profit = netSaleAmount - totalCost;

                  if (partyMap.has(partyId)) {
                      const existing = partyMap.get(partyId)!;
                      existing.totalSaleAmount += amount;
                      existing.profitOrLoss += profit;
                  } else {
                      partyMap.set(partyId, {
                          type: 'aggregate',
                          partyId: partyId,
                          partyName: sale.party_name || "Unknown Party",
                          phoneNo: sale.party_phone || "",
                          totalSaleAmount: amount,
                          profitOrLoss: profit,
                      });
                  }
              }
          });

          return Array.from(partyMap.values()).filter(p => p.totalSaleAmount > 0).sort((a, b) => a.partyName.localeCompare(b.partyName)) as DisplayData[];
      } else {
          // Transaction mode
          const partySales = filteredSales.filter(s => String(s.party_id) === selectedPartyFilter || s.party_name === selectedPartyFilter);
          
          const transactions: TransactionData[] = partySales.map(sale => {
              const amount = Number(sale.amount || 0);
              let totalCost = 0;
              const lineItems = parseLineItems(sale.line_items_json);
              lineItems.forEach((item: any) => {
                  const itemId = String(item.itemId);
                  const qty = Number(item.quantity || item.qty || 0);
                  const cost = itemPurchasePriceMap.get(itemId) || 0;
                  totalCost += (qty * cost);
              });

              const subtotal = Number(sale.subtotal || 0);
              const discount = Number(sale.discount_amount || 0);
              const netSaleAmount = subtotal - discount;
              const profit = netSaleAmount - totalCost;

              return {
                  type: 'transaction',
                  saleId: sale.id,
                  date: sale.date || "",
                  invoiceNo: sale.invoice_no || "",
                  saleAmount: amount,
                  profitOrLoss: profit,
              };
          });

          return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) as DisplayData[];
      }
  }, [rawParties, rawSales, rawItems, selectedMonthKey, selectedPartyFilter, isAllParties]);

  const totalSale = displayData.reduce((sum, item) => sum + (item.type === 'aggregate' ? item.totalSaleAmount : item.saleAmount), 0);
  const totalProfit = displayData.reduce((sum, item) => sum + item.profitOrLoss, 0);

  const handleExportExcel = () => {
    if (displayData.length === 0) return;
    
    let headers: string[];
    let rows: string[][];

    if (isAllParties) {
        headers = ["#", "PARTY NAME", "PHONE NO.", "TOTAL SALE AMOUNT", "PROFIT (+) / LOSS (-)"];
        rows = (displayData as AggregateData[]).map((row, index) => [
            String(index + 1),
            `"${row.partyName.replace(/"/g, '""')}"`,
            `"${row.phoneNo}"`,
            row.totalSaleAmount.toFixed(2),
            row.profitOrLoss.toFixed(2)
        ]);
    } else {
        headers = ["#", "DATE", "INVOICE NO.", "SALE AMOUNT", "PROFIT (+) / LOSS (-)"];
        rows = (displayData as TransactionData[]).map((row, index) => [
            String(index + 1),
            `"${row.date}"`,
            `"${row.invoiceNo}"`,
            row.saleAmount.toFixed(2),
            row.profitOrLoss.toFixed(2)
        ]);
    }

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Party_Wise_Profit_Loss.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const partyButtonLabel = isAllParties ? "All parties" : (rawParties.find(p => String(p.id) === selectedPartyFilter)?.name || selectedPartyFilter);

  return (
    <div className="h-full flex flex-col bg-[#F4F5F8] w-full">
      {/* Top action bar area */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full transition-colors -ml-2 text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Filter by Month:</span>
              <input 
                type="month"
                value={selectedMonthKey}
                onChange={(e) => setSelectedMonthKey(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Party Filter */}
            <div className="relative ml-4">
                <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setIsPartyMenuOpen(!isPartyMenuOpen);
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
                            setSelectedPartyFilter("All parties");
                            setIsPartyMenuOpen(false);
                        }}
                    >
                        All parties
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
          
          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-white sticky top-0 border-b border-gray-200 z-10">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-500 w-16 border-r border-gray-100 text-center">
                    #
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-500 border-r border-gray-100 text-center">
                    {isAllParties ? "PARTY NAME" : "DATE"}
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-500 border-r border-gray-100 text-center">
                    {isAllParties ? "PHONE NO." : "INVOICE NO."}
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-500 border-r border-gray-100 text-center">
                    {isAllParties ? "TOTAL SALE AMOUNT" : "SALE AMOUNT"}
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-500 border-r border-gray-100 text-center">
                    PROFIT (+) / LOSS (-)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Loading data...
                    </td>
                  </tr>
                ) : displayData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  displayData.map((row, index) => {
                      if (row.type === 'aggregate') {
                          return (
                            <tr key={row.partyId} className="transition-colors hover:bg-gray-50/50">
                                <td className="px-4 py-3 text-gray-900 border-r border-white/50 text-center">{index + 1}</td>
                                <td className="px-4 py-3 text-gray-900 font-medium border-r border-white/50 text-center">{row.partyName}</td>
                                <td className="px-4 py-3 text-gray-900 border-r border-white/50 text-center">{row.phoneNo || '---'}</td>
                                <td className="px-4 py-3 border-r border-white/50 text-gray-900 text-center">
                                {currencyStr} {row.totalSaleAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                </td>
                                <td className="px-4 py-3 border-r border-white/50 text-center">
                                <span className={row.profitOrLoss >= 0 ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                                    {currencyStr} {row.profitOrLoss.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                </span>
                                </td>
                            </tr>
                          );
                      } else {
                          return (
                            <tr key={row.saleId} className="transition-colors hover:bg-gray-50/50">
                                <td className="px-4 py-3 text-gray-900 border-r border-white/50 text-center">{index + 1}</td>
                                <td className="px-4 py-3 text-gray-900 font-medium border-r border-white/50 text-center">{row.date}</td>
                                <td className="px-4 py-3 text-gray-900 border-r border-white/50 text-center">{row.invoiceNo || '---'}</td>
                                <td className="px-4 py-3 border-r border-white/50 text-gray-900 text-center">
                                {currencyStr} {row.saleAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                </td>
                                <td className="px-4 py-3 border-r border-white/50 text-center">
                                <span className={row.profitOrLoss >= 0 ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                                    {currencyStr} {row.profitOrLoss.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                </span>
                                </td>
                            </tr>
                          );
                      }
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Totals */}
          <div className="bg-white border-t border-gray-200 p-4 px-6 flex justify-between items-center text-[15px] sticky bottom-0">
            <div className="text-gray-600">
              Total Sale Amount: <span className="text-gray-900 ml-1">{currencyStr} {totalSale.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            <div className="text-gray-600">
              Total Profit(+) / Loss(-): <span className={totalProfit >= 0 ? "text-green-500 ml-1" : "text-red-500 ml-1"}>{currencyStr} {totalProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
