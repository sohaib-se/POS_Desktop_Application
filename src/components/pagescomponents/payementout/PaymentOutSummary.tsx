import { useSettings } from "@/hooks/useSettings";

interface PaymentOutSummaryProps {
  totalAmount: number;
  totalPaid: number;
  totalOpen: number;
}

export function PaymentOutSummary({ totalAmount, totalPaid, totalOpen }: PaymentOutSummaryProps) {
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
          <span className="text-sm text-[#6B6B83]">Total Amount</span>
        </div>
        <p className="text-xl font-bold text-[#1C1F2A]">
          {currencyStr} {totalAmount.toLocaleString()}
        </p>
        <div className="flex items-center gap-3 text-xs text-[#6B6B83] mt-1">
          <span>Paid: {currencyStr} {totalPaid.toFixed(2)}</span>
          <span>|</span>
          <span>Open: {currencyStr} {totalOpen.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
