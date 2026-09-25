import { useState, useEffect } from "react";
import { Landmark } from "lucide-react";
import { BankAccountsView } from "../components/pagescomponents/cashbank/BankAccountsView";
import { CashInHandView } from "../components/pagescomponents/cashbank/CashInHandView";

interface CashBankProps {
  subView: string;
}

export interface Transaction {
  id: string;
  type: string;
  name: string;
  date: string;
  amount: number | string;
}

export function CashBank({ subView }: CashBankProps) {
  const [, setShowAddBank] = useState(false);
  const [showAdjustCash, setShowAdjustCash] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCash, setTotalCash] = useState(0);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; transaction: Transaction } | null>(null);
  const [detailsTransaction, setDetailsTransaction] = useState<Transaction | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/cash_transactions");
      if (res.ok) {
        const data = await res.json();
        // Backend returns { transactions, totalCash }
        setTransactions(data.transactions ?? data);
        setTotalCash(typeof data.totalCash === 'number' ? data.totalCash : 0);
      }
    } catch (e) {
      console.error("Failed to load cash transactions", e);
    }
  };

  useEffect(() => {
    if (subView === "cash-in-hand") {
      fetchTransactions();
    }
  }, [subView]);

  // Re-fetch cash transactions whenever an expense record is added/deleted from the Expenses page,
  // so Cash In Hand stays in sync without a manual page refresh.
  useEffect(() => {
    const handleExpensesRefresh = () => {
      if (subView === "cash-in-hand") {
        fetchTransactions();
      }
    };
    window.addEventListener("expenses-refresh", handleExpensesRefresh);
    return () => window.removeEventListener("expenses-refresh", handleExpensesRefresh);
  }, [subView]);

  // Re-fetch cash transactions whenever a purchase bill is added/deleted from the Purchase Bills page,
  // so Cash In Hand stays in sync without a manual page refresh.
  useEffect(() => {
    const handlePurchaseRefresh = () => {
      if (subView === "cash-in-hand") {
        fetchTransactions();
      }
    };
    window.addEventListener("purchase-bills-refresh", handlePurchaseRefresh);
    return () => window.removeEventListener("purchase-bills-refresh", handlePurchaseRefresh);
  }, [subView]);

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/cash_transactions?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchTransactions();
        // If we deleted a linked cash expense, notify the Expenses page to re-fetch its records too.
        if (id.startsWith('cash_expense_')) {
          window.dispatchEvent(new CustomEvent('expenses-refresh'));
        }
        // If we deleted a linked cash purchase, notify the Purchase Bills page to re-fetch its records too.
        if (id.startsWith('cash_purchase_')) {
          window.dispatchEvent(new CustomEvent('purchase-bills-refresh'));
        }
      } else {
        alert("Cannot delete a system transaction here. Delete the original invoice instead.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
      setContextMenu(null);
    }
  };

  const handleEdit = async (tx: Transaction, updatedAmount: number) => {
    try {
      const res = await fetch(`/api/cash_transactions?id=${tx.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: tx.date,
          name: tx.name,
          type: tx.type,
          amount: Math.abs(updatedAmount),
        }),
      });
      if (res.ok) {
        fetchTransactions();
        setEditingTransaction(null);
      } else {
        alert("Could not edit this transaction.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (subView === "bank-accounts") {
    return (
      <BankAccountsView setShowAddBank={setShowAddBank} />
    );
  }

  if (subView === "cash-in-hand") {
    return (
      <CashInHandView
        totalCash={totalCash}
        transactions={transactions}
        showAdjustCash={showAdjustCash}
        setShowAdjustCash={setShowAdjustCash}
        fetchTransactions={fetchTransactions}
        contextMenu={contextMenu}
        setContextMenu={setContextMenu}
        detailsTransaction={detailsTransaction}
        setDetailsTransaction={setDetailsTransaction}
        editingTransaction={editingTransaction}
        setEditingTransaction={setEditingTransaction}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
        isDeleting={isDeleting}
      />
    );
  }

  return (
    <div className="h-full flex items-center justify-center bg-white">
      <div className="text-center text-gray-500">
        <Landmark className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-lg">Select a Cash & Bank option from the sidebar</p>
      </div>
    </div>
  );
}
