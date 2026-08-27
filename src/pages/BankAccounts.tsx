import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import type { BankAccount } from "../components/pagescomponents/bankaccounts/types";
import { AddBankModal } from "../components/pagescomponents/bankaccounts/AddBankModal";
import { BankToCashModal } from "../components/pagescomponents/bankaccounts/BankToCashModal";
import { CashToBankModal } from "../components/pagescomponents/bankaccounts/CashToBankModal";
import { BankToBankModal } from "../components/pagescomponents/bankaccounts/BankToBankModal";
import { EmptyState } from "../components/pagescomponents/bankaccounts/EmptyState";
import { AccountListView } from "../components/pagescomponents/bankaccounts/AccountListView";
import { AccountDetail } from "../components/pagescomponents/bankaccounts/AccountDetail";
import { DepositWithdrawModal } from "../components/pagescomponents/bankaccounts/DepositWithdrawModal";
import { ConfirmDeleteModal } from "@/components/common/ConfirmDeleteModal";

export function BankAccounts() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Cache to prevent flickering on load by predicting the layout
  const cachedHasAccounts = localStorage.getItem('bank_accounts_hasAccounts') !== 'false';
  const [hasAccountsCache, setHasAccountsCache] = useState(cachedHasAccounts);

  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [editingTx, setEditingTx] = useState<any | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, accountId: string } | null>(null);
  
  const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; type: 'account' | 'transaction'; id: string | null }>({ isOpen: false, type: 'account', id: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/bank_accounts");
      const data = await res.json();
      const mapped = data.map((a: any) => ({
        ...a,
        bankName: a.bank_name,
        accountNumber: a.account_number,
        transactions: a.transactions || []
      }));
      setAccounts(mapped);
      
      const hasAccounts = mapped.length > 0;
      setHasAccountsCache(hasAccounts);
      localStorage.setItem('bank_accounts_hasAccounts', hasAccounts ? 'true' : 'false');

      if (mapped.length > 0) {
        setSelectedId(prev => prev || mapped[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleDelete = (id: string) => {
    setDeleteModalState({ isOpen: true, type: 'account', id });
  };

  // Transfer / adjustment modals
  const [activeModal, setActiveModal] = useState<string | null>(null);
  // activeModal: "Bank to Cash Transfer" | "Cash to Bank Transfer" | "Bank to Bank Transfer"

  const handleDeleteTransaction = (txId: string) => {
    setDeleteModalState({ isOpen: true, type: 'transaction', id: txId });
  };

  const confirmDelete = async () => {
    const { type, id } = deleteModalState;
    if (!id) return;

    setIsDeleting(true);
    try {
      if (type === 'account') {
        const res = await fetch(`/api/bank_accounts/${id}`, { method: "DELETE" });
        if (res.ok) {
          fetchAccounts();
          if (selectedId === id) setSelectedId(null);
        }
      } else {
        const res = await fetch(`/api/bank_account_transactions/${id}`, { method: "DELETE" });
        if (res.ok) {
          fetchAccounts();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
      setDeleteModalState({ isOpen: false, type: 'account', id: null });
    }
  };

  const selectedAccount = accounts.find((a: BankAccount) => a.id === selectedId);

  const isEmpty = accounts.length === 0;
  const showEmptyState = !isLoading ? isEmpty : !hasAccountsCache;

  return (
    <div className="h-full flex flex-col bg-[#D0DCE7] gap-1 p-1" onClick={() => setContextMenu(null)}>
      {/* Top bar */}
      {!showEmptyState && (
        <div className="bg-white rounded-md shadow-sm px-6 py-3 flex items-center justify-between mx-1">
          <h1 className="text-base font-semibold text-gray-900">Banks</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdd(true)}
              disabled={isLoading}
              className="bg-[#E53935] hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add Bank
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="bg-white rounded-md shadow-sm flex-1 overflow-hidden mx-1 flex">
        {showEmptyState ? (
          <EmptyState onAdd={() => setShowAdd(true)} />
        ) : isLoading ? (
          <div className="flex-1 flex items-center justify-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53935]"></div>
          </div>
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
                  setActiveModal(action);
                }}
                onEditTransaction={(tx) => {
                  setEditingTx(tx);
                  if (String(tx.id).endsWith('-bank')) {
                    if (tx.name.includes("Transfer to Cash") || tx.type === "Payment Out") {
                      setActiveModal("Bank to Cash Transfer");
                    } else if (tx.name.includes("Transfer from Cash") || tx.type === "Payment In") {
                      setActiveModal("Cash to Bank Transfer");
                    } else {
                      setActiveModal("deposit");
                    }
                  } else if (String(tx.id).endsWith('-bank-in') || String(tx.id).endsWith('-bank-out')) {
                    setActiveModal("Bank to Bank Transfer");
                  } else {
                    setActiveModal("deposit");
                  }
                }}
                onDeleteTransaction={handleDeleteTransaction}
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
        onClose={() => {
          setActiveModal(null);
          setEditingTx(null);
        }}
        accounts={accounts}
        onSuccess={fetchAccounts}
        initialData={editingTx}
      />
      <CashToBankModal
        open={activeModal === "Cash to Bank Transfer"}
        onClose={() => {
          setActiveModal(null);
          setEditingTx(null);
        }}
        accounts={accounts}
        onSuccess={fetchAccounts}
        initialData={editingTx}
      />
      <BankToBankModal
        open={activeModal === "Bank to Bank Transfer"}
        onClose={() => {
          setActiveModal(null);
          setEditingTx(null);
        }}
        accounts={accounts}
        onSuccess={fetchAccounts}
        initialData={editingTx}
      />

      {selectedAccount && (
        <DepositWithdrawModal
          open={activeModal === "deposit"}
          onClose={() => {
            setActiveModal(null);
            setEditingTx(null);
          }}
          account={selectedAccount}
          onSuccess={fetchAccounts}
          initialData={editingTx}
        />
      )}

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
      
      <ConfirmDeleteModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, type: 'account', id: null })}
        onConfirm={confirmDelete}
        title={deleteModalState.type === 'account' ? "Delete Bank Account" : "Delete Transaction"}
        message={deleteModalState.type === 'account' 
          ? "Are you sure you want to delete this bank account? This action cannot be undone."
          : "Are you sure you want to delete this transaction? This action cannot be undone."}
        isDeleting={isDeleting}
      />
    </div>
  );
}
