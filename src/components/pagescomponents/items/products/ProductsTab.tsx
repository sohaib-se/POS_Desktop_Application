import { useEffect, useMemo, useRef, useState } from "react";
import { Package, Plus } from "lucide-react";

import type {
  Item,
  ItemApiRecord,
  AddItemFormState,
  CategoryRecord,
  UnitRecord,
  ItemTransactionRow,
  ItemTransactionLine,
  ItemTransactionApiRecord,
  ItemContextMenuState,
  AdjustStockForm,
} from "./types";

import { ProductList } from "./ProductList";
import { ItemContextMenu } from "./ItemContextMenu";
import { ItemDetailCard } from "./ItemDetailCard";
import { TransactionsCard } from "./TransactionsCard";
import { AddItemModal } from "./AddItemModal";
import { DeleteItemModal } from "./DeleteItemModal";
import { AdjustStockModal } from "./AdjustStockModal";
import { StockDetailsModal } from "./StockDetailsModal";

// ---- Helper functions ----

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
  mfgDate: "",
  expDate: "",
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
  secondaryStock: record.secondary_stock,
  conversionRate: record.conversion_rate,
  minStock: record.min_stock,
  salePrice: Number(record.sale_price ?? 0),
  wholesalePrice: Number(record.wholesale_price ?? 0),
  purchasePrice: Number(record.purchase_price ?? 0),
  atPrice: record.at_price != null ? Number(record.at_price) : undefined,
  stockQuantity: Number(record.stock_quantity ?? 0),
  stockValue: Number(record.stock_value ?? 0),
  mfgDate: record.mfg_date ?? null,
  expDate: record.exp_date ?? null,
});

const getUnitIdFromLabel = (
  unitLabel: string | null | undefined,
  units: UnitRecord[]
) => {
  if (!unitLabel) return "";
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

const getInputNumberValue = (value: string) => {
  const trimmedValue = value.trim();
  if (!trimmedValue) return 0;
  const parsedValue = Number(trimmedValue);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const resolveStockValueFromPrices = (
  quantity: number,
  atPrice: string,
  purchasePrice: number
) => {
  const parsedAtPrice = getInputNumberValue(atPrice);
  const resolvedUnitPrice =
    parsedAtPrice > 0
      ? parsedAtPrice
      : Number.isFinite(purchasePrice) && purchasePrice > 0
        ? purchasePrice
        : 0;
  return quantity * resolvedUnitPrice;
};

const getContextMenuStyle = (
  x: number,
  y: number
): React.CSSProperties => {
  if (typeof window === "undefined") return { left: x, top: y };
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

const parseLineItems = (lineItemsJson?: string | null): ItemTransactionLine[] => {
  if (!lineItemsJson) return [];
  try {
    const parsedValue = JSON.parse(lineItemsJson) as unknown;
    return Array.isArray(parsedValue) ? (parsedValue as ItemTransactionLine[]) : [];
  } catch {
    return [];
  }
};

const normalizeTransactionType = (
  transactionType?: string | null
): ItemTransactionRow["type"] => {
  const normalizedType = String(transactionType ?? "").toLowerCase();
  return normalizedType.includes("purchase") ? "Purchase" : "Sale";
};

const normalizeTransactionStatus = (
  status?: string | null,
  balance = 0
): ItemTransactionRow["status"] => {
  if (
    status === "Paid" ||
    status === "Unpaid" ||
    status === "Open" ||
    status === "Cancelled"
  ) {
    return status;
  }
  return balance === 0 ? "Paid" : "Unpaid";
};

// ---- Props ----

type ProductsTabProps = {
  units: UnitRecord[];
  categoryList: CategoryRecord[];
  setCategoryList: React.Dispatch<React.SetStateAction<CategoryRecord[]>>;
  onOpenAddCategory: (onCreated?: (categoryId: string) => void) => void;
  onOpenUnitSelector: (
    opts: {
      selectedUnitId: string;
      baseUnitId: string;
      secondaryUnitId: string;
      conversionRate: number;
      onSave: (result: {
        selectedUnitId: string;
        baseUnitId: string;
        secondaryUnitId: string;
        conversionRate: number;
      }) => void;
    }
  ) => void;
};

export function ProductsTab({
  units,
  categoryList,
  setCategoryList,
  onOpenAddCategory,
  onOpenUnitSelector,
}: ProductsTabProps) {
  // ---- State ----
  const [itemList, setItemList] = useState<Item[]>([]);
  const [isItemsLoading, setIsItemsLoading] = useState(true);
  const cachedHasItems = localStorage.getItem("items_hasItems") !== "false";
  const [hasItemsCache, setHasItemsCache] = useState(cachedHasItems);

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [itemBeingEdited, setItemBeingEdited] = useState<Item | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);
  const [itemPendingDelete, setItemPendingDelete] = useState<Item | null>(null);
  const [itemContextMenu, setItemContextMenu] = useState<ItemContextMenuState | null>(null);
  const [addItemForm, setAddItemForm] = useState<AddItemFormState>(getInitialAddItemFormState());
  const [addItemTab, setAddItemTab] = useState<"pricing" | "stock">("pricing");
  const [addItemImageDataUrl, setAddItemImageDataUrl] = useState<string | null>(null);
  const [addItemImageFileName, setAddItemImageFileName] = useState("");
  const [addItemExistingImagePath, setAddItemExistingImagePath] = useState<string | null>(null);

  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [baseUnitId, setBaseUnitId] = useState<string>("");
  const [secondaryUnitId, setSecondaryUnitId] = useState<string>("");
  const [conversionRate, setConversionRate] = useState<number>(0);

  const [itemTransactions, setItemTransactions] = useState<ItemTransactionRow[]>([]);
  const [transactionSearchTerm, setTransactionSearchTerm] = useState("");
  const [showTransactionSearch, setShowTransactionSearch] = useState(false);

  const [showAdjustStockModal, setShowAdjustStockModal] = useState(false);
  const [adjustStockForm, setAdjustStockForm] = useState<AdjustStockForm>({
    type: "Add",
    date: new Date().toISOString().split("T")[0],
    qty: "",
    unit: "",
    atPrice: "",
    details: "",
  });
  const [isSavingAdjustment, setIsSavingAdjustment] = useState(false);

  const [showStockDetailsPopup, setShowStockDetailsPopup] = useState(false);

  const [isProductSearchActive, setIsProductSearchActive] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const productSearchInputRef = useRef<HTMLInputElement | null>(null);

  // ---- Derived ----
  const selectedUnit = units.find((u) => u.id === selectedUnitId);
  const baseUnit = units.find((u) => u.id === baseUnitId);
  const secondaryUnit = units.find((u) => u.id === secondaryUnitId);

  const normalizedProductSearchTerm = productSearchTerm.trim().toLowerCase();
  const filteredProductList = itemList.filter((item) => {
    if (!normalizedProductSearchTerm) return true;
    return [item.name, item.code ?? "", item.category ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(normalizedProductSearchTerm);
  });

  const selectedItemTransactions = useMemo(() => {
    if (!selectedItem) return [] as ItemTransactionRow[];
    const normalizedSelectedName = selectedItem.name.trim().toLowerCase();
    return itemTransactions.filter(
      (t) =>
        t.itemId === selectedItem.id ||
        t.itemName.trim().toLowerCase() === normalizedSelectedName
    );
  }, [itemTransactions, selectedItem]);

  const filteredItemTransactions = selectedItemTransactions.filter((t) => {
    if (!transactionSearchTerm) return true;
    const term = transactionSearchTerm.toLowerCase();
    return (
      (t.invoiceNo && t.invoiceNo.toLowerCase().includes(term)) ||
      (t.date && t.date.toLowerCase().includes(term)) ||
      (t.type && t.type.toLowerCase().includes(term)) ||
      t.amount.toString().includes(term) ||
      t.balance.toString().includes(term)
    );
  });

  const showEmptyState = !isItemsLoading
    ? itemList.length === 0
    : !hasItemsCache;

  // ---- Effects ----
  useEffect(() => {
    const loadItems = async () => {
      setIsItemsLoading(true);
      try {
        const response = await fetch("/api/items");
        if (!response.ok) throw new Error("Failed to load items");
        const itemRows = (await response.json()) as ItemApiRecord[];
        const mappedItems = itemRows.map(mapItemApiRecord);
        setItemList(mappedItems);
        const hasItems = mappedItems.length > 0;
        setHasItemsCache(hasItems);
        localStorage.setItem("items_hasItems", hasItems ? "true" : "false");
      } catch (error) {
        console.error(error);
      } finally {
        setIsItemsLoading(false);
      }
    };
    void loadItems();
  }, []);

  useEffect(() => {
    const loadItemTransactions = async () => {
      try {
        const [saleRes, purchaseRes, adjustRes] = await Promise.all([
          fetch("/api/sale_invoices"),
          fetch("/api/purchase_bills"),
          fetch("/api/adjust_stock_transactions"),
        ]);
        const saleInvoices = saleRes.ok
          ? ((await saleRes.json()) as ItemTransactionApiRecord[])
          : [];
        const purchaseBills = purchaseRes.ok
          ? ((await purchaseRes.json()) as ItemTransactionApiRecord[])
          : [];
        const adjustStockTx = adjustRes.ok
          ? ((await adjustRes.json()) as Record<string, unknown>[])
          : [];

        const nextTransactions = [...saleInvoices, ...purchaseBills].flatMap(
          (invoice): ItemTransactionRow[] => {
            const lineItems = parseLineItems(invoice.line_items_json);
            const transactionType = normalizeTransactionType(
              invoice.transaction_type
            );
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
                  Number(lineItem.quantity ?? 0) * Number(lineItem.price ?? 0)
              ),
              balance,
              status,
              itemId: lineItem.itemId ?? undefined,
              itemName: lineItem.name ?? "",
            }));
          }
        );

        const adjustTransactions: ItemTransactionRow[] = adjustStockTx.map(
          (adj) => ({
            id: `adj-${adj.id as string}`,
            type: adj.adjustment_type as ItemTransactionRow["type"],
            invoiceNo: "",
            partyName: "Stock Adjustment",
            date: adj.date as string,
            quantity: Number(adj.quantity ?? 0),
            unit: (adj.unit as string) ?? "",
            price: Number(adj.at_price ?? 0),
            amount: Number(adj.quantity ?? 0) * Number(adj.at_price ?? 0),
            balance: 0,
            status: "Paid",
            itemId: adj.item_id as string,
            itemName: adj.item_name as string,
          })
        );

        setItemTransactions(
          [...nextTransactions, ...adjustTransactions].sort(
            (a, b) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        );
      } catch (error) {
        console.error(error);
        setItemTransactions([]);
      }
    };
    void loadItemTransactions();
  }, []);

  useEffect(() => {
    setSelectedItem((prev) => {
      if (!itemList.length) return null;
      if (prev) {
        const updated = itemList.find((i) => i.id === prev.id);
        if (updated) return updated;
      }
      return itemList[0];
    });
  }, [itemList]);

  useEffect(() => {
    if (!itemContextMenu) return;
    const closeMenu = () => setItemContextMenu(null);
    window.addEventListener("click", closeMenu);
    window.addEventListener("resize", closeMenu);
    window.addEventListener("scroll", closeMenu, true);
    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("resize", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
    };
  }, [itemContextMenu]);

  useEffect(() => {
    if (isProductSearchActive) {
      productSearchInputRef.current?.focus();
    }
  }, [isProductSearchActive]);

  // ---- Handlers ----

  const openAdjustStockDialog = (item: Item) => {
    setAdjustStockForm({
      type: "Add",
      date: new Date().toISOString().split("T")[0],
      qty: "",
      unit: item.primaryUnit || item.unit || "Unit",
      atPrice: "",
      details: "",
    });
    setShowAdjustStockModal(true);
  };

  const handleSaveStockAdjustment = async () => {
    if (!selectedItem || !adjustStockForm.qty || isSavingAdjustment) return;
    setIsSavingAdjustment(true);
    try {
      const qty = Number(adjustStockForm.qty);
      const atPrice = Number(adjustStockForm.atPrice) || 0;
      let baseQtyChange = qty;
      const isSecondary = adjustStockForm.unit === selectedItem.secondaryUnit;
      if (isSecondary && selectedItem.conversionRate) {
        baseQtyChange = qty / selectedItem.conversionRate;
      }
      const isAdd = adjustStockForm.type === "Add";
      const stockChange = isAdd ? baseQtyChange : -baseQtyChange;
      const newStockQuantity = selectedItem.stockQuantity + stockChange;
      let newSecondaryStock = selectedItem.secondaryStock ?? 0;
      if (selectedItem.conversionRate) {
        newSecondaryStock = newStockQuantity * selectedItem.conversionRate;
      }
      const valueChange = qty * atPrice;
      const newValueChange = isAdd ? valueChange : -valueChange;
      const newStockValue = selectedItem.stockValue + newValueChange;
      const finalStockValue = Math.max(0, newStockValue);

      const payload = {
        id: selectedItem.id,
        name: selectedItem.name,
        code: selectedItem.code,
        category: selectedItem.category,
        salePrice: selectedItem.salePrice,
        wholesalePrice: selectedItem.wholesalePrice,
        purchasePrice: selectedItem.purchasePrice,
        stockQuantity: newStockQuantity,
        unit: selectedItem.unit,
        primaryUnit: selectedItem.primaryUnit,
        secondaryUnit: selectedItem.secondaryUnit,
        stockValue: finalStockValue,
        minStock: selectedItem.minStock,
        secondaryStock: newSecondaryStock,
        conversionRate: selectedItem.conversionRate,
      };

      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to adjust stock");

      const adjustPayload = {
        itemId: selectedItem.id,
        itemName: selectedItem.name,
        adjustmentType: adjustStockForm.type + " Stock",
        date: adjustStockForm.date,
        quantity: qty,
        unit: adjustStockForm.unit,
        atPrice: atPrice,
        details: adjustStockForm.details,
      };
      const adjustResponse = await fetch("/api/adjust_stock_transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adjustPayload),
      });
      if (adjustResponse.ok) {
        const createdAdjustTx = (await adjustResponse.json()) as Record<string, unknown>;
        const newTransaction: ItemTransactionRow = {
          id: `adj-${createdAdjustTx.id as string}`,
          type: createdAdjustTx.adjustmentType as ItemTransactionRow["type"],
          invoiceNo: "",
          partyName: "Stock Adjustment",
          date: createdAdjustTx.date as string,
          quantity: Number(createdAdjustTx.quantity ?? 0),
          unit: (createdAdjustTx.unit as string) || "",
          price: Number(createdAdjustTx.atPrice ?? 0),
          amount:
            Number(createdAdjustTx.quantity ?? 0) *
            Number(createdAdjustTx.atPrice ?? 0),
          balance: 0,
          status: "Paid",
          itemId: createdAdjustTx.itemId as string,
          itemName: createdAdjustTx.itemName as string,
        };
        setItemTransactions((prev) =>
          [newTransaction, ...prev].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        );
      }

      const createdItemPayload = (await response.json()) as Record<string, unknown>;
      const updatedItem: Item = {
        ...selectedItem,
        stockQuantity: Number(createdItemPayload.stockQuantity ?? newStockQuantity),
        stockValue: Number(createdItemPayload.stockValue ?? finalStockValue),
        secondaryStock:
          createdItemPayload.secondaryStock != null
            ? Number(createdItemPayload.secondaryStock)
            : newSecondaryStock,
        conversionRate: selectedItem.conversionRate,
      };
      setItemList((prev) =>
        prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      );
      setSelectedItem(updatedItem);
      setShowAdjustStockModal(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSavingAdjustment(false);
    }
  };

  const handlePrintTransactions = () => {
    if (!selectedItem) return;
    const iframe = document.createElement("iframe");
    iframe.style.cssText =
      "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
    document.body.appendChild(iframe);
    const html = `
      <html><head><title>Transactions - ${selectedItem.name}</title>
      <style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f2f2f2}</style>
      </head><body><h2>Transactions - ${selectedItem.name}</h2>
      <table><thead><tr><th>Type</th><th>Number</th><th>Date</th><th>Total</th><th>Balance</th></tr></thead>
      <tbody>${filteredItemTransactions.map((t) => `<tr><td>${t.type}</td><td>${t.invoiceNo || ""}</td><td>${t.date}</td><td>Rs ${t.amount.toFixed(2)}</td><td>Rs ${t.balance.toFixed(2)}</td></tr>`).join("")}</tbody>
      </table></body></html>`;
    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
      }, 250);
    } else {
      document.body.removeChild(iframe);
    }
  };

  const handleExportExcel = () => {
    if (!selectedItem) return;
    const headers = ["Type", "Number", "Date", "Total", "Balance"];
    const rows = filteredItemTransactions.map((t) => [
      t.type,
      t.invoiceNo || "",
      t.date,
      t.amount.toFixed(2),
      t.balance.toFixed(2),
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${selectedItem.name}_transactions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openAddItemModal = () => {
    setAddItemTab("pricing");
    setAddItemForm(getInitialAddItemFormState());
    setItemBeingEdited(null);
    setSelectedUnitId("");
    setBaseUnitId("");
    setSecondaryUnitId("");
    setConversionRate(0);
    setAddItemImageDataUrl(null);
    setAddItemImageFileName("");
    setAddItemExistingImagePath(null);
    setShowAddItem(true);
  };

  const openEditItemDialog = (item: Item) => {
    const matchedCategory = categoryList.find((c) => c.name === item.category);
    const matchedUnitId = getUnitIdFromLabel(item.unit, units);
    const matchedPrimaryUnitId = getUnitIdFromLabel(
      item.primaryUnit ?? item.unit,
      units
    );
    const matchedSecondaryUnitId = getUnitIdFromLabel(item.secondaryUnit, units);
    setItemBeingEdited(item);
    setAddItemTab("pricing");
    setAddItemForm({
      itemName: item.name,
      categoryId: matchedCategory?.id ?? "",
      itemCode: item.code ?? "",
      salePrice: String(item.salePrice ?? ""),
      wholesalePrice: String(item.wholesalePrice ?? ""),
      purchasePrice: String(item.purchasePrice ?? ""),
      minWholesaleQty:
        item.minStock === null || item.minStock === undefined
          ? ""
          : String(item.minStock),
      openingStock: String(item.stockQuantity ?? ""),
      atPrice: item.atPrice != null ? String(item.atPrice) : "",
      asOfDate: "",
      mfgDate: item.mfgDate ?? "",
      expDate: item.expDate ?? "",
    });
    setSelectedUnitId(matchedPrimaryUnitId || matchedUnitId);
    setBaseUnitId(matchedPrimaryUnitId || matchedUnitId);
    setSecondaryUnitId(matchedSecondaryUnitId);
    setConversionRate(item.conversionRate ?? 0);
    setAddItemImageDataUrl(null);
    setAddItemImageFileName("");
    setAddItemExistingImagePath(item.imgPath ?? null);
    setShowAddItem(true);
  };

  const handleAddItemImageSelection = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      setAddItemImageDataUrl(null);
      setAddItemImageFileName("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      setAddItemImageDataUrl(result);
      setAddItemImageFileName(file.name);
    };
    reader.onerror = () => {
      setAddItemImageDataUrl(null);
      setAddItemImageFileName("");
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteItem = async (item: Item) => {
    if (isDeletingItem) return;
    setIsDeletingItem(true);
    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete item");
      setItemList((prev) => prev.filter((entry) => entry.id !== item.id));
      if (item.category) {
        setCategoryList((prev) =>
          prev.map((cat) =>
            cat.name === item.category
              ? { ...cat, itemCount: Math.max(0, cat.itemCount - 1) }
              : cat
          )
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
    if (isSavingItem) return;
    const normalizedName = addItemForm.itemName.trim();
    if (!normalizedName || !selectedUnit) return;

    const openingStock = Number(addItemForm.openingStock) || 0;
    const salePrice = Number(addItemForm.salePrice) || 0;
    const purchasePrice = Number(addItemForm.purchasePrice) || 0;
    const minWholesaleQty = Number(addItemForm.minWholesaleQty) || 0;
    const openingStockValue = resolveStockValueFromPrices(
      openingStock,
      addItemForm.atPrice,
      purchasePrice
    );
    const selectedItemCategory = categoryList.find(
      (c) => c.id === addItemForm.categoryId
    );
    const previousCategoryName = itemBeingEdited?.category ?? null;
    const currentCategoryName = selectedItemCategory?.name ?? null;
    const mfgDate = addItemForm.mfgDate || null;
    const expDate = addItemForm.expDate || null;

    const payload = {
      id: itemBeingEdited?.id,
      name: normalizedName,
      code: addItemForm.itemCode.trim() || null,
      category: currentCategoryName,
      salePrice,
      wholesalePrice: Number(addItemForm.wholesalePrice) || 0,
      purchasePrice,
      atPrice: addItemForm.atPrice !== "" ? Number(addItemForm.atPrice) : null,
      stockQuantity: openingStock,
      unit: `${selectedUnit.fullName} (${selectedUnit.shortName})`,
      primaryUnit: baseUnit
        ? `${baseUnit.fullName} (${baseUnit.shortName})`
        : null,
      secondaryUnit: secondaryUnit
        ? `${secondaryUnit.fullName} (${secondaryUnit.shortName})`
        : null,
      conversionRate: Number(conversionRate) || 0,
      imgPath: addItemExistingImagePath,
      imageDataUrl: addItemImageDataUrl,
      imageFileName: addItemImageFileName,
      mfgDate,
      expDate,
      stockValue: openingStockValue,
      minStock: minWholesaleQty,
    };

    setIsSavingItem(true);
    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to create item");

      const createdItemPayload = (await response.json()) as {
        id: string;
        name: string;
        code?: string | null;
        category?: string | null;
        unit?: string | null;
        primaryUnit?: string | null;
        secondaryUnit?: string | null;
        conversionRate?: number | null;
        imgPath?: string | null;
        minStock?: number | null;
        salePrice: number;
        wholesalePrice?: number;
        purchasePrice: number;
        stockQuantity: number;
        stockValue: number;
        secondaryStock?: number | null;
        mfgDate?: string | null;
        expDate?: string | null;
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
        conversionRate:
          createdItemPayload.conversionRate ?? (Number(conversionRate) || null),
        imgPath: createdItemPayload.imgPath ?? addItemExistingImagePath,
        mfgDate: createdItemPayload.mfgDate ?? mfgDate,
        expDate: createdItemPayload.expDate ?? expDate,
        minStock:
          createdItemPayload.minStock ??
          (minWholesaleQty === 0 ? null : minWholesaleQty),
        salePrice: Number(createdItemPayload.salePrice ?? salePrice),
        wholesalePrice: Number(
          createdItemPayload.wholesalePrice ??
            (Number(addItemForm.wholesalePrice) || 0)
        ),
        purchasePrice: Number(
          createdItemPayload.purchasePrice ?? purchasePrice
        ),
        stockQuantity: Number(
          createdItemPayload.stockQuantity ?? openingStock
        ),
        stockValue: Number(
          createdItemPayload.stockValue ?? openingStockValue
        ),
        secondaryStock:
          createdItemPayload.secondaryStock ??
          Number(createdItemPayload.stockQuantity ?? openingStock) *
            (Number(conversionRate) || 0),
      };

      setItemList((prev) => {
        const hasExisting = prev.some((i) => i.id === createdItem.id);
        const next = hasExisting
          ? prev.map((i) => (i.id === createdItem.id ? createdItem : i))
          : [...prev, createdItem];
        return next.sort((a, b) => a.name.localeCompare(b.name));
      });
      setSelectedItem(createdItem);

      if (!itemBeingEdited && selectedItemCategory) {
        setCategoryList((prev) =>
          prev.map((cat) =>
            cat.id === selectedItemCategory.id
              ? { ...cat, itemCount: cat.itemCount + 1 }
              : cat
          )
        );
      }

      if (itemBeingEdited && previousCategoryName !== currentCategoryName) {
        setCategoryList((prev) =>
          prev.map((cat) => {
            if (previousCategoryName && cat.name === previousCategoryName)
              return { ...cat, itemCount: Math.max(0, cat.itemCount - 1) };
            if (currentCategoryName && cat.name === currentCategoryName)
              return { ...cat, itemCount: cat.itemCount + 1 };
            return cat;
          })
        );
      }

      setAddItemForm(getInitialAddItemFormState());
      setItemBeingEdited(null);
      setSelectedUnitId("");
      setBaseUnitId("");
      setSecondaryUnitId("");
      setConversionRate(0);
      setAddItemImageDataUrl(null);
      setAddItemImageFileName("");
      setAddItemExistingImagePath(null);
      setAddItemTab("pricing");

      if (closeAfterSave) setShowAddItem(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSavingItem(false);
    }
  };

  // ---- Render ----

  if (showEmptyState) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center w-full h-full text-center py-12 px-4 bg-white m-1 rounded-md shadow-sm">
        <div className="w-32 h-32 mx-auto mb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl transform rotate-6" />
          <div className="absolute inset-0 bg-white rounded-2xl shadow-lg flex items-center justify-center">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
            <span className="text-blue-800 text-lg font-bold">I</span>
          </div>
          <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-blue-300 rounded-full flex items-center justify-center">
            <span className="text-blue-800 text-sm font-bold">i</span>
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Manage Your Items
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Keep track of all your products, services, and inventory in one place.
          Add your first item to get started.
        </p>
        <button
          onClick={() => setShowAddItem(true)}
          className="bg-[#E53935] hover:bg-red-600 text-white px-8 py-3 rounded-full text-base font-medium inline-flex items-center gap-2 transition-colors shadow-sm hover:shadow"
        >
          <Plus className="w-5 h-5" />
          Add First Item
        </button>

        {/* Modals available even in empty state */}
        <AddItemModal
          open={showAddItem}
          onOpenChange={(isOpen) => {
            setShowAddItem(isOpen);
            if (!isOpen) {
              setAddItemTab("pricing");
              setAddItemForm(getInitialAddItemFormState());
              setItemBeingEdited(null);
              setSelectedUnitId("");
              setBaseUnitId("");
              setSecondaryUnitId("");
              setConversionRate(0);
              setAddItemImageDataUrl(null);
              setAddItemImageFileName("");
              setAddItemExistingImagePath(null);
            }
          }}
          itemBeingEdited={itemBeingEdited}
          addItemForm={addItemForm}
          onFormChange={(field, value) =>
            setAddItemForm((prev) => ({ ...prev, [field]: value }))
          }
          addItemTab={addItemTab}
          onSetAddItemTab={setAddItemTab}
          categoryList={categoryList}
          units={units}
          selectedUnit={selectedUnit}
          isSavingItem={isSavingItem}
          addItemImageFileName={addItemImageFileName}
          addItemImageDataUrl={addItemImageDataUrl}
          addItemExistingImagePath={addItemExistingImagePath}
          onImageSelection={handleAddItemImageSelection}
          onOpenUnitSelector={() =>
            onOpenUnitSelector({
              selectedUnitId,
              baseUnitId,
              secondaryUnitId,
              conversionRate,
              onSave: (result) => {
                setSelectedUnitId(result.selectedUnitId || result.baseUnitId);
                setBaseUnitId(result.baseUnitId);
                setSecondaryUnitId(result.secondaryUnitId);
                setConversionRate(result.conversionRate);
              },
            })
          }
          onOpenAddCategory={() => onOpenAddCategory((id) => setAddItemForm((prev) => ({ ...prev, categoryId: id })))}
          onSaveItem={(close) => { void handleSaveItem(close); }}
        />
      </div>
    );
  }

  if (isItemsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white m-1 rounded-md shadow-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53935]"></div>
      </div>
    );
  }

  return (
    <>
      {/* Left Panel + Right Panel */}
      <ProductList
        filteredProductList={filteredProductList}
        selectedItem={selectedItem}
        isProductSearchActive={isProductSearchActive}
        productSearchTerm={productSearchTerm}
        productSearchInputRef={productSearchInputRef}
        onSetSelectedItem={setSelectedItem}
        onSetItemContextMenu={setItemContextMenu}
        onSetIsProductSearchActive={setIsProductSearchActive}
        onSetProductSearchTerm={setProductSearchTerm}
        onAddItem={openAddItemModal}
      />

      {itemContextMenu && (
        <ItemContextMenu
          itemContextMenu={itemContextMenu}
          getContextMenuStyle={getContextMenuStyle}
          onEdit={(menu) => {
            setSelectedItem(menu.item);
            openEditItemDialog(menu.item);
          }}
          onDelete={(menu) => {
            setItemPendingDelete(menu.item);
          }}
          onClose={() => setItemContextMenu(null)}
        />
      )}

      {/* Right Panel */}
      <div className="flex-1 flex flex-col" style={{ marginRight: "4px" }}>
        {selectedItem && (
          <>
            <ItemDetailCard
              selectedItem={selectedItem}
              onStockDetails={() => setShowStockDetailsPopup(true)}
              onAdjustItem={openAdjustStockDialog}
            />
            <TransactionsCard
              filteredItemTransactions={filteredItemTransactions}
              showTransactionSearch={showTransactionSearch}
              transactionSearchTerm={transactionSearchTerm}
              onSetShowTransactionSearch={setShowTransactionSearch}
              onSetTransactionSearchTerm={setTransactionSearchTerm}
              onPrintTransactions={handlePrintTransactions}
              onExportExcel={handleExportExcel}
            />
          </>
        )}
      </div>

      {/* Modals */}
      <AddItemModal
        open={showAddItem}
        onOpenChange={(isOpen) => {
          setShowAddItem(isOpen);
          if (!isOpen) {
            setAddItemTab("pricing");
            setAddItemForm(getInitialAddItemFormState());
            setItemBeingEdited(null);
            setSelectedUnitId("");
            setBaseUnitId("");
            setSecondaryUnitId("");
            setConversionRate(0);
            setAddItemImageDataUrl(null);
            setAddItemImageFileName("");
            setAddItemExistingImagePath(null);
          }
        }}
        itemBeingEdited={itemBeingEdited}
        addItemForm={addItemForm}
        onFormChange={(field, value) =>
          setAddItemForm((prev) => ({ ...prev, [field]: value }))
        }
        addItemTab={addItemTab}
        onSetAddItemTab={setAddItemTab}
        categoryList={categoryList}
        units={units}
        selectedUnit={selectedUnit}
        isSavingItem={isSavingItem}
        addItemImageFileName={addItemImageFileName}
        addItemImageDataUrl={addItemImageDataUrl}
        addItemExistingImagePath={addItemExistingImagePath}
        onImageSelection={handleAddItemImageSelection}
        onOpenUnitSelector={() =>
          onOpenUnitSelector({
            selectedUnitId,
            baseUnitId,
            secondaryUnitId,
            conversionRate,
            onSave: (result) => {
              setSelectedUnitId(result.selectedUnitId || result.baseUnitId);
              setBaseUnitId(result.baseUnitId);
              setSecondaryUnitId(result.secondaryUnitId);
              setConversionRate(result.conversionRate);
            },
          })
        }
        onOpenAddCategory={() =>
          onOpenAddCategory((id) =>
            setAddItemForm((prev) => ({ ...prev, categoryId: id }))
          )
        }
        onSaveItem={(close) => {
          void handleSaveItem(close);
        }}
      />

      <DeleteItemModal
        itemPendingDelete={itemPendingDelete}
        isDeletingItem={isDeletingItem}
        onCancel={() => setItemPendingDelete(null)}
        onConfirm={(item) => { void handleDeleteItem(item); }}
      />

      <AdjustStockModal
        open={showAdjustStockModal}
        onOpenChange={setShowAdjustStockModal}
        selectedItem={selectedItem}
        adjustStockForm={adjustStockForm}
        onFormChange={(updates) =>
          setAdjustStockForm((prev) => ({ ...prev, ...updates }))
        }
        isSavingAdjustment={isSavingAdjustment}
        onSave={() => { void handleSaveStockAdjustment(); }}
      />

      <StockDetailsModal
        open={showStockDetailsPopup}
        onClose={() => setShowStockDetailsPopup(false)}
        selectedItem={selectedItem}
      />
    </>
  );
}
