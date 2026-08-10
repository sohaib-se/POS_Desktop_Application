import { ChevronRight } from "lucide-react";
import type { ReportCategory } from "./types";

interface ReportsListProps {
  categories: ReportCategory[];
  onReportClick?: (categoryName: string, reportName: string) => void;
}

export function ReportsList({ categories, onReportClick }: ReportsListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="grid grid-cols-2 gap-4">
        {categories.map((category, idx) => {
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
                    onClick={() => onReportClick?.(category.name, reportName)}
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
  );
}
