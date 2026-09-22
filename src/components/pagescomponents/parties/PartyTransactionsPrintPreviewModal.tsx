import { X } from "lucide-react";
import html2pdf from "html2pdf.js";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PartyTransactionsPrintReport } from "./PartyTransactionsPrintReport";
import type { PartyTransactionRow } from "./PartyDetails";

interface PartyTransactionsPrintPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  records: PartyTransactionRow[];
  partyName: string;
  selectedMonth: string;
  businessProfile?: any;
}

export function PartyTransactionsPrintPreviewModal({
  open,
  onOpenChange,
  records,
  partyName,
  selectedMonth,
  businessProfile,
}: PartyTransactionsPrintPreviewModalProps) {
  const getPdfOptions = () => ({
    margin: 10,
    filename: `Party_Transactions_${partyName.replace(/\s+/g, "_")}.pdf`,
    image: { type: "jpeg", quality: 1 },
    html2canvas: { scale: 2, useCORS: true, windowWidth: 794 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  });

  const handleOpenPDF = () => {
    const element = document.querySelector(".print-area") as HTMLElement;
    if (element) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (html2pdf as any)().set(getPdfOptions()).from(element).output("bloburl").then((url: string) => {
        window.open(url, "_blank");
      });
    }
  };

  const handleSavePDF = () => {
    const element = document.querySelector(".print-area") as HTMLElement;
    if (element) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (html2pdf as any)().set(getPdfOptions()).from(element).save();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          .party-print-dialog-content {
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
            margin: 25mm 0 10mm 0;
          }
        }
      `}</style>
      <DialogContent
        showCloseButton={false}
        className="party-print-dialog-content rounded-xl border-0 bg-white p-0 shadow-xl flex flex-col print:shadow-none print:m-0 print:p-0 print:border-none"
        style={{ width: "750px", maxWidth: "96vw" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b print:hidden">
          <h2 className="text-xl font-bold">Preview</h2>
          <button onClick={() => onOpenChange(false)} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report Content */}
        <div className="overflow-auto max-h-[65vh] print:overflow-visible print:max-h-none">
          <PartyTransactionsPrintReport
            records={records}
            partyName={partyName}
            selectedMonth={selectedMonth}
            businessProfile={businessProfile}
          />
        </div>

        {/* Action Buttons */}
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
            onClick={() => onOpenChange(false)}
            className="rounded-full px-6 py-2 bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-colors"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
