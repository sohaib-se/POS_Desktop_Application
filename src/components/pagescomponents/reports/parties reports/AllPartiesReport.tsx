import { useCallback, useEffect, useState, useMemo } from "react";
import { ChevronDown, Printer, ArrowLeft } from "lucide-react";
import type { Party } from "@/types";

interface AllPartiesReportProps {
  onBack: () => void;
}

export function AllPartiesReport({ onBack }: AllPartiesReportProps) {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParties, setSelectedParties] = useState<number[]>([]);
  
  // Filter state
  const [partyTypeFilter, setPartyTypeFilter] = useState<"All parties" | "Receivable" | "Payable">("All parties");
  const [isPartyTypeMenuOpen, setIsPartyTypeMenuOpen] = useState(false);

  useEffect(() => {
    const closeMenus = () => {
      setIsPartyTypeMenuOpen(false);
    };
    window.addEventListener("click", closeMenus);
    return () => window.removeEventListener("click", closeMenus);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const partiesRes = await fetch("/api/parties").catch(() => null);
      
      if (partiesRes && partiesRes.ok) {
        const data = await partiesRes.json();
        const mapped: Party[] = data.map((party: any) => ({
          id: party.id,
          name: party.name,
          phone: party.phone,
          email: party.email ?? undefined,
          address: party.address ?? undefined,
          shippingAddress: party.shipping_address ?? undefined,
          balance: Number(party.balance ?? 0),
          creditLimit: party.credit_limit ? Number(party.credit_limit) : undefined,
          type: party.type,
        }));
        mapped.sort((a, b) => a.name.localeCompare(b.name));
        setParties(mapped);
      }
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const visibleParties = useMemo(() => {
    let filtered = parties;

    if (partyTypeFilter === "Receivable") {
      filtered = filtered.filter(p => p.balance > 0);
    } else if (partyTypeFilter === "Payable") {
      filtered = filtered.filter(p => p.balance < 0);
    }

    return filtered;
  }, [parties, partyTypeFilter]);

  const totalReceivable = visibleParties.reduce((sum, p) => p.balance > 0 ? sum + p.balance : sum, 0);
  const totalPayable = visibleParties.reduce((sum, p) => p.balance < 0 ? sum + Math.abs(p.balance) : sum, 0);

  const handleExportExcel = () => {
    if (visibleParties.length === 0) return;

    const headers = [
      "#",
      "PARTY NAME",
      "EMAIL",
      "PHONE NO.",
      "RECEIVABLE BALANCE",
      "PAYABLE BALANCE",
      "CREDIT LIMIT"
    ];

    const rows = visibleParties.map((party, index) => {
      const receivable = party.balance > 0 ? party.balance : 0;
      const payable = party.balance < 0 ? Math.abs(party.balance) : 0;
      return [
        index + 1,
        `"${party.name.replace(/"/g, '""')}"`,
        `"${party.email || ''}"`,
        `"${party.phone || ''}"`,
        receivable.toFixed(2),
        payable.toFixed(2),
        party.creditLimit ? party.creditLimit : ""
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `All_Parties_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedParties(visibleParties.map(p => p.id));
    } else {
      setSelectedParties([]);
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedParties(prev => 
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#F4F5F8] w-full">
      {/* Top action bar area */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full transition-colors -ml-2 text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <h2 className="text-xl font-semibold text-gray-800 -ml-2">All Parties</h2>
          
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsPartyTypeMenuOpen(!isPartyTypeMenuOpen);
              }}
              className="flex items-center justify-between w-48 px-3 py-1.5 border border-gray-300 rounded bg-white text-sm hover:bg-gray-50"
            >
              <span className="text-gray-700">{partyTypeFilter}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {isPartyTypeMenuOpen && (
              <div 
                className="absolute left-0 top-full mt-1 z-20 w-48 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {["All parties", "Receivable", "Payable"].map((option) => (
                  <button
                    key={option}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                    onClick={() => {
                      setPartyTypeFilter(option as any);
                      setIsPartyTypeMenuOpen(false);
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 pr-4">
          <button 
            onClick={handleExportExcel}
            className="flex flex-col items-center justify-center gap-1 text-gray-700 hover:text-gray-900"
          >
            <span className="bg-[#1D6F42] text-white text-[10px] font-bold px-1 py-0.5 rounded-sm leading-none flex items-center justify-center h-5">
              xls
            </span>
            <span className="text-[11px] font-medium leading-none">Excel Report</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-1 text-gray-700 hover:text-gray-900" onClick={() => window.print()}>
            <Printer className="w-5 h-5" />
            <span className="text-[11px] font-medium leading-none">Print</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col pt-2 overflow-hidden bg-white mt-1 mx-2">
        <div className="bg-white flex-1 flex flex-col overflow-hidden">
          
          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-white sticky top-0 border-b border-gray-200 z-10">
                <tr>
                  <th className="px-4 py-3 w-12 border-r border-gray-100">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={visibleParties.length > 0 && selectedParties.length === visibleParties.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-500 w-16 border-r border-gray-100">
                    #
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-500 border-r border-gray-100">
                    PARTY NAME
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-500 border-r border-gray-100">
                    EMAIL
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-500 border-r border-gray-100">
                    PHONE NO.
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-500 border-r border-gray-100">
                    RECEIVABLE BALANCE
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-500 border-r border-gray-100">
                    PAYABLE BALANCE
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-500">
                    CREDIT LIMIT
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      Loading parties...
                    </td>
                  </tr>
                ) : visibleParties.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      No parties found.
                    </td>
                  </tr>
                ) : (
                  visibleParties.map((party, index) => {
                    const receivable = party.balance > 0 ? party.balance : null;
                    const payable = party.balance < 0 ? Math.abs(party.balance) : null;
                    const isSelected = selectedParties.includes(party.id);
                    
                    return (
                      <tr 
                        key={party.id} 
                        className={`transition-colors ${isSelected ? 'bg-[#D1EAF5]' : 'hover:bg-gray-50/50'}`}
                      >
                        <td className="px-4 py-3 border-r border-white/50">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={isSelected}
                            onChange={() => handleSelectOne(party.id)}
                          />
                        </td>
                        <td className="px-4 py-3 text-gray-900 border-r border-white/50">{index + 1}</td>
                        <td className="px-4 py-3 text-gray-900 font-medium border-r border-white/50">{party.name}</td>
                        <td className="px-4 py-3 text-gray-500 border-r border-white/50">{party.email || '---'}</td>
                        <td className="px-4 py-3 text-gray-900 border-r border-white/50">{party.phone || '---'}</td>
                        <td className="px-4 py-3 text-right border-r border-white/50">
                          {receivable !== null ? (
                            <span className="text-green-500 font-medium">Rs {receivable.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                          ) : (
                            <span className="text-gray-900">---</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right border-r border-white/50">
                          {payable !== null ? (
                            <span className="text-red-500 font-medium">Rs {payable.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                          ) : (
                            <span className="text-gray-900">---</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900">
                          {party.creditLimit ? `Rs ${party.creditLimit.toLocaleString()}` : '---'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Totals */}
          <div className="bg-white border-t border-gray-200 p-4 px-6 flex justify-between items-center text-[15px] sticky bottom-0">
            <div className="text-gray-600">
              Total Receivable: <span className="text-green-500 ml-1">Rs {totalReceivable.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            <div className="text-gray-600">
              Total Payable: <span className="text-red-500 ml-1">Rs {totalPayable.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
