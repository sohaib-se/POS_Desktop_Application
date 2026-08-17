import { useState } from "react";
import { ImportItemsHeader } from "@/components/pagescomponents/utilities/importitems/ImportItemsHeader";
import { ImportItemsSteps } from "@/components/pagescomponents/utilities/importitems/ImportItemsSteps";
import { ImportItemsUpload, type ImportedItem } from "@/components/pagescomponents/utilities/importitems/ImportItemsUpload";
import { toast } from "sonner";
import type { ViewType } from "@/types";

interface ImportItemsProps {
  onViewChange?: (view: ViewType) => void;
}

export function ImportItems({ onViewChange }: ImportItemsProps = {}) {
  const [importedItems, setImportedItems] = useState<ImportedItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleItemsImported = (items: ImportedItem[]) => {
    setImportedItems(items);
  };

  const handleSaveItems = async () => {
    if (importedItems.length === 0) return;
    setIsSaving(true);
    let successCount = 0;
    let skippedCount = 0;
    
    try {
      // Pre-fetch items to prevent duplication
      const itemsRes = await fetch("/api/items");
      const existingItems = itemsRes.ok ? await itemsRes.json() : [];
      const existingItemNames = new Set(existingItems.map((i: any) => i.name.toLowerCase()));

      // Pre-fetch categories
      const catRes = await fetch("/api/categories");
      const existingCategories = catRes.ok ? await catRes.json() : [];
      const categoryNames = new Set(existingCategories.map((c: any) => c.name.toLowerCase()));

      for (const item of importedItems) {
        const itemName = item["Item Name"]?.toString().trim() || "Unnamed Item";
        
        // Skip duplicate items
        if (existingItemNames.has(itemName.toLowerCase())) {
          skippedCount++;
          continue;
        }

        const rawCategory = item["Category"]?.toString().trim();
        let finalCategory = null;

        if (rawCategory) {
          finalCategory = rawCategory;
          // Create category if it doesn't exist
          if (!categoryNames.has(rawCategory.toLowerCase())) {
            const createCatRes = await fetch("/api/categories", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: rawCategory, itemCount: 0 }),
            });
            if (createCatRes.ok) {
              categoryNames.add(rawCategory.toLowerCase());
            }
          }
        }

        const payload = {
          name: itemName,
          code: item["Item Code"]?.toString().trim() || null,
          category: finalCategory,
          salePrice: Number(item["Sale Price"]) || 0,
          wholesalePrice: Number(item["Wholesale Price"]) || 0,
          purchasePrice: Number(item["Purchase Price"]) || 0,
          atPrice: item["At Price"] ? Number(item["At Price"]) : null,
          stockQuantity: Number(item["Opening Stock"]) || 0,
          unit: item["Primary Unit"]?.toString().trim() || "Unit",
          primaryUnit: item["Primary Unit"]?.toString().trim() || null,
          secondaryUnit: item["Secondary Unit"]?.toString().trim() || null,
          conversionRate: Number(item["Conversion Rate"]) || null,
          imgPath: item["Item Image"]?.toString().trim() || null,
          minStock: Number(item["Minimum Wholesale Quantity"]) || 0,
          lowStock: item["Low Threshold Quantity"] ? Number(item["Low Threshold Quantity"]) : null,
          mfgDate: item["Manufacturing Date"]?.toString().trim() || null,
          expDate: item["Expiry Date"]?.toString().trim() || null,
          stockValue: (Number(item["Opening Stock"]) || 0) * (item["At Price"] ? Number(item["At Price"]) : Number(item["Purchase Price"]) || 0),
        };

        const response = await fetch("/api/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          successCount++;
          existingItemNames.add(itemName.toLowerCase()); // Add to set to prevent duplicates in the same sheet
        }
      }
      
      if (successCount > 0 || skippedCount > 0) {
        if (successCount > 0 && skippedCount === 0) {
          toast.success(`Successfully imported ${successCount} items!`);
        } else if (successCount > 0 && skippedCount > 0) {
          toast.success(`Imported ${successCount} items. Skipped ${skippedCount} duplicates.`);
        } else if (successCount === 0 && skippedCount > 0) {
          toast.warning(`No items imported. Skipped ${skippedCount} duplicates.`);
        }
        
        setImportedItems([]); // Disappear from import page
        if (onViewChange) {
          onViewChange("items"); // Navigate to items page
        }
      } else {
        toast.error("Failed to import items.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while importing items.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <ImportItemsHeader />
        <div className="grid grid-cols-2 gap-8 mb-8">
          <ImportItemsSteps />
          <ImportItemsUpload onItemsImported={handleItemsImported} />
        </div>

        {importedItems.length > 0 && (
          <div className="mt-8 border-t pt-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">
                Imported Items Preview ({importedItems.length})
              </h4>
              <button 
                onClick={handleSaveItems}
                disabled={isSaving}
                className="bg-[#1976D2] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save / Import Items"}
              </button>
            </div>
            
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Item Name</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Category</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Code</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Primary Unit</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Secondary Unit</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Conv. Rate</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Sale Price</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Wholesale Price</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Purchase Price</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Min Qty</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Low Threshold</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Opening Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {importedItems.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">{item["Item Name"]}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{item["Category"]}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{item["Item Code"]}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{item["Primary Unit"]}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{item["Secondary Unit"]}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{item["Conversion Rate"]}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{item["Sale Price"]}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{item["Wholesale Price"]}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{item["Purchase Price"]}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{item["Minimum Wholesale Quantity"]}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{item["Low Threshold Quantity"]}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{item["Opening Stock"]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

