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
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; transaction: Transaction } | null>(null);
  const [detailsTransaction, setDetailsTransaction] = useState<Transaction | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/cash_transactions");
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
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

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const totalCash = transactions.reduce((acc, tx) => {
    const type = String(tx.type).toLowerCase();
    const isCashIn = type.includes("in") || type === "sale" || type.includes("add") || type.includes("increase") || type === "pos sale";
    return isCashIn ? acc + Number(tx.amount) : acc - Number(tx.amount);
  }, 0);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/cash_transactions?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchTransactions();
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
