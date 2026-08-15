import { useState } from "react";
import { transactions } from "@/data/mockData";
import { ChevronDown } from "lucide-react";

export function AllTransactions() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterType, setFilterType] = useState("All Transaction");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filterOptions = [
    "All Transaction",
    "Sale",
    "Purchase",
    "Payment-In",
    "Payment-Out",
    "Credit Note",
    "Debit Note",
    "Sale Order",
    "Purchase Order",
    "Estimate",
    "Proforma Invoice",
    "Delivery Challan",
    "Expense",
    "Party to Party [Received]",
    "Party to Party [Paid]"
  ];

  const filteredTransactions = transactions.filter(t => {
    if (filterType !== "All Transaction") {
      if (t.type !== filterType) {
        if (filterType === "Sale" && t.type === "PoS Sale") {
          // Include PoS Sale in Sale
        } else {
          return false;
        }
      }
    }
    
    return true;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Sale':
      case 'PoS Sale':
      case 'Payment-In':
      case 'Receivable Opening Balance':
        return 'bg-green-400';
      case 'Purchase':
      case 'Expense':
      case 'Payment-Out':
      case 'Payable Opening Balance':
        return 'bg-red-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Date Filter Bar */}
      <div className="p-4 bg-white border-b border-gray-200 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 w-10">Date</span>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">From</span>
            <input 
              type="date"
              className="pl-12 pr-8 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 w-40"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">To</span>
            <input 
              type="date"
              className="pl-8 pr-8 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 w-40"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <button className="bg-[#008AC9] hover:bg-[#007AB3] text-white px-6 py-1.5 rounded font-medium text-sm transition-colors shadow-sm">
            SEARCH
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 flex flex-col overflow-hidden">
        <div className="bg-white rounded shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-200 flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">TRANSACTIONS</h2>
          </div>

          {/* Filters Bar */}
          <div className="px-4 py-3 flex items-center relative z-20">
            <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mr-4 w-[160px]">FILTERS</span>
            
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center justify-between w-64 px-3 py-1.5 text-sm border border-orange-400 rounded focus:outline-none focus:ring-1 focus:ring-orange-400 text-gray-700 bg-white"
              >
                <span className="uppercase text-[#008AC9] font-medium text-xs">{filterType}</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              
              {isFilterOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 shadow-lg py-1 rounded max-h-80 overflow-y-auto">
                  {filterOptions.map(option => (
                    <div 
                      key={option}
                      className={`px-4 py-2 text-[13px] cursor-pointer hover:bg-gray-100 transition-colors ${filterType === option ? 'bg-[#1976D2] text-white hover:bg-blue-600' : 'text-gray-700'}`}
                      onClick={() => {
                        setFilterType(option);
                        setIsFilterOpen(false);
                      }}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f9fafb] sticky top-0 z-10 shadow-sm border-y border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase w-40">TYPE</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase border-l border-gray-200">REF NO</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase border-l border-gray-200">NAME</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase border-l border-gray-200">DATE</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase border-l border-gray-200 text-right">TOTAL</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase border-l border-gray-200 text-right">RECEIVE/PAID</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase border-l border-gray-200 text-right">BALANCE</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx, i) => {
                  const receivedPaid = tx.amount - tx.balance;
                  
                  return (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getTypeColor(tx.type)}`}></div>
                          <span className="text-sm text-gray-700">{tx.type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-l border-gray-100">{tx.invoiceNo || tx.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-l border-gray-100">{tx.partyName}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-l border-gray-100">{tx.date}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-l border-gray-100 text-right">
                        Rs {tx.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-l border-gray-100 text-right">
                        Rs {receivedPaid.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-l border-gray-100 text-right">
                        Rs {tx.balance.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500 text-sm">
                      No transactions found for the selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
