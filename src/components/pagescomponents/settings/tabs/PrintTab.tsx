import { useState } from "react";
import { ACCENT_UNDERLINE, BLUE, BORDER, TEXT_DARK, TEXT_MUTED } from "./printTab/constants";
import { ThemeStrip } from "./printTab/ThemeStrip";
import { ColorGrid, THEME_COLORS } from "./printTab/ColorGrid";
import { RegularCompanyInfoBlock } from "./printTab/RegularCompanyInfoBlock";
import { RegularItemTableBlock } from "./printTab/RegularItemTableBlock";
import { RegularTotalsAndTaxesBlock } from "./printTab/RegularTotalsAndTaxesBlock";
import { RegularFooterBlock } from "./printTab/RegularFooterBlock";
import { RegularInvoicePreview } from "./printTab/RegularInvoicePreview";
import { LandscapeTheme1Preview } from "./printTab/LandscapeTheme1Preview";
import { TaxTheme1Preview } from "./printTab/TaxTheme1Preview";
import { TaxTheme2Preview } from "./printTab/TaxTheme2Preview";
import { TaxTheme3Preview } from "./printTab/TaxTheme3Preview";
import { TaxTheme4Preview } from "./printTab/TaxTheme4Preview";
import { TaxTheme5Preview } from "./printTab/TaxTheme5Preview";
import { TaxTheme6Preview } from "./printTab/TaxTheme6Preview";
import { DoubleDivinePreview } from "./printTab/DoubleDivinePreview";
import { FrenchElitePreview } from "./printTab/FrenchElitePreview";
import { LandscapeTheme2Preview } from "./printTab/LandscapeTheme2Preview";
import { Theme1Preview } from "./printTab/Theme1Preview";
import { Theme2Preview } from "./printTab/Theme2Preview";
import { Theme3Preview } from "./printTab/Theme3Preview";
import { Theme4Preview } from "./printTab/Theme4Preview";
import { ThermalSettings } from "./printTab/ThermalSettings";
import { ThermalTheme1Preview } from "./printTab/ThermalTheme1Preview";
import { ThermalTheme2Preview } from "./printTab/ThermalTheme2Preview";
import { ThermalTheme3Preview } from "./printTab/ThermalTheme3Preview";
import { ThermalTheme4Preview } from "./printTab/ThermalTheme4Preview";
import { ThermalTheme5Preview } from "./printTab/ThermalTheme5Preview";

/* ---------------------------------------------------------------------- */
/*  Main component                                                         */
/* ---------------------------------------------------------------------- */

export function PrintTab() {
  const [activePrinter, setActivePrinter] = useState<"regular" | "thermal">(
    "regular",
  );
  const [activeTab, setActiveTab] = useState<"layout" | "colors">("layout");

  const [regularThemeIdx, setRegularThemeIdx] = useState(3);
  const [thermalThemeIdx, setThermalThemeIdx] = useState(2);
  const [themeColor, setThemeColor] = useState(THEME_COLORS[9]); // default purple color in screenshots

  const regularThemes = [
    "Tally Theme",
    "Landscape Theme 1",
    "Landscape Theme 2",
    "Tax Theme 1",
    "Tax Theme 2",
    "Tax Theme 3",
    "Tax Theme 4",
    "Tax Theme 5",
    "Tax Theme 6",
    "Double Divine",
    "French Elite",
    "Theme 1",
    "Theme 2",
    "Theme 3",
    "Theme 4",
  ];

  return (
    <div
      style={{
        padding: "32px",
        background: "#f8fafc",
        minHeight: "100%",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Printer type tabs */}
      <div
        style={{
          display: "flex",
          gap: 24,
          borderBottom: `1px solid ${BORDER}`,
          marginBottom: 20,
        }}
      >
        {(["regular", "thermal"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setActivePrinter(p)}
            style={{
              paddingBottom: 10,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 0.3,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              borderBottom:
                activePrinter === p ? `2px solid ${BLUE}` : "2px solid transparent",
              color: activePrinter === p ? BLUE : TEXT_MUTED,
            }}
          >
            {p === "regular" ? "REGULAR PRINTER" : "THERMAL PRINTER"}
          </button>
        ))}
      </div>

      {/* Layout / Colors sub-tabs (regular printer only) */}
      {activePrinter === "regular" && (
        <div style={{ display: "flex", gap: 24, marginBottom: 20 }}>
          {(["layout", "colors"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                paddingBottom: 6,
                fontSize: 11.5,
                fontWeight: 600,
                letterSpacing: 0.3,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                borderBottom:
                  activeTab === t ? `2px solid ${ACCENT_UNDERLINE}` : "2px solid transparent",
                color: activeTab === t ? TEXT_DARK : TEXT_MUTED,
              }}
            >
              {t === "layout" ? "CHANGE LAYOUT" : "CHANGE COLORS"}
            </button>
          ))}
        </div>
      )}

      {/* Layout sub-tab (thermal printer only, single option shown in screenshot) */}
      {activePrinter === "thermal" && (
        <div style={{ display: "flex", gap: 24, marginBottom: 20 }}>
          <span
            style={{
              paddingBottom: 6,
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: 0.3,
              color: TEXT_DARK,
              borderBottom: `2px solid ${ACCENT_UNDERLINE}`,
            }}
          >
            CHANGE LAYOUT
          </span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>
        {/* ---------------- Left: settings ---------------- */}
        <div>
          {activePrinter === "regular" && activeTab === "layout" && (
            <>
              <ThemeStrip
                themes={regularThemes}
                active={regularThemeIdx}
                onSelect={setRegularThemeIdx}
              />
              <RegularCompanyInfoBlock />
              <RegularItemTableBlock />
              <RegularTotalsAndTaxesBlock />
              <RegularFooterBlock />
            </>
          )}

          {activePrinter === "regular" && activeTab === "colors" && (
            <>
              <ColorGrid color={themeColor} onColorChange={setThemeColor} />
              <RegularCompanyInfoBlock />
              <RegularItemTableBlock />
              <RegularTotalsAndTaxesBlock />
              <RegularFooterBlock />
            </>
          )}

          {activePrinter === "thermal" && (
            <>
              <ThemeStrip
                themes={["Theme 1", "Theme 2", "Theme 3", "Theme 4", "Theme 5"]}
                active={thermalThemeIdx}
                onSelect={setThermalThemeIdx}
              />
              <ThermalSettings />
            </>
          )}
        </div>

        {/* ---------------- Right: live preview ---------------- */}
        <div
          style={{
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
            padding: 16,
            background: "#f9fafb",
            position: "sticky",
            top: 16,
          }}
        >
          {activePrinter === "regular" ? (
            regularThemeIdx === 0 ? <RegularInvoicePreview color={themeColor} /> :
            regularThemeIdx === 1 ? <LandscapeTheme1Preview color={themeColor} /> :
            regularThemeIdx === 2 ? <LandscapeTheme2Preview color={themeColor} /> :
            regularThemeIdx === 3 ? <TaxTheme1Preview color={themeColor} /> :
            regularThemeIdx === 4 ? <TaxTheme2Preview color={themeColor} /> :
            regularThemeIdx === 5 ? <TaxTheme3Preview color={themeColor} /> :
            regularThemeIdx === 6 ? <TaxTheme4Preview color={themeColor} /> :
            regularThemeIdx === 7 ? <TaxTheme5Preview color={themeColor} /> :
            regularThemeIdx === 8 ? <TaxTheme6Preview color={themeColor} /> :
            regularThemeIdx === 9 ? <DoubleDivinePreview color={themeColor} /> :
            regularThemeIdx === 10 ? <FrenchElitePreview color={themeColor} /> :
            regularThemeIdx === 11 ? <Theme1Preview color={themeColor} /> :
            regularThemeIdx === 12 ? <Theme2Preview color={themeColor} /> :
            regularThemeIdx === 13 ? <Theme3Preview color={themeColor} /> :
            <Theme4Preview color={themeColor} />
          ) : (
            thermalThemeIdx === 0 ? <ThermalTheme1Preview /> :
            thermalThemeIdx === 1 ? <ThermalTheme2Preview /> :
            thermalThemeIdx === 2 ? <ThermalTheme3Preview /> :
            thermalThemeIdx === 3 ? <ThermalTheme4Preview /> :
            <ThermalTheme5Preview />
          )}
        </div>
      </div>
    </div>
  );
}