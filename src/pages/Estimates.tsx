import { useState, useRef, useEffect } from "react";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { AddEstimate } from "@/pages/AddEstimate";
import type { EstimateRecord } from "../components/pagescomponents/estimates/types";
import { EstimatesHeader } from "../components/pagescomponents/estimates/EstimatesHeader";
import { EstimatesFilters } from "../components/pagescomponents/estimates/EstimatesFilters";
import { EstimatesSummary } from "../components/pagescomponents/estimates/EstimatesSummary";
import { EstimatesTable } from "../components/pagescomponents/estimates/EstimatesTable";
import { EstimateRowMenu } from "../components/pagescomponents/estimates/EstimateRowMenu";
import { ViewEstimateDialog } from "../components/pagescomponents/estimates/ViewEstimateDialog";
import { EnterPasscodeScreen } from "@/components/common/EnterPasscodeScreen";
import { useSettings } from "@/hooks/useSettings";

export function Estimates({ onConvertEstimateToSale }: { onConvertEstimateToSale?: (data: any) => void }) {
  const [showAddEstimate, setShowAddEstimate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [records, setRecords] = useState<EstimateRecord[]>([]);
  const [viewingRecord, setViewingRecord] = useState<EstimateRecord | null>(null);
  const [openRowMenuId, setOpenRowMenuId] = useState<string | null>(null);
  const [openRowMenuPosition, setOpenRowMenuPosition] = useState<{ left: number; top: number } | null>(null);
  const [editingEstimate, setEditingEstimate] = useState<EstimateRecord | null>(null);
  
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  const [isPasscodeEnabled] = useSettings('settings.isPasscodeEnabled', false);
  const [isPasscodeForTransactionEnabled] = useSettings('settings.isPasscodeForTransactionEnabled', false);
  const [passcodeAction, setPasscodeAction] = useState<{ type: 'edit' | 'delete', payload: any } | null>(null);
  const [deletePendingId, setDeletePendingId] = useState<string | null>(null);

  const handleEditEstimate = (estimate: EstimateRecord) => {
    setEditingEstimate(estimate);
    setShowAddEstimate(true);
  };

  const handleConvert = (estimate: EstimateRecord) => {
    if (onConvertEstimateToSale) {
      onConvertEstimateToSale({
        ...estimate,
        invoiceNo: estimate.referenceNo,
        transactionType: "Sale",
        paymentMode: "credit",
        paymentType: "Credit"
      });
    }
  };

  const fetchEstimates = () => {
    fetch('/api/estimates')
      .then(res => res.json())
      .then(data => setRecords(data))
      .catch(err => console.error("Failed to fetch estimates:", err));
  };

  useEffect(() => {
    fetchEstimates();

    const handleSaleRefresh = () => fetchEstimates();
    window.addEventListener("sale-invoices-refresh", handleSaleRefresh);
    window.addEventListener("estimates-refresh", handleSaleRefresh);

    return () => {
      window.removeEventListener("sale-invoices-refresh", handleSaleRefresh);
      window.removeEventListener("estimates-refresh", handleSaleRefresh);
    };
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
    try {
      const response = await fetch(`/api/estimates/${id}`, { method: "DELETE" });
      if (!response.ok && response.status !== 204) {
        throw new Error("Failed to delete estimate");
      }
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete the selected estimate.");
    }
  };

  const handleEditClick = (record: EstimateRecord) => {
    if (isPasscodeEnabled && isPasscodeForTransactionEnabled) {
      setPasscodeAction({ type: 'edit', payload: record });
    } else {
      handleEditEstimate(record);
    }
  };

  const handleDeleteClick = (id: string) => {
    if (isPasscodeEnabled && isPasscodeForTransactionEnabled) {
      setPasscodeAction({ type: 'delete', payload: id });
    } else {
      setDeletePendingId(id);
    }
  };


  const handlePasscodeSuccess = () => {
    if (passcodeAction?.type === 'edit') {
      handleEditEstimate(passcodeAction.payload);
    } else if (passcodeAction?.type === 'delete') {
      handleDelete(passcodeAction.payload);
    }
    setPasscodeAction(null);
  };

  const filteredRecords = records.filter(record => {
    let monthMatch = true;
    if (selectedMonth) {
      try {
        const recordDate = new Date(record.date);
        if (!isNaN(recordDate.getTime())) {
          const recordMonth = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`;
          monthMatch = recordMonth === selectedMonth;
        }
      } catch {
        // ignore invalid dates
      }
    }

    let searchMatch = true;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const partyMatch = record.partyName?.toLowerCase().includes(query);
      const invoiceMatch = record.referenceNo?.toLowerCase().includes(query) || 
                           (record.convertedSaleNo && record.convertedSaleNo.toLowerCase().includes(query));
      searchMatch = !!(partyMatch || invoiceMatch);
    }

    return monthMatch && searchMatch;
  });

  const totalQuotations = filteredRecords.reduce((sum, est) => sum + est.amount, 0);
  const totalConverted = filteredRecords
    .filter((e) => e.status === "Converted")
    .reduce((sum, est) => sum + est.amount, 0);

  return (
    <>
      <div className="h-full flex flex-col bg-[#D0DCE7] gap-1 overflow-y-auto">
        <EstimatesHeader onAddEstimate={() => setShowAddEstimate(true)} />
        <EstimatesFilters selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />
        <EstimatesSummary
          totalQuotations={totalQuotations}
          totalConverted={totalConverted}
        />
        <EstimatesTable
          records={filteredRecords}
          showSearchInput={showSearchInput}
          setShowSearchInput={setShowSearchInput}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchInputRef={searchInputRef}
          openRowMenuId={openRowMenuId}
          setOpenRowMenuId={setOpenRowMenuId}
          setOpenRowMenuPosition={setOpenRowMenuPosition}
          onConvertEstimateToSale={handleConvert}
        />
      </div>

      {showAddEstimate && (
        <div className="fixed inset-0 z-[100]">
          <AddEstimate 
            initialEstimate={editingEstimate}
            onClose={() => { setShowAddEstimate(false); setEditingEstimate(null); }} 
            onSave={() => { fetchEstimates(); }} 
          />
        </div>
      )}

      <EstimateRowMenu
        openRowMenuId={openRowMenuId}
        openRowMenuPosition={openRowMenuPosition}
        records={filteredRecords}
        setViewingRecord={setViewingRecord}
        onEditEstimate={handleEditClick}
        handleDelete={handleDeleteClick}
        setOpenRowMenuId={setOpenRowMenuId}
        setOpenRowMenuPosition={setOpenRowMenuPosition}
      />

      <ViewEstimateDialog
        viewingRecord={viewingRecord}
        setViewingRecord={setViewingRecord}
      />

      {passcodeAction && (
        <EnterPasscodeScreen
          onSuccess={handlePasscodeSuccess}
          onCancel={() => setPasscodeAction(null)}
        />
      )}

      <ConfirmDialog
        open={!!deletePendingId}
        title="Delete Estimate?"
        message="Are you sure you want to delete this estimate? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmColor="#e53935"
        icon="danger"
        onConfirm={() => { if (deletePendingId) handleDelete(deletePendingId); setDeletePendingId(null); }}
        onCancel={() => setDeletePendingId(null)}
      />
    </>
  );
}
