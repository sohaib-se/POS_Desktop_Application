import React, { useState, useEffect } from "react";
import type { SaleRow, SaleTab } from "../components/pagescomponents/addestimate/types";
import { TabBar } from "../components/pagescomponents/addestimate/TabBar";
import { TopBar } from "../components/pagescomponents/addestimate/TopBar";
import { CustomerSearch } from "../components/pagescomponents/addestimate/CustomerSearch";
import { EstimateTable } from "../components/pagescomponents/addestimate/EstimateTable";
import { BottomSection } from "../components/pagescomponents/addestimate/BottomSection";
import { Footer } from "../components/pagescomponents/addestimate/Footer";
import { AddPartyDialog } from "../components/pagescomponents/parties/AddPartyDialog";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { toast } from "../components/ui/Toast";

interface AddEstimateProps {
  onSave?: () => void;
  onShare?: () => void;
  onClose?: () => void;
  initialEstimate?: any;
}

function parseLineItems(lineItemsJson?: string | null) {
  if (!lineItemsJson) return [];
  try {
    const parsed = JSON.parse(lineItemsJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const taxOptions = ["NONE", "GST 5%", "GST 12%", "GST 18%", "GST 28%"];

let globalRowId = 3;
let globalTabId = 2;

function createDefaultTab(id: number): SaleTab {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0]; // YYYY-MM-DD format for input type="date"

  return {
    id,
    label: `Estimate #${id}`,
    customerSearch: "",
    estimateNo: "1", // Will be updated on load
    estimateDate: dateStr,
    rows: [
      { id: 1, item: "", qty: "", unit: "NONE", pricePerUnit: "" },
      { id: 2, item: "", qty: "", unit: "NONE", pricePerUnit: "" },
    ],
    discountPercent: "",
    discountRs: "",
    tax: "NONE",
    roundOff: true,
    description: "",
    showDescriptionInput: false,
    image: null,
    document: null,
  };
}

export function AddEstimate({ onSave, onShare, onClose, initialEstimate }: AddEstimateProps) {
  const [tabs, setTabs] = useState<SaleTab[]>([createDefaultTab(1)]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [isOpenAnimated, setIsOpenAnimated] = useState(false);
  const [parties, setParties] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [showAddParty, setShowAddParty] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [tabClosePendingId, setTabClosePendingId] = useState<number | null>(null);
  const [partyBeingEdited, setPartyBeingEdited] = useState<any>(null);
  const [globalNextEstimateNo, setGlobalNextEstimateNo] = useState("1");
  const [activeTabParty, setActiveTabParty] = useState<"address" | "credit">("address");
  const [showShippingAddress, setShowShippingAddress] = useState(false);
  const [isSavingParty, setIsSavingParty] = useState(false);
  const [showCreditLimitError, setShowCreditLimitError] = useState(false);
  const [partyForm, setPartyForm] = useState({
    name: "", phoneNumber: "", email: "", billingAddress: "", shippingAddress: "",
    openingBalance: "", asOfDate: new Date().toLocaleDateString("en-IN"),
    balanceType: "to-receive" as "to-pay" | "to-receive",
    creditLimit: "no-limit" as "no-limit" | "custom", creditLimitAmount: "",
  });

  const resetPartyForm = () => {
    setPartyForm({
      name: "", phoneNumber: "", email: "", billingAddress: "", shippingAddress: "",
      openingBalance: "", asOfDate: new Date().toLocaleDateString("en-IN"),
      balanceType: "to-receive", creditLimit: "no-limit", creditLimitAmount: "",
    });
    setActiveTabParty("address");
  };

  const handleSaveParty = async () => {
    setIsSavingParty(true);
    try {
      const payload = {
        name: partyForm.name,
        phone: partyForm.phoneNumber,
        email: partyForm.email || null,
        address: partyForm.billingAddress || null,
        shippingAddress: partyForm.shippingAddress || null,
        balance: (Number(partyForm.openingBalance) || 0) * (partyForm.balanceType === "to-pay" ? -1 : 1),
        creditLimit: partyForm.creditLimit === "custom" ? Number(partyForm.creditLimitAmount) : null,
        type: "customer"
      };
      const response = await fetch("/api/parties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const newParty = await response.json();
        if (newParty) {
          setParties((prev) => {
            const exists = prev.find(p => p.id === newParty.id);
            return exists ? prev : [...prev, newParty];
          });
        }
        setShowAddParty(false);
        resetPartyForm();
        if (newParty && newParty.id) {
          updateTab({ customerSearch: String(newParty.id) });
        }
        fetchParties();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingParty(false);
    }
  };

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsOpenAnimated(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!initialEstimate) {
      setTabs([createDefaultTab(1)]);
      setActiveTabId(1);
      return;
    }

    const parsedRows = parseLineItems(initialEstimate.lineItemsJson);
    const dateStr = initialEstimate.date 
      ? (initialEstimate.date.includes('/') 
          ? initialEstimate.date.split('/').reverse().join('-') 
          : initialEstimate.date) 
      : new Date().toISOString().split('T')[0];

    setTabs([
      {
        id: 1,
        label: `Estimate #${initialEstimate.referenceNo}`,
        customerSearch: initialEstimate.partyName ?? "",
        estimateNo: initialEstimate.referenceNo ?? "1",
        estimateDate: dateStr,
        rows: parsedRows.length
          ? [
            ...parsedRows.map((lineItem: any) => ({
              id: globalRowId++,
              itemId: lineItem.itemId ?? "",
              item: lineItem.item ?? lineItem.name ?? "",
              qty: String(lineItem.qty ?? lineItem.quantity ?? ""),
              unit: lineItem.unit ?? "NONE",
              pricePerUnit: String(lineItem.pricePerUnit ?? lineItem.price ?? ""),
            })),
            { id: globalRowId++, item: "", qty: "", unit: "NONE", pricePerUnit: "" }
          ]
          : [
            { id: globalRowId++, item: "", qty: "", unit: "NONE", pricePerUnit: "" },
            { id: globalRowId++, item: "", qty: "", unit: "NONE", pricePerUnit: "" },
          ],
        discountPercent: String(initialEstimate.discountPercent ?? ""),
        discountRs: String(initialEstimate.discountAmount ?? ""),
        tax: initialEstimate.taxLabel ?? "NONE",
        roundOff: Boolean(initialEstimate.roundOff),
        description: initialEstimate.description ?? "",
        showDescriptionInput: Boolean(initialEstimate.description),
        image: null,
        document: null,
        imageDataUrl: initialEstimate.attachmentImagePath ?? "",
        imageFileName: initialEstimate.attachmentImageName ?? "",
        documentDataUrl: initialEstimate.attachmentDocumentPath ?? "",
        documentFileName: initialEstimate.attachmentDocumentName ?? "",
      },
    ]);
    setActiveTabId(1);
  }, [initialEstimate]);

  const fetchParties = async () => {
    try {
      const res = await fetch("/api/parties");
      if (res.ok) {
        const data = await res.json();
        setParties(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchParties();
  }, [showAddParty]); // Refresh parties when dialog closes

  // Fetch items and latest estimate number on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [itemsRes, estRes] = await Promise.all([
          fetch("/api/items"),
          fetch("/api/estimates")
        ]);
        
        if (itemsRes.ok) {
          const itemsData = await itemsRes.json();
          setItems(itemsData);
        }

        if (estRes.ok) {
          const estData = await estRes.json();
          if (!initialEstimate) {
            const maxRef = estData.reduce((max: number, est: any) => Math.max(max, Number(est.referenceNo) || 0), 0);
            const nextEstimateNo = String(maxRef + 1);
            setGlobalNextEstimateNo(nextEstimateNo);
            setTabs(prev => prev.map(t => t.id === 1 ? { ...t, estimateNo: nextEstimateNo, label: `Estimate #${nextEstimateNo}` } : t));
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchInitialData();
  }, []);



  const activeTab = tabs.find((t) => t.id === activeTabId)!;

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const totalQty = activeTab.rows.reduce((s, r) => s + (parseFloat(r.qty) || 0), 0);
  const totalAmount = activeTab.rows.reduce(
    (s, r) => s + (parseFloat(r.qty) || 0) * (parseFloat(r.pricePerUnit) || 0), 0
  );
  const calculatedTaxRate = activeTab.tax === "NONE" ? 0 : parseFloat(activeTab.tax.replace(/[^0-9.]/g, "")) / 100;
  const taxAmount = totalAmount * calculatedTaxRate;
  const discountAmount = activeTab.discountRs ? parseFloat(activeTab.discountRs) : 0;
  const finalAmount = totalAmount + taxAmount - discountAmount;

  const roundOffDiff = activeTab.roundOff ? Math.round(finalAmount) - finalAmount : 0;
  const roundedTotal = activeTab.roundOff ? Math.round(finalAmount) : finalAmount;

  const handleSaveEstimate = async () => {
    try {
      const tab = activeTab;
      
      const lineItems = tab.rows.filter(r => r.item && r.qty && r.pricePerUnit).map(r => ({ ...r }));
      
      let imageDataUrl = tab.imageDataUrl || null;
      if (tab.image) {
        imageDataUrl = await fileToDataUrl(tab.image);
      }
      let documentDataUrl = tab.documentDataUrl || null;
      if (tab.document) {
        documentDataUrl = await fileToDataUrl(tab.document);
      }

      const taxRate = tab.tax === "NONE" ? 0 : parseFloat(tab.tax.replace(/[^0-9.]/g, ""));
      const discountPercent = parseFloat(tab.discountPercent) || 0;
      const discountAmount = parseFloat(tab.discountRs) || 0;
      
      const activeTabPartyDetails = parties.find(p => String(p.id) === tab.customerSearch);
      const partyNameStr = activeTabPartyDetails ? activeTabPartyDetails.name : tab.customerSearch;
      
      const payload = {
        referenceNo: tab.estimateNo,
        date: tab.estimateDate,
        partyName: partyNameStr,
        lineItems,
        subtotal: totalAmount,
        discountPercent,
        discountAmount,
        taxLabel: tab.tax !== "NONE" ? tab.tax : null,
        taxRate,
        taxAmount,
        roundOff: tab.roundOff,
        roundOffAmount: roundOffDiff,
        amount: roundedTotal,
        balance: roundedTotal,
        description: tab.description,
        imageDataUrl,
        documentDataUrl,
        status: "Open"
      };

      const isEditing = Boolean(initialEstimate);
      const url = isEditing ? `/api/estimates/${initialEstimate.id}` : "/api/estimates";
      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        if (onSave) onSave();
        toast.success("Estimate saved successfully!");
        
        const newGlobalNext = String(Number(globalNextEstimateNo) + 1);
        setGlobalNextEstimateNo(newGlobalNext);

        setTabs(prev => {
          const remaining = prev.filter(t => t.id !== activeTabId);
          if (remaining.length === 0) {
            setTimeout(() => { if (onClose) onClose(); }, 0);
            return prev;
          }
          
          const updatedRemaining = remaining.map(t => {
            const nextEstNo = String(Number(t.estimateNo) + 1);
            return {
              ...t,
              estimateNo: nextEstNo,
              label: `Estimate #${nextEstNo}`
            };
          });
          
          setActiveTabId(updatedRemaining[updatedRemaining.length - 1].id);
          return updatedRemaining;
        });
      } else {
        const err = await response.json();
        toast.error(err.message || "Failed to save estimate");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving estimate");
    }
  };

  const updateTab = (partial: Partial<SaleTab>) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, ...partial } : t))
    );
  };

  const hasUnsavedChanges = () => {
    return tabs.some(t =>
      t.customerSearch ||
      t.rows.some(r => r.item || r.qty || r.pricePerUnit) ||
      t.description ||
      t.discountPercent ||
      t.discountRs
    );
  };

  const handleCloseRequest = () => {
    if (hasUnsavedChanges()) {
      setShowDiscardDialog(true);
    } else {
      if (onClose) onClose();
    }
  };

  const addTab = () => {
    const id = globalTabId++;
    const newTab = createDefaultTab(id);
    
    newTab.estimateNo = globalNextEstimateNo;
    newTab.label = `Estimate #${globalNextEstimateNo}`;

    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(id);
  };

  const tabHasUnsavedChanges = (tab: SaleTab) =>
    !!(tab.customerSearch ||
      tab.rows.some(r => r.item || r.qty || r.pricePerUnit) ||
      tab.description ||
      tab.discountPercent ||
      tab.discountRs);

  const doCloseTab = (id: number) => {
    if (tabs.length === 1) {
      if (onClose) onClose();
      return;
    }
    setTabs((prev) => {
      const remaining = prev.filter((t) => t.id !== id);
      if (activeTabId === id) setActiveTabId(remaining[remaining.length - 1].id);
      return remaining;
    });
  };

  const closeTab = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const tab = tabs.find(t => t.id === id);
    if (tab && tabHasUnsavedChanges(tab)) {
      setTabClosePendingId(id);
    } else {
      doCloseTab(id);
    }
  };

  const updateRow = (rowId: number, field: keyof SaleRow | Partial<SaleRow>, value?: string) => {
    const updatedRows = activeTab.rows.map((row) => {
      if (row.id !== rowId) return row;
      
      let updatedRow = row;
      if (typeof field === "string") {
        updatedRow = { ...row, [field]: value };
      } else {
        updatedRow = { ...row, ...field };
      }

      const isTriggerField = 
        (typeof field === "string" && (field === "unit" || field === "qty")) ||
        (typeof field === "object" && (field.item !== undefined || field.qty !== undefined || field.unit !== undefined));

      if (isTriggerField && updatedRow.item) {
        const matchedItem = items.find((item) => item.name === updatedRow.item);
        if (matchedItem && Number.isFinite(Number(matchedItem.sale_price ?? matchedItem.salePrice))) {
          const qty = Number(updatedRow.qty) || 0;
          const isSecondary = updatedRow.unit === (matchedItem.secondary_unit ?? matchedItem.secondaryUnit);
          const convRate = Number(matchedItem.conversion_rate ?? matchedItem.conversionRate) || 1;
          const primaryQtyEquiv = isSecondary && convRate > 0 ? qty / convRate : qty;

          let basePrice = Number(matchedItem.sale_price ?? matchedItem.salePrice);

          const minStock = Number(matchedItem.min_stock ?? matchedItem.minStock);
          const wholesalePrice = Number(matchedItem.wholesale_price ?? matchedItem.wholesalePrice);

          if (Number.isFinite(minStock) && minStock > 0 && primaryQtyEquiv >= minStock) {
            basePrice = wholesalePrice || basePrice;
          }

          if (isSecondary && convRate > 0) {
            updatedRow.pricePerUnit = String(basePrice / convRate);
          } else {
            updatedRow.pricePerUnit = String(basePrice);
          }
        }
      }

      return updatedRow;
    });

    // Helper to check if a row is empty
    const isEmpty = (row: SaleRow) => !row.item && !row.qty && !row.pricePerUnit;

    // Remove consecutive empty rows from the end, keeping exactly one
    while (updatedRows.length > 2 && isEmpty(updatedRows[updatedRows.length - 1])) {
      const secondLast = updatedRows[updatedRows.length - 2];
      if (isEmpty(secondLast)) {
        // If second-to-last is also empty, remove the last one
        updatedRows.pop();
      } else {
        // If second-to-last is NOT empty, keep one empty row and stop
        break;
      }
    }

    // Ensure there's at least one empty row at the end for input
    const lastRow = updatedRows[updatedRows.length - 1];
    if (!isEmpty(lastRow)) {
      // If last row is not empty, add a new empty row
      updatedRows.push({ id: globalRowId++, item: "", qty: "", unit: "NONE", pricePerUnit: "" });
    }

    updateTab({ rows: updatedRows });
  };

  const addRow = () => {
    updateTab({
      rows: [
        ...activeTab.rows,
        { id: globalRowId++, item: "", qty: "", unit: "NONE", pricePerUnit: "" },
      ],
    });
  };

  const removeRow = (rowId: number) => {
    updateTab({ rows: activeTab.rows.filter((r) => r.id !== rowId) });
  };

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <>
      <div
        style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#D0DCE7",
        opacity: isOpenAnimated ? 1 : 0,
        transform: isOpenAnimated ? "translate3d(0, 0, 0) scale(1)" : "translate3d(-48px, 48px, 0) scale(0.99)",
        transition: "opacity 120ms ease-out, transform 170ms cubic-bezier(0.2, 0.8, 0.2, 1)",
      }}
    >
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        setActiveTabId={setActiveTabId}
        closeTab={closeTab}
        addTab={addTab}
        onClose={handleCloseRequest}
      />

      <TopBar />

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 0 }}>
        <CustomerSearch
          activeTab={activeTab}
          updateTab={updateTab}
          parties={parties}
          setShowAddParty={setShowAddParty}
        />

        <EstimateTable
          activeTab={activeTab}
          updateRow={updateRow}
          removeRow={removeRow}
          addRow={addRow}
          totalQty={totalQty}
          totalAmount={totalAmount}
          fmt={fmt}
          items={items}
        />

        <BottomSection
          activeTab={activeTab}
          updateTab={updateTab}
          totalAmount={totalAmount}
          taxAmount={taxAmount}
          roundOffDiff={roundOffDiff}
          roundedTotal={roundedTotal}
          fmt={fmt}
          taxOptions={taxOptions}
        />
      </div>

      <Footer
        onShare={onShare}
        onSave={handleSaveEstimate}
      />
      
      <AddPartyDialog
        showAddParty={showAddParty}
        setShowAddParty={setShowAddParty}
        partyBeingEdited={partyBeingEdited}
        setPartyBeingEdited={setPartyBeingEdited}
        resetPartyForm={resetPartyForm}
        partyForm={partyForm}
        setPartyForm={setPartyForm}
        activeTab={activeTabParty}
        setActiveTab={setActiveTabParty}
        showShippingAddress={showShippingAddress}
        setShowShippingAddress={setShowShippingAddress}
        handleSaveParty={handleSaveParty}
        isSavingParty={isSavingParty}
        partyPendingDelete={null}
        setPartyPendingDelete={() => {}}
        isDeletingParty={false}
        handleDeleteParty={async () => {}}
        showCreditLimitError={showCreditLimitError}
        setShowCreditLimitError={setShowCreditLimitError}
      />
    </div>

      <ConfirmDialog
        open={showDiscardDialog}
        title="Discard Changes?"
        message="You have unsaved changes. Are you sure you want to discard them? All unsaved changes will be lost."
        confirmLabel="Discard"
        cancelLabel="Cancel"
        confirmColor="#e53935"
        icon="warning"
        onConfirm={() => { setShowDiscardDialog(false); if (onClose) onClose(); }}
        onCancel={() => setShowDiscardDialog(false)}
      />

      <ConfirmDialog
        open={tabClosePendingId !== null}
        title="Discard Changes?"
        message="This tab has unsaved changes. Are you sure you want to close it?"
        confirmLabel="Discard"
        cancelLabel="Cancel"
        confirmColor="#e53935"
        icon="warning"
        onConfirm={() => { const id = tabClosePendingId!; setTabClosePendingId(null); doCloseTab(id); }}
        onCancel={() => setTabClosePendingId(null)}
      />
    </>
  );
}