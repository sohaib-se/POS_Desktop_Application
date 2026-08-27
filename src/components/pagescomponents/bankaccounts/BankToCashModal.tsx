import { useState, useEffect, useRef } from "react";
import { Modal, Input, Select, ImageUpload, ModalFooter } from "./SharedComponents";
import type { TransferModalProps } from "./types";

export function BankToCashModal({ open, onClose, accounts, onSuccess, initialData }: TransferModalProps) {
  const [from, setFrom] = useState(accounts[0]?.name || "");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "/");
  const [date, setDate] = useState("");

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
        setFrom(initialData.paymentType || accounts[0]?.name || "");
        setAmount(Math.abs(Number(initialData.amount)).toString());
        setDescription(initialData.name || "");
        setImageDataUrl(initialData.attachment_image_path || "");
        setDate(initialData.date || today);
      } else {
        setFrom(accounts[0]?.name || "");
        setAmount("");
        setDescription("");
        setImageDataUrl("");
        setDate(today);
      }
    }
  }, [open, accounts, initialData]);

  const handleSave = async () => {
    if (!amount || Number(amount) <= 0 || !from) return;
    
    const selectedBank = accounts.find(a => a.name === from);
    if (!initialData && selectedBank && Number(amount) > selectedBank.balance) {
      alert("Not enough amount in bank account.");
      return;
    }

    setIsSaving(true);
    try {
      if (initialData) {
        const res = await fetch(`/api/bank_account_transactions/${initialData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentType: from,
            type: "Payment Out",
            name: description || "Transfer to Cash",
            amount: -Number(amount),
            date: date,
            imageDataUrl: imageDataUrl
          })
        });
        if (res.ok) {
          onSuccess?.();
          onClose();
          setAmount("");
          setDescription("");
        }
      } else {
        const res = await fetch("/api/bank_to_cash_transfer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromBank: from,
            amount: Number(amount),
            description,
            date: date,
            imageDataUrl: imageDataUrl
          })
        });
        if (res.ok) {
          onSuccess?.();
          onClose();
          setAmount("");
          setDescription("");
        }
      }
    } catch(err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Bank To Cash Transfer">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="From:"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            options={accounts.map((a) => ({ value: a.name, label: a.name }))}
          />
          <Input label="To:" value="Cash" readOnly />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Amount" 
            placeholder="0" 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Input 
            type="date" 
            label="Adjustment Date" 
            value={toYMD(date)} 
            onChange={(e) => setDate(toDMY(e.target.value))} 
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Description
            </label>
            <textarea
              placeholder="Add description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 resize-none"
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
      </div>
      <ModalFooter onCancel={onClose} onSave={handleSave} disabled={isSaving} />
    </Modal>
  );
}
