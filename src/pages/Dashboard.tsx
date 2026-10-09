import { useState } from "react";
import { Plus } from "lucide-react";
import { StatsCards } from "../components/pagescomponents/dashboard/StatsCards";
import { SalesChart } from "../components/pagescomponents/dashboard/SalesChart";
import { MostUsedReports } from "../components/pagescomponents/dashboard/MostUsedReports";
import { LowStockItemsCard } from "../components/pagescomponents/dashboard/LowStockItemsCard";
import { EmptyDashboard } from "../components/pagescomponents/dashboard/EmptyDashboard";
import { CustomizeDashboardModal } from "../components/pagescomponents/dashboard/CustomizeDashboardModal";
import { useSettings } from "../hooks/useSettings";
import type { ViewType } from "@/types";

export function Dashboard({ 
  onViewChange, 
  onOpenReport 
}: { 
  onViewChange?: (view: ViewType) => void;
  onOpenReport?: (category: string, name: string) => void;
}) {
  const [showTodaySales] = useSettings("show_card_today_sales", true);
  const [showTodayProfit] = useSettings("show_card_today_profit", true);
  const [showReceivable] = useSettings("show_card_total_receivable", true);
  const [showPayable] = useSettings("show_card_total_payable", true);
  const [showSalesChart] = useSettings("show_card_total_sales_chart", true);
  const [showMostUsed] = useSettings("show_card_most_used_reports", true);
  const [showLowStock] = useSettings("show_card_low_stock", true);

  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);

  const hasAnyCard = Boolean(
    showTodaySales ||
    showTodayProfit ||
    showReceivable ||
    showPayable ||
    showSalesChart ||
    showMostUsed ||
    showLowStock
  );

  if (!hasAnyCard) {
    return (
      <div className="h-full bg-slate-50/40 flex flex-col overflow-y-auto">
        <EmptyDashboard onAddWidget={() => setIsCustomizeModalOpen(true)} />
        <CustomizeDashboardModal
          isOpen={isCustomizeModalOpen}
          onClose={() => setIsCustomizeModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between pb-1">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
        </div>
        <button
          type="button"
          onClick={() => setIsCustomizeModalOpen(true)}
          className="bg-[#1976D2] hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm hover:shadow transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Customize Cards</span>
        </button>
      </div>

      <StatsCards />

      <div className="grid grid-cols-3 gap-6">
        {showSalesChart && <SalesChart />}
        {showMostUsed && <MostUsedReports onViewChange={onViewChange} onOpenReport={onOpenReport} />}
        {showLowStock && <LowStockItemsCard onOpenReport={onOpenReport} />}
      </div>

      <CustomizeDashboardModal
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
      />
    </div>
  );
}
