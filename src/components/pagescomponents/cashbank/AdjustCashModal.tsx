import { useState } from "react";
import { useSettings } from "@/hooks/useSettings";
import { SharedModal } from "./SharedModal";

interface AdjustCashModalProps {
  open: boolean;
  onClose: () => void;
  currentCash: number;
  onSuccess: () => void;
}

export function AdjustCashModal({ open, onClose, currentCash, onSuccess }: AdjustCashModalProps) {
  const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });
  const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
  const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;

  const [mode, setMode] = useState("add");
  const [amount, setAmount] = useState<number | string>("");
  const [date, setDate] = useState(new Date().toLocaleDateString("en-GB"));
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const updatedCash =
    mode === "add"
      ? currentCash + Number(amount)
      : currentCash - Number(amount);

  const handleSave = async () => {
    if (!description || !amount) return;
    setIsSaving(true);
    try {
      const type = mode === "add" ? "Increase Cash" : "Decrease Cash";
      const res = await fetch("/api/cash_transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: description,
          type,
          amount: Number(amount),
          date
        })
      });
      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SharedModal open={open} onClose={onClose} title="Adjust Cash">
      <div className="space-y-5">
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={mode === "add"}
              onChange={() => setMode("add")}
              className="accent-[#E53935] w-4 h-4"
            />
            <span className="text-sm text-gray-800">Add Cash</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={mode === "reduce"}
              onChange={() => setMode("reduce")}
              className="accent-[#E53935] w-4 h-4"
            />
            <span className="text-sm text-gray-800">Reduce Cash</span>
          </label>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Enter Amount<span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
              {currencyStr}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1.5">
            Updated Cash:{" "}
            <span className="text-gray-800 font-medium">
              {currencyStr} {updatedCash.toLocaleString()}
            </span>
          </p>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Adjustment Date
          </label>
          <div className="relative">
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-400"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-base">
              📅
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Description<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter Description"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-5 mt-2">
        <button
          onClick={onClose}
          className="px-5 py-2 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-[#E53935] text-white rounded-full text-sm font-medium hover:bg-red-600 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </SharedModal>
  );
}
