import { useEffect, useRef, useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { ExpenseRecord } from "./types";

interface ExpenseRowActionsProps {
  record: ExpenseRecord;
  onEditRecord: (record: ExpenseRecord) => void;
  onDeleteRecord: (record: ExpenseRecord) => void;
}

export function ExpenseRowActions({
  record,
  onEditRecord,
  onDeleteRecord,
}: ExpenseRowActionsProps) {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click or scroll
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("click", close);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  // Decide whether to drop up or down
  useEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuHeight = 88; // approximate height of 2 menu items
    const spaceBelow = window.innerHeight - rect.bottom;
    setDropUp(spaceBelow < menuHeight + 8);
  }, [open]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen((prev) => !prev);
  };

  return (
    <div className="relative flex justify-center">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className={`p-1 rounded hover:bg-gray-100 transition-colors ${
          open ? "bg-gray-100 text-gray-700" : "text-gray-400 hover:text-gray-600"
        }`}
        title="Actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <div
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
          className={`absolute right-0 z-50 w-36 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg ${
            dropUp ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          <button
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
            onClick={() => {
              onEditRecord(record);
              setOpen(false);
            }}
          >
            <Pencil className="w-4 h-4 text-gray-500" />
            View/Edit
          </button>
          <button
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
            onClick={() => {
              onDeleteRecord(record);
              setOpen(false);
            }}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
