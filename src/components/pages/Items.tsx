import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Plus, ChevronDown, SlidersHorizontal, Settings2, X } from "lucide-react";

// --- INLINE TYPES & MOCK DATA ---
type Item = {
  id: string;
  name: string;
  code?: string | null;
  category?: string | null;
  imgPath?: string | null;
  unit?: string | null;
  primaryUnit?: string | null;
  secondaryUnit?: string | null;
  minStock?: number | null;
  stockQuantity: number;
  salePrice: number;
  wholesalePrice: number;
  purchasePrice: number;
  stockValue: number;
  batchJson?: string | null;
};

type ItemApiRecord = {
  id: string;
  name: string;
  code: string | null;
  category: string | null;
  img_path: string | null;
  unit: string;
  primary_unit: string | null;
  secondary_unit: string | null;
  min_stock: number | null;
  sale_price: number;
  wholesale_price: number;
  purchase_price: number;
  stock_quantity: number;
  stock_value: number | null;
  batch_json?: string | null;
};

type AddItemFormState = {
  itemName: string;
  categoryId: string;
  itemCode: string;
  salePrice: string;
  wholesalePrice: string;
  purchasePrice: string;
  minWholesaleQty: string;
  openingStock: string;
  atPrice: string;
  asOfDate: string;
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

type ItemContextMenuState = {
  item: Item;
  x: number;
  y: number;
};

type UnitContextMenuState = {
  unit: UnitRecord;
  x: number;
  y: number;
};

type UnitRecord = {
  id: string;
  fullName: string;
  shortName: string;
};

type ConversionRateRecord = {
  id: number;
  base_unit: string;
  secondary_unit: string;
  conversion_rate: number;
  created_at?: string;
};

type ItemBatchRow = {
  id: string;
  mfgDate: string;
  expDate: string;
  size: string;
  openingQty: string;
};

type StockAdjustmentBatchRow = {
  id: string;
  mfgDate: string;
  expDate: string;
  size: string;
  currentQty: string;
  qty: string;
};

type ItemTransactionApiRecord = {
  id: string;
  invoice_no: string;
  date: string;
  party_name: string;
  party_id?: string | null;
  transaction_type?: string | null;
  payment_type?: string | null;
  amount: number;
  balance: number;
  status?: string | null;
  line_items_json?: string | null;
};

type ItemTransactionLine = {
  id?: number;
  itemId?: string;
  name?: string;
  quantity?: number;
  unit?: string;
  price?: number;
  amount?: number;
};

type ItemTransactionRow = {
  id: string;
  type: "Sale" | "Purchase";
  invoiceNo: string;
  partyName: string;
  date: string;
  quantity: number;
  unit: string;
  price: number;
  amount: number;
  balance: number;
  status: "Paid" | "Unpaid" | "Open" | "Cancelled";
  itemId?: string;
  itemName: string;
};

type StockAdjustmentMode = "add" | "reduce";

type StockAdjustmentFormState = {
  item: Item | null;
  mode: StockAdjustmentMode;
  adjustmentDate: string;
  totalQty: string;
  atPrice: string;
  details: string;
  batchRows: StockAdjustmentBatchRow[];
  batchSearchTerm: string;
  showBatches: boolean;
};

const getInitialAddItemFormState = (): AddItemFormState => ({
  itemName: "",
  categoryId: "",
  itemCode: "",
  salePrice: "",
  wholesalePrice: "",
  purchasePrice: "",
  minWholesaleQty: "",
  openingStock: "",
  atPrice: "",
  asOfDate: "",
});

const mapItemApiRecord = (record: ItemApiRecord): Item => ({
  id: String(record.id),
  name: String(record.name),
  code: record.code,
  category: record.category,
  imgPath: record.img_path,
  unit: record.unit,
  primaryUnit: record.primary_unit,
  secondaryUnit: record.secondary_unit,
  minStock: record.min_stock,
  salePrice: Number(record.sale_price ?? 0),
  wholesalePrice: Number(record.wholesale_price ?? 0),
  purchasePrice: Number(record.purchase_price ?? 0),
  stockQuantity: Number(record.stock_quantity ?? 0),
  stockValue: Number(record.stock_value ?? 0),
  batchJson: record.batch_json ?? null,
});

const getUnitIdFromLabel = (
  unitLabel: string | null | undefined,
  units: UnitRecord[],
) => {
  if (!unitLabel) {
    return "";
  }

  const normalizedLabel = unitLabel.trim().toLowerCase();
  const matchedUnit = units.find((unit) => {
    const fullLabel = `${unit.fullName} (${unit.shortName})`.toLowerCase();
    return (
      fullLabel === normalizedLabel ||
      unit.fullName.toLowerCase() === normalizedLabel ||
      unit.shortName.toLowerCase() === normalizedLabel
    );
  });

  return matchedUnit?.id ?? "";
};

const createEmptyBatchRow = (): ItemBatchRow => ({
  id:
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  mfgDate: '',
  expDate: '',
  size: '',
  openingQty: '',
});

const createEmptyStockAdjustmentBatchRow = (): StockAdjustmentBatchRow => ({
  id:
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  mfgDate: '',
  expDate: '',
  size: '',
  currentQty: '',
  qty: '',
});

const getInputNumberValue = (value: string) => {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return 0;
  }

  const parsedValue = Number(trimmedValue);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const resolveStockValueFromPrices = (
  quantity: number,
  atPrice: string,
  purchasePrice: number,
) => {
  const resolvedUnitPrice =
    atPrice.trim() !== ''
      ? getInputNumberValue(atPrice)
      : Number.isFinite(purchasePrice)
        ? purchasePrice
        : 0;

  return quantity * resolvedUnitPrice;
};

const formatInputDate = (value: Date = new Date()) =>
  value.toISOString().slice(0, 10);

const parseBatchRows = (batchJson?: string | null): ItemBatchRow[] => {
  if (!batchJson) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(batchJson) as unknown;
    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .map((entry) => {
        if (!entry || typeof entry !== 'object') {
          return null;
        }

        const batchEntry = entry as Partial<ItemBatchRow>;
        return {
          id: String(batchEntry.id ?? createEmptyBatchRow().id),
          mfgDate: String(batchEntry.mfgDate ?? ''),
          expDate: String(batchEntry.expDate ?? ''),
          size: String(batchEntry.size ?? ''),
          openingQty: String(batchEntry.openingQty ?? ''),
        };
      })
      .filter((entry): entry is ItemBatchRow => Boolean(entry));
  } catch {
    return [];
  }
};

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 overflow-y-auto">
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
  // Add Conversion Modal State
  const [showAddConversion, setShowAddConversion] = useState(false);
  const [conversionBaseUnit, setConversionBaseUnit] = useState("");
  const [conversionSecondaryUnit, setConversionSecondaryUnit] = useState("");
  const [conversionRateValue, setConversionRateValue] = useState(0);
  const [conversionSaving, setConversionSaving] = useState(false);
  const [conversionError, setConversionError] = useState("");
  const [conversionRates, setConversionRates] = useState<ConversionRateRecord[]>([]);

  async function handleSaveConversion() {
    setConversionError("");
    if (!conversionBaseUnit || !conversionSecondaryUnit || !conversionRateValue) {
      setConversionError("All fields are required.");
      return;
    }
    setConversionSaving(true);
    try {
      const res = await fetch("/api/conversion_rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseUnit: conversionBaseUnit,
          secondaryUnit: conversionSecondaryUnit,
          conversionRate: conversionRateValue,
        }),
      });
      if (!res.ok) throw new Error("Failed to save conversion");
      const savedConversion = (await res.json()) as ConversionRateRecord;
      setConversionRates((previousConversions) => [
        savedConversion,
        ...previousConversions,
      ]);
      setShowAddConversion(false);
      setConversionBaseUnit("");
      setConversionSecondaryUnit("");
      setConversionRateValue(0);
    } catch (e) {
      setConversionError("Failed to save conversion");
    } finally {
      setConversionSaving(false);
    }
  }
  const [activeTab, setActiveTab] = useState<"products" | "category" | "units">(
    "products",
  );
  const [itemList, setItemList] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showItemSettingsPanel, setShowItemSettingsPanel] = useState(false);
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [stockAdjustmentForm, setStockAdjustmentForm] =
    useState<StockAdjustmentFormState | null>(null);
  const [showBatchMfgDate, setShowBatchMfgDate] = useState(true);
  const [showBatchExpDate, setShowBatchExpDate] = useState(true);
  const [showBatchSize, setShowBatchSize] = useState(true);
  const [draftBatchMfgDate, setDraftBatchMfgDate] = useState(true);
  const [draftBatchExpDate, setDraftBatchExpDate] = useState(true);
  const [draftBatchSize, setDraftBatchSize] = useState(true);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [itemBeingEdited, setItemBeingEdited] = useState<Item | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);
  const [itemPendingDelete, setItemPendingDelete] = useState<Item | null>(null);
  const [itemContextMenu, setItemContextMenu] =
    useState<ItemContextMenuState | null>(null);
  const [addItemForm, setAddItemForm] = useState<AddItemFormState>(
    getInitialAddItemFormState(),
  );
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
  const [showMoveItemsDialog, setShowMoveItemsDialog] = useState(false);
  const [selectedMoveItemIds, setSelectedMoveItemIds] = useState<string[]>([]);
  const [moveItemsFilterCategoryId, setMoveItemsFilterCategoryId] =
    useState<string>('all');
  const [moveItemsSearchTerm, setMoveItemsSearchTerm] = useState('');
  const [isProductSearchActive, setIsProductSearchActive] = useState(false);
  const [isCategorySearchActive, setIsCategorySearchActive] = useState(false);
  const [isUnitSearchActive, setIsUnitSearchActive] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [unitSearchTerm, setUnitSearchTerm] = useState('');
  const [isMovingItems, setIsMovingItems] = useState(false);
  const [addItemTab, setAddItemTab] = useState<"pricing" | "stock">("pricing");
  const [addItemImageDataUrl, setAddItemImageDataUrl] = useState<string | null>(null);
  const [addItemImageFileName, setAddItemImageFileName] = useState('');
  const [addItemExistingImagePath, setAddItemExistingImagePath] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [baseUnitId, setBaseUnitId] = useState<string>("");
  const [secondaryUnitId, setSecondaryUnitId] = useState<string>("");
  const [conversionRate, setConversionRate] = useState<number>(0);
  const [batchRows, setBatchRows] = useState<ItemBatchRow[]>([createEmptyBatchRow()]);
  const [units, setUnits] = useState<UnitRecord[]>([]);
  const [itemTransactions, setItemTransactions] = useState<ItemTransactionRow[]>([]);
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [addUnitFullName, setAddUnitFullName] = useState('');
  const [addUnitShortName, setAddUnitShortName] = useState('');
  const [isSavingUnit, setIsSavingUnit] = useState(false);
  const [isDeletingUnit, setIsDeletingUnit] = useState(false);
  const [unitBeingEdited, setUnitBeingEdited] =
    useState<UnitRecord | null>(null);
  const [unitPendingDelete, setUnitPendingDelete] = useState<UnitRecord | null>(
    null,
  );
  const [unitContextMenu, setUnitContextMenu] =
    useState<UnitContextMenuState | null>(null);
  const [selectedUnitInTabId, setSelectedUnitInTabId] = useState<string | null>(
    null,
  );
  const productSearchInputRef = useRef<HTMLInputElement | null>(null);
  const categorySearchInputRef = useRef<HTMLInputElement | null>(null);
  const unitSearchInputRef = useRef<HTMLInputElement | null>(null);

  const selectedUnit = units.find((unit) => unit.id === selectedUnitId);
  const baseUnit = units.find((unit) => unit.id === baseUnitId);
  const secondaryUnit = units.find((unit) => unit.id === secondaryUnitId);
  const selectedUnitInTab = units.find((unit) => unit.id === selectedUnitInTabId);
  const filteredConversions = conversionRates.filter(
    (conversion) =>
      conversion.base_unit.toLowerCase() ===
      (selectedUnitInTab?.shortName ?? '').trim().toLowerCase(),
  );
  const selectedCategory = categoryList.find(
    (category) => category.id === selectedCategoryId,
  );
  const filteredCategoryItems = itemList.filter((item) => {
    if (selectedCategoryId === null) {
      return !item.category;
    }

    if (!selectedCategory?.name) {
      return false;
    }

    return item.category === selectedCategory.name;
  });
  const normalizedProductSearchTerm = productSearchTerm.trim().toLowerCase();
  const normalizedCategorySearchTerm = categorySearchTerm.trim().toLowerCase();
  const normalizedUnitSearchTerm = unitSearchTerm.trim().toLowerCase();
  const filteredProductList = itemList.filter((item) => {
    if (!normalizedProductSearchTerm) {
      return true;
    }

    return [item.name, item.code ?? '', item.category ?? '']
      .join(' ')
      .toLowerCase()
      .includes(normalizedProductSearchTerm);
  });
  const filteredCategoryList = categoryList.filter((category) => {
    if (!normalizedCategorySearchTerm) {
      return true;
    }

    return category.name.toLowerCase().includes(normalizedCategorySearchTerm);
  });
  const filteredUnitList = units.filter((unit) => {
    if (!normalizedUnitSearchTerm) {
      return true;
    }

    return [unit.fullName, unit.shortName]
      .join(' ')
      .toLowerCase()
      .includes(normalizedUnitSearchTerm);
  });
  const normalizedMoveItemsSearchTerm = moveItemsSearchTerm.trim().toLowerCase();
  const moveItemsFilteredList = itemList.filter((item) => {
    if (moveItemsFilterCategoryId === 'uncategorized') {
      if (item.category) {
        return false;
      }
    } else if (moveItemsFilterCategoryId !== 'all') {
      const filterCategory = categoryList.find(
        (category) => category.id === moveItemsFilterCategoryId,
      );

      if (!filterCategory || item.category !== filterCategory.name) {
        return false;
      }
    }

    if (!normalizedMoveItemsSearchTerm) {
      return true;
    }

    return [item.name, item.code ?? '', item.category ?? '']
      .join(' ')
      .toLowerCase()
      .includes(normalizedMoveItemsSearchTerm);
  });
  const moveTargetCategoryName = selectedCategory?.name ?? null;
  const batchOpeningQtyTotal = batchRows.reduce(
    (sum, row) => sum + (Number(row.openingQty) || 0),
    0,
  );
  const hasBatchOptionalFields = showBatchMfgDate || showBatchExpDate || showBatchSize;
  const hasDraftBatchChanges =
    draftBatchMfgDate !== showBatchMfgDate ||
    draftBatchExpDate !== showBatchExpDate ||
    draftBatchSize !== showBatchSize;

  const parseLineItems = (lineItemsJson?: string | null) => {
    if (!lineItemsJson) {
      return [] as ItemTransactionLine[];
    }

    try {
      const parsedValue = JSON.parse(lineItemsJson) as unknown;
      return Array.isArray(parsedValue) ? (parsedValue as ItemTransactionLine[]) : [];
    } catch {
      return [] as ItemTransactionLine[];
    }
  };

  const normalizeTransactionType = (
    transactionType?: string | null,
  ): ItemTransactionRow["type"] => {
    const normalizedType = String(transactionType ?? "").toLowerCase();
    return normalizedType.includes("purchase") ? "Purchase" : "Sale";
  };

  const normalizeTransactionStatus = (
    status?: string | null,
    balance = 0,
  ): ItemTransactionRow["status"] => {
    if (status === "Paid" || status === "Unpaid" || status === "Open" || status === "Cancelled") {
      return status;
    }

    return balance === 0 ? "Paid" : "Unpaid";
  };

  const selectedItemTransactions = useMemo(() => {
    if (!selectedItem) {
      return [] as ItemTransactionRow[];
    }

    const normalizedSelectedName = selectedItem.name.trim().toLowerCase();
    return itemTransactions.filter(
      (transaction) =>
        transaction.itemId === selectedItem.id ||
        transaction.itemName.trim().toLowerCase() === normalizedSelectedName,
    );
  }, [itemTransactions, selectedItem]);

  const openStockAdjustmentDialog = (item: Item) => {
    const parsedBatchRows = parseBatchRows(item.batchJson);
    const showBatches =
      parsedBatchRows.length > 1 ||
      parsedBatchRows.some((row) => row.size.trim().length > 0);

    setStockAdjustmentForm({
      item,
      mode: 'add',
      adjustmentDate: formatInputDate(),
      totalQty: '',
      atPrice: '',
      details: '',
      batchRows: showBatches
        ? [
            ...parsedBatchRows.map((row) => ({
              id: row.id,
              mfgDate: row.mfgDate,
              expDate: row.expDate,
              size: row.size,
              currentQty: row.openingQty,
              qty: '',
            })),
            createEmptyStockAdjustmentBatchRow(),
          ]
        : [],
      batchSearchTerm: '',
      showBatches,
    });
  };

  const closeStockAdjustmentDialog = () => {
    setStockAdjustmentForm(null);
  };

  const updateStockAdjustmentBatchRow = (
    rowId: string,
    field: keyof Omit<StockAdjustmentBatchRow, 'id'>,
    value: string,
  ) => {
    setStockAdjustmentForm((previousForm) => {
      if (!previousForm) {
        return previousForm;
      }

      return {
        ...previousForm,
        batchRows: previousForm.batchRows.map((row) =>
          row.id === rowId ? { ...row, [field]: value } : row,
        ),
      };
    });
  };

  const addStockAdjustmentBatchRow = () => {
    setStockAdjustmentForm((previousForm) => {
      if (!previousForm) {
        return previousForm;
      }

      return {
        ...previousForm,
        batchRows: [...previousForm.batchRows, createEmptyStockAdjustmentBatchRow()],
      };
    });
  };

  const removeStockAdjustmentBatchRow = (rowId: string) => {
    setStockAdjustmentForm((previousForm) => {
      if (!previousForm) {
        return previousForm;
      }

      const nextRows = previousForm.batchRows.filter((row) => row.id !== rowId);
      return {
        ...previousForm,
        batchRows: nextRows.length ? nextRows : [createEmptyStockAdjustmentBatchRow()],
      };
    });
  };

  const saveStockAdjustment = async () => {
    if (!stockAdjustmentForm?.item) {
      return;
    }

    const adjustmentQuantity = stockAdjustmentForm.showBatches
      ? stockAdjustmentForm.batchRows.reduce((sum, row) => sum + getInputNumberValue(row.qty), 0)
      : getInputNumberValue(stockAdjustmentForm.totalQty);

    if (!adjustmentQuantity) {
      return;
    }

    const direction = stockAdjustmentForm.mode === 'add' ? 1 : -1;
    const signedQuantity = adjustmentQuantity * direction;
    const currentStockQuantity = Number(stockAdjustmentForm.item.stockQuantity ?? 0);
    const currentStockValue = Number(stockAdjustmentForm.item.stockValue ?? 0);
    const unitValue =
      stockAdjustmentForm.atPrice.trim() !== ''
        ? getInputNumberValue(stockAdjustmentForm.atPrice)
        : Number.isFinite(stockAdjustmentForm.item.purchasePrice)
          ? stockAdjustmentForm.item.purchasePrice
          : 0;
    const nextStockQuantity = currentStockQuantity + signedQuantity;
    const nextStockValue = currentStockValue + signedQuantity * unitValue;

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: stockAdjustmentForm.item.id,
          name: stockAdjustmentForm.item.name,
          code: stockAdjustmentForm.item.code ?? null,
          category: stockAdjustmentForm.item.category ?? null,
          salePrice: stockAdjustmentForm.item.salePrice,
          wholesalePrice: stockAdjustmentForm.item.wholesalePrice,
          purchasePrice: stockAdjustmentForm.item.purchasePrice,
          stockQuantity: nextStockQuantity,
          unit: stockAdjustmentForm.item.unit,
          primaryUnit: stockAdjustmentForm.item.primaryUnit ?? null,
          secondaryUnit: stockAdjustmentForm.item.secondaryUnit ?? null,
          imgPath: stockAdjustmentForm.item.imgPath ?? null,
          stockValue: nextStockValue,
          minStock: stockAdjustmentForm.item.minStock ?? null,
          batchJson: stockAdjustmentForm.showBatches
            ? JSON.stringify(
                stockAdjustmentForm.batchRows
                  .filter(
                    (row) =>
                      row.mfgDate || row.expDate || row.size || row.currentQty || row.qty,
                  )
                  .map((row) => {
                    const currentQty = getInputNumberValue(row.currentQty);
                    const rowQty = getInputNumberValue(row.qty);
                    const nextQty = currentQty + rowQty * direction;

                    return {
                      id: row.id,
                      mfgDate: row.mfgDate,
                      expDate: row.expDate,
                      size: row.size,
                      openingQty: String(nextQty),
                      currentQty: row.currentQty,
                      qty: row.qty,
                    };
                  }),
              )
            : stockAdjustmentForm.item.batchJson ?? null,
          location: null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update item stock');
      }

      const updatedItemResponse = (await response.json()) as Partial<Item> & {
        batchJson?: string | null;
      };

      const updatedItem: Item = {
        ...stockAdjustmentForm.item,
        stockQuantity: Number(updatedItemResponse.stockQuantity ?? nextStockQuantity),
        stockValue: Number(updatedItemResponse.stockValue ?? nextStockValue),
        batchJson: updatedItemResponse.batchJson ?? stockAdjustmentForm.item.batchJson ?? null,
      };

      setItemList((previousItems) =>
        previousItems.map((entry) => (entry.id === updatedItem.id ? updatedItem : entry)),
      );
      setSelectedItem(updatedItem);
      closeStockAdjustmentDialog();
    } catch (error) {
      console.error(error);
    }
  };

  const getContextMenuStyle = (x: number, y: number) => {
    if (typeof window === 'undefined') {
      return { left: x, top: y };
    }

    const menuWidth = 160;
    const menuHeight = 80;
    const viewportPadding = 8;

    let left = x;
    let top = y;

    if (left + menuWidth > window.innerWidth - viewportPadding) {
      left = Math.max(viewportPadding, window.innerWidth - menuWidth - viewportPadding);
    }

    if (top + menuHeight > window.innerHeight - viewportPadding) {
      top = Math.max(viewportPadding, y - menuHeight);
    }

    return { left, top };
  };

  useEffect(() => {
    const loadUnits = async () => {
      try {
        const response = await fetch('/api/units');
        if (!response.ok) {
          throw new Error('Failed to load units');
        }
        const unitRows = (await response.json()) as UnitRecord[];
        setUnits(unitRows);
      } catch (error) {
        console.error(error);
      }
    };

    void loadUnits();
  }, []);

  useEffect(() => {
    const loadConversionRates = async () => {
      try {
        const response = await fetch('/api/conversion_rates');
        if (!response.ok) {
          throw new Error('Failed to load conversion rates');
        }

        const conversionRows = (await response.json()) as ConversionRateRecord[];
        setConversionRates(conversionRows);
      } catch (error) {
        console.error(error);
      }
    };

    void loadConversionRates();
  }, []);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const response = await fetch('/api/items');
        if (!response.ok) {
          throw new Error('Failed to load items');
        }

        const itemRows = (await response.json()) as ItemApiRecord[];
        setItemList(itemRows.map(mapItemApiRecord));
      } catch (error) {
        console.error(error);
      }
    };

    void loadItems();
  }, []);

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
    const loadItemTransactions = async () => {
      try {
        const [saleInvoicesResponse, purchaseBillsResponse] = await Promise.all([
          fetch('/api/sale_invoices'),
          fetch('/api/purchase_bills'),
        ]);

        const saleInvoices = saleInvoicesResponse.ok
          ? ((await saleInvoicesResponse.json()) as ItemTransactionApiRecord[])
          : [];
        const purchaseBills = purchaseBillsResponse.ok
          ? ((await purchaseBillsResponse.json()) as ItemTransactionApiRecord[])
          : [];

        const nextTransactions = [...saleInvoices, ...purchaseBills].flatMap(
          (invoice): ItemTransactionRow[] => {
          const lineItems = parseLineItems(invoice.line_items_json);
          const transactionType = normalizeTransactionType(invoice.transaction_type);
          const balance = Number(invoice.balance ?? 0);
          const status = normalizeTransactionStatus(invoice.status, balance);

          return lineItems.map((lineItem, index) => ({
            id: `${invoice.id}-${lineItem.id ?? index}`,
            type: transactionType,
            invoiceNo: invoice.invoice_no,
            partyName: invoice.party_name,
            date: invoice.date,
            quantity: Number(lineItem.quantity ?? 0),
            unit: lineItem.unit ?? "",
            price: Number(lineItem.price ?? 0),
            amount: Number(
              lineItem.amount ??
                Number(lineItem.quantity ?? 0) * Number(lineItem.price ?? 0),
            ),
            balance,
            status,
            itemId: lineItem.itemId ?? undefined,
            itemName: lineItem.name ?? "",
          }));
          },
        );

        setItemTransactions(nextTransactions);
      } catch (error) {
        console.error(error);
        setItemTransactions([]);
      }
    };

    void loadItemTransactions();
  }, []);

  useEffect(() => {
    setSelectedItem((previousSelectedItem) => {
      if (!itemList.length) {
        return null;
      }

      if (previousSelectedItem) {
        const updatedSelectedItem = itemList.find(
          (item) => item.id === previousSelectedItem.id,
        );

        if (updatedSelectedItem) {
          return updatedSelectedItem;
        }
      }

      return itemList[0];
    });
  }, [itemList]);

  useEffect(() => {
    setSelectedUnitInTabId((previousSelectedUnitId) => {
      if (!units.length) {
        return null;
      }

      if (
        previousSelectedUnitId &&
        units.some((unit) => unit.id === previousSelectedUnitId)
      ) {
        return previousSelectedUnitId;
      }

      return units[0].id;
    });
  }, [units]);

  useEffect(() => {
    if (!itemContextMenu) {
      return;
    }

    const closeMenu = () => setItemContextMenu(null);

    window.addEventListener('click', closeMenu);
    window.addEventListener('resize', closeMenu);
    window.addEventListener('scroll', closeMenu, true);

    return () => {
      window.removeEventListener('click', closeMenu);
      window.removeEventListener('resize', closeMenu);
      window.removeEventListener('scroll', closeMenu, true);
    };
  }, [itemContextMenu]);

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

  useEffect(() => {
    if (!unitContextMenu) {
      return;
    }

    const closeMenu = () => setUnitContextMenu(null);

    window.addEventListener('click', closeMenu);
    window.addEventListener('resize', closeMenu);
    window.addEventListener('scroll', closeMenu, true);

    return () => {
      window.removeEventListener('click', closeMenu);
      window.removeEventListener('resize', closeMenu);
      window.removeEventListener('scroll', closeMenu, true);
    };
  }, [unitContextMenu]);

  useEffect(() => {
    if (isProductSearchActive) {
      productSearchInputRef.current?.focus();
    }
  }, [isProductSearchActive]);

  useEffect(() => {
    if (isCategorySearchActive) {
      categorySearchInputRef.current?.focus();
    }
  }, [isCategorySearchActive]);

  useEffect(() => {
    if (isUnitSearchActive) {
      unitSearchInputRef.current?.focus();
    }
  }, [isUnitSearchActive]);

  const openBatchDialog = () => {
    setBatchRows((previousRows) => {
      if (previousRows.length) {
        return previousRows.map((row, index) =>
          index === 0 && !row.openingQty && addItemForm.openingStock
            ? { ...row, openingQty: addItemForm.openingStock }
            : row,
        );
      }

      return [
        {
          ...createEmptyBatchRow(),
          openingQty: addItemForm.openingStock,
        },
      ];
    });
    setShowBatchDialog(true);
  };

  const canOpenBatchDialog = hasBatchOptionalFields;

  const openItemSettingsPanel = () => {
    setDraftBatchMfgDate(showBatchMfgDate);
    setDraftBatchExpDate(showBatchExpDate);
    setDraftBatchSize(showBatchSize);
    setShowItemSettingsPanel(true);
  };

  const closeItemSettingsPanel = () => {
    setDraftBatchMfgDate(showBatchMfgDate);
    setDraftBatchExpDate(showBatchExpDate);
    setDraftBatchSize(showBatchSize);
    setShowItemSettingsPanel(false);
  };

  const saveItemSettingsChanges = () => {
    setShowBatchMfgDate(draftBatchMfgDate);
    setShowBatchExpDate(draftBatchExpDate);
    setShowBatchSize(draftBatchSize);
    setShowItemSettingsPanel(false);
  };

  const updateBatchRow = (rowId: string, field: keyof Omit<ItemBatchRow, 'id'>, value: string) => {
    setBatchRows((previousRows) =>
      previousRows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
    );
  };

  const addBatchRow = () => {
    setBatchRows((previousRows) => [...previousRows, createEmptyBatchRow()]);
  };

  const removeBatchRow = (rowId: string) => {
    setBatchRows((previousRows) => {
      const nextRows = previousRows.filter((row) => row.id !== rowId);
      return nextRows.length ? nextRows : [createEmptyBatchRow()];
    });
  };

  const handleUnitSave = () => {
    if (baseUnitId) {
      setSelectedUnitId(baseUnitId);
    }

    setShowUnitSelector(false);
  };

  const handleCreateUnit = async () => {
    const normalizedFullName = addUnitFullName.trim();
    const normalizedShortName = addUnitShortName.trim();
    if (!normalizedFullName || !normalizedShortName || isSavingUnit) {
      return;
    }

    const duplicateUnit = units.some(
      (unit) =>
        unit.id !== unitBeingEdited?.id &&
        unit.fullName.trim().toLowerCase() === normalizedFullName.toLowerCase(),
    );

    if (duplicateUnit) {
      return;
    }

    setIsSavingUnit(true);
    try {
      const response = await fetch('/api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: unitBeingEdited?.id,
          fullName: normalizedFullName,
          shortName: normalizedShortName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create unit');
      }

      const createdUnit = (await response.json()) as UnitRecord;
      setUnits((previousUnits) => {
        const hasExistingUnit = previousUnits.some(
          (unit) => unit.id === createdUnit.id,
        );

        const nextUnits = hasExistingUnit
          ? previousUnits.map((unit) =>
              unit.id === createdUnit.id ? createdUnit : unit,
            )
          : [...previousUnits, createdUnit];

        return nextUnits.sort((a, b) => a.fullName.localeCompare(b.fullName));
      });
      setSelectedUnitInTabId(createdUnit.id);
      setAddUnitFullName('');
      setAddUnitShortName('');
      setUnitBeingEdited(null);
      setShowAddUnit(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSavingUnit(false);
    }
  };

  const openEditUnitDialog = (unit: UnitRecord) => {
    setUnitBeingEdited(unit);
    setAddUnitFullName(unit.fullName);
    setAddUnitShortName(unit.shortName);
    setShowAddUnit(true);
  };

  const handleDeleteUnit = async (unit: UnitRecord) => {
    if (isDeletingUnit) {
      return;
    }

    setIsDeletingUnit(true);

    try {
      const response = await fetch(`/api/units/${unit.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete unit');
      }

      setUnits((previousUnits) =>
        previousUnits.filter((entry) => entry.id !== unit.id),
      );

      if (selectedUnitId === unit.id) {
        setSelectedUnitId('');
      }

      if (baseUnitId === unit.id) {
        setBaseUnitId('');
      }

      if (secondaryUnitId === unit.id) {
        setSecondaryUnitId('');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeletingUnit(false);
      setUnitPendingDelete(null);
    }
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

  const openMoveItemsDialog = () => {
    setSelectedMoveItemIds([]);
    setMoveItemsFilterCategoryId('all');
    setMoveItemsSearchTerm('');
    setShowMoveItemsDialog(true);
  };

  const toggleMoveItemSelection = (itemId: string) => {
    setSelectedMoveItemIds((previousSelectedItemIds) =>
      previousSelectedItemIds.includes(itemId)
        ? previousSelectedItemIds.filter((selectedItemId) => selectedItemId !== itemId)
        : [...previousSelectedItemIds, itemId],
    );
  };

  const handleMoveItemsToCategory = async () => {
    if (!selectedMoveItemIds.length || isMovingItems) {
      return;
    }

    setIsMovingItems(true);

    try {
      const itemsToMove = itemList.filter((item) => selectedMoveItemIds.includes(item.id));

      await Promise.all(
        itemsToMove.map(async (item) => {
          const response = await fetch('/api/items', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: item.id,
              name: item.name,
              code: item.code ?? null,
              category: moveTargetCategoryName,
              salePrice: item.salePrice,
              wholesalePrice: item.wholesalePrice,
              purchasePrice: item.purchasePrice,
              stockQuantity: item.stockQuantity,
              unit: item.unit,
              primaryUnit: item.primaryUnit ?? null,
              secondaryUnit: item.secondaryUnit ?? null,
              stockValue: item.stockValue,
              minStock: item.minStock ?? null,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to move items to category');
          }
        }),
      );

      setItemList((previousItems) =>
        previousItems.map((item) =>
          selectedMoveItemIds.includes(item.id)
            ? { ...item, category: moveTargetCategoryName }
            : item,
        ),
      );

      try {
        const categoriesResponse = await fetch('/api/categories');
        if (categoriesResponse.ok) {
          const categories = (await categoriesResponse.json()) as CategoryRecord[];
          setCategoryList(categories);
        }
      } catch (error) {
        console.error(error);
      }

      setSelectedMoveItemIds([]);
      setMoveItemsFilterCategoryId('all');
      setMoveItemsSearchTerm('');
      setShowMoveItemsDialog(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsMovingItems(false);
    }
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

  const openAddItemModal = () => {
    setAddItemTab('pricing');
    setAddItemForm(getInitialAddItemFormState());
    setItemBeingEdited(null);
    setShowItemSettingsPanel(false);
    setShowBatchDialog(false);
    setShowBatchMfgDate(true);
    setShowBatchExpDate(true);
    setShowBatchSize(true);
    setDraftBatchMfgDate(true);
    setDraftBatchExpDate(true);
    setDraftBatchSize(true);
    setBatchRows([createEmptyBatchRow()]);
    setSelectedUnitId('');
    setBaseUnitId('');
    setSecondaryUnitId('');
    setConversionRate(0);
    setAddItemImageDataUrl(null);
    setAddItemImageFileName('');
    setAddItemExistingImagePath(null);
    setShowAddItem(true);
  };

  const openEditItemDialog = (item: Item) => {
    const matchedCategory = categoryList.find(
      (category) => category.name === item.category,
    );
    const matchedUnitId = getUnitIdFromLabel(item.unit, units);
    const matchedPrimaryUnitId = getUnitIdFromLabel(
      item.primaryUnit ?? item.unit,
      units,
    );
    const matchedSecondaryUnitId = getUnitIdFromLabel(item.secondaryUnit, units);

    setItemBeingEdited(item);
    setAddItemTab('pricing');
    setShowItemSettingsPanel(false);
    setShowBatchDialog(false);
    setShowBatchMfgDate(true);
    setShowBatchExpDate(true);
    setShowBatchSize(true);
    setDraftBatchMfgDate(true);
    setDraftBatchExpDate(true);
    setDraftBatchSize(true);
    setBatchRows(parseBatchRows(item.batchJson));
    setAddItemForm({
      itemName: item.name,
      categoryId: matchedCategory?.id ?? '',
      itemCode: item.code ?? '',
      salePrice: String(item.salePrice ?? ''),
      wholesalePrice: String(item.wholesalePrice ?? ''),
      purchasePrice: String(item.purchasePrice ?? ''),
      minWholesaleQty:
        item.minStock === null || item.minStock === undefined
          ? ''
          : String(item.minStock),
      openingStock: String(item.stockQuantity ?? ''),
      atPrice:
        item.stockQuantity && item.stockQuantity !== 0
          ? String(item.stockValue / item.stockQuantity)
          : '',
      asOfDate: '',
    });

    setSelectedUnitId(matchedPrimaryUnitId || matchedUnitId);
    setBaseUnitId(matchedPrimaryUnitId || matchedUnitId);
    setSecondaryUnitId(matchedSecondaryUnitId);
    setConversionRate(0);
    setAddItemImageDataUrl(null);
    setAddItemImageFileName('');
    setAddItemExistingImagePath(item.imgPath ?? null);
    setShowAddItem(true);
  };

  const handleAddItemImageSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setAddItemImageDataUrl(null);
      setAddItemImageFileName('');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;
      setAddItemImageDataUrl(result);
      setAddItemImageFileName(file.name);
    };
    reader.onerror = () => {
      setAddItemImageDataUrl(null);
      setAddItemImageFileName('');
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteItem = async (item: Item) => {
    if (isDeletingItem) {
      return;
    }

    setIsDeletingItem(true);

    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      setItemList((previousItems) =>
        previousItems.filter((entry) => entry.id !== item.id),
      );

      if (item.category) {
        setCategoryList((previousCategories) =>
          previousCategories.map((category) =>
            category.name === item.category
              ? {
                  ...category,
                  itemCount: Math.max(0, category.itemCount - 1),
                }
              : category,
          ),
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeletingItem(false);
      setItemPendingDelete(null);
    }
  };

  const handleSaveItem = async (closeAfterSave: boolean) => {
    if (isSavingItem) {
      return;
    }

    const normalizedName = addItemForm.itemName.trim();
    if (!normalizedName || !selectedUnit) {
      return;
    }

    const openingStock = Number(addItemForm.openingStock) || 0;
    const salePrice = Number(addItemForm.salePrice) || 0;
    const purchasePrice = Number(addItemForm.purchasePrice) || 0;
    const minWholesaleQty = Number(addItemForm.minWholesaleQty) || 0;
    const openingStockValue = resolveStockValueFromPrices(
      openingStock,
      addItemForm.atPrice,
      purchasePrice,
    );
    const selectedItemCategory = categoryList.find(
      (category) => category.id === addItemForm.categoryId,
    );
    const previousCategoryName = itemBeingEdited?.category ?? null;
    const currentCategoryName = selectedItemCategory?.name ?? null;
    const normalizedBatchRows = batchRows.filter(
      (row) => row.mfgDate || row.expDate || row.size || row.openingQty,
    );
    const batchJson = normalizedBatchRows.length ? JSON.stringify(normalizedBatchRows) : null;

    const payload = {
      id: itemBeingEdited?.id,
      name: normalizedName,
      code: addItemForm.itemCode.trim() || null,
      category: currentCategoryName,
      salePrice,
      wholesalePrice: Number(addItemForm.wholesalePrice) || 0,
      purchasePrice,
      stockQuantity: openingStock,
      unit: `${selectedUnit.fullName} (${selectedUnit.shortName})`,
      primaryUnit: baseUnit ? `${baseUnit.fullName} (${baseUnit.shortName})` : null,
      secondaryUnit: secondaryUnit
        ? `${secondaryUnit.fullName} (${secondaryUnit.shortName})`
        : null,
      conversionRate: Number(conversionRate) || 0,
      imgPath: addItemExistingImagePath,
      imageDataUrl: addItemImageDataUrl,
      imageFileName: addItemImageFileName,
      batchJson,
      stockValue: openingStockValue,
      minStock: minWholesaleQty,
    };

    setIsSavingItem(true);

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create item');
      }

      const createdItemPayload = (await response.json()) as {
        id: string;
        name: string;
        code?: string | null;
        category?: string | null;
        unit?: string | null;
        primaryUnit?: string | null;
        secondaryUnit?: string | null;
        imgPath?: string | null;
        minStock?: number | null;
        salePrice: number;
        wholesalePrice?: number;
        purchasePrice: number;
        stockQuantity: number;
        stockValue: number;
        batchJson?: string | null;
      };

      const createdItem: Item = {
        id: String(createdItemPayload.id),
        name: String(createdItemPayload.name),
        code: createdItemPayload.code ?? (addItemForm.itemCode.trim() || null),
        category: createdItemPayload.category ?? currentCategoryName,
        unit:
          createdItemPayload.unit ??
          `${selectedUnit.fullName} (${selectedUnit.shortName})`,
        primaryUnit:
          createdItemPayload.primaryUnit ??
          (baseUnit ? `${baseUnit.fullName} (${baseUnit.shortName})` : null),
        secondaryUnit:
          createdItemPayload.secondaryUnit ??
          (secondaryUnit
            ? `${secondaryUnit.fullName} (${secondaryUnit.shortName})`
            : null),
        imgPath: createdItemPayload.imgPath ?? addItemExistingImagePath,
        batchJson: createdItemPayload.batchJson ?? batchJson,
        minStock:
          createdItemPayload.minStock ??
          (minWholesaleQty === 0 ? null : minWholesaleQty),
        salePrice: Number(createdItemPayload.salePrice ?? salePrice),
        wholesalePrice: Number(
          createdItemPayload.wholesalePrice ??
            (Number(addItemForm.wholesalePrice) || 0),
        ),
        purchasePrice: Number(createdItemPayload.purchasePrice ?? purchasePrice),
        stockQuantity: Number(createdItemPayload.stockQuantity ?? openingStock),
        stockValue: Number(createdItemPayload.stockValue ?? openingStockValue),
      };

      setItemList((previousItems) => {
        const hasExistingItem = previousItems.some(
          (item) => item.id === createdItem.id,
        );

        const nextItems = hasExistingItem
          ? previousItems.map((item) =>
              item.id === createdItem.id ? createdItem : item,
            )
          : [...previousItems, createdItem];

        nextItems.sort((first, second) => first.name.localeCompare(second.name));
        return nextItems;
      });
      setSelectedItem(createdItem);

      if (!itemBeingEdited && selectedItemCategory) {
        setCategoryList((previousCategories) =>
          previousCategories.map((category) =>
            category.id === selectedItemCategory.id
              ? { ...category, itemCount: category.itemCount + 1 }
              : category,
          ),
        );
      }

      if (
        itemBeingEdited &&
        previousCategoryName !== currentCategoryName
      ) {
        setCategoryList((previousCategories) =>
          previousCategories.map((category) => {
            if (previousCategoryName && category.name === previousCategoryName) {
              return {
                ...category,
                itemCount: Math.max(0, category.itemCount - 1),
              };
            }

            if (currentCategoryName && category.name === currentCategoryName) {
              return {
                ...category,
                itemCount: category.itemCount + 1,
              };
            }

            return category;
          }),
        );
      }

      setAddItemForm(getInitialAddItemFormState());
      setItemBeingEdited(null);
      setSelectedUnitId('');
      setBaseUnitId('');
      setSecondaryUnitId('');
      setConversionRate(0);
      setAddItemImageDataUrl(null);
      setAddItemImageFileName('');
      setAddItemExistingImagePath(null);
      setAddItemTab('pricing');

      if (closeAfterSave) {
        setShowAddItem(false);
        setShowBatchDialog(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSavingItem(false);
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
                  {isProductSearchActive ? (
                    <div className="relative mr-3 flex-1 max-w-[220px]">
                      <input
                        ref={productSearchInputRef}
                        type="text"
                        value={productSearchTerm}
                        onChange={(event) => setProductSearchTerm(event.target.value)}
                        onBlur={() => {
                          setProductSearchTerm('');
                          setIsProductSearchActive(false);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Escape') {
                            setProductSearchTerm('');
                            setIsProductSearchActive(false);
                          }
                        }}
                        placeholder="Search items"
                        className="w-full border border-[#D1D5DB] rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsProductSearchActive(true)}
                      className="w-10 h-10 rounded-full bg-[#E5E7EB] flex items-center justify-center text-[#4B5563] hover:bg-[#D1D5DB] transition-colors mr-3"
                      aria-label="Search products"
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={openAddItemModal}
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
                    {filteredProductList.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        onContextMenu={(event) => {
                          event.preventDefault();
                          setSelectedItem(item);
                          setItemContextMenu({
                            item,
                            x: event.clientX,
                            y: event.clientY,
                          });
                        }}
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

            {itemContextMenu && (
              <div
                className="fixed z-50 min-w-40 rounded-md border bg-white p-1 shadow-md"
                style={getContextMenuStyle(itemContextMenu.x, itemContextMenu.y)}
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  onClick={() => {
                    setSelectedItem(itemContextMenu.item);
                    openEditItemDialog(itemContextMenu.item);
                    setItemContextMenu(null);
                  }}
                  className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-gray-100"
                >
                  View/Edit
                </button>
                <button
                  onClick={() => {
                    const item = itemContextMenu.item;
                    setItemContextMenu(null);
                    setItemPendingDelete(item);
                  }}
                  className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            )}

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
                          onClick={() => openStockAdjustmentDialog(selectedItem)}
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
                            {selectedItemTransactions.length ? (
                              selectedItemTransactions.map((transaction) => (
                                <tr
                                  key={transaction.id}
                                  className="border-b border-[#E3EAF2] hover:bg-[#F5F8FA]"
                                >
                                  <td className="px-4 py-2">
                                    <span
                                      className={`inline-flex items-center gap-1.5 ${
                                        transaction.type === "Sale"
                                          ? "text-[#43A047]"
                                          : "text-[#E53935]"
                                      }`}
                                    >
                                      <span
                                        className={`w-2 h-2 rounded-full ${
                                          transaction.type === "Sale"
                                            ? "bg-[#43A047]"
                                            : "bg-[#E53935]"
                                        }`}
                                      ></span>
                                      {transaction.type}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2">{transaction.invoiceNo}</td>
                                  <td className="px-4 py-2">{transaction.partyName}</td>
                                  <td className="px-4 py-2">{transaction.date}</td>
                                  <td className="px-4 py-2 text-right">
                                    {Number(transaction.quantity).toLocaleString()} {transaction.unit || ""}
                                  </td>
                                  <td className="px-4 py-2 text-right">
                                    Rs {Number(transaction.price).toFixed(2)}
                                  </td>
                                  <td className="px-4 py-2">
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                        transaction.status === "Paid"
                                          ? "bg-[#E6F4EA] text-[#43A047]"
                                          : transaction.status === "Unpaid"
                                            ? "bg-[#FDEAEA] text-[#E53935]"
                                            : "bg-[#F7F9FB] text-[#7B8A9A]"
                                      }`}
                                    >
                                      {transaction.status}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan={7}
                                  className="px-4 py-8 text-center text-gray-500"
                                >
                                  No transactions found for this item
                                </td>
                              </tr>
                            )}
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
                  {isCategorySearchActive ? (
                    <div className="relative mr-3 flex-1 max-w-[220px]">
                      <input
                        ref={categorySearchInputRef}
                        type="text"
                        value={categorySearchTerm}
                        onChange={(event) => setCategorySearchTerm(event.target.value)}
                        onBlur={() => {
                          setCategorySearchTerm('');
                          setIsCategorySearchActive(false);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Escape') {
                            setCategorySearchTerm('');
                            setIsCategorySearchActive(false);
                          }
                        }}
                        placeholder="Search categories"
                        className="w-full border border-[#D1D5DB] rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsCategorySearchActive(true)}
                      className="w-10 h-10 rounded-full bg-[#E5E7EB] flex items-center justify-center text-[#4B5563] hover:bg-[#D1D5DB] transition-colors mr-3"
                      aria-label="Search categories"
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  )}
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
                    <tr
                      onClick={() => setSelectedCategoryId(null)}
                      className={`border-b border-[#E3EAF2] hover:bg-[#F5F8FA] cursor-pointer ${selectedCategoryId === null ? "bg-[#E3F0FF]" : ""}`}
                    >
                      <td className="px-4 py-3 text-[#222B45] font-medium">
                        Items not in any Category
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[#7B8A9A]">
                        0
                      </td>
                    </tr>
                    {filteredCategoryList.map((cat) => (
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
                style={getContextMenuStyle(categoryContextMenu.x, categoryContextMenu.y)}
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
                        {selectedCategory?.name ?? "ITEMS NOT IN ANY CATEGORY"}
                      </h2>
                    </div>
                    <span className="text-sm font-medium text-[#151B26]">
                      {filteredCategoryItems.length}
                    </span>
                  </div>
                  <div className="flex flex-col items-end justify-between flex-1 pr-6 pt-5 pb-2">
                    <button
                      onClick={openMoveItemsDialog}
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
                        {filteredCategoryItems.length ? (
                          filteredCategoryItems.map((item) => (
                            <tr
                              key={item.id}
                              className="border-b border-[#E3EAF2] hover:bg-[#F5F8FA]"
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
                              <td className="px-4 py-3 text-right font-semibold text-[#43A047]">
                                Rs {Number(item.stockValue ?? 0).toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={3}
                              className="px-4 py-6 text-center text-sm text-[#7B8A9A]"
                            >
                              There are no items to show.
                            </td>
                          </tr>
                        )}
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
                {isUnitSearchActive ? (
                  <div className="relative flex-1 max-w-[220px]">
                    <input
                      ref={unitSearchInputRef}
                      type="text"
                      value={unitSearchTerm}
                      onChange={(event) => setUnitSearchTerm(event.target.value)}
                      onBlur={() => {
                        setUnitSearchTerm('');
                        setIsUnitSearchActive(false);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Escape') {
                          setUnitSearchTerm('');
                          setIsUnitSearchActive(false);
                        }
                      }}
                      placeholder="Search units"
                      className="w-full border border-[#D1D5DB] rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsUnitSearchActive(true)}
                    className="w-10 h-10 rounded-full bg-[#E5E7EB] flex items-center justify-center text-[#4B5563] hover:bg-[#D1D5DB] transition-colors"
                    aria-label="Search units"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setUnitBeingEdited(null);
                    setAddUnitFullName('');
                    setAddUnitShortName('');
                    setShowAddUnit(true);
                  }}
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
                          onClick={() => setSelectedUnitInTabId(unit.id)}
                          onContextMenu={(event) => {
                            event.preventDefault();
                            setSelectedUnitInTabId(unit.id);
                            setUnitContextMenu({
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

            {unitContextMenu && (
              <div
                className="fixed z-50 min-w-40 rounded-md border bg-white p-1 shadow-md"
                style={getContextMenuStyle(unitContextMenu.x, unitContextMenu.y)}
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  onClick={() => {
                    setSelectedUnitInTabId(unitContextMenu.unit.id);
                    openEditUnitDialog(unitContextMenu.unit);
                    setUnitContextMenu(null);
                  }}
                  className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-gray-100"
                >
                  View/Edit
                </button>
                <button
                  onClick={() => {
                    const unit = unitContextMenu.unit;
                    setUnitContextMenu(null);
                    setUnitPendingDelete(unit);
                  }}
                  className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            )}

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
                  {selectedUnitInTab?.fullName ?? "NO UNIT SELECTED"}
                </h2>
                <button
                  className="bg-[#1976D2] hover:bg-[#1251A3] text-white px-5 py-2 rounded-lg text-sm font-bold shadow transition-all"
                  onClick={() => setShowAddConversion(true)}
                >
                  Add Conversion
                </button>
                {/* Add Conversion Modal is rendered at the root of the component, not here */}
              </Card>

              {/* Bottom Card: Conversions Table Area */}
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
                              className="border-b border-[#E3EAF2] hover:bg-[#F5F8FA]"
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
          </div>
        )}
      </div>

      {/* Add Conversion Modal */}
      <Dialog
        open={showAddConversion}
        onOpenChange={(isOpen: boolean) => {
          setShowAddConversion(isOpen);
          if (!isOpen && !conversionSaving) {
            setConversionError('');
            setConversionRateValue(0);
            setConversionBaseUnit(selectedUnitInTab?.shortName ?? '');
            setConversionSecondaryUnit('');
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Select Unit</span>
              <button
                type="button"
                onClick={() => setShowAddConversion(false)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close add conversion popup"
              >
                <X className="h-4 w-4" />
              </button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Unit
                </label>
                <select
                  value={conversionBaseUnit}
                  onChange={(event) => setConversionBaseUnit(event.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">None</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.shortName}>
                      {unit.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secondary Unit
                </label>
                <select
                  value={conversionSecondaryUnit}
                  onChange={(event) => setConversionSecondaryUnit(event.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">None</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.shortName}>
                      {unit.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                1 {conversionBaseUnit || 'BASE UNIT'} =
              </span>
              <input
                type="number"
                min={0}
                value={conversionRateValue}
                onChange={(event) =>
                  setConversionRateValue(Number(event.target.value) || 0)
                }
                className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <span className="text-sm text-gray-600">
                {conversionSecondaryUnit || 'SECONDARY UNIT'}
              </span>
            </div>

            {conversionError ? (
              <p className="text-sm text-red-600">{conversionError}</p>
            ) : null}

            <button
              type="button"
              onClick={handleSaveConversion}
              disabled={conversionSaving}
              className="w-full bg-[#1976D2] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#1251A3] disabled:opacity-60"
            >
              {conversionSaving ? 'Saving...' : 'SAVE'}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Item Modal */}
      <Dialog
        open={showAddItem}
        onOpenChange={(isOpen: boolean) => {
          setShowAddItem(isOpen);
          if (!isOpen) {
            setShowItemSettingsPanel(false);
            setAddItemTab('pricing');
            setAddItemForm(getInitialAddItemFormState());
            setItemBeingEdited(null);
            setSelectedUnitId('');
            setBaseUnitId('');
            setSecondaryUnitId('');
            setConversionRate(0);
            setAddItemImageDataUrl(null);
            setAddItemImageFileName('');
            setAddItemExistingImagePath(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-3">
              <span>{itemBeingEdited ? 'Edit Item' : 'Add Item'}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowItemSettingsPanel(true)}
                  className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Open item settings"
                  title="Item settings"
                >
                  <Settings2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddItem(false)}
                  className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Close add item popup"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
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
                  value={addItemForm.itemName}
                  onChange={(event) =>
                    setAddItemForm((previousValue) => ({
                      ...previousValue,
                      itemName: event.target.value,
                    }))
                  }
                  placeholder="Enter item name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={addItemForm.categoryId}
                  onChange={(event) =>
                    setAddItemForm((previousValue) => ({
                      ...previousValue,
                      categoryId: event.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Select Category</option>
                  {categoryList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
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
                    value={addItemForm.itemCode}
                    onChange={(event) =>
                      setAddItemForm((previousValue) => ({
                        ...previousValue,
                        itemCode: event.target.value,
                      }))
                    }
                    placeholder="Enter item code"
                    className="w-full border border-gray-300 rounded-lg pl-3 pr-10 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setAddItemForm((previousValue) => ({
                        ...previousValue,
                        itemCode: `ITEM-${Date.now().toString().slice(-6)}`,
                      }))
                    }
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAddItemImageSelection}
                className="w-full cursor-pointer border border-gray-300 rounded-lg px-3 py-2 text-sm transition-colors hover:border-blue-400 file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-blue-700 file:transition-colors file:hover:bg-blue-100"
              />
              {addItemImageFileName ? (
                <p className="mt-1 text-xs text-gray-600">Selected: {addItemImageFileName}</p>
              ) : null}
              {!addItemImageFileName && addItemExistingImagePath ? (
                <p className="mt-1 text-xs text-gray-600">Current: {addItemExistingImagePath}</p>
              ) : null}
              {addItemImageDataUrl ? (
                <img
                  src={addItemImageDataUrl}
                  alt="Item preview"
                  className="mt-2 h-20 w-20 rounded border border-gray-200 object-cover"
                />
              ) : null}
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
                      value={addItemForm.salePrice}
                      onChange={(event) =>
                        setAddItemForm((previousValue) => ({
                          ...previousValue,
                          salePrice: event.target.value,
                        }))
                      }
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
                      value={addItemForm.wholesalePrice}
                      onChange={(event) =>
                        setAddItemForm((previousValue) => ({
                          ...previousValue,
                          wholesalePrice: event.target.value,
                        }))
                      }
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
                      value={addItemForm.purchasePrice}
                      onChange={(event) =>
                        setAddItemForm((previousValue) => ({
                          ...previousValue,
                          purchasePrice: event.target.value,
                        }))
                      }
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
                      value={addItemForm.minWholesaleQty}
                      onChange={(event) =>
                        setAddItemForm((previousValue) => ({
                          ...previousValue,
                          minWholesaleQty: event.target.value,
                        }))
                      }
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
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Opening Stock
                      </label>
                      {canOpenBatchDialog ? (
                        <button
                          type="button"
                          onClick={openBatchDialog}
                          className="rounded-md bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-100"
                        >
                          Batch
                        </button>
                      ) : null}
                    </div>
                    <input
                      type="number"
                      value={addItemForm.openingStock}
                      onChange={(event) =>
                        setAddItemForm((previousValue) => ({
                          ...previousValue,
                          openingStock: event.target.value,
                        }))
                      }
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
                      value={addItemForm.atPrice}
                      onChange={(event) =>
                        setAddItemForm((previousValue) => ({
                          ...previousValue,
                          atPrice: event.target.value,
                        }))
                      }
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
                    value={addItemForm.asOfDate}
                    onChange={(event) =>
                      setAddItemForm((previousValue) => ({
                        ...previousValue,
                        asOfDate: event.target.value,
                      }))
                    }
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
              <button
                onClick={() => {
                  void handleSaveItem(false);
                }}
                disabled={
                  Boolean(itemBeingEdited) ||
                  isSavingItem ||
                  !addItemForm.itemName.trim() ||
                  !selectedUnit
                }
                className="px-4 py-2 bg-[#E53935] text-white rounded-lg text-sm hover:bg-red-600 disabled:opacity-60"
              >
                Save & New
              </button>
              <button
                onClick={() => {
                  void handleSaveItem(true);
                }}
                disabled={isSavingItem || !addItemForm.itemName.trim() || !selectedUnit}
                className="px-4 py-2 bg-[#1976D2] text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-60"
              >
                {isSavingItem
                  ? 'Saving...'
                  : itemBeingEdited
                    ? 'Update'
                    : 'Save'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {stockAdjustmentForm ? (
        <div className="fixed inset-0 z-[115] flex items-center justify-center bg-black/45 p-3 sm:p-4">
          <div className="relative flex w-full max-w-[1040px] max-h-[92vh] flex-col overflow-hidden overflow-y-auto rounded-[14px] bg-white shadow-[0_20px_70px_rgba(15,23,42,0.25)]">
            <button
              type="button"
              onClick={closeStockAdjustmentDialog}
              className="absolute right-4 top-4 rounded-full p-1 text-[#96A0B5] transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close stock adjustment dialog"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-11 sm:px-6">
              <div className="flex items-center gap-6">
                <h2 className="text-[18px] font-semibold text-[#2F3A52]">Stock Adjustment</h2>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <button
                    type="button"
                    onClick={() =>
                      setStockAdjustmentForm((previousForm) =>
                        previousForm ? { ...previousForm, mode: 'add' } : previousForm,
                      )
                    }
                    className={`transition-colors ${
                      stockAdjustmentForm.mode === 'add'
                        ? 'text-[#1C78FF]'
                        : 'text-[#9AA5B5]'
                    }`}
                  >
                    Add Stock
                  </button>
                  <button
                    type="button"
                    aria-label="Toggle stock adjustment mode"
                    onClick={() =>
                      setStockAdjustmentForm((previousForm) =>
                        previousForm
                          ? {
                              ...previousForm,
                              mode: previousForm.mode === 'add' ? 'reduce' : 'add',
                            }
                          : previousForm,
                      )
                    }
                    className="relative h-7 w-12 rounded-full bg-[#1C78FF] shadow-inner"
                  >
                    <span
                      className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                        stockAdjustmentForm.mode === 'add' ? 'translate-x-0.5' : 'translate-x-[22px]'
                      }`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setStockAdjustmentForm((previousForm) =>
                        previousForm ? { ...previousForm, mode: 'reduce' } : previousForm,
                      )
                    }
                    className={`transition-colors ${
                      stockAdjustmentForm.mode === 'reduce'
                        ? 'text-[#1C78FF]'
                        : 'text-[#9AA5B5]'
                    }`}
                  >
                    Reduce Stock
                  </button>
                </div>
              </div>

              <div className="flex w-full max-w-[260px] flex-col items-start gap-1 sm:items-end">
                <label className="text-[12px] font-medium text-[#8B94A6]">Adjustment Date</label>
                <input
                  type="date"
                  value={stockAdjustmentForm.adjustmentDate}
                  onChange={(event) =>
                    setStockAdjustmentForm((previousForm) =>
                      previousForm
                        ? { ...previousForm, adjustmentDate: event.target.value }
                        : previousForm,
                    )
                  }
                  className="h-10 w-full rounded-md border border-[#D7DCE6] bg-white px-3 text-sm text-[#273246] outline-none ring-0 focus:border-[#1C78FF] sm:max-w-[190px]"
                />
              </div>
            </div>

            <div className="border-t border-[#E3E7EF] px-5 pb-5 pt-4 sm:px-6">
              <div className="mb-4">
                <div className="text-[12px] font-medium text-[#8B94A6]">Item Name</div>
                <div className="mt-1 text-[15px] font-semibold text-[#2F3A52]">
                  {stockAdjustmentForm.item?.name ?? ''}
                </div>
              </div>

              {stockAdjustmentForm.showBatches ? (
                <>
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full max-w-[240px]">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#AAB2C2]" />
                      <input
                        type="text"
                        value={stockAdjustmentForm.batchSearchTerm}
                        onChange={(event) =>
                          setStockAdjustmentForm((previousForm) =>
                            previousForm
                              ? { ...previousForm, batchSearchTerm: event.target.value }
                              : previousForm,
                          )
                        }
                        placeholder="Search"
                        className="h-10 w-full rounded border border-[#D7DCE6] bg-[#FAFAFB] pl-10 pr-3 text-sm text-[#273246] outline-none focus:border-[#1C78FF]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={addStockAdjustmentBatchRow}
                      className="inline-flex h-12 items-center gap-2 rounded-[8px] bg-[#F2F7FF] px-4 text-[14px] font-semibold text-[#1C78FF] shadow-[0_6px_16px_rgba(28,120,255,0.14)] transition-colors hover:bg-[#E6F0FF]"
                    >
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#1C78FF] text-[15px] leading-none">
                        +
                      </span>
                      Add Batch
                    </button>
                  </div>

                  <div className="overflow-hidden rounded-[2px] border border-[#D9DEE8]">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-white text-left text-[13px] text-[#2F3A52]">
                          <th className="border-b border-r border-[#D9DEE8] px-3 py-4 font-medium">Mfg. Date</th>
                          <th className="border-b border-r border-[#D9DEE8] px-3 py-4 font-medium">Exp. Date</th>
                          <th className="border-b border-r border-[#D9DEE8] px-3 py-4 font-medium">Size</th>
                          <th className="border-b border-r border-[#D9DEE8] px-3 py-4 font-medium">CURRENT QTY</th>
                          <th className="border-b border-r border-[#D9DEE8] px-3 py-4 font-medium">QTY</th>
                          <th className="border-b border-[#D9DEE8] px-3 py-4 font-medium" />
                        </tr>
                      </thead>
                      <tbody>
                        {stockAdjustmentForm.batchRows
                          .filter((row) => {
                            const normalizedSearch = stockAdjustmentForm.batchSearchTerm.trim().toLowerCase();
                            const rowText = [row.mfgDate, row.expDate, row.size, row.currentQty, row.qty]
                              .join(' ')
                              .toLowerCase();
                            return !normalizedSearch || rowText.includes(normalizedSearch);
                          })
                          .map((row, index) => {
                            const isBlankRow =
                              !row.mfgDate && !row.expDate && !row.size && !row.currentQty && !row.qty;

                            return (
                              <tr key={row.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFB]'}>
                                <td className="border-t border-r border-[#D9DEE8] px-2 py-2">
                                  <input
                                    type="date"
                                    value={row.mfgDate}
                                    onChange={(event) =>
                                      updateStockAdjustmentBatchRow(row.id, 'mfgDate', event.target.value)
                                    }
                                    className="h-9 w-full rounded border border-[#D7DCE6] px-2 text-sm outline-none focus:border-[#1C78FF]"
                                  />
                                </td>
                                <td className="border-t border-r border-[#D9DEE8] px-2 py-2">
                                  <input
                                    type="date"
                                    value={row.expDate}
                                    onChange={(event) =>
                                      updateStockAdjustmentBatchRow(row.id, 'expDate', event.target.value)
                                    }
                                    className="h-9 w-full rounded border border-[#D7DCE6] px-2 text-sm outline-none focus:border-[#1C78FF]"
                                  />
                                </td>
                                <td className="border-t border-r border-[#D9DEE8] px-2 py-2">
                                  <input
                                    type="text"
                                    value={row.size}
                                    onChange={(event) =>
                                      updateStockAdjustmentBatchRow(row.id, 'size', event.target.value)
                                    }
                                    placeholder="Size"
                                    className="h-9 w-full rounded border border-[#D7DCE6] px-2 text-sm outline-none focus:border-[#1C78FF]"
                                  />
                                </td>
                                <td className="border-t border-r border-[#D9DEE8] px-3 py-2 text-[#2F3A52]">
                                  <div className="h-9 rounded px-1 py-2 text-sm font-medium">
                                    {row.currentQty}
                                  </div>
                                </td>
                                <td className="border-t border-r border-[#D9DEE8] px-2 py-2">
                                  <input
                                    type="number"
                                    value={row.qty}
                                    onChange={(event) =>
                                      updateStockAdjustmentBatchRow(row.id, 'qty', event.target.value)
                                    }
                                    placeholder="0"
                                    className="h-9 w-full rounded border border-[#D7DCE6] px-2 text-sm outline-none focus:border-[#1C78FF]"
                                  />
                                </td>
                                <td className="border-t border-[#D9DEE8] px-2 py-2 text-center">
                                  {!isBlankRow ? (
                                    <button
                                      type="button"
                                      onClick={() => removeStockAdjustmentBatchRow(row.id)}
                                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#96A0B5] transition-colors hover:bg-slate-100 hover:text-slate-700"
                                      aria-label="Remove batch row"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  ) : null}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 flex flex-col items-end gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-[14px] text-[#2F3A52]">
                      Total <span className="ml-4 font-semibold">{stockAdjustmentForm.batchRows.reduce((sum, row) => sum + getInputNumberValue(row.qty), 0)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={saveStockAdjustment}
                      className="min-w-[98px] rounded-[6px] bg-[#1C78FF] px-6 py-3 text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(28,120,255,0.28)] transition-colors hover:bg-[#155fe0]"
                    >
                      Save
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid gap-6 sm:grid-cols-3">
                    <div className="sm:max-w-[180px]">
                      <label className="mb-1 block text-[12px] font-medium text-[#8B94A6]">Total Qty</label>
                      <input
                        type="number"
                        value={stockAdjustmentForm.totalQty}
                        onChange={(event) =>
                          setStockAdjustmentForm((previousForm) =>
                            previousForm
                              ? { ...previousForm, totalQty: event.target.value }
                              : previousForm,
                          )
                        }
                        placeholder="0"
                        className="h-10 w-full rounded-md border border-[#D7DCE6] bg-white px-3 text-sm text-[#273246] outline-none focus:border-[#1C78FF]"
                      />
                    </div>
                    <div className="sm:max-w-[220px]">
                      <label className="mb-1 block text-[12px] font-medium text-[#8B94A6]">At Price</label>
                      <input
                        type="number"
                        value={stockAdjustmentForm.atPrice}
                        onChange={(event) =>
                          setStockAdjustmentForm((previousForm) =>
                            previousForm
                              ? { ...previousForm, atPrice: event.target.value }
                              : previousForm,
                          )
                        }
                        placeholder="0"
                        className="h-10 w-full rounded-md border border-[#D7DCE6] bg-white px-3 text-sm text-[#273246] outline-none focus:border-[#1C78FF]"
                      />
                    </div>
                    <div className="w-full">
                      <label className="mb-1 block text-[12px] font-medium text-[#8B94A6]">Details</label>
                      <input
                        type="text"
                        value={stockAdjustmentForm.details}
                        onChange={(event) =>
                          setStockAdjustmentForm((previousForm) =>
                            previousForm
                              ? { ...previousForm, details: event.target.value }
                              : previousForm,
                          )
                        }
                        placeholder=""
                        className="h-10 w-full rounded-md border border-[#D7DCE6] bg-white px-3 text-sm text-[#273246] outline-none focus:border-[#1C78FF]"
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      type="button"
                      onClick={saveStockAdjustment}
                      className="min-w-[98px] rounded-[6px] bg-[#1C78FF] px-6 py-3 text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(28,120,255,0.28)] transition-colors hover:bg-[#155fe0]"
                    >
                      Save
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {showBatchDialog ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-5xl rounded-lg bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800">Add Stock - Batches</h3>
              <button
                type="button"
                onClick={() => setShowBatchDialog(false)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close batch popup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-4">
              <div className="overflow-hidden rounded border border-gray-200">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-white">
                      {showBatchMfgDate ? (
                        <th className="border-b border-r border-gray-200 px-3 py-3 text-left font-medium text-gray-700">Mfg. Date</th>
                      ) : null}
                      {showBatchExpDate ? (
                        <th className="border-b border-r border-gray-200 px-3 py-3 text-left font-medium text-gray-700">Exp. Date</th>
                      ) : null}
                      {showBatchSize ? (
                        <th className="border-b border-r border-gray-200 px-3 py-3 text-left font-medium text-gray-700">Size</th>
                      ) : null}
                      <th className="border-b border-r border-gray-200 px-3 py-3 text-left font-medium text-gray-700">OPENING QTY</th>
                      <th className="border-b border-gray-200 px-3 py-3 text-left font-medium text-gray-700" />
                    </tr>
                  </thead>
                  <tbody>
                    {batchRows.map((row) => (
                      <tr key={row.id} className="bg-gray-50">
                        {showBatchMfgDate ? (
                          <td className="border-t border-r border-gray-200 px-3 py-2">
                            <input
                              type="date"
                              value={row.mfgDate}
                              onChange={(event) => updateBatchRow(row.id, 'mfgDate', event.target.value)}
                              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                            />
                          </td>
                        ) : null}
                        {showBatchExpDate ? (
                          <td className="border-t border-r border-gray-200 px-3 py-2">
                            <input
                              type="date"
                              value={row.expDate}
                              onChange={(event) => updateBatchRow(row.id, 'expDate', event.target.value)}
                              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                            />
                          </td>
                        ) : null}
                        {showBatchSize ? (
                          <td className="border-t border-r border-gray-200 px-3 py-2">
                            <input
                              type="text"
                              value={row.size}
                              onChange={(event) => updateBatchRow(row.id, 'size', event.target.value)}
                              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                              placeholder="Size"
                            />
                          </td>
                        ) : null}
                        <td className="border-t border-r border-gray-200 px-3 py-2">
                          <input
                            type="number"
                            value={row.openingQty}
                            onChange={(event) => updateBatchRow(row.id, 'openingQty', event.target.value)}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                            placeholder="0"
                          />
                        </td>
                        <td className="border-t border-gray-200 px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeBatchRow(row.id)}
                            className="inline-flex items-center justify-center rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            aria-label="Delete batch row"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M3 6h18M8 6V4h8v2m-7 0l1 14h6l1-14M10 10v6M14 10v6"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={addBatchRow}
                  className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                >
                  Add Row
                </button>
                <div className="text-sm text-gray-700">
                  Total <span className="ml-3 font-semibold">{batchOpeningQtyTotal}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBatchDialog(false)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showAddItem && showItemSettingsPanel ? (
        <div className="fixed inset-0 z-[130]">
          <button
            type="button"
            className="absolute inset-0 h-full w-full cursor-default bg-black/10"
            onClick={closeItemSettingsPanel}
            aria-label="Close item settings backdrop"
          />
          <div className="absolute inset-y-0 right-0 z-[131] flex w-full max-w-[420px] flex-col border-l border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <h3 className="text-base font-semibold text-gray-900">Item Settings</h3>
            <button
              type="button"
              onClick={closeItemSettingsPanel}
              className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close item settings"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="space-y-1">
              {[
                'Wholesale Price',
                'Mfg Date',
                'Exp Date',
                'Size',
              ].map((label) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-lg px-1 py-3 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <span>{label}</span>
                  {label === 'Mfg Date' ? (
                    <input
                      type="checkbox"
                      checked={draftBatchMfgDate}
                      onChange={(event) => setDraftBatchMfgDate(event.target.checked)}
                      className="h-5 w-5 rounded border-gray-300 text-blue-600"
                      aria-label={label}
                    />
                  ) : label === 'Exp Date' ? (
                    <input
                      type="checkbox"
                      checked={draftBatchExpDate}
                      onChange={(event) => setDraftBatchExpDate(event.target.checked)}
                      className="h-5 w-5 rounded border-gray-300 text-blue-600"
                      aria-label={label}
                    />
                  ) : label === 'Size' ? (
                    <input
                      type="checkbox"
                      checked={draftBatchSize}
                      onChange={(event) => setDraftBatchSize(event.target.checked)}
                      className="h-5 w-5 rounded border-gray-300 text-blue-600"
                      aria-label={label}
                    />
                  ) : (
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-5 w-5 rounded border-gray-300 text-blue-600"
                      aria-label={label}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-200 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
              >
                <Settings2 className="h-4 w-4" />
                More Settings
              </button>
              {hasDraftBatchChanges ? (
                <button
                  type="button"
                  onClick={saveItemSettingsChanges}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Save
                </button>
              ) : null}
            </div>
          </div>
          </div>
        </div>
      ) : null}

      <Dialog
        open={Boolean(itemPendingDelete)}
        onOpenChange={(isOpen: boolean) => {
          if (!isOpen && !isDeletingItem) {
            setItemPendingDelete(null);
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {itemPendingDelete
                ? `Are you sure you want to delete ${itemPendingDelete.name}? This action cannot be undone.`
                : 'Are you sure you want to delete this item?'}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={isDeletingItem}
                onClick={() => setItemPendingDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingItem || !itemPendingDelete}
                onClick={() => {
                  if (!itemPendingDelete) {
                    return;
                  }

                  void handleDeleteItem(itemPendingDelete);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60"
              >
                {isDeletingItem ? 'Deleting...' : 'Delete'}
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

      <Dialog
        open={showMoveItemsDialog}
        onOpenChange={(isOpen: boolean) => {
          setShowMoveItemsDialog(isOpen);
          if (!isOpen && !isMovingItems) {
            setSelectedMoveItemIds([]);
            setMoveItemsFilterCategoryId('all');
            setMoveItemsSearchTerm('');
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                Move Items To {moveTargetCategoryName ?? 'Items Not In Any Category'}
              </span>
              <button
                type="button"
                onClick={() => setShowMoveItemsDialog(false)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close move items popup"
              >
                <X className="h-4 w-4" />
              </button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Search Items
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={moveItemsSearchTerm}
                    onChange={(event) => setMoveItemsSearchTerm(event.target.value)}
                    placeholder="Search by item name, code, or category"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pl-9 text-sm"
                  />
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#AEB8C4]" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Filter By Category
                </label>
                <select
                  value={moveItemsFilterCategoryId}
                  onChange={(event) => setMoveItemsFilterCategoryId(event.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">All Items</option>
                  <option value="uncategorized">Items not in any Category</option>
                  {categoryList.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto rounded-lg border border-[#E3EAF2]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-[#F7F9FB]">
                  <tr>
                    <th className="w-12 px-4 py-3 text-left"></th>
                    <th className="px-4 py-3 text-left font-semibold text-[#7B8A9A] text-xs tracking-wide">
                      ITEM
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-[#7B8A9A] text-xs tracking-wide">
                      CURRENT CATEGORY
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {moveItemsFilteredList.length ? (
                    moveItemsFilteredList.map((item) => {
                      const isSelected = selectedMoveItemIds.includes(item.id);
                      const isAlreadyInTargetCategory = item.category === moveTargetCategoryName;

                      return (
                        <tr
                          key={item.id}
                          onClick={() => {
                            if (!isAlreadyInTargetCategory) {
                              toggleMoveItemSelection(item.id);
                            }
                          }}
                          className={`border-b border-[#E3EAF2] ${
                            isAlreadyInTargetCategory
                              ? 'bg-gray-50 text-gray-400'
                              : 'cursor-pointer hover:bg-[#F5F8FA]'
                          } ${isSelected ? 'bg-[#E3F0FF]' : ''}`}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isAlreadyInTargetCategory}
                              onChange={() => toggleMoveItemSelection(item.id)}
                              onClick={(event) => event.stopPropagation()}
                              className="h-4 w-4"
                            />
                          </td>
                          <td className="px-4 py-3 font-medium text-[#222B45]">
                            {item.name}
                          </td>
                          <td className="px-4 py-3 text-[#4B5563]">
                            {item.category ?? 'Items not in any Category'}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-6 text-center text-sm text-[#7B8A9A]"
                      >
                        There are no items to show.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowMoveItemsDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleMoveItemsToCategory();
                }}
                disabled={isMovingItems || !selectedMoveItemIds.length}
                className="px-4 py-2 bg-[#1976D2] text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-60"
              >
                {isMovingItems ? 'Moving...' : 'Move Selected Items'}
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

      {/* Add Unit Modal */}
      <Dialog
        open={showAddUnit}
        onOpenChange={(isOpen: boolean) => {
          setShowAddUnit(isOpen);
          if (!isOpen) {
            setUnitBeingEdited(null);
            setAddUnitFullName('');
            setAddUnitShortName('');
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{unitBeingEdited ? 'Edit Unit' : 'Add Unit'}</span>
              <button
                type="button"
                onClick={() => setShowAddUnit(false)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close add unit popup"
              >
                <X className="h-4 w-4" />
              </button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={addUnitFullName}
                onChange={(event) => setAddUnitFullName(event.target.value)}
                placeholder="e.g. KILOGRAMS"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={addUnitShortName}
                onChange={(event) => setAddUnitShortName(event.target.value)}
                placeholder="e.g. Kg"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddUnit(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => { void handleCreateUnit(); }}
                disabled={isSavingUnit || !addUnitFullName.trim() || !addUnitShortName.trim()}
                className="px-4 py-2 bg-[#1976D2] text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-60"
              >
                {isSavingUnit ? 'Saving...' : unitBeingEdited ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(unitPendingDelete)}
        onOpenChange={(isOpen: boolean) => {
          if (!isOpen && !isDeletingUnit) {
            setUnitPendingDelete(null);
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Unit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {unitPendingDelete
                ? `Are you sure you want to delete ${unitPendingDelete.fullName}? This action cannot be undone.`
                : 'Are you sure you want to delete this unit?'}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={isDeletingUnit}
                onClick={() => setUnitPendingDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingUnit || !unitPendingDelete}
                onClick={() => {
                  if (!unitPendingDelete) {
                    return;
                  }

                  void handleDeleteUnit(unitPendingDelete);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60"
              >
                {isDeletingUnit ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
