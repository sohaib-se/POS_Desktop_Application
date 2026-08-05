import { useEffect, useRef, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { ProductsTab } from "@/components/pagescomponents/items/products/ProductsTab";
import type { CategoryRecord, UnitRecord, ConversionRateRecord } from "@/components/pagescomponents/items/products/types";
import { CategoryTab } from "@/components/pagescomponents/items/category/CategoryTab";

// --- LOCAL TYPES (used only in Units tab) ---

type UnitContextMenuState = {
  unit: UnitRecord;
  x: number;
  y: number;
};

// --- INLINE UI COMPONENTS (for Units tab only) ---
const Card = ({
  children,
  className,
  style,
}: {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div
    className={`bg-white rounded-lg border shadow-sm ${className || ""}`}
    style={style}
  >
    {children}
  </div>
);
const CardContent = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => <div className={`${className || ""}`}>{children}</div>;

const Dialog = ({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 overflow-y-auto">
      <div className="absolute inset-0" onClick={() => onOpenChange(false)}></div>
      <div className="relative z-10 w-full flex justify-center p-4">
        {children}
      </div>
    </div>
  );
};
const DialogContent = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white rounded-lg p-6 w-full max-w-lg relative shadow-xl ${className || ""}`}
  >
    {children}
  </div>
);
const DialogHeader = ({ children }: { children?: React.ReactNode }) => (
  <div className="mb-4">{children}</div>
);
const DialogTitle = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <h2 className={`text-lg font-semibold ${className || ""}`}>{children}</h2>
);

// --- MAIN COMPONENT ---
export function Items() {
  // Add Conversion Modal State
  const [showAddConversion, setShowAddConversion] = useState(false);
  const [conversionBaseUnit, setConversionBaseUnit] = useState("");
  const [conversionSecondaryUnit, setConversionSecondaryUnit] = useState("");
  const [conversionRateValue, setConversionRateValue] = useState(0);
  const [conversionSaving, setConversionSaving] = useState(false);
  const [conversionError, setConversionError] = useState("");
  const [conversionRates, setConversionRates] = useState<ConversionRateRecord[]>([]);

  async function handleSaveConversion() {
    setConversionError("");
    if (!conversionBaseUnit || !conversionSecondaryUnit || !conversionRateValue) {
      setConversionError("All fields are required.");
      return;
    }
    setConversionSaving(true);
    try {
      const isEditing = !!conversionBeingEdited;
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing
        ? `/api/conversion_rates/${conversionBeingEdited.id}`
        : "/api/conversion_rates";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseUnit: conversionBaseUnit,
          secondaryUnit: conversionSecondaryUnit,
          conversionRate: conversionRateValue,
        }),
      });
      if (!res.ok) throw new Error("Failed to save conversion");
      const savedConversion = (await res.json()) as ConversionRateRecord;

      if (isEditing) {
        setConversionRates((prev) =>
          prev.map((c) => (c.id === savedConversion.id ? savedConversion : c))
        );
      } else {
        setConversionRates((previousConversions) => [
          savedConversion,
          ...previousConversions,
        ]);
      }
      setShowAddConversion(false);
      setConversionBeingEdited(null);
      setConversionBaseUnit("");
      setConversionSecondaryUnit("");
      setConversionRateValue(0);
    } catch {
      setConversionError("Failed to save conversion");
    } finally {
      setConversionSaving(false);
    }
  }

  const handleDeleteConversion = async (
    conversionToDelete: ConversionRateRecord
  ) => {
    if (isDeletingConversion) return;
    setIsDeletingConversion(true);
    try {
      const response = await fetch(
        `/api/conversion_rates/${conversionToDelete.id}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete conversion");
      setConversionRates((prev) =>
        prev.filter((c) => c.id !== conversionToDelete.id)
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeletingConversion(false);
      setConversionPendingDelete(null);
    }
  };

  const [activeTab, setActiveTab] = useState<"products" | "category" | "units">(
    "products"
  );

  // Shared state used by Category and Units tabs
  const [categoryList, setCategoryList] = useState<CategoryRecord[]>([]);
  const [units, setUnits] = useState<UnitRecord[]>([]);

  // Category tab state (shared with CategoryTab via props)
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryBeingEdited, setCategoryBeingEdited] =
    useState<CategoryRecord | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);

  // Units tab state
  const [isUnitSearchActive, setIsUnitSearchActive] = useState(false);
  const [unitSearchTerm, setUnitSearchTerm] = useState("");
  const [conversionSearchTerm, setConversionSearchTerm] = useState("");
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [addUnitFullName, setAddUnitFullName] = useState("");
  const [addUnitShortName, setAddUnitShortName] = useState("");
  const [isSavingUnit, setIsSavingUnit] = useState(false);
  const [isDeletingUnit, setIsDeletingUnit] = useState(false);
  const [unitBeingEdited, setUnitBeingEdited] = useState<UnitRecord | null>(null);
  const [unitPendingDelete, setUnitPendingDelete] = useState<UnitRecord | null>(null);
  const [unitContextMenu, setUnitContextMenu] = useState<UnitContextMenuState | null>(null);
  const [conversionContextMenu, setConversionContextMenu] = useState<{
    conversion: ConversionRateRecord;
    x: number;
    y: number;
  } | null>(null);
  const [conversionBeingEdited, setConversionBeingEdited] =
    useState<ConversionRateRecord | null>(null);
  const [isDeletingConversion, setIsDeletingConversion] = useState(false);
  const [conversionPendingDelete, setConversionPendingDelete] =
    useState<ConversionRateRecord | null>(null);
  const [selectedUnitInTabId, setSelectedUnitInTabId] = useState<string | null>(null);

  // Unit selector modal state (used by ProductsTab via prop callback)
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

  const unitSearchInputRef = useRef<HTMLInputElement | null>(null);

  // ---- Derived for Units tab ----
  const normalizedUnitSearchTerm = unitSearchTerm.trim().toLowerCase();
  const filteredUnitList = units.filter((unit) => {
    if (!normalizedUnitSearchTerm) return true;
    return [unit.fullName, unit.shortName]
      .join(" ")
      .toLowerCase()
      .includes(normalizedUnitSearchTerm);
  });

  const selectedUnitInTab = units.find((u) => u.id === selectedUnitInTabId);
  const filteredConversions = conversionRates.filter((conversion) => {
    const isBaseUnitMatch =
      conversion.base_unit.toLowerCase() ===
      (selectedUnitInTab?.shortName ?? "").trim().toLowerCase();
    if (!isBaseUnitMatch) return false;
    if (conversionSearchTerm.trim()) {
      const searchStr = `1 ${conversion.base_unit} = ${Number(conversion.conversion_rate)} ${conversion.secondary_unit}`.toLowerCase();
      if (!searchStr.includes(conversionSearchTerm.trim().toLowerCase()))
        return false;
    }
    return true;
  });

  const getContextMenuStyle = (x: number, y: number): React.CSSProperties => {
    if (typeof window === "undefined") return { left: x, top: y };
    const menuWidth = 160;
    const menuHeight = 80;
    const viewportPadding = 8;
    let left = x;
    let top = y;
    if (left + menuWidth > window.innerWidth - viewportPadding) {
      left = Math.max(viewportPadding, window.innerWidth - menuWidth - viewportPadding);
    }
    if (top + menuHeight > window.innerHeight - viewportPadding) {
      top = Math.max(viewportPadding, y - menuHeight);
    }
    return { left, top };
  };

  // ---- Effects ----

  useEffect(() => {
    const loadUnits = async () => {
      try {
        const response = await fetch("/api/units");
        if (!response.ok) throw new Error("Failed to load units");
        const unitRows = (await response.json()) as UnitRecord[];
        setUnits(unitRows);
      } catch (error) {
        console.error(error);
      }
    };
    void loadUnits();
  }, []);

  useEffect(() => {
    const loadConversionRates = async () => {
      try {
        const response = await fetch("/api/conversion_rates");
        if (!response.ok) throw new Error("Failed to load conversion rates");
        const conversionRows = (await response.json()) as ConversionRateRecord[];
        setConversionRates(conversionRows);
      } catch (error) {
        console.error(error);
      }
    };
    void loadConversionRates();
  }, []);

  useEffect(() => {
    setSelectedUnitInTabId((prev) => {
      if (!units.length) return null;
      if (prev && units.some((u) => u.id === prev)) return prev;
      return units[0].id;
    });
  }, [units]);

  useEffect(() => {
    if (!unitContextMenu) return;
    const closeMenu = () => setUnitContextMenu(null);
    window.addEventListener("click", closeMenu);
    window.addEventListener("resize", closeMenu);
    window.addEventListener("scroll", closeMenu, true);
    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("resize", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
    };
  }, [unitContextMenu]);

  useEffect(() => {
    if (!conversionContextMenu) return;
    const closeMenu = () => setConversionContextMenu(null);
    window.addEventListener("click", closeMenu);
    window.addEventListener("resize", closeMenu);
    window.addEventListener("scroll", closeMenu, true);
    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("resize", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
    };
  }, [conversionContextMenu]);

  useEffect(() => {
    if (isUnitSearchActive) {
      unitSearchInputRef.current?.focus();
    }
  }, [isUnitSearchActive]);

  // ---- Handlers ----

  const handleUnitSave = async () => {
    const baseUnit = units.find((u) => u.id === unitSelectorBaseUnitId);
    const secondaryUnit = units.find((u) => u.id === unitSelectorSecondaryUnitId);

    if (baseUnit && secondaryUnit && unitSelectorConversionRate > 0) {
      const existingConv = conversionRates.find(
        (c) =>
          c.base_unit === baseUnit.shortName &&
          c.secondary_unit === secondaryUnit.shortName &&
          c.conversion_rate === unitSelectorConversionRate
      );
      if (!existingConv) {
        try {
          const res = await fetch("/api/conversion_rates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              baseUnit: baseUnit.shortName,
              secondaryUnit: secondaryUnit.shortName,
              conversionRate: unitSelectorConversionRate,
            }),
          });
          if (res.ok) {
            const savedConversion = (await res.json()) as ConversionRateRecord;
            setConversionRates((prev) => [savedConversion, ...prev]);
          }
        } catch (error) {
          console.error("Failed to save conversion rate globally", error);
        }
      }
    }

    if (unitSelectorOnSave) {
      unitSelectorOnSave({
        selectedUnitId: unitSelectorBaseUnitId,
        baseUnitId: unitSelectorBaseUnitId,
        secondaryUnitId: unitSelectorSecondaryUnitId,
        conversionRate: unitSelectorConversionRate,
      });
    }
    setShowUnitSelector(false);
  };

  const handleCreateUnit = async () => {
    const normalizedFullName = addUnitFullName.trim();
    const normalizedShortName = addUnitShortName.trim();
    if (!normalizedFullName || !normalizedShortName || isSavingUnit) return;

    const duplicateUnit = units.some(
      (unit) =>
        unit.id !== unitBeingEdited?.id &&
        unit.fullName.trim().toLowerCase() === normalizedFullName.toLowerCase()
    );
    if (duplicateUnit) return;

    setIsSavingUnit(true);
    try {
      const response = await fetch("/api/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: unitBeingEdited?.id,
          fullName: normalizedFullName,
          shortName: normalizedShortName,
        }),
      });
      if (!response.ok) throw new Error("Failed to create unit");
      const createdUnit = (await response.json()) as UnitRecord;
      setUnits((prev) => {
        const hasExisting = prev.some((u) => u.id === createdUnit.id);
        const next = hasExisting
          ? prev.map((u) => (u.id === createdUnit.id ? createdUnit : u))
          : [...prev, createdUnit];
        return next.sort((a, b) => a.fullName.localeCompare(b.fullName));
      });
      setSelectedUnitInTabId(createdUnit.id);
      setAddUnitFullName("");
      setAddUnitShortName("");
      setUnitBeingEdited(null);
      setShowAddUnit(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSavingUnit(false);
    }
  };

  const openEditUnitDialog = (unit: UnitRecord) => {
    setUnitBeingEdited(unit);
    setAddUnitFullName(unit.fullName);
    setAddUnitShortName(unit.shortName);
    setShowAddUnit(true);
  };

  const handleDeleteUnit = async (unit: UnitRecord) => {
    if (isDeletingUnit) return;
    setIsDeletingUnit(true);
    try {
      const response = await fetch(`/api/units/${unit.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete unit");
      setUnits((prev) => prev.filter((entry) => entry.id !== unit.id));
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeletingUnit(false);
      setUnitPendingDelete(null);
    }
  };

  // ---- Render ----
  return (
    <div className="h-full flex flex-col bg-[#D0DCE7] p-0 gap-1">
      {/* Top Header Card */}
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
          <div className="flex-1 flex gap-1 overflow-hidden">
            {/* Left Panel - Unit List */}
            <Card
              className="w-80 bg-white rounded-md flex flex-col shrink-0 overflow-hidden shadow-sm"
              style={{ marginLeft: "4px" }}
            >
              <div className="p-3 flex items-center justify-between border-b border-transparent">
                {isUnitSearchActive ? (
                  <div className="relative flex-1 max-w-[220px]">
                    <input
                      ref={unitSearchInputRef}
                      type="text"
                      value={unitSearchTerm}
                      onChange={(event) =>
                        setUnitSearchTerm(event.target.value)
                      }
                      onBlur={() => {
                        setUnitSearchTerm("");
                        setIsUnitSearchActive(false);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          setUnitSearchTerm("");
                          setIsUnitSearchActive(false);
                        }
                      }}
                      placeholder="Search units"
                      className="w-full border border-[#D1D5DB] rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsUnitSearchActive(true)}
                    className="w-10 h-10 rounded-full bg-[#E5E7EB] flex items-center justify-center text-[#4B5563] hover:bg-[#D1D5DB] transition-colors"
                    aria-label="Search units"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setUnitBeingEdited(null);
                    setAddUnitFullName("");
                    setAddUnitShortName("");
                    setShowAddUnit(true);
                  }}
                  className="flex items-center gap-1 bg-[#FFA726] hover:bg-[#FB8C00] text-white font-semibold rounded-lg px-4 py-2 shadow transition-all text-sm"
                >
                  <Plus className="w-5 h-5" />
                  Add Units
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-0">
                <table className="w-full text-sm">
                  <thead className="bg-white sticky top-0 z-10 border-b border-[#E3EAF2]">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-[#7B8A9A] text-xs tracking-wide">
                        FULLNAME
                      </th>
                      <th className="px-4 py-3 text-right font-semibold text-[#7B8A9A] text-xs tracking-wide pr-8">
                        SHORTNAME
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUnitList.map((unit) => {
                      const isSelected = unit.id === selectedUnitInTabId;
                      return (
                        <tr
                          key={unit.id}
                          onClick={() => setSelectedUnitInTabId(unit.id)}
                          onContextMenu={(event) => {
                            event.preventDefault();
                            setSelectedUnitInTabId(unit.id);
                            setUnitContextMenu({
                              unit,
                              x: event.clientX,
                              y: event.clientY,
                            });
                          }}
                          className={`cursor-pointer border-b border-[#E3EAF2] ${
                            isSelected ? "bg-[#DDEBFA]" : "hover:bg-[#F5F8FA]"
                          }`}
                        >
                          <td className="px-4 py-3 text-[#222B45] font-medium uppercase">
                            {unit.fullName}
                          </td>
                          <td className="px-4 py-3 text-right text-[#4B5563]">
                            <div className="flex items-center justify-end gap-3">
                              <span className="capitalize">{unit.shortName}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            {unitContextMenu && (
              <div
                className="fixed z-50 min-w-40 rounded-md border bg-white p-1 shadow-md"
                style={getContextMenuStyle(
                  unitContextMenu.x,
                  unitContextMenu.y
                )}
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  onClick={() => {
                    setSelectedUnitInTabId(unitContextMenu.unit.id);
                    openEditUnitDialog(unitContextMenu.unit);
                    setUnitContextMenu(null);
                  }}
                  className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-gray-100"
                >
                  View/Edit
                </button>
                <button
                  onClick={() => {
                    const unit = unitContextMenu.unit;
                    setUnitContextMenu(null);
                    setUnitPendingDelete(unit);
                  }}
                  className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            )}

            {conversionContextMenu && (
              <div
                className="fixed z-50 min-w-40 rounded-md border bg-white p-1 shadow-md"
                style={getContextMenuStyle(
                  conversionContextMenu.x,
                  conversionContextMenu.y
                )}
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  onClick={() => {
                    setConversionBeingEdited(conversionContextMenu.conversion);
                    setConversionBaseUnit(
                      conversionContextMenu.conversion.base_unit
                    );
                    setConversionSecondaryUnit(
                      conversionContextMenu.conversion.secondary_unit
                    );
                    setConversionRateValue(
                      conversionContextMenu.conversion.conversion_rate
                    );
                    setShowAddConversion(true);
                    setConversionContextMenu(null);
                  }}
                  className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-gray-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setConversionContextMenu(null);
                    setConversionPendingDelete(conversionContextMenu.conversion);
                  }}
                  className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            )}

            {/* Right Panel - Unit Details */}
            <div
              className="flex-1 flex flex-col overflow-y-auto"
              style={{ marginRight: "4px" }}
            >
              <Card
                className="bg-white rounded-md shadow-sm flex items-center justify-between px-6 py-3"
                style={{ minHeight: "64px", marginBottom: "4px" }}
              >
                <h2 className="text-base font-bold text-[#151B26] tracking-wide uppercase">
                  {selectedUnitInTab?.fullName ?? "NO UNIT SELECTED"}
                </h2>
                <button
                  className="bg-[#1976D2] hover:bg-[#1251A3] text-white px-5 py-2 rounded-lg text-sm font-bold shadow transition-all"
                  onClick={() => setShowAddConversion(true)}
                >
                  Add Conversion
                </button>
              </Card>

              <Card className="bg-white rounded-md flex flex-col flex-1 overflow-hidden shadow-sm p-0">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between px-6 pt-4 pb-2">
                    <h3 className="text-base font-bold text-[#222B45] tracking-wide">
                      CONVERSIONS
                    </h3>
                    <div className="flex gap-2 items-center">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search..."
                          value={conversionSearchTerm}
                          onChange={(e) =>
                            setConversionSearchTerm(e.target.value)
                          }
                          className="bg-[#F7F9FB] border border-[#E3EAF2] rounded-lg px-8 py-1.5 text-sm text-[#222B45] focus:bg-white focus:border-[#1976D2]"
                        />
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AEB8C4]" />
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-[#E3EAF2] rounded-b-lg overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-[#F7F9FB] sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold text-[#7B8A9A] text-xs tracking-wide align-middle w-16">
                            #
                          </th>
                          <th className="px-4 py-2 text-left font-semibold text-[#7B8A9A] text-xs tracking-wide align-middle"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredConversions.length ? (
                          filteredConversions.map((conversion, index) => (
                            <tr
                              key={conversion.id}
                              onContextMenu={(event) => {
                                event.preventDefault();
                                setConversionContextMenu({
                                  conversion,
                                  x: event.clientX,
                                  y: event.clientY,
                                });
                              }}
                              className="border-b border-[#E3EAF2] hover:bg-[#F5F8FA] cursor-pointer"
                            >
                              <td className="px-4 py-3 text-[#4B5563] font-medium">
                                {index + 1}
                              </td>
                              <td className="px-4 py-3 text-[#222B45] uppercase">
                                {`1 ${conversion.base_unit} = ${Number(conversion.conversion_rate)} ${conversion.secondary_unit}`}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={2}
                              className="px-4 py-6 text-center text-sm text-[#7B8A9A]"
                            >
                              There are no conversions to show.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* === SHARED MODALS (Units tab) === */}

      {/* Add Conversion Modal */}
      <Dialog
        open={showAddConversion}
        onOpenChange={(isOpen: boolean) => {
          setShowAddConversion(isOpen);
          if (!isOpen && !conversionSaving) {
            setConversionError("");
            setConversionRateValue(0);
            setConversionBaseUnit(selectedUnitInTab?.shortName ?? "");
            setConversionSecondaryUnit("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Select Unit</span>
              <button
                type="button"
                onClick={() => setShowAddConversion(false)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close add conversion popup"
              >
                <X className="h-4 w-4" />
              </button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Unit
                </label>
                <select
                  value={conversionBaseUnit}
                  onChange={(event) =>
                    setConversionBaseUnit(event.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">None</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.shortName}>
                      {unit.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secondary Unit
                </label>
                <select
                  value={conversionSecondaryUnit}
                  onChange={(event) =>
                    setConversionSecondaryUnit(event.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">None</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.shortName}>
                      {unit.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                1 {conversionBaseUnit || "BASE UNIT"} =
              </span>
              <input
                type="number"
                min={0}
                value={conversionRateValue}
                onChange={(event) =>
                  setConversionRateValue(Number(event.target.value) || 0)
                }
                className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <span className="text-sm text-gray-600">
                {conversionSecondaryUnit || "SECONDARY UNIT"}
              </span>
            </div>
            {conversionError ? (
              <p className="text-sm text-red-600">{conversionError}</p>
            ) : null}
            <button
              type="button"
              onClick={() => { void handleSaveConversion(); }}
              disabled={conversionSaving}
              className="w-full bg-[#1976D2] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#1251A3] disabled:opacity-60"
            >
              {conversionSaving ? "Saving..." : "SAVE"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unit Selector Modal (used by ProductsTab via prop) */}
      <Dialog open={showUnitSelector} onOpenChange={setShowUnitSelector}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Select Unit</span>
              <button
                type="button"
                onClick={() => setShowUnitSelector(false)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close unit selector popup"
              >
                <X className="h-4 w-4" />
              </button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Unit
                </label>
                <select
                  value={unitSelectorBaseUnitId}
                  onChange={(event) =>
                    setUnitSelectorBaseUnitId(event.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">None</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.shortName})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secondary Unit
                </label>
                <select
                  value={unitSelectorSecondaryUnitId}
                  onChange={(event) =>
                    setUnitSelectorSecondaryUnitId(event.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">None</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.shortName})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {(() => {
              const baseUnit = units.find((u) => u.id === unitSelectorBaseUnitId);
              const baseConversions = baseUnit
                ? conversionRates.filter(
                    (c) => c.base_unit === baseUnit.shortName
                  )
                : [];
              return baseUnit && baseConversions.length > 0 ? (
                <div className="mt-2 pt-3 border-t border-gray-100">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Existing Conversions for {baseUnit.fullName}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {baseConversions.map((conv) => {
                      const secUnit = units.find(
                        (u) => u.shortName === conv.secondary_unit
                      );
                      return (
                        <button
                          key={conv.id}
                          onClick={() => {
                            if (secUnit)
                              setUnitSelectorSecondaryUnitId(secUnit.id);
                            setUnitSelectorConversionRate(conv.conversion_rate);
                          }}
                          className="flex flex-col items-start p-2 border border-gray-200 rounded-lg hover:border-[#1976D2] hover:bg-blue-50 transition-colors text-left"
                        >
                          <span className="text-sm font-semibold text-gray-800">
                            1 {baseUnit.shortName} = {conv.conversion_rate}{" "}
                            {secUnit?.shortName || conv.secondary_unit}
                          </span>
                          <span className="text-xs text-gray-500 mt-0.5">
                            Click to select
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null;
            })()}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-600">
                1{" "}
                {units.find((u) => u.id === unitSelectorBaseUnitId)?.fullName ??
                  "BASE UNIT"}{" "}
                =
              </span>
              <input
                type="number"
                className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="0"
                value={unitSelectorConversionRate}
                onChange={(event) =>
                  setUnitSelectorConversionRate(
                    Number(event.target.value) || 0
                  )
                }
              />
              <span className="text-sm text-gray-600">
                {units.find((u) => u.id === unitSelectorSecondaryUnitId)
                  ? `${units.find((u) => u.id === unitSelectorSecondaryUnitId)!.fullName} (${units.find((u) => u.id === unitSelectorSecondaryUnitId)!.shortName})`
                  : "SECONDARY UNIT"}
              </span>
            </div>
            <button
              onClick={() => { void handleUnitSave(); }}
              className="w-full bg-[#1976D2] text-white py-2 rounded-lg text-sm font-medium"
            >
              SAVE
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Unit Modal */}
      <Dialog
        open={showAddUnit}
        onOpenChange={(isOpen: boolean) => {
          setShowAddUnit(isOpen);
          if (!isOpen) {
            setUnitBeingEdited(null);
            setAddUnitFullName("");
            setAddUnitShortName("");
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{unitBeingEdited ? "Edit Unit" : "Add Unit"}</span>
              <button
                type="button"
                onClick={() => setShowAddUnit(false)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close add unit popup"
              >
                <X className="h-4 w-4" />
              </button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={addUnitFullName}
                onChange={(event) => setAddUnitFullName(event.target.value)}
                placeholder="e.g. KILOGRAMS"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={addUnitShortName}
                onChange={(event) => setAddUnitShortName(event.target.value)}
                placeholder="e.g. Kg"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddUnit(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => { void handleCreateUnit(); }}
                disabled={
                  isSavingUnit ||
                  !addUnitFullName.trim() ||
                  !addUnitShortName.trim()
                }
                className="px-4 py-2 bg-[#1976D2] text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-60"
              >
                {isSavingUnit
                  ? "Saving..."
                  : unitBeingEdited
                    ? "Update"
                    : "Save"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Unit Modal */}
      <Dialog
        open={Boolean(unitPendingDelete)}
        onOpenChange={(isOpen: boolean) => {
          if (!isOpen && !isDeletingUnit) setUnitPendingDelete(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Unit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {unitPendingDelete
                ? `Are you sure you want to delete ${unitPendingDelete.fullName}? This action cannot be undone.`
                : "Are you sure you want to delete this unit?"}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={isDeletingUnit}
                onClick={() => setUnitPendingDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingUnit || !unitPendingDelete}
                onClick={() => {
                  if (!unitPendingDelete) return;
                  void handleDeleteUnit(unitPendingDelete);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60"
              >
                {isDeletingUnit ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Conversion Dialog */}
      <Dialog
        open={Boolean(conversionPendingDelete)}
        onOpenChange={(isOpen: boolean) => {
          if (!isOpen && !isDeletingConversion) setConversionPendingDelete(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Conversion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this conversion rate?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={isDeletingConversion}
                onClick={() => setConversionPendingDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingConversion || !conversionPendingDelete}
                onClick={() => {
                  if (!conversionPendingDelete) return;
                  void handleDeleteConversion(conversionPendingDelete);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60"
              >
                {isDeletingConversion ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Ref to store the optional callback from ProductsTab's AddItemModal
// (lives outside function so it can be used inside the early-return render)
const addCategoryCallbackRef = { current: null as ((id: string) => void) | null };
