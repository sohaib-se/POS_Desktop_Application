import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
    <Modal open={open} onClose={onClose} title={initialData ? t("cashBank.editBankAccount") : t("cashBank.addBankAccount")}>
      <div className="space-y-4">
        {/* Row 1 */}
        <div className="grid grid-cols-3 gap-4">
          <Input
            label={t("cashBank.accountDisplayName")}
            placeholder={t("cashBank.enterAccountDisplayName")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label={t("cashBank.openingBalance")}
            placeholder={t("cashBank.enterOpeningBalance")}
            type="number"
            value={balance}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || Number(val) >= 0) {
                setBalance(val);
              }
            }}
            min="0"
          />
          <Input label={t("cashBank.asOfDate")} value={today} readOnly />
        </div>

        {/* Expandable fields */}
        {!showMore ? (
          <button
            onClick={() => setShowMore(true)}
            className="text-blue-500 text-sm font-medium flex items-center gap-1 hover:text-blue-600"
          >
            <Plus className="w-4 h-4" />
            {t("cashBank.addMoreFields")}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Input
                label={t("cashBank.accountNumber")}
                placeholder={t("cashBank.enterAccountNumber")}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
              <Input label={t("cashBank.swiftCode")} placeholder={t("cashBank.enterSwift")} value={swiftCode} onChange={(e) => setSwiftCode(e.target.value)} />
              <Input label={t("cashBank.iban")} placeholder={t("cashBank.enterIban")} value={iban} onChange={(e) => setIban(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label={t("cashBank.bankName")} placeholder={t("cashBank.enterBankName")} value={bankName} onChange={(e) => setBankName(e.target.value)} />
              <Input
                label={t("cashBank.accountHolderName")}
                placeholder={t("cashBank.enterAccountHolderName")}
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
              />
            </div>
          </div>
        )}

      </div>

      <ModalFooter onCancel={onClose} onSave={handleSave} saveLabel={isSaving ? t("common.saving") : t("common.save")} />
    </Modal>
  );
}
