import { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  Calendar,
  ChevronDown,
  Plus,
  X,
  Settings,
  Minus,
  FileText,
  ChevronRight,
  Square,
  AlertCircle
} from "lucide-react";

interface LaimsoftPosProps {
  onClose?: () => void;
}

interface PartyOption {
  id: number;
  name: string;
  phone: string;
  balance: number;
  type: "customer" | "supplier" | "both";
}

interface ItemOption {
  id: string;
  name: string;
  code?: string;
  sale_price?: number;
  unit: string;
  primary_unit?: string | null;
  secondary_unit?: string | null;
  conversion_rate?: number | null;
  mfg_date?: string | null;
  exp_date?: string | null;
  wholesale_price?: number;
  min_stock?: number | null;
}

interface BankOption {
  id: number;
  name: string;
  account_number?: string;
}

interface PosRow {
  id: number;
  itemId: string;
  itemCode: string;
  itemName: string;
  qty: string;
  unit: string;
  pricePerUnit: string;
}

interface PosTab {
  id: number;
  invoiceNo: string;
  date: string;
  rows: PosRow[];
  paymentMode: string;
  amountReceived: string;
  isAmountReceivedDirty: boolean;
  customerSelectedId: number | null;
  customerSearchText: string;
  searchQuery: string;
  selectedRowId: number | null;
  discountPercent: string;
  discountAmount: string;
  description: string;
}

let globalRowId = 1;
let globalTabId = 1;

function createEmptyTab(invoiceNo: string): PosTab {
  return {
    id: globalTabId++,
    invoiceNo,
    date: new Date().toISOString().split("T")[0],
    rows: [],
    paymentMode: "Cash",
    amountReceived: "0.00",
    isAmountReceivedDirty: false,
    customerSelectedId: null,
    customerSearchText: "",
    searchQuery: "",
    selectedRowId: null,
    discountPercent: "",
    discountAmount: "",
    description: "",
  };
}

export function LaimsoftPos({ onClose }: LaimsoftPosProps) {
  const [parties, setParties] = useState<PartyOption[]>([]);
  const [items, setItems] = useState<ItemOption[]>([]);
  const [banks, setBanks] = useState<BankOption[]>([]);
  const [nextInvoiceNo, setNextInvoiceNo] = useState("1");
  const [isSaving, setIsSaving] = useState(false);

  // Tabs State
  const [tabs, setTabs] = useState<PosTab[]>([createEmptyTab("1")]);
  const [activeTabId, setActiveTabId] = useState<number>(tabs[0].id);

  // Search Dropdown State
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchSelectedIndex, setSearchSelectedIndex] = useState(0);

  // Customer Dropdown State
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);

  // Modals State
  const [activeModal, setActiveModal] = useState<"quantity" | "unit" | "discount" | "description" | "no_selection" | null>(null);

  // Modal Local States
  const [modalQuantity, setModalQuantity] = useState("");
  const [modalUnit, setModalUnit] = useState("");
  const [modalDiscountPercent, setModalDiscountPercent] = useState("");
  const [modalDiscountAmount, setModalDiscountAmount] = useState("");
  const [modalDescription, setModalDescription] = useState("");

  const searchInputRef = useRef<HTMLInputElement>(null);

  const activeTab = useMemo(() => tabs.find(t => t.id === activeTabId) || tabs[0], [tabs, activeTabId]);
  const selectedRow = useMemo(() => activeTab.rows.find(r => r.id === activeTab.selectedRowId), [activeTab.rows, activeTab.selectedRowId]);

  useEffect(() => {
    let cancelled = false;

    const loadLookupData = async () => {
      try {
        const [partiesResponse, itemsResponse, saleInvoicesResponse, banksResponse] = await Promise.all([
          fetch("/api/parties"),
          fetch("/api/items"),
          fetch("/api/sale_invoices"),
          fetch("/api/bank_accounts")
        ]);

        if (!partiesResponse.ok || !itemsResponse.ok || !saleInvoicesResponse.ok || !banksResponse.ok) return;

        const loadedParties = (await partiesResponse.json()) as PartyOption[];
        const loadedItems = (await itemsResponse.json()) as ItemOption[];
        const saleInvoices = (await saleInvoicesResponse.json()) as Array<{ invoice_no?: string | null }>;
        const loadedBanks = (await banksResponse.json()) as BankOption[];

        if (cancelled) return;

        setParties([...loadedParties].sort((a, b) => a.name.localeCompare(b.name)));
        setItems(loadedItems);
        setBanks(loadedBanks);

        const nextNo = String(
          saleInvoices.reduce((highest, invoice) => {
            const invNo = Number(invoice.invoice_no ?? 0);
            return Number.isFinite(invNo) && invNo > highest ? invNo : highest;
          }, 0) + 1,
        );
        setNextInvoiceNo(nextNo);

        // Update the first tab's invoice number if it hasn't been used yet
        setTabs(prev => {
          if (prev.length === 1 && prev[0].rows.length === 0 && prev[0].invoiceNo === "1") {
            return [{ ...prev[0], invoiceNo: nextNo }];
          }
          return prev;
        });

      } catch (error) {
        console.error(error);
      }
    };

    void loadLookupData();
    return () => { cancelled = true; };
  }, []);

  const updateTab = (partial: Partial<PosTab>) => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, ...partial } : t));
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeModal !== null) {
        if (e.key === "Escape") setActiveModal(null);
        return;
      }

      if (e.ctrlKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        handleNewBill();
      } else if (e.ctrlKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        handleSaveSale();
      } else if (e.key === "F11") {
        e.preventDefault();
        const customerInput = document.getElementById("customer-search-input");
        if (customerInput) {
          customerInput.focus();
          setCustomerDropdownOpen(true);
        }
      } else if (e.ctrlKey && e.key.toLowerCase() === "w") {
        e.preventDefault();
        handleCloseTab(activeTabId);
      } else if ((e.key === "Delete" || e.key === "Backspace") && activeTab.selectedRowId !== null) {
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'SELECT') return;
        e.preventDefault();
        handleDeleteSelectedRow();
      } else if (e.key === "F2") {
        e.preventDefault();
        openModal("quantity");
      } else if (e.key === "F4") {
        e.preventDefault();
        handleDeleteSelectedRow();
      } else if (e.key === "F6") {
        e.preventDefault();
        openModal("unit");
      } else if (e.key === "F9") {
        e.preventDefault();
        openModal("discount");
      } else if (e.key === "F12") {
        e.preventDefault();
        openModal("description");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, nextInvoiceNo, activeModal]);

  const handleDeleteSelectedRow = () => {
    if (activeTab.selectedRowId === null) return;
    const newRows = activeTab.rows.filter(r => r.id !== activeTab.selectedRowId);
    updateTab({ rows: newRows, selectedRowId: null });
  };

  const subTotalAmount = useMemo(() => {
    return activeTab.rows.reduce((acc, row) => {
      const qty = Number(row.qty) || 0;
      const price = Number(row.pricePerUnit) || 0;
      return acc + qty * price;
    }, 0);
  }, [activeTab.rows]);

  const totalAmount = useMemo(() => {
    const discount = Number(activeTab.discountAmount) || 0;
    return Math.max(0, subTotalAmount - discount);
  }, [subTotalAmount, activeTab.discountAmount]);

  const effectiveAmountReceived = activeTab.isAmountReceivedDirty
    ? activeTab.amountReceived
    : totalAmount.toFixed(2);

  const changeToReturn = useMemo(() => {
    const received = Number(effectiveAmountReceived) || 0;
    return Math.max(0, received - totalAmount);
  }, [effectiveAmountReceived, totalAmount]);

  const receivedLessThanTotal = (Number(effectiveAmountReceived) || 0) < totalAmount;

  const handleNewBill = () => {
    const newTab = createEmptyTab(nextInvoiceNo);
    setNextInvoiceNo(prev => String(Number(prev) + 1));
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  const handleCloseTab = (idToClose: number) => {
    setTabs(prev => {
      if (prev.length <= 1) {
        if (onClose) onClose();
        return prev;
      }
      const newTabs = prev.filter(t => t.id !== idToClose);
      if (activeTabId === idToClose) {
        setActiveTabId(newTabs[newTabs.length - 1].id);
      }
      return newTabs;
    });
  };

  // Search Dropdown Logic
  const filteredItems = useMemo(() => {
    if (!activeTab.searchQuery) return [];
    const query = activeTab.searchQuery.toLowerCase();
    return items.filter(
      item =>
        item.name.toLowerCase().startsWith(query) ||
        item.code?.toLowerCase().startsWith(query)
    ).slice(0, 50);
  }, [items, activeTab.searchQuery]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!searchFocused || filteredItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSearchSelectedIndex(prev => (prev + 1) % filteredItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSearchSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelectItem(filteredItems[searchSelectedIndex]);
    } else if (e.key === "Escape") {
      setSearchFocused(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateTab({ searchQuery: e.target.value });
    setSearchSelectedIndex(0);
    setSearchFocused(true);
  };

  const handleSelectItem = (item: ItemOption) => {
    const existingRowIndex = activeTab.rows.findIndex(r => r.itemId === item.id);

    if (existingRowIndex >= 0) {
      const nextRows = [...activeTab.rows];
      nextRows[existingRowIndex].qty = String(Number(nextRows[existingRowIndex].qty) + 1);
      updateTab({ rows: nextRows, searchQuery: "" });
    } else {
      const newRow: PosRow = {
        id: globalRowId++,
        itemId: item.id,
        itemCode: item.code || "",
        itemName: item.name,
        qty: "1",
        unit: item.primary_unit || item.unit || "NONE",
        pricePerUnit: String(item.sale_price || 0)
      };
      updateTab({ rows: [...activeTab.rows, newRow], searchQuery: "" });
    }

    setSearchFocused(false);
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  const updateRow = (id: number, field: keyof PosRow, value: string) => {
    const newRows = activeTab.rows.map(r => r.id === id ? { ...r, [field]: value } : r);
    updateTab({ rows: newRows });
  };

  // Modals Logic
  const openModal = (modalName: "quantity" | "unit" | "discount" | "description") => {
    if ((modalName === "quantity" || modalName === "unit") && !selectedRow) {
      setActiveModal("no_selection");
      return;
    }

    if (modalName === "quantity") setModalQuantity(selectedRow!.qty);
    if (modalName === "unit") setModalUnit(selectedRow!.unit);
    if (modalName === "discount") {
      setModalDiscountPercent(activeTab.discountPercent);
      setModalDiscountAmount(activeTab.discountAmount);
    }
    if (modalName === "description") setModalDescription(activeTab.description);

    setActiveModal(modalName);
  };

  const saveModal = () => {
    if (activeModal === "quantity" && selectedRow) {
      updateRow(selectedRow.id, "qty", modalQuantity);
    } else if (activeModal === "unit" && selectedRow) {
      updateRow(selectedRow.id, "unit", modalUnit);
    } else if (activeModal === "discount") {
      updateTab({ discountPercent: modalDiscountPercent, discountAmount: modalDiscountAmount });
    } else if (activeModal === "description") {
      updateTab({ description: modalDescription });
    }
    setActiveModal(null);
  };

  const handleDiscountPercentChange = (val: string) => {
    setModalDiscountPercent(val);
    const p = Number(val) || 0;
    setModalDiscountAmount(((subTotalAmount * p) / 100).toFixed(2));
  };

  const handleDiscountAmountChange = (val: string) => {
    setModalDiscountAmount(val);
    const a = Number(val) || 0;
    if (subTotalAmount > 0) {
      setModalDiscountPercent(((a / subTotalAmount) * 100).toFixed(2));
    } else {
      setModalDiscountPercent("0");
    }
  };

  // Customer Dropdown Logic
  const filteredCustomers = useMemo(() => {
    if (!activeTab.customerSearchText) return parties.slice(0, 50);
    const query = activeTab.customerSearchText.toLowerCase();
    return parties.filter(p => p.name.toLowerCase().includes(query) || p.phone?.includes(query)).slice(0, 50);
  }, [parties, activeTab.customerSearchText]);

  const handleSaveSale = async () => {
    if (isSaving) return;

    const validRows = activeTab.rows.filter(r => r.itemId);
    if (validRows.length === 0) {
      alert("Please add at least one item to save the sale.");
      return;
    }

    if (receivedLessThanTotal) {
      alert("Received amount cannot be less than the total.");
      return;
    }

    setIsSaving(true);

    const selectedParty = activeTab.customerSelectedId ? parties.find(p => p.id === activeTab.customerSelectedId) : null;

    let receivedAmt = Number(effectiveAmountReceived) || 0;
    if (receivedAmt === 0) {
      receivedAmt = totalAmount;
    }
    const balance = Math.max(0, totalAmount - receivedAmt);

    const payload = {
      invoiceNo: activeTab.invoiceNo,
      date: activeTab.date,
      partyId: selectedParty?.id || null,
      partyName: selectedParty?.name || "Cash",
      partyPhone: selectedParty?.phone || null,
      paymentType: "Cash",
      paymentMode: activeTab.paymentMode,
      subtotal: subTotalAmount,
      discountPercent: Number(activeTab.discountPercent) || 0,
      discountAmount: Number(activeTab.discountAmount) || 0,
      taxLabel: "NONE",
      taxRate: 0,
      taxAmount: 0,
      roundOff: true,
      roundOffAmount: 0,
      amount: totalAmount,
      balance: balance,
      description: activeTab.description || "POS Sale",
      lineItemsJson: JSON.stringify(
        validRows.map(r => ({
          itemId: r.itemId,
          name: r.itemName,
          size: "",
          quantity: Number(r.qty) || 1,
          unit: r.unit,
          price: Number(r.pricePerUnit) || 0,
          amount: (Number(r.qty) || 1) * (Number(r.pricePerUnit) || 0)
        }))
      )
    };

    try {
      const response = await fetch("/api/sale_invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save sale");

      // Trigger Print
      window.print();

      setNextInvoiceNo(String(Number(activeTab.invoiceNo) + 1));

      handleCloseTab(activeTabId);
      if (tabs.length === 1) {
        handleNewBill();
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save sale");
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    { key: "no", label: "#", width: "w-12" },
    { key: "code", label: "ITEM CODE", width: "w-[120px]" },
    { key: "name", label: "ITEM NAME", width: "flex-1" },
    { key: "qty", label: "QTY", width: "w-[80px]" },
    { key: "unit", label: "UNIT", width: "w-[80px]" },
    { key: "price", label: "PRICE/UNIT", width: "w-[120px]" },
    { key: "total", label: "TOTAL(Rs)", width: "w-[120px]" },
  ];

  return (
    <div
      className="flex flex-col h-screen w-screen bg-[#f0f2f5] overflow-hidden"
      onClick={() => {
        setSearchFocused(false);
        setCustomerDropdownOpen(false);
      }}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-gray-300 bg-white px-2 h-11 shrink-0">
        <div className="flex items-center h-full overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`flex items-center gap-4 px-4 h-full border-x border-gray-200 cursor-pointer ${activeTabId === tab.id ? "border-t-2 border-t-blue-500 bg-white" : "bg-gray-50 hover:bg-gray-100"
                }`}
            >
              <span className={`text-sm font-medium ${activeTabId === tab.id ? "text-blue-600" : "text-gray-600"}`}>
                #{tab.invoiceNo}
              </span>
              <span className="text-xs text-gray-400">Ctrl+W</span>
              <button
                className="hover:bg-red-100 hover:text-red-600 p-0.5 rounded text-gray-400"
                onClick={(e) => { e.stopPropagation(); handleCloseTab(tab.id); }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          <button
            onClick={handleNewBill}
            className="ml-2 flex items-center gap-1.5 rounded border border-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 shrink-0"
          >
            <Plus className="h-4 w-4" />
            New Bill
            <span className="text-xs text-gray-400 font-medium ml-1">[Ctrl+T]</span>
          </button>
        </div>

        <div className="flex items-center text-gray-500 shrink-0">
          <button className="p-2 hover:bg-gray-100"><Settings className="h-4 w-4" /></button>
          <div className="h-4 w-px bg-gray-300 mx-1" />
          <button className="p-2 hover:bg-gray-100"><Minus className="h-4 w-4" /></button>
          <button className="p-2 hover:bg-gray-100"><Square className="h-3.5 w-3.5" /></button>
          <button className="p-2 hover:bg-red-500 hover:text-white" onClick={onClose}><X className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 p-2 gap-2 overflow-hidden">
        {/* Left Panel */}
        <div className="flex-1 flex flex-col bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={activeTab.searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => setSearchFocused(true)}
                onClick={(e) => e.stopPropagation()}
                placeholder="Scan or search by item code, model no or item name"
                className="w-full rounded border border-blue-400 pl-3 pr-10 py-2 text-sm text-gray-700 outline-none ring-1 ring-blue-400/20"
                autoFocus
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500 pointer-events-none" />

              {searchFocused && activeTab.searchQuery && filteredItems.length > 0 && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                  {filteredItems.map((item, index) => (
                    <div
                      key={item.id}
                      onClick={(e) => { e.stopPropagation(); handleSelectItem(item); }}
                      onMouseEnter={() => setSearchSelectedIndex(index)}
                      className={`px-3 py-2 cursor-pointer flex justify-between items-center text-sm ${index === searchSelectedIndex ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      <div>
                        <span className="font-medium">{item.name}</span>
                        {item.code && <span className="text-xs text-gray-500 ml-2">({item.code})</span>}
                      </div>
                      <span className="font-semibold text-gray-900">Rs {item.sale_price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table Header */}
          <div className="flex bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {columns.map((col, i) => (
              <div
                key={col.key}
                className={`${col.width} px-3 py-3 ${i < columns.length - 1 ? "border-r border-gray-200" : ""
                  }`}
              >
                {col.label}
              </div>
            ))}
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto bg-white relative">
            {activeTab.rows.map((row, index) => {
              const isSelected = activeTab.selectedRowId === row.id;
              return (
                <div
                  key={row.id}
                  onClick={() => updateTab({ selectedRowId: row.id })}
                  className={`flex border-b border-gray-100 text-sm cursor-pointer ${isSelected ? "bg-blue-100/50" : "hover:bg-gray-50 text-gray-700"
                    }`}
                >
                  <div className="w-12 px-3 py-2 border-r border-gray-100 flex items-center justify-center text-gray-500">{index + 1}</div>
                  <div className="w-[120px] px-3 py-2 border-r border-gray-100 flex items-center truncate">{row.itemCode}</div>
                  <div className="flex-1 px-3 py-2 border-r border-gray-100 flex items-center truncate font-medium">{row.itemName}</div>
                  <div className="w-[80px] px-3 py-2 border-r border-gray-100">
                    <input
                      type="text"
                      value={row.qty}
                      onClick={(e) => { e.stopPropagation(); updateTab({ selectedRowId: row.id }); }}
                      onChange={e => updateRow(row.id, "qty", e.target.value)}
                      className="w-full bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 px-1 rounded"
                    />
                  </div>
                  <div className="w-[80px] px-3 py-2 border-r border-gray-100 flex items-center text-gray-500">{row.unit}</div>
                  <div className="w-[120px] px-3 py-2 border-r border-gray-100 flex items-center">
                    <input
                      type="text"
                      value={row.pricePerUnit}
                      onClick={(e) => { e.stopPropagation(); updateTab({ selectedRowId: row.id }); }}
                      onChange={e => updateRow(row.id, "pricePerUnit", e.target.value)}
                      className="w-full bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 px-1 rounded"
                    />
                  </div>
                  <div className="w-[120px] px-3 py-2 flex items-center font-medium justify-end">
                    {(Number(row.qty || 0) * Number(row.pricePerUnit || 0)).toFixed(2)}
                  </div>
                </div>
              );
            })}
            <div className="flex flex-1 min-h-[40px] pointer-events-none">
              {columns.map((col, i) => (
                <div
                  key={`empty-${col.key}`}
                  className={`${col.width} ${i < columns.length - 1 ? "border-r border-gray-100" : ""
                    }`}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="grid grid-cols-4 gap-2">
              <button onClick={() => openModal("quantity")} className="flex items-center justify-center gap-1 rounded border border-blue-200 bg-blue-50/50 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-100/50 transition-colors">
                Change Quantity <span className="text-gray-500 font-normal">[F2]</span>
              </button>
              <button className="flex items-center justify-center gap-1 rounded border border-blue-200 bg-blue-50/50 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-100/50 transition-colors">
                Item Discount <span className="text-gray-500 font-normal">[F3]</span>
              </button>
              <button onClick={handleDeleteSelectedRow} className="flex items-center justify-center gap-1 rounded border border-blue-200 bg-blue-50/50 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-100/50 transition-colors">
                Remove Item <span className="text-gray-500 font-normal">[F4]</span>
              </button>
              <button onClick={() => openModal("unit")} className="flex items-center justify-center gap-1 rounded border border-blue-200 bg-blue-50/50 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-100/50 transition-colors">
                Change Unit <span className="text-gray-500 font-normal">[F6]</span>
              </button>
              <button className="flex items-center justify-center gap-1 rounded border border-blue-200 bg-blue-50/50 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-100/50 transition-colors">
                Additional Charges <span className="text-gray-500 font-normal">[F8]</span>
              </button>
              <button onClick={() => openModal("discount")} className="flex items-center justify-center gap-1 rounded border border-blue-200 bg-blue-50/50 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-100/50 transition-colors">
                Bill Discount <span className="text-gray-500 font-normal">[F9]</span>
              </button>
              <button className="flex items-center justify-center gap-1 rounded border border-blue-200 bg-blue-50/50 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-100/50 transition-colors">
                Loyalty Points <span className="text-gray-500 font-normal">[F10]</span>
              </button>
              <button onClick={() => openModal("description")} className="flex items-center justify-center gap-1 rounded border border-blue-200 bg-blue-50/50 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-100/50 transition-colors">
                Description <span className="text-gray-500 font-normal">[F12]</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-[380px] flex flex-col gap-2 shrink-0 overflow-hidden">
          {/* Top Section */}
          <div className="bg-white border border-gray-300 rounded shadow-sm p-3 space-y-3 relative">
            <div className="flex items-center justify-between rounded border border-gray-300 px-3 py-1 bg-white relative">
              <input
                type="date"
                value={activeTab.date}
                onChange={e => updateTab({ date: e.target.value })}
                className="w-full text-sm text-gray-800 outline-none bg-transparent"
              />
            </div>

            <div className="relative">
              <div
                className="flex items-center justify-between rounded border border-gray-300 px-3 py-2 bg-white hover:bg-gray-50 focus-within:ring-1 focus-within:ring-blue-500 cursor-text"
                onClick={(e) => {
                  e.stopPropagation();
                  setCustomerDropdownOpen(true);
                  document.getElementById("customer-search-input")?.focus();
                }}
              >
                <input
                  id="customer-search-input"
                  type="text"
                  value={activeTab.customerSearchText}
                  onChange={(e) => {
                    updateTab({ customerSearchText: e.target.value, customerSelectedId: null });
                    setCustomerDropdownOpen(true);
                  }}
                  placeholder="Search for a customer by name, phone number [F11]"
                  className="w-full text-sm outline-none bg-transparent text-gray-700 font-medium placeholder:text-gray-400 placeholder:font-normal"
                />
                <ChevronDown className="h-4 w-4 text-gray-400 pointer-events-none absolute right-3" />
              </div>

              {/* Customer Dropdown */}
              {customerDropdownOpen && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto z-50">
                  <div
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm font-medium text-gray-700 border-b border-gray-100"
                    onClick={() => {
                      updateTab({ customerSearchText: "Cash Sale", customerSelectedId: null });
                      setCustomerDropdownOpen(false);
                    }}
                  >
                    Cash Sale (Default)
                  </div>
                  {filteredCustomers.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-400 italic">No customers found.</div>
                  ) : (
                    filteredCustomers.map(p => (
                      <div
                        key={p.id}
                        className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex justify-between text-sm text-gray-700"
                        onClick={() => {
                          updateTab({ customerSearchText: `${p.name} - ${p.phone}`, customerSelectedId: p.id });
                          setCustomerDropdownOpen(false);
                        }}
                      >
                        <span className="font-medium">{p.name}</span>
                        <span className="text-gray-500">{p.phone}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Middle Section */}
          <div className="flex-1 bg-white border border-gray-300 rounded shadow-sm flex flex-col">
            {/* Total Box */}
            <div className="m-3 rounded border border-blue-100 bg-blue-50/60 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-base font-bold text-gray-800">
                    Total Rs {totalAmount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Items: {activeTab.rows.filter(r => r.itemId).length}, Quantity: {activeTab.rows.reduce((acc, r) => acc + (Number(r.qty) || 0), 0)}
                  </p>
                </div>
              </div>
              <button className="flex flex-col items-end gap-0.5 text-sm font-semibold text-blue-600 hover:text-blue-700">
                <div className="flex items-center">
                  Full Breakup
                  <ChevronRight className="h-4 w-4 ml-0.5" />
                </div>
                <span className="text-xs text-blue-500 font-medium">[Ctrl+F]</span>
              </button>
            </div>

            {/* Payment Details */}
            <div className="px-3 pb-3 grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Payment Type</label>
                <div className="relative">
                  <select
                    value={activeTab.paymentMode}
                    onChange={(e) => updateTab({ paymentMode: e.target.value })}
                    className="w-full appearance-none rounded border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="Cash">Cash</option>
                    {banks.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Amount Received</label>
                <div className={`flex items-center rounded border px-3 py-2 bg-white ${receivedLessThanTotal ? 'border-red-400 focus-within:ring-red-400' : 'border-gray-300'}`}>
                  <span className="text-sm font-medium text-gray-500 mr-2">Rs</span>
                  <input
                    type="text"
                    value={effectiveAmountReceived}
                    onChange={(e) => updateTab({ amountReceived: e.target.value, isAmountReceivedDirty: true })}
                    className="w-full text-sm text-gray-800 text-right outline-none bg-transparent"
                  />
                </div>
                {receivedLessThanTotal && (
                  <p className="text-[10px] text-red-500 flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" />
                    Received cannot be less than total
                  </p>
                )}
              </div>
            </div>

            <div className="flex-1" />

            {/* Change to Return */}
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 bg-gray-50/50">
              <span className="text-sm font-bold text-gray-700">
                Change to Return:
              </span>
              <span className="text-lg font-bold text-gray-800">
                Rs {changeToReturn.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="bg-white border border-gray-300 rounded shadow-sm p-3 space-y-2 shrink-0">
            <button
              onClick={handleSaveSale}
              disabled={isSaving || receivedLessThanTotal}
              className="w-full rounded border border-green-400/60 bg-green-200/50 py-3.5 text-sm font-bold text-green-800 hover:bg-green-300/50 transition-colors shadow-sm disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save & Print Bill"} <span className="font-normal text-green-700 ml-1">[Ctrl+P]</span>
            </button>
            <button className="w-full rounded border border-blue-200 bg-white py-3 text-sm font-semibold text-blue-700 hover:bg-gray-50 transition-colors shadow-sm">
              Other/Credit Payments <span className="font-normal text-blue-600 ml-1">[Ctrl+M]</span>
            </button>
          </div>
        </div>
      </div>

      {/* OVERLAYS (Outside layout so fixed positioning centers perfectly) */}
      {activeModal !== null && (
        <div className="fixed inset-0 bg-gray-500/30 flex items-center justify-center z-[100] backdrop-blur-[1px]">
          <div
            className="bg-white rounded-md shadow-xl w-[320px] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">
                {activeModal === "quantity" && "Change Quantity"}
                {activeModal === "unit" && "Change Unit"}
                {activeModal === "discount" && "Bill Discount"}
                {activeModal === "description" && "Description"}
                {activeModal === "no_selection" && "No Items Added"}
              </h3>
              <div className="flex items-center gap-1">
                <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
                <span className="text-xs text-gray-400">[Esc]</span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4">
              {(activeModal === "quantity" || activeModal === "unit") && selectedRow && (
                <div className="text-sm">
                  <span className="text-gray-600">Item Name: </span>
                  <span className="font-bold text-gray-900">{selectedRow.itemName}</span>
                </div>
              )}

              {activeModal === "quantity" && (
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500">Enter New Quantity</label>
                  <input
                    type="text"
                    autoFocus
                    value={modalQuantity}
                    onChange={e => setModalQuantity(e.target.value)}
                    className="w-full border border-blue-400 rounded px-3 py-1.5 text-sm text-gray-800 outline-none ring-1 ring-blue-400/20"
                  />
                  <button className="text-xs text-blue-500 font-medium hover:text-blue-600 mt-2">
                    Connect Weighing Scale {">"}
                  </button>
                </div>
              )}

              {activeModal === "unit" && (
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500">Select Unit</label>
                  <div className="relative">
                    <select
                      value={modalUnit}
                      onChange={e => setModalUnit(e.target.value)}
                      className="w-full appearance-none border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400"
                    >
                      <option value="Btl">BOTTLES (Btl)</option>
                      <option value="Box">BOXES (Box)</option>
                      <option value="Pc">PIECES (Pc)</option>
                      <option value="Kg">KILOGRAMS (Kg)</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500 pointer-events-none" />
                  </div>
                </div>
              )}

              {activeModal === "discount" && (
                <>
                  <div className="text-sm">
                    <span className="text-gray-600">Total: </span>
                    <span className="font-bold text-gray-900">Rs {subTotalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 space-y-1">
                      <label className="text-xs text-gray-500">Discount in %</label>
                      <div className="flex items-center border border-blue-400 rounded px-2 py-1.5 ring-1 ring-blue-400/20">
                        <span className="text-blue-500 text-xs mr-1">%</span>
                        <input
                          type="text"
                          autoFocus
                          value={modalDiscountPercent}
                          onChange={e => handleDiscountPercentChange(e.target.value)}
                          className="w-full text-sm text-gray-800 outline-none"
                        />
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-400 mt-5">OR</span>
                    <div className="flex-1 space-y-1">
                      <label className="text-xs text-gray-500">Discount in Rs</label>
                      <div className="flex items-center border border-gray-300 rounded px-2 py-1.5 focus-within:border-blue-400">
                        <span className="text-gray-500 text-xs mr-1">Rs</span>
                        <input
                          type="text"
                          value={modalDiscountAmount}
                          onChange={e => handleDiscountAmountChange(e.target.value)}
                          className="w-full text-sm text-gray-800 outline-none text-right"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeModal === "description" && (
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500">Description</label>
                  <textarea
                    autoFocus
                    rows={3}
                    value={modalDescription}
                    onChange={e => setModalDescription(e.target.value)}
                    className="w-full border border-blue-400 rounded px-3 py-2 text-sm text-gray-800 outline-none ring-1 ring-blue-400/20 resize-none"
                  />
                </div>
              )}

              {activeModal === "no_selection" && (
                <div className="text-sm text-gray-700 py-2">
                  <p>Please add at-least one item to perform this action.</p>
                </div>
              )}

              {/* Modal Actions */}
              {activeModal === "no_selection" ? (
                <div className="pt-2">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="w-full bg-[#a7f3d0] hover:bg-[#86efac] text-[#065f46] font-medium py-1.5 rounded text-sm transition-colors border border-[#a7f3d0]"
                  >
                    Okay
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={saveModal}
                    className="flex-1 bg-[#a7f3d0] hover:bg-[#86efac] text-[#065f46] font-medium py-1.5 rounded text-sm transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="flex-1 bg-white hover:bg-gray-50 text-gray-600 font-medium py-1.5 rounded border border-gray-300 text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
