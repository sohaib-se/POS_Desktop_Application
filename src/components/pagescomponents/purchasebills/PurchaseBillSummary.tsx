import { useSettings } from "@/hooks/useSettings";

interface PurchaseBillSummaryProps {
  totalPurchase: number;
  totalPaid: number;
  totalUnpaid: number;
}

export function PurchaseBillSummary({ totalPurchase, totalPaid, totalUnpaid }: PurchaseBillSummaryProps) {
  const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });
  const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
  const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;

  return (
    <div
      className="p-4 bg-white rounded-md shadow-sm shrink-0"
      style={{ marginLeft: "4px", marginRight: "4px" }}
    >
      <div className="max-w-sm bg-[#F6F0FB] rounded-xl p-4 border border-[#E8D7F6]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-[#6B6B83]">Total Purchase Amount</span>
          <span className="flex items-center gap-1 text-xs text-[#E53935] bg-[#FCE8EA] px-2 py-0.5 rounded-full">
            18.31% ↓
          </span>
        </div>
        <p className="text-xl font-bold text-[#1C1F2A]">
          {currencyStr} {totalPurchase.toLocaleString()}
        </p>
        <div className="flex items-center gap-3 text-xs text-[#6B6B83] mt-1">
          <span>Paid: {currencyStr} {totalPaid.toLocaleString()}</span>
          <span>|</span>
          <span>Unpaid: {currencyStr} {totalUnpaid.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
