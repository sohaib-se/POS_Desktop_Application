import { useState } from "react";
import { List } from "lucide-react";
import { GridContainer } from "@/components/pagescomponents/griditems/GridContainer";
import { CategoriesSection } from "@/components/pagescomponents/griditems/CategoriesSection";
import type { ViewType } from "@/types";

interface GridItemsProps {
  onViewChange?: (view: ViewType) => void;
}

export function GridItems({ onViewChange }: GridItemsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Items");

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC] relative">
      {/* Categories Section (Top) */}
      <CategoriesSection 
        selectedCategory={selectedCategory} 
        onSelectCategory={setSelectedCategory} 
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <GridContainer selectedCategory={selectedCategory} />
      </div>

      {/* Floating List Button */}
      <button
        onClick={() => onViewChange?.('items')}
        className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors z-50"
        title="List View"
      >
        <List size={24} />
      </button>
    </div>
  );
}
