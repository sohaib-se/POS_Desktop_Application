interface EstimatesSummaryProps {
  totalQuotations: number;
  totalConverted: number;
}

export function EstimatesSummary({ totalQuotations, totalConverted }: EstimatesSummaryProps) {
  return (
    <div
      className="p-4 bg-white rounded-md shadow-sm shrink-0"
      style={{ marginLeft: "4px", marginRight: "4px" }}
    >
      <div className="max-w-sm bg-[#F6F0FB] rounded-xl p-4 border border-[#E8D7F6]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-[#6B6B83]">Total Quotations</span>
          <span className="flex items-center gap-1 text-xs text-[#E53935] bg-[#FCE8EA] px-2 py-0.5 rounded-full">
            509.09% ↓
          </span>
        </div>
        <p className="text-xl font-bold text-[#1C1F2A]">
          Rs {totalQuotations.toLocaleString()}
        </p>
        <div className="flex items-center gap-3 text-xs text-[#6B6B83] mt-1">
          <span>Converted: Rs {totalConverted.toFixed(2)}</span>
          <span>|</span>
          <span>
            Open: Rs {(totalQuotations - totalConverted).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
