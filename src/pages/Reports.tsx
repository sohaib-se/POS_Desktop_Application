import { useState } from 'react';
import { Search, ChevronRight, FileText, BarChart2, Users, Package } from 'lucide-react';

export function Reports() {
  const [searchTerm, setSearchTerm] = useState('');

  const reportCategories = [
    { name: 'Transaction report', icon: FileText, reports: ['Sale', 'Purchase', 'Day book', 'All Transactions'] },
    { name: 'Financial Reports', icon: BarChart2, reports: ['Profit And Loss', 'Bill Wise Profit', 'Cash flow', 'Trial Balance Report', 'Balance Sheet'] },
    { name: 'Party Reports', icon: Users, reports: ['Party report', 'Party Statement', 'Party wise Profit & Loss', 'All parties', 'Party Report By Item'] },
    { name: 'Item/Stock Reports', icon: Package, reports: ['Sale Purchase By Party', 'Sale Purchase By Party Group'] },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]"
          />
        </div>
      </div>

      {/* Reports List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-4">
          {reportCategories.map((category, idx) => {
            const Icon = category.icon;
            return (
              <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {category.reports.map((reportName, ridx) => (
                    <div 
                      key={ridx}
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <span className="text-sm text-gray-700">{reportName}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
