import { useState } from "react";
import { ChevronRight, MinusCircle, X } from "lucide-react";

const AVAILABLE_REPORTS = [
  "Sale",
  "Purchase",
  "Day book",
  "All Transactions",
  "Profit And Loss",
  "Bill Wise Profit",
  "Cash flow",
  "Party Reports",
  "All parties",
  "Party wise Profit & Loss",
  "Party Report By Item",
  "Sale Purchase By Party",
  "Low stock details",
  "Stock details",
  "Stock In/Stock out Details"
];

const REPORT_MAPPING: Record<string, { category: string; name: string }> = {
  "Sale": { category: "Transaction report", name: "Sale" },
  "Purchase": { category: "Transaction report", name: "Purchase" },
  "Day book": { category: "Transaction report", name: "Day book" },
  "All Transactions": { category: "Transaction report", name: "All Transactions" },
  "Profit And Loss": { category: "Financial Reports", name: "Profit And Loss" },
  "Bill Wise Profit": { category: "Financial Reports", name: "Bill Wise Profit" },
  "Cash flow": { category: "Financial Reports", name: "Cash flow" },
  "Party Reports": { category: "Party Reports", name: "Party report" },
  "All parties": { category: "Party Reports", name: "All parties" },
  "Party wise Profit & Loss": { category: "Party Reports", name: "Party wise Profit & Loss" },
  "Party Report By Item": { category: "Party Reports", name: "Party Report By Item" },
  "Sale Purchase By Party": { category: "Item/Stock Reports", name: "Sale Purchase By Party" },
  "Low stock details": { category: "Item/Stock Reports", name: "Low stock details" },
  "Stock details": { category: "Item/Stock Reports", name: "Stock details" },
  "Stock In/Stock out Details": { category: "Item/Stock Reports", name: "Stock In/Stock out Details" },
};

export function MostUsedReports({ 
  onViewChange,
  onOpenReport
}: { 
  onViewChange?: (view: any) => void;
  onOpenReport?: (category: string, name: string) => void;
}) {
  const [selectedReports, setSelectedReports] = useState<string[]>([
    "Sale",
    "Purchase",
    "Day book",
    "All Transactions",
  ]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [tempSelected, setTempSelected] = useState<string[]>([]);

  const openPopup = () => {
    setTempSelected([...selectedReports]);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const handleToggleReport = (report: string) => {
    if (tempSelected.includes(report)) {
      setTempSelected(tempSelected.filter((r) => r !== report));
    } else {
      if (tempSelected.length < 5) {
        setTempSelected([...tempSelected, report]);
      } else {
        alert("You can only select up to 5 reports.");
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
            Most Used Reports
          </p>
          <button 
            className="text-sm text-blue-600 hover:text-blue-700"
            onClick={() => onViewChange?.("reports")}
          >
            View All
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
                <span className="text-sm text-gray-700">{report}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeReport(report);
                  }}
                  className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove report"
                >
                  <MinusCircle className="w-4 h-4" />
                </button>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))}
          {selectedReports.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-4">
              No reports selected. Add some below.
            </div>
          )}
        </div>
        {selectedReports.length < 5 && (
          <button
            onClick={openPopup}
            className="w-full mt-4 p-3 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-lg">+</span>
            Add Widget of Your Choice
          </button>
        )}
      </div>

      {isPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                select 5 reports page to add to this most recent widget
              </h3>
              <button
                onClick={closePopup}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
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
                  <span className="text-sm text-gray-700">{report}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={closePopup}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={saveReports}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Add Reports
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
