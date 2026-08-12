import React, { useState } from "react";
import { useSettings } from "../../../../hooks/useSettings";

// Modern Card Wrapper
const Card = ({ title, children }: { title: string, children: React.ReactNode }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid",
        borderColor: isHovered ? "#cbd5e1" : "#e2e8f0",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: isHovered
          ? "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)"
          : "0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -2px rgba(0, 0, 0, 0.02)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#0f172a", letterSpacing: "-0.3px" }}>{title}</h3>
      <div style={{ height: "1px", background: "#f1f5f9", margin: "0" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {children}
      </div>
    </div>
  );
};

// Sleek Toggle Switch Row
const SettingToggleRow = ({
  label,
  checked,
  onChange,
}: {
  label: string,
  checked: boolean,
  onChange: (val: boolean) => void,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        background: isHovered ? "#f8fafc" : "transparent",
        border: "1px solid",
        borderColor: isHovered ? "#e2e8f0" : "transparent",
        borderRadius: "10px",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onChange(!checked)}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "14px", color: "#334155", fontWeight: 500 }}>{label}</span>
      </div>

      <div
        style={{
          width: "40px",
          height: "22px",
          background: checked ? "#3b82f6" : "#cbd5e1",
          borderRadius: "22px",
          position: "relative",
          transition: "background 0.3s ease",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "2px",
            left: checked ? "20px" : "2px",
            width: "18px",
            height: "18px",
            background: "#fff",
            borderRadius: "50%",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            transition: "left 0.3s cubic-bezier(0.2, 0.85, 0.32, 1.2)",
          }}
        />
      </div>
    </div>
  );
};

export function AppearanceTab() {
  const [showTodaySales, setShowTodaySales] = useSettings("show_card_today_sales", true);
  const [showTodayProfit, setShowTodayProfit] = useSettings("show_card_today_profit", true);
  const [showReceivable, setShowReceivable] = useSettings("show_card_total_receivable", true);
  const [showPayable, setShowPayable] = useSettings("show_card_total_payable", true);
  const [showSalesChart, setShowSalesChart] = useSettings("show_card_total_sales_chart", true);
  const [showMostUsed, setShowMostUsed] = useSettings("show_card_most_used_reports", true);
  const [showLowStock, setShowLowStock] = useSettings("show_card_low_stock", true);
  const [enableGrid, setEnableGrid] = useSettings("enable_grid", false);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Appearance Settings</h2>
      
      <div className="grid grid-cols-2 gap-6 items-start">
        <Card title="Dashboard Customization">
          <SettingToggleRow
            label="Show Today's Sales Card"
            checked={showTodaySales}
            onChange={setShowTodaySales}
          />
          <SettingToggleRow
            label="Show Today's Profit Card"
            checked={showTodayProfit}
            onChange={setShowTodayProfit}
          />
          <SettingToggleRow
            label="Show Total Receivable Card"
            checked={showReceivable}
            onChange={setShowReceivable}
          />
          <SettingToggleRow
            label="Show Total Payable Card"
            checked={showPayable}
            onChange={setShowPayable}
          />
          <SettingToggleRow
            label="Show Total Sales (Chart) Card"
            checked={showSalesChart}
            onChange={setShowSalesChart}
          />
          <SettingToggleRow
            label="Show Most Used Reports Card"
            checked={showMostUsed}
            onChange={setShowMostUsed}
          />
          <SettingToggleRow
            label="Show Low Stock Items Card"
            checked={showLowStock}
            onChange={setShowLowStock}
          />
        </Card>

        <Card title="General">
          <SettingToggleRow
            label="Enable Grid (Items Page)"
            checked={enableGrid}
            onChange={setEnableGrid}
          />
        </Card>
      </div>
    </div>
  );
}
