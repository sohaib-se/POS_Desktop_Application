import { useEffect, useRef, useState } from "react";
import type { UnitRecord, ConversionRateRecord } from "@/components/pagescomponents/items/products/types";
import type { UnitContextMenuState, ConversionContextMenuState } from "./types";
import { UnitList } from "./UnitList";
import { UnitContextMenu } from "./UnitContextMenu";
import { ConversionContextMenu } from "./ConversionContextMenu";
import { UnitDetailsPanel } from "./UnitDetailsPanel";
import { AddUnitModal } from "./AddUnitModal";
import { DeleteUnitModal } from "./DeleteUnitModal";
import { AddConversionModal } from "./AddConversionModal";
import { DeleteConversionModal } from "./DeleteConversionModal";
import { UnitSelectorModal } from "./UnitSelectorModal";

type UnitSelectorOnSaveResult = {
  selectedUnitId: string;
  baseUnitId: string;
  secondaryUnitId: string;
  conversionRate: number;
};

type Props = {
  /** units list — shared with ProductsTab so it must live here and be passed up */
  units: UnitRecord[];
  setUnits: React.Dispatch<React.SetStateAction<UnitRecord[]>>;
  /** conversion rates — shared with unit selector modal used by ProductsTab */
  conversionRates: ConversionRateRecord[];
  setConversionRates: React.Dispatch<React.SetStateAction<ConversionRateRecord[]>>;
  /** Unit selector modal state — opened by ProductsTab via Items.tsx callback */
  showUnitSelector: boolean;
  setShowUnitSelector: React.Dispatch<React.SetStateAction<boolean>>;
  unitSelectorBaseUnitId: string;
  setUnitSelectorBaseUnitId: React.Dispatch<React.SetStateAction<string>>;
  unitSelectorSecondaryUnitId: string;
  setUnitSelectorSecondaryUnitId: React.Dispatch<React.SetStateAction<string>>;
  unitSelectorConversionRate: number;
  setUnitSelectorConversionRate: React.Dispatch<React.SetStateAction<number>>;
  unitSelectorOnSave: ((result: UnitSelectorOnSaveResult) => void) | null;
  /**
   * When true, only renders the UnitSelectorModal (no tab UI).
   * Used by Items.tsx to keep the modal available from any active tab.
   */
  selectorOnly?: boolean;
};

export function UnitsTab({
  units,
  selectorOnly = false,
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
}: Props) {
  // ---- State ----
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
  const [conversionContextMenu, setConversionContextMenu] =
    useState<ConversionContextMenuState | null>(null);
  const [showAddConversion, setShowAddConversion] = useState(false);
  const [conversionBaseUnit, setConversionBaseUnit] = useState("");
  const [conversionSecondaryUnit, setConversionSecondaryUnit] = useState("");
  const [conversionRateValue, setConversionRateValue] = useState(0);
  const [conversionSaving, setConversionSaving] = useState(false);
  const [conversionError, setConversionError] = useState("");
  const [conversionBeingEdited, setConversionBeingEdited] =
    useState<ConversionRateRecord | null>(null);
  const [isDeletingConversion, setIsDeletingConversion] = useState(false);
  const [conversionPendingDelete, setConversionPendingDelete] =
    useState<ConversionRateRecord | null>(null);
  const [selectedUnitInTabId, setSelectedUnitInTabId] = useState<string | null>(null);

  const unitSearchInputRef = useRef<HTMLInputElement | null>(null);

  // ---- Derived ----
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
  }, [setUnits]);

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
  }, [setConversionRates]);

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

  const openEditUnitDialog = (unit: UnitRecord) => {
    setUnitBeingEdited(unit);
    setAddUnitFullName(unit.fullName);
    setAddUnitShortName(unit.shortName);
    setShowAddUnit(true);
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

  const handleSaveConversion = async () => {
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
        setConversionRates((prev) => [savedConversion, ...prev]);
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
  };

  const handleDeleteConversion = async (conversionToDelete: ConversionRateRecord) => {
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

  const handleUnitSelectorSave = async () => {
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

  // ---- Render ----

  // Selector-only mode: just the UnitSelectorModal (no tab UI)
  if (selectorOnly) {
    return (
      <UnitSelectorModal
        open={showUnitSelector}
        units={units}
        conversionRates={conversionRates}
        unitSelectorBaseUnitId={unitSelectorBaseUnitId}
        unitSelectorSecondaryUnitId={unitSelectorSecondaryUnitId}
        unitSelectorConversionRate={unitSelectorConversionRate}
        onSetUnitSelectorBaseUnitId={setUnitSelectorBaseUnitId}
        onSetUnitSelectorSecondaryUnitId={setUnitSelectorSecondaryUnitId}
        onSetUnitSelectorConversionRate={setUnitSelectorConversionRate}
        onClose={() => setShowUnitSelector(false)}
        onSave={() => { void handleUnitSelectorSave(); }}
      />
    );
  }

  return (
    <>
      <div className="flex-1 flex gap-1 overflow-hidden">
        {/* Left Panel */}
        <UnitList
          filteredUnitList={filteredUnitList}
          selectedUnitInTabId={selectedUnitInTabId}
          isUnitSearchActive={isUnitSearchActive}
          unitSearchTerm={unitSearchTerm}
          unitSearchInputRef={unitSearchInputRef}
          onSetSelectedUnitInTabId={setSelectedUnitInTabId}
          onSetIsUnitSearchActive={setIsUnitSearchActive}
          onSetUnitSearchTerm={setUnitSearchTerm}
          onOpenAddUnit={() => {
            setUnitBeingEdited(null);
            setAddUnitFullName("");
            setAddUnitShortName("");
            setShowAddUnit(true);
          }}
          onSetUnitContextMenu={setUnitContextMenu}
        />

        {/* Unit Context Menu */}
        <UnitContextMenu
          unitContextMenu={unitContextMenu}
          getContextMenuStyle={getContextMenuStyle}
          onEdit={(unit) => {
            setSelectedUnitInTabId(unit.id);
            openEditUnitDialog(unit);
          }}
          onDelete={(unit) => setUnitPendingDelete(unit)}
          onClose={() => setUnitContextMenu(null)}
        />

        {/* Conversion Context Menu */}
        <ConversionContextMenu
          conversionContextMenu={conversionContextMenu}
          getContextMenuStyle={getContextMenuStyle}
          onEdit={(conversion) => {
            setConversionBeingEdited(conversion);
            setConversionBaseUnit(conversion.base_unit);
            setConversionSecondaryUnit(conversion.secondary_unit);
            setConversionRateValue(conversion.conversion_rate);
            setShowAddConversion(true);
          }}
          onDelete={(conversion) => setConversionPendingDelete(conversion)}
          onClose={() => setConversionContextMenu(null)}
        />

        {/* Right Panel */}
        <UnitDetailsPanel
          selectedUnitInTab={selectedUnitInTab}
          filteredConversions={filteredConversions}
          conversionSearchTerm={conversionSearchTerm}
          onSetConversionSearchTerm={setConversionSearchTerm}
          onOpenAddConversion={() => setShowAddConversion(true)}
          onSetConversionContextMenu={setConversionContextMenu}
        />
      </div>

      {/* Modals */}
      <AddUnitModal
        open={showAddUnit}
        unitBeingEdited={unitBeingEdited}
        addUnitFullName={addUnitFullName}
        addUnitShortName={addUnitShortName}
        isSavingUnit={isSavingUnit}
        onSetAddUnitFullName={setAddUnitFullName}
        onSetAddUnitShortName={setAddUnitShortName}
        onClose={() => {
          setShowAddUnit(false);
          setUnitBeingEdited(null);
          setAddUnitFullName("");
          setAddUnitShortName("");
        }}
        onSave={() => { void handleCreateUnit(); }}
      />

      <DeleteUnitModal
        unitPendingDelete={unitPendingDelete}
        isDeletingUnit={isDeletingUnit}
        onCancel={() => setUnitPendingDelete(null)}
        onConfirm={(unit) => { void handleDeleteUnit(unit); }}
      />

      <AddConversionModal
        open={showAddConversion}
        units={units}
        conversionBaseUnit={conversionBaseUnit}
        conversionSecondaryUnit={conversionSecondaryUnit}
        conversionRateValue={conversionRateValue}
        conversionSaving={conversionSaving}
        conversionError={conversionError}
        conversionBeingEdited={conversionBeingEdited}
        onSetConversionBaseUnit={setConversionBaseUnit}
        onSetConversionSecondaryUnit={setConversionSecondaryUnit}
        onSetConversionRateValue={setConversionRateValue}
        onClose={() => {
          setShowAddConversion(false);
          if (!conversionSaving) {
            setConversionError("");
            setConversionRateValue(0);
            setConversionBaseUnit(selectedUnitInTab?.shortName ?? "");
            setConversionSecondaryUnit("");
            setConversionBeingEdited(null);
          }
        }}
        onSave={() => { void handleSaveConversion(); }}
      />

      <DeleteConversionModal
        conversionPendingDelete={conversionPendingDelete}
        isDeletingConversion={isDeletingConversion}
        onCancel={() => setConversionPendingDelete(null)}
        onConfirm={(conversion) => { void handleDeleteConversion(conversion); }}
      />

      <UnitSelectorModal
        open={showUnitSelector}
        units={units}
        conversionRates={conversionRates}
        unitSelectorBaseUnitId={unitSelectorBaseUnitId}
        unitSelectorSecondaryUnitId={unitSelectorSecondaryUnitId}
        unitSelectorConversionRate={unitSelectorConversionRate}
        onSetUnitSelectorBaseUnitId={setUnitSelectorBaseUnitId}
        onSetUnitSelectorSecondaryUnitId={setUnitSelectorSecondaryUnitId}
        onSetUnitSelectorConversionRate={setUnitSelectorConversionRate}
        onClose={() => setShowUnitSelector(false)}
        onSave={() => { void handleUnitSelectorSave(); }}
      />
    </>
  );
}
