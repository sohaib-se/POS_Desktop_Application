import { useState, useRef } from "react";
import { X, RefreshCw } from "lucide-react";
import html2pdf from "html2pdf.js";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PaymentInReceiptPrint } from "./Paymentinreceiptprint";
import { toast } from "@/components/ui/Toast";

interface PaymentInReceiptPreviewModalProps {
  record: any | null;
  businessProfile: any;
  onClose: () => void;
}

/** Prepares the isolated print container with print-only styles, returning a cleanup function */
function setupPrintContainer(): (() => void) | null {
  const reportEl = document.querySelector(".payment-in-receipt-dialog-content .print-area") as HTMLElement | null;
  if (!reportEl) return null;

  // Clean up any lingering print containers or injected styles
  document.getElementById("__payment_in_receipt_print_only__")?.remove();
  document.getElementById("__payment_in_receipt_print_style__")?.remove();

  // Clone the report content into a dedicated print-only container
  const printContainer = document.createElement("div");
  printContainer.id = "__payment_in_receipt_print_only__";
  printContainer.style.position = "fixed";
  printContainer.style.left = "-99999px";
  printContainer.style.top = "0";
  printContainer.style.opacity = "0";
  printContainer.style.pointerEvents = "none";

  const clone = reportEl.cloneNode(true) as HTMLElement;
  clone.style.zoom = "1";
  clone.style.transform = "none";
  clone.style.transformOrigin = "unset";
  clone.style.width = "100%";
  clone.style.maxWidth = "100%";
  clone.style.margin = "0";
  // Preserve component's natural px-8 py-8 padding for exact print window layout
  clone.style.boxSizing = "border-box";

  printContainer.appendChild(clone);
  document.body.appendChild(printContainer);

  const styleEl = document.createElement("style");
  styleEl.id = "__payment_in_receipt_print_style__";
  styleEl.textContent = `
    @media print {
      @page {
        size: A4 portrait;
        margin: 0;
      }
      html, body {
        width: 100% !important;
        height: auto !important;
        min-height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #fff !important;
        overflow: visible !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      #root {
        display: none !important;
      }
      body > *:not(#__payment_in_receipt_print_only__):not([data-slot="dialog-portal"]) {
        display: none !important;
      }
      [data-slot="dialog-portal"] {
        display: none !important;
      }
      #__payment_in_receipt_print_only__ {
        display: block !important;
        visibility: visible !important;
        position: static !important;
        left: auto !important;
        top: auto !important;
        opacity: 1 !important;
        pointer-events: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #fff !important;
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
        overflow: visible !important;
      }
      #__payment_in_receipt_print_only__ * {
        visibility: visible !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      #__payment_in_receipt_print_only__ .print-area {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        /* Keeps px-8 py-8 intact so output matches Microsoft Print to PDF exactly */
      }
      #__payment_in_receipt_print_only__ table {
        width: 100% !important;
        border-collapse: collapse !important;
      }
      #__payment_in_receipt_print_only__ tr {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
    }
  `;
  document.head.appendChild(styleEl);

  return () => {
    if (document.body.contains(printContainer)) document.body.removeChild(printContainer);
    if (document.head.contains(styleEl)) document.head.removeChild(styleEl);
  };
}

/** Fallback PDF generator for browser environments outside Electron */
async function generateFallbackPdfBlob(filename: string, elementToPrint?: HTMLElement | null): Promise<Blob | null> {
  const source =
    elementToPrint ||
    (document.getElementById("__payment_in_receipt_print_only__")?.querySelector(".print-area") as HTMLElement | null) ||
    (document.querySelector(".payment-in-receipt-dialog-content .print-area") as HTMLElement | null);
  if (!source) return null;

  const clone = source.cloneNode(true) as HTMLElement;
  clone.style.position = "fixed";
  clone.style.left = "-9999px";
  clone.style.top = "0";
  clone.style.width = "794px";
  clone.style.background = "#fff";
  clone.style.margin = "0";
  clone.style.padding = "20px";
  document.body.appendChild(clone);

  try {
    const blob: Blob = await (html2pdf as any)()
      .set({
        margin: [10, 10, 10, 10],
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: "#ffffff" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(clone)
      .outputPdf("blob");
    return blob;
  } finally {
    document.body.removeChild(clone);
  }
}

export function PaymentInReceiptPreviewModal({
  record,
  businessProfile,
  onClose,
}: PaymentInReceiptPreviewModalProps) {
  const [isBusy, setIsBusy] = useState<"idle" | "opening" | "saving">("idle");
  const isMountedRef = useRef(true);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const receiptNo = record?.receiptNo || record?.receipt_no || "receipt";
  const pdfFilename = `Payment_In_Receipt_${receiptNo}.pdf`;

  const handleOpenPDF = async () => {
    if (isBusy !== "idle") return;
    setIsBusy("opening");

    const reportEl = (printAreaRef.current?.querySelector(".print-area") || printAreaRef.current || document.querySelector(".payment-in-receipt-dialog-content .print-area")) as HTMLElement | null;
    const cleanup = setupPrintContainer();

    // Close preview popup immediately as requested
    onClose();

    try {
      await new Promise((resolve) => setTimeout(resolve, 80));

      if (window.electronAPI?.openPdf) {
        const result = await window.electronAPI.openPdf({
          defaultFilename: pdfFilename,
          title: `Payment-In Receipt #${receiptNo}`,
          pdfOptions: {
            printBackground: true,
            preferCSSPageSize: true,
            landscape: false,
            pageSize: "A4",
          },
        });

        if (!result.success && !result.canceled) {
          throw new Error(result.failureReason || "Failed to open PDF");
        }
      } else {
        // Fallback for browser outside Electron
        const blob = await generateFallbackPdfBlob(pdfFilename, reportEl);
        if (blob) {
          const url = URL.createObjectURL(blob);
          window.open(url, "_blank");
          setTimeout(() => URL.revokeObjectURL(url), 10000);
        } else {
          toast.error("Could not generate receipt preview.");
        }
      }
    } catch (err: any) {
      console.error("Open PDF error:", err);
      toast.error(`Could not open PDF: ${err?.message || "Unknown error"}`);
    } finally {
      cleanup?.();
      if (isMountedRef.current) setIsBusy("idle");
    }
  };

  const handleSavePDF = async () => {
    if (isBusy !== "idle") return;
    setIsBusy("saving");

    const reportEl = (printAreaRef.current?.querySelector(".print-area") || printAreaRef.current || document.querySelector(".payment-in-receipt-dialog-content .print-area")) as HTMLElement | null;
    const cleanup = setupPrintContainer();

    // Close preview popup immediately as requested so save as window opens directly
    onClose();

    try {
      await new Promise((resolve) => setTimeout(resolve, 80));

      if (window.electronAPI?.savePdf) {
        const result = await window.electronAPI.savePdf({
          defaultFilename: pdfFilename,
          title: "Save Payment-In Receipt as PDF",
          pdfOptions: {
            printBackground: true,
            preferCSSPageSize: true,
            landscape: false,
            pageSize: "A4",
          },
        });

        if (result.canceled) {
          return;
        }

        if (!result.success) {
          throw new Error(result.failureReason || "Failed to save PDF");
        }

        toast.success("PDF saved successfully.");
      } else {
        // Fallback for browser outside Electron
        const blob = await generateFallbackPdfBlob(pdfFilename, reportEl);
        if (!blob) {
          toast.error("Could not generate receipt preview.");
          return;
        }

        if ("showSaveFilePicker" in window) {
          try {
            const handle = await (window as any).showSaveFilePicker({
              suggestedName: pdfFilename,
              types: [
                {
                  description: "PDF Document (*.pdf)",
                  accept: { "application/pdf": [".pdf"] },
                },
              ],
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            toast.success("PDF saved successfully.");
            return;
          } catch (pickerErr: any) {
            if (pickerErr?.name === "AbortError") return;
          }
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = pdfFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        toast.success("PDF downloaded.");
      }
    } catch (err: any) {
      console.error("Save PDF error:", err);
      toast.error(`Could not save PDF: ${err?.message || "Unknown error"}`);
    } finally {
      cleanup?.();
      if (isMountedRef.current) setIsBusy("idle");
    }
  };

  const handlePrint = () => {
    const cleanup = setupPrintContainer();
    if (!cleanup) {
      window.print();
      return;
    }

    const onAfterPrint = () => {
      cleanup();
      window.removeEventListener("afterprint", onAfterPrint);
    };

    window.addEventListener("afterprint", onAfterPrint);
    window.print();

    setTimeout(onAfterPrint, 3000);
  };

  return (
    <Dialog open={!!record} onOpenChange={(open) => !open && onClose()}>
      <style>{`
        .payment-in-receipt-dialog-content,
        [data-slot="dialog-overlay"] {
          animation: none !important;
          transition: none !important;
        }
      `}</style>
      <DialogContent
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onFocusOutside={(e) => e.preventDefault()}
        className="payment-in-receipt-dialog-content rounded-xl border-0 bg-white p-0 shadow-xl flex flex-col !animate-none !duration-0 data-[state=open]:!animate-none data-[state=closed]:!animate-none"
        style={{ width: "750px", maxWidth: "96vw" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Receipt Preview</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview content */}
        <div className="overflow-auto max-h-[70vh]">
          <div ref={printAreaRef}>
            {record && (
              <PaymentInReceiptPrint
                record={record}
                businessProfile={businessProfile}
              />
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t flex justify-end gap-3">
          <button
            onClick={handleOpenPDF}
            disabled={isBusy !== "idle"}
            className="rounded-full px-6 py-2 border border-red-500 text-red-500 font-medium text-sm hover:bg-red-50 transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {isBusy === "opening" && <RefreshCw size={14} className="animate-spin" />}
            {isBusy === "opening" ? "Opening PDF..." : "Open PDF"}
          </button>
          <button
            onClick={handlePrint}
            disabled={isBusy !== "idle"}
            className="rounded-full px-6 py-2 border border-red-500 text-red-500 font-medium text-sm hover:bg-red-50 transition-colors disabled:opacity-60"
          >
            Print
          </button>
          <button
            onClick={handleSavePDF}
            disabled={isBusy !== "idle"}
            className="rounded-full px-6 py-2 border border-red-500 text-red-500 font-medium text-sm hover:bg-red-50 transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {isBusy === "saving" && <RefreshCw size={14} className="animate-spin" />}
            {isBusy === "saving" ? "Saving PDF..." : "Save PDF"}
          </button>
          <button
            onClick={onClose}
            disabled={isBusy !== "idle"}
            className="rounded-full px-6 py-2 bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-colors disabled:opacity-60"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}