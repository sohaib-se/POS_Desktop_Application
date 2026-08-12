import { StatsCards } from "../components/pagescomponents/dashboard/StatsCards";
import { SalesChart } from "../components/pagescomponents/dashboard/SalesChart";
import { MostUsedReports } from "../components/pagescomponents/dashboard/MostUsedReports";

import { LowStockItemsCard } from "../components/pagescomponents/dashboard/LowStockItemsCard";
import { useSettings } from "../hooks/useSettings";

export function Dashboard() {
  const [showSalesChart] = useSettings("show_card_total_sales_chart", true);
  const [showMostUsed] = useSettings("show_card_most_used_reports", true);
  const [showLowStock] = useSettings("show_card_low_stock", true);

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <StatsCards />

      <div className="grid grid-cols-3 gap-6">
        {showSalesChart && <SalesChart />}
        {showMostUsed && <MostUsedReports />}
        {showLowStock && <LowStockItemsCard />}
      </div>
    </div>
  );
}
