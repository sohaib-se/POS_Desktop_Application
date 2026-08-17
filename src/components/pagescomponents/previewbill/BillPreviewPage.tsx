import { useEffect, useState } from "react";
import { usePrintConfig } from "./usePrintConfig";
import type { BillPreviewSaleData } from "./BillPreviewData";

// Import all themes from printTab (Single Source of Truth)
import { RegularInvoicePreview } from "../settings/tabs/printTab/RegularInvoicePreview";
import { TaxTheme1Preview } from "../settings/tabs/printTab/TaxTheme1Preview";
import { TaxTheme2Preview } from "../settings/tabs/printTab/TaxTheme2Preview";
import { TaxTheme3Preview } from "../settings/tabs/printTab/TaxTheme3Preview";
import { Theme1Preview } from "../settings/tabs/printTab/Theme1Preview";
import { Theme2Preview } from "../settings/tabs/printTab/Theme2Preview";
import { Theme3Preview } from "../settings/tabs/printTab/Theme3Preview";
import { Theme4Preview } from "../settings/tabs/printTab/Theme4Preview";

import { ThermalTheme1Preview } from "../settings/tabs/printTab/ThermalTheme1Preview";
import { ThermalTheme2Preview } from "../settings/tabs/printTab/ThermalTheme2Preview";
import { ThermalTheme3Preview } from "../settings/tabs/printTab/ThermalTheme3Preview";
import { ThermalTheme4Preview } from "../settings/tabs/printTab/ThermalTheme4Preview";
import { ThermalTheme5Preview } from "../settings/tabs/printTab/ThermalTheme5Preview";
import { ColorGrid } from "../settings/tabs/printTab/ColorGrid";
import { PrintPreviewContext } from "../settings/tabs/printTab/SharedComponents";

import { Share2, Mail, Download, Printer, X, FileText } from "lucide-react";

interface BillPreviewPageProps {
  sale: BillPreviewSaleData;
  onClose: () => void;
}

export function BillPreviewPage({ sale, onClose }: BillPreviewPageProps) {
  const config = usePrintConfig();
  const [isVisible, setIsVisible] = useState(false);

  // Local state for theme selection (defaults to current settings)
  const [selectedType, setSelectedType] = useState<"regular" | "thermal">(config.activePrinter);
  const [regIdx, setRegIdx] = useState(config.regularThemeIdx);
  const [thermIdx, setThermIdx] = useState(config.thermalThemeIdx);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const handlePrintNormal = () => {
    setSelectedType("regular");
    // short timeout to let react render the regular bill before printing
    setTimeout(() => window.print(), 100);
  };

  const handlePrintThermal = () => {
    setSelectedType("thermal");
    setTimeout(() => window.print(), 100);
  };

  const handleDownloadPdf = () => {
    // If there is no backend or library for PDF generation, native print with "Save as PDF" is the standard fallback
    alert('Please select "Save as PDF" in the print dialog destination dropdown.');
    setTimeout(() => window.print(), 100);
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 160);
  };

  const [localColor, setLocalColor] = useState(config.themeColor);

  const handleColorChange = (c: string) => {
    setLocalColor(c);
    localStorage.setItem("print_themeColor", c);
    window.dispatchEvent(new Event("company-details-update"));
  };

  const isWhiteTheme = localColor === "#ffffff" || localColor === "#fff";

  const handleSelectRegularTheme = (idx: number) => {
    setSelectedType("regular");
    setRegIdx(idx);
    localStorage.setItem("print_activePrinter", "regular");
    localStorage.setItem("print_regularThemeIdx", idx.toString());
    window.dispatchEvent(new Event("company-details-update"));
  };

  const handleSelectThermalTheme = (idx: number) => {
    setSelectedType("thermal");
    setThermIdx(idx);
    localStorage.setItem("print_activePrinter", "thermal");
    localStorage.setItem("print_thermalThemeIdx", idx.toString());
    window.dispatchEvent(new Event("company-details-update"));
  };

  return (
    <>
      <style>{`
        @media print {
          body > * { display: none !important; }
          #bill-preview-root { display: block !important; background: transparent !important; }
          #bill-preview-sidebar-left, #bill-preview-sidebar-right, #bill-preview-action-bar { display: none !important; }
          #bill-preview-scroll { padding: 0 !important; overflow: visible !important; max-height: none !important; align-items: flex-start !important; }
          #bill-preview-paper { box-shadow: none !important; border-radius: 0 !important; }
          * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        }
        ${isWhiteTheme && selectedType === "regular" ? `
          .bill-preview-white-theme * {
            color: #000 !important;
            border-color: #000 !important;
          }
        ` : ""}
        
        .theme-btn {
          width: 100%; text-align: left; padding: 10px 14px; margin-bottom: 4px;
          border-radius: 6px; border: none; background: transparent; cursor: pointer;
          color: #334155; font-size: 13px; font-weight: 500; transition: all 0.15s;
        }
        .theme-btn:hover { background: #f1f5f9; color: #0f172a; }
        .theme-btn.active { background: #2563eb; color: #fff; font-weight: 600; box-shadow: 0 2px 8px rgba(37,99,235,0.3); }

        .action-btn {
          width: 100%; display: flex; alignItems: center; gap: 10px; padding: 12px 16px;
          border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; cursor: pointer;
          color: #334155; font-size: 13.5px; font-weight: 500; transition: all 0.15s;
          margin-bottom: 10px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .action-btn:hover { background: #f8fafc; border-color: #cbd5e1; }
      `}</style>

      <div
        id="bill-preview-root"
        style={{
          flex: 1, background: "#f8fafc",
          display: "flex", flexDirection: "column",
          opacity: isVisible ? 1 : 0, transform: isVisible ? "scale(1)" : "scale(0.98)",
          transition: "opacity 150ms ease-out, transform 160ms cubic-bezier(0.2, 0.8, 0.2, 1)",
          fontFamily: "Inter, system-ui, sans-serif",
          height: "100%",
          overflow: "hidden"
        }}
      >
        {/* ── Top Header ── */}
        <div
          id="bill-preview-action-bar"
          style={{
            padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: "1px solid #e2e8f0", background: "#fff"
          }}
        >
          <div style={{ color: "#0f172a", fontSize: 18, fontWeight: 700 }}>Preview</div>
          <button onClick={handleClose} style={{
            background: "transparent", border: "none", color: "#64748b", cursor: "pointer", padding: 4
          }}>
            <X size={24} />
          </button>
        </div>

        {/* ── 3 Column Layout ── */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* LEFT: Theme Selector */}
          <div id="bill-preview-sidebar-left" style={{
            width: 260, borderRight: "1px solid #e2e8f0", background: "#fff",
            padding: "20px 16px", overflowY: "auto"
          }}>
            <div style={{ color: "#475569", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, paddingLeft: 6 }}>Select Theme</div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, marginBottom: 8, paddingLeft: 6 }}>Classic Themes</div>
              <button className={`theme-btn ${selectedType === "regular" && regIdx === 0 ? "active" : ""}`} onClick={() => handleSelectRegularTheme(0)}>Tally Theme</button>
              <button className={`theme-btn ${selectedType === "regular" && regIdx === 4 ? "active" : ""}`} onClick={() => handleSelectRegularTheme(4)}>Theme 1</button>
              <button className={`theme-btn ${selectedType === "regular" && regIdx === 5 ? "active" : ""}`} onClick={() => handleSelectRegularTheme(5)}>Theme 2</button>
              <button className={`theme-btn ${selectedType === "regular" && regIdx === 6 ? "active" : ""}`} onClick={() => handleSelectRegularTheme(6)}>Theme 3</button>
              <button className={`theme-btn ${selectedType === "regular" && regIdx === 7 ? "active" : ""}`} onClick={() => handleSelectRegularTheme(7)}>Theme 4</button>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, marginBottom: 8, paddingLeft: 6 }}>Tax Themes</div>
              <button className={`theme-btn ${selectedType === "regular" && regIdx === 1 ? "active" : ""}`} onClick={() => handleSelectRegularTheme(1)}>Tax Theme 1</button>
              <button className={`theme-btn ${selectedType === "regular" && regIdx === 2 ? "active" : ""}`} onClick={() => handleSelectRegularTheme(2)}>Tax Theme 2</button>
              <button className={`theme-btn ${selectedType === "regular" && regIdx === 3 ? "active" : ""}`} onClick={() => handleSelectRegularTheme(3)}>Tax Theme 3</button>
            </div>

            <div>
              <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, marginBottom: 8, paddingLeft: 6 }}>Thermal Themes</div>
              <button className={`theme-btn ${selectedType === "thermal" && thermIdx === 0 ? "active" : ""}`} onClick={() => handleSelectThermalTheme(0)}>Thermal Theme 1</button>
              <button className={`theme-btn ${selectedType === "thermal" && thermIdx === 1 ? "active" : ""}`} onClick={() => handleSelectThermalTheme(1)}>Thermal Theme 2</button>
              <button className={`theme-btn ${selectedType === "thermal" && thermIdx === 2 ? "active" : ""}`} onClick={() => handleSelectThermalTheme(2)}>Thermal Theme 3</button>
              <button className={`theme-btn ${selectedType === "thermal" && thermIdx === 3 ? "active" : ""}`} onClick={() => handleSelectThermalTheme(3)}>Thermal Theme 4</button>
              <button className={`theme-btn ${selectedType === "thermal" && thermIdx === 4 ? "active" : ""}`} onClick={() => handleSelectThermalTheme(4)}>Thermal Theme 5</button>
            </div>

            <div style={{ marginTop: 24, opacity: selectedType === "thermal" ? 0.4 : 1, pointerEvents: selectedType === "thermal" ? "none" : "auto" }}>
              <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, marginBottom: 8, paddingLeft: 6 }}>Select Color</div>
              <div style={{ paddingLeft: 6 }}>
                <ColorGrid color={localColor} onColorChange={handleColorChange} />
              </div>
            </div>
          </div>

          {/* CENTER: Bill Preview */}
          <div id="bill-preview-scroll" style={{
            flex: 1, overflowY: "auto", padding: "32px",
            display: "flex", justifyContent: "center", alignItems: "flex-start",
            background: "#f1f5f9"
          }}>
            <div
              id="bill-preview-paper"
              className={isWhiteTheme && selectedType === "regular" ? "bill-preview-white-theme" : ""}
              style={{
                width: selectedType === "thermal" ? 360 : "min(794px, 100%)",
                minHeight: selectedType === "regular" ? 1123 : "auto",
                background: "#fff",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                borderRadius: selectedType === "thermal" ? 4 : 2,
              }}
            >
              <PrintPreviewContext.Provider value={{ isReadOnly: true }}>
                {selectedType === "regular" ? (
                  regIdx === 0 ? <RegularInvoicePreview sale={sale} color={localColor} /> :
                    regIdx === 1 ? <TaxTheme1Preview sale={sale} color={localColor} /> :
                      regIdx === 2 ? <TaxTheme2Preview sale={sale} color={localColor} /> :
                        regIdx === 3 ? <TaxTheme3Preview sale={sale} color={localColor} /> :
                          regIdx === 4 ? <Theme1Preview sale={sale} color={localColor} /> :
                            regIdx === 5 ? <Theme2Preview sale={sale} color={localColor} /> :
                              regIdx === 6 ? <Theme3Preview sale={sale} color={localColor} /> :
                                <Theme4Preview sale={sale} color={localColor} />
                ) : (
                  thermIdx === 0 ? <ThermalTheme1Preview sale={sale} /> :
                    thermIdx === 1 ? <ThermalTheme2Preview sale={sale} /> :
                      thermIdx === 2 ? <ThermalTheme3Preview sale={sale} /> :
                        thermIdx === 3 ? <ThermalTheme4Preview sale={sale} /> :
                          <ThermalTheme5Preview sale={sale} />
                )}
              </PrintPreviewContext.Provider>
            </div>
          </div>

          {/* RIGHT: Actions */}
          <div id="bill-preview-sidebar-right" style={{
            width: 280, borderLeft: "1px solid #e2e8f0", background: "#fff",
            padding: "24px 20px", overflowY: "auto"
          }}>
            <div style={{ color: "#475569", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Share Invoice</div>
            <button className="action-btn" onClick={() => alert("WhatsApp integration pending")}><Share2 size={18} color="#22c55e" /> WhatsApp</button>
            <button className="action-btn" style={{ marginBottom: 32 }} onClick={() => alert("Gmail integration pending")}><Mail size={18} color="#ef4444" /> Gmail</button>

            <div style={{ color: "#475569", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Download</div>
            <button className="action-btn" style={{ marginBottom: 32 }} onClick={handleDownloadPdf}><Download size={18} color="#3b82f6" /> Download PDF</button>

            <div style={{ color: "#475569", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Print</div>
            <button className="action-btn" onClick={handlePrintThermal}><FileText size={18} color="#f59e0b" /> Print Invoice (Thermal)</button>
            <button className="action-btn" onClick={handlePrintNormal}><Printer size={18} color="#8b5cf6" /> Print Invoice (Normal)</button>
          </div>

        </div>
      </div>
    </>
  );
}
