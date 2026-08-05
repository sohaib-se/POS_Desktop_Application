import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SaleInvoiceViewRow } from "./types";
import { parseLineItems } from "./utils";

interface SaleInvoiceDialogProps {
  viewingInvoice: SaleInvoiceViewRow | null;
  setViewingInvoice: (invoice: SaleInvoiceViewRow | null) => void;
}

export function SaleInvoiceDialog({ viewingInvoice, setViewingInvoice }: SaleInvoiceDialogProps) {
  return (
    <Dialog
      open={Boolean(viewingInvoice)}
      onOpenChange={(open) => {
        if (!open) {
          setViewingInvoice(null);
        }
      }}
    >
      <DialogContent className="max-w-4xl w-[min(96vw,56rem)] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>

        {viewingInvoice && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="text-gray-500">Invoice No</div>
                <div className="font-semibold text-gray-900">{viewingInvoice.invoiceNo}</div>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="text-gray-500">Date</div>
                <div className="font-semibold text-gray-900">{viewingInvoice.date}</div>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="text-gray-500">Party Name</div>
                <div className="font-semibold text-gray-900">{viewingInvoice.partyName}</div>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="text-gray-500">Payment Type</div>
                <div className="font-semibold text-gray-900">{viewingInvoice.paymentType}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="text-gray-500">Subtotal</div>
                <div className="font-semibold text-gray-900">Rs {Number(viewingInvoice.subtotal ?? 0).toLocaleString()}</div>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="text-gray-500">Discount</div>
                <div className="font-semibold text-gray-900">Rs {Number(viewingInvoice.discountAmount ?? 0).toLocaleString()}</div>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="text-gray-500">Tax</div>
                <div className="font-semibold text-gray-900">{viewingInvoice.taxLabel ?? "NONE"} - Rs {Number(viewingInvoice.taxAmount ?? 0).toLocaleString()}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="text-gray-500">Round Off</div>
                <div className="font-semibold text-gray-900">Rs {Number(viewingInvoice.roundOffAmount ?? 0).toLocaleString()}</div>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="text-gray-500">Amount</div>
                <div className="font-semibold text-gray-900">Rs {Number(viewingInvoice.amount).toLocaleString()}</div>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="text-gray-500">Balance</div>
                <div className="font-semibold text-gray-900">Rs {Number(viewingInvoice.balance).toLocaleString()}</div>
              </div>
            </div>

            {viewingInvoice.description && (
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="text-gray-500 mb-1">Description</div>
                <div className="text-gray-900">{viewingInvoice.description}</div>
              </div>
            )}

            {parseLineItems(viewingInvoice.lineItemsJson).length > 0 && (
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="text-gray-500 mb-2">Line Items</div>
                <div className="overflow-hidden rounded-md border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Item</th>
                        <th className="px-3 py-2 text-right font-medium">Qty</th>
                        <th className="px-3 py-2 text-left font-medium">Unit</th>
                        <th className="px-3 py-2 text-right font-medium">Price</th>
                        <th className="px-3 py-2 text-right font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parseLineItems(viewingInvoice.lineItemsJson).map((lineItem, index) => (
                        <tr key={lineItem.id ?? `${lineItem.name ?? "item"}-${index}`} className="border-t border-gray-100">
                          <td className="px-3 py-2 text-gray-900">{lineItem.name ?? "-"}</td>
                          <td className="px-3 py-2 text-right text-gray-700">{Number(lineItem.quantity ?? 0).toLocaleString()}</td>
                          <td className="px-3 py-2 text-gray-700">{lineItem.unit ?? "-"}</td>
                          <td className="px-3 py-2 text-right text-gray-700">Rs {Number(lineItem.price ?? 0).toLocaleString()}</td>
                          <td className="px-3 py-2 text-right text-gray-700">Rs {Number(lineItem.amount ?? 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setViewingInvoice(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
