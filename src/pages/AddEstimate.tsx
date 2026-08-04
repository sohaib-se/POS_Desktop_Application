import { useState, useRef, useCallback, useEffect } from "react";
import type { SaleRow, SaleTab } from "../components/pagescomponents/addestimate/types";
import { TabBar } from "../components/pagescomponents/addestimate/TabBar";
import { TopBar } from "../components/pagescomponents/addestimate/TopBar";
import { CustomerSearch } from "../components/pagescomponents/addestimate/CustomerSearch";
import { EstimateTable } from "../components/pagescomponents/addestimate/EstimateTable";
import { BottomSection } from "../components/pagescomponents/addestimate/BottomSection";
import { Footer } from "../components/pagescomponents/addestimate/Footer";

interface AddEstimateProps {
  onSave?: () => void;
  onShare?: () => void;
  onClose?: () => void;
}

const unitOptions = [
  "NONE", "PCS", "KG", "G", "L", "ML", "M", "CM", "MM",
  "DOZEN", "BOX", "PACK", "BAG", "BOTTLE", "CAN", "SET",
];
const taxOptions = ["NONE", "GST 5%", "GST 12%", "GST 18%", "GST 28%"];

let globalRowId = 3;
let globalTabId = 2;

function createDefaultTab(id: number): SaleTab {
  return {
    id,
    label: `Estimate #${id}`,
    paymentMode: "credit",
    customerSearch: "",
    phoneNo: "",
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
  };
}

function useColumnResize(initial: number[]) {
  const [widths, setWidths] = useState(initial);
  const resizing = useRef<{ col: number; startX: number; startW: number } | null>(null);

  const startResize = useCallback((col: number, e: React.MouseEvent) => {
    e.preventDefault();
    resizing.current = { col, startX: e.clientX, startW: widths[col] };

    const onMove = (ev: MouseEvent) => {
      if (!resizing.current) return;
      const delta = ev.clientX - resizing.current.startX;
      const newW = Math.max(50, resizing.current.startW + delta);
      setWidths((prev) => {
        const next = [...prev];
        next[resizing.current!.col] = newW;
        return next;
      });
    };
    const onUp = () => {
      resizing.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [widths]);

  return { widths, startResize };
}

export function AddEstimate({ onSave, onShare, onClose }: AddEstimateProps) {
  const [tabs, setTabs] = useState<SaleTab[]>([createDefaultTab(1)]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [isOpenAnimated, setIsOpenAnimated] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsOpenAnimated(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // col widths: [#, ITEM, QTY, UNIT, PRICE/UNIT, AMOUNT]
  const { widths, startResize } = useColumnResize([42, 340, 90, 110, 130, 120]);

  const activeTab = tabs.find((t) => t.id === activeTabId)!;

  const updateTab = (partial: Partial<SaleTab>) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, ...partial } : t))
    );
  };

  const addTab = () => {
    const id = globalTabId++;
    const newTab = createDefaultTab(id);
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(id);
  };

  const closeTab = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    setTabs((prev) => {
      const remaining = prev.filter((t) => t.id !== id);
      if (activeTabId === id) setActiveTabId(remaining[remaining.length - 1].id);
      return remaining;
    });
  };

  const updateRow = (rowId: number, field: keyof SaleRow, value: string) => {
    const updatedRows = activeTab.rows.map((row) =>
      row.id === rowId ? { ...row, [field]: value } : row
    );

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

  const totalQty = activeTab.rows.reduce((s, r) => s + (parseFloat(r.qty) || 0), 0);
  const totalAmount = activeTab.rows.reduce(
    (s, r) => s + (parseFloat(r.qty) || 0) * (parseFloat(r.pricePerUnit) || 0), 0
  );
  const taxRate = activeTab.tax === "NONE" ? 0 : parseFloat(activeTab.tax.replace(/[^0-9.]/g, "")) / 100;
  const taxAmount = totalAmount * taxRate;
  const discountAmount = activeTab.discountRs ? parseFloat(activeTab.discountRs) : 0;
  const grandTotal = totalAmount + taxAmount - discountAmount;
  const roundedTotal = activeTab.roundOff ? Math.round(grandTotal) : grandTotal;
  const roundOffDiff = roundedTotal - grandTotal;

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
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
        onClose={onClose}
      />

      <TopBar
        activeTab={activeTab}
        updateTab={updateTab}
      />

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 0 }}>
        <CustomerSearch
          activeTab={activeTab}
          updateTab={updateTab}
        />

        <EstimateTable
          activeTab={activeTab}
          updateRow={updateRow}
          addRow={addRow}
          widths={widths}
          startResize={startResize}
          totalQty={totalQty}
          totalAmount={totalAmount}
          fmt={fmt}
          unitOptions={unitOptions}
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
        onSave={onSave}
      />
    </div>
  );
}