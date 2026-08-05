import { SharedModal } from "./SharedModal";

interface DetailsModalProps {
  open: boolean;
  onClose: () => void;
  transaction: any;
}

export function DetailsModal({ open, onClose, transaction }: DetailsModalProps) {
  if (!transaction) return null;
  return (
    <SharedModal open={open} onClose={onClose} title="Transaction Details">
      <div className="space-y-4">
        <div>
          <span className="block text-sm text-gray-500">Date</span>
          <span className="text-gray-900 font-medium">{transaction.date}</span>
        </div>
        <div>
          <span className="block text-sm text-gray-500">Name / Description</span>
          <span className="text-gray-900 font-medium">{transaction.name.replace(' (Payment In)', '').replace(' (Payment Out)', '').replace(' (Received)', '')}</span>
        </div>
        <div>
          <span className="block text-sm text-gray-500">Type</span>
          <span className="text-gray-900 font-medium">{transaction.type}</span>
        </div>
        <div>
          <span className="block text-sm text-gray-500">Amount</span>
          <span className="text-gray-900 font-medium">Rs {Number(transaction.amount).toLocaleString()}</span>
        </div>
      </div>
    </SharedModal>
  );
}
