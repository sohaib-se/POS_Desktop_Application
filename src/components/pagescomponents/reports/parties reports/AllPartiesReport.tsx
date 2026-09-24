import { useSettings } from "@/hooks/useSettings";
import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { ChevronDown, Printer, ArrowLeft, Search } from "lucide-react";
import * as XLSXStyle from "xlsx-js-style";
import type { Party } from "@/types";

interface AllPartiesReportProps {
  onBack: () => void;
}

export function AllPartiesReport({ onBack }: AllPartiesReportProps) {
  const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });
  const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
  const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;

  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParties, setSelectedParties] = useState<number[]>([]);
  
  // Filter state
  const [partyTypeFilter, setPartyTypeFilter] = useState<"All parties" | "Receivable" | "Payable">("All parties");
  const [isPartyTypeMenuOpen, setIsPartyTypeMenuOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const placeholders = ["Party Name", "Phone", "Email"];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showSearchInput &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        !searchQuery
      ) {
        setShowSearchInput(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSearchInput, searchQuery]);

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

    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (normalizedQuery) {
        filtered = filtered.filter((row) => {
            const nameMatch = row.name.toLowerCase().includes(normalizedQuery);
            const phoneMatch = row.phone?.toLowerCase().includes(normalizedQuery);
            const emailMatch = row.email?.toLowerCase().includes(normalizedQuery);
            return nameMatch || phoneMatch || emailMatch;
        });
    }

    return filtered;
  }, [parties, partyTypeFilter, searchQuery]);

  const totalReceivable = visibleParties.reduce((sum, p) => p.balance > 0 ? sum + p.balance : sum, 0);
  const totalPayable = visibleParties.reduce((sum, p) => p.balance < 0 ? sum + Math.abs(p.balance) : sum, 0);

  const handleExportExcel = () => {
    if (visibleParties.length === 0) return;

    const HEADER_BG = "4382FF";
    const HEADER_FONT_COLOR = "FFFFFF";

    const thinBorder = (color: string) => ({ style: "thin" as const, color: { rgb: color } });
    const allBorders = (color: string) => ({
      left: thinBorder(color),
      right: thinBorder(color),
      top: thinBorder(color),
      bottom: thinBorder(color),
    });

    const headerStyle: object = {
      font: { name: "Calibri", sz: 12, bold: true, color: { rgb: HEADER_FONT_COLOR } },
      fill: { patternType: "solid", fgColor: { rgb: HEADER_BG } },
      border: allBorders("CCCCCC"),
      alignment: { horizontal: "center", vertical: "center" },
    };

    const cellLeft: object = {
      font: { name: "Calibri", sz: 11 },
      border: allBorders("E0E0E0"),
      alignment: { horizontal: "left", vertical: "center" },
    };

    const cellRight: object = {
      font: { name: "Calibri", sz: 11 },
      border: allBorders("E0E0E0"),
      alignment: { horizontal: "right", vertical: "center" },
    };

    const headers = [
      "#",
      "PARTY NAME",
      "EMAIL",
      "PHONE NO.",
      "RECEIVABLE BALANCE",
      "PAYABLE BALANCE",
      "CREDIT LIMIT"
    ];

    const ws: Record<string, any> = {};

    headers.forEach((h, colIdx) => {
      const cellRef = XLSXStyle.utils.encode_cell({ r: 0, c: colIdx });
      ws[cellRef] = { v: h, t: "s", s: headerStyle };
    });

    visibleParties.forEach((party, rowIdx) => {
      const r = rowIdx + 1;
      const receivable = party.balance > 0 ? party.balance : 0;
      const payable = party.balance < 0 ? Math.abs(party.balance) : 0;
      
      const rowData = [
        { v: r.toString(), t: "s" as const },
        { v: party.name, t: "s" as const },
        { v: party.email || "---", t: "s" as const },
        { v: party.phone || "---", t: "s" as const },
        { v: receivable > 0 ? `${currencyStr} ${receivable.toFixed(2)}` : "---", t: "s" as const },
        { v: payable > 0 ? `${currencyStr} ${payable.toFixed(2)}` : "---", t: "s" as const },
        { v: party.creditLimit ? `${currencyStr} ${party.creditLimit}` : "---", t: "s" as const },
      ];

      rowData.forEach((cell, colIdx) => {
        const cellRef = XLSXStyle.utils.encode_cell({ r, c: colIdx });
        ws[cellRef] = { ...cell, s: colIdx >= 4 ? cellRight : cellLeft };
      });
    });

    ws["!ref"] = XLSXStyle.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: Math.max(0, visibleParties.length), c: headers.length - 1 },
    });

    ws["!cols"] = [
      { wch: 6 },  // #
      { wch: 24 }, // PARTY NAME
      { wch: 24 }, // EMAIL
      { wch: 16 }, // PHONE NO.
      { wch: 20 }, // RECEIVABLE BALANCE
      { wch: 20 }, // PAYABLE BALANCE
      { wch: 16 }, // CREDIT LIMIT
    ];

    ws["!rows"] = [{ hpt: 22 }, ...visibleParties.map(() => ({ hpt: 18 }))];

    const wb = XLSXStyle.utils.book_new();
    XLSXStyle.utils.book_append_sheet(wb, ws, "All Parties");

    XLSXStyle.writeFile(wb, "All_Parties_Report.xlsx");
  };

  const handlePrint = () => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const html = `
      <html>
        <head>
          <title>All Parties Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h2 { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: bold; }
            td.right { text-align: right; }
            td.center { text-align: center; }
            .totals { margin-top: 20px; font-weight: bold; font-size: 16px; display: flex; justify-content: space-between; }
            .totals .receive { color: #10B981; }
            .totals .pay { color: #EF4444; }
          </style>
        </head>
        <body>
          <h2>All Parties Report</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Party Name</th>
                <th>Email</th>
                <th>Phone No.</th>
                <th class="right">Receivable Balance</th>
                <th class="right">Payable Balance</th>
                <th class="right">Credit Limit</th>
              </tr>
            </thead>
            <tbody>
              ${visibleParties.map((party, i) => {
                const receivable = party.balance > 0 ? party.balance : null;
                const payable = party.balance < 0 ? Math.abs(party.balance) : null;
                return `
                <tr>
                  <td class="center">${i + 1}</td>
                  <td>${party.name}</td>
                  <td>${party.email || '---'}</td>
                  <td>${party.phone || '---'}</td>
                  <td class="right">${receivable !== null ? `${currencyStr} ${receivable.toLocaleString(undefined, {minimumFractionDigits: 2})}` : '---'}</td>
                  <td class="right">${payable !== null ? `${currencyStr} ${payable.toLocaleString(undefined, {minimumFractionDigits: 2})}` : '---'}</td>
                  <td class="right">${party.creditLimit ? `${currencyStr} ${party.creditLimit.toLocaleString()}` : '---'}</td>
                </tr>
                `;
              }).join("")}
            </tbody>
          </table>
          <div class="totals">
            <div>Total Receivable: <span class="receive">${currencyStr} ${totalReceivable.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
            <div>Total Payable: <span class="pay">${currencyStr} ${totalPayable.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
          </div>
        </body>
      </html>
    `;

    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 250);
    } else {
      document.body.removeChild(iframe);
    }
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
          <div className="flex gap-2 items-center h-10" ref={searchContainerRef}>
            <div 
              className={`flex items-center overflow-hidden transition-all duration-300 ease-out rounded-full h-9 ${
                showSearchInput 
                  ? "w-64 bg-white border border-blue-500 ring-4 ring-blue-50 mr-2" 
                  : "w-9 bg-transparent border border-transparent hover:bg-gray-100 cursor-pointer"
              }`}
              onClick={(e) => {
                if (!showSearchInput) {
                  e.stopPropagation();
                  setShowSearchInput(true);
                  setIsPartyTypeMenuOpen(false);
                  setTimeout(() => searchInputRef.current?.focus(), 150);
                }
              }}
            >
              <div className="flex items-center justify-center h-full w-9 shrink-0">
                <Search className={`w-4 h-4 ${showSearchInput ? "text-gray-400" : "text-gray-500"}`} />
              </div>
              <div className={`relative flex-1 h-full flex items-center transition-opacity duration-200 ${
                  showSearchInput ? "opacity-100 delay-100" : "opacity-0"
                }`}>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none focus:ring-0 focus:outline-none focus:border-transparent text-sm h-full w-full pr-3 relative z-10"
                />
                {!searchQuery && (
                  <div className="absolute left-0 pointer-events-none flex items-center h-full w-full overflow-hidden text-gray-400 text-sm">
                    <span className="whitespace-pre">Search </span>
                    <div className="relative h-full flex-1 overflow-hidden">
                      {placeholders.map((ph, idx) => (
                        <span
                          key={ph}
                          className={`absolute top-0 left-0 flex items-center h-full transition-all duration-700 ease-in-out ${
                            idx === placeholderIndex ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                          }`}
                        >
                          {ph}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button 
            onClick={handleExportExcel}
            className="flex flex-col items-center justify-center gap-1 text-gray-700 hover:text-gray-900"
          >
            <span className="bg-[#1D6F42] text-white text-[10px] font-bold px-1 py-0.5 rounded-sm leading-none flex items-center justify-center h-5">
              xls
            </span>
            <span className="text-[11px] font-medium leading-none">Excel Report</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-1 text-gray-700 hover:text-gray-900" onClick={handlePrint}>
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
                            <span className="text-green-500 font-medium">{currencyStr} {receivable.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                          ) : (
                            <span className="text-gray-900">---</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right border-r border-white/50">
                          {payable !== null ? (
                            <span className="text-red-500 font-medium">{currencyStr} {payable.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                          ) : (
                            <span className="text-gray-900">---</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900">
                          {party.creditLimit ? `${currencyStr} ${party.creditLimit.toLocaleString()}` : '---'}
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
              Total Receivable: <span className="text-green-500 ml-1">{currencyStr} {totalReceivable.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            <div className="text-gray-600">
              Total Payable: <span className="text-red-500 ml-1">{currencyStr} {totalPayable.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
