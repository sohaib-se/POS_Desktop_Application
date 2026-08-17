import { useSettings } from "@/hooks/useSettings";
import { useState, useEffect } from 'react';
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

const getCurrencySymbol = () => {
  try {
    const saved = localStorage.getItem('settings.currency');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.symbol) return parsed.symbol;
    }
  } catch {
    // ignore
  }
  return `${currencyStr} `;
};

export function CashFlow({ onBack }: CashFlowProps) {
  const [transactions, setTransactions] = useState<CashFlowRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
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
            const dateA = a.created_at ? new Date(a.created_at).getTime() : new Date(a.date.split('/').reverse().join('-')).getTime();
            const dateB = b.created_at ? new Date(b.created_at).getTime() : new Date(b.date.split('/').reverse().join('-')).getTime();
            return dateA - dateB;
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
    const matchesSearch = tx.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tx.type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    if (dateFrom || dateTo) {
      const txDate = tx.created_at ? new Date(tx.created_at).getTime() : new Date(tx.date.split('/').reverse().join('-')).getTime();
      
      if (dateFrom) {
        const fromDate = new Date(dateFrom).getTime();
        if (txDate < fromDate) matchesDate = false;
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
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
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            />
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
