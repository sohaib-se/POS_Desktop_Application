import { useState, useEffect, useRef } from "react";
import type { CategoryRecord } from "@/components/pagescomponents/items/products/types";

interface CategoriesSectionProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function CategoriesSection({ selectedCategory, onSelectCategory }: CategoriesSectionProps) {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    }
    fetchCategories();
  }, []);

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm relative z-10 w-full shrink-0">
      <div 
        ref={scrollRef}
        className="flex flex-wrap gap-3 w-full"
      >
        <button
          onClick={() => onSelectCategory("All Items")}
          className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all ${
            selectedCategory === "All Items"
              ? "bg-blue-600 text-white shadow-md shadow-blue-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All Items
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.name)}
            className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === cat.name
                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
