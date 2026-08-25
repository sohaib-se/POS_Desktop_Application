import { useSettings } from "@/hooks/useSettings";

interface PaymentInPrintReportProps {
  records: any[];
  selectedPartyName: string;
  selectedMonth: string;
  businessProfile?: any;
}

export function PaymentInPrintReport({
  records,
  selectedMonth,
  businessProfile,
}: PaymentInPrintReportProps) {
  const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });
  const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
  const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;

  let monthDisplay = "All Time";
  if (selectedMonth) {
    const [year, month] = selectedMonth.split('-');
    if (year && month) {
      const date = new Date(parseInt(year), parseInt(month) - 1);
      monthDisplay = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  }

  const totalAmount = records.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
      }
    } else if (dateStr.includes('-')) {
      const parts = dateStr.split('T')[0].split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return `${parts[0]}/${parts[1]}/${parts[2]}`;
      }
    }
    return dateStr;
  };

  return (
    // Fixed print-safe width (≈ A4 width @96dpi) instead of inheriting the
    // dialog's 80vw, so on-screen preview, native print, and html2pdf
    // capture all render at the same consistent size.
    <div className="print-area bg-white text-black font-sans w-full max-w-[794px] mx-auto px-10 py-6">
      {/* Business Header */}
      <div className="text-center mb-4">
        <h1 className="text-base font-bold">{businessProfile?.business_name || "Laimsoft"}</h1>
        <p className="text-xs text-gray-600">Phone no.: {businessProfile?.phone || ""}</p>
      </div>

      {/* Report Title */}
      <div className="text-center mb-5">
        <h2 className="text-lg font-bold underline inline-block">All Transactions Report</h2>
      </div>

      {/* Meta Info */}
      <div className="mb-4 space-y-1.5">
        <p className="text-sm font-bold">Party name: All Parties</p>
        <p className="text-sm font-bold">Transaction type: Payment-In</p>
        <p className="text-sm font-bold">
          Month: {monthDisplay}
        </p>
      </div>

      {/* Table */}
      <table className="w-full text-xs mb-4 border-collapse">
        <thead style={{ backgroundColor: '#D3D3D3', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
          <tr className="border border-gray-500 text-left">
            <th className="py-1.5 px-2 font-bold border-r border-gray-500 whitespace-nowrap">DATE</th>
            <th className="py-1.5 px-2 font-bold border-r border-gray-500 whitespace-nowrap">Receipt No.</th>
            <th className="py-1.5 px-2 font-bold border-r border-gray-500">Party Name</th>
            <th className="py-1.5 px-2 font-bold border-r border-gray-500">TYPE</th>
            <th className="py-1.5 px-2 font-bold border-r border-gray-500 text-right">TOTAL</th>
            <th className="py-1.5 px-2 font-bold border-r border-gray-500 text-center">PAYMENT<br />TYPE</th>
            <th className="py-1.5 px-2 font-bold text-right">Received</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, idx) => (
            <tr key={record.id || idx} className="border-b border-gray-300 text-xs">
              <td className="py-1 px-2 whitespace-nowrap border-r border-gray-300">{formatDate(record.date)}</td>
              <td className="py-1 px-2 border-r border-gray-300">{record.receiptNo || record.receipt_no || ""}</td>
              <td className="py-1 px-2 border-r border-gray-300">{record.partyName || record.party_name || ""}</td>
              <td className="py-1 px-2 border-r border-gray-300">Payment-In</td>
              <td className="py-1 px-2 text-right whitespace-nowrap border-r border-gray-300">{currencyStr} {Number(record.amount || 0).toFixed(2)}</td>
              <td className="py-1 px-2 text-center border-r border-gray-300">{record.paymentType || record.payment_type || ""}</td>
              <td className="py-1 px-2 text-right whitespace-nowrap">{currencyStr} {Number(record.amount || 0).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total */}
      <div className="flex justify-end">
        <p className="text-sm font-bold">Total: {currencyStr} {totalAmount.toFixed(2)}</p>
      </div>
    </div>
  );
}