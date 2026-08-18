interface ActionButtonsProps {
  openModal: (modalName: "quantity" | "unit" | "discount" | "description") => void;
  handleDeleteSelectedRow: () => void;
}

export function ActionButtons({ openModal, handleDeleteSelectedRow }: ActionButtonsProps) {
  return (
    <div className="p-3 border-t border-gray-200 bg-white">
      <div className="grid grid-cols-5 gap-2">
        <button
          onClick={() => openModal("quantity")}
          className="flex items-center justify-center gap-1 rounded border border-blue-200 bg-blue-50/50 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-100/50 transition-colors"
        >
          Change Quantity{" "}
          <span className="text-gray-500 font-normal">[F2]</span>
        </button>
        <button
          onClick={handleDeleteSelectedRow}
          className="flex items-center justify-center gap-1 rounded border border-blue-200 bg-blue-50/50 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-100/50 transition-colors"
        >
          Remove Item <span className="text-gray-500 font-normal">[F4]</span>
        </button>
        <button
          onClick={() => openModal("unit")}
          className="flex items-center justify-center gap-1 rounded border border-blue-200 bg-blue-50/50 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-100/50 transition-colors"
        >
          Change Unit <span className="text-gray-500 font-normal">[F6]</span>
        </button>
        <button
          onClick={() => openModal("discount")}
          className="flex items-center justify-center gap-1 rounded border border-blue-200 bg-blue-50/50 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-100/50 transition-colors"
        >
          Bill Discount <span className="text-gray-500 font-normal">[F9]</span>
        </button>
        <button
          onClick={() => openModal("description")}
          className="flex items-center justify-center gap-1 rounded border border-blue-200 bg-blue-50/50 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-100/50 transition-colors"
        >
          Description <span className="text-gray-500 font-normal">[F12]</span>
        </button>
      </div>
    </div>
  );
}
