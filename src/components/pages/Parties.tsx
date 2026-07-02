import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Plus,
  Edit2,
  Phone,
  Mail,
  ChevronDown,
  Printer,
  Settings,
  MoreVertical,
} from "lucide-react";
import type { Party } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Transaction } from "@/types";

type PartyContextMenuState = {
  party: Party;
  x: number;
  y: number;
};

type PartyTransactionRow = {
  id: string;
  type: Transaction["type"];
  invoiceNo?: string;
  date: string;
  partyName: string;
  amount: number;
  balance: number;
  paymentType?: string;
  status?: Transaction["status"];
  partyId?: number;
};

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
  };
}

export function Parties() {
  const [parties, setParties] = useState<Party[]>([]);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [showAddParty, setShowAddParty] = useState(false);
  const [partyBeingEdited, setPartyBeingEdited] = useState<Party | null>(null);
  const [isSavingParty, setIsSavingParty] = useState(false);
  const [isDeletingParty, setIsDeletingParty] = useState(false);
  const [partyPendingDelete, setPartyPendingDelete] = useState<Party | null>(null);
  const [partyContextMenu, setPartyContextMenu] =
    useState<PartyContextMenuState | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [transactionSearchTerm, setTransactionSearchTerm] = useState("");
  const [showTransactionSearch, setShowTransactionSearch] = useState(false);
  const [showShippingAddress, setShowShippingAddress] = useState(false);
  const [activeTab, setActiveTab] = useState<"address" | "credit">("address");
  const [partyTransactionsFromApi, setPartyTransactionsFromApi] = useState<PartyTransactionRow[]>([]);
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
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    loadPartiesAndTransactions();
  }, [loadPartiesAndTransactions]);

  useEffect(() => {
    if (!partyContextMenu) {
      return;
    }

    const closeMenu = () => setPartyContextMenu(null);

    window.addEventListener('click', closeMenu);
    window.addEventListener('resize', closeMenu);
    window.addEventListener('scroll', closeMenu, true);

    return () => {
      window.removeEventListener('click', closeMenu);
      window.removeEventListener('resize', closeMenu);
      window.removeEventListener('scroll', closeMenu, true);
    };
  }, [partyContextMenu]);

  const filteredParties = parties.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const partyTransactions = [...partyTransactionsFromApi].filter(
    (transaction) => {
      if (!selectedParty) {
        return false;
      }

      if (transaction.partyId) {
        return transaction.partyId === selectedParty.id;
      }

      return transaction.partyName.toLowerCase() === selectedParty.name.toLowerCase();
    },
  );

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
                  <td>Rs ${t.amount.toFixed(2)}</td>
                  <td>Rs ${t.balance.toFixed(2)}</td>
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

  const selectedPartyBalanceLabel =
    selectedParty && selectedParty.balance > 0
      ? "Amount to Receive"
      : selectedParty && selectedParty.balance < 0
        ? "Amount to Pay"
        : "Balance Settled";

  const selectedPartyBalanceAmount = selectedParty
    ? Math.abs(selectedParty.balance).toFixed(2)
    : "0.00";

  const handleSaveParty = async (
    options?: {
      closeDialog?: boolean;
      resetForm?: boolean;
    },
  ) => {
    if (!partyForm.name.trim() || isSavingParty) {
      return;
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

  return (
    <div className="h-full flex flex-col [background-color:#D0DCE7] p-0 gap-1">
      {/* Top Header Card */}
      <div className="p-4 bg-white rounded-none flex items-center justify-between shrink-0 w-full">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-900">Parties</h2>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openAddPartyDialog}
            className="bg-[#E53935] hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Party
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Settings className="w-5 h-5 text-gray-500" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-1 overflow-hidden">
        {/* Left Panel Card - Party List */}
        <div className="w-80 bg-white rounded-md flex flex-col shrink-0 overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Party Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]"
              />
            </div>
          </div>

          {/* Party List Table */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">
                    <div className="flex items-center gap-2">
                      <span>Party Name</span>
                      <ChevronDown className="w-3 h-3 text-red-400" />
                    </div>
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-gray-600">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredParties.map((party) => (
                  <tr
                    key={party.id}
                    onClick={() => setSelectedParty(party)}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      setPartyContextMenu({
                        party,
                        x: event.clientX,
                        y: event.clientY,
                      });
                    }}
                    className={`cursor-pointer border-b border-gray-100 ${selectedParty?.id === party.id
                      ? "bg-blue-50 border-l-4 border-l-blue-500"
                      : "hover:bg-gray-50"
                      }`}
                  >
                    <td className="px-4 py-3">
                      <span className="text-gray-900">{party.name}</span>
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-medium ${party.balance > 0
                        ? "text-green-500"
                        : party.balance < 0
                          ? "text-red-500"
                          : "text-gray-900"
                        }`}
                    >
                      {party.balance.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {partyContextMenu && (
          <div
            className="fixed z-50 min-w-40 rounded-md border bg-white p-1 shadow-md"
            style={{
              top: partyContextMenu.y,
              left: partyContextMenu.x,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={() => {
                setSelectedParty(partyContextMenu.party);
                openEditPartyDialog(partyContextMenu.party);
                setPartyContextMenu(null);
              }}
              className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-gray-100"
            >
              View/Edit
            </button>
            <button
              onClick={() => {
                setPartyContextMenu(null);
                setPartyPendingDelete(partyContextMenu.party);
              }}
              className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        )}

        {/* Right Panel Card - Party Details */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedParty ? (
            <>
              {/* Party Details Card */}
              <div className="bg-white rounded-md shadow-sm mb-1">
                <div className="p-5 border-b border-gray-200 shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-gray-900">
                        {selectedParty.name}
                      </h2>
                      <Edit2
                        onClick={() => openEditPartyDialog(selectedParty)}
                        className="w-4 h-4 text-blue-500 cursor-pointer"
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <button
                        className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600"
                        onClick={() => {
                          if (selectedParty?.phone) {
                            const formattedPhone = selectedParty.phone.replace(/[^0-9+]/g, '');
                            window.open(`https://wa.me/${formattedPhone}`, '_blank');
                          }
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4 text-white"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                      </button>
                      <button
                        className="w-9 h-9 rounded-full bg-orange-400 flex items-center justify-center hover:bg-orange-500"
                        onClick={() => {
                          if (selectedParty?.email) {
                            window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${selectedParty.email}`, '_blank');
                          }
                        }}
                      >
                        <Mail className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Party Info */}
                  <div className="flex gap-10">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">
                        Phone Number
                      </p>
                      <p className="text-sm text-gray-900">
                        {selectedParty.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Email</p>
                      <p className="text-sm text-gray-900">
                        {selectedParty.email || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">
                        Credit / Balance
                      </p>
                      <p className="text-sm text-gray-900">
                        {selectedPartyBalanceLabel}
                      </p>
                      <p
                        className={`text-sm font-semibold ${selectedParty.balance > 0
                          ? "text-green-600"
                          : selectedParty.balance < 0
                            ? "text-red-600"
                            : "text-gray-900"
                          }`}
                      >
                        Rs {selectedPartyBalanceAmount}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transactions */}
              <div className="flex-1 bg-white rounded-md flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 shrink-0">
                  {showTransactionSearch ? (
                    <div className="flex-1 flex items-center bg-gray-50 rounded px-3 py-1.5 mr-4 border border-gray-200">
                      <Search className="w-4 h-4 text-gray-400 mr-2" />
                      <input
                        type="text"
                        placeholder="Search transactions..."
                        value={transactionSearchTerm}
                        onChange={(e) => setTransactionSearchTerm(e.target.value)}
                        onBlur={() => {
                          setTimeout(() => {
                            setShowTransactionSearch(false);
                            setTransactionSearchTerm("");
                          }, 150);
                        }}
                        className="flex-1 bg-transparent border-none outline-none text-sm"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <h3 className="text-base font-semibold text-gray-900">
                      Transactions
                    </h3>
                  )}
                  <div className="flex gap-2 items-center">
                    {!showTransactionSearch && (
                      <button
                        onClick={() => setShowTransactionSearch(true)}
                        className="p-1.5 hover:bg-gray-100 rounded"
                      >
                        <Search className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                    <button
                      onClick={handlePrintTransactions}
                      className="p-1.5 hover:bg-gray-100 rounded"
                    >
                      <Printer className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={handleExportExcel}
                      className="p-1.5 hover:bg-gray-100 rounded relative"
                    >
                      <span className="bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        xls
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">
                          <div className="flex items-center gap-2">
                            <span>Type</span>
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">
                          <div className="flex items-center gap-2">
                            <span>Number</span>
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">
                          <div className="flex items-center gap-2">
                            <span>Date</span>
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          </div>
                        </th>
                        <th className="px-4 py-3 text-right font-medium text-gray-500">
                          <div className="flex items-center justify-end gap-2">
                            <span>Total</span>
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          </div>
                        </th>
                        <th className="px-4 py-3 text-right font-medium text-gray-500">
                          <div className="flex items-center justify-end gap-2">
                            <span>Balance</span>
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          </div>
                        </th>
                        <th className="px-2 py-3 w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPartyTransactions.length > 0 ? (
                        filteredPartyTransactions.map((t) => (
                          <tr
                            key={t.id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="px-4 py-3">
                              <span
                                className={`${t.type === "Sale"
                                  ? "text-green-600"
                                  : t.type === "Purchase"
                                    ? "text-red-600"
                                    : "text-blue-600"
                                  }`}
                              >
                                {t.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              {t.invoiceNo}
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              {t.date}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-700">
                              Rs {t.amount.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-700">
                              Rs {t.balance.toFixed(2)}
                            </td>
                            <td className="px-2 py-3 text-center">
                              <MoreVertical className="w-4 h-4 text-gray-400 mx-auto cursor-pointer" />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-8 text-center text-gray-500"
                          >
                            No transactions found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a party to view details
            </div>
          )}
        </div>
      </div>

      {/* Add Party Modal */}
      <Dialog
        open={showAddParty}
        onOpenChange={(isOpen) => {
          setShowAddParty(isOpen);
          if (!isOpen) {
            setPartyBeingEdited(null);
            resetPartyForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex items-center justify-between">
            <DialogTitle>{partyBeingEdited ? "Edit Party" : "Add Party"}</DialogTitle>
          </DialogHeader>

          {/* Top Fields */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Party Name *
              </label>
              <input
                type="text"
                value={partyForm.name}
                onChange={(e) =>
                  setPartyForm({ ...partyForm, name: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]"
                placeholder="Party Name *"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={partyForm.phoneNumber}
                onChange={(e) =>
                  setPartyForm({ ...partyForm, phoneNumber: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]"
                placeholder="Phone Number"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveTab("address")}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === "address"
                ? "border-blue-500 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              Address
            </button>
            <button
              onClick={() => setActiveTab("credit")}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === "credit"
                ? "border-blue-500 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              Credit & Balance
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "address" && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email ID
                </label>
                <input
                  type="email"
                  value={partyForm.email}
                  onChange={(e) =>
                    setPartyForm({ ...partyForm, email: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]"
                  placeholder="Email ID"
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Billing Address
                </h3>
                <textarea
                  value={partyForm.billingAddress}
                  onChange={(e) =>
                    setPartyForm({
                      ...partyForm,
                      billingAddress: e.target.value,
                    })
                  }
                  placeholder="Billing Address"
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]"
                />
              </div>
              <div>
                {!showShippingAddress ? (
                  <button
                    onClick={() => setShowShippingAddress(true)}
                    className="text-blue-500 text-sm font-medium hover:text-blue-600"
                  >
                    + Enable Shipping Address
                  </button>
                ) : (
                  <>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Shipping Address
                    </h3>
                    <textarea
                      value={partyForm.shippingAddress}
                      onChange={(e) =>
                        setPartyForm({
                          ...partyForm,
                          shippingAddress: e.target.value,
                        })
                      }
                      placeholder="Shipping Address"
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]"
                    />
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === "credit" && (
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Opening Balance
                  </label>
                  <input
                    type="text"
                    value={partyForm.openingBalance}
                    onChange={(e) =>
                      setPartyForm({
                        ...partyForm,
                        openingBalance: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]"
                    placeholder="500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    As Of Date
                  </label>
                  <input
                    type="text"
                    value={partyForm.asOfDate}
                    onChange={(e) =>
                      setPartyForm({ ...partyForm, asOfDate: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]"
                    placeholder="21/02/2026"
                  />
                </div>
              </div>

              <div className="flex gap-6 my-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={partyForm.balanceType === "to-pay"}
                    onChange={() =>
                      setPartyForm({ ...partyForm, balanceType: "to-pay" })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">To Pay</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={partyForm.balanceType === "to-receive"}
                    onChange={() =>
                      setPartyForm({ ...partyForm, balanceType: "to-receive" })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">To Receive</span>
                </label>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Credit Limit
                </h3>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={partyForm.creditLimit === "no-limit"}
                      onChange={() =>
                        setPartyForm({ ...partyForm, creditLimit: "no-limit" })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-blue-500 font-medium">
                      No Limit
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={partyForm.creditLimit === "custom"}
                      onChange={() =>
                        setPartyForm({ ...partyForm, creditLimit: "custom" })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Custom Limit</span>
                  </label>
                </div>
                {partyForm.creditLimit === "custom" && (
                  <div className="mt-3">
                    <input
                      type="number"
                      value={partyForm.creditLimitAmount}
                      onChange={(e) =>
                        setPartyForm({
                          ...partyForm,
                          creditLimitAmount: e.target.value,
                        })
                      }
                      placeholder="Enter amount"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200 justify-end">
            <button
              onClick={() => {
                setShowAddParty(false);
                setPartyBeingEdited(null);
                resetPartyForm();
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            {!partyBeingEdited && (
              <button
                onClick={() =>
                  void handleSaveParty({ closeDialog: false, resetForm: true })
                }
                disabled={isSavingParty || !partyForm.name.trim()}
                className="px-6 py-2 border border-blue-500 rounded-lg text-sm font-medium text-blue-500 hover:bg-blue-50"
              >
                Save & New
              </button>
            )}
            <button
              onClick={() =>
                void handleSaveParty({ closeDialog: true, resetForm: true })
              }
              disabled={isSavingParty || !partyForm.name.trim()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
            >
              {isSavingParty
                ? partyBeingEdited
                  ? "Updating..."
                  : "Saving..."
                : partyBeingEdited
                  ? "Update"
                  : "Save"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(partyPendingDelete)}
        onOpenChange={(isOpen) => {
          if (!isOpen && !isDeletingParty) {
            setPartyPendingDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Party</AlertDialogTitle>
            <AlertDialogDescription>
              {partyPendingDelete
                ? `Are you sure you want to delete ${partyPendingDelete.name}? This action cannot be undone.`
                : "Are you sure you want to delete this party?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingParty}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              asChild
              className="bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
            >
              <button
                type="button"
                disabled={isDeletingParty || !partyPendingDelete}
                onClick={() => {
                  if (!partyPendingDelete) {
                    return;
                  }

                  void handleDeleteParty(partyPendingDelete);
                }}
              >
                {isDeletingParty ? "Deleting..." : "Delete"}
              </button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
