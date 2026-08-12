import { useEffect, useState } from "react";
import {
  Settings,
  Printer,
  MessageSquare,
  Users,
  Package,
  X,
  ArrowLeftRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GeneralTab } from "../components/pagescomponents/settings/tabs/GeneralTab";
import { TransactionTab } from "../components/pagescomponents/settings/tabs/TransactionTab";
import { PartyTab } from "../components/pagescomponents/settings/tabs/PartyTab";
import { ItemTab } from "../components/pagescomponents/settings/tabs/ItemTab";
import { PrintTab } from "../components/pagescomponents/settings/tabs/PrintTab";
import { SettingsSidebar } from "../components/pagescomponents/settings/SettingsSidebar";

interface SettingsPageProps {
  onClose?: () => void;
  initialTab?: string;
}

const tabs = [
  { id: "general", label: "GENERAL", icon: Settings },
  { id: "transaction", label: "TRANSACTION", icon: ArrowLeftRight },
  { id: "print", label: "PRINT", icon: Printer },
  { id: "party", label: "PARTY", icon: Users },
  { id: "item", label: "ITEM", icon: Package },
];

export function SettingsPage({ onClose, initialTab }: SettingsPageProps = {}) {
  const [activeTab, setActiveTab] = useState(initialTab || "general");
  const [isOpenAnimated, setIsOpenAnimated] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsOpenAnimated(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        opacity: isOpenAnimated ? 1 : 0,
        transform: isOpenAnimated
          ? "translate3d(0,0,0) scale(1)"
          : "translate3d(-48px,48px,0) scale(0.99)",
        transition:
          "opacity 120ms ease-out, transform 170ms cubic-bezier(0.2,0.8,0.2,1)",
        background: "#fff",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <SettingsSidebar 
          tabs={tabs} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />

        {/* ── Main content ── */}
        <main style={{ flex: 1, overflowY: "auto", background: "#fff" }}>
          {activeTab === "general" && <GeneralTab />}
          {activeTab === "transaction" && <TransactionTab />}
          {activeTab === "print" && <PrintTab />}
          {activeTab === "party" && <PartyTab />}
          {activeTab === "item" && <ItemTab />}
        </main>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close settings"
          style={{
            position: "absolute",
            top: 12,
            right: 14,
            width: 28,
            height: 28,
            background: "#4b5563",
            border: "none",
            cursor: "pointer",
            color: "#fff",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
