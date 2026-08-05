import type { Dispatch, SetStateAction } from "react";
import { Search } from "lucide-react";

interface ReportsHeaderProps {
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
}

export function ReportsHeader({ searchTerm, setSearchTerm }: ReportsHeaderProps) {
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search reports..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]"
        />
      </div>
    </div>
  );
}
