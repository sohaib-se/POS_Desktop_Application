import { useState, useEffect, useRef, useMemo } from "react";
import type { PosTab, PosRow, PartyOption, ItemOption, BankOption } from "../components/pagescomponents/laimsoftpos/types";
import { TopHeaderBar } from "../components/pagescomponents/laimsoftpos/TopHeaderBar";
import { SearchInput } from "../components/pagescomponents/laimsoftpos/SearchInput";
import { PosTable } from "../components/pagescomponents/laimsoftpos/PosTable";
import { ActionButtons } from "../components/pagescomponents/laimsoftpos/ActionButtons";
import { RightPanel } from "../components/pagescomponents/laimsoftpos/RightPanel";
import { Modals } from "../components/pagescomponents/laimsoftpos/Modals";
import { useSettings } from "@/hooks/useSettings";

interface LaimsoftPosProps {
  onClose?: () => void;
}

let globalRowId = 1;
let globalTabId = 1;

function createEmptyTab(invoiceNo: string): PosTab {
  const isCashSaleByDefault = JSON.parse(localStorage.getItem('settings.isCashSaleByDefault') || 'false');
  return {
    id: globalTabId++,
    invoiceNo,
    date: new Date().toISOString().split("T")[0],
    rows: [],
    paymentMode: isCashSaleByDefault ? "Cash" : "Credit",
    amountReceived: "0.00",
    isAmountReceivedDirty: false,
    customerSelectedId: null,
    customerSearchText: "Cash Sale",
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
  const [activeModal, setActiveModal] = useState<
    "quantity" | "unit" | "discount" | "description" | "no_selection" | null
  >(null);

  // Modal Local States
  const [modalQuantity, setModalQuantity] = useState("");
  const [modalUnit, setModalUnit] = useState("");
  const [modalDiscountPercent, setModalDiscountPercent] = useState("");
  const [modalDiscountAmount, setModalDiscountAmount] = useState("");
  const [modalDescription, setModalDescription] = useState("");
  const [stopSaleOnNegativeStock] = useSettings('settings.stopSaleOnNegativeStock', false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const activeTab = useMemo(
    () => tabs.find((t) => t.id === activeTabId) || tabs[0],
    [tabs, activeTabId]
  );
  const selectedRow = useMemo(
    () => activeTab.rows.find((r) => r.id === activeTab.selectedRowId),
    [activeTab.rows, activeTab.selectedRowId]
  );

  useEffect(() => {
    let cancelled = false;

    const loadLookupData = async () => {
      try {
        const [partiesResponse, itemsResponse, saleInvoicesResponse, banksResponse] =
          await Promise.all([
            fetch("/api/parties"),
            fetch("/api/items"),
            fetch("/api/sale_invoices"),
            fetch("/api/bank_accounts"),
          ]);

        if (
          !partiesResponse.ok ||
          !itemsResponse.ok ||
          !saleInvoicesResponse.ok ||
          !banksResponse.ok
        )
          return;

        const loadedParties = (await partiesResponse.json()) as PartyOption[];
        const loadedItems = (await itemsResponse.json()) as ItemOption[];
        const saleInvoices = (await saleInvoicesResponse.json()) as Array<{
          invoice_no?: string | null;
        }>;
        const loadedBanks = (await banksResponse.json()) as BankOption[];

        if (cancelled) return;

        setParties([...loadedParties].sort((a, b) => a.name.localeCompare(b.name)));
        setItems(loadedItems);
        setBanks(loadedBanks);

        const nextNo = String(
          saleInvoices.reduce((highest, invoice) => {
            const invNo = Number(invoice.invoice_no ?? 0);
            return Number.isFinite(invNo) && invNo > highest ? invNo : highest;
          }, 0) + 1
        );
        setNextInvoiceNo(nextNo);

        setTabs((prev) => {
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
    return () => {
      cancelled = true;
    };
  }, []);

  const updateTab = (partial: Partial<PosTab>) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, ...partial } : t))
    );
  };

  const handleDeleteSelectedRow = () => {
    if (activeTab.selectedRowId === null) return;
    const newRows = activeTab.rows.filter((r) => r.id !== activeTab.selectedRowId);
    updateTab({ rows: newRows, selectedRowId: null });
  };

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
      } else if (
        (e.key === "Delete" || e.key === "Backspace") &&
        activeTab.selectedRowId !== null
      ) {
        if (
          document.activeElement?.tagName === "INPUT" ||
          document.activeElement?.tagName === "SELECT"
        )
          return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, nextInvoiceNo, activeModal]);

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

  const receivedLessThanTotal =
    (Number(effectiveAmountReceived) || 0) < totalAmount;

  const handleNewBill = () => {
    const newTab = createEmptyTab(nextInvoiceNo);
    setNextInvoiceNo((prev) => String(Number(prev) + 1));
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  const handleCloseTab = (idToClose: number) => {
    setTabs((prev) => {
      if (prev.length <= 1) {
        if (onClose) onClose();
        return prev;
      }
      const newTabs = prev.filter((t) => t.id !== idToClose);
      if (activeTabId === idToClose) {
        setActiveTabId(newTabs[newTabs.length - 1].id);
      }
      return newTabs;
    });
  };

  const filteredItems = useMemo(() => {
    if (!activeTab.searchQuery) return [];
    const query = activeTab.searchQuery.toLowerCase();
    return items
      .filter(
        (item) =>
          item.name.toLowerCase().startsWith(query) ||
          item.code?.toLowerCase().startsWith(query)
      )
      .slice(0, 50);
  }, [items, activeTab.searchQuery]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!searchFocused || filteredItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSearchSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSearchSelectedIndex(
        (prev) => (prev - 1 + filteredItems.length) % filteredItems.length
      );
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
    const existingRowIndex = activeTab.rows.findIndex((r) => r.itemId === item.id);

    if (existingRowIndex >= 0) {
      const nextRows = [...activeTab.rows];
      nextRows[existingRowIndex].qty = String(
        Number(nextRows[existingRowIndex].qty) + 1
      );
      updateTab({ rows: nextRows, searchQuery: "" });
    } else {
      const newRow: PosRow = {
        id: globalRowId++,
        itemId: item.id,
        itemCode: item.code || "",
        itemName: item.name,
        qty: "1",
        unit: item.primary_unit || item.unit || "NONE",
        pricePerUnit: String(item.sale_price || 0),
      };
      updateTab({ rows: [...activeTab.rows, newRow], searchQuery: "" });
    }

    setSearchFocused(false);
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  const updateRow = (id: number, field: keyof PosRow, value: string) => {
    const newRows = activeTab.rows.map((r) =>
      r.id === id ? { ...r, [field]: value } : r
    );
    updateTab({ rows: newRows });
  };

  const saveModal = () => {
    if (activeModal === "quantity" && selectedRow) {
      updateRow(selectedRow.id, "qty", modalQuantity);
    } else if (activeModal === "unit" && selectedRow) {
      updateRow(selectedRow.id, "unit", modalUnit);
    } else if (activeModal === "discount") {
      updateTab({
        discountPercent: modalDiscountPercent,
        discountAmount: modalDiscountAmount,
      });
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

  const filteredCustomers = useMemo(() => {
    return parties.filter((p) => p.status !== "inactive");
  }, [parties]);

  const handleSaveSale = async () => {
    if (isSaving) return;

    const validRows = activeTab.rows.filter((r) => r.itemId);
    if (validRows.length === 0) {
      alert("Please add at least one item to save the sale.");
      return;
    }

    if (stopSaleOnNegativeStock) {
      const itemQtyMap = new Map<string, number>();
      for (const row of validRows) {
        const item = items.find((i) => String(i.id) === row.itemId);
        if (!item) continue;

        const qty = Number(row.qty) || 0;
        const isSecondary = row.unit === item.secondary_unit;
        const convRate = Number(item.conversion_rate) || 1;
        const primaryQtyEquiv = isSecondary && convRate > 0 ? qty / convRate : qty;
        
        itemQtyMap.set(row.itemId, (itemQtyMap.get(row.itemId) || 0) + primaryQtyEquiv);
      }

      for (const [itemId, totalQty] of itemQtyMap.entries()) {
        const item = items.find((i) => String(i.id) === itemId);
        if (item) {
          const currentStock = item.stock_quantity || 0;
          if (totalQty > currentStock) {
            alert(`Cannot sell ${totalQty} of ${item.name}. Current stock is only ${currentStock}.`);
            return;
          }
        }
      }
    }

    if (receivedLessThanTotal) {
      alert("Received amount cannot be less than the total.");
      return;
    }

    setIsSaving(true);

    const selectedParty = activeTab.customerSelectedId
      ? parties.find((p) => p.id === activeTab.customerSelectedId)
      : null;

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
        validRows.map((r) => ({
          itemId: r.itemId,
          name: r.itemName,
          size: "",
          quantity: Number(r.qty) || 1,
          unit: r.unit,
          price: Number(r.pricePerUnit) || 0,
          amount: (Number(r.qty) || 1) * (Number(r.pricePerUnit) || 0),
        }))
      ),
    };

    try {
      const response = await fetch("/api/sale_invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save sale");

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
      <TopHeaderBar
        tabs={tabs}
        activeTabId={activeTabId}
        setActiveTabId={setActiveTabId}
        handleCloseTab={handleCloseTab}
        handleNewBill={handleNewBill}
        onClose={onClose}
      />

      <div className="flex flex-1 p-2 gap-2 overflow-hidden">
        <div className="flex-1 flex flex-col bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
          <SearchInput
            activeTab={activeTab}
            searchInputRef={searchInputRef}
            filteredItems={filteredItems}
            searchFocused={searchFocused}
            searchSelectedIndex={searchSelectedIndex}
            handleSearchChange={handleSearchChange}
            handleSearchKeyDown={handleSearchKeyDown}
            setSearchFocused={setSearchFocused}
            setSearchSelectedIndex={setSearchSelectedIndex}
            handleSelectItem={handleSelectItem}
          />

          <PosTable
            activeTab={activeTab}
            updateTab={updateTab}
            updateRow={updateRow}
            columns={columns}
          />

          <ActionButtons
            openModal={openModal}
            handleDeleteSelectedRow={handleDeleteSelectedRow}
          />
        </div>

        <RightPanel
          activeTab={activeTab}
          updateTab={updateTab}
          banks={banks}
          totalAmount={totalAmount}
          effectiveAmountReceived={effectiveAmountReceived}
          changeToReturn={changeToReturn}
          receivedLessThanTotal={receivedLessThanTotal}
          isSaving={isSaving}
          handleSaveSale={handleSaveSale}
          customerDropdownOpen={customerDropdownOpen}
          setCustomerDropdownOpen={setCustomerDropdownOpen}
          filteredCustomers={filteredCustomers}
        />
      </div>

      <Modals
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        selectedRow={selectedRow}
        modalQuantity={modalQuantity}
        setModalQuantity={setModalQuantity}
        modalUnit={modalUnit}
        setModalUnit={setModalUnit}
        subTotalAmount={subTotalAmount}
        modalDiscountPercent={modalDiscountPercent}
        modalDiscountAmount={modalDiscountAmount}
        handleDiscountPercentChange={handleDiscountPercentChange}
        handleDiscountAmountChange={handleDiscountAmountChange}
        modalDescription={modalDescription}
        setModalDescription={setModalDescription}
        saveModal={saveModal}
        items={items}
      />
    </div>
  );
}
