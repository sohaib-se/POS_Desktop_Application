import { useEffect, useState, useRef } from "react";
import {
  Settings,
  Printer,
  X,
  ArrowLeftRight,
  Palette,
} from "lucide-react";

import { GeneralTab } from "../components/pagescomponents/settings/tabs/GeneralTab";
import { TransactionTab } from "../components/pagescomponents/settings/tabs/TransactionTab";
import { PrintTab } from "../components/pagescomponents/settings/tabs/PrintTab";
import { AppearanceTab } from "../components/pagescomponents/settings/tabs/AppearanceTab";
import { SettingsSidebar } from "../components/pagescomponents/settings/SettingsSidebar";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { toast } from "../components/ui/Toast";

interface SettingsPageProps {
  onClose?: () => void;
  initialTab?: string;
}

const tabs = [
  { id: "general", label: "GENERAL", icon: Settings },
  { id: "transaction", label: "TRANSACTION", icon: ArrowLeftRight },
  { id: "print", label: "PRINT", icon: Printer },
  { id: "appearance", label: "APPEARANCE", icon: Palette },
];

const takeSnapshot = (): Record<string, string | null> => {
  const snapshot: Record<string, string | null> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      snapshot[key] = localStorage.getItem(key);
    }
  }
  return snapshot;
};

export function SettingsPage({ onClose, initialTab }: SettingsPageProps = {}) {
  const [activeTab, setActiveTab] = useState(initialTab || "general");
  const [isOpenAnimated, setIsOpenAnimated] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);

  const initialSnapshotRef = useRef<Record<string, string | null>>({});
  const isRevertingRef = useRef(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsOpenAnimated(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Close the fullscreen print tab overlay when ✕ is clicked inside PrintTab
  useEffect(() => {
    const handler = () => setActiveTab("general");
    window.addEventListener("close-print-tab", handler);
    return () => window.removeEventListener("close-print-tab", handler);
  }, []);

  // Initialize baseline snapshot and monitor localStorage changes
  useEffect(() => {
    initialSnapshotRef.current = takeSnapshot();

    const checkDirty = () => {
      if (isRevertingRef.current) return;
      const snap = initialSnapshotRef.current;
      let dirty = false;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const currentVal = localStorage.getItem(key);
          const baselineVal = snap[key] ?? null;
          if (currentVal !== baselineVal) {
            dirty = true;
            break;
          }
        }
      }

      if (!dirty) {
        for (const [key, baselineVal] of Object.entries(snap)) {
          if (baselineVal !== null && localStorage.getItem(key) === null) {
            dirty = true;
            break;
          }
        }
      }

      setHasUnsavedChanges(dirty);
    };

    const origSetItem = localStorage.setItem.bind(localStorage);
    const origRemoveItem = localStorage.removeItem.bind(localStorage);

    localStorage.setItem = (key: string, value: string) => {
      origSetItem(key, value);
      checkDirty();
    };

    localStorage.removeItem = (key: string) => {
      origRemoveItem(key);
      checkDirty();
    };

    const handleSettingsUpdated = () => checkDirty();
    const handlePrintChanged = () => checkDirty();

    window.addEventListener("settings-updated", handleSettingsUpdated);
    window.addEventListener("print-settings-changed", handlePrintChanged);

    return () => {
      localStorage.setItem = origSetItem;
      localStorage.removeItem = origRemoveItem;
      window.removeEventListener("settings-updated", handleSettingsUpdated);
      window.removeEventListener("print-settings-changed", handlePrintChanged);
    };
  }, []);

  const handleSaveChanges = () => {
    initialSnapshotRef.current = takeSnapshot();
    setHasUnsavedChanges(false);
    toast.success("Saved changes");
  };

  const handleAttemptClose = () => {
    if (activeTab === "print") {
      setActiveTab("general");
      return;
    }

    if (hasUnsavedChanges) {
      setShowWarningDialog(true);
    } else {
      onClose?.();
    }
  };

  const handleConfirmDiscard = () => {
    isRevertingRef.current = true;
    const snap = initialSnapshotRef.current;

    // Restore keys from initial snapshot
    for (const [key, val] of Object.entries(snap)) {
      if (val !== null) {
        localStorage.setItem(key, val);
        try {
          const parsed = JSON.parse(val);
          window.dispatchEvent(
            new CustomEvent("settings-updated", { detail: { key, value: parsed } })
          );
        } catch {
          window.dispatchEvent(
            new CustomEvent("settings-updated", { detail: { key, value: val } })
          );
        }
      }
    }

    // Remove any keys created after the initial snapshot
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && !(k in snap)) {
        localStorage.removeItem(k);
      }
    }

    if (snap["print_totals_settings"]) {
      try {
        window.dispatchEvent(
          new CustomEvent("print-settings-changed", {
            detail: JSON.parse(snap["print_totals_settings"]),
          })
        );
      } catch {
        // Ignore JSON parse error for print settings
      }
    }

    isRevertingRef.current = false;
    setHasUnsavedChanges(false);
    setShowWarningDialog(false);
    onClose?.();
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "row",
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
      {/* ── Left Sidebar: Full height, hidden on print tab to give full width ── */}
      {activeTab !== "print" && (
        <SettingsSidebar 
          tabs={tabs} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
      )}

      {/* ── Right Content Area: Settings page tabs + Footer ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
          minWidth: 0,
          background: "#fff",
          position: "relative",
        }}
      >
        {/* ── Main content ── */}
        <main style={{ flex: 1, overflowY: "auto", background: "#fff", position: "relative" }}>
          {activeTab === "general" && <GeneralTab />}
          {activeTab === "transaction" && <TransactionTab />}
          {activeTab === "print" && (
            <PrintTab
              onSave={handleSaveChanges}
              onCancel={handleAttemptClose}
              hasUnsavedChanges={hasUnsavedChanges}
            />
          )}
          {activeTab === "appearance" && <AppearanceTab />}
        </main>

      {/* ── Footer: Shown on other pages (general, transaction, appearance) ── */}
      {activeTab !== "print" && (
        <footer
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "13px 28px",
            height: "61px",
            background: "#ffffff",
            borderTop: "1px solid #e2e8f0",
            boxShadow: "0 -2px 12px rgba(0, 0, 0, 0.04)",
            flexShrink: 0,
            zIndex: 40,
          }}
        >
          {/* Left Side: Status indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {hasUnsavedChanges ? (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  background: "#fef3c7",
                  border: "1px solid #fde68a",
                  color: "#b45309",
                  fontSize: "13px",
                  fontWeight: 500,
                  transition: "all 0.2s ease",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#f59e0b",
                    display: "inline-block",
                  }}
                />
                You have unsaved changes
              </div>
            ) : (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  color: "#15803d",
                  fontSize: "13px",
                  fontWeight: 500,
                  transition: "all 0.2s ease",
                }}
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: "#22c55e",
                    display: "inline-block",
                  }}
                />
                All changes saved
              </div>
            )}
          </div>

          {/* Right Side: Action Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Cancel Button - Displayed clearly with high-contrast border and clear text */}
            <button
              type="button"
              onClick={handleAttemptClose}
              style={{
                padding: "9px 24px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#374151",
                background: "#ffffff",
                border: "1.5px solid #d1d5db",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f9fafb";
                e.currentTarget.style.borderColor = "#9ca3af";
                e.currentTarget.style.color = "#111827";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.borderColor = "#d1d5db";
                e.currentTarget.style.color = "#374151";
                e.currentTarget.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.05)";
              }}
            >
              Cancel
            </button>

            {/* Save Changes Button */}
            <button
              type="button"
              onClick={handleSaveChanges}
              style={{
                padding: "9px 26px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#ffffff",
                background: "#E53935",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 2px 5px rgba(229, 57, 53, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#d32f2f";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 4px 10px rgba(229, 57, 53, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#E53935";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 5px rgba(229, 57, 53, 0.3)";
              }}
            >
              Save Changes
            </button>
          </div>
        </footer>
      )}
      </div>

      {onClose && activeTab !== "print" && (
        <button
          onClick={handleAttemptClose}
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
            zIndex: 60,
          }}
        >
          <X size={14} />
        </button>
      )}

      {/* Confirmation Dialog on Attempting to Leave Without Saving */}
      <ConfirmDialog
        open={showWarningDialog}
        title="Unsaved Changes"
        message="You have unsaved changes. Don't leave without saving!"
        confirmLabel="Leave without Saving"
        cancelLabel="Stay on Page"
        confirmColor="#e53935"
        icon="warning"
        onConfirm={handleConfirmDiscard}
        onCancel={() => setShowWarningDialog(false)}
      />
    </div>
  );
}
