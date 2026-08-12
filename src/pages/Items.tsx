import { useState } from "react";
import { ProductsTab } from "@/components/pagescomponents/items/products/ProductsTab";
import type { CategoryRecord, UnitRecord, ConversionRateRecord } from "@/components/pagescomponents/items/products/types";
import { CategoryTab } from "@/components/pagescomponents/items/category/CategoryTab";
import { UnitsTab } from "@/components/pagescomponents/items/units/UnitsTab";
import { useSettings } from "@/hooks/useSettings";
import { Grid } from "lucide-react";

import type { ViewType } from "@/types";

// --- MAIN COMPONENT ---
interface ItemsProps {
  onViewChange?: (view: ViewType) => void;
}

export function Items({ onViewChange }: ItemsProps) {
  const [activeTab, setActiveTab] = useState<"products" | "category" | "units">(
    "products"
  );
  const [enableGrid] = useSettings("enable_grid", false);

  // ---- Shared state ----

  // Category
  const [categoryList, setCategoryList] = useState<CategoryRecord[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryBeingEdited, setCategoryBeingEdited] =
    useState<CategoryRecord | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);

  // Units & conversions (shared with ProductsTab)
  const [units, setUnits] = useState<UnitRecord[]>([]);
  const [conversionRates, setConversionRates] = useState<ConversionRateRecord[]>([]);

  // Unit selector modal (opened by ProductsTab, rendered inside UnitsTab)
  const [showUnitSelector, setShowUnitSelector] = useState(false);
  const [unitSelectorBaseUnitId, setUnitSelectorBaseUnitId] = useState("");
  const [unitSelectorSecondaryUnitId, setUnitSelectorSecondaryUnitId] = useState("");
  const [unitSelectorConversionRate, setUnitSelectorConversionRate] = useState(0);
  const [unitSelectorOnSave, setUnitSelectorOnSave] = useState<
    | ((result: {
        selectedUnitId: string;
        baseUnitId: string;
        secondaryUnitId: string;
        conversionRate: number;
      }) => void)
    | null
  >(null);

  /** Common props for UnitsTab regardless of whether it is the active tab */
  const unitsTabSharedProps = {
    units,
    setUnits,
    conversionRates,
    setConversionRates,
    showUnitSelector,
    setShowUnitSelector,
    unitSelectorBaseUnitId,
    setUnitSelectorBaseUnitId,
    unitSelectorSecondaryUnitId,
    setUnitSelectorSecondaryUnitId,
    unitSelectorConversionRate,
    setUnitSelectorConversionRate,
    unitSelectorOnSave,
  };

  // ---- Render ----
  return (
    <div className="h-full flex flex-col bg-[#D0DCE7] p-0 gap-1 relative">
      {/* Top Tab Bar */}
      <div
        className="p-0 bg-white rounded-none flex items-center justify-between shrink-0 w-full"
        style={{ minHeight: "56px" }}
      >
        <div className="flex w-full">
          {(["products", "category", "units"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-sm font-medium pb-2 border-b-2 transition-colors ${
                activeTab === tab
                  ? "text-[#E53935] border-[#E53935]"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-1 overflow-hidden">
        {activeTab === "products" && (
          <ProductsTab
            units={units}
            categoryList={categoryList}
            setCategoryList={setCategoryList}
            onOpenAddCategory={(onCreated) => {
              setNewCategoryName("");
              setCategoryBeingEdited(null);
              if (onCreated) {
                addCategoryCallbackRef.current = onCreated;
              }
              setShowAddCategory(true);
            }}
            onOpenUnitSelector={(opts) => {
              setUnitSelectorBaseUnitId(opts.baseUnitId);
              setUnitSelectorSecondaryUnitId(opts.secondaryUnitId);
              setUnitSelectorConversionRate(opts.conversionRate);
              setUnitSelectorOnSave(() => opts.onSave);
              setShowUnitSelector(true);
            }}
          />
        )}

        {activeTab === "category" && (
          <CategoryTab
            categoryList={categoryList}
            setCategoryList={setCategoryList}
            addCategoryCallbackRef={addCategoryCallbackRef}
            showAddCategory={showAddCategory}
            setShowAddCategory={setShowAddCategory}
            newCategoryName={newCategoryName}
            setNewCategoryName={setNewCategoryName}
            categoryBeingEdited={categoryBeingEdited}
            setCategoryBeingEdited={setCategoryBeingEdited}
          />
        )}

        {activeTab === "units" && (
          <UnitsTab {...unitsTabSharedProps} />
        )}
      </div>

      {/*
        UnitSelectorModal must be accessible from the Products tab too.
        When the units tab is not active we mount UnitsTab in selectorOnly mode
        so the modal is always available without duplicating state.
      */}
      {activeTab !== "units" && (
        <UnitsTab {...unitsTabSharedProps} selectorOnly />
      )}
      
      {/*
        Similarly, AddCategoryModal must be accessible from the Products tab.
        When the category tab is not active, we mount CategoryTab in selectorOnly mode.
      */}
      {activeTab !== "category" && (
        <CategoryTab
          categoryList={categoryList}
          setCategoryList={setCategoryList}
          addCategoryCallbackRef={addCategoryCallbackRef}
          showAddCategory={showAddCategory}
          setShowAddCategory={setShowAddCategory}
          newCategoryName={newCategoryName}
          setNewCategoryName={setNewCategoryName}
          categoryBeingEdited={categoryBeingEdited}
          setCategoryBeingEdited={setCategoryBeingEdited}
          selectorOnly
        />
      )}

      {/* Floating Grid Button */}
      {enableGrid && (
        <button
          onClick={() => onViewChange?.('griditems')}
          className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors z-50"
          title="Grid View"
        >
          <Grid size={24} />
        </button>
      )}
    </div>
  );
}

// Ref to store the optional callback from ProductsTab's AddItemModal
// (lives outside function so it can be used inside the early-return render)
const addCategoryCallbackRef = { current: null as ((id: string) => void) | null };
