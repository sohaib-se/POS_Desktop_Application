import { StatsCards } from "../components/pagescomponents/dashboard/StatsCards";
import { SalesChart } from "../components/pagescomponents/dashboard/SalesChart";
import { MostUsedReports } from "../components/pagescomponents/dashboard/MostUsedReports";

export function Dashboard() {
  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <StatsCards />

      <div className="grid grid-cols-3 gap-6">
        <SalesChart />
        <MostUsedReports />
      </div>
    </div>
  );
}
