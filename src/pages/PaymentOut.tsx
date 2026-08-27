import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PaymentOutHeader } from "@/components/pagescomponents/payementout/PaymentOutHeader";
import { PaymentOutFilters } from "@/components/pagescomponents/payementout/PaymentOutFilters";
import { PaymentOutSummary } from "@/components/pagescomponents/payementout/PaymentOutSummary";
import { PaymentOutTable } from "@/components/pagescomponents/payementout/PaymentOutTable";
import { AddPaymentOutModal } from "@/components/pagescomponents/payementout/AddPaymentOutModal";
import { PaymentOutRowMenu } from "@/components/pagescomponents/payementout/PaymentOutRowMenu";
import { PaymentOutReceiptPreviewModal } from "@/components/pagescomponents/payementout/PaymentOutReceiptPreviewModal";
import { PaymentOutPrintPreviewModal } from "@/components/pagescomponents/payementout/PaymentOutPrintPreviewModal";
import { EnterPasscodeScreen } from "@/components/common/EnterPasscodeScreen";
import { useSettings } from "@/hooks/useSettings";
import { exportPaymentOutToExcel } from "@/utils/exportPaymentOutExcel";

export function PaymentOut() {
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [parties, setParties] = useState<any[]>([]);
  const [selectedParty, setSelectedParty] = useState("");
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [previewingRecord, setPreviewingRecord] = useState<any>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [businessProfile, setBusinessProfile] = useState<any>(null);

  const [paymentType, setPaymentType] = useState("Cash");
  const [amount, setAmount] = useState("");
  const [paymentNo, setPaymentNo] = useState("1");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState("");
  const [showDescription, setShowDescription] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [openRowMenuId, setOpenRowMenuId] = useState<string | null>(null);
  const [openRowMenuPosition, setOpenRowMenuPosition] = useState<{ left: number; top: number } | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });

  const [isPasscodeEnabled] = useSettings('settings.isPasscodeEnabled', false);
  const [isPasscodeForTransactionEnabled] = useSettings('settings.isPasscodeForTransactionEnabled', false);
  const [passcodeAction, setPasscodeAction] = useState<{ type: 'edit' | 'delete', payload: string } | null>(null);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetch('/api/payment_out_records')
          .then(res => res.json())
          .then(data => setRecords(data))
          .catch(err => console.error("Failed to fetch payment_out_records:", err)),
        fetch('/api/parties')
          .then(res => res.json())
          .then(data => {
             setParties(data);
             if (data.length > 0 && !selectedParty) setSelectedParty(String(data[0].id));
          })
          .catch(console.error),
        fetch('/api/bank_accounts')
          .then(res => res.json())
          .then(data => setBankAccounts(data))
          .catch(console.error),
        fetch('/api/user_profile')
          .then(res => res.json())
          .then(data => setBusinessProfile(data))
          .catch(console.error)
      ]);
    } finally {
      // fetch complete
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (records.length > 0) {
      const maxNo = Math.max(...records.map(r => parseInt(r.paymentNo || r.payment_no || '0', 10) || 0));
      setPaymentNo(String(maxNo + 1));
    } else {
      setPaymentNo("1");
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
      const response = await fetch(`/api/payment_out_records/${id}`, { method: "DELETE" });
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

  const resetForm = () => {
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
      const maxNo = Math.max(...records.map(r => parseInt(r.paymentNo || r.payment_no || '0', 10) || 0));
      setPaymentNo(String(maxNo + 1));
    } else {
      setPaymentNo("1");
    }
  };

  const handleOpenAddPayment = () => {
    resetForm();
    setShowAddPayment(true);
  };

  const handleCloseAddPayment = (open: boolean) => {
    if (open) {
      handleOpenAddPayment();
    } else {
      const today = new Date().toISOString().split('T')[0];
      const hasChanges =
        amount !== "" ||
        description !== "" ||
        imageDataUrl !== "" ||
        paymentType !== "Cash" ||
        paymentDate !== today;
      if (hasChanges) {
        setShowDiscardConfirm(true);
      } else {
        setShowAddPayment(false);
        resetForm();
      }
    }
  };

  const confirmDiscard = () => {
    setShowDiscardConfirm(false);
    setShowAddPayment(false);
    resetForm();
  };

  const handleEditClick = (show: boolean, record?: any) => {
    if (show && isPasscodeEnabled && isPasscodeForTransactionEnabled) {
      setPasscodeAction({ type: 'edit', payload: record ? record.id : '' });
    } else {
      if (show && record) {
        setEditingRecordId(record.id);
        setPaymentType(record.paymentType || record.payment_type || "Cash");
        setAmount(String(record.amount || ""));
        setPaymentNo(record.paymentNo || record.payment_no || "");

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
    let monthMatch = true;
    if (selectedMonth) {
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
      monthMatch = month === targetMonth && year === targetYear;
    }

    let searchMatch = true;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const partyMatch = record.partyName?.toLowerCase().includes(query) || record.party_name?.toLowerCase().includes(query);
      const paymentMatch = record.paymentNo?.toLowerCase().includes(query) || record.payment_no?.toLowerCase().includes(query);
      searchMatch = !!(partyMatch || paymentMatch);
    }

    return monthMatch && searchMatch;
  });

  const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });

  const totalAmount = filteredRecords.reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = totalAmount;
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
      paymentNo,
      date: paymentDate,
      partyId: selectedParty,
      partyName: party ? party.name : "Cash Purchase",
      amount: Number(amount),
      paymentType,
      reference: "",
      description: showDescription ? description : "",
      imageDataUrl: imageDataUrl || undefined,
    };
    try {
      const method = editingRecordId ? 'PUT' : 'POST';
      const url = editingRecordId
        ? `/api/payment_out_records?id=${editingRecordId}`
        : '/api/payment_out_records';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setShowAddPayment(false);
        resetForm();
        fetchData();
      } else {
        alert("Failed to save payment out record.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save payment out record.");
    }
  };

  return (
    <>
      <div className="print:hidden h-full flex flex-col bg-[#D0DCE7] gap-1 overflow-y-auto">
        <PaymentOutHeader onAddPayment={handleOpenAddPayment} />

        <PaymentOutFilters
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
        />

        <PaymentOutSummary
          totalAmount={totalAmount}
          totalPaid={totalPaid}
          totalOpen={totalOpen}
        />

        <PaymentOutTable 
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
          onExcelClick={() => exportPaymentOutToExcel(filteredRecords, selectedMonth, currency.code)}
        />

        <AddPaymentOutModal
          showAddPayment={showAddPayment}
          setShowAddPayment={handleCloseAddPayment}
          selectedParty={selectedParty}
          setSelectedParty={setSelectedParty}
          partyOptions={partyOptions}
          selectedPartyBalance={selectedPartyBalance}
          paymentType={paymentType}
          setPaymentType={setPaymentType}
          bankAccounts={bankAccounts}
          referenceNo={""}
          setReferenceNo={() => {}}
          showDescription={showDescription}
          setShowDescription={setShowDescription}
          description={description}
          setDescription={setDescription}
          imageDataUrl={imageDataUrl}
          setImageDataUrl={setImageDataUrl}
          fileInputRef={fileInputRef}
          paymentNo={paymentNo}
          setPaymentNo={setPaymentNo}
          paymentDate={paymentDate}
          setPaymentDate={setPaymentDate}
          amount={amount}
          setAmount={setAmount}
          handleSave={handleSave}
        />

        <PaymentOutRowMenu
          openRowMenuId={openRowMenuId}
          openRowMenuPosition={openRowMenuPosition}
          records={records}
          setShowAddPayment={handleEditClick}
          handleDelete={handleDeleteClick}
          setOpenRowMenuId={setOpenRowMenuId}
          setOpenRowMenuPosition={setOpenRowMenuPosition}
          onPrint={(record) => setPreviewingRecord(record)}
        />

        <PaymentOutReceiptPreviewModal
          record={previewingRecord}
          businessProfile={businessProfile}
          onClose={() => setPreviewingRecord(null)}
        />

        {passcodeAction && (
          <EnterPasscodeScreen
            onSuccess={handlePasscodeSuccess}
            onCancel={() => setPasscodeAction(null)}
          />
        )}

        {/* Discard Changes Confirmation */}
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

        {/* Delete Confirmation */}
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

      <PaymentOutPrintPreviewModal
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
