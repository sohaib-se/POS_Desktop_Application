import type { Dispatch, SetStateAction } from "react";
import { Search } from "lucide-react";
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
        width: 200,
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
          justifyContent: "space-between",
          padding: "16px 20px 12px",
        }}
      >
        <span style={{ color: "#fff", fontSize: 15, fontWeight: 500 }}>
          Settings
        </span>
        <Search
          size={15}
          color="rgba(255,255,255,0.4)"
          style={{ cursor: "pointer" }}
        />
      </div>

      <nav style={{ flex: 1, overflowY: "auto" }}>
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
                gap: 10,
                padding: "9px 16px",
                background: active
                  ? "rgba(255,255,255,0.12)"
                  : "transparent",
                border: "none",
                cursor: "pointer",
                color: active ? "#fff" : "rgba(255,255,255,0.6)",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.3px",
                textAlign: "left",
                transition: "background 0.1s",
              }}
            >
              <Icon size={14} style={{ flexShrink: 0 }} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
