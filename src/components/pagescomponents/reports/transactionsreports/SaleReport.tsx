import type { ViewType, SaleInvoiceEditData } from '../../../../types';
import { SaleInvoices } from '../../../../pages/SaleInvoices';

interface SaleReportProps {
  onBack: () => void;
  onViewChange: (view: ViewType) => void;
  onEditInvoice: (invoice: SaleInvoiceEditData) => void;
}

export function SaleReport({ onBack, onViewChange, onEditInvoice }: SaleReportProps) {
  return (
    <div className="h-full w-full relative">
      <SaleInvoices 
        onViewChange={onViewChange} 
        onEditInvoice={onEditInvoice} 
        onBack={onBack} 
      />
    </div>
  );
}
