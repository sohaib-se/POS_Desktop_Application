import { X } from "lucide-react";
import { useRef } from "react";
import html2pdf from "html2pdf.js";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PaymentOutReceiptPrint } from "./Paymentoutreceiptprint";

interface PaymentOutReceiptPreviewModalProps {
  record: any | null;
  businessProfile: any;
  onClose: () => void;
}

export function PaymentOutReceiptPreviewModal({
  record,
  businessProfile,
  onClose,
}: PaymentOutReceiptPreviewModalProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const receiptNo = record?.paymentNo || record?.payment_no || record?.receiptNo || record?.receipt_no || "receipt";

  const getPdfOptions = () => ({
    // 0 here on purpose: the report itself already has its own padding
    // (px-8 py-8 on .print-area), so adding a page-level margin on top of
    // that would give the PDF more whitespace than the preview/print.
    margin: 0,
    filename: `PaymentOutReceipt_${receiptNo}.pdf`,
    image: { type: "jpeg", quality: 1 },
    html2canvas: { scale: 2, useCORS: true, windowWidth: 794 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  });

  const handleOpenPDF = () => {
    const element = printAreaRef.current;
    if (element) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (html2pdf as any)()
        .set(getPdfOptions())
        .from(element)
        .output("bloburl")
        .then((url: string) => {
          window.open(url, "_blank");
        });
    }
  };

  const handleSavePDF = () => {
    const element = printAreaRef.current;
    if (element) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (html2pdf as any)().set(getPdfOptions()).from(element).save();
    }
  };

  return (
    <Dialog open={!!record} onOpenChange={(open) => !open && onClose()}>
      {/*
        Print-only CSS. Without this, native Print (window.print()) drifts
        from the Open/Save PDF output in two ways:
        1. The dialog keeps its fixed/centered on-screen position and
           viewport-relative width when printed, instead of laying out as a
           plain top-left block — this is reset here via .print-dialog-content.
        2. Browsers strip background colors (the gray header bars) from
           native print by default, even though html2canvas (used for the
           PDFs) always captures them — forced back on via print-color-adjust.
        Together these make native print match the on-screen preview and
        the generated PDFs exactly.
      */}
      <style>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
          }
          .print-dialog-content {
            position: static !important;
            inset: auto !important;
            transform: none !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>
      <DialogContent
        showCloseButton={false}
        className="print-dialog-content rounded-xl border-0 bg-white p-0 shadow-xl flex flex-col print:shadow-none print:m-0 print:p-0 print:border-none"
        style={{ width: "750px", maxWidth: "96vw" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b print:hidden">
          <h2 className="text-xl font-bold">Receipt Preview</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview content */}
        <div className="overflow-auto print:overflow-visible max-h-[70vh] print:max-h-none">
          <div ref={printAreaRef}>
            {record && (
              <PaymentOutReceiptPrint
                record={record}
                businessProfile={businessProfile}
              />
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t flex justify-end gap-3 print:hidden">
          <button
            onClick={handleOpenPDF}
            className="rounded-full px-6 py-2 border border-red-500 text-red-500 font-medium text-sm hover:bg-red-50 transition-colors"
          >
            Open PDF
          </button>
          <button
            onClick={handleSavePDF}
            className="rounded-full px-6 py-2 border border-red-500 text-red-500 font-medium text-sm hover:bg-red-50 transition-colors"
          >
            Download PDF
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-full px-6 py-2 border border-red-500 text-red-500 font-medium text-sm hover:bg-red-50 transition-colors"
          >
            Print
          </button>
          <button
            onClick={onClose}
            className="rounded-full px-6 py-2 bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-colors"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}