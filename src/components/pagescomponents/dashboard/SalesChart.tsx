import { useEffect, useState, useMemo } from "react";
import { TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getMonthKeyFromDate, formatDateDisplay } from "../saleinvoices/utils";

export function SalesChart() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>("");

  useEffect(() => {
    async function fetchSales() {
      try {
        const response = await fetch('/api/sale_invoices');
        if (!response.ok) return;
        const fetchedInvoices = await response.json();
        setInvoices(fetchedInvoices);
        
        // Find current month key
        const currentMonthKey = getMonthKeyFromDate(formatDateDisplay(new Date()));
        const hasCurrentMonth = fetchedInvoices.some((inv: any) => getMonthKeyFromDate(inv.date) === currentMonthKey);
        
        if (hasCurrentMonth) {
          setSelectedMonthKey(currentMonthKey);
        } else if (fetchedInvoices.length > 0) {
          setSelectedMonthKey(getMonthKeyFromDate(fetchedInvoices[0].date));
        }

      } catch (error) {
        console.error("Failed to fetch sales for chart:", error);
      }
    }

    fetchSales();
  }, []);

  const { totalSale, chartData } = useMemo(() => {
    let total = 0;
    const salesByDate: Record<string, number> = {};

    const filteredInvoices = selectedMonthKey
      ? invoices.filter((inv) => getMonthKeyFromDate(inv.date) === selectedMonthKey)
      : invoices;

    filteredInvoices.forEach((invoice: any) => {
      const amount = Number(invoice.amount ?? 0);
      total += amount;

      let dateObj: Date;
      if (invoice.date.includes('/')) {
        const parts = invoice.date.split('/');
        if (parts.length === 3 && parts[2].length === 4) {
          dateObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        } else {
          dateObj = new Date(invoice.date);
        }
      } else {
        dateObj = new Date(invoice.date);
      }

      let dateStr = invoice.date;
      if (!isNaN(dateObj.getTime())) {
        dateStr = dateObj.toLocaleDateString("en-US", { day: 'numeric', month: 'short' });
      }
      
      if (!salesByDate[dateStr]) {
        salesByDate[dateStr] = 0;
      }
      salesByDate[dateStr] += amount;
    });

    const sortedData = Object.keys(salesByDate)
      .map(date => ({
        date,
        value: salesByDate[date]
      }))
      .sort((a, b) => new Date(a.date + " 2026").getTime() - new Date(b.date + " 2026").getTime());

    return {
      totalSale: total,
      chartData: sortedData.length > 0 ? sortedData : [{ date: "No Data", value: 0 }]
    };
  }, [invoices, selectedMonthKey]);

  return (
    <div className="col-span-2 stat-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500">Total Sale</p>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-2xl font-bold text-gray-900">Rs {totalSale.toLocaleString()}</p>
            {totalSale > 0 && (
              <span className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3" />
                Updated
              </span>
            )}
          </div>
        </div>
        
        <div className="relative">
          <input 
            type="month"
            value={selectedMonthKey}
            onChange={(e) => setSelectedMonthKey(e.target.value)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-600 hover:bg-gray-200 border-none outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E53935" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#E53935" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              formatter={(value: any) => [`Rs ${value}`, "Amount"]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#E53935"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
