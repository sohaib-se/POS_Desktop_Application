import { useState, useEffect, useRef } from "react";
import { Modal, Input, Select, ImageUpload, ModalFooter } from "./SharedComponents";
import type { TransferModalProps } from "./types";

export function CashToBankModal({ open, onClose, accounts, onSuccess, initialData }: TransferModalProps) {
  const [to, setTo] = useState(accounts[0]?.name || "");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [totalCash, setTotalCash] = useState(0);
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
        setTo(initialData.paymentType || accounts[0]?.name || "");
        setAmount(Math.abs(Number(initialData.amount)).toString());
        setDescription(initialData.name || "");
        setImageDataUrl(initialData.attachment_image_path || "");
        setDate(initialData.date || today);
      } else {
        setTo(accounts[0]?.name || "");
        setAmount("");
        setDescription("");
        setImageDataUrl("");
        setDate(today);
      }
      
      // Fetch current cash in hand balance
      fetch("/api/cash_transactions")
        .then(res => res.json())
        .then(data => {
          const total = data.reduce((acc: number, tx: any) => {
            const type = String(tx.type).toLowerCase();
            const isCashIn = type.includes("in") || type === "sale" || type.includes("add") || type.includes("increase") || type === "pos sale";
            return isCashIn ? acc + Number(tx.amount) : acc - Number(tx.amount);
          }, 0);
          setTotalCash(total);
        })
        .catch(err => console.error(err));
    }
  }, [open, accounts, initialData]);

  const handleSave = async () => {
    if (!amount || Number(amount) <= 0 || !to) return;
    
    // Only block if creating a new one and it exceeds balance
    if (!initialData && Number(amount) > totalCash) {
      alert("Not enough cash in hand.");
      return;
    }

    setIsSaving(true);
    try {
      if (initialData) {
        const res = await fetch(`/api/bank_account_transactions/${initialData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentType: to,
            type: "Payment In",
            name: description || "Transfer from Cash",
            amount: Number(amount),
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
        const res = await fetch("/api/cash_to_bank_transfer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toBank: to,
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
    <Modal open={open} onClose={onClose} title="Cash To Bank Transfer">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="From:" value="Cash" readOnly />
          <Select
            label="To:"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            options={accounts.map((a) => ({ value: a.name, label: a.name }))}
          />
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
