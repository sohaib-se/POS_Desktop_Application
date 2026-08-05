import { Plus, Search } from "lucide-react";
import type { UnitRecord } from "@/components/pagescomponents/items/products/types";
import type { UnitContextMenuState } from "./types";
import { Card } from "./ui";

type Props = {
  filteredUnitList: UnitRecord[];
  selectedUnitInTabId: string | null;
  isUnitSearchActive: boolean;
  unitSearchTerm: string;
  unitSearchInputRef: React.RefObject<HTMLInputElement | null>;
  onSetSelectedUnitInTabId: (id: string) => void;
  onSetIsUnitSearchActive: (active: boolean) => void;
  onSetUnitSearchTerm: (term: string) => void;
  onOpenAddUnit: () => void;
  onSetUnitContextMenu: (menu: UnitContextMenuState | null) => void;
};

export function UnitList({
  filteredUnitList,
  selectedUnitInTabId,
  isUnitSearchActive,
  unitSearchTerm,
  unitSearchInputRef,
  onSetSelectedUnitInTabId,
  onSetIsUnitSearchActive,
  onSetUnitSearchTerm,
  onOpenAddUnit,
  onSetUnitContextMenu,
}: Props) {
  return (
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
              onChange={(event) => onSetUnitSearchTerm(event.target.value)}
              onBlur={() => {
                onSetUnitSearchTerm("");
                onSetIsUnitSearchActive(false);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  onSetUnitSearchTerm("");
                  onSetIsUnitSearchActive(false);
                }
              }}
              placeholder="Search units"
              className="w-full border border-[#D1D5DB] rounded-lg px-3 py-2 text-sm"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onSetIsUnitSearchActive(true)}
            className="w-10 h-10 rounded-full bg-[#E5E7EB] flex items-center justify-center text-[#4B5563] hover:bg-[#D1D5DB] transition-colors"
            aria-label="Search units"
          >
            <Search className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={onOpenAddUnit}
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
                  onClick={() => onSetSelectedUnitInTabId(unit.id)}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    onSetSelectedUnitInTabId(unit.id);
                    onSetUnitContextMenu({
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
  );
}
