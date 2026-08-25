import { useSettings } from "@/hooks/useSettings";

interface PaymentInPrintReportProps {
  records: any[];
  selectedPartyName: string;
  selectedMonth: string;
  businessProfile?: any;
}

export function PaymentInPrintReport({
  records,
  selectedPartyName,
  selectedMonth,
  businessProfile,
}: PaymentInPrintReportProps) {
  const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });
  const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
  const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;

  let startDateStr = "";
  let endDateStr = "";
  if (selectedMonth) {
    const [year, month] = selectedMonth.split('-');
    if (year && month) {
      startDateStr = `01/${month}/${year}`;
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      endDateStr = `${lastDay}/${month}/${year}`;
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
    <div className="hidden print:block print-area bg-white text-black p-8 font-sans">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-1">{businessProfile?.business_name || "Laimsoft"}</h1>
        <p className="text-sm">Phone no.: {businessProfile?.phone_number || "3369322038"}</p>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-xl font-bold underline inline-block">All Transactions Report</h2>
      </div>

      <div className="mb-6 space-y-3">
        <div className="flex gap-2 text-base">
          <span className="font-bold">Party name:</span>
          <span className="font-bold">All parties</span>
        </div>
        <div className="flex gap-2 text-base">
          <span className="font-bold">Transaction type:</span>
          <span className="font-bold">Payment-In</span>
        </div>
        <div className="flex gap-2 text-base">
          <span className="font-bold">Month:</span>
          <span className="font-bold">
            {selectedMonth ? new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "All Time"}
          </span>
        </div>
      </div>

      <table className="w-full text-sm mb-6 border-collapse">
        <thead className="bg-[#D3D3D3]" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
          <tr className="border-b border-black text-left">
            <th className="py-1 px-2 font-bold whitespace-nowrap">DATE</th>
            <th className="py-1 px-2 font-bold whitespace-nowrap">Ref No.</th>
            <th className="py-1 px-2 font-bold">Party Name</th>
            <th className="py-1 px-2 font-bold">TYPE</th>
            <th className="py-1 px-2 font-bold text-center">TOTAL</th>
            <th className="py-1 px-2 font-bold text-center">PAYMENT<br />TYPE</th>
            <th className="py-1 px-2 font-bold text-center">Received</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, idx) => (
            <tr key={record.id || idx} className="border-b border-black text-sm">
              <td className="py-1 px-2 whitespace-nowrap">{formatDate(record.date)}</td>
              <td className="py-1 px-2">{record.receiptNo || record.receipt_no || ""}</td>
              <td className="py-1 px-2">{record.partyName || record.party_name || ""}</td>
              <td className="py-1 px-2">Payment-<br/>In</td>
              <td className="py-1 px-2 text-center whitespace-nowrap">{currencyStr} {Number(record.amount || 0).toFixed(2)}</td>
              <td className="py-1 px-2 text-center">{record.paymentType || record.payment_type || ""}</td>
              <td className="py-1 px-2 text-center whitespace-nowrap">{currencyStr} {Number(record.amount || 0).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end pr-2">
        <div className="text-xl font-bold">
          Total: {currencyStr} {totalAmount.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
