import { useState } from "react";

/* ─────────────────────────────── Types ─────────────────────────────── */

export type PrinterType = "regular" | "thermal";

export interface Theme {
  id: string;
  label: string;
}

export const REGULAR_THEMES: Theme[] = [
  { id: "tally", label: "Tally Theme" },
  { id: "theme1", label: "Theme 1" },
  { id: "theme2", label: "Theme 2" },
  { id: "theme3", label: "Theme 3" },
  { id: "theme4", label: "Theme 4" },
  { id: "taxtheme", label: "Tax Theme" },
];

export const THERMAL_THEMES: Theme[] = [
  { id: "thermal1", label: "Thermal Theme 1" },
  { id: "thermal2", label: "Thermal Theme 2" },
  { id: "thermal3", label: "Thermal Theme 3" },
  { id: "thermal4", label: "Thermal Theme 4" },
];

const SWATCH_COLORS = [
  "#a78bfa", "#3b82f6", "#9ca3af", "#6b7280", "#84a07c", "#4ade80", "#06b6d4",
  "#16a34a", "#86efac", "#7c2d12", "#7e22ce", "#9f1239", "#92400e", "#b45309",
  "#e879f9", "#ec4899", "#f97316", "#d4a574", "#fbcfe8", "#fb923c", "#ef4444",
  "#ea580c", "#292524", "#e5e7eb",
];

/* ─────────────────────────── ThemeList ──────────────────────────────── */

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

/* ─────────────────────────── LeftPanel ─────────────────────────────── */

export interface LeftPanelProps {
  activePrinter: PrinterType;
  selectedThemeId: string | null;
  selectedColor: string;
  onPrinterChange: (p: PrinterType) => void;
  onThemeSelect: (id: string) => void;
  onColorChange: (color: string) => void;
}

export function LeftPanel({
  activePrinter,
  selectedThemeId,
  selectedColor,
  onPrinterChange,
  onThemeSelect,
  onColorChange,
}: LeftPanelProps) {
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);

  const currentThemes = activePrinter === "regular" ? REGULAR_THEMES : THERMAL_THEMES;

  return (
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
            onClick={() => onPrinterChange(p)}
          >
            {p === "regular" ? "Regular" : "Thermal"}
          </button>
        ))}
      </div>

      {/* Theme list */}
      <ThemeList
        themes={currentThemes}
        activeId={selectedThemeId}
        onSelect={onThemeSelect}
      />

      {/* Color Picker — Regular printer only */}
      {activePrinter === "regular" && (
        <>
          <div style={{ borderTop: "1px solid #e5e7eb", margin: "8px 0 0" }} />
          <div style={{ padding: "12px 14px 14px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 10, letterSpacing: 0.1 }}>
              Select Color
            </div>

            {/* Selected preview */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: selectedColor,
                  border: "1px solid rgba(0,0,0,0.12)",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Selected</span>
            </div>

            {/* Swatch grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5 }}>
              {SWATCH_COLORS.map((color) => (
                <button
                  key={color}
                  title={color}
                  onClick={() => {
                    onColorChange(color);
                    localStorage.setItem("print_selectedColor", color);
                  }}
                  onMouseEnter={() => setHoveredColor(color)}
                  onMouseLeave={() => setHoveredColor(null)}
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    borderRadius: 5,
                    background: color,
                    border:
                      selectedColor === color
                        ? "2.5px solid #1e40af"
                        : hoveredColor === color
                        ? "2px solid #6b7280"
                        : "1.5px solid rgba(0,0,0,0.10)",
                    cursor: "pointer",
                    padding: 0,
                    outline: selectedColor === color ? "2px solid #93c5fd" : "none",
                    outlineOffset: 1,
                    transition: "outline 0.1s, border 0.1s",
                    boxSizing: "border-box",
                  }}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
