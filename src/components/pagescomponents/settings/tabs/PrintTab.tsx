import { useState } from "react";
import { TallyThemePreview } from "./printTab/Print documents/Tallytheme";
import { Theme1Preview } from "./printTab/Print documents/Theme1";
import { Theme2Preview } from "./printTab/Print documents/Theme2";
import { Theme3Preview } from "./printTab/Print documents/Theme3";
import { Theme4Preview } from "./printTab/Print documents/Theme4";
import { TaxThemePreview } from "./printTab/Print documents/TaxTheme";
import { ThermalTheme1Preview } from "./printTab/Print documents/ThermalTheme1";
import { ThermalTheme2Preview } from "./printTab/Print documents/ThermalTheme2";
import { ThermalTheme3Preview } from "./printTab/Print documents/ThermalTheme3";
import { ThermalTheme4Preview } from "./printTab/Print documents/ThermalTheme4";
import { LeftPanel, REGULAR_THEMES, THERMAL_THEMES } from "./printTab/print tab panels/LeftPanel";
import { RightPanel } from "./printTab/print tab panels/RightPanel";
import type { PrinterType } from "./printTab/print tab panels/LeftPanel";

/* ─────────────────────────── Main component ─────────────────────────── */

export function PrintTab() {
  const [activePrinter, setActivePrinter] = useState<PrinterType>(() =>
    (localStorage.getItem("print_activePrinter") as PrinterType) || "regular"
  );
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(() => {
    return localStorage.getItem("print_selectedThemeId") || "tally";
  });
  const [selectedColor, setSelectedColor] = useState<string>(
    () => localStorage.getItem("print_selectedColor") || "#a78bfa"
  );

  const handlePrinterChange = (p: PrinterType) => {
    setActivePrinter(p);
    localStorage.setItem("print_activePrinter", p);
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

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    localStorage.setItem("print_selectedColor", color);
  };

  const renderPreview = () => {
    if (activePrinter === "regular" && selectedThemeId === "tally") {
      return <TallyThemePreview />;
    }
    if (activePrinter === "regular" && selectedThemeId === "theme1") {
      return <Theme1Preview accentColor={selectedColor} />;
    }
    if (activePrinter === "regular" && selectedThemeId === "theme2") {
      return <Theme2Preview accentColor={selectedColor} />;
    }
    if (activePrinter === "regular" && selectedThemeId === "theme3") {
      return <Theme3Preview accentColor={selectedColor} />;
    }
    if (activePrinter === "regular" && selectedThemeId === "theme4") {
      return <Theme4Preview accentColor={selectedColor} />;
    }
    if (activePrinter === "regular" && selectedThemeId === "taxtheme") {
      return <TaxThemePreview accentColor={selectedColor} />;
    }
    if (activePrinter === "thermal" && selectedThemeId === "thermal1") {
      return <ThermalTheme1Preview />;
    }
    if (activePrinter === "thermal" && selectedThemeId === "thermal2") {
      return <ThermalTheme2Preview />;
    }
    if (activePrinter === "thermal" && selectedThemeId === "thermal3") {
      return <ThermalTheme3Preview />;
    }
    if (activePrinter === "thermal" && selectedThemeId === "thermal4") {
      return <ThermalTheme4Preview />;
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
          <button
            className="close-btn"
            aria-label="Close print settings"
            onClick={() => window.dispatchEvent(new CustomEvent("close-print-tab"))}
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* ── Body ── */}
        <div className="print-tab-body">
          {/* ── LEFT PANEL ── */}
          <LeftPanel
            activePrinter={activePrinter}
            selectedThemeId={selectedThemeId}
            selectedColor={selectedColor}
            onPrinterChange={handlePrinterChange}
            onThemeSelect={handleThemeSelect}
            onColorChange={handleColorChange}
          />

          {/* ── CENTER PREVIEW ── */}
          <div className="print-tab-center">
            <div className="print-tab-preview-scroll">
              {renderPreview()}
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="print-tab-right">
            <RightPanel />
          </div>
        </div>
      </div>
    </>
  );
}