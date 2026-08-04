interface ExpensesTabsProps {
  activeTab: "category" | "items";
  setActiveTab: (tab: "category" | "items") => void;
}

export function ExpensesTabs({ activeTab, setActiveTab }: ExpensesTabsProps) {
  return (
    <div
      className="p-0 bg-white rounded-none flex items-center justify-between shrink-0 w-full"
      style={{ minHeight: "56px" }}
    >
      <div className="flex w-full">
        {(["category", "items"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 text-sm font-medium pb-2 border-b-2 transition-colors ${
              activeTab === tab
                ? "text-[#E53935] border-[#E53935]"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
