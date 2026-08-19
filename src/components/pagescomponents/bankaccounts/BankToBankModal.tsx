import { useState, useEffect } from "react";
import { Modal, Input, Select, ModalFooter } from "./SharedComponents";
import type { TransferModalProps } from "./types";

export function BankToBankModal({ open, onClose, accounts, onSuccess, initialData }: TransferModalProps) {
  const [from, setFrom] = useState(accounts[0]?.name || "");
  const [to, setTo] = useState(accounts[1]?.name || accounts[0]?.name || "");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setAmount(Math.abs(Number(initialData.amount)).toString());
        setDate(initialData.date || new Date().toISOString().split('T')[0]);
        // Extract the description if we prepended it
        let desc = initialData.name;
        if (desc.startsWith('Transfer to ') || desc.startsWith('Transfer from ')) {
          desc = '';
        }
        setDescription(desc);
        
        // Figure out from/to based on the transaction type
        if (initialData.id.endsWith('-bank-out')) {
          setFrom(initialData.paymentType || "");
          // We need to guess `to` if possible, but description might not have it cleanly.
          // For now just keep it as the first available.
        } else if (initialData.id.endsWith('-bank-in')) {
          setTo(initialData.paymentType || "");
        }
      } else {
        setFrom(accounts[0]?.name || "");
        setTo(accounts[1]?.name || accounts[0]?.name || "");
        setAmount("");
        setDate(new Date().toISOString().split('T')[0]);
        setDescription("");
      }
    }
  }, [open, initialData, accounts]);

  const handleSave = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    if (from === to) {
      alert("Please select different banks for transfer.");
      return;
    }

    setIsLoading(true);
    try {
      if (initialData) {
        // Edit logic uses the standard bank account update endpoint.
        // The repository will intercept -bank-in/-bank-out and sync the twin.
        let actualName = description;
        if (!actualName) {
           if (initialData.id.endsWith('-bank-out')) {
             actualName = `Transfer to ${to}`; // Might be inaccurate if they changed `to`, but we can't easily change `to` in edit without complex UI. We'll send standard fields.
           } else {
             actualName = `Transfer from ${from}`;
           }
        }
        
        const res = await fetch(`/api/bank_account_transactions/${initialData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: initialData.id.endsWith('-bank-out') ? -Number(amount) : Number(amount),
            date,
            name: description || initialData.name, // Just use what they type or the old one
            paymentType: initialData.paymentType, // Can't easily change source bank during edit
            type: initialData.type,
          }),
        });
        if (!res.ok) throw new Error("Failed to update transfer");
      } else {
        const res = await fetch("/api/bank_to_bank_transfer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromBank: from,
            toBank: to,
            amount: Number(amount),
            date,
            description,
          }),
        });
        if (!res.ok) throw new Error("Failed to save transfer");
      }
      
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save transaction.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={initialData ? "Edit Bank Transfer" : "Bank To Bank Transfer"}>
      <div className="space-y-4">
        {!initialData && (
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="From:"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              options={accounts.map((a) => ({ value: a.name, label: a.name }))}
            />
            <Select
              label="To:"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              options={accounts.map((a) => ({ value: a.name, label: a.name }))}
            />
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Amount" 
            placeholder="0" 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Input 
            label="Date" 
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Description (Optional)
          </label>
          <textarea
            placeholder="Add description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 resize-none"
          />
        </div>
      </div>
      <ModalFooter 
        onCancel={onClose} 
        onSave={handleSave} 
        disabled={isLoading} 
      />
    </Modal>
  );
}
