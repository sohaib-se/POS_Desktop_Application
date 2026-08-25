import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PaymentInHeader } from "@/components/pagescomponents/paymentin/PaymentInHeader";
import { PaymentInFilters } from "@/components/pagescomponents/paymentin/PaymentInFilters";
import { PaymentInSummary } from "@/components/pagescomponents/paymentin/PaymentInSummary";
import { PaymentInTable } from "@/components/pagescomponents/paymentin/PaymentInTable";
import { AddPaymentInModal } from "@/components/pagescomponents/paymentin/AddPaymentInModal";
import { PaymentInRowMenu } from "@/components/pagescomponents/paymentin/PaymentInRowMenu";
import { ViewPaymentInModal } from "@/components/pagescomponents/paymentin/ViewPaymentInModal";
import { EnterPasscodeScreen } from "@/components/common/EnterPasscodeScreen";
import { PaymentInPrintPreviewModal } from "@/components/pagescomponents/paymentin/PaymentInPrintPreviewModal";
import { useSettings } from "@/hooks/useSettings";

export function PaymentIn() {
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [parties, setParties] = useState<any[]>([]);
  const [selectedParty, setSelectedParty] = useState("");
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [viewingRecord, setViewingRecord] = useState<any>(null);
  const [businessProfile, setBusinessProfile] = useState<any>(null);

  const [paymentType, setPaymentType] = useState("Cash");
  const [amount, setAmount] = useState("");
  const [receiptNo, setReceiptNo] = useState("1");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
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

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });

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
    fetch('/api/user_profile')
      .then(res => res.json())
      .then(data => setBusinessProfile(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (records.length > 0) {
      const maxReceipt = Math.max(...records.map(r => parseInt(r.receiptNo || '0', 10) || 0));
      setReceiptNo(String(maxReceipt + 1));
    } else {
      setReceiptNo("1");
    }
  }, [records]);

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

  const executeDelete = async (id: string) => {
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
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (!deleteConfirmId) return;

    if (isPasscodeEnabled && isPasscodeForTransactionEnabled) {
      setPasscodeAction({ type: 'delete', payload: deleteConfirmId });
    } else {
      executeDelete(deleteConfirmId);
    }
    setDeleteConfirmId(null);
  };

  const resetAddPaymentForm = () => {
    setEditingRecordId(null);
    setPaymentType("Cash");
    setAmount("");
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setDescription("");
    setShowDescription(false);
    setImageDataUrl("");
    if (parties.length > 0) setSelectedParty(String(parties[0].id));
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (records.length > 0) {
      const maxReceipt = Math.max(...records.map(r => parseInt(r.receiptNo || '0', 10) || 0));
      setReceiptNo(String(maxReceipt + 1));
    } else {
      setReceiptNo("1");
    }
  };

  const handleOpenAddPayment = () => {
    resetAddPaymentForm();
    setShowAddPayment(true);
  };

  const handleCloseAddPayment = (open: boolean) => {
    if (open) {
      handleOpenAddPayment();
    } else {
      const hasChanges = amount !== "" || description !== "" || imageDataUrl !== "" || paymentType !== "Cash" || paymentDate !== new Date().toISOString().split('T')[0];
      if (hasChanges) {
        setShowDiscardConfirm(true);
      } else {
        setShowAddPayment(false);
        resetAddPaymentForm();
      }
    }
  };

  const confirmDiscard = () => {
    setShowDiscardConfirm(false);
    setShowAddPayment(false);
    resetAddPaymentForm();
  };

  const handleEditClick = (show: boolean, record?: any) => {
    if (show && isPasscodeEnabled && isPasscodeForTransactionEnabled) {
      setPasscodeAction({ type: 'edit', payload: record ? record.id : '' });
    } else {
      if (show && record) {
        setEditingRecordId(record.id);
        setPaymentType(record.paymentType || record.payment_type || "Cash");
        setAmount(String(record.amount || ""));
        setReceiptNo(record.receiptNo || record.receipt_no || "");

        let formattedDate = new Date().toISOString().split('T')[0];
        if (record.date) {
          if (record.date.includes('/')) {
            const parts = record.date.split('/');
            if (parts.length === 3) {
              formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
          } else if (record.date.includes('-')) {
            formattedDate = record.date.split('T')[0];
          }
        }
        setPaymentDate(formattedDate);
        setDescription(record.description || "");
        setShowDescription(!!record.description);
        setImageDataUrl(record.attachment_image_path || record.attachmentImagePath || "");
        setSelectedParty(String(record.partyId || record.party_id || ""));
        setShowAddPayment(true);
      } else {
        handleCloseAddPayment(show);
      }
    }
  };

  const handlePasscodeSuccess = () => {
    if (passcodeAction?.type === 'delete') {
      executeDelete(passcodeAction.payload);
    } else if (passcodeAction?.type === 'edit') {
      if (passcodeAction.payload) {
        const record = records.find(r => r.id === passcodeAction.payload);
        handleEditClick(true, record);
      } else {
        handleOpenAddPayment();
      }
    }
    setPasscodeAction(null);
  };

  const filteredRecords = records.filter(record => {
    if (!selectedMonth) return true;

    const [selYear, selMonth] = selectedMonth.split('-');
    const targetMonth = parseInt(selMonth, 10);
    const targetYear = parseInt(selYear, 10);

    let month = -1;
    let year = -1;

    if (record.date) {
      const dateStr = String(record.date);
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          month = parseInt(parts[1], 10);
          year = parseInt(parts[2], 10);
        }
      } else if (dateStr.includes('-')) {
        const parts = dateStr.split('T')[0].split('-');
        if (parts.length === 3) {
          if (parts[0].length === 4) {
            year = parseInt(parts[0], 10);
            month = parseInt(parts[1], 10);
          } else {
            month = parseInt(parts[1], 10);
            year = parseInt(parts[2], 10);
          }
        }
      }
    }
    return month === targetMonth && year === targetYear;
  });

  const totalAmount = filteredRecords.reduce((sum, p) => sum + p.amount, 0);
  const totalReceived = totalAmount;

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
      reference: "",
      description: showDescription ? description : "",
      imageDataUrl: imageDataUrl || undefined,
    };
    try {
      const method = editingRecordId ? 'PUT' : 'POST';
      const url = editingRecordId ? `/api/payment_in_records?id=${editingRecordId}` : '/api/payment_in_records';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setShowAddPayment(false);
        resetAddPaymentForm();
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
    <>
      {/*
      Print-only CSS. The dialog is normally centered with a fixed
      position/transform and a viewport-relative width (80vw), which is
      fine on screen but breaks native printing (huge margins, tiny
      content) because the browser prints the page exactly as laid out.
      This block, scoped to @media print, forces the dialog to behave like
      a normal, full-width, top-left-anchored block and hides everything
      else on the page except the report itself. Uses !important because
      it must beat the dialog's inline width style and its own utility
      classes.
    */}
      <style>{`
      @media print {
        body * {
          visibility: hidden;
        }
        .print-area, .print-area * {
          visibility: visible;
        }
        .print-area {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding: 15mm !important;
        }
        .print-dialog-content {
          position: static !important;
          inset: auto !important;
          transform: none !important;
          width: 100% !important;
          max-width: 100% !important;
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
          box-shadow: none !important;
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        @page {
          size: A4 portrait;
          margin: 0;
        }
      }
    `}</style>
      <div className="print:hidden h-full flex flex-col bg-[#D0DCE7] gap-1 overflow-y-auto">
        <PaymentInHeader onAddPaymentClick={handleOpenAddPayment} />

        <PaymentInFilters
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
        />

        <PaymentInSummary
          totalAmount={totalAmount}
          totalReceived={totalReceived}
        />

        {records.length === 0 ? (
          <div className="flex-1 bg-white rounded-md shadow-sm mx-1 flex flex-col items-center justify-center p-8">
            <div className="w-40 h-40 bg-[#D3E8FF] rounded-full flex items-center justify-center relative mb-5">
              <div className="relative">
                <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="25" y="20" width="50" height="16" rx="4" fill="#90C3FC" />
                  <path d="M35 24 L38 30 L32 30 Z" fill="#FFFFFF" />
                  <rect x="45" y="26" width="22" height="4" rx="2" fill="#FFFFFF" />

                  <rect x="15" y="42" width="60" height="18" rx="4" fill="#3B82F6" />
                  <rect x="23" y="46" width="10" height="10" rx="2" fill="#FFFFFF" />
                  <circle cx="28" cy="51" r="2" fill="#3B82F6" />
                  <rect x="40" y="49" width="28" height="4" rx="2" fill="#FFFFFF" />

                  <rect x="20" y="66" width="50" height="16" rx="4" fill="#90C3FC" />
                  <rect x="24" y="70" width="10" height="8" rx="1" fill="#FFFFFF" />
                  <rect x="25" y="74" width="8" height="2" fill="#90C3FC" />
                  <rect x="38" y="72" width="22" height="4" rx="2" fill="#FFFFFF" />
                </svg>
              </div>
              <svg className="absolute top-6 left-2 w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z" />
              </svg>
              <svg className="absolute bottom-8 left-3 w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z" />
              </svg>
              <svg className="absolute top-1/2 right-1 w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z" />
              </svg>
              <svg className="absolute top-2 right-10 w-2 h-2 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z" />
              </svg>
            </div>
            <h3 className="text-[15px] font-bold text-[#2A2E3D] mb-1">
              No Transactions to show
            </h3>
            <p className="text-[13px] text-[#8F9BB3] mb-6">
              You haven't added any transactions yet.
            </p>
            <button
              onClick={handleOpenAddPayment}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#E91E63] text-white text-[14px] font-semibold rounded-full shadow hover:bg-[#D81B60] transition-colors"
            >
              <span className="text-xl leading-none -mt-1">+</span> Add Payment-In
            </button>
          </div>
        ) : (
          <PaymentInTable
            records={filteredRecords}
            showSearchInput={showSearchInput}
            searchQuery={searchQuery}
            searchInputRef={searchInputRef}
            setShowSearchInput={setShowSearchInput}
            setSearchQuery={setSearchQuery}
            openRowMenuId={openRowMenuId}
            setOpenRowMenuPosition={setOpenRowMenuPosition}
            setOpenRowMenuId={setOpenRowMenuId}
            onPrintClick={() => setShowPrintPreview(true)}
          />
        )}

        <AddPaymentInModal
          showAddPayment={showAddPayment}
          setShowAddPayment={handleCloseAddPayment}
          parties={parties}
          selectedParty={selectedParty}
          setSelectedParty={setSelectedParty}
          partyOptions={partyOptions}
          selectedPartyBalance={selectedPartyBalance}
          paymentType={paymentType}
          setPaymentType={setPaymentType}
          bankAccounts={bankAccounts}
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

        <Dialog open={showDiscardConfirm} onOpenChange={setShowDiscardConfirm}>
          <DialogContent
            showCloseButton={false}
            className="w-[28rem] rounded-xl border-0 bg-white p-6 shadow-xl flex flex-col items-center text-center gap-4"
          >
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Discard Changes?</h3>
            <p className="text-sm text-gray-500 mb-2">
              You have unsaved changes. Are you sure you want to discard them? All unsaved changes will be lost.
            </p>
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={() => setShowDiscardConfirm(false)}
                className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDiscard}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors"
              >
                Discard
              </button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
          <DialogContent
            showCloseButton={false}
            className="w-[28rem] rounded-xl border-0 bg-white p-6 shadow-xl flex flex-col items-center text-center gap-4"
          >
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Delete Transaction?</h3>
            <p className="text-sm text-gray-500 mb-2">
              Are you sure you want to delete this transaction? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <PaymentInPrintPreviewModal
        showPrintPreview={showPrintPreview}
        setShowPrintPreview={setShowPrintPreview}
        records={filteredRecords}
        selectedPartyName={selectedParty ? partyOptions.find((p) => p.value === selectedParty)?.label || "All Parties" : "All Parties"}
        selectedMonth={selectedMonth}
        businessProfile={businessProfile}
      />
    </>
  );
}