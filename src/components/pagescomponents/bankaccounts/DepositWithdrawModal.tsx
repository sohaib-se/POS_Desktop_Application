import { useState, useEffect, useRef } from "react";
import { Modal, Input, ModalFooter } from "./SharedComponents";
import type { BankAccount } from "./types";
import { useSettings } from "@/hooks/useSettings";
import { Camera } from "lucide-react";

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

  const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "/");

  useEffect(() => {
    if (open) {
      if (initialData) {
        const isDeposit = Number(initialData.amount) >= 0;
        setType(isDeposit ? "deposit" : "withdraw");
        setAmount(Math.abs(Number(initialData.amount)).toString());
        setDescription(initialData.name || "");
        setImageDataUrl(initialData.attachment_image_path || "");
      } else {
        setType("deposit");
        setAmount("");
        setDescription("");
        setImageDataUrl("");
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
    if (!amount || Number(amount) <= 0 || !description) return;
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
          date: initialData?.date || today,
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

        <Input label="Adjustment Date" value={today} readOnly />

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Description<span className="text-red-500 ml-0.5">*</span>
          </label>
          <textarea
            placeholder="Enter Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 resize-none"
          />
        </div>

        <div>
          {!imageDataUrl ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative flex h-8 w-8 mt-2 items-center justify-center text-slate-400 hover:text-slate-600"
              aria-label="Add attachment"
            >
              <Camera className="h-7 w-7" />
              <span className="absolute -top-1 -left-1 bg-white rounded-full text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </span>
            </button>
          ) : (
            <div className="relative group w-[180px] h-[120px] rounded overflow-hidden mt-2 border border-slate-200">
              <img 
                src={imageDataUrl} 
                alt="Attachment preview" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-x-0 bottom-0 bg-[#2d3748]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-between px-3 py-1.5">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] font-bold text-white tracking-wide hover:text-gray-200"
                >
                  CHANGE
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setImageDataUrl("");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-[11px] font-bold text-white tracking-wide hover:text-gray-200"
                >
                  DELETE
                </button>
              </div>
            </div>
          )}
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setImageDataUrl(reader.result as string);
                reader.readAsDataURL(file);
              }
            }} 
          />
        </div>
      </div>
      <ModalFooter onCancel={onClose} onSave={handleSave} saveLabel={isSaving ? "Saving..." : "Save"} />
    </Modal>
  );
}
