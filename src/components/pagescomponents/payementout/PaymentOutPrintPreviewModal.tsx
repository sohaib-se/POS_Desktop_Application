import { X } from "lucide-react";
import html2pdf from "html2pdf.js";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PaymentOutPrintReport } from "./PaymentOutPrintReport";

interface PaymentOutPrintPreviewModalProps {
  showPrintPreview: boolean;
  setShowPrintPreview: (show: boolean) => void;
  records: any[];
  selectedPartyName: string;
  selectedMonth: string;
  businessProfile: any;
}

export function PaymentOutPrintPreviewModal({
  showPrintPreview,
  setShowPrintPreview,
  records,
  selectedPartyName,
  selectedMonth,
  businessProfile,
}: PaymentOutPrintPreviewModalProps) {
  const getPdfOptions = () => ({
    margin: 10,
    filename: 'PaymentOutReport.pdf',
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 2, useCORS: true, windowWidth: 794 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  });

  const handleOpenPDF = () => {
    const element = document.querySelector('.print-area') as HTMLElement;
    if (element) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (html2pdf as any)().set(getPdfOptions()).from(element).output('bloburl').then((url: string) => {
        window.open(url, '_blank');
      });
    }
  };

  const handleSavePDF = () => {
    const element = document.querySelector('.print-area') as HTMLElement;
    if (element) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (html2pdf as any)().set(getPdfOptions()).from(element).save();
    }
  };

  return (
    <Dialog open={showPrintPreview} onOpenChange={setShowPrintPreview}>
      {/*
        Print-only CSS, kept local to this modal so it works no matter which
        page renders it (previously this fix only existed as a global
        <style> block on the Payment-In page, which "leaked" and happened to
        fix the Payment-In modal too, but never reached Payment-Out).
        - Hides everything on the page except .print-area, so the
          underlying list page behind the dialog doesn't spill onto a
          second printed sheet.
        - Anchors .print-area at the top-left of the printed page instead
          of wherever it happened to sit in the page's normal flow, which
          is what was causing the inconsistent top margin.
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
            padding: 15mm !important;
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
        <div className="flex items-center justify-between p-4 border-b print:hidden">
          <h2 className="text-xl font-bold">Preview</h2>
          <button onClick={() => setShowPrintPreview(false)} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-visible print:overflow-visible">
          <PaymentOutPrintReport
            records={records}
            selectedPartyName={selectedPartyName}
            selectedMonth={selectedMonth}
            businessProfile={businessProfile}
          />
        </div>
        <div className="p-4 border-t flex justify-end gap-3 print:hidden">
          <button
            onClick={handleOpenPDF}
            className="rounded-full px-6 py-2 border border-red-500 text-red-500 font-medium text-sm hover:bg-red-50 transition-colors"
          >
            Open PDF
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-full px-6 py-2 border border-red-500 text-red-500 font-medium text-sm hover:bg-red-50 transition-colors"
          >
            Print
          </button>
          <button
            onClick={handleSavePDF}
            className="rounded-full px-6 py-2 border border-red-500 text-red-500 font-medium text-sm hover:bg-red-50 transition-colors"
          >
            Save PDF
          </button>
          <button
            onClick={() => setShowPrintPreview(false)}
            className="rounded-full px-6 py-2 bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-colors"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}