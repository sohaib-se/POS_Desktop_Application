import { format } from "date-fns";
import { Calendar as CalendarIcon, Search } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";

interface RecycleBinFiltersProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showSearchInput: boolean;
  setShowSearchInput: (show: boolean) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

export function RecycleBinFilters({ 
  dateRange, setDateRange, searchQuery, setSearchQuery, showSearchInput, setShowSearchInput, searchInputRef
}: RecycleBinFiltersProps) {
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (fromRef.current && !fromRef.current.contains(event.target as Node)) {
        setIsFromOpen(false);
      }
      if (toRef.current && !toRef.current.contains(event.target as Node)) {
        setIsToOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const placeholders = ["Party Name", "Ref No.", "Txn Type"];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showSearchInput &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        !searchQuery
      ) {
        setShowSearchInput(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSearchInput, searchQuery, setShowSearchInput]);

  return (
    <div className="bg-white p-4 mb-2 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium bg-white border border-gray-300 rounded h-9">
          <div className="bg-gray-400 text-white px-3 py-1.5 h-full flex items-center rounded-l">Between</div>
          
          <div className="relative" ref={fromRef}>
            <Button
              variant={"ghost"}
              onClick={() => { setIsFromOpen(!isFromOpen); setIsToOpen(false); }}
              className={cn(
                "w-[130px] justify-start text-left font-normal hover:bg-gray-100 px-2 h-8",
                !dateRange?.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? format(dateRange.from, "dd/MM/yyyy") : <span>From</span>}
            </Button>
            {isFromOpen && (
              <div className="absolute top-full left-0 mt-2 z-50">
                <Calendar
                  initialFocus
                  mode="single"
                  selected={dateRange?.from}
                  onSelect={(from) => {
                    if (from && dateRange?.to && from > dateRange.to) {
                      toast.error("From date cannot be after To date.");
                      return;
                    }
                    setDateRange({ from: from || new Date(), to: dateRange?.to });
                    setIsFromOpen(false);
                  }}
                />
              </div>
            )}
          </div>

          <span className="text-gray-400 mx-1">To</span>

          <div className="relative" ref={toRef}>
            <Button
              variant={"ghost"}
              onClick={() => { setIsToOpen(!isToOpen); setIsFromOpen(false); }}
              className={cn(
                "w-[130px] justify-start text-left font-normal hover:bg-gray-100 px-2 h-8",
                !dateRange?.to && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.to ? format(dateRange.to, "dd/MM/yyyy") : <span>To</span>}
            </Button>
            {isToOpen && (
              <div className="absolute top-full left-0 mt-2 z-50">
                <Calendar
                  initialFocus
                  mode="single"
                  selected={dateRange?.to}
                  onSelect={(to) => {
                    if (to && dateRange?.from && to < dateRange.from) {
                      toast.error("To date cannot be before From date.");
                      return;
                    }
                    setDateRange({ from: dateRange?.from, to: to || new Date() });
                    setIsToOpen(false);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 items-center h-10" ref={searchContainerRef}>
        <div 
          className={`flex items-center overflow-hidden transition-all duration-300 ease-out rounded-full h-9 ${
            showSearchInput 
              ? "w-64 bg-white border border-blue-500 ring-4 ring-blue-50" 
              : "w-9 bg-transparent border border-transparent hover:bg-gray-100 cursor-pointer"
          }`}
          onClick={(e) => {
            if (!showSearchInput) {
              e.stopPropagation();
              setShowSearchInput(true);
              setTimeout(() => searchInputRef.current?.focus(), 150);
            }
          }}
        >
          <div className="flex items-center justify-center h-full w-9 shrink-0">
            <Search className={`w-4 h-4 ${showSearchInput ? "text-gray-400" : "text-gray-500"}`} />
          </div>
          <div className={`relative flex-1 h-full flex items-center transition-opacity duration-200 ${
              showSearchInput ? "opacity-100 delay-100" : "opacity-0"
            }`}>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none focus:ring-0 focus:outline-none focus:border-transparent text-sm h-full w-full pr-3 relative z-10"
            />
            {!searchQuery && (
              <div className="absolute left-0 pointer-events-none flex items-center h-full w-full overflow-hidden text-gray-400 text-sm">
                <span className="whitespace-pre">Search </span>
                <div className="relative h-full flex-1 overflow-hidden">
                  {placeholders.map((ph, idx) => (
                    <span
                      key={ph}
                      className={`absolute top-0 left-0 flex items-center h-full transition-all duration-700 ease-in-out ${
                        idx === placeholderIndex ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                      }`}
                    >
                      {ph}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
