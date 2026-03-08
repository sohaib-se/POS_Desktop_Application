import { useEffect, useState } from "react";
import { Search, Plus, ChevronDown, SlidersHorizontal, X } from "lucide-react";

// --- INLINE TYPES & MOCK DATA ---
type Item = {
  id: string;
  name: string;
  stockQuantity: number;
  salePrice: number;
  purchasePrice: number;
  stockValue: number;
};

type CategoryRecord = {
  id: string;
  name: string;
  itemCount: number;
};

type CategoryContextMenuState = {
  category: CategoryRecord;
  x: number;
  y: number;
};

const items: Item[] = [
  {
    id: "1",
    name: "cliper",
    stockQuantity: -2,
    salePrice: 0,
    purchasePrice: 0,
    stockValue: 0,
  },
  {
    id: "2",
    name: "clipper",
    stockQuantity: 40,
    salePrice: 150,
    purchasePrice: 100,
    stockValue: 5760,
  },
];

const units = [
  { id: "1", fullName: "BAGS", shortName: "Bag" },
  { id: "2", fullName: "BOTTLES", shortName: "Btl" },
  { id: "3", fullName: "BOX", shortName: "Box" },
  { id: "4", fullName: "BUNDLES", shortName: "Bdl" },
  { id: "5", fullName: "CANS", shortName: "Can" },
  { id: "6", fullName: "CARTONS", shortName: "Ctn" },
  { id: "7", fullName: "DOZENS", shortName: "Dzn" },
  { id: "8", fullName: "GRAMMES", shortName: "Gm" },
  { id: "9", fullName: "KILOGRAMS", shortName: "Kg" },
  { id: "10", fullName: "LITRE", shortName: "Ltr" },
  { id: "11", fullName: "METERS", shortName: "Mtr" },
  { id: "12", fullName: "MILILITRE", shortName: "Ml" },
];

const transactions = [
  {
    id: "1",
    type: "Sale",
    invoiceNo: "INV-001",
    partyName: "Cash Customer",
    date: "10/24/2023",
    amount: 1500,
    status: "Paid",
  },
  {
    id: "2",
    type: "Purchase",
    invoiceNo: "PUR-001",
    partyName: "Supplier A",
    date: "10/22/2023",
    amount: 5000,
    status: "Unpaid",
  },
  {
    id: "3",
    type: "Payment In",
    invoiceNo: "REC-001",
    partyName: "John Doe",
    date: "10/20/2023",
    amount: 1000,
    status: "Paid",
  },
];

// --- INLINE UI COMPONENTS ---
const Card = ({ children, className, style }: any) => (
  <div
    className={`bg-white rounded-lg border shadow-sm ${className || ""}`}
    style={style}
  >
    {children}
  </div>
);
const CardHeader = ({ children, className }: any) => (
  <div className={`${className || ""}`}>{children}</div>
);
const CardContent = ({ children, className }: any) => (
  <div className={`${className || ""}`}>{children}</div>
);
const Dialog = ({ open, onOpenChange, children }: any) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto">
      {/* Background overlay click to close (optional): */}
      <div
        className="absolute inset-0"
        onClick={() => onOpenChange(false)}
      ></div>
      <div className="relative z-10 w-full flex justify-center p-4">
        {children}
      </div>
    </div>
  );
};
const DialogContent = ({ children, className }: any) => (
  <div
    className={`bg-white rounded-lg p-6 w-full max-w-lg relative shadow-xl ${className || ""}`}
  >
    {children}
  </div>
);
const DialogHeader = ({ children }: any) => (
  <div className="mb-4">{children}</div>
);
const DialogTitle = ({ children, className }: any) => (
  <h2 className={`text-lg font-semibold ${className || ""}`}>{children}</h2>
);

// --- MAIN COMPONENT ---
export function Items() {
  const [activeTab, setActiveTab] = useState<"products" | "category" | "units">(
    "products",
  );
  const [selectedItem, setSelectedItem] = useState<Item | null>(items[0]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showUnitSelector, setShowUnitSelector] = useState(false);
  const [categoryList, setCategoryList] = useState<CategoryRecord[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryBeingEdited, setCategoryBeingEdited] =
    useState<CategoryRecord | null>(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [categoryPendingDelete, setCategoryPendingDelete] =
    useState<CategoryRecord | null>(null);
  const [categoryContextMenu, setCategoryContextMenu] =
    useState<CategoryContextMenuState | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [addItemTab, setAddItemTab] = useState<"pricing" | "stock">("pricing");
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [baseUnitId, setBaseUnitId] = useState<string>("");
  const [secondaryUnitId, setSecondaryUnitId] = useState<string>("");
  const [conversionRate, setConversionRate] = useState<number>(0);

  const selectedUnit = units.find((unit) => unit.id === selectedUnitId);
  const baseUnit = units.find((unit) => unit.id === baseUnitId);
  const secondaryUnit = units.find((unit) => unit.id === secondaryUnitId);
  const selectedCategory = categoryList.find(
    (category) => category.id === selectedCategoryId,
  );

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to load categories');
        }

        const categories = (await response.json()) as CategoryRecord[];
        setCategoryList(categories);

        setSelectedCategoryId((previousSelectedCategoryId) => {
          if (!categories.length) {
            return null;
          }

          if (
            previousSelectedCategoryId &&
            categories.some((category) => category.id === previousSelectedCategoryId)
          ) {
            return previousSelectedCategoryId;
          }

          return categories[0].id;
        });
      } catch (error) {
        console.error(error);
      }
    };

    void loadCategories();
  }, []);

  useEffect(() => {
    if (!categoryContextMenu) {
      return;
    }

    const closeMenu = () => setCategoryContextMenu(null);

    window.addEventListener('click', closeMenu);
    window.addEventListener('resize', closeMenu);
    window.addEventListener('scroll', closeMenu, true);

    return () => {
      window.removeEventListener('click', closeMenu);
      window.removeEventListener('resize', closeMenu);
      window.removeEventListener('scroll', closeMenu, true);
    };
  }, [categoryContextMenu]);

  const handleUnitSave = () => {
    if (baseUnitId) {
      setSelectedUnitId(baseUnitId);
    }

    setShowUnitSelector(false);
  };

  const handleCreateCategory = async () => {
    const normalizedName = newCategoryName.trim();
    if (!normalizedName) {
      return;
    }

    const alreadyExists = categoryList.some(
      (category) =>
        category.name.toLowerCase() === normalizedName.toLowerCase() &&
        category.id !== categoryBeingEdited?.id,
    );

    if (alreadyExists) {
      return;
    }

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: categoryBeingEdited?.id,
          name: normalizedName,
          itemCount: 0,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create category');
      }

      const createdCategory = (await response.json()) as CategoryRecord;

      setCategoryList((previousCategories) => {
        const hasExistingCategory = previousCategories.some(
          (category) => category.id === createdCategory.id,
        );

        const nextCategories = hasExistingCategory
          ? previousCategories.map((category) =>
              category.id === createdCategory.id ? createdCategory : category,
            )
          : [...previousCategories, createdCategory];

        return nextCategories.sort((a, b) => a.name.localeCompare(b.name));
      });
      setSelectedCategoryId(createdCategory.id);
      setNewCategoryName('');
      setCategoryBeingEdited(null);
      setShowAddCategory(false);
    } catch (error) {
      console.error(error);
    }
  };

  const openEditCategoryDialog = (category: CategoryRecord) => {
    setCategoryBeingEdited(category);
    setNewCategoryName(category.name);
    setShowAddCategory(true);
  };

  const handleDeleteCategory = async (category: CategoryRecord) => {
    if (isDeletingCategory) {
      return;
    }

    setIsDeletingCategory(true);

    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      setCategoryList((previousCategories) => {
        const nextCategories = previousCategories.filter(
          (entry) => entry.id !== category.id,
        );

        setSelectedCategoryId((previousCategoryId) => {
          if (previousCategoryId !== category.id) {
            return previousCategoryId;
          }

          return nextCategories[0]?.id ?? null;
        });

        return nextCategories;
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeletingCategory(false);
      setCategoryPendingDelete(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#D0DCE7] p-0 gap-1">
      {/* Top Header Card */}
      <div
        className="p-0 bg-white rounded-none flex items-center justify-between shrink-0 w-full"
        style={{ minHeight: "56px" }}
      >
        <div className="flex w-full">
          {(["products", "category", "units"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-sm font-medium pb-2 border-b-2 transition-colors ${
                activeTab === tab
                  ? "text-[#E53935] border-[#E53935]"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-1 overflow-hidden">
        {activeTab === "products" && (
          <>
            {/* Left Panel Card - Item List */}
            <Card
              className="w-80 bg-white rounded-md flex flex-col shrink-0 overflow-hidden shadow-sm"
              style={{ marginLeft: "4px" }}
            >
              <CardHeader className="p-2 pb-0 border-none flex flex-col gap-2">
                <div className="flex items-center justify-between mb-3">
                  <button className="w-10 h-10 rounded-full bg-[#E5E7EB] flex items-center justify-center text-[#4B5563] hover:bg-[#D1D5DB] transition-colors mr-3">
                    <Search className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowAddItem(true)}
                    className="flex items-center gap-2 bg-[#FFA726] hover:bg-[#FB8C00] text-white font-semibold rounded-lg px-5 py-2 shadow transition-all text-base relative"
                  >
                    <Plus className="w-5 h-5" />
                    Add Item
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-0">
                <table className="w-full text-sm">
                  <thead className="bg-[#F7F9FB] sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-[#7B8A9A] text-xs tracking-wide align-middle">
                        ITEM
                        <span className="inline-block align-middle ml-1 text-[#E53935]">
                          <svg width="16" height="16" fill="none">
                            <path
                              d="M8 3v7m0 0l3-3m-3 3l-3-3"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </th>
                      <th className="px-4 py-2 text-right font-semibold text-[#7B8A9A] text-xs tracking-wide align-middle">
                        QUANTITY
                        <span className="inline-block align-middle ml-1 text-[#E53935]">
                          <svg width="16" height="16" fill="none">
                            <path
                              d="M8 3v7m0 0l3-3m-3 3l-3-3"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`cursor-pointer border-b border-[#E3EAF2] ${
                          selectedItem?.id === item.id
                            ? "bg-[#E3F0FF] border-l-4 border-l-[#1976D2]"
                            : "hover:bg-[#F5F8FA]"
                        }`}
                      >
                        <td className="px-4 py-3 text-[#222B45] font-medium">
                          {item.name}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-semibold ${
                            item.stockQuantity < 0
                              ? "text-[#E53935]"
                              : "text-[#43A047]"
                          }`}
                        >
                          {item.stockQuantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Right Panel Card - Item Details */}
            <div
              className="flex-1 flex flex-col"
              style={{ marginRight: "4px" }}
            >
              {selectedItem && (
                <>
                  {/* Item Details Card */}
                  <Card
                    className="bg-white rounded-md shadow-sm px-0 py-0"
                    style={{
                      minHeight: "96px",
                      marginBottom: "4px",
                    }}
                  >
                    <div className="flex w-full h-full items-start justify-between">
                      {/* Left: Name and icon */}
                      <div className="flex flex-col justify-start pl-6 pt-5 pb-2 min-w-[220px]">
                        <div className="flex items-center gap-2 mb-4">
                          <h2 className="text-base font-bold text-[#151B26] tracking-wide uppercase">
                            {selectedItem.name}
                          </h2>
                          <span className="inline-block align-middle text-[#151B26] cursor-pointer">
                            <svg width="18" height="18" fill="none">
                              <path
                                d="M7.5 10.5L15 3M15 3H9M15 3V9"
                                stroke="#151B26"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className="text-sm font-medium text-[#151B26]">
                            SALE PRICE:{" "}
                            <span className="text-[#43A047]">
                              Rs {selectedItem.salePrice.toFixed(2)}
                            </span>
                          </span>
                          <span className="text-sm font-medium text-[#151B26]">
                            PURCHASE PRICE:{" "}
                            <span className="text-[#43A047]">
                              Rs {selectedItem.purchasePrice.toFixed(2)}
                            </span>
                          </span>
                        </div>
                      </div>
                      {/* Right: Button and stats */}
                      <div className="flex flex-col items-end justify-between flex-1 pr-6 pt-5 pb-2">
                        <button
                          className="bg-[#1976D2] hover:bg-[#1251A3] text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow transition-all mb-6"
                          style={{ minWidth: "140px" }}
                        >
                          <SlidersHorizontal className="w-5 h-5" />
                          ADJUST ITEM
                        </button>
                        <div className="flex flex-col gap-2 items-end">
                          <span className="text-sm font-medium text-[#151B26]">
                            STOCK QUANTITY:{" "}
                            <span className="text-[#43A047]">
                              {selectedItem.stockQuantity}
                            </span>
                          </span>
                          <span className="text-sm font-medium text-[#151B26]">
                            STOCK VALUE:{" "}
                            <span className="text-[#43A047]">
                              Rs {selectedItem.stockValue?.toLocaleString()}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                  {/* Transactions Card */}
                  <Card className="bg-white rounded-md flex flex-col flex-1 overflow-hidden shadow-sm p-0">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between px-6 pt-4 pb-2">
                        <h3 className="text-base font-bold text-[#222B45] tracking-wide">
                          TRANSACTIONS
                        </h3>
                        <div className="flex gap-2 items-center">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder=""
                              className="bg-[#F7F9FB] border border-[#E3EAF2] rounded-lg px-8 py-1.5 text-sm text-[#222B45] focus:bg-white focus:border-[#1976D2]"
                            />
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AEB8C4]" />
                          </div>
                          <button className="p-2 hover:bg-[#F7F9FB] rounded">
                            <svg width="18" height="18" fill="none">
                              <rect
                                x="3"
                                y="7"
                                width="12"
                                height="2"
                                rx="1"
                                fill="#7B8A9A"
                              />
                              <rect
                                x="7"
                                y="3"
                                width="2"
                                height="12"
                                rx="1"
                                fill="#7B8A9A"
                              />
                            </svg>
                          </button>
                          <button className="p-2 hover:bg-[#F7F9FB] rounded">
                            <svg width="18" height="18" fill="none">
                              <rect
                                x="3"
                                y="3"
                                width="12"
                                height="2"
                                rx="1"
                                fill="#7B8A9A"
                              />
                              <rect
                                x="3"
                                y="7"
                                width="12"
                                height="2"
                                rx="1"
                                fill="#7B8A9A"
                              />
                              <rect
                                x="3"
                                y="11"
                                width="12"
                                height="2"
                                rx="1"
                                fill="#7B8A9A"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="border-t border-[#E3EAF2] rounded-b-lg overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-[#F7F9FB] sticky top-0 z-10">
                            <tr>
                              <th className="px-4 py-2 text-left font-semibold text-[#7B8A9A] text-xs tracking-wide align-middle">
                                TYPE{" "}
                                <span className="inline-block align-middle ml-1 text-[#E53935]">
                                  <svg width="16" height="16" fill="none">
                                    <path
                                      d="M8 3v7m0 0l3-3m-3 3l-3-3"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </span>
                              </th>
                              <th className="px-4 py-2 text-left font-semibold text-[#7B8A9A] text-xs tracking-wide align-middle">
                                INVOICE/#{" "}
                                <span className="inline-block align-middle ml-1 text-[#E53935]">
                                  <svg width="16" height="16" fill="none">
                                    <path
                                      d="M8 3v7m0 0l3-3m-3 3l-3-3"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </span>
                              </th>
                              <th className="px-4 py-2 text-left font-semibold text-[#7B8A9A] text-xs tracking-wide align-middle">
                                NAME{" "}
                                <span className="inline-block align-middle ml-1 text-[#E53935]">
                                  <svg width="16" height="16" fill="none">
                                    <path
                                      d="M8 3v7m0 0l3-3m-3 3l-3-3"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </span>
                              </th>
                              <th className="px-4 py-2 text-left font-semibold text-[#7B8A9A] text-xs tracking-wide align-middle">
                                DATE{" "}
                                <span className="inline-block align-middle ml-1 text-[#E53935]">
                                  <svg width="16" height="16" fill="none">
                                    <path
                                      d="M8 3v7m0 0l3-3m-3 3l-3-3"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </span>
                              </th>
                              <th className="px-4 py-2 text-right font-semibold text-[#7B8A9A] text-xs tracking-wide align-middle">
                                QUANTITY{" "}
                                <span className="inline-block align-middle ml-1 text-[#E53935]">
                                  <svg width="16" height="16" fill="none">
                                    <path
                                      d="M8 3v7m0 0l3-3m-3 3l-3-3"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </span>
                              </th>
                              <th className="px-4 py-2 text-right font-semibold text-[#7B8A9A] text-xs tracking-wide align-middle">
                                PRICE/U...{" "}
                                <span className="inline-block align-middle ml-1 text-[#E53935]">
                                  <svg width="16" height="16" fill="none">
                                    <path
                                      d="M8 3v7m0 0l3-3m-3 3l-3-3"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </span>
                              </th>
                              <th className="px-4 py-2 text-left font-semibold text-[#7B8A9A] text-xs tracking-wide align-middle">
                                STATUS{" "}
                                <span className="inline-block align-middle ml-1 text-[#E53935]">
                                  <svg width="16" height="16" fill="none">
                                    <path
                                      d="M8 3v7m0 0l3-3m-3 3l-3-3"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </span>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {transactions.slice(0, 6).map((t) => (
                              <tr
                                key={t.id}
                                className="border-b border-[#E3EAF2] hover:bg-[#F5F8FA]"
                              >
                                <td className="px-4 py-2">
                                  <span
                                    className={`inline-flex items-center gap-1.5 ${
                                      t.type === "Sale"
                                        ? "text-[#43A047]"
                                        : t.type === "Purchase"
                                          ? "text-[#E53935]"
                                          : "text-[#1976D2]"
                                    }`}
                                  >
                                    <span
                                      className={`w-2 h-2 rounded-full ${
                                        t.type === "Sale"
                                          ? "bg-[#43A047]"
                                          : t.type === "Purchase"
                                            ? "bg-[#E53935]"
                                            : "bg-[#1976D2]"
                                      }`}
                                    ></span>
                                    {t.type}
                                  </span>
                                </td>
                                <td className="px-4 py-2">{t.invoiceNo}</td>
                                <td className="px-4 py-2">{t.partyName}</td>
                                <td className="px-4 py-2">{t.date}</td>
                                <td className="px-4 py-2 text-right">1 Pcs</td>
                                <td className="px-4 py-2 text-right">
                                  Rs {t.amount.toFixed(2)}
                                </td>
                                <td className="px-4 py-2">
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                      t.status === "Paid"
                                        ? "bg-[#E6F4EA] text-[#43A047]"
                                        : t.status === "Unpaid"
                                          ? "bg-[#FDEAEA] text-[#E53935]"
                                          : "bg-[#F7F9FB] text-[#7B8A9A]"
                                    }`}
                                  >
                                    {t.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </>
        )}

        {activeTab === "category" && (
          <div className="flex-1 flex gap-1 overflow-hidden">
            {/* Left Panel - Category List */}
            <div
              className="w-80 bg-white rounded-md flex flex-col shrink-0 overflow-hidden shadow-sm"
              style={{ marginLeft: "4px" }}
            >
              <div className="p-2 pb-0 border-none flex flex-col gap-2">
                <div className="flex items-center justify-between mb-3">
                  <button className="w-10 h-10 rounded-full bg-[#E5E7EB] flex items-center justify-center text-[#4B5563] hover:bg-[#D1D5DB] transition-colors mr-3">
                    <Search className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setCategoryBeingEdited(null);
                      setNewCategoryName('');
                      setShowAddCategory(true);
                    }}
                    className="flex items-center gap-2 bg-[#FFA726] hover:bg-[#FB8C00] text-white font-semibold rounded-lg px-5 py-2 shadow transition-all text-base relative"
                  >
                    <Plus className="w-5 h-5" />
                    Add Category
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-0">
                <table className="w-full text-sm">
                  <thead className="bg-[#F7F9FB] sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-[#7B8A9A] text-xs tracking-wide align-middle">
                        CATEGORY
                      </th>
                      <th className="px-4 py-2 text-right font-semibold text-[#7B8A9A] text-xs tracking-wide align-middle">
                        ITEM
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#E3EAF2] hover:bg-[#F5F8FA] cursor-pointer">
                      <td className="px-4 py-3 text-[#222B45] font-medium">
                        Items not in any Category
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[#7B8A9A]">
                        0
                      </td>
                    </tr>
                    {categoryList.map((cat) => (
                      <tr
                        key={cat.id}
                        onClick={() => setSelectedCategoryId(cat.id)}
                        onContextMenu={(event) => {
                          event.preventDefault();
                          setCategoryContextMenu({
                            category: cat,
                            x: event.clientX,
                            y: event.clientY,
                          });
                        }}
                        className={`border-b border-[#E3EAF2] hover:bg-[#F5F8FA] cursor-pointer ${selectedCategoryId === cat.id ? "bg-[#E3F0FF]" : ""}`}
                      >
                        <td className="px-4 py-3 text-[#222B45] font-medium">
                          {cat.name}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-[#7B8A9A]">
                          {cat.itemCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {categoryContextMenu && (
              <div
                className="fixed z-50 min-w-40 rounded-md border bg-white p-1 shadow-md"
                style={{
                  top: categoryContextMenu.y,
                  left: categoryContextMenu.x,
                }}
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  onClick={() => {
                    setSelectedCategoryId(categoryContextMenu.category.id);
                    openEditCategoryDialog(categoryContextMenu.category);
                    setCategoryContextMenu(null);
                  }}
                  className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-gray-100"
                >
                  View/Edit
                </button>
                <button
                  onClick={() => {
                    const category = categoryContextMenu.category;
                    setCategoryContextMenu(null);
                    setCategoryPendingDelete(category);
                  }}
                  className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            )}

            {/* Right Panel - Category Details and Items */}
            <div
              className="flex-1 flex flex-col"
              style={{ marginRight: "4px" }}
            >
              {/* Category Details Card */}
              <Card
                className="bg-white rounded-md shadow-sm px-0 py-0"
                style={{
                  minHeight: "72px",
                  marginBottom: "4px",
                }}
              >
                <div className="flex w-full h-full items-start justify-between">
                  <div className="flex flex-col justify-start pl-6 pt-5 pb-2 min-w-[220px]">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-base font-bold text-[#151B26] tracking-wide uppercase">
                        {selectedCategory?.name ?? "NO CATEGORY SELECTED"}
                      </h2>
                    </div>
                    <span className="text-sm font-medium text-[#151B26]">
                      {selectedCategory?.itemCount ?? 0}
                    </span>
                  </div>
                  <div className="flex flex-col items-end justify-between flex-1 pr-6 pt-5 pb-2">
                    <button
                      className="bg-[#1976D2] hover:bg-[#1251A3] text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow transition-all mb-2"
                      style={{ minWidth: "140px" }}
                    >
                      Move To This Category
                    </button>
                  </div>
                </div>
              </Card>
              {/* Items Table Card */}
              <Card className="bg-white rounded-md flex flex-col flex-1 overflow-hidden shadow-sm p-0">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between px-6 pt-4 pb-2">
                    <h3 className="text-base font-bold text-[#222B45] tracking-wide">
                      ITEMS
                    </h3>
                    <div className="flex gap-2 items-center">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder=""
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
                          <th className="px-4 py-2 text-left font-semibold text-[#7B8A9A] text-xs tracking-wide align-middle">
                            NAME{" "}
                            <span className="inline-block align-middle ml-1 text-[#E53935]">
                              <svg width="16" height="16" fill="none">
                                <path
                                  d="M8 3v7m0 0l3-3m-3 3l-3-3"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                          </th>
                          <th className="px-4 py-2 text-right font-semibold text-[#7B8A9A] text-xs tracking-wide align-middle">
                            QUANTITY{" "}
                            <span className="inline-block align-middle ml-1 text-[#E53935]">
                              <svg width="16" height="16" fill="none">
                                <path
                                  d="M8 3v7m0 0l3-3m-3 3l-3-3"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                          </th>
                          <th className="px-4 py-2 text-right font-semibold text-[#7B8A9A] text-xs tracking-wide align-middle">
                            STOCK VALUE{" "}
                            <span className="inline-block align-middle ml-1 text-[#E53935]">
                              <svg width="16" height="16" fill="none">
                                <path
                                  d="M8 3v7m0 0l3-3m-3 3l-3-3"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Example items for grocery category, replace with filtered items */}
                        <tr>
                          <td className="px-4 py-3 text-[#222B45] font-medium">
                            cliper
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-[#E53935]">
                            -2
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-[#43A047]">
                            Rs 0.00
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-[#222B45] font-medium">
                            clipper
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-[#43A047]">
                            40
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-[#43A047]">
                            Rs 5,760.00
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "units" && (
          <div className="flex-1 flex gap-1 overflow-hidden">
            {/* Left Panel - Unit List */}
            <Card
              className="w-80 bg-white rounded-md flex flex-col shrink-0 overflow-hidden shadow-sm"
              style={{ marginLeft: "4px" }}
            >
              <div className="p-3 flex items-center justify-between border-b border-transparent">
                <button className="w-10 h-10 rounded-full bg-[#E5E7EB] flex items-center justify-center text-[#4B5563] hover:bg-[#D1D5DB] transition-colors">
                  <Search className="w-5 h-5" />
                </button>
                <button className="flex items-center gap-1 bg-[#FFA726] hover:bg-[#FB8C00] text-white font-semibold rounded-lg px-4 py-2 shadow transition-all text-sm">
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
                    {units.map((unit, index) => {
                      const isSelected =
                        unit.fullName.toUpperCase() === "BAGS" ||
                        unit.fullName === "Bags" ||
                        index === 0;
                      return (
                        <tr
                          key={unit.id}
                          className={`cursor-pointer border-b border-[#E3EAF2] ${
                            isSelected ? "bg-[#DDEBFA]" : "hover:bg-[#F5F8FA]"
                          }`}
                        >
                          <td className="px-4 py-3 text-[#222B45] font-medium uppercase">
                            {unit.fullName}
                          </td>
                          <td className="px-4 py-3 text-right text-[#4B5563]">
                            <div className="flex items-center justify-end gap-3">
                              <span className="capitalize">
                                {unit.shortName}
                              </span>
                              <span className="text-[#7B8A9A] cursor-pointer hover:text-[#222B45]">
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle
                                    cx="12"
                                    cy="12"
                                    r="1.5"
                                    fill="currentColor"
                                  />
                                  <circle
                                    cx="12"
                                    cy="5"
                                    r="1.5"
                                    fill="currentColor"
                                  />
                                  <circle
                                    cx="12"
                                    cy="19"
                                    r="1.5"
                                    fill="currentColor"
                                  />
                                </svg>
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Right Panel - Unit Details */}
            <div
              className="flex-1 flex flex-col overflow-y-auto"
              style={{ marginRight: "4px" }}
            >
              {/* Top Card: Unit Selection Header */}
              <Card
                className="bg-white rounded-md shadow-sm flex items-center justify-between px-6 py-3"
                style={{ minHeight: "64px", marginBottom: "4px" }}
              >
                <h2 className="text-base font-bold text-[#151B26] tracking-wide uppercase">
                  BAGS
                </h2>
                <button className="bg-[#1976D2] hover:bg-[#1251A3] text-white px-5 py-2 rounded-lg text-sm font-bold shadow transition-all">
                  Add Conversion
                </button>
              </Card>

              {/* Bottom Card: Conversions Table Area */}
              <Card className="bg-white rounded-md flex flex-col shadow-sm flex-1 overflow-hidden p-0">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#E3EAF2]">
                  <h3 className="text-sm font-bold text-[#222B45] tracking-wide">
                    UNITS
                  </h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AEB8C4]" />
                    <input
                      type="text"
                      placeholder=""
                      className="w-64 pl-9 pr-4 py-1.5 border border-[#E3EAF2] rounded-md text-sm bg-white focus:border-[#1976D2] transition outline-none"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-white border-b border-[#E3EAF2]">
                      <tr>
                        <th className="px-6 py-3 w-16 border-r border-[#E3EAF2]"></th>
                        <th className="px-6 py-3 text-left font-semibold text-[#7B8A9A] text-xs tracking-wide">
                          CONVERSION
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-[#E3EAF2] hover:bg-[#F5F8FA]">
                        <td className="px-6 py-4 text-[#4B5563] font-medium border-r border-[#E3EAF2]">
                          1
                        </td>
                        <td className="px-6 py-4 text-[#222B45] uppercase">
                          1 BAGS = 10 PIECES
                        </td>
                      </tr>
                      <tr className="border-b border-[#E3EAF2] hover:bg-[#F5F8FA]">
                        <td className="px-6 py-4 text-[#4B5563] font-medium border-r border-[#E3EAF2]">
                          2
                        </td>
                        <td className="px-6 py-4 text-[#222B45] uppercase">
                          1 BAGS = 5 CANS
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Add Item</span>
              <button
                type="button"
                onClick={() => setShowAddItem(false)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close add item popup"
              >
                <X className="h-4 w-4" />
              </button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter item name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option>Select Category</option>
                  {categoryList.map((c) => (
                    <option key={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter item code"
                    className="w-full border border-gray-300 rounded-lg pl-3 pr-10 py-2 text-sm"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700"
                    aria-label="Assign code"
                    title="Assign code"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M7 7h10M7 12h10M7 17h6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit
                </label>
                <button
                  onClick={() => setShowUnitSelector(true)}
                  className="w-full border border-blue-300 text-blue-600 rounded-lg px-3 py-2 text-sm hover:bg-blue-50 text-left"
                >
                  {selectedUnit
                    ? `${selectedUnit.fullName} (${selectedUnit.shortName})`
                    : "Select Unit"}
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200">
              {[
                { key: "pricing", label: "Pricing" },
                { key: "stock", label: "Stock" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setAddItemTab(tab.key as "pricing" | "stock")}
                  className={`pb-2 text-sm font-medium ${
                    addItemTab === tab.key
                      ? "text-[#E53935] border-b-2 border-[#E53935]"
                      : "text-gray-500"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {addItemTab === "pricing" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sale Price
                    </label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="Sale Price"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Wholesale Price
                    </label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="Wholesale Price"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Purchase Price
                    </label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="Purchase Price"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Wholesale Qty
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {addItemTab === "stock" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opening Stock
                    </label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      At Price
                    </label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    As Of Date
                  </label>
                  <input
                    type="date"
                    placeholder="YYYY-MM-DD"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowAddItem(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-gray-300 text-white rounded-lg text-sm">
                Save & New
              </button>
              <button className="px-4 py-2 bg-[#1976D2] text-white rounded-lg text-sm hover:bg-blue-600">
                Save
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Category Modal */}
      <Dialog
        open={showAddCategory}
        onOpenChange={(isOpen: boolean) => {
          setShowAddCategory(isOpen);
          if (!isOpen) {
            setNewCategoryName("");
            setCategoryBeingEdited(null);
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{categoryBeingEdited ? "Edit Category" : "Add Category"}</span>
              <button
                type="button"
                onClick={() => {
                  setShowAddCategory(false);
                  setNewCategoryName("");
                  setCategoryBeingEdited(null);
                }}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close add category popup"
              >
                <X className="h-4 w-4" />
              </button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="e.g. Grocery"
              />
            </div>
            <button
              onClick={handleCreateCategory}
              disabled={!newCategoryName.trim()}
              className="w-full bg-[#E53935] text-white py-2 rounded-lg text-sm font-medium"
            >
              {categoryBeingEdited ? "Update" : "Create"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(categoryPendingDelete)}
        onOpenChange={(isOpen: boolean) => {
          if (!isOpen && !isDeletingCategory) {
            setCategoryPendingDelete(null);
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {categoryPendingDelete
                ? `Are you sure you want to delete ${categoryPendingDelete.name}? This action cannot be undone.`
                : "Are you sure you want to delete this category?"}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={isDeletingCategory}
                onClick={() => setCategoryPendingDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingCategory || !categoryPendingDelete}
                onClick={() => {
                  if (!categoryPendingDelete) {
                    return;
                  }

                  void handleDeleteCategory(categoryPendingDelete);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60"
              >
                {isDeletingCategory ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unit Selector Modal */}
      <Dialog open={showUnitSelector} onOpenChange={setShowUnitSelector}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Unit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Unit
                </label>
                <select
                  value={baseUnitId}
                  onChange={(event) => setBaseUnitId(event.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">None</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.shortName})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secondary Unit
                </label>
                <select
                  value={secondaryUnitId}
                  onChange={(event) => setSecondaryUnitId(event.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">None</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.shortName})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                1 {baseUnit?.fullName ?? "BASE UNIT"} =
              </span>
              <input
                type="number"
                className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="0"
                value={conversionRate}
                onChange={(event) => setConversionRate(Number(event.target.value) || 0)}
              />
              <span className="text-sm text-gray-600">
                {secondaryUnit
                  ? `${secondaryUnit.fullName} (${secondaryUnit.shortName})`
                  : "SECONDARY UNIT"}
              </span>
            </div>
            <button
              onClick={handleUnitSave}
              className="w-full bg-[#1976D2] text-white py-2 rounded-lg text-sm font-medium"
            >
              SAVE
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
