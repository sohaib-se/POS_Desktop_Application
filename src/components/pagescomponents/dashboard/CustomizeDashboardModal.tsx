import { useState } from "react";
import { createPortal } from "react-dom";
import { useSettings } from "@/hooks/useSettings";
import { toast } from "@/components/ui/Toast";
import {
  X,
  Check,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  BarChart3,
  FileText,
  AlertTriangle,
  LayoutDashboard,
} from "lucide-react";

interface CustomizeDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomizeDashboardModal({
  isOpen,
  onClose,
}: CustomizeDashboardModalProps) {
  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <CustomizeModalContent onClose={onClose} />,
    document.body
  );
}

function CustomizeModalContent({ onClose }: { onClose: () => void }) {
  const [showTodaySales, setShowTodaySales] = useSettings("show_card_today_sales", true);
  const [showTodayProfit, setShowTodayProfit] = useSettings("show_card_today_profit", true);
  const [showReceivable, setShowReceivable] = useSettings("show_card_total_receivable", true);
  const [showPayable, setShowPayable] = useSettings("show_card_total_payable", true);
  const [showSalesChart, setShowSalesChart] = useSettings("show_card_total_sales_chart", true);
  const [showMostUsed, setShowMostUsed] = useSettings("show_card_most_used_reports", true);
  const [showLowStock, setShowLowStock] = useSettings("show_card_low_stock", true);

  // Temporary selection state initialized fresh from settings on mount
  const [tempSelection, setTempSelection] = useState<Record<string, boolean>>({
    show_card_today_sales: showTodaySales,
    show_card_today_profit: showTodayProfit,
    show_card_total_receivable: showReceivable,
    show_card_total_payable: showPayable,
    show_card_total_sales_chart: showSalesChart,
    show_card_most_used_reports: showMostUsed,
    show_card_low_stock: showLowStock,
  });

  const cardsList = [
    {
      group: "Stat Cards",
      items: [
        {
          key: "show_card_today_sales",
          label: "Today's Sales",
          description: "Monitor total sales generated during today's operations",
          icon: TrendingUp,
          color: "text-blue-600",
          bgColor: "bg-blue-50 border-blue-100",
        },
        {
          key: "show_card_today_profit",
          label: "Today's Profit",
          description: "Real-time calculation of today's gross profit margin",
          icon: ArrowUpRight,
          color: "text-indigo-600",
          bgColor: "bg-indigo-50 border-indigo-100",
        },
        {
          key: "show_card_total_receivable",
          label: "Total Receivable",
          description: "Outstanding balances owed to your business by customers",
          icon: ArrowDownLeft,
          color: "text-emerald-600",
          bgColor: "bg-emerald-50 border-emerald-100",
        },
        {
          key: "show_card_total_payable",
          label: "Total Payable",
          description: "Pending payments your business owes to suppliers",
          icon: ArrowUpRight,
          color: "text-rose-600",
          bgColor: "bg-rose-50 border-rose-100",
        },
      ],
    },
    {
      group: "Analytics & Overview Cards",
      items: [
        {
          key: "show_card_total_sales_chart",
          label: "Total Sales Chart",
          description: "Visual sales trend graph and daily revenue analytics",
          icon: BarChart3,
          color: "text-sky-600",
          bgColor: "bg-sky-50 border-sky-100",
        },
        {
          key: "show_card_most_used_reports",
          label: "Most Used Reports",
          description: "Fast shortcuts to your 5 most frequently used reports",
          icon: FileText,
          color: "text-purple-600",
          bgColor: "bg-purple-50 border-purple-100",
        },
        {
          key: "show_card_low_stock",
          label: "Low Stock Items",
          description: "Real-time warnings for items near or below stock thresholds",
          icon: AlertTriangle,
          color: "text-amber-600",
          bgColor: "bg-amber-50 border-amber-100",
        },
      ],
    },
  ];

  const allItems = cardsList.flatMap((g) => g.items);
  const activeCount = allItems.filter((i) => tempSelection[i.key]).length;
  const totalCount = allItems.length;

  const toggleCard = (key: string) => {
    setTempSelection((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectAll = () => {
    setTempSelection({
      show_card_today_sales: true,
      show_card_today_profit: true,
      show_card_total_receivable: true,
      show_card_total_payable: true,
      show_card_total_sales_chart: true,
      show_card_most_used_reports: true,
      show_card_low_stock: true,
    });
  };

  const handleClearAll = () => {
    setTempSelection({
      show_card_today_sales: false,
      show_card_today_profit: false,
      show_card_total_receivable: false,
      show_card_total_payable: false,
      show_card_total_sales_chart: false,
      show_card_most_used_reports: false,
      show_card_low_stock: false,
    });
  };

  const handleSave = () => {
    Object.entries(tempSelection).forEach(([key, val]) => {
      try {
        localStorage.setItem(key, JSON.stringify(val));
        window.dispatchEvent(
          new CustomEvent('settings-updated', { detail: { key, value: val } })
        );
      } catch (err) {
        console.error("Failed to save setting:", key, err);
      }
    });

    setShowTodaySales(tempSelection.show_card_today_sales);
    setShowTodayProfit(tempSelection.show_card_today_profit);
    setShowReceivable(tempSelection.show_card_total_receivable);
    setShowPayable(tempSelection.show_card_total_payable);
    setShowSalesChart(tempSelection.show_card_total_sales_chart);
    setShowMostUsed(tempSelection.show_card_most_used_reports);
    setShowLowStock(tempSelection.show_card_low_stock);
    toast.success("Dashboard cards updated successfully!");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[200] w-screen h-screen flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col border border-gray-100 overflow-hidden transform transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Add Dashboard Cards
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {activeCount} of {totalCount} Selected
                </span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Select cards and click Save to update your dashboard
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick action bar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-gray-50/60 border-b border-gray-100 text-xs">
          <span className="text-gray-500 font-medium">Quick Selection:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              Select All
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-gray-500 hover:text-gray-700 font-medium hover:underline"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Modal Body / Cards List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {cardsList.map((group) => (
            <div key={group.group} className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                {group.group}
              </h4>
              <div className="space-y-2">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isChecked = Boolean(tempSelection[item.key]);
                  return (
                    <div
                      key={item.key}
                      onClick={() => toggleCard(item.key)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-150 cursor-pointer select-none ${
                        isChecked
                          ? "bg-blue-50/40 border-blue-200 shadow-sm"
                          : "bg-white hover:bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 pr-3">
                        <div
                          className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${item.bgColor}`}
                        >
                          <Icon className={`w-4 h-4 ${item.color}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 leading-tight">
                            {item.label}
                          </p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Animated Toggle Switch */}
                      <div
                        className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 shrink-0 ${
                          isChecked ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                            isChecked ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-500">
            Click Save to apply your selection
          </p>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-[#1976D2] hover:bg-blue-600 active:scale-95 text-white text-sm font-medium shadow-sm hover:shadow transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
