import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, subMonths } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";

interface RecycleBinFiltersProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
}

export function RecycleBinFilters({ dateRange, setDateRange }: RecycleBinFiltersProps) {
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
  const handlePresetChange = (value: string) => {
    const today = new Date();
    if (value === "today") {
      setDateRange({ from: today, to: today });
    } else if (value === "week") {
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
      setDateRange({ from: start, to: today });
    } else if (value === "custom") {
      setDateRange({ from: subMonths(new Date(), 1), to: new Date() });
    }
  };
  return (
    <div className="bg-white p-4 mb-2 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Select defaultValue="custom" onValueChange={handlePresetChange}>
          <SelectTrigger className="w-[120px] font-semibold text-gray-700 border-none shadow-none text-base focus:ring-0">
            <SelectValue placeholder="Custom" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="custom">Custom</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium bg-white border border-gray-300 rounded">
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
