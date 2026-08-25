import { X } from "lucide-react";
import html2pdf from "html2pdf.js";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PaymentInPrintReport } from "./PaymentInPrintReport";

interface PaymentInPrintPreviewModalProps {
  showPrintPreview: boolean;
  setShowPrintPreview: (show: boolean) => void;
  records: any[];
  selectedPartyName: string;
  selectedMonth: string;
  businessProfile: any;
}

export function PaymentInPrintPreviewModal({
  showPrintPreview,
  setShowPrintPreview,
  records,
  selectedPartyName,
  selectedMonth,
  businessProfile,
}: PaymentInPrintPreviewModalProps) {
  const getPdfOptions = () => ({
    margin: 10,
    filename: 'PaymentInReport.pdf',
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
      <DialogContent
        showCloseButton={false}
        className="print-dialog-content rounded-xl border-0 bg-white p-0 shadow-xl flex flex-col print:shadow-none print:m-0 print:p-0 print:border-none"
        style={{ width: '50vw', maxWidth: '50vw' }}
      >
        <div className="flex items-center justify-between p-4 border-b print:hidden">
          <h2 className="text-xl font-bold">Preview</h2>
          <button onClick={() => setShowPrintPreview(false)} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-visible print:overflow-visible">
          <PaymentInPrintReport
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
