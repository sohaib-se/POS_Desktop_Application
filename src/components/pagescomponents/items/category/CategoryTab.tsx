import { useEffect, useState } from "react";
import type { CategoryRecord } from "@/components/pagescomponents/items/products/types";
import type { CategoryContextMenuState, ItemRecord } from "./types";
import { CategoryList } from "./CategoryList";
import { CategoryContextMenu } from "./CategoryContextMenu";
import { CategoryDetailsPanel } from "./CategoryDetailsPanel";
import { AddCategoryModal } from "./AddCategoryModal";
import { DeleteCategoryModal } from "./DeleteCategoryModal";
import { MoveItemsDialog } from "./MoveItemsDialog";

type Props = {
  categoryList: CategoryRecord[];
  setCategoryList: React.Dispatch<React.SetStateAction<CategoryRecord[]>>;
  /** Callback used by ProductsTab to open the Add Category modal with an optional result callback */
  addCategoryCallbackRef: React.MutableRefObject<((id: string) => void) | null>;
  showAddCategory: boolean;
  setShowAddCategory: React.Dispatch<React.SetStateAction<boolean>>;
  newCategoryName: string;
  setNewCategoryName: React.Dispatch<React.SetStateAction<string>>;
  categoryBeingEdited: CategoryRecord | null;
  setCategoryBeingEdited: React.Dispatch<React.SetStateAction<CategoryRecord | null>>;
};

export function CategoryTab({
  categoryList,
  setCategoryList,
  addCategoryCallbackRef,
  showAddCategory,
  setShowAddCategory,
  newCategoryName,
  setNewCategoryName,
  categoryBeingEdited,
  setCategoryBeingEdited,
}: Props) {
  // ---- State ----
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [categoryPendingDelete, setCategoryPendingDelete] =
    useState<CategoryRecord | null>(null);
  const [categoryContextMenu, setCategoryContextMenu] =
    useState<CategoryContextMenuState | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [showMoveItemsDialog, setShowMoveItemsDialog] = useState(false);
  const [selectedMoveItemIds, setSelectedMoveItemIds] = useState<string[]>([]);
  const [moveItemsFilterCategoryId, setMoveItemsFilterCategoryId] =
    useState<string>("all");
  const [moveItemsSearchTerm, setMoveItemsSearchTerm] = useState("");
  const [isCategorySearchActive, setIsCategorySearchActive] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [categoryItemSearchTerm, setCategoryItemSearchTerm] = useState("");
  const [isMovingItems, setIsMovingItems] = useState(false);
  const [allItems, setAllItems] = useState<ItemRecord[]>([]);

  // ---- Derived ----
  const selectedCategory = categoryList.find((c) => c.id === selectedCategoryId);

  const filteredCategoryItems = allItems.filter((item) => {
    let matchesCategory = false;
    if (selectedCategoryId === null) {
      matchesCategory = !item.category;
    } else if (!selectedCategory?.name) {
      matchesCategory = false;
    } else {
      matchesCategory = item.category === selectedCategory.name;
    }
    if (!matchesCategory) return false;
    if (categoryItemSearchTerm.trim()) {
      const searchStr = categoryItemSearchTerm.trim().toLowerCase();
      const matchName = item.name.toLowerCase().includes(searchStr);
      const matchCode = item.code && item.code.toLowerCase().includes(searchStr);
      if (!matchName && !matchCode) return false;
    }
    return true;
  });

  const normalizedCategorySearchTerm = categorySearchTerm.trim().toLowerCase();
  const filteredCategoryList = categoryList.filter((category) => {
    if (!normalizedCategorySearchTerm) return true;
    return category.name.toLowerCase().includes(normalizedCategorySearchTerm);
  });

  const normalizedMoveItemsSearchTerm = moveItemsSearchTerm.trim().toLowerCase();
  const moveItemsFilteredList = allItems.filter((item) => {
    if (moveItemsFilterCategoryId === "uncategorized") {
      if (item.category) return false;
    } else if (moveItemsFilterCategoryId !== "all") {
      const filterCategory = categoryList.find(
        (c) => c.id === moveItemsFilterCategoryId
      );
      if (!filterCategory || item.category !== filterCategory.name) return false;
    }
    if (!normalizedMoveItemsSearchTerm) return true;
    return [item.name, item.code ?? "", item.category ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(normalizedMoveItemsSearchTerm);
  });

  const moveTargetCategoryName = selectedCategory?.name ?? null;

  const getContextMenuStyle = (x: number, y: number): React.CSSProperties => {
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

  // ---- Effects ----

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) throw new Error("Failed to load categories");
        const categories = (await response.json()) as CategoryRecord[];
        setCategoryList(categories);
        setSelectedCategoryId((prev) => {
          if (!categories.length) return null;
          if (prev && categories.some((c) => c.id === prev)) return prev;
          return categories[0].id;
        });
      } catch (error) {
        console.error(error);
      }
    };
    void loadCategories();
  }, [setCategoryList]);

  useEffect(() => {
    const loadAllItems = async () => {
      try {
        const response = await fetch("/api/items");
        if (!response.ok) return;
        const itemRows = (await response.json()) as {
          id: string;
          name: string;
          code: string | null;
          category: string | null;
        }[];
        setAllItems(
          itemRows.map((r) => ({
            id: String(r.id),
            name: String(r.name),
            code: r.code,
            category: r.category,
          }))
        );
      } catch (error) {
        console.error(error);
      }
    };
    void loadAllItems();
  }, []);

  useEffect(() => {
    if (!categoryContextMenu) return;
    const closeMenu = () => setCategoryContextMenu(null);
    window.addEventListener("click", closeMenu);
    window.addEventListener("resize", closeMenu);
    window.addEventListener("scroll", closeMenu, true);
    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("resize", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
    };
  }, [categoryContextMenu]);

  // ---- Handlers ----

  const openEditCategoryDialog = (category: CategoryRecord) => {
    setCategoryBeingEdited(category);
    setNewCategoryName(category.name);
    setShowAddCategory(true);
  };

  const openMoveItemsDialog = () => {
    setSelectedMoveItemIds([]);
    setMoveItemsFilterCategoryId("all");
    setMoveItemsSearchTerm("");
    setShowMoveItemsDialog(true);
  };

  const toggleMoveItemSelection = (itemId: string) => {
    setSelectedMoveItemIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleMoveItemsToCategory = async () => {
    if (!selectedMoveItemIds.length || isMovingItems) return;
    setIsMovingItems(true);
    try {
      const itemsToMove = allItems.filter((item) =>
        selectedMoveItemIds.includes(item.id)
      );
      await Promise.all(
        itemsToMove.map(async (item) => {
          const response = await fetch("/api/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: item.id,
              name: item.name,
              code: item.code ?? null,
              category: moveTargetCategoryName,
            }),
          });
          if (!response.ok) throw new Error("Failed to move items");
        })
      );
      setAllItems((prev) =>
        prev.map((item) =>
          selectedMoveItemIds.includes(item.id)
            ? { ...item, category: moveTargetCategoryName }
            : item
        )
      );
      try {
        const categoriesResponse = await fetch("/api/categories");
        if (categoriesResponse.ok) {
          const categories = (await categoriesResponse.json()) as CategoryRecord[];
          setCategoryList(categories);
        }
      } catch (error) {
        console.error(error);
      }
      setSelectedMoveItemIds([]);
      setMoveItemsFilterCategoryId("all");
      setMoveItemsSearchTerm("");
      setShowMoveItemsDialog(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsMovingItems(false);
    }
  };

  const handleDeleteCategory = async (category: CategoryRecord) => {
    if (isDeletingCategory) return;
    setIsDeletingCategory(true);
    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete category");
      setCategoryList((prev) => {
        const next = prev.filter((entry) => entry.id !== category.id);
        setSelectedCategoryId((prevId) => {
          if (prevId !== category.id) return prevId;
          return next[0]?.id ?? null;
        });
        return next;
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeletingCategory(false);
      setCategoryPendingDelete(null);
    }
  };

  const handleCreateCategoryWithCallback = async () => {
    const normalizedName = newCategoryName.trim();
    if (!normalizedName) return;
    const alreadyExists = categoryList.some(
      (c) =>
        c.name.toLowerCase() === normalizedName.toLowerCase() &&
        c.id !== categoryBeingEdited?.id
    );
    if (alreadyExists) return;

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: categoryBeingEdited?.id,
          name: normalizedName,
          itemCount: 0,
        }),
      });
      if (!response.ok) throw new Error("Failed to create category");
      const createdCategory = (await response.json()) as CategoryRecord;
      setCategoryList((prev) => {
        const hasExisting = prev.some((c) => c.id === createdCategory.id);
        const next = hasExisting
          ? prev.map((c) => (c.id === createdCategory.id ? createdCategory : c))
          : [...prev, createdCategory];
        return next.sort((a, b) => a.name.localeCompare(b.name));
      });
      setSelectedCategoryId(createdCategory.id);

      if (addCategoryCallbackRef.current) {
        addCategoryCallbackRef.current(createdCategory.id);
        addCategoryCallbackRef.current = null;
      }

      setNewCategoryName("");
      setCategoryBeingEdited(null);
      setShowAddCategory(false);
    } catch (error) {
      console.error(error);
    }
  };

  // ---- Render ----
  return (
    <>
      <div className="flex-1 flex gap-1 overflow-hidden">
        {/* Left Panel */}
        <CategoryList
          filteredCategoryList={filteredCategoryList}
          selectedCategoryId={selectedCategoryId}
          isCategorySearchActive={isCategorySearchActive}
          categorySearchTerm={categorySearchTerm}
          onSetSelectedCategoryId={setSelectedCategoryId}
          onSetIsCategorySearchActive={setIsCategorySearchActive}
          onSetCategorySearchTerm={setCategorySearchTerm}
          onOpenAddCategory={() => {
            setCategoryBeingEdited(null);
            setNewCategoryName("");
            setShowAddCategory(true);
          }}
          onSetCategoryContextMenu={setCategoryContextMenu}
        />

        {/* Context Menu */}
        <CategoryContextMenu
          categoryContextMenu={categoryContextMenu}
          getContextMenuStyle={getContextMenuStyle}
          onEdit={(category) => {
            setSelectedCategoryId(category.id);
            openEditCategoryDialog(category);
          }}
          onDelete={(category) => setCategoryPendingDelete(category)}
          onClose={() => setCategoryContextMenu(null)}
        />

        {/* Right Panel */}
        <CategoryDetailsPanel
          selectedCategory={selectedCategory}
          filteredCategoryItems={filteredCategoryItems}
          categoryItemSearchTerm={categoryItemSearchTerm}
          onSetCategoryItemSearchTerm={setCategoryItemSearchTerm}
          onOpenMoveItemsDialog={openMoveItemsDialog}
        />
      </div>

      {/* Modals */}
      <AddCategoryModal
        open={showAddCategory}
        categoryBeingEdited={categoryBeingEdited}
        newCategoryName={newCategoryName}
        onSetNewCategoryName={setNewCategoryName}
        onClose={() => {
          setShowAddCategory(false);
          setNewCategoryName("");
          setCategoryBeingEdited(null);
          addCategoryCallbackRef.current = null;
        }}
        onSave={() => {
          void handleCreateCategoryWithCallback();
        }}
      />

      <DeleteCategoryModal
        categoryPendingDelete={categoryPendingDelete}
        isDeletingCategory={isDeletingCategory}
        onCancel={() => setCategoryPendingDelete(null)}
        onConfirm={(category) => {
          void handleDeleteCategory(category);
        }}
      />

      <MoveItemsDialog
        open={showMoveItemsDialog}
        moveTargetCategoryName={moveTargetCategoryName}
        categoryList={categoryList}
        moveItemsFilteredList={moveItemsFilteredList}
        selectedMoveItemIds={selectedMoveItemIds}
        moveItemsFilterCategoryId={moveItemsFilterCategoryId}
        moveItemsSearchTerm={moveItemsSearchTerm}
        isMovingItems={isMovingItems}
        onClose={() => setShowMoveItemsDialog(false)}
        onOpenChange={(isOpen) => {
          setShowMoveItemsDialog(isOpen);
          if (!isOpen && !isMovingItems) {
            setSelectedMoveItemIds([]);
            setMoveItemsFilterCategoryId("all");
            setMoveItemsSearchTerm("");
          }
        }}
        onSetMoveItemsSearchTerm={setMoveItemsSearchTerm}
        onSetMoveItemsFilterCategoryId={setMoveItemsFilterCategoryId}
        onToggleMoveItemSelection={toggleMoveItemSelection}
        onConfirmMove={() => {
          void handleMoveItemsToCategory();
        }}
      />
    </>
  );
}
