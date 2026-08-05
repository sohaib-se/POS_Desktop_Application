import { ChevronRight } from "lucide-react";

export function MostUsedReports() {
  return (
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
  );
}
