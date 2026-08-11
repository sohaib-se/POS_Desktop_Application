import { useState, useEffect } from "react";
import { BarcodeGeneratorHeader } from "@/components/pagescomponents/utilities/barcodegenerator/BarcodeGeneratorHeader";
import { BarcodeGeneratorForm, type BarcodeFormData } from "@/components/pagescomponents/utilities/barcodegenerator/BarcodeGeneratorForm";
import { BarcodeGeneratorPreview } from "@/components/pagescomponents/utilities/barcodegenerator/BarcodeGeneratorPreview";
import { BarcodeGeneratorItemList, type BarcodeItem } from "@/components/pagescomponents/utilities/barcodegenerator/BarcodeGeneratorItemList";
import {
  DEFAULT_PRINTER_SETTINGS,
  DEFAULT_ACTIVE_FIELDS,
  getLabelSize,
  type PrinterSettings,
  type ActiveFields,
} from "@/components/pagescomponents/utilities/barcodegenerator/barcodeTypes";
import type { Item } from "@/types";

export function BarcodeGenerator() {
  // ── Printer & Size settings (shared across all child components) ──────────
  const [printerSettings, setPrinterSettings] = useState<PrinterSettings>(DEFAULT_PRINTER_SETTINGS);
  const [activeFields, setActiveFields] = useState<ActiveFields>(DEFAULT_ACTIVE_FIELDS);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState<BarcodeFormData>({
    itemName: "",
    itemCode: "",
    noOfLabels: "",
    header: "",
    line1: "",
    line2: "",
    line3: "",
    line4: "",
  });

  // ── Application data ───────────────────────────────────────────────────────
  const [itemList, setItemList] = useState<BarcodeItem[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Derive the current label size from settings
  const labelSize = getLabelSize(printerSettings);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchInitialData = async () => {
    try {
      const [barcodesRes, itemsRes, profileRes] = await Promise.all([
        fetch("/api/barcode_generator"),
        fetch("/api/items"),
        fetch("/api/user_profile"),
      ]);
      if (barcodesRes.ok) setItemList(await barcodesRes.json());
      if (itemsRes.ok) setItems(await itemsRes.json());
      if (profileRes.ok) {
        const profile = await profileRes.json();
        setCompanyName(profile.business_name || "");
      }
    } catch (e) {
      console.error("Failed to fetch initial data", e);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // ── Handle Add for Barcode ─────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!formData.itemName || !formData.itemCode || !formData.noOfLabels) return;

    const qty = parseInt(formData.noOfLabels, 10);
    if (isNaN(qty) || qty <= 0) return;

    setIsLoading(true);

    const newItem: BarcodeItem = {
      id: Date.now().toString(),
      ...formData,
      noOfLabels: String(qty),
    };

    try {
      const res = await fetch("/api/barcode_generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });

      if (res.ok) {
        setItemList((prev) => [...prev, newItem]);
        // Reset form but preserve settings
        setFormData({
          itemName: "",
          itemCode: "",
          noOfLabels: "",
          header: "",
          line1: "",
          line2: "",
          line3: "",
          line4: "",
        });
      }
    } catch (e) {
      console.error("Failed to add barcode", e);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Handle Delete ──────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/barcode_generator/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItemList((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete barcode", e);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="h-full bg-[#F8FAFC] overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">

        {/* Header — shows live printer/size info, opens settings drawer */}
        <BarcodeGeneratorHeader
          printerSettings={printerSettings}
          setPrinterSettings={setPrinterSettings}
          activeFields={activeFields}
          setActiveFields={setActiveFields}
        />

        {/* Input form + live preview */}
        <div className="flex border border-gray-200 bg-white p-6 rounded-md shadow-sm">
          <BarcodeGeneratorForm
            formData={formData}
            setFormData={setFormData}
            onAdd={handleAdd}
            isLoading={isLoading}
            items={items}
            activeFields={activeFields}
          />
          <BarcodeGeneratorPreview
            formData={formData}
            items={items}
            companyName={companyName}
          />
        </div>

        {/* Item list — selection, print, delete */}
        <BarcodeGeneratorItemList
          items={itemList}
          allItems={items}
          companyName={companyName}
          onDelete={handleDelete}
          labelSize={labelSize}
        />
      </div>
    </div>
  );
}
