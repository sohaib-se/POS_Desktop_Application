import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RecycleBinFilters() {
  return (
    <div className="bg-white p-4 mb-2 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Select defaultValue="custom">
          <SelectTrigger className="w-[120px] font-semibold text-gray-700 border-none shadow-none text-base focus:ring-0">
            <SelectValue placeholder="Custom" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="custom">Custom</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center border border-gray-300 rounded text-sm overflow-hidden">
          <div className="bg-gray-400 text-white px-3 py-1.5 font-medium">Between</div>
          <div className="px-3 py-1.5 bg-white text-gray-600">
            17/07/2026 <span className="mx-2 text-gray-400">To</span> 10/08/2026
          </div>
        </div>

        <Select defaultValue="all">
          <SelectTrigger className="w-[150px] border border-gray-300 h-9">
            <SelectValue placeholder="ALL FIRM:" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ALL FIRM:</SelectItem>
            <SelectItem value="firm1">Firm 1</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
