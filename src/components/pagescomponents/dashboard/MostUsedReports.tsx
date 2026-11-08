import { useState } from "react";
import { ChevronRight, MinusCircle, X } from "lucide-react";
import { useSettings } from "../../../hooks/useSettings";
import { useTranslation } from "react-i18next";

const AVAILABLE_REPORTS = [
  "Sale",
  "Purchase",
  "Day book",
  "All Transactions",
  "Profit And Loss",
  "Bill Wise Profit",
  "Party Reports",
  "All parties",
  "Sale Purchase By Party",
  "Low stock details",
  "Stock details"
];

const REPORT_MAPPING: Record<string, { category: string; name: string }> = {
  "Sale": { category: "Transaction report", name: "Sale" },
  "Purchase": { category: "Transaction report", name: "Purchase" },
  "Day book": { category: "Transaction report", name: "Day book" },
  "All Transactions": { category: "Transaction report", name: "All Transactions" },
  "Profit And Loss": { category: "Financial Reports", name: "Profit And Loss" },
  "Bill Wise Profit": { category: "Financial Reports", name: "Bill Wise Profit" },
  "Party Reports": { category: "Party Reports", name: "Party report" },
  "All parties": { category: "Party Reports", name: "All parties" },
  "Sale Purchase By Party": { category: "Item/Stock Reports", name: "Sale Purchase By Party" },
  "Low stock details": { category: "Item/Stock Reports", name: "Low stock details" },
  "Stock details": { category: "Item/Stock Reports", name: "Stock details" },
};

export function MostUsedReports({ 
  onViewChange,
  onOpenReport
}: { 
  onViewChange?: (view: any) => void;
  onOpenReport?: (category: string, name: string) => void;
}) {
  const { t } = useTranslation();
  const [selectedReports, setSelectedReports] = useSettings<string[]>("dashboard_most_used_reports", [
    "Sale",
    "Purchase",
    "Day book",
    "All Transactions",
  ]);

  const getReportTitle = (report: string) => {
    switch (report) {
      case "Sale": return t("reports.names.sale", "Sale");
      case "Purchase": return t("reports.names.purchase", "Purchase");
      case "Day book": return t("reports.names.daybook", "Day book");
      case "All Transactions": return t("reports.names.allTransactions", "All Transactions");
      case "Profit And Loss": return t("reports.names.profitAndLoss", "Profit And Loss");
      case "Bill Wise Profit": return t("reports.names.billWiseProfit", "Bill Wise Profit");
      case "Party Reports":
      case "Party report": return t("reports.names.partyReport", "Party report");
      case "All parties": return t("reports.names.allParties", "All parties");
      case "Sale Purchase By Party": return t("reports.names.salePurchaseByParty", "Sale Purchase By Party");
      case "Low stock details": return t("reports.names.lowStockDetails", "Low stock details");
      case "Stock details": return t("reports.names.stockDetails", "Stock details");
      default: return report;
    }
  };
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [tempSelected, setTempSelected] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const openPopup = () => {
    setTempSelected([...selectedReports]);
    setErrorMsg(null);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setErrorMsg(null);
  };

  const handleToggleReport = (report: string) => {
    if (tempSelected.includes(report)) {
      setTempSelected(tempSelected.filter((r) => r !== report));
      setErrorMsg(null);
    } else {
      if (tempSelected.length < 5) {
        setTempSelected([...tempSelected, report]);
        setErrorMsg(null);
      } else {
        setErrorMsg(t("dashboard.maxReportsError", "You can only select up to 5 reports."));
      }
    }
  };

  const saveReports = () => {
    setSelectedReports(tempSelected);
    closePopup();
  };

  const removeReport = (report: string) => {
    setSelectedReports(selectedReports.filter((r) => r !== report));
  };

  return (
    <>
      <div className="stat-card relative">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-gray-900">
            {t("dashboard.mostUsedReports", "Most Used Reports")}
          </p>
          <button 
            className="text-sm text-blue-600 hover:text-blue-700"
            onClick={() => onViewChange?.("reports")}
          >
            {t("dashboard.viewAll", "View All")}
          </button>
        </div>
        <div className="space-y-3">
          {selectedReports.map((report, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors group"
              onClick={() => {
                const mapped = REPORT_MAPPING[report];
                if (mapped && onOpenReport) {
                  onOpenReport(mapped.category, mapped.name);
                } else {
                  onViewChange?.("reports");
                }
              }}
            >
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm text-gray-700">{getReportTitle(report)}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeReport(report);
                  }}
                  className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title={t("dashboard.removeReport", "Remove report")}
                >
                  <MinusCircle className="w-4 h-4" />
                </button>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))}
          {selectedReports.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-4">
              {t("dashboard.noReportsSelected", "No reports selected. Add some below.")}
            </div>
          )}
        </div>
        {selectedReports.length < 5 && (
          <button
            onClick={openPopup}
            className="w-full mt-4 p-3 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-lg">+</span>
            {t("dashboard.addWidgetOfChoice", "Add Widget of Your Choice")}
          </button>
        )}
      </div>

      {isPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t("dashboard.selectReportsModalTitle", "Select up to 5 reports to add to this widget")}
              </h3>
              <button
                onClick={closePopup}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center justify-between">
                <span>{errorMsg}</span>
                <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto space-y-2 mb-6 pr-2">
              {AVAILABLE_REPORTS.map((report) => (
                <label
                  key={report}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-100"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    checked={tempSelected.includes(report)}
                    onChange={() => handleToggleReport(report)}
                  />
                  <span className="text-sm text-gray-700">{getReportTitle(report)}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={closePopup}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                {t("common.cancel", "Cancel")}
              </button>
              <button
                onClick={saveReports}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                {t("dashboard.addReports", "Add Reports")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
