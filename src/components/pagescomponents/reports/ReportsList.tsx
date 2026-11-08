import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ReportCategory } from "./types";

interface ReportsListProps {
  categories: ReportCategory[];
  onReportClick?: (categoryName: string, reportName: string) => void;
}

export function ReportsList({ categories, onReportClick }: ReportsListProps) {
  const { t } = useTranslation();

  const getCategoryTitle = (name: string) => {
    switch (name) {
      case "Transaction report":
        return t("reports.categories.transaction", name);
      case "Financial Reports":
        return t("reports.categories.financial", name);
      case "Party Reports":
        return t("reports.categories.parties", name);
      case "Item/Stock Reports":
        return t("reports.categories.stock", name);
      default:
        return name;
    }
  };

  const getReportTitle = (name: string) => {
    switch (name) {
      case "Sale":
        return t("reports.names.sale", name);
      case "Purchase":
        return t("reports.names.purchase", name);
      case "Day book":
        return t("reports.names.daybook", name);
      case "All Transactions":
        return t("reports.names.allTransactions", name);
      case "Profit And Loss":
        return t("reports.names.profitAndLoss", name);
      case "Bill Wise Profit":
        return t("reports.names.billWiseProfit", name);
      case "All parties":
        return t("reports.names.allParties", name);
      case "Party report":
        return t("reports.names.partyReport", name);
      case "Sale Purchase By Party":
        return t("reports.names.salePurchaseByParty", name);
      case "Low stock details":
        return t("reports.names.lowStockDetails", name);
      case "Stock details":
        return t("reports.names.stockDetails", name);
      default:
        return name;
    }
  };

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
                  <span className="font-medium text-gray-900">{getCategoryTitle(category.name)}</span>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {category.reports.map((reportName, ridx) => (
                  <div 
                    key={ridx}
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onReportClick?.(category.name, reportName)}
                  >
                    <span className="text-sm text-gray-700">{getReportTitle(reportName)}</span>
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

