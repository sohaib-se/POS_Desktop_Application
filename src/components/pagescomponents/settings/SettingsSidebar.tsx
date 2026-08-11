import type { Dispatch, SetStateAction } from "react";
import type { LucideIcon } from "lucide-react";

export interface TabType {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface SettingsSidebarProps {
  tabs: TabType[];
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
  setShowPrintSettings: Dispatch<SetStateAction<boolean>>;
}

export function SettingsSidebar({ tabs, activeTab, setActiveTab, setShowPrintSettings }: SettingsSidebarProps) {
  return (
    <aside
      style={{
        width: 240,
        background: "#1e2433",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "24px 20px 16px",
        }}
      >
        <span style={{ color: "#fff", fontSize: 18, fontWeight: 600 }}>
          Settings
        </span>
      </div>

      <nav style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px", padding: "8px" }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === "print") setShowPrintSettings(true);
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                background: active
                  ? "rgba(255,255,255,0.12)"
                  : "transparent",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                color: active ? "#fff" : "rgba(255,255,255,0.6)",
                fontSize: 14,
                fontWeight: 500,
                textAlign: "left",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "rgb(229, 57, 53)";
                  e.currentTarget.style.color = "#fff";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                }
              }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
