import { ArrowDown, ArrowUp, TrendingUp, ChevronRight } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { chartData } from "@/data/mockData";

export function Dashboard() {
  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-6">
        {/* Total Receivable */}
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Receivable</p>
              <p className="text-2xl font-bold text-gray-900">Rs 200</p>
              <p className="text-xs text-gray-500 mt-1">From 1 Party</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <ArrowDown className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Payable */}
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Payable</p>
              <p className="text-2xl font-bold text-gray-900">Rs 100</p>
              <p className="text-xs text-gray-500 mt-1">From 1 Party</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <ArrowUp className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Sales Chart Section */}
      <div className="grid grid-cols-3 gap-6">
        {/* Total Sale */}
        <div className="col-span-2 stat-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Total Sale</p>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-2xl font-bold text-gray-900">Rs 1,720</p>
                <span className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  177% more than last month
                </span>
              </div>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-600 hover:bg-gray-200">
              This Month
              <ChevronRight className="w-4 h-4" />
            </button>
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
                  formatter={(value) => [`Rs ${value}`, "Amount"]}
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

        {/* Most Used Reports */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-900">
              Most Used Reports
            </p>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {[
              "Sale Report",
              "All Transactions",
              "Daybook Report",
              "First Party Statement",
            ].map((report, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <span className="text-sm text-gray-700">{report}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
          <button className="w-full mt-4 p-3 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2">
            <span className="text-lg">+</span>
            Add Widget of Your Choice
          </button>
        </div>
      </div>
    </div>
  );
}
