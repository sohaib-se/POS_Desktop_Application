import {
  Plus,
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  FileText,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";

interface EmptyDashboardProps {
  onAddWidget: () => void;
}

export function EmptyDashboard({ onAddWidget }: EmptyDashboardProps) {
  const PREVIEW_CARDS = [
    { label: "Today's Sales", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Today's Profit", icon: ArrowUpRight, color: "text-indigo-500", bg: "bg-indigo-50" },
    { label: "Receivables", icon: ArrowDownLeft, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Sales Chart", icon: BarChart3, color: "text-sky-500", bg: "bg-sky-50" },
    { label: "Most Used Reports", icon: FileText, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Low Stock Items", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50" },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 min-h-full">
      <div className="w-full max-w-2xl flex flex-col items-center text-center animate-fadeIn">
        {/* Header Icon / Badge */}
        <div className="relative mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/80 shadow-sm flex items-center justify-center text-blue-600">
            <LayoutDashboard className="w-8 h-8 stroke-[1.75]" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md border-2 border-white">
            <Layers className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Headline & Description */}
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
          Your Dashboard is Empty
        </h2>
        <p className="text-sm text-gray-500 mt-2 max-w-md leading-relaxed">
          No cards or widgets are currently enabled. Add widgets to monitor sales, profits, cash balances, reports, and stock alerts in real-time.
        </p>

        {/* ── Prominent "+ Add Widget" Entrance Card ── */}
        <div className="w-full max-w-md mt-8">
          <button
            type="button"
            onClick={onAddWidget}
            className="group relative w-full flex flex-col items-center justify-center p-8 bg-white hover:bg-blue-50/30 border-2 border-dashed border-[#1976D2]/30 hover:border-[#1976D2] rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.99]"
          >
            {/* Plus Icon Badge */}
            <div className="w-14 h-14 rounded-full bg-[#1976D2] group-hover:bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform duration-200 mb-3.5">
              <Plus className="w-7 h-7 stroke-[2.5]" />
            </div>

            <span className="text-base font-bold text-gray-900 group-hover:text-[#1976D2] transition-colors">
              Add Widget
            </span>
            <span className="text-xs text-gray-400 mt-1">
              Click to choose and configure cards from settings
            </span>
          </button>
        </div>

        {/* Quick preview badges */}
        <div className="mt-8 pt-6 border-t border-gray-100 w-full max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Available Widgets from Settings
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {PREVIEW_CARDS.map(({ label, icon: Icon, color, bg }) => (
              <button
                key={label}
                type="button"
                onClick={onAddWidget}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-blue-300 text-gray-700 text-xs font-medium transition-all shadow-xs group"
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center ${bg} shrink-0`}>
                  <Icon className={`w-3 h-3 ${color}`} />
                </div>
                <span className="group-hover:text-blue-600 transition-colors">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
