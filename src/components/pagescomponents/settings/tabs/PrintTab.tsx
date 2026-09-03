import { useState } from "react";
import { TallyThemePreview } from "./printTab/Print documents/Tallytheme";

/* ─────────────────────────────── Types ─────────────────────────────── */

type PrinterType = "regular" | "thermal";

interface Theme {
  id: string;
  label: string;
}

const REGULAR_THEMES: Theme[] = [{ id: "tally", label: "Tally Theme" }];
const THERMAL_THEMES: Theme[] = [];

/* ──────────────────── Left panel theme list ─────────────────────────── */

function ThemeList({
  themes,
  activeId,
  onSelect,
}: {
  themes: Theme[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      {themes.length === 0 ? (
        <div style={{ padding: "16px 12px", fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>
          No themes available yet.
        </div>
      ) : (
        themes.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: activeId === t.id ? 600 : 400,
              color: activeId === t.id ? "#1e40af" : "#374151",
              background: activeId === t.id ? "#dbeafe" : "transparent",
              border: "none",
              borderLeft: activeId === t.id ? "3px solid #3b82f6" : "3px solid transparent",
              cursor: "pointer",
              transition: "all 0.15s ease",
              letterSpacing: 0.1,
            }}
            onMouseEnter={(e) => {
              if (activeId !== t.id) (e.currentTarget as HTMLButtonElement).style.background = "#f3f4f6";
            }}
            onMouseLeave={(e) => {
              if (activeId !== t.id) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
          >
            {t.label}
          </button>
        ))
      )}
    </div>
  );
}

/* ─────────────────────────── Main component ─────────────────────────── */

export function PrintTab() {
  const [activePrinter, setActivePrinter] = useState<PrinterType>(() =>
    (localStorage.getItem("print_activePrinter") as PrinterType) || "regular"
  );
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(() => {
    return localStorage.getItem("print_selectedThemeId") || "tally";
  });

  const handlePrinterChange = (p: PrinterType) => {
    setActivePrinter(p);
    localStorage.setItem("print_activePrinter", p);
    // auto-select first theme of the new printer
    const themes = p === "regular" ? REGULAR_THEMES : THERMAL_THEMES;
    if (themes.length > 0) {
      setSelectedThemeId(themes[0].id);
      localStorage.setItem("print_selectedThemeId", themes[0].id);
    } else {
      setSelectedThemeId(null);
    }
  };

  const handleThemeSelect = (id: string) => {
    setSelectedThemeId(id);
    localStorage.setItem("print_selectedThemeId", id);
  };

  const currentThemes = activePrinter === "regular" ? REGULAR_THEMES : THERMAL_THEMES;

  const renderPreview = () => {
    if (activePrinter === "regular" && selectedThemeId === "tally") {
      return <TallyThemePreview />;
    }
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af", fontSize: 14 }}>
        Select a theme to preview
      </div>
    );
  };

  return (
    <>
      <style>{`
        .print-tab-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(0,0,0,0.35);
          display: flex;
          align-items: stretch;
          justify-content: center;
        }
        .print-tab-modal {
          position: fixed;
          inset: 0;
          background: #f3f4f6;
          display: flex;
          flex-direction: column;
          font-family: Inter, system-ui, sans-serif;
          overflow: hidden;
        }
        .print-tab-body {
          display: grid;
          grid-template-columns: 280px 1fr 280px;
          flex: 1;
          overflow: hidden;
          min-height: 0;
        }
        /* Left panel */
        .print-tab-left {
          background: #fff;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }
        /* Center preview */
        .print-tab-center {
          display: flex;
          flex-direction: column;
          background: #f3f4f6;
          min-height: 0;
        }
        .print-tab-preview-scroll {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          min-height: 0;
        }
        .print-tab-preview-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .print-tab-preview-scroll::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 4px;
        }
        /* Right panel */
        .print-tab-right {
          background: #fff;
          border-left: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }
        .printer-tab-btn {
          flex: 1;
          padding: 10px 0;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.3px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.15s;
          color: #9ca3af;
        }
        .printer-tab-btn.active {
          color: #111827;
          border-bottom: 2px solid #111827;
        }
        .printer-tab-btn:hover:not(.active) {
          color: #374151;
        }
        .close-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 6px;
          color: #6b7280;
          font-size: 18px;
          line-height: 1;
          transition: background 0.15s, color 0.15s;
        }
        .close-btn:hover {
          background: #f3f4f6;
          color: #111827;
        }
      `}</style>

      <div className="print-tab-modal">
        {/* ── Top bar ── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          height: 48,
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>Print Settings</span>
          {/* Close button — navigates back; parent should unmount this when "print" tab is not active */}
          <button
            className="close-btn"
            aria-label="Close print settings"
            onClick={() => {
              // Dispatch a custom event so parent can close the print tab
              window.dispatchEvent(new CustomEvent("close-print-tab"));
            }}
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* ── Body ── */}
        <div className="print-tab-body">
          {/* ── LEFT PANEL ── */}
          <div className="print-tab-left">
            <div style={{ padding: "14px 14px 8px", fontSize: 13, fontWeight: 700, color: "#111827", letterSpacing: 0.1 }}>
              Select Theme
            </div>

            {/* Printer type tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", marginBottom: 8 }}>
              {(["regular", "thermal"] as const).map((p) => (
                <button
                  key={p}
                  className={`printer-tab-btn${activePrinter === p ? " active" : ""}`}
                  onClick={() => handlePrinterChange(p)}
                >
                  {p === "regular" ? "Regular" : "Thermal"}
                </button>
              ))}
            </div>

            {/* Theme list – rendered directly, no collapsible wrapper */}
            <ThemeList
              themes={currentThemes}
              activeId={selectedThemeId}
              onSelect={handleThemeSelect}
            />


          </div>

          {/* ── CENTER PREVIEW ── */}
          <div className="print-tab-center">
            {/* Scrollable invoice content */}
            <div className="print-tab-preview-scroll">
              {renderPreview()}
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="print-tab-right">
            <div style={{ padding: "14px 14px 8px", fontSize: 13, fontWeight: 700, color: "#111827", letterSpacing: 0.1 }}>
              Preview Settings
            </div>
            {/* Empty for now */}
          </div>
        </div>
      </div>
    </>
  );
}