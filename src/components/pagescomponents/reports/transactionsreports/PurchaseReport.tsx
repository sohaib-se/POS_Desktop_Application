import { PurchaseBills } from '../../../../pages/PurchaseBills';

interface PurchaseReportProps {
  onBack: () => void;
}

export function PurchaseReport({ onBack }: PurchaseReportProps) {
  return (
    <div className="h-full w-full relative">
      <PurchaseBills onBack={onBack} />
    </div>
  );
}
