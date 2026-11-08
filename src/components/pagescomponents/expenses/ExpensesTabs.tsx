import { useTranslation } from "react-i18next";

interface ExpensesTabsProps {
  activeTab: "category" | "items";
  setActiveTab: (tab: "category" | "items") => void;
}

export function ExpensesTabs({ activeTab, setActiveTab }: ExpensesTabsProps) {
  const { t } = useTranslation();

  const tabs: { id: "category" | "items"; label: string }[] = [
    { id: "category", label: t("expenses.category") },
    { id: "items", label: t("expenses.items") },
  ];

  return (
    <div
      className="p-0 bg-white rounded-none flex items-center justify-between shrink-0 w-full"
      style={{ minHeight: "56px" }}
    >
      <div className="flex w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 text-sm font-medium pb-2 border-b-2 transition-colors ${
              activeTab === tab.id
                ? "text-[#E53935] border-[#E53935]"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
