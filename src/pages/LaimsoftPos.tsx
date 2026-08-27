import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { PosTab, PosRow, PartyOption, ItemOption, BankOption } from "../components/pagescomponents/laimsoftpos/types";
import { TopHeaderBar } from "../components/pagescomponents/laimsoftpos/TopHeaderBar";
import { SearchInput } from "../components/pagescomponents/laimsoftpos/SearchInput";
import { PosTable } from "../components/pagescomponents/laimsoftpos/PosTable";
import { ActionButtons } from "../components/pagescomponents/laimsoftpos/ActionButtons";
import { RightPanel } from "../components/pagescomponents/laimsoftpos/RightPanel";
import { Modals } from "../components/pagescomponents/laimsoftpos/Modals";
import { ConfirmActionModal } from "@/components/common/ConfirmActionModal";
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
    paymentMode: "Cash",
    amountReceived: "0.00",
    isAmountReceivedDirty: false,
    customerSelectedId: null,
    customerSearchText: isCashSaleByDefault ? "Cash Sale" : "",
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
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [alertState, setAlertState] = useState<{ isOpen: boolean; title: string; message: string }>({ isOpen: false, title: "", message: "" });

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

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

  const isCashSale = activeTab.customerSelectedId === null;
  const receivedLessThanTotal =
    isCashSale && (Number(effectiveAmountReceived) || 0) < totalAmount;

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

  const getCalculatedRow = (row: PosRow): PosRow => {
    const matchedItem = items.find((item) => item.id === row.itemId);
    if (!matchedItem) return row;

    let nextPricePerUnit = row.pricePerUnit;
    const qty = Number(row.qty) || 0;
    const isSecondary = row.unit === matchedItem.secondary_unit;
    const convRate = Number(matchedItem.conversion_rate) || 1;
    const primaryQtyEquiv = isSecondary && convRate > 0 ? qty / convRate : qty;

    let basePrice = Number(matchedItem.sale_price);

    if (
      Number.isFinite(Number(matchedItem.min_stock)) &&
      Number(matchedItem.min_stock) > 0 &&
      primaryQtyEquiv >= Number(matchedItem.min_stock)
    ) {
      basePrice = Number(matchedItem.wholesale_price || matchedItem.sale_price);
    }

    if (isSecondary && convRate > 0) {
      nextPricePerUnit = String(basePrice / convRate);
    } else {
      nextPricePerUnit = String(basePrice);
    }

    return { ...row, pricePerUnit: nextPricePerUnit };
  };

  const handleSelectItem = (item: ItemOption) => {
    const existingRowIndex = activeTab.rows.findIndex((r) => r.itemId === item.id);

    if (existingRowIndex >= 0) {
      const nextRows = [...activeTab.rows];
      nextRows[existingRowIndex].qty = String(
        Number(nextRows[existingRowIndex].qty) + 1
      );
      nextRows[existingRowIndex] = getCalculatedRow(nextRows[existingRowIndex]);
      updateTab({ rows: nextRows, searchQuery: "" });
    } else {
      let newRow: PosRow = {
        id: globalRowId++,
        itemId: item.id,
        itemCode: item.code || "",
        itemName: item.name,
        qty: "1",
        unit: item.primary_unit || item.unit || "NONE",
        pricePerUnit: String(item.sale_price || 0),
      };
      newRow = getCalculatedRow(newRow);
      updateTab({ rows: [...activeTab.rows, newRow], searchQuery: "" });
    }

    setSearchFocused(false);
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  const updateRow = (id: number, field: keyof PosRow, value: string) => {
    const newRows = activeTab.rows.map((r) => {
      if (r.id === id) {
        const updated = { ...r, [field]: value };
        if (field === "qty" || field === "unit") {
          return getCalculatedRow(updated);
        }
        return updated;
      }
      return r;
    });
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
      setAlertState({ isOpen: true, title: "No Items Added", message: "Please add at least one item to save the sale." });
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
            setAlertState({ isOpen: true, title: "Insufficient Stock", message: `Cannot sell ${totalQty} of ${item.name}. Current stock is only ${currentStock}.` });
            return;
          }
        }
      }
    }

    if (receivedLessThanTotal) {
      setAlertState({ isOpen: true, title: "Invalid Amount", message: "Received amount cannot be less than the total." });
      return;
    }

    setIsSaving(true);

    const selectedParty = activeTab.customerSelectedId
      ? parties.find((p) => p.id === activeTab.customerSelectedId)
      : null;

    let receivedAmt = Number(effectiveAmountReceived) || 0;
    if (receivedAmt === 0 && isCashSale) {
      receivedAmt = totalAmount;
    }
    const computedBalance = Math.max(0, totalAmount - receivedAmt);
    const finalBalance = isCashSale ? 0 : computedBalance;
    const finalPaymentType = isCashSale ? "Cash" : (finalBalance > 0 ? "Credit" : "Cash");

    // Normalize paymentMode: POS only has Cash or Bank options, never Credit
    // If state is somehow "Credit" (from old init), treat it as cash
    const normalizedPaymentMode = activeTab.paymentMode.toLowerCase() === "cash" || activeTab.paymentMode.toLowerCase() === "credit"
      ? "cash"
      : activeTab.paymentMode; // bank name stays as-is

    const payload = {
      invoiceNo: activeTab.invoiceNo,
      date: activeTab.date,
      partyId: selectedParty?.id ? String(selectedParty.id) : null,
      partyName: selectedParty ? selectedParty.name : "Cash Sale",
      partyPhone: selectedParty?.phone || null,
      paymentType: finalPaymentType,
      paymentMode: normalizedPaymentMode,
      subtotal: subTotalAmount,
      discountPercent: Number(activeTab.discountPercent) || 0,
      discountAmount: Number(activeTab.discountAmount) || 0,
      taxLabel: "NONE",
      taxRate: 0,
      taxAmount: 0,
      roundOff: true,
      roundOffAmount: 0,
      amount: totalAmount,
      balance: finalBalance,
      description: activeTab.description || "POS Sale",
      lineItems: validRows.map((r) => ({
        id: String(Date.now() + Math.random()),
        itemId: r.itemId,
        name: r.itemName,
        quantity: Number(r.qty) || 1,
        unit: r.unit,
        price: Number(r.pricePerUnit) || 0,
        amount: (Number(r.qty) || 1) * (Number(r.pricePerUnit) || 0),
      })),
    };

    try {
      const response = await fetch("/api/sale_invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save sale");

      const savedInvoice = (await response.json()) as { invoiceNo?: string; id?: string };
      const nextInvNo = savedInvoice.invoiceNo 
        ? String(Number(savedInvoice.invoiceNo) + 1)
        : String(Number(activeTab.invoiceNo) + 1);

      setNextInvoiceNo(nextInvNo);

      showToast(`Sale #${activeTab.invoiceNo} completed successfully!`, "success");

      // Reset the POS for the next sale instead of closing
      const isCashSaleByDefault = JSON.parse(localStorage.getItem('settings.isCashSaleByDefault') || 'false');
      updateTab({
        invoiceNo: nextInvNo,
        customerSelectedId: null,
        customerSearchText: isCashSaleByDefault ? "Cash Sale" : "",
        rows: [],
        amountReceived: "",
        isAmountReceivedDirty: false,
        paymentMode: "Cash",
        discountPercent: "",
        discountAmount: "",
        searchQuery: "",
        selectedRowId: null,
      });
    } catch (error) {
      console.error(error);
      showToast("Failed to save sale. Please try again.", "error");
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
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-4 left-4 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-semibold transition-all duration-300 animate-slide-in-right ${
            toast.type === "success"
              ? "bg-gradient-to-r from-green-500 to-emerald-600"
              : "bg-gradient-to-r from-red-500 to-rose-600"
          }`}
          style={{ minWidth: 280 }}
        >
          <span className="text-lg">{toast.type === "success" ? "✅" : "❌"}</span>
          <span>{toast.message}</span>
        </div>
      )}
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

          filteredCustomers={filteredCustomers}
        />
      </div>

      {/* Modals */}
      <ConfirmActionModal
        isOpen={alertState.isOpen}
        onClose={() => setAlertState({ isOpen: false, title: "", message: "" })}
        onConfirm={() => setAlertState({ isOpen: false, title: "", message: "" })}
        title={alertState.title}
        message={alertState.message}
        confirmText="OK"
        hideCancel={true}
      />

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
