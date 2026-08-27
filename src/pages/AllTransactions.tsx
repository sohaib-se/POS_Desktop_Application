import { useState, useEffect, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

export function AllTransactions() {
  const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });
  const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
  const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterType, setFilterType] = useState("All Transaction");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Date filter applied via SEARCH button
  const [appliedDateFrom, setAppliedDateFrom] = useState("");
  const [appliedDateTo, setAppliedDateTo] = useState("");

  const filterOptions = [
    "All Transaction",
    "Sale",
    "Purchase",
    "Payment-In",
    "Payment-Out",
    "Estimate",
    "Expense"
  ];

  const parseDate = (dStr: string) => {
    if (!dStr) return new Date(0);
    const parts = dStr.split('/');
    if (parts.length === 3) {
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
    return new Date(dStr);
  };

  useEffect(() => {
    let cancelled = false;
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const [
          salesRes,
          purchasesRes,
          payInRes,
          payOutRes,
          estimatesRes,
          expensesRes,
        ] = await Promise.all([
          fetch('/api/sale_invoices').catch(() => ({ ok: false, json: () => [] })),
          fetch('/api/purchase_bills').catch(() => ({ ok: false, json: () => [] })),
          fetch('/api/payment_in_records').catch(() => ({ ok: false, json: () => [] })),
          fetch('/api/payment_out_records').catch(() => ({ ok: false, json: () => [] })),
          fetch('/api/estimates').catch(() => ({ ok: false, json: () => [] })),
          fetch('/api/expense_records').catch(() => ({ ok: false, json: () => [] })),
        ]);

        if (cancelled) return;

        const sales = salesRes.ok ? await salesRes.json() : [];
        const purchases = purchasesRes.ok ? await purchasesRes.json() : [];
        const payIn = payInRes.ok ? await payInRes.json() : [];
        const payOut = payOutRes.ok ? await payOutRes.json() : [];
        const estimates = estimatesRes.ok ? await estimatesRes.json() : [];
        const expenses = expensesRes.ok ? await expensesRes.json() : [];

        const allData: any[] = [];

        sales.forEach((s: any) => {
          allData.push({
            id: s.id,
            type: s.transaction_type || 'Sale',
            invoiceNo: s.invoice_no,
            partyName: s.party_name,
            date: s.date,
            amount: Number(s.amount || 0),
            balance: Number(s.balance || 0),
            dateObj: parseDate(s.date)
          });
        });

        purchases.forEach((p: any) => {
          allData.push({
            id: p.id,
            type: 'Purchase',
            invoiceNo: p.invoice_no,
            partyName: p.party_name,
            date: p.date,
            amount: Number(p.amount || 0),
            balance: Number(p.balance || 0),
            dateObj: parseDate(p.date)
          });
        });

        payIn.forEach((p: any) => {
          allData.push({
            id: p.id,
            type: 'Payment-In',
            invoiceNo: p.receipt_no || p.receiptNo,
            partyName: p.party_name || p.partyName,
            date: p.date,
            amount: Number(p.amount || 0),
            balance: 0,
            dateObj: parseDate(p.date)
          });
        });

        payOut.forEach((p: any) => {
          allData.push({
            id: p.id,
            type: 'Payment-Out',
            invoiceNo: p.payment_no || p.paymentNo,
            partyName: p.party_name || p.partyName,
            date: p.date,
            amount: Number(p.amount || 0),
            balance: 0,
            dateObj: parseDate(p.date)
          });
        });

        estimates.forEach((e: any) => {
          allData.push({
            id: e.id,
            type: 'Estimate',
            invoiceNo: e.reference_no,
            partyName: e.party_name,
            date: e.date,
            amount: Number(e.amount || 0),
            balance: Number(e.balance || 0),
            dateObj: parseDate(e.date)
          });
        });

        expenses.forEach((e: any) => {
          allData.push({
            id: e.id,
            type: 'Expense',
            invoiceNo: e.expense_no,
            partyName: e.expense_category,
            date: e.date,
            amount: Number(e.amount || 0),
            balance: 0,
            dateObj: parseDate(e.date)
          });
        });

        allData.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
        setTransactions(allData);
      } catch (error) {
        console.error("Failed to load transactions", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = () => {
    setAppliedDateFrom(dateFrom);
    setAppliedDateTo(dateTo);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filterType !== "All Transaction") {
        if (t.type !== filterType) {
          if (filterType === "Sale" && t.type === "PoS Sale") {
            // Include PoS Sale in Sale
          } else {
            return false;
          }
        }
      }
      
      if (appliedDateFrom) {
        const fromDate = new Date(appliedDateFrom);
        fromDate.setHours(0, 0, 0, 0);
        if (t.dateObj < fromDate) {
          return false;
        }
      }
      if (appliedDateTo) {
        const toDate = new Date(appliedDateTo);
        toDate.setHours(23, 59, 59, 999);
        if (t.dateObj > toDate) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, filterType, appliedDateFrom, appliedDateTo]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Sale':
      case 'PoS Sale':
      case 'Payment-In':
      case 'Receivable Opening Balance':
        return 'bg-green-400';
      case 'Purchase':
      case 'Expense':
      case 'Payment-Out':
      case 'Payable Opening Balance':
        return 'bg-red-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Date Filter Bar */}
      <div className="p-5 bg-white border-b border-gray-200 flex items-center gap-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">From</label>
            <input 
              type="date"
              className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008AC9] focus:border-transparent transition-all shadow-sm hover:border-gray-400 w-44"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">To</label>
            <input 
              type="date"
              className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008AC9] focus:border-transparent transition-all shadow-sm hover:border-gray-400 w-44"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <button 
            onClick={handleSearch}
            className="h-[38px] bg-[#008AC9] hover:bg-[#007AB3] text-white px-8 rounded-lg font-medium text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008AC9]"
          >
            SEARCH
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 flex flex-col overflow-hidden">
        <div className="bg-white rounded shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-200 flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">TRANSACTIONS</h2>
          </div>

          {/* Filters Bar */}
          <div className="px-4 py-3 flex items-center relative z-20">
            <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mr-4 w-[160px]">FILTERS</span>
            
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center justify-between w-64 px-3 py-1.5 text-sm border border-orange-400 rounded focus:outline-none focus:ring-1 focus:ring-orange-400 text-gray-700 bg-white"
              >
                <span className="uppercase text-[#008AC9] font-medium text-xs">{filterType}</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              
              {isFilterOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 shadow-lg py-1 rounded max-h-80 overflow-y-auto">
                  {filterOptions.map(option => (
                    <div 
                      key={option}
                      className={`px-4 py-2 text-[13px] cursor-pointer hover:bg-gray-100 transition-colors ${filterType === option ? 'bg-[#1976D2] text-white hover:bg-blue-600' : 'text-gray-700'}`}
                      onClick={() => {
                        setFilterType(option);
                        setIsFilterOpen(false);
                      }}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f9fafb] sticky top-0 z-10 shadow-sm border-y border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase w-40">TYPE</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase border-l border-gray-200">REF NO</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase border-l border-gray-200">NAME</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase border-l border-gray-200">DATE</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase border-l border-gray-200 text-right">TOTAL</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase border-l border-gray-200 text-right">RECEIVE/PAID</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase border-l border-gray-200 text-right">BALANCE</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500 text-sm">
                      Loading transactions...
                    </td>
                  </tr>
                ) : filteredTransactions.map((tx, i) => {
                  const receivedPaid = tx.amount - tx.balance;
                  
                  return (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getTypeColor(tx.type)}`}></div>
                          <span className="text-sm text-gray-700">{tx.type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-l border-gray-100">{tx.invoiceNo || tx.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-l border-gray-100">{tx.partyName}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-l border-gray-100">{tx.date}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-l border-gray-100 text-right">
                        {currencyStr} {(tx.amount || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-l border-gray-100 text-right">
                        {currencyStr} {(receivedPaid || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-l border-gray-100 text-right">
                        {currencyStr} {(tx.balance || 0).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
                {!isLoading && filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500 text-sm">
                      No transactions found for the selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
