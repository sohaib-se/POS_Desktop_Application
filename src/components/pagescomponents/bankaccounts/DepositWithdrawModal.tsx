import { useState, useEffect, useRef } from "react";
import { Modal, Input, ModalFooter, ImageUpload } from "./SharedComponents";
import type { BankAccount } from "./types";
import { useSettings } from "@/hooks/useSettings";

interface DepositWithdrawModalProps {
  open: boolean;
  onClose: () => void;
  account: BankAccount;
  onSuccess?: () => void;
  initialData?: any;
}

export function DepositWithdrawModal({ open, onClose, account, onSuccess, initialData }: DepositWithdrawModalProps) {
  const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });
  const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
  const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;

  const [type, setType] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [date, setDate] = useState("");

  const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "/");

  const toYMD = (dmy: string) => {
    if (!dmy || !dmy.includes("/")) return dmy;
    const parts = dmy.split("/");
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return dmy;
  };

  const toDMY = (ymd: string) => {
    if (!ymd || !ymd.includes("-")) return ymd;
    const parts = ymd.split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return ymd;
  };

  useEffect(() => {
    if (open) {
      if (initialData) {
        const isDeposit = Number(initialData.amount) >= 0;
        setType(isDeposit ? "deposit" : "withdraw");
        setAmount(Math.abs(Number(initialData.amount)).toString());
        setDescription(initialData.name || "");
        setImageDataUrl(initialData.attachment_image_path || "");
        setDate(initialData.date || today);
      } else {
        setType("deposit");
        setAmount("");
        setDescription("");
        setImageDataUrl("");
        setDate(today);
      }
    }
  }, [open, initialData]);

  // When EDITING, the old amount is already included in the balance.
  // Remove the old effect first, then apply the new amount.
  const baseBalance = initialData
    ? Number(account?.balance || 0) - Number(initialData.amount)  // strip old transaction
    : Number(account?.balance || 0);
  const updatedCash = baseBalance + (type === "deposit" ? Number(amount || 0) : -Number(amount || 0));

  const handleSave = async () => {
    if (!amount || Number(amount) <= 0) return;
    setIsSaving(true);
    try {
      const url = initialData ? `/api/bank_account_transactions/${initialData.id}` : `/api/bank_account_transactions`;
      const method = initialData ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentType: account.name,
          type: type === "deposit" ? "Payment In" : "Payment Out",
          name: description,
          amount: type === "deposit" ? Number(amount) : -Number(amount),
          date: date,
          imageDataUrl: imageDataUrl,
        }),
      });

      if (res.ok) {
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!account) return null;

  return (
    <Modal open={open} onClose={onClose} title="Deposit / Withdraw">
      <div className="space-y-4 max-w-md mx-auto py-2">
        <div className="flex items-center gap-6 mb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="transactionType"
              checked={type === "deposit"}
              onChange={() => setType("deposit")}
              className="w-4 h-4 text-[#E53935] border-gray-300 focus:ring-[#E53935]"
            />
            <span className="text-gray-700">Deposit</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="transactionType"
              checked={type === "withdraw"}
              onChange={() => setType("withdraw")}
              className="w-4 h-4 text-[#E53935] border-gray-300 focus:ring-[#E53935]"
            />
            <span className="text-gray-700">Withdraw</span>
          </label>
        </div>

        <Input
          label="Enter Amount"
          required
          placeholder={currencyStr}
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <div className="text-sm text-gray-700 py-1">
          Updated Cash: <span className="font-semibold">{currencyStr} {updatedCash.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
        </div>

        <Input 
          type="date" 
          label="Adjustment Date" 
          value={toYMD(date)} 
          onChange={(e) => setDate(toDMY(e.target.value))} 
        />

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Description
          </label>
          <textarea
            placeholder="Enter Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 resize-none"
          />
        </div>

        <div>
          <ImageUpload 
            imageDataUrl={imageDataUrl} 
            setImageDataUrl={setImageDataUrl} 
            fileInputRef={fileInputRef} 
          />
        </div>
      </div>
      <ModalFooter onCancel={onClose} onSave={handleSave} saveLabel={isSaving ? "Saving..." : "Save"} />
    </Modal>
  );
}
