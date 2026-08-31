import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScanBarcode, Search, ChevronDown, Package } from "lucide-react";
import type { Item } from "@/types";

export interface BarcodeFormData {
  itemName: string;
  itemCode: string;
  noOfLabels: string;
  header: string;
  line1: string;
  line2: string;
  line3: string;
  line4: string;
}

interface BarcodeGeneratorFormProps {
  formData: BarcodeFormData;
  setFormData: React.Dispatch<React.SetStateAction<BarcodeFormData>>;
  onAdd: () => void;
  isLoading?: boolean;
  items: Item[];
  activeFields?: {
    salePrice: boolean;
    companyName: boolean;
    itemName: boolean;
    discount: boolean;
  };
}

// Each sidebar checkbox maps 1-to-1 to a fixed formData field.
const ACTIVE_FIELD_MAP = [
  {
    key: "companyName" as const,
    formKey: "header" as const,
    label: "Company Name",
    placeholder: "Enter company name",
  },
  {
    key: "itemName" as const,
    formKey: "line1" as const,
    label: "Item Name",
    placeholder: "Enter item name",
  },
  {
    key: "salePrice" as const,
    formKey: "line2" as const,
    label: "Sale Price",
    placeholder: "Enter sale price",
  },
  {
    key: "discount" as const,
    formKey: "line3" as const,
    label: "Discount",
    placeholder: "Enter discount text",
  },
];

// ── Professional Item Dropdown ────────────────────────────────────────────────

interface ItemDropdownProps {
  value: string;
  items: Item[];
  onSelect: (item: Item) => void;
}

function ItemDropdown({ value, items, onSelect }: ItemDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? items.filter(
        (i) =>
          i.name.toLowerCase().includes(query.toLowerCase()) ||
          (i.code ?? "").toLowerCase().includes(query.toLowerCase())
      )
    : items;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 10);
    }
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm border rounded-lg bg-white transition-all duration-150
          ${open
            ? "border-[#E53935] ring-2 ring-[#E53935]/20 text-gray-800"
            : "border-gray-300 text-gray-700 hover:border-gray-400"
          }
          ${!value ? "text-gray-400" : ""}`}
      >
        <span className="truncate">{value || "Select Item"}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-full min-w-[260px] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-scaleIn origin-top">
          {/* Search box */}
          <div className="p-2.5 border-b border-gray-100">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus-within:border-[#E53935] focus-within:ring-2 focus-within:ring-[#E53935]/20 transition-all">
              <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filtered.length > 0) {
                    onSelect(filtered[0]);
                    setOpen(false);
                    setQuery("");
                  }
                }}
                placeholder="Search by name or code…"
                className="flex-1 text-sm bg-transparent outline-none border-none focus:ring-0 p-0 placeholder-gray-400 text-gray-700"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-gray-400 hover:text-gray-600 text-xs leading-none"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Item list */}
          <ul className="max-h-56 overflow-y-auto py-1 scrollbar-thin">
            {filtered.length === 0 && (
              <li className="flex flex-col items-center justify-center py-6 text-gray-400 text-sm gap-2">
                <Package className="w-8 h-8 text-gray-300" />
                <span>No items found</span>
              </li>
            )}
            {filtered.map((item) => {
              const isSelected = item.name === value;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(item);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors
                      ${isSelected
                        ? "bg-red-50 text-[#E53935]"
                        : "hover:bg-gray-50 text-gray-700"
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0
                        ${isSelected ? "bg-[#E53935]/10" : "bg-gray-100"}`}
                      >
                        <Package className={`w-3.5 h-3.5 ${isSelected ? "text-[#E53935]" : "text-gray-400"}`} />
                      </div>
                      <span className={`text-sm truncate ${isSelected ? "font-semibold" : "font-medium"}`}>
                        {item.name}
                      </span>
                    </div>
                    {item.code && (
                      <span className={`text-xs font-mono flex-shrink-0 px-1.5 py-0.5 rounded
                        ${isSelected ? "bg-[#E53935]/10 text-[#E53935]" : "bg-gray-100 text-gray-400"}`}
                      >
                        {item.code}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Footer count */}
          {filtered.length > 0 && (
            <div className="px-3.5 py-2 border-t border-gray-100 text-xs text-gray-400 bg-gray-50">
              {filtered.length} item{filtered.length !== 1 ? "s" : ""} found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Form ─────────────────────────────────────────────────────────────────

export function BarcodeGeneratorForm({
  formData,
  setFormData,
  onAdd,
  isLoading,
  items,
  activeFields,
}: BarcodeGeneratorFormProps) {
  const handleChange = (field: keyof BarcodeFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemSelect = (item: Item) => {
    // Clear old item data first so no stale barcode/name bleeds through
    setFormData((prev) => ({
      ...prev,
      itemName: "",
      itemCode: "",
    }));
    // Then set the new item in the next tick so state updates are clean
    setTimeout(() => {
      setFormData((prev) => ({
        ...prev,
        itemName: item.name,
        itemCode: item.code || "",
      }));
    }, 0);
  };

  // Only show inputs whose sidebar checkbox is checked
  const visibleFields = ACTIVE_FIELD_MAP.filter(
    ({ key }) => activeFields?.[key] === true
  );

  return (
    <div className="flex-1 pr-8">
      <h4 className="font-semibold text-gray-700 mb-6">
        Enter item details to add for barcode
      </h4>

      {/* ── Required fields ─────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Item Name — custom professional dropdown */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            Item Name<span className="text-red-500">*</span>
          </label>
          <ItemDropdown
            value={formData.itemName}
            items={items}
            onSelect={handleItemSelect}
          />
        </div>

        {/* Item Code */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            Item Code<span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Enter Item Code"
              className="text-sm placeholder:text-gray-400 border-gray-300 pr-10"
              value={formData.itemCode}
              onChange={(e) => handleChange("itemCode", e.target.value)}
            />
            <button
              className="absolute right-1 top-1 bottom-1 px-2 flex items-center justify-center text-white bg-[#E53935] hover:bg-[#d32f2f] rounded transition-colors"
              title="Assign Random Code"
              onClick={() => {
                const randomCode = Math.floor(
                  100000000000 + Math.random() * 900000000000
                ).toString();
                handleChange("itemCode", randomCode);
              }}
            >
              <ScanBarcode className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* No of Labels */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            No of Labels<span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="Enter No of Labels"
            className="text-sm placeholder:text-gray-400 border-gray-300"
            value={formData.noOfLabels}
            onChange={(e) => handleChange("noOfLabels", e.target.value)}
          />
        </div>
      </div>

      {/* ── Per-checkbox inputs (only checked ones appear) ───────────── */}
      {visibleFields.length > 0 && (
        <div
          className={`grid gap-6 mb-6 ${
            visibleFields.length === 1
              ? "grid-cols-1"
              : visibleFields.length === 2
              ? "grid-cols-2"
              : "grid-cols-3"
          }`}
        >
          {visibleFields.map(({ formKey, label, placeholder }) => (
            <div key={formKey}>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                {label}
              </label>
              <Input
                type="text"
                placeholder={placeholder}
                className="text-sm placeholder:text-gray-400 border-gray-300"
                value={formData[formKey] as string}
                onChange={(e) => handleChange(formKey, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Line 4 free-text + Add button ───────────────────────────── */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            Line 4
          </label>
          <Input
            type="text"
            placeholder="Enter custom text for Line 4"
            className="text-sm placeholder:text-gray-400 border-gray-300"
            value={formData.line4}
            onChange={(e) => handleChange("line4", e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button
            className="w-full bg-[#E53935] hover:bg-[#d32f2f] text-white font-semibold rounded-full disabled:opacity-50"
            onClick={onAdd}
            disabled={
              isLoading ||
              !formData.itemName ||
              !formData.itemCode ||
              !formData.noOfLabels
            }
          >
            {isLoading ? "Adding..." : "Add for Barcode"}
          </Button>
        </div>
      </div>
    </div>
  );
}
