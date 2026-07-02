import React, { useState, useEffect } from "react";
import {
  Plus,
  Printer,
  Landmark,
  CreditCard,
  Wallet,
  Search,
  MoreVertical,
  ChevronDown,
  X,
  Upload,
  ArrowUpDown,
  Filter,
} from "lucide-react";

// ─── Utility ────────────────────────────────────────────────────────────────

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 relative">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

function Input({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  required,
  readOnly,
  className = "",
}: InputProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm text-gray-600 mb-1">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 ${readOnly ? "bg-gray-50" : "bg-white"}`}
      />
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

function Select({ label, value, onChange, options, className = "" }: SelectProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm text-gray-600 mb-1">{label}</label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white appearance-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 pr-8"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

function ImageUpload() {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">Image</label>
      <div className="border border-dashed border-gray-300 rounded-lg px-4 py-5 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-2 text-blue-500 text-sm font-medium">
          <Upload className="w-4 h-4" />
          Add Image
        </div>
      </div>
    </div>
  );
}

interface ModalFooterProps {
  onCancel: () => void;
  onSave?: () => void;
  saveLabel?: string;
}

function ModalFooter({ onCancel, onSave, saveLabel = "Save" }: ModalFooterProps) {
  return (
    <div className="flex justify-end gap-3 pt-4 mt-2">
      <button
        onClick={onCancel}
        className="px-5 py-2 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        className="px-6 py-2 bg-[#E53935] text-white rounded-full text-sm font-medium hover:bg-red-600"
      >
        {saveLabel}
      </button>
    </div>
  );
}

// ─── Add Bank Account Modal ──────────────────────────────────────────────────

interface BankAccount {
  id: string;
  name: string;
  balance: number;
  accountNumber?: string;
  bankName?: string;
  swift_code?: string;
  iban?: string;
  account_holder_name?: string;
  print_details?: boolean | number;
  transactions: any[];
}

interface AddBankModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: BankAccount | null;
}

function AddBankModal({ open, onClose, onSuccess, initialData }: AddBankModalProps) {
  const [showMore, setShowMore] = useState(false);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [iban, setIban] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [printDetails, setPrintDetails] = useState(false);
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
        setPrintDetails(Boolean(initialData.print_details));
        setShowMore(Boolean(initialData.accountNumber || initialData.swift_code || initialData.iban || initialData.bankName || initialData.account_holder_name));
      } else {
        setName("");
        setBalance("");
        setAccountNumber("");
        setBankName("");
        setSwiftCode("");
        setIban("");
        setAccountHolderName("");
        setPrintDetails(false);
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
          account_holder_name: accountHolderName,
          print_details: printDetails
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

        {/* Checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="printDetails"
            checked={printDetails}
            onChange={(e) => setPrintDetails(e.target.checked)}
            className="rounded border-gray-300 w-4 h-4"
          />
          <label htmlFor="printDetails" className="text-sm text-gray-700">
            Print Bank Details on Invoices
          </label>
          <span className="w-4 h-4 rounded-full border border-gray-300 text-gray-400 text-xs flex items-center justify-center cursor-help">
            i
          </span>
        </div>
      </div>

      <ModalFooter onCancel={onClose} onSave={handleSave} saveLabel={isSaving ? "Saving..." : "Save Details"} />
    </Modal>
  );
}

// ─── Bank To Cash Transfer Modal ─────────────────────────────────────────────

interface TransferModalProps {
  open: boolean;
  onClose: () => void;
  accounts: BankAccount[];
}

function BankToCashModal({ open, onClose, accounts }: TransferModalProps) {
  const [from, setFrom] = useState(accounts[0]?.name || "");
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

// ─── Cash To Bank Transfer Modal ─────────────────────────────────────────────

function CashToBankModal({ open, onClose, accounts }: TransferModalProps) {
  const [to, setTo] = useState(accounts[0]?.name || "");
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

// ─── Bank To Bank Transfer Modal ─────────────────────────────────────────────

function BankToBankModal({ open, onClose, accounts }: TransferModalProps) {
  const [from, setFrom] = useState(accounts[0]?.name || "");
  const [to, setTo] = useState(accounts[1]?.name || accounts[0]?.name || "");
  return (
    <Modal open={open} onClose={onClose} title="Bank To Bank Transfer">
      <div className="space-y-4">
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

// ─── Bank Adjustment Modal ────────────────────────────────────────────────────

function AdjustBankModal({ open, onClose, accounts }: TransferModalProps) {
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

// ─── Empty State ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
  onAdd: () => void;
}

function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full h-full text-center py-12 px-4">
      <div className="w-32 h-32 mx-auto mb-6 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl transform rotate-6" />
        <div className="absolute inset-0 bg-white rounded-2xl shadow-lg flex items-center justify-center">
          <Landmark className="w-16 h-16 text-gray-400" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
          <span className="text-yellow-800 text-lg font-bold">$</span>
        </div>
        <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-yellow-300 rounded-full flex items-center justify-center">
          <span className="text-yellow-800 text-sm font-bold">$</span>
        </div>
      </div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        Manage Multiple Bank Accounts
      </h2>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        With Vyapar, you can organize multiple bank accounts and track all your
        financial transactions in one place.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8 w-full">
        <div className="bg-blue-50 rounded-xl p-4 text-left">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
            <Printer className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-medium text-gray-900 mb-1">
            Print Bank Details on Invoices
          </h3>
          <p className="text-xs text-gray-500">
            Share your bank account information on invoices so customers can pay
            you easily.
          </p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 text-left">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
            <CreditCard className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="font-medium text-gray-900 mb-1">
            Unlimited Payment Types
          </h3>
          <p className="text-xs text-gray-500">
            Record payments received through banks, cards, or any method you
            prefer.
          </p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-left">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
            <Wallet className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="font-medium text-gray-900 mb-1">
            Maintain Accurate Records
          </h3>
          <p className="text-xs text-gray-500">
            Keep your financial entries organised for better clarity and
            reporting.
          </p>
        </div>
      </div>

      <button
        onClick={onAdd}
        className="bg-[#E53935] hover:bg-red-600 text-white px-6 py-3 rounded-lg text-sm font-medium flex items-center gap-2 mx-auto"
      >
        <Plus className="w-4 h-4" />
        Add Bank Account
      </button>
    </div>
  );
}

// ─── Account List View ────────────────────────────────────────────────────────

interface AccountListViewProps {
  accounts: BankAccount[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onContextMenu?: (e: React.MouseEvent, id: string) => void;
}

function AccountListView({ accounts, selectedId, onSelect, onContextMenu }: AccountListViewProps) {
  const [search, setSearch] = useState("");
  const filtered = accounts.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="w-72 flex-shrink-0 border-r border-gray-200 flex flex-col">
      {/* Search */}
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Account/Amount"
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-300"
          />
        </div>
      </div>

      {/* Column headers */}
      <div className="flex items-center px-4 py-2 border-b border-gray-100 text-xs text-gray-500 font-medium">
        <div className="flex-1 flex items-center gap-1">
          Account Name
          <ArrowUpDown className="w-3 h-3" />
        </div>
        <div className="text-right">Amount</div>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-auto">
        {filtered.map((acc) => (
          <div
            key={acc.id}
            onClick={() => onSelect(acc.id)}
            onContextMenu={(e) => onContextMenu?.(e, acc.id)}
            className={`flex items-center px-4 py-3 cursor-pointer border-b border-gray-50 hover:bg-blue-50 transition-colors ${selectedId === acc.id ? "bg-blue-50" : ""
              }`}
          >
            <div className="flex-1 text-sm font-medium text-gray-800">
              {acc.name}
            </div>
            <div className="text-sm font-medium text-green-600">
              {acc.balance.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Account Detail + Transactions ───────────────────────────────────────────

interface AccountDetailProps {
  account: BankAccount;
  onDeposit: (action: string) => void;
}

function AccountDetail({ account, onDeposit }: AccountDetailProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownItems = [
    "Bank to Cash Transfer",
    "Cash to Bank Transfer",
    "Bank to Bank Transfer",
    "Adjust Bank Balance",
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">
          {account.name}
        </h3>
        <div className="relative">
          <div className="flex items-center">
            <button
              onClick={() => onDeposit("deposit")}
              className="border border-[#E53935] text-[#E53935] text-sm font-medium px-4 py-1.5 rounded-l-full hover:bg-red-50 transition-colors"
            >
              Deposit / Withdraw
            </button>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="border border-[#E53935] border-l-0 text-[#E53935] px-2 py-1.5 rounded-r-full hover:bg-red-50 transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-48">
              {dropdownItems.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setDropdownOpen(false);
                    onDeposit(item);
                  }}
                  className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${item === "Adjust Bank Balance"
                    ? "font-semibold text-gray-900"
                    : "text-gray-700"
                    }`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Account meta */}
      <div className="flex items-center gap-8 px-6 py-3 border-b border-gray-100 text-sm text-gray-500">
        <div>
          <span className="mr-2">Bank Name</span>
          <span className="font-medium text-gray-800">{account.bankName}</span>
        </div>
        <div>
          <span className="mr-2">Account Number</span>
          <span className="font-medium text-gray-800">
            {account.accountNumber}
          </span>
        </div>
      </div>

      {/* Transactions */}
      <div className="flex-1 overflow-auto">
        <div className="flex items-center justify-between px-6 py-3">
          <h4 className="text-sm font-semibold text-gray-800">Transactions</h4>
          <Search className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
        </div>

        {/* Table header */}
        <div className="grid grid-cols-4 px-6 py-2 border-b border-gray-100 text-xs text-gray-500 font-medium">
          {["Type", "Name", "Date", "Amount"].map((col) => (
            <div key={col} className="flex items-center gap-1">
              {col}
              <Filter className="w-3 h-3" />
            </div>
          ))}
        </div>

        {/* Rows */}
        {account.transactions.map((tx, i) => (
          <div
            key={i}
            className={`grid grid-cols-4 px-6 py-3 border-b border-gray-50 items-center text-sm hover:bg-gray-50 ${i % 2 === 0 ? "bg-blue-50/30" : ""
              }`}
          >
            <div className="font-medium text-gray-800">{tx.type}</div>
            <div className="text-gray-700">{tx.name}</div>
            <div className="text-gray-600">{tx.date}</div>
            <div className="flex items-center justify-between">
              <span className="text-green-600 font-medium">
                Rs{" "}
                {tx.amount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </span>
              <button className="text-gray-400 hover:text-gray-600 ml-2">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function BankAccounts() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, accountId: string } | null>(null);

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/bank_accounts");
      const data = await res.json();
      const mapped = data.map((a: any) => ({
        ...a,
        bankName: a.bank_name,
        accountNumber: a.account_number,
        transactions: [] // Dummy empty transactions for now
      }));
      setAccounts(mapped);
      if (mapped.length > 0) {
        setSelectedId(prev => prev || mapped[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      // setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/bank_accounts/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchAccounts();
        if (selectedId === id) setSelectedId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Transfer / adjustment modals
  const [activeModal, setActiveModal] = useState<string | null>(null);
  // activeModal: "Bank to Cash Transfer" | "Cash to Bank Transfer" | "Bank to Bank Transfer" | "Adjust Bank Balance"

  const selectedAccount = accounts.find((a: BankAccount) => a.id === selectedId);

  const isEmpty = accounts.length === 0;

  return (
    <div className="h-full flex flex-col bg-[#D0DCE7] gap-1 p-1" onClick={() => setContextMenu(null)}>
      {/* Top bar */}
      {!isEmpty && (
        <div className="bg-white rounded-md shadow-sm px-6 py-3 flex items-center justify-between mx-1">
          <h1 className="text-base font-semibold text-gray-900">Banks</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdd(true)}
              className="bg-[#E53935] hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Bank
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="bg-white rounded-md shadow-sm flex-1 overflow-hidden mx-1 flex">
        {isEmpty ? (
          <EmptyState onAdd={() => setShowAdd(true)} />
        ) : (
          <>
            <AccountListView
              accounts={accounts}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onContextMenu={(e, id) => {
                e.preventDefault();
                setContextMenu({ x: e.clientX, y: e.clientY, accountId: id });
              }}
            />
            {selectedAccount && (
              <AccountDetail
                account={selectedAccount}
                onDeposit={(action) => {
                  if (action === "deposit") {
                    setActiveModal("Bank to Cash Transfer");
                  } else {
                    setActiveModal(action);
                  }
                }}
              />
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <AddBankModal
        open={showAdd || !!editingAccount}
        onClose={() => { setShowAdd(false); setEditingAccount(null); }}
        onSuccess={fetchAccounts}
        initialData={editingAccount}
      />
      <BankToCashModal
        open={activeModal === "Bank to Cash Transfer"}
        onClose={() => setActiveModal(null)}
        accounts={accounts}
      />
      <CashToBankModal
        open={activeModal === "Cash to Bank Transfer"}
        onClose={() => setActiveModal(null)}
        accounts={accounts}
      />
      <BankToBankModal
        open={activeModal === "Bank to Bank Transfer"}
        onClose={() => setActiveModal(null)}
        accounts={accounts}
      />
      <AdjustBankModal
        open={activeModal === "Adjust Bank Balance"}
        onClose={() => setActiveModal(null)}
        accounts={accounts}
      />

      {contextMenu && (
        <div
          className="fixed bg-white border border-gray-200 shadow-xl rounded-md z-50 overflow-hidden w-32"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => {
              const acc = accounts.find((a: BankAccount) => a.id === contextMenu.accountId);
              setEditingAccount(acc || null);
              setContextMenu(null);
            }}
          >
            Edit
          </button>
          <button
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            onClick={() => {
              handleDelete(contextMenu.accountId);
              setContextMenu(null);
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
