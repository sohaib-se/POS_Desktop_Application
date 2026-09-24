import { useState } from "react";
import { Download, Check, Printer } from "lucide-react";
import html2pdf from "html2pdf.js";



/* ───────────────────────── Helpers ──────────────────────────────────── */

/** Renders the invoice preview element to a PDF Blob using html2pdf.js. */
async function generateInvoicePdfBlob(filename: string): Promise<Blob | null> {
  const element = document.querySelector(".print-area-wrapper") as HTMLElement | null;
  if (!element) return null;

  // Clone the element so we can strip zoom/transform that breaks capture
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.zoom = "1";
  clone.style.transform = "none";
  clone.style.transformOrigin = "unset";
  clone.style.position = "fixed";
  clone.style.left = "-9999px";
  clone.style.top = "0";
  clone.style.width = element.scrollWidth + "px";
  clone.style.background = "#fff";
  document.body.appendChild(clone);

  try {
    const blob: Blob = await html2pdf()
      .set({
        margin: 0,
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
      })
      .from(clone)
      .outputPdf("blob");
    return blob;
  } finally {
    document.body.removeChild(clone);
  }
}

/* ───────────────────────── Component props ──────────────────────────── */

export interface PrintPreviewRightPanelProps {
  onClose?: () => void;
  onPrint?: () => void;
  /** Invoice number shown in the filename */
  invoiceNo?: string | number;
}

/* ───────────────────────── Component ───────────────────────────────── */

export function PrintPreviewRightPanel({
  onClose,
  onPrint,
  invoiceNo,
}: PrintPreviewRightPanelProps) {
  const [isPdfBusy, setIsPdfBusy] = useState(false);
  const [pdfStatus, setPdfStatus] = useState<"idle" | "generating" | "ready">("idle");

  const pdfFilename = `Invoice${invoiceNo ? `-${invoiceNo}` : ""}.pdf`;

  /* ── Generate PDF and trigger browser Save-As download ─────────────── */
  const handleDownloadPDF = async () => {
    if (isPdfBusy) return;
    setIsPdfBusy(true);
    setPdfStatus("generating");
    try {
      const blob = await generateInvoicePdfBlob(pdfFilename);
      if (!blob) {
        alert("Could not find the invoice preview to export. Please make sure the invoice is visible.");
        return;
      }

      // Trigger a real browser "Save As" download — no print dialog
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = pdfFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);

      setPdfStatus("ready");
      setTimeout(() => setPdfStatus("idle"), 3000);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
      setPdfStatus("idle");
    } finally {
      setIsPdfBusy(false);
    }
  };



  const handlePrint = () => {
    if (onPrint) {
      onPrint();
      return;
    }

    const invoiceEl = document.querySelector(".print-area-wrapper > div") as HTMLElement | null;
    if (!invoiceEl) {
      window.print();
      return;
    }

    // Clone the invoice content into a dedicated print container
    const printContainer = document.createElement("div");
    printContainer.id = "__invoice_print_only__";
    const clone = invoiceEl.cloneNode(true) as HTMLElement;
    // Reset any screen-only zoom/transform on the clone
    clone.style.zoom = "1";
    clone.style.transform = "none";
    clone.style.transformOrigin = "unset";
    clone.style.width = "900px";
    printContainer.appendChild(clone);
    document.body.appendChild(printContainer);

    // Inject a <style> that hides every direct body child EXCEPT our container
    // Using display:none (not just visibility:hidden) removes them from layout,
    // so the browser page count is based solely on the invoice content.
    const styleEl = document.createElement("style");
    styleEl.id = "__invoice_print_style__";
    styleEl.textContent = `
      @media print {
        @page { size: auto; margin: 10mm; }
        body > *:not(#__invoice_print_only__) { display: none !important; }
        #__invoice_print_only__ {
          display: block !important;
          visibility: visible !important;
          position: static !important;
          margin: 0 !important;
          padding: 0 !important;
          background: #fff !important;
          width: 900px !important;
          box-sizing: border-box !important;
        }
        #__invoice_print_only__ * {
          visibility: visible !important;
        }
      }
    `;
    document.head.appendChild(styleEl);

    const cleanup = () => {
      if (document.body.contains(printContainer)) document.body.removeChild(printContainer);
      if (document.head.contains(styleEl)) document.head.removeChild(styleEl);
      window.removeEventListener("afterprint", cleanup);
    };

    window.addEventListener("afterprint", cleanup);
    window.print();

    // Safety fallback — cleanup if afterprint never fires
    setTimeout(cleanup, 3000);
  };

  /* ── Status label ─────────────────────────────────────────────────── */
  const statusLabel =
    pdfStatus === "generating"
      ? "Generating PDF…"
      : pdfStatus === "ready"
      ? "Done ✓"
      : null;

  /* ── Shared button style factory ─────────────────────────────────── */
  const btn = (bg: string, hoverBg: string, color = "#fff", border?: string) => ({
    base: {
      display: "flex" as const,
      alignItems: "center" as const,
      gap: "10px",
      width: "100%",
      padding: "10px 14px",
      fontSize: "13px",
      fontWeight: 600,
      color,
      backgroundColor: bg,
      border: border ?? "none",
      borderRadius: "7px",
      cursor: isPdfBusy ? "not-allowed" : ("pointer" as const),
      boxShadow: border ? "none" : `0 1px 3px ${bg}55`,
      transition: "all 0.15s ease",
      opacity: isPdfBusy ? 0.65 : 1,
    },
    enter: (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isPdfBusy) return;
      e.currentTarget.style.backgroundColor = hoverBg;
      e.currentTarget.style.transform = "translateY(-1px)";
    },
    leave: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.backgroundColor = bg;
      e.currentTarget.style.transform = "translateY(0)";
    },
  });


  const printBtn = btn("#E53935", "#d32f2f");
  const dlBtn = btn("#f3f4f6", "#e5e7eb", "#374151", "1px solid #d1d5db");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "16px", gap: "16px" }}>

      {/* ── Header ── */}
      <div>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", margin: 0 }}>
          Invoice Actions
        </h3>
        <p style={{ fontSize: "12px", color: "#6b7280", margin: "4px 0 0 0" }}>
          Print or download this invoice.
        </p>
      </div>

      {/* ── Status banner ── */}
      {statusLabel && (
        <div style={{
          fontSize: "12px",
          fontWeight: 600,
          color: pdfStatus === "ready" ? "#059669" : "#2563eb",
          background: pdfStatus === "ready" ? "#ecfdf5" : "#eff6ff",
          border: `1px solid ${pdfStatus === "ready" ? "#a7f3d0" : "#bfdbfe"}`,
          borderRadius: "6px",
          padding: "7px 12px",
          textAlign: "center",
          transition: "all 0.2s",
        }}>
          {statusLabel}
        </div>
      )}

      <div style={{ borderTop: "1px solid #e5e7eb" }} />


      {/* ── Print / Download ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Print &amp; Download
        </span>

        {/* Print */}
        <button
          onClick={handlePrint}
          style={printBtn.base}
          onMouseEnter={printBtn.enter}
          onMouseLeave={printBtn.leave}
        >
          <Printer size={16} />
          Print Invoice
        </button>

        {/* Download PDF — real file download, no print dialog */}
        <button
          disabled={isPdfBusy}
          onClick={handleDownloadPDF}
          style={dlBtn.base}
          onMouseEnter={dlBtn.enter}
          onMouseLeave={dlBtn.leave}
        >
          <Download size={16} />
          {pdfStatus === "generating" ? "Generating…" : "Download PDF"}
        </button>
      </div>

      {/* ── Spacer ── */}
      <div style={{ flex: 1 }} />

      {/* ── Done / Close ── */}
      {onClose && (
        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "14px" }}>
          <button
            onClick={onClose}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              width: "100%", padding: "9px 16px", fontSize: "13px", fontWeight: 600,
              color: "#374151", backgroundColor: "#fff", border: "1px solid #d1d5db",
              borderRadius: "7px", cursor: "pointer", transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
          >
            <Check size={16} />
            Done / Close Preview
          </button>
        </div>
      )}
    </div>
  );
}
