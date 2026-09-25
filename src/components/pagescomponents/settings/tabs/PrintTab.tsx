import { useState, useEffect } from "react";
import { SaleInvoicePrintReport, TallyThemePreview } from "./printTab/Print documents/Tallytheme";
import { Theme1InvoicePrintReport, Theme1Preview } from "./printTab/Print documents/Theme1";
import { Theme2InvoicePrintReport, Theme2Preview } from "./printTab/Print documents/Theme2";
import { Theme3InvoicePrintReport, Theme3Preview } from "./printTab/Print documents/Theme3";
import { Theme4InvoicePrintReport, Theme4Preview } from "./printTab/Print documents/Theme4";
import { TaxInvoicePrintReport, TaxThemePreview } from "./printTab/Print documents/TaxTheme";
import { ThermalSaleInvoice, ThermalTheme1Preview } from "./printTab/Print documents/ThermalTheme1";
import { ThermalSaleInvoiceClassic, ThermalTheme2Preview } from "./printTab/Print documents/ThermalTheme2";
import { ThermalSaleInvoiceImpact, ThermalTheme3Preview } from "./printTab/Print documents/ThermalTheme3";
import { ThermalSaleInvoiceRetail, ThermalTheme4Preview } from "./printTab/Print documents/ThermalTheme4";
import { LeftPanel, REGULAR_THEMES, THERMAL_THEMES } from "./printTab/print tab panels/LeftPanel";
import { RightPanel } from "./printTab/print tab panels/RightPanel";
import { PrintPreviewRightPanel } from "./printTab/print tab panels/PrintPreviewRightPanel";
import type { PrinterType } from "./printTab/print tab panels/LeftPanel";
import { userProfile } from "@/data/mockData";

export interface SaleInvoiceLineItem {
  id?: string | number;
  itemName?: string;
  item_name?: string;
  quantity?: number | string;
  unit?: string;
  pricePerUnit?: number | string;
  price_per_unit?: number | string;
  amount?: number | string;
}

export interface SalePrintData {
  records: SaleInvoiceLineItem[];
  invoiceNo: string | number;
  invoiceDate: string;
  customerName: string;
  customerContact?: string;
  customerPhone?: string;
  customerEmail?: string;
  received?: number;
  paymentMode?: string;
  previousBalance?: number;
  discount?: number;
  discountPercent?: number;
  taxPercent?: number;
  description?: string;
}

export interface PrintTabProps {
  isPreviewMode?: boolean;
  saleData?: SalePrintData | null;
  onClose?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  hasUnsavedChanges?: boolean;
}

function useCompanyInfo() {
  const [info, setInfo] = useState({
    business_name: userProfile.businessName,
    phone: userProfile.phone,
    logo_url: userProfile.logo as string | undefined,
    address: (userProfile as any).address as string | undefined,
    email: (userProfile as any).email as string | undefined,
    signature: (userProfile as any).signature as string | undefined,
  });

  useEffect(() => {
    fetch("/api/user_profile")
      .then((r) => r.json())
      .then((d) => {
        if (d) {
          setInfo({
            business_name: d.business_name || userProfile.businessName,
            phone: d.phone || userProfile.phone,
            logo_url: d.logo_url || d.logo || userProfile.logo,
            address: d.address || (userProfile as any).address,
            email: d.email || (userProfile as any).email,
            signature: d.signature_url || d.signature || undefined,
          });
        }
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setInfo(prev => ({ ...prev, ...detail }));
    };
    window.addEventListener("print-profile-draft", handler);
    return () => window.removeEventListener("print-profile-draft", handler);
  }, []);

  return info;
}


/* ─────────────────────────── Main component ─────────────────────────── */

export function PrintTab({ isPreviewMode = false, saleData = null, onClose }: PrintTabProps) {
  const companyInfo = useCompanyInfo();
  const [activePrinter, setActivePrinter] = useState<PrinterType>(() =>
    (localStorage.getItem("print_activePrinter") as PrinterType) || "regular"
  );
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(() => {
    return localStorage.getItem("print_selectedThemeId") || "tally";
  });
  const [selectedColor, setSelectedColor] = useState<string>(
    () => localStorage.getItem("print_selectedColor") || "#a78bfa"
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm("You have unsaved changes. Are you sure you want to close?");
      if (!confirm) return;
    }
    if (onClose) {
      onClose();
    } else {
      window.dispatchEvent(new CustomEvent("close-print-tab"));
    }
  };

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
    if (isPreviewMode && saleData) {
      if (activePrinter === "regular") {
        let content = null;
        if (selectedThemeId === "tally") {
          content = (
            <SaleInvoicePrintReport
              records={saleData.records}
              invoiceNo={saleData.invoiceNo}
              invoiceDate={saleData.invoiceDate}
              customerName={saleData.customerName}
              customerContact={saleData.customerContact || saleData.customerPhone}
              businessProfile={companyInfo}
              received={saleData.received || 0}
              paymentMode={saleData.paymentMode}
              previousBalance={saleData.previousBalance}
              discount={saleData.discount}
              discountPercent={saleData.discountPercent}
              taxPercent={saleData.taxPercent}
              description={saleData.description}
            />
          );
        } else if (selectedThemeId === "theme1") {
          content = (
            <Theme1InvoicePrintReport
              records={saleData.records}
              invoiceNo={saleData.invoiceNo}
              invoiceDate={saleData.invoiceDate}
              customerName={saleData.customerName}
              customerContact={saleData.customerContact || saleData.customerPhone}
              businessProfile={companyInfo}
              received={saleData.received || 0}
              accentColor={selectedColor}
              paymentMode={saleData.paymentMode}
              previousBalance={saleData.previousBalance}
              discount={saleData.discount}
              discountPercent={saleData.discountPercent}
              taxPercent={saleData.taxPercent}
              description={saleData.description}
            />
          );
        } else if (selectedThemeId === "theme2") {
          content = (
            <Theme2InvoicePrintReport
              records={saleData.records}
              invoiceNo={saleData.invoiceNo}
              invoiceDate={saleData.invoiceDate}
              customerName={saleData.customerName}
              customerContact={saleData.customerContact || saleData.customerPhone}
              businessProfile={companyInfo}
              received={saleData.received || 0}
              accentColor={selectedColor}
              paymentMode={saleData.paymentMode}
              previousBalance={saleData.previousBalance}
              discount={saleData.discount}
              discountPercent={saleData.discountPercent}
              taxPercent={saleData.taxPercent}
              description={saleData.description}
            />
          );
        } else if (selectedThemeId === "theme3") {
          content = (
            <Theme3InvoicePrintReport
              records={saleData.records}
              invoiceNo={saleData.invoiceNo}
              invoiceDate={saleData.invoiceDate}
              customerName={saleData.customerName}
              customerContact={saleData.customerContact || saleData.customerPhone}
              businessProfile={companyInfo}
              received={saleData.received || 0}
              accentColor={selectedColor}
              paymentMode={saleData.paymentMode}
              previousBalance={saleData.previousBalance}
              discount={saleData.discount}
              discountPercent={saleData.discountPercent}
              taxPercent={saleData.taxPercent}
              description={saleData.description}
            />
          );
        } else if (selectedThemeId === "theme4") {
          content = (
            <Theme4InvoicePrintReport
              records={saleData.records}
              invoiceNo={saleData.invoiceNo}
              invoiceDate={saleData.invoiceDate}
              customerName={saleData.customerName}
              customerContact={saleData.customerContact || saleData.customerPhone}
              businessProfile={companyInfo}
              received={saleData.received || 0}
              accentColor={selectedColor}
              paymentMode={saleData.paymentMode}
              previousBalance={saleData.previousBalance}
              discount={saleData.discount}
              discountPercent={saleData.discountPercent}
              taxPercent={saleData.taxPercent}
              description={saleData.description}
            />
          );
        } else if (selectedThemeId === "taxtheme") {
          content = (
            <TaxInvoicePrintReport
              records={saleData.records}
              invoiceNo={saleData.invoiceNo}
              invoiceDate={saleData.invoiceDate}
              customerName={saleData.customerName}
              customerContact={saleData.customerContact || saleData.customerPhone}
              businessProfile={companyInfo}
              received={saleData.received || 0}
              accentColor={selectedColor}
              paymentMode={saleData.paymentMode}
              previousBalance={saleData.previousBalance}
              discount={saleData.discount}
              discountPercent={saleData.discountPercent}
              taxPercent={saleData.taxPercent}
              description={saleData.description}
            />
          );
        }

        return (
          <div className="print-area-wrapper" style={{ width: "100%", minHeight: "100%", display: "flex", justifyContent: "center", backgroundColor: "#f3f4f6", padding: "16px 0" }}>
            <div style={{ zoom: 0.88, transformOrigin: "top center", width: 900, flexShrink: 0 }}>
              {content || (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af", fontSize: 14 }}>
                  Select a theme to preview
                </div>
              )}
            </div>
          </div>
        );
      } else if (activePrinter === "thermal") {
        let content = null;
        if (selectedThemeId === "thermal1") {
          content = (
            <ThermalSaleInvoice
              records={saleData.records}
              invoiceNo={saleData.invoiceNo}
              invoiceDate={saleData.invoiceDate}
              customerName={saleData.customerName}
              customerPhone={saleData.customerPhone || saleData.customerContact}
              businessProfile={companyInfo}
              received={saleData.received || 0}
              discount={saleData.discount || 0}
              discountPercent={saleData.discountPercent}
              paymentMode={saleData.paymentMode}
              previousBalance={saleData.previousBalance}
            />
          );
        } else if (selectedThemeId === "thermal2") {
          content = (
            <ThermalSaleInvoiceClassic
              records={saleData.records}
              invoiceNo={saleData.invoiceNo}
              invoiceDate={saleData.invoiceDate}
              customerName={saleData.customerName}
              customerPhone={saleData.customerPhone || saleData.customerContact}
              businessProfile={companyInfo}
              received={saleData.received || 0}
              discount={saleData.discount || 0}
              discountPercent={saleData.discountPercent}
              taxPercent={saleData.taxPercent}
              paymentMode={saleData.paymentMode}
              previousBalance={saleData.previousBalance}
            />
          );
        } else if (selectedThemeId === "thermal3") {
          content = (
            <ThermalSaleInvoiceImpact
              records={saleData.records}
              invoiceNo={saleData.invoiceNo}
              invoiceDate={saleData.invoiceDate}
              customerName={saleData.customerName}
              customerPhone={saleData.customerPhone || saleData.customerContact}
              businessProfile={companyInfo}
              received={saleData.received || 0}
              discount={saleData.discount || 0}
              discountPercent={saleData.discountPercent}
              paymentMode={saleData.paymentMode}
              previousBalance={saleData.previousBalance}
            />
          );
        } else if (selectedThemeId === "thermal4") {
          content = (
            <ThermalSaleInvoiceRetail
              records={saleData.records}
              invoiceNo={saleData.invoiceNo}
              invoiceDate={saleData.invoiceDate}
              customerName={saleData.customerName}
              customerPhone={saleData.customerPhone || saleData.customerContact}
              businessProfile={companyInfo}
              received={saleData.received || 0}
              discount={saleData.discount || 0}
              discountPercent={saleData.discountPercent}
              paymentMode={saleData.paymentMode}
              previousBalance={saleData.previousBalance}
            />
          );
        }

        return (
          <div className="print-area-wrapper" style={{ width: "100%", minHeight: "100%", display: "flex", justifyContent: "center", backgroundColor: "#f3f4f6", padding: "24px 0" }}>
            <div style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.10)", borderRadius: 4, width: 380, flexShrink: 0 }}>
              {content || (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af", fontSize: 14 }}>
                  Select a theme to preview
                </div>
              )}
            </div>
          </div>
        );
      }
    }

    // Default dummy previews when not in preview mode with sale data
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
          position: absolute;
          inset: 0;
          background: #f3f4f6;
          display: flex;
          flex-direction: column;
          font-family: Inter, system-ui, sans-serif;
          overflow: hidden;
          z-index: 999;
        }
        .print-tab-modal.embedded-preview {
          position: absolute;
          inset: 0;
          z-index: 10;
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

        @media print {
          @page {
            size: auto;
            margin: 10mm;
          }
          body * {
            visibility: hidden !important;
          }
          .print-area-wrapper, .print-area-wrapper * {
            visibility: visible !important;
          }
          .print-area-wrapper {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            overflow: visible !important;
            zoom: 1 !important;
            display: block !important;
          }
          /* Reset the inner zoom/scale wrapper that is used for screen preview */
          .print-area-wrapper > div {
            zoom: 1 !important;
            transform: none !important;
            transform-origin: unset !important;
            width: 100% !important;
            max-width: 100% !important;
            flex-shrink: unset !important;
          }
          .print-tab-modal {
            position: static !important;
            background: transparent !important;
          }
          .print-tab-top-bar, .print-tab-left, .print-tab-right {
            display: none !important;
          }
          .print-tab-body {
            display: block !important;
          }
          .print-tab-center {
            background: transparent !important;
            overflow: visible !important;
          }
          .print-tab-preview-scroll {
            overflow: visible !important;
          }
        }
      `}</style>

      <div className={`print-tab-modal ${isPreviewMode ? "embedded-preview" : ""}`}>
        {/* ── Top bar ── */}
        <div className="print-tab-top-bar" style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          height: 48,
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>
            {isPreviewMode ? "Print Preview" : "Print Settings"}
          </span>
          <button
            className="close-btn"
            aria-label="Close print preview"
            onClick={handleClose}
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
            {isPreviewMode ? (
              <PrintPreviewRightPanel
                onClose={handleClose}
                invoiceNo={saleData?.invoiceNo}
              />
            ) : (
              <RightPanel
                hasUnsavedChanges={hasUnsavedChanges}
                onDirtyChange={setHasUnsavedChanges}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}