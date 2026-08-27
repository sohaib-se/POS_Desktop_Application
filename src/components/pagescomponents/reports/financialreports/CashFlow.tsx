import { useSettings } from "@/hooks/useSettings";
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Search, Calendar } from 'lucide-react';

interface CashFlowProps {
  onBack: () => void;
}

interface Transaction {
  id: string;
  type: string;
  name: string;
  date: string;
  amount: number | string;
  created_at?: string;
}

interface CashFlowRow extends Transaction {
  inflow: number;
  outflow: number;
  runningCash: number;
}

const parseLocalDate = (dStr: string) => {
  if (!dStr) return new Date();
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

export function CashFlow({ onBack }: CashFlowProps) {
  const [transactions, setTransactions] = useState<CashFlowRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Search state
  const [showSearchInput, setShowSearchInput] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const placeholders = ["Name", "Type", "Amount"];
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
        !searchTerm
      ) {
        setShowSearchInput(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSearchInput, searchTerm]);
  const [loading, setLoading] = useState(true);
    const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });
  const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
  const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;


  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch("/api/cash_transactions");
        if (res.ok) {
          const data: Transaction[] = await res.json();
          
          // Sort chronologically (ascending) to calculate running cash
          const sortedAsc = [...data].sort((a, b) => {
            return parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime();
          });

          let runningCash = 0;
          const rows: CashFlowRow[] = sortedAsc.map(tx => {
            const type = String(tx.type).toLowerCase();
            const isCashIn = type.includes("in") || type === "sale" || type.includes("add") || type.includes("increase") || type === "pos sale";
            
            const amount = Number(tx.amount) || 0;
            const inflow = isCashIn ? amount : 0;
            const outflow = !isCashIn ? amount : 0;
            
            runningCash += inflow;
            runningCash -= outflow;

            return {
              ...tx,
              inflow,
              outflow,
              runningCash
            };
          });

          // Keep chronological order (recent at bottom)
          setTransactions(rows);
        }
      } catch (e) {
        console.error("Failed to load cash flow", e);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(tx => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = tx.name?.toLowerCase().includes(term) ||
                          tx.type?.toLowerCase().includes(term) ||
                          tx.amount.toString().toLowerCase().includes(term);
    
    let matchesDate = true;
    if (dateFrom || dateTo) {
      const txDate = parseLocalDate(tx.date).getTime();
      
      if (dateFrom) {
        if (txDate < parseLocalDate(dateFrom).getTime()) matchesDate = false;
      }
      if (dateTo) {
        const toDate = parseLocalDate(dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (txDate > toDate.getTime()) matchesDate = false;
      }
    }
    
    return matchesSearch && matchesDate;
  });

  const totalCashIn = filteredTransactions.reduce((sum, tx) => sum + tx.inflow, 0);
  const totalCashOut = filteredTransactions.reduce((sum, tx) => sum + tx.outflow, 0);
  const finalRunningCash = filteredTransactions.length > 0 ? filteredTransactions[filteredTransactions.length - 1].runningCash : 0;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Cash flow</h1>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">From:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">To:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <div className="flex gap-2 items-center h-10" ref={searchContainerRef}>
            <div 
              className={`flex items-center overflow-hidden transition-all duration-300 ease-out rounded-full h-9 ${
                showSearchInput 
                  ? "w-64 bg-white border border-blue-500 ring-4 ring-blue-50" 
                  : "w-9 bg-transparent border border-transparent hover:bg-gray-100 cursor-pointer"
              }`}
              onClick={(e) => {
                if (!showSearchInput) {
                  e.stopPropagation();
                  setShowSearchInput(true);
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none outline-none focus:ring-0 focus:outline-none focus:border-transparent text-sm h-full w-full pr-3 relative z-10"
                />
                {!searchTerm && (
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
        </div>
      </div>
      
      <div className="p-6 flex-1 overflow-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Type</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Name / Description</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Cash In (+)</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Cash Out (-)</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Running Cash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Loading cash flow data...
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No cash transactions found.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {tx.date}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${tx.inflow > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{tx.name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-green-600 font-medium text-right">
                        {tx.inflow > 0 ? `${currencyStr}${tx.inflow.toLocaleString(undefined, {minimumFractionDigits: 2})}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-red-600 font-medium text-right">
                        {tx.outflow > 0 ? `${currencyStr}${tx.outflow.toLocaleString(undefined, {minimumFractionDigits: 2})}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-blue-600 font-semibold text-right">
                        {currencyStr}{tx.runningCash.toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {!loading && filteredTransactions.length > 0 && (
                <tfoot className="bg-gray-50 font-semibold border-t-2 border-gray-200">
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-right text-gray-900">
                      Totals:
                    </td>
                    <td className="px-6 py-4 text-right text-green-600">
                      {currencyStr}{totalCashIn.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </td>
                    <td className="px-6 py-4 text-right text-red-600">
                      {currencyStr}{totalCashOut.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </td>
                    <td className="px-6 py-4 text-right text-blue-700">
                      {currencyStr}{finalRunningCash.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
