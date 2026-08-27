import { useSettings } from "@/hooks/useSettings";
import { ArrowLeft, Search, Filter, Printer, Download, Eye, X } from 'lucide-react';
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { getMonthKeyFromDate, parseLineItems, formatDateDisplay } from '../../saleinvoices/utils';

interface BillWiseProfitProps {
  onBack: () => void;
}

interface SaleProfitData {
  id: string;
  invoiceNo: string;
  date: string;
  partyName: string;
  amount: number;
  profit: number;
  rawSale: any;
}

export function BillWiseProfit({ onBack }: BillWiseProfitProps) {
  const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });
  const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
  const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;

  const [loading, setLoading] = useState(false);
  const [rawSales, setRawSales] = useState<any[]>([]);
  const [rawItems, setRawItems] = useState<any[]>([]);
  
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(
    getMonthKeyFromDate(formatDateDisplay(new Date()))
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoiceForDetails, setSelectedInvoiceForDetails] = useState<any | null>(null);

  // Search state
  const [showSearchInput, setShowSearchInput] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const placeholders = ["Invoice No.", "Party Name", "Amount"];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showSearchInput &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        !searchQuery
      ) {
        setShowSearchInput(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSearchInput, searchQuery]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [salesRes, itemsRes] = await Promise.all([
        fetch("/api/sale_invoices").catch(() => null),
        fetch("/api/items").catch(() => null),
      ]);
      
      let sales: any[] = [];
      let items: any[] = [];

      if (salesRes && salesRes.ok) sales = await salesRes.json();
      if (itemsRes && itemsRes.ok) items = await itemsRes.json();

      setRawSales(sales);
      setRawItems(items);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const displayData = useMemo(() => {
    const itemPurchasePriceMap = new Map<string, number>();
    rawItems.forEach(item => {
      itemPurchasePriceMap.set(String(item.id), Number(item.purchase_price || 0));
    });

    const filteredSales = selectedMonthKey 
        ? rawSales.filter(s => getMonthKeyFromDate(s.date) === selectedMonthKey)
        : rawSales;

    const data: SaleProfitData[] = filteredSales.map(sale => {
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
        id: sale.id,
        invoiceNo: sale.invoice_no,
        date: sale.date,
        partyName: sale.party_name || 'Cash Sale',
        amount: amount,
        profit: profit,
        rawSale: sale
      };
    });

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      return data.filter(d => 
        d.invoiceNo.toLowerCase().includes(lowerQuery) || 
        d.partyName.toLowerCase().includes(lowerQuery) ||
        d.amount.toString().toLowerCase().includes(lowerQuery) ||
        d.profit.toString().toLowerCase().includes(lowerQuery)
      );
    }

    return data;
  }, [rawSales, rawItems, selectedMonthKey, searchQuery]);

  const { totalSales, totalProfit } = useMemo(() => {
    return displayData.reduce(
      (acc, row) => ({
        totalSales: acc.totalSales + row.amount,
        totalProfit: acc.totalProfit + row.profit,
      }),
      { totalSales: 0, totalProfit: 0 }
    );
  }, [displayData]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Profit on sale invoices</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2 items-center h-10" ref={searchContainerRef}>
            <div 
              className={`flex items-center overflow-hidden transition-all duration-300 ease-out rounded-full h-9 ${
                showSearchInput 
                  ? "w-64 bg-white border border-blue-500 ring-4 ring-blue-50 mr-2" 
                  : "w-9 bg-transparent border border-transparent hover:bg-gray-100 cursor-pointer"
              }`}
              onClick={(e) => {
                if (!showSearchInput) {
                  e.stopPropagation();
                  setShowSearchInput(true);
                  setIsMonthMenuOpen(false);
                  setTimeout(() => searchInputRef.current?.focus(), 150);
                }
              }}
            >
              <div className="flex items-center justify-center h-full w-9 shrink-0">
                <Search className={`w-4 h-4 ${showSearchInput ? "text-gray-400" : "text-gray-500"}`} />
              </div>
              <div className={`relative flex-1 h-full flex items-center transition-opacity duration-200 ${
                  showSearchInput ? "opacity-100 delay-100" : "opacity-0"
                }`}>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none focus:ring-0 focus:outline-none focus:border-transparent text-sm h-full w-full pr-3 relative z-10"
                />
                {!searchQuery && (
                  <div className="absolute left-0 pointer-events-none flex items-center h-full w-full overflow-hidden text-gray-400 text-sm">
                    <span className="whitespace-pre">Search </span>
                    <div className="relative h-full flex-1 overflow-hidden">
                      {placeholders.map((ph, idx) => (
                        <span
                          key={ph}
                          className={`absolute top-0 left-0 flex items-center h-full transition-all duration-700 ease-in-out ${
                            idx === placeholderIndex ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                          }`}
                        >
                          {ph}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filter by Month:</span>
            <input 
              type="month"
              value={selectedMonthKey}
              onChange={(e) => setSelectedMonthKey(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            <Download className="w-4 h-4" />
          </button>
          <button className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="p-6 flex-1 overflow-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading data...</div>
          ) : displayData.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No sale invoices found.</div>
          ) : (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Invoice No.</th>
                  <th className="px-6 py-4 font-medium">Party Name</th>
                  <th className="px-6 py-4 font-medium text-right">Sale Amount</th>
                  <th className="px-6 py-4 font-medium text-right">Profit / Loss</th>
                  <th className="px-6 py-4 font-medium text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{row.date}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{row.invoiceNo}</td>
                    <td className="px-6 py-4">{row.partyName}</td>
                    <td className="px-6 py-4 text-right text-gray-900 font-medium">
                      {currencyStr} {row.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`px-6 py-4 text-right font-medium ${row.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {currencyStr} {row.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedInvoiceForDetails(row.rawSale)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-colors flex items-center justify-center w-full"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-semibold text-gray-900 border-t border-gray-200">
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-right uppercase text-xs text-gray-500">Totals</td>
                  <td className="px-6 py-4 text-right">
                    {currencyStr} {totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className={`px-6 py-4 text-right ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {currencyStr} {totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4"></td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>

      {selectedInvoiceForDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Invoice Details - {selectedInvoiceForDetails.invoice_no}
              </h2>
              <button 
                onClick={() => setSelectedInvoiceForDetails(null)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-auto flex-1">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{selectedInvoiceForDetails.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Party</p>
                  <p className="font-medium">{selectedInvoiceForDetails.party_name || 'Cash Sale'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Subtotal</p>
                  <p className="font-medium">{currencyStr} {Number(selectedInvoiceForDetails.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Discount</p>
                  <p className="font-medium">{currencyStr} {Number(selectedInvoiceForDetails.discount_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">Line Items</h3>
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-4 py-2 font-medium">Item</th>
                    <th className="px-4 py-2 font-medium text-right">Qty</th>
                    <th className="px-4 py-2 font-medium text-right">Price</th>
                    <th className="px-4 py-2 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {parseLineItems(selectedInvoiceForDetails.line_items_json).map((item: any, idx: number) => {
                    const itemName = rawItems.find(i => String(i.id) === String(item.itemId))?.name || 'Unknown Item';
                    const qty = Number(item.quantity || item.qty || 0);
                    const price = Number(item.sale_price || item.price || 0);
                    return (
                      <tr key={idx}>
                        <td className="px-4 py-3">{itemName}</td>
                        <td className="px-4 py-3 text-right">{qty}</td>
                        <td className="px-4 py-3 text-right">{currencyStr} {price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 text-right font-medium">{currencyStr} {(qty * price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setSelectedInvoiceForDetails(null)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
