import { useSettings } from "@/hooks/useSettings";
import { useCallback, useEffect, useState, useMemo } from "react";
import { ChevronDown, Printer, ArrowLeft } from "lucide-react";
import * as XLSXStyle from "xlsx-js-style";
import { getMonthKeyFromDate, formatDateDisplay, formatMonthLabel } from "../../saleinvoices/utils";

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

    let headers: string[];
    let colWidths: any[];

    if (isAllParties) {
        headers = ["#", "PARTY NAME", "PHONE NO.", "TOTAL SALE AMOUNT", "PROFIT (+) / LOSS (-)"];
        colWidths = [{ wch: 6 }, { wch: 24 }, { wch: 16 }, { wch: 20 }, { wch: 20 }];
    } else {
        headers = ["#", "DATE", "INVOICE NO.", "SALE AMOUNT", "PROFIT (+) / LOSS (-)"];
        colWidths = [{ wch: 6 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 20 }];
    }

    const ws: Record<string, any> = {};

    headers.forEach((h, colIdx) => {
      const cellRef = XLSXStyle.utils.encode_cell({ r: 0, c: colIdx });
      ws[cellRef] = { v: h, t: "s", s: headerStyle };
    });

    displayData.forEach((row, rowIdx) => {
      const r = rowIdx + 1;
      let rowData;
      if (isAllParties) {
        const aggRow = row as AggregateData;
        rowData = [
            { v: r.toString(), t: "s" as const },
            { v: aggRow.partyName, t: "s" as const },
            { v: aggRow.phoneNo || "---", t: "s" as const },
            { v: `${currencyStr} ${aggRow.totalSaleAmount.toFixed(2)}`, t: "s" as const },
            { v: `${currencyStr} ${aggRow.profitOrLoss.toFixed(2)}`, t: "s" as const },
        ];
      } else {
        const txnRow = row as TransactionData;
        rowData = [
            { v: r.toString(), t: "s" as const },
            { v: txnRow.date, t: "s" as const },
            { v: txnRow.invoiceNo || "---", t: "s" as const },
            { v: `${currencyStr} ${txnRow.saleAmount.toFixed(2)}`, t: "s" as const },
            { v: `${currencyStr} ${txnRow.profitOrLoss.toFixed(2)}`, t: "s" as const },
        ];
      }

      rowData.forEach((cell, colIdx) => {
        const cellRef = XLSXStyle.utils.encode_cell({ r, c: colIdx });
        ws[cellRef] = { ...cell, s: colIdx >= 3 ? cellRight : cellLeft };
      });
    });

    ws["!ref"] = XLSXStyle.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: Math.max(0, displayData.length), c: headers.length - 1 },
    });

    ws["!cols"] = colWidths;
    ws["!rows"] = [{ hpt: 22 }, ...displayData.map(() => ({ hpt: 18 }))];

    const wb = XLSXStyle.utils.book_new();
    XLSXStyle.utils.book_append_sheet(wb, ws, "Profit and Loss");

    XLSXStyle.writeFile(wb, "Party_Wise_Profit_Loss.xlsx");
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

    const title = isAllParties ? "Party Wise Profit/Loss (All Parties)" : `Profit/Loss - ${partyButtonLabel}`;

    let headersHTML = "";
    if (isAllParties) {
      headersHTML = `
        <tr>
          <th>#</th>
          <th>Party Name</th>
          <th>Phone No.</th>
          <th class="right">Total Sale Amount</th>
          <th class="right">Profit (+) / Loss (-)</th>
        </tr>
      `;
    } else {
      headersHTML = `
        <tr>
          <th>#</th>
          <th>Date</th>
          <th>Invoice No.</th>
          <th class="right">Sale Amount</th>
          <th class="right">Profit (+) / Loss (-)</th>
        </tr>
      `;
    }

    const rowsHTML = displayData.map((row, i) => {
      if (isAllParties) {
        const aggRow = row as AggregateData;
        const profitClass = aggRow.profitOrLoss >= 0 ? 'profit' : 'loss';
        return `
          <tr>
            <td class="center">${i + 1}</td>
            <td>${aggRow.partyName}</td>
            <td>${aggRow.phoneNo || '---'}</td>
            <td class="right">${currencyStr} ${aggRow.totalSaleAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            <td class="right ${profitClass}">${currencyStr} ${aggRow.profitOrLoss.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          </tr>
        `;
      } else {
        const txnRow = row as TransactionData;
        const profitClass = txnRow.profitOrLoss >= 0 ? 'profit' : 'loss';
        return `
          <tr>
            <td class="center">${i + 1}</td>
            <td>${txnRow.date}</td>
            <td>${txnRow.invoiceNo || '---'}</td>
            <td class="right">${currencyStr} ${txnRow.saleAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            <td class="right ${profitClass}">${currencyStr} ${txnRow.profitOrLoss.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          </tr>
        `;
      }
    }).join("");

    const totalProfitClass = totalProfit >= 0 ? 'profit' : 'loss';

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
            .profit { color: #10B981; font-weight: bold; }
            .loss { color: #EF4444; font-weight: bold; }
            .totals { margin-top: 20px; font-weight: bold; font-size: 16px; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <h2>${title}</h2>
          <h4>Month: ${selectedMonthKey ? formatMonthLabel(selectedMonthKey) : 'All Time'}</h4>
          <table>
            <thead>
              ${headersHTML}
            </thead>
            <tbody>
              ${rowsHTML}
            </tbody>
          </table>
          <div class="totals">
            <div>Total Sale Amount: <span>${currencyStr} ${totalSale.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
            <div>Total Profit(+) / Loss(-): <span class="${totalProfitClass}">${currencyStr} ${totalProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
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
