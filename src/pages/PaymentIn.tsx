import { useState, useRef, useEffect } from "react";
import { PaymentInHeader } from "@/components/pagescomponents/paymentin/PaymentInHeader";
import { PaymentInFilters } from "@/components/pagescomponents/paymentin/PaymentInFilters";
import { PaymentInSummary } from "@/components/pagescomponents/paymentin/PaymentInSummary";
import { PaymentInTable } from "@/components/pagescomponents/paymentin/PaymentInTable";
import { AddPaymentInModal } from "@/components/pagescomponents/paymentin/AddPaymentInModal";
import { PaymentInRowMenu } from "@/components/pagescomponents/paymentin/PaymentInRowMenu";
import { ViewPaymentInModal } from "@/components/pagescomponents/paymentin/ViewPaymentInModal";
import { EnterPasscodeScreen } from "@/components/common/EnterPasscodeScreen";
import { useSettings } from "@/hooks/useSettings";

export function PaymentIn() {
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [parties, setParties] = useState<any[]>([]);
  const [selectedParty, setSelectedParty] = useState("");
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [viewingRecord, setViewingRecord] = useState<any>(null);
  
  const [paymentType, setPaymentType] = useState("Cash");
  const [amount, setAmount] = useState("");
  const [receiptNo, setReceiptNo] = useState("1");
  const [referenceNo, setReferenceNo] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toLocaleDateString('en-GB'));
  const [description, setDescription] = useState("");
  const [showDescription, setShowDescription] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [openRowMenuId, setOpenRowMenuId] = useState<string | null>(null);
  const [openRowMenuPosition, setOpenRowMenuPosition] = useState<{ left: number; top: number } | null>(null);

  const [isPasscodeEnabled] = useSettings('settings.isPasscodeEnabled', false);
  const [isPasscodeForTransactionEnabled] = useSettings('settings.isPasscodeForTransactionEnabled', false);
  const [passcodeAction, setPasscodeAction] = useState<{ type: 'edit' | 'delete', payload: string } | null>(null);

  const fetchData = () => {
    fetch('/api/payment_in_records')
      .then(res => res.json())
      .then(data => setRecords(data))
      .catch(err => console.error("Failed to fetch payment_in_records:", err));
    fetch('/api/parties')
      .then(res => res.json())
      .then(data => {
         setParties(data);
         if (data.length > 0 && !selectedParty) setSelectedParty(String(data[0].id));
      })
      .catch(console.error);
    fetch('/api/bank_accounts')
      .then(res => res.json())
      .then(data => setBankAccounts(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const closeMenus = () => {
      setOpenRowMenuId(null);
      setOpenRowMenuPosition(null);
    };

    window.addEventListener("click", closeMenus);
    window.addEventListener("scroll", closeMenus, true);

    return () => {
      window.removeEventListener("click", closeMenus);
      window.removeEventListener("scroll", closeMenus, true);
    };
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        const response = await fetch(`/api/payment_in_records/${id}`, { method: "DELETE" });
        if (!response.ok && response.status !== 204) {
          throw new Error("Failed to delete transaction");
        }
        setRecords((prev) => prev.filter((r) => r.id !== id));
      } catch (error) {
        console.error("Delete error:", error);
        alert("Failed to delete the selected transaction.");
      }
    }
  };

  const handleDeleteClick = (id: string) => {
    if (isPasscodeEnabled && isPasscodeForTransactionEnabled) {
      setPasscodeAction({ type: 'delete', payload: id });
    } else {
      handleDelete(id);
    }
  };

  const handleEditClick = (show: boolean) => {
    if (show && isPasscodeEnabled && isPasscodeForTransactionEnabled) {
      setPasscodeAction({ type: 'edit', payload: '' });
    } else {
      setShowAddPayment(show);
    }
  };

  const handlePasscodeSuccess = () => {
    if (passcodeAction?.type === 'delete') {
      handleDelete(passcodeAction.payload);
    } else if (passcodeAction?.type === 'edit') {
      setShowAddPayment(true);
    }
    setPasscodeAction(null);
  };

  const totalAmount = records.reduce((sum, p) => sum + p.amount, 0);
  const totalReceived = totalAmount;
  const totalOpen = parties.reduce((sum, p) => sum + Number(p.balance || 0), 0);

  const partyOptions = parties.map(p => ({
    value: String(p.id),
    label: p.name,
    balance: Number(p.balance || 0),
  }));

  const selectedPartyBalance =
    partyOptions.find((party) => party.value === selectedParty)?.balance ?? 0;

  const handleSave = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    const party = parties.find(p => String(p.id) === selectedParty);
    const payload = {
      receiptNo,
      date: paymentDate,
      partyId: selectedParty,
      partyName: party ? party.name : "Cash Sale",
      amount: Number(amount),
      paymentType,
      reference: referenceNo,
      description: showDescription ? description : "",
      imageDataUrl: imageDataUrl || undefined,
    };
    try {
      const response = await fetch('/api/payment_in_records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setShowAddPayment(false);
        setAmount("");
        setReferenceNo("");
        setDescription("");
        setShowDescription(false);
        setImageDataUrl("");
        fetchData();
      } else {
        alert("Failed to save payment in record.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save payment in record.");
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#D0DCE7] gap-1 overflow-y-auto">
      <PaymentInHeader onAddPaymentClick={() => setShowAddPayment(true)} />

      <PaymentInFilters />

      <PaymentInSummary
        totalAmount={totalAmount}
        totalReceived={totalReceived}
        totalOpen={totalOpen}
      />

      <PaymentInTable
        records={records}
        showSearchInput={showSearchInput}
        searchQuery={searchQuery}
        searchInputRef={searchInputRef}
        setShowSearchInput={setShowSearchInput}
        setSearchQuery={setSearchQuery}
        openRowMenuId={openRowMenuId}
        setOpenRowMenuPosition={setOpenRowMenuPosition}
        setOpenRowMenuId={setOpenRowMenuId}
      />

      <AddPaymentInModal
        showAddPayment={showAddPayment}
        setShowAddPayment={setShowAddPayment}
        parties={parties}
        selectedParty={selectedParty}
        setSelectedParty={setSelectedParty}
        partyOptions={partyOptions}
        selectedPartyBalance={selectedPartyBalance}
        paymentType={paymentType}
        setPaymentType={setPaymentType}
        bankAccounts={bankAccounts}
        referenceNo={referenceNo}
        setReferenceNo={setReferenceNo}
        showDescription={showDescription}
        setShowDescription={setShowDescription}
        description={description}
        setDescription={setDescription}
        fileInputRef={fileInputRef}
        imageDataUrl={imageDataUrl}
        setImageDataUrl={setImageDataUrl}
        receiptNo={receiptNo}
        setReceiptNo={setReceiptNo}
        paymentDate={paymentDate}
        setPaymentDate={setPaymentDate}
        amount={amount}
        setAmount={setAmount}
        handleSave={handleSave}
      />

      <PaymentInRowMenu
        openRowMenuId={openRowMenuId}
        openRowMenuPosition={openRowMenuPosition}
        records={records}
        setViewingRecord={setViewingRecord}
        setOpenRowMenuId={setOpenRowMenuId}
        setOpenRowMenuPosition={setOpenRowMenuPosition}
        setShowAddPayment={handleEditClick}
        handleDelete={handleDeleteClick}
      />

      <ViewPaymentInModal
        viewingRecord={viewingRecord}
        setViewingRecord={setViewingRecord}
      />

      {passcodeAction && (
        <EnterPasscodeScreen
          onSuccess={handlePasscodeSuccess}
          onCancel={() => setPasscodeAction(null)}
        />
      )}
    </div>
  );
}