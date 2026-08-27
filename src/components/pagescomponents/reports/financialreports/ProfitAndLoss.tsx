import { useSettings } from "@/hooks/useSettings";
import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { parseLineItems } from '../../saleinvoices/utils';

interface ProfitAndLossProps {
  onBack: () => void;
}



export function ProfitAndLoss({ onBack }: ProfitAndLossProps) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [sales, setSales] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });
  const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
  const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;


  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [salesRes, purchasesRes, expensesRes, itemsRes] = await Promise.all([
          fetch("/api/sale_invoices").catch(() => null),
          fetch("/api/purchase_bills").catch(() => null),
          fetch("/api/expense_records").catch(() => null),
          fetch("/api/items").catch(() => null),
        ]);

        if (salesRes && salesRes.ok) setSales(await salesRes.json());
        if (purchasesRes && purchasesRes.ok) setPurchases(await purchasesRes.json());
        if (expensesRes && expensesRes.ok) setExpenses(await expensesRes.json());
        if (itemsRes && itemsRes.ok) setItems(await itemsRes.json());

      } catch (error) {
        console.error("Failed to load profit and loss data", error);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const stats = useMemo(() => {
    const parseLocalDate = (dStr: string) => {
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

    const filterByDate = (record: any) => {
      if (!dateFrom && !dateTo) return true;
      const recordDateStr = record.date;
      if (!recordDateStr) return true;

      const recordTime = parseLocalDate(recordDateStr).getTime();

      if (dateFrom) {
        if (recordTime < parseLocalDate(dateFrom).getTime()) return false;
      }
      if (dateTo) {
        const to = parseLocalDate(dateTo);
        to.setHours(23, 59, 59, 999);
        if (recordTime > to.getTime()) return false;
      }
      return true;
    };

    const filteredSales = sales.filter(filterByDate);
    const filteredPurchases = purchases.filter(filterByDate);
    const filteredExpenses = expenses.filter(filterByDate);

    const totalSalesAmount = filteredSales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
    const totalPurchasesAmount = filteredPurchases.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const totalExpensesAmount = filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const itemPurchasePriceMap = new Map<string, number>();
    items.forEach(item => {
      itemPurchasePriceMap.set(String(item.id), Number(item.purchase_price || 0));
    });

    let grossProfit = 0;

    filteredSales.forEach(sale => {
      const lineItems = parseLineItems(sale.line_items_json);

      lineItems.forEach((item: any) => {
        const itemId = String(item.itemId);
        const qty = Number(item.quantity || item.qty || 0);
        const invoiceSalePrice = Number(item.price || 0);
        const purchasePrice = itemPurchasePriceMap.get(itemId) || 0;

        // Calculate gross profit for this specific item based on its sale price in the invoice
        grossProfit += (invoiceSalePrice - purchasePrice) * qty;
      });

      // Subtract any invoice-level discount to get the true net gross profit
      const discount = Number(sale.discount_amount || 0);
      grossProfit -= discount;
    });

    const netProfit = grossProfit - totalExpensesAmount;

    return {
      totalSalesAmount,
      totalPurchasesAmount,
      totalExpensesAmount,
      grossProfit,
      netProfit
    };
  }, [sales, purchases, expenses, items, dateFrom, dateTo]);

  const formatAmount = (value: number) =>
    `${currencyStr}${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Rows shown in the statement table, in the order they should appear.
  const rows: { label: string; amount: number; positive: boolean }[] = [
    { label: 'Sale (+)', amount: stats.totalSalesAmount, positive: true },
    { label: 'Purchase (-)', amount: stats.totalPurchasesAmount, positive: false },
    { label: 'Expenses (-)', amount: stats.totalExpensesAmount, positive: false },
  ];

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Profit & Loss Report</h1>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
            <span className="text-sm text-gray-500">From</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-transparent text-sm font-medium text-blue-600 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
            <span className="text-sm text-gray-500">To</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-transparent text-sm font-medium text-blue-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                  <th className="text-left font-medium px-[40px] py-3">Particulars</th>
                  <th className="text-right font-medium px-[40px] py-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr
                    key={row.label}
                    className={`text-[15px] border-b border-gray-100 ${idx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}`}
                  >
                    <td className="px-[40px] py-4 text-gray-700">{row.label}</td>
                    <td className={`px-[40px] py-4 text-right font-medium ${row.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                      {formatAmount(row.amount)}
                    </td>
                  </tr>
                ))}

                <tr className="bg-gray-50/50 border-b border-gray-200">
                  <td className="px-[40px] py-4 text-gray-900 font-semibold">
                    {stats.grossProfit >= 0 ? 'Gross Profit' : 'Gross Loss'}
                  </td>
                  <td className={`px-[40px] py-4 text-right font-semibold ${stats.grossProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {formatAmount(stats.grossProfit)}
                  </td>
                </tr>

                <tr className="bg-white">
                  <td className="px-[40px] py-4 text-gray-900 font-bold text-lg">
                    {stats.netProfit >= 0 ? 'Net Profit' : 'Net Loss'}
                  </td>
                  <td className={`px-[40px] py-4 text-right font-bold text-lg ${stats.netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {formatAmount(stats.netProfit)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}