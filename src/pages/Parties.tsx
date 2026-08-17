import { useEffect, useState, useCallback } from "react";
import { useSettings } from "@/hooks/useSettings";
import type { Party, Transaction, SaleInvoiceEditData } from "@/types";
import { PartiesHeader } from "@/components/pagescomponents/parties/PartiesHeader";
import { PartiesEmptyState } from "@/components/pagescomponents/parties/PartiesEmptyState";
import { PartyList } from "@/components/pagescomponents/parties/PartyList";
import { PartyDetails, type PartyTransactionRow } from "@/components/pagescomponents/parties/PartyDetails";
import { AddPartyDialog } from "@/components/pagescomponents/parties/AddPartyDialog";

type TransactionApiRow = {
  id: string;
  invoice_no: string;
  date: string;
  party_name: string;
  party_id?: string | null;
  transaction_type?: string | null;
  payment_type?: string | null;
  amount: number;
  balance: number;
  status?: string | null;
};

function normalizeTransactionType(value: string | null | undefined): Transaction["type"] {
  const normalizedValue = String(value ?? "").toLowerCase();

  if (normalizedValue.includes("payable opening balance")) {
    return "Payable Opening Balance";
  }

  if (normalizedValue.includes("receivable opening balance")) {
    return "Receivable Opening Balance";
  }

  if (normalizedValue.includes("payment-in")) {
    return "Payment-In";
  }

  if (normalizedValue.includes("payment-out")) {
    return "Payment-Out";
  }

  if (normalizedValue.includes("purchase")) {
    return "Purchase";
  }

  if (normalizedValue.includes("sale")) {
    return "Sale";
  }

  return "Sale";
}

function normalizePartyTransaction(row: TransactionApiRow): PartyTransactionRow {
  const numericPartyId = Number(row.party_id);
  const resolvedType = normalizeTransactionType(row.transaction_type);

  return {
    id: row.id,
    type: resolvedType,
    invoiceNo: row.invoice_no,
    date: row.date,
    partyName: row.party_name,
    amount: Number(row.amount ?? 0),
    balance: Number(row.balance ?? 0),
    paymentType: row.payment_type ?? undefined,
    status:
      row.status === "Paid" || row.status === "Unpaid" || row.status === "Open" || row.status === "Cancelled"
        ? row.status
        : Number(row.balance ?? 0) === 0
          ? "Paid"
          : "Unpaid",
    partyId: Number.isFinite(numericPartyId) ? numericPartyId : undefined,
    rawRow: row,
  };
}

interface PartiesProps {
  isReportView?: boolean;
  onBack?: () => void;
  onEditSaleInvoice?: (invoice: SaleInvoiceEditData) => void;
}

export function Parties({ isReportView, onBack, onEditSaleInvoice }: PartiesProps = {}) {
  const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });
  const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
  const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;

  const [parties, setParties] = useState<Party[]>([]);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [showAddParty, setShowAddParty] = useState(false);
  const [showCreditLimitError, setShowCreditLimitError] = useState(false);
  const [partyBeingEdited, setPartyBeingEdited] = useState<Party | null>(null);
  const [isSavingParty, setIsSavingParty] = useState(false);
  const [isDeletingParty, setIsDeletingParty] = useState(false);
  const [partyPendingDelete, setPartyPendingDelete] = useState<Party | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [transactionSearchTerm, setTransactionSearchTerm] = useState("");
  const [showTransactionSearch, setShowTransactionSearch] = useState(false);
  const [showShippingAddress, setShowShippingAddress] = useState(false);
  const [activeTab, setActiveTab] = useState<"address" | "credit">("address");
  const [partyTransactionsFromApi, setPartyTransactionsFromApi] = useState<PartyTransactionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cache to prevent flickering on load by predicting the layout
  const cachedHasParties = localStorage.getItem('parties_hasParties') !== 'false';
  const [hasPartiesCache, setHasPartiesCache] = useState(cachedHasParties);

  const [partyForm, setPartyForm] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    billingAddress: "",
    shippingAddress: "",
    openingBalance: "",
    asOfDate: new Date().toLocaleDateString("en-IN"),
    balanceType: "to-receive" as "to-pay" | "to-receive",
    creditLimit: "no-limit" as "no-limit" | "custom",
    creditLimitAmount: "",
  });

  const resetPartyForm = () => {
    setPartyForm({
      name: "",
      phoneNumber: "",
      email: "",
      billingAddress: "",
      shippingAddress: "",
      openingBalance: "",
      asOfDate: new Date().toLocaleDateString("en-IN"),
      balanceType: "to-receive",
      creditLimit: "no-limit",
      creditLimitAmount: "",
    });
    setActiveTab("address");
  };

  const openAddPartyDialog = () => {
    setPartyBeingEdited(null);
    resetPartyForm();
    setShowShippingAddress(false);
    setShowAddParty(true);
  };

  const openEditPartyDialog = (party: Party) => {
    setPartyBeingEdited(party);
    setPartyForm({
      name: party.name,
      phoneNumber: party.phone,
      email: party.email ?? "",
      billingAddress: party.address ?? "",
      shippingAddress: party.shippingAddress ?? "",
      openingBalance: Math.abs(party.balance).toString(),
      asOfDate: new Date().toLocaleDateString("en-IN"),
      balanceType: party.balance < 0 ? "to-pay" : "to-receive",
      creditLimit: party.creditLimit ? "custom" : "no-limit",
      creditLimitAmount: party.creditLimit ? party.creditLimit.toString() : "",
    });
    setShowShippingAddress(!!party.shippingAddress);
    setActiveTab("address");
    setShowAddParty(true);
  };

  const loadPartiesAndTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        partiesResponse,
        saleInvoicesResponse,
        purchaseBillsResponse,
        paymentInResponse,
        paymentOutResponse
      ] = await Promise.all([
        fetch('/api/parties'),
        fetch('/api/sale_invoices'),
        fetch('/api/purchase_bills'),
        fetch('/api/payment_in_records'),
        fetch('/api/payment_out_records'),
      ]);

      if (!partiesResponse.ok) {
        throw new Error('Failed to load parties');
      }

      const dbParties = (await partiesResponse.json()) as Array<{
        id: number;
        name: string;
        phone: string;
        email?: string | null;
        address?: string | null;
        shipping_address?: string | null;
        balance: number;
        credit_limit?: number | null;
        type: 'customer' | 'supplier' | 'both';
      }>;

      const saleTransactions = saleInvoicesResponse.ok
        ? ((await saleInvoicesResponse.json()) as TransactionApiRow[]).map((row) => ({
          ...normalizePartyTransaction({
            ...row,
            transaction_type: row.transaction_type ?? 'Sale',
          }),
        }))
        : [];

      const purchaseTransactions = purchaseBillsResponse.ok
        ? ((await purchaseBillsResponse.json()) as TransactionApiRow[]).map((row) => ({
          ...normalizePartyTransaction({
            ...row,
            transaction_type: row.transaction_type ?? 'Purchase',
          }),
        }))
        : [];

      const paymentInTransactions = paymentInResponse.ok
        ? ((await paymentInResponse.json()) as any[]).map((row) => ({
          ...normalizePartyTransaction({
            ...row,
            transaction_type: row.payment_type === 'Payable Opening Balance' || row.payment_type === 'Receivable Opening Balance' || row.payment_type === 'Opening Balance'
              ? row.payment_type
              : 'Payment-In',
            invoice_no: row.receipt_no,
            balance: 0,
          }),
        }))
        : [];

      const paymentOutTransactions = paymentOutResponse.ok
        ? ((await paymentOutResponse.json()) as any[]).map((row) => ({
          ...normalizePartyTransaction({
            ...row,
            transaction_type: row.payment_type === 'Receivable Opening Balance' || row.payment_type === 'Payable Opening Balance' || row.payment_type === 'Opening Balance'
              ? row.payment_type
              : 'Payment-Out',
            invoice_no: row.payment_no,
            balance: 0,
          }),
        }))
        : [];

      const normalizedParties: Party[] = dbParties.map((party) => ({
        id: party.id,
        name: party.name,
        phone: party.phone,
        email: party.email ?? undefined,
        address: party.address ?? undefined,
        shippingAddress: party.shipping_address ?? undefined,
        balance: Number(party.balance ?? 0),
        creditLimit: party.credit_limit ? Number(party.credit_limit) : undefined,
        type: party.type,
      }));

      setParties(normalizedParties);
      setPartyTransactionsFromApi([
        ...saleTransactions,
        ...purchaseTransactions,
        ...paymentInTransactions,
        ...paymentOutTransactions,
      ]);
      setSelectedParty((previousSelectedParty) => {
        if (!normalizedParties.length) {
          return null;
        }

        if (!previousSelectedParty) {
          return normalizedParties[0];
        }

        return (
          normalizedParties.find((party) => party.id === previousSelectedParty.id) ??
          normalizedParties[0]
        );
      });

      const hasParties = normalizedParties.length > 0;
      setHasPartiesCache(hasParties);
      localStorage.setItem('parties_hasParties', hasParties ? 'true' : 'false');

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPartiesAndTransactions();
  }, [loadPartiesAndTransactions]);



  const filteredParties = parties.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const partyTransactions = (() => {
    const baseTransactions = [...partyTransactionsFromApi].filter(
      (transaction) => {
        if (!selectedParty) {
          return false;
        }

        if (transaction.partyId !== undefined && selectedParty.id !== undefined) {
          if (Number(transaction.partyId) === Number(selectedParty.id)) {
            return true;
          }
        }

        return String(transaction.partyName).trim().toLowerCase() === String(selectedParty.name).trim().toLowerCase();
      },
    );

    if (selectedParty) {
      const netTransactionsEffect = baseTransactions.reduce((acc, t) => {
        if (t.type === "Sale" || t.type === "Payment-Out") return acc + t.amount;
        if (t.type === "Purchase" || t.type === "Payment-In") return acc - t.amount;
        return acc;
      }, 0);

      const initialOpeningBalance = selectedParty.balance - netTransactionsEffect;

      if (Math.abs(initialOpeningBalance) > 0.01) {
        baseTransactions.push({
          id: "opening-balance-dynamic",
          type: initialOpeningBalance > 0 ? "Receivable Opening Balance" : "Payable Opening Balance",
          invoiceNo: "",
          date: new Date().toLocaleDateString("en-IN"),
          partyName: selectedParty.name,
          amount: Math.abs(initialOpeningBalance),
          balance: Math.abs(initialOpeningBalance),
          partyId: selectedParty.id,
        });
      }
    }

    return baseTransactions;
  })();

  const filteredPartyTransactions = partyTransactions.filter((t) => {
    if (!transactionSearchTerm) return true;
    const term = transactionSearchTerm.toLowerCase();
    return (
      (t.invoiceNo && t.invoiceNo.toLowerCase().includes(term)) ||
      (t.date && t.date.toLowerCase().includes(term)) ||
      (t.type && t.type.toLowerCase().includes(term)) ||
      (t.amount.toString().includes(term)) ||
      (t.balance.toString().includes(term))
    );
  }).sort((a, b) => {
    const parseDate = (d: string) => {
      if (!d) return 0;
      const parts = d.split('/');
      if (parts.length === 3) {
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
      }
      return new Date(d).getTime();
    };
    return parseDate(b.date) - parseDate(a.date);
  });

  const handlePrintTransactions = () => {
    if (!selectedParty) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const html = `
      <html>
        <head>
          <title>Transactions - ${selectedParty.name}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h2>Transactions - ${selectedParty.name}</h2>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Number</th>
                <th>Date</th>
                <th>Total</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPartyTransactions.map(t => `
                <tr>
                  <td>${t.type}</td>
                  <td>${t.invoiceNo || ''}</td>
                  <td>${t.date}</td>
                  <td>${currencyStr} ${t.amount.toFixed(2)}</td>
                  <td>${currencyStr} ${t.balance.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 250);
    } else {
      document.body.removeChild(iframe);
    }
  };

  const handleExportExcel = () => {
    if (!selectedParty) return;

    const headers = ["Type", "Number", "Date", "Total", "Balance"];
    const rows = filteredPartyTransactions.map(t => [
      t.type,
      t.invoiceNo || "",
      t.date,
      t.amount.toFixed(2),
      t.balance.toFixed(2)
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${selectedParty.name}_transactions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  const handleSaveParty = async (
    options?: {
      closeDialog?: boolean;
      resetForm?: boolean;
    },
  ) => {
    if (!partyForm.name.trim() || isSavingParty) {
      return;
    }

    if (partyForm.creditLimit === 'custom' && partyForm.creditLimitAmount && partyForm.balanceType === 'to-receive') {
      const openingBalance = Number(partyForm.openingBalance || 0);
      const creditLimitAmount = Number(partyForm.creditLimitAmount || 0);
      if (Math.abs(openingBalance) > creditLimitAmount) {
        setShowCreditLimitError(true);
        return;
      }
    }

    const shouldCloseDialog = options?.closeDialog ?? true;
    const shouldResetForm = options?.resetForm ?? true;

    setIsSavingParty(true);

    try {
      const openingBalance = Number(partyForm.openingBalance || 0);
      const balance = Number.isFinite(openingBalance)
        ? partyForm.balanceType === 'to-pay'
          ? -Math.abs(openingBalance)
          : Math.abs(openingBalance)
        : 0;

      const response = await fetch('/api/parties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: partyBeingEdited?.id,
          name: partyForm.name,
          phone: partyForm.phoneNumber,
          email: partyForm.email,
          address: partyForm.billingAddress,
          shippingAddress: partyForm.shippingAddress,
          balance,
          creditLimit: partyForm.creditLimit === 'custom' ? Number(partyForm.creditLimitAmount) : null,
          asOfDate: partyForm.asOfDate,
          type: partyBeingEdited?.type ?? 'customer',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save party');
      }

      const createdParty = (await response.json()) as {
        id: number;
        name: string;
        phone: string;
        email?: string | null;
        address?: string | null;
        shippingAddress?: string | null;
        balance: number;
        creditLimit?: number | null;
        type: 'customer' | 'supplier' | 'both';
      };

      const normalizedParty: Party = {
        id: createdParty.id,
        name: createdParty.name,
        phone: createdParty.phone,
        email: createdParty.email ?? undefined,
        address: createdParty.address ?? undefined,
        shippingAddress: createdParty.shippingAddress ?? undefined,
        balance: Number(createdParty.balance ?? 0),
        creditLimit: createdParty.creditLimit ? Number(createdParty.creditLimit) : undefined,
        type: createdParty.type,
      };

      setParties((prev) => {
        const hasExistingParty = prev.some(
          (party) => party.id === normalizedParty.id,
        );

        const nextParties = hasExistingParty
          ? prev.map((party) =>
            party.id === normalizedParty.id ? normalizedParty : party,
          )
          : [...prev, normalizedParty];

        return nextParties.sort((a, b) => a.name.localeCompare(b.name));
      });

      setSelectedParty(normalizedParty);
      await loadPartiesAndTransactions();
      if (shouldResetForm) {
        resetPartyForm();
      }

      if (shouldCloseDialog) {
        setPartyBeingEdited(null);
        setShowAddParty(false);
      } else {
        setPartyBeingEdited(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSavingParty(false);
    }
  };

  const handleDeleteParty = async (partyToDelete: Party) => {
    if (isDeletingParty) {
      return;
    }

    setIsDeletingParty(true);

    try {
      const response = await fetch(`/api/parties/${partyToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete party');
      }

      setParties((previousParties) => {
        const nextParties = previousParties.filter(
          (party) => party.id !== partyToDelete.id,
        );

        setSelectedParty((previousSelectedParty) => {
          if (!previousSelectedParty || previousSelectedParty.id !== partyToDelete.id) {
            return previousSelectedParty;
          }

          if (!nextParties.length) {
            return null;
          }

          return nextParties[0];
        });

        return nextParties;
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeletingParty(false);
      setPartyPendingDelete(null);
    }
  };

  const showEmptyState = !isLoading ? parties.length === 0 : !hasPartiesCache;

  return (
    <div className="h-full flex flex-col [background-color:#D0DCE7] p-0 gap-1">
      {!showEmptyState && (
        <PartiesHeader
          isLoading={isLoading}
          onAddParty={openAddPartyDialog}
          isReportView={isReportView}
          onBack={onBack}
        />
      )}

      {showEmptyState ? (
        <PartiesEmptyState onAddParty={openAddPartyDialog} isReportView={isReportView} />
      ) : (
        <div className="flex-1 flex gap-1 overflow-hidden">
          <PartyList
            isLoading={isLoading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredParties={filteredParties}
            selectedParty={selectedParty}
            setSelectedParty={setSelectedParty}
            openEditPartyDialog={openEditPartyDialog}
            setPartyPendingDelete={setPartyPendingDelete}
            isReportView={isReportView}
          />
          <PartyDetails
            isLoading={isLoading}
            selectedParty={selectedParty}
            filteredPartyTransactions={filteredPartyTransactions}
            showTransactionSearch={showTransactionSearch}
            setShowTransactionSearch={setShowTransactionSearch}
            transactionSearchTerm={transactionSearchTerm}
            setTransactionSearchTerm={setTransactionSearchTerm}
            handlePrintTransactions={handlePrintTransactions}
            handleExportExcel={handleExportExcel}
            openEditPartyDialog={openEditPartyDialog}
            isReportView={isReportView}
            loadPartiesAndTransactions={loadPartiesAndTransactions}
            onEditSaleInvoice={onEditSaleInvoice}
          />
        </div>
      )}

      <AddPartyDialog
        showAddParty={showAddParty}
        setShowAddParty={setShowAddParty}
        partyBeingEdited={partyBeingEdited}
        setPartyBeingEdited={setPartyBeingEdited}
        resetPartyForm={resetPartyForm}
        partyForm={partyForm}
        setPartyForm={setPartyForm}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showShippingAddress={showShippingAddress}
        setShowShippingAddress={setShowShippingAddress}
        handleSaveParty={handleSaveParty}
        isSavingParty={isSavingParty}
        partyPendingDelete={partyPendingDelete}
        setPartyPendingDelete={setPartyPendingDelete}
        isDeletingParty={isDeletingParty}
        handleDeleteParty={handleDeleteParty}
        showCreditLimitError={showCreditLimitError}
        setShowCreditLimitError={setShowCreditLimitError}
      />
    </div>
  );
}
