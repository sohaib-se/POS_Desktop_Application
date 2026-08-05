import { useState } from "react";
import { Modal, Input, Select, ImageUpload, ModalFooter } from "./SharedComponents";
import type { TransferModalProps } from "./types";

export function AdjustBankModal({ open, onClose, accounts }: TransferModalProps) {
  const [account, setAccount] = useState(accounts[0]?.name || "");
  const [type, setType] = useState("increase");
  return (
    <Modal open={open} onClose={onClose} title="Bank Adjustment Entry">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Account Name"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            options={accounts.map((a) => ({ value: a.name, label: a.name }))}
          />
          <Select
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[
              { value: "increase", label: "Increase balance" },
              { value: "decrease", label: "Decrease balance" },
            ]}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Amount" placeholder="0" type="number" />
          <Input label="Adjustment Date" value="29/06/2026" readOnly />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Description
            </label>
            <textarea
              placeholder="Add description"
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 resize-none"
            />
          </div>
          <ImageUpload />
        </div>
      </div>
      <ModalFooter onCancel={onClose} />
    </Modal>
  );
}
