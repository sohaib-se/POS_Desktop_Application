import { Search } from "lucide-react";
import type { UnitRecord, ConversionRateRecord } from "@/components/pagescomponents/items/products/types";
import type { ConversionContextMenuState } from "./types";
import { Card, CardContent } from "./ui";

type Props = {
  selectedUnitInTab: UnitRecord | undefined;
  filteredConversions: ConversionRateRecord[];
  conversionSearchTerm: string;
  onSetConversionSearchTerm: (term: string) => void;
  onOpenAddConversion: () => void;
  onSetConversionContextMenu: (menu: ConversionContextMenuState | null) => void;
};

export function UnitDetailsPanel({
  selectedUnitInTab,
  filteredConversions,
  conversionSearchTerm,
  onSetConversionSearchTerm,
  onOpenAddConversion,
  onSetConversionContextMenu,
}: Props) {
  return (
    <div
      className="flex-1 flex flex-col overflow-y-auto"
      style={{ marginRight: "4px" }}
    >
      {/* Unit header card */}
      <Card
        className="bg-white rounded-md shadow-sm flex items-center justify-between px-6 py-3"
        style={{ minHeight: "64px", marginBottom: "4px" }}
      >
        <h2 className="text-base font-bold text-[#151B26] tracking-wide uppercase">
          {selectedUnitInTab?.fullName ?? "NO UNIT SELECTED"}
        </h2>
        <button
          className="bg-[#1976D2] hover:bg-[#1251A3] text-white px-5 py-2 rounded-lg text-sm font-bold shadow transition-all"
          onClick={onOpenAddConversion}
        >
          Add Conversion
        </button>
      </Card>

      {/* Conversions table card */}
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
                  onChange={(e) => onSetConversionSearchTerm(e.target.value)}
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
                        onSetConversionContextMenu({
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
  );
}
