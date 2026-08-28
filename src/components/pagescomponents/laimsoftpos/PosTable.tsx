import type { PosTab, PosRow } from "./types";

interface PosTableProps {
  activeTab: PosTab;
  updateTab: (partial: Partial<PosTab>) => void;
  updateRow: (id: number, field: keyof PosRow, value: string) => void;
  columns: { key: string; label: string; width: string }[];
}

export function PosTable({ activeTab, updateTab, updateRow, columns }: PosTableProps) {
  return (
    <>
      {/* Table Header */}
      <div className="flex bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {columns.map((col, i) => (
          <div
            key={col.key}
            className={`${col.width} px-3 py-3 ${
              i < columns.length - 1 ? "border-r border-gray-200" : ""
            }`}
          >
            {col.label}
          </div>
        ))}
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-y-auto bg-white relative">
        {activeTab.rows.map((row, index) => {
          const isSelected = activeTab.selectedRowId === row.id;
          return (
            <div
              key={row.id}
              onClick={() => updateTab({ selectedRowId: row.id })}
              className={`flex border-b border-gray-100 text-sm cursor-pointer ${
                isSelected ? "bg-blue-100/50" : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              <div className="w-12 px-3 py-2 border-r border-gray-100 flex items-center justify-center text-gray-500">
                {index + 1}
              </div>
              <div className="w-[120px] px-3 py-2 border-r border-gray-100 flex items-center truncate">
                {row.itemCode}
              </div>
              <div className="flex-1 px-3 py-2 border-r border-gray-100 flex items-center truncate font-medium">
                {row.itemName}
              </div>
              <div className="w-[80px] px-3 py-2 border-r border-gray-100">
                <input
                  type="text"
                  value={row.qty}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateTab({ selectedRowId: row.id });
                  }}
                  onChange={(e) => updateRow(row.id, "qty", e.target.value)}
                  className="w-full bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 px-1 rounded"
                />
              </div>
              <div className="w-[80px] px-3 py-2 border-r border-gray-100 flex items-center text-gray-500">
                {row.unit ? (row.unit.match(/\(([^)]+)\)/)?.[1] || row.unit) : ""}
              </div>
              <div className="w-[120px] px-3 py-2 border-r border-gray-100 flex items-center">
                <input
                  type="text"
                  value={row.pricePerUnit}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateTab({ selectedRowId: row.id });
                  }}
                  onChange={(e) =>
                    updateRow(row.id, "pricePerUnit", e.target.value)
                  }
                  className="w-full bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 px-1 rounded"
                />
              </div>
              <div className="w-[120px] px-3 py-2 flex items-center font-medium justify-end">
                {(Number(row.qty || 0) * Number(row.pricePerUnit || 0)).toFixed(
                  2
                )}
              </div>
            </div>
          );
        })}
        <div className="flex flex-1 min-h-[40px] pointer-events-none">
          {columns.map((col, i) => (
            <div
              key={`empty-${col.key}`}
              className={`${col.width} ${
                i < columns.length - 1 ? "border-r border-gray-100" : ""
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
}
