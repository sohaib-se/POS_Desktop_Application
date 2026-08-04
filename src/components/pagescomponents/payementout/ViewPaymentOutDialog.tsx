import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface ViewPaymentOutDialogProps {
  viewingRecord: any;
  setViewingRecord: (record: any) => void;
}

export function ViewPaymentOutDialog({
  viewingRecord,
  setViewingRecord,
}: ViewPaymentOutDialogProps) {
  return (
    <Dialog
      open={Boolean(viewingRecord)}
      onOpenChange={(isOpen) => {
        if (!isOpen) setViewingRecord(null);
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-w-md rounded-lg border-0 bg-white p-0 shadow-xl"
      >
        {viewingRecord && (
          <div className="flex flex-col bg-white">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                View Transaction
              </h2>
              <button
                onClick={() => setViewingRecord(null)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 text-sm">Date</span>
                <span className="font-medium">{viewingRecord.date}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 text-sm">Ref. No</span>
                <span className="font-medium">
                  {viewingRecord.reference || "-"}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 text-sm">Party Name</span>
                <span className="font-medium">{viewingRecord.partyName}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 text-sm">Payment Type</span>
                <span className="font-medium">{viewingRecord.paymentType}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-gray-500 text-sm">Amount</span>
                <span className="font-bold text-gray-900">
                  Rs {viewingRecord.amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
