import { useState, useEffect } from "react";
import { BarcodeGeneratorHeader } from "@/components/pagescomponents/utilities/barcodegenerator/BarcodeGeneratorHeader";
import { BarcodeGeneratorForm, type BarcodeFormData } from "@/components/pagescomponents/utilities/barcodegenerator/BarcodeGeneratorForm";
import { BarcodeGeneratorPreview } from "@/components/pagescomponents/utilities/barcodegenerator/BarcodeGeneratorPreview";
import { BarcodeGeneratorItemList, type BarcodeItem } from "@/components/pagescomponents/utilities/barcodegenerator/BarcodeGeneratorItemList";
import type { Item } from "@/types";

export function BarcodeGenerator() {
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

  const [itemList, setItemList] = useState<BarcodeItem[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchInitialData = async () => {
    try {
      const [barcodesRes, itemsRes, profileRes] = await Promise.all([
        fetch('/api/barcode_generator'),
        fetch('/api/items'),
        fetch('/api/user_profile')
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

  const handleAdd = async () => {
    if (!formData.itemName || !formData.itemCode || !formData.noOfLabels) return;
    setIsLoading(true);

    const newItem: BarcodeItem = {
      id: Date.now().toString(),
      ...formData,
    };

    try {
      const res = await fetch('/api/barcode_generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });

      if (res.ok) {
        setItemList((prev) => [...prev, newItem]);

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

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/barcode_generator/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setItemList(prev => prev.filter(item => item.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete barcode", e);
    }
  };

  return (
    <div className="h-full bg-[#F8FAFC] overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <BarcodeGeneratorHeader />

        <div className="flex border border-gray-200 bg-white p-6 rounded-md shadow-sm">
          <BarcodeGeneratorForm
            formData={formData}
            setFormData={setFormData}
            onAdd={handleAdd}
            isLoading={isLoading}
            items={items}
          />
          <BarcodeGeneratorPreview
            formData={formData}
            items={items}
            companyName={companyName}
          />
        </div>

        <BarcodeGeneratorItemList items={itemList} allItems={items} companyName={companyName} onDelete={handleDelete} />
      </div>
    </div>
  );
}
