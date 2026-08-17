import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

export function StatsCards() {
  const [totalReceivable, setTotalReceivable] = useState(0);
  const [receivableParties, setReceivableParties] = useState(0);
  const [totalPayable, setTotalPayable] = useState(0);
  const [payableParties, setPayableParties] = useState(0);
  const [todaySales, setTodaySales] = useState(0);
  const [todayProfit, setTodayProfit] = useState(0);

  const [showTodaySales] = useSettings("show_card_today_sales", true);
  const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });
  const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
  const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;
  const [showTodayProfit] = useSettings("show_card_today_profit", true);
  const [showReceivable] = useSettings("show_card_total_receivable", true);
  const [showPayable] = useSettings("show_card_total_payable", true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [partiesRes, salesRes, itemsRes] = await Promise.all([
          fetch('/api/parties'),
          fetch('/api/sale_invoices'),
          fetch('/api/items')
        ]);

        if (partiesRes.ok) {
          const dbParties = await partiesRes.json();
          let receivable = 0;
          let receivableCount = 0;
          let payable = 0;
          let payableCount = 0;

          dbParties.forEach((party: any) => {
            const balance = Number(party.balance ?? 0);
            if (balance > 0) {
              receivable += balance;
              receivableCount++;
            } else if (balance < 0) {
              payable += Math.abs(balance);
              payableCount++;
            }
          });

          setTotalReceivable(receivable);
          setReceivableParties(receivableCount);
          setTotalPayable(payable);
          setPayableParties(payableCount);
        }

        if (salesRes.ok && itemsRes.ok) {
          const sales = await salesRes.json();
          const items = await itemsRes.json();
          
          const itemPurchasePriceMap = new Map<string, number>();
          items.forEach((item: any) => {
              itemPurchasePriceMap.set(String(item.id), Number(item.purchase_price ?? 0));
          });

          const todayStr = new Date().toDateString();
          let tSales = 0;
          let tProfit = 0;

          sales.forEach((sale: any) => {
            let dateObj: Date;
            if (sale.date.includes('/')) {
              const parts = sale.date.split('/');
              if (parts.length === 3 && parts[2].length === 4) {
                dateObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
              } else {
                dateObj = new Date(sale.date);
              }
            } else {
              dateObj = new Date(sale.date);
            }

            if (!isNaN(dateObj.getTime()) && dateObj.toDateString() === todayStr) {
              let totalCost = 0;
              let lineItems = [];
              try {
                lineItems = JSON.parse(sale.line_items_json || "[]");
              } catch (e) {
                lineItems = [];
              }
              
              lineItems.forEach((item: any) => {
                const itemId = String(item.itemId);
                const qty = Number(item.quantity || item.qty || 0);
                const cost = itemPurchasePriceMap.get(itemId) || 0;
                totalCost += (qty * cost);
              });

              const subtotal = Number(sale.subtotal || sale.amount || 0);
              const discount = Number(sale.discount_amount || 0);
              const netSaleAmount = subtotal - discount;
              const profit = netSaleAmount - totalCost;

              tSales += netSaleAmount;
              tProfit += profit;
            }
          });

          setTodaySales(tSales);
          setTodayProfit(tProfit);
        }

      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    }

    fetchStats();
  }, []);

  if (!showTodaySales && !showTodayProfit && !showReceivable && !showPayable) return null;

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Today's Sales */}
      {showTodaySales && (
      <div className="stat-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Today's Sales</p>
            <p className="text-2xl font-bold text-gray-900">{currencyStr} {todaySales.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
            <p className="text-xs text-gray-500 mt-1">For Today</p>
          </div>
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <ArrowUp className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>
      )}

      {/* Today's Profit */}
      {showTodayProfit && (
      <div className="stat-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Today's Profit</p>
            <p className="text-2xl font-bold text-gray-900">{currencyStr} {todayProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
            <p className="text-xs text-gray-500 mt-1">For Today</p>
          </div>
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <ArrowUp className="w-5 h-5 text-indigo-600" />
          </div>
        </div>
      </div>
      )}

      {/* Total Receivable */}
      {showReceivable && (
      <div className="stat-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Receivable</p>
            <p className="text-2xl font-bold text-gray-900">{currencyStr} {totalReceivable.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">From {receivableParties} Part{receivableParties === 1 ? 'y' : 'ies'}</p>
          </div>
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <ArrowDown className="w-5 h-5 text-green-600" />
          </div>
        </div>
      </div>
      )}

      {/* Total Payable */}
      {showPayable && (
      <div className="stat-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Payable</p>
            <p className="text-2xl font-bold text-gray-900">{currencyStr} {totalPayable.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">From {payableParties} Part{payableParties === 1 ? 'y' : 'ies'}</p>
          </div>
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <ArrowUp className="w-5 h-5 text-red-600" />
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
