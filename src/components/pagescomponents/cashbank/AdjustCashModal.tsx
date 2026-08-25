import { useState, useRef, useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";
import { SharedModal } from "./SharedModal";
import { Calendar, AlertCircle } from "lucide-react";

interface AdjustCashModalProps {
  open: boolean;
  onClose: () => void;
  currentCash: number;
  onSuccess: () => void;
  editingTransaction?: any;
}

export function AdjustCashModal({ open, onClose, currentCash, onSuccess, editingTransaction }: AdjustCashModalProps) {
  const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });
  const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
  const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;

  const dateInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState("add");
  const [amount, setAmount] = useState<number | string>("");
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (editingTransaction) {
        setMode(editingTransaction.type === 'Increase Cash' ? 'add' : 'reduce');
        setAmount(Math.abs(Number(editingTransaction.amount)));
        
        let formattedDate = editingTransaction.date;
        if (formattedDate && formattedDate.includes('/')) {
           const [d, m, y] = formattedDate.split('/');
           if (y && m && d) formattedDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
        setDate(formattedDate || new Date().toISOString().split("T")[0]);
        setDescription(editingTransaction.name || "");
      } else {
        setMode("add");
        setAmount("");
        setDate(() => {
          const d = new Date();
          return d.toISOString().split("T")[0];
        });
        setDescription("");
      }
    }
  }, [open, editingTransaction]);

  let baseCash = currentCash;
  if (editingTransaction) {
     const origIsAdd = editingTransaction.type === 'Increase Cash';
     baseCash = origIsAdd ? currentCash - Number(editingTransaction.amount) : currentCash + Number(editingTransaction.amount);
  }

  const updatedCash =
    mode === "add"
      ? baseCash + Number(amount)
      : baseCash - Number(amount);

  const handleSave = async () => {
    if (!amount) return;
    
    const numAmount = Number(amount);
    if (numAmount < 0) {
      setError("Amount cannot be negative.");
      return;
    }
    
    if (mode === "reduce" && numAmount > baseCash) {
      setError(`Cannot reduce cash by more than the available balance (${currencyStr} ${baseCash.toLocaleString()}).`);
      return;
    }

    setError(null);
    setIsSaving(true);
    try {
      const type = mode === "add" ? "Increase Cash" : "Decrease Cash";
      const method = editingTransaction ? "PUT" : "POST";
      const url = editingTransaction ? `/api/cash_transactions?id=${editingTransaction.id}` : "/api/cash_transactions";

      const res = await fetch(url, {
        method,
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
    <SharedModal open={open} onClose={onClose} title={editingTransaction ? "Edit Cash Adjustment" : "Adjust Cash"}>
      <div className="space-y-5">
        <div className="flex items-center gap-6">
          {(!editingTransaction || editingTransaction.type === 'Increase Cash') && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={mode === "add"}
                onChange={() => setMode("add")}
                className="accent-[#E53935] w-4 h-4"
              />
              <span className="text-sm text-gray-800">Add Cash</span>
            </label>
          )}
          {(!editingTransaction || editingTransaction.type === 'Decrease Cash') && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={mode === "reduce"}
                onChange={() => setMode("reduce")}
                className="accent-[#E53935] w-4 h-4"
              />
              <span className="text-sm text-gray-800">Reduce Cash</span>
            </label>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Enter Amount<span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => {
                const val = e.target.value;
                if (Number(val) < 0) return;
                setAmount(val);
                setError(null);
              }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
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
          <div className="relative cursor-pointer" onClick={() => dateInputRef.current?.showPicker()}>
            <input
              ref={dateInputRef}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              onClick={(e) => e.currentTarget.showPicker()}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-400 cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:opacity-0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <Calendar className="w-5 h-5" />
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Description
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
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

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
