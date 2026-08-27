import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Modal, Input, ModalFooter } from "./SharedComponents";
import type { BankAccount } from "./types";

interface AddBankModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: BankAccount | null;
}

export function AddBankModal({ open, onClose, onSuccess, initialData }: AddBankModalProps) {
  const [showMore, setShowMore] = useState(false);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [iban, setIban] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "/");

  useEffect(() => {
    if (open) {
      if (initialData) {
        setName(initialData.name || "");
        setBalance(initialData.balance !== undefined ? String(initialData.balance) : "");
        setAccountNumber(initialData.accountNumber || "");
        setBankName(initialData.bankName || "");
        setSwiftCode(initialData.swift_code || "");
        setIban(initialData.iban || "");
        setAccountHolderName(initialData.account_holder_name || "");
        setShowMore(Boolean(initialData.accountNumber || initialData.swift_code || initialData.iban || initialData.bankName || initialData.account_holder_name));
      } else {
        setName("");
        setBalance("");
        setAccountNumber("");
        setBankName("");
        setSwiftCode("");
        setIban("");
        setAccountHolderName("");
        setShowMore(false);
      }
    }
  }, [open, initialData]);

  const handleSave = async () => {
    if (!name) return;
    setIsSaving(true);
    try {
      const url = initialData ? `/api/bank_accounts/${initialData.id}` : "/api/bank_accounts";
      const method = initialData ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          balance: Number(balance),
          account_number: accountNumber,
          bank_name: bankName,
          swift_code: swiftCode,
          iban,
          account_holder_name: accountHolderName
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

  return (
    <Modal open={open} onClose={onClose} title={initialData ? "Edit Bank Account" : "Add Bank Account"}>
      <div className="space-y-4">
        {/* Row 1 */}
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Account Display Name"
            placeholder="Enter Account Display Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Opening Balance"
            placeholder="Enter Opening Balance"
            type="number"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
          />
          <Input label="As of Date" value={today} readOnly />
        </div>

        {/* Expandable fields */}
        {!showMore ? (
          <button
            onClick={() => setShowMore(true)}
            className="text-blue-500 text-sm font-medium flex items-center gap-1 hover:text-blue-600"
          >
            <Plus className="w-4 h-4" />
            Add more fields
          </button>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Account Number"
                placeholder="Enter Account Number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
              <Input label="SWIFT Code" placeholder="Enter SWIFT" value={swiftCode} onChange={(e) => setSwiftCode(e.target.value)} />
              <Input label="IBAN" placeholder="Enter IBAN" value={iban} onChange={(e) => setIban(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Bank Name" placeholder="Enter Bank Name" value={bankName} onChange={(e) => setBankName(e.target.value)} />
              <Input
                label="Account Holder Name"
                placeholder="Enter Account Holder Name"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
              />
            </div>
          </div>
        )}

      </div>

      <ModalFooter onCancel={onClose} onSave={handleSave} saveLabel={isSaving ? "Saving..." : "Save Details"} />
    </Modal>
  );
}
