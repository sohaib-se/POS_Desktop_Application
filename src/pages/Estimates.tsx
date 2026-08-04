import { useState, useRef, useEffect } from "react";
import { AddEstimate } from "@/pages/AddEstimate";
import type { EstimateRecord } from "../components/pagescomponents/estimates/types";
import { EstimatesHeader } from "../components/pagescomponents/estimates/EstimatesHeader";
import { EstimatesFilters } from "../components/pagescomponents/estimates/EstimatesFilters";
import { EstimatesSummary } from "../components/pagescomponents/estimates/EstimatesSummary";
import { EstimatesTable } from "../components/pagescomponents/estimates/EstimatesTable";
import { EstimateRowMenu } from "../components/pagescomponents/estimates/EstimateRowMenu";
import { ViewEstimateDialog } from "../components/pagescomponents/estimates/ViewEstimateDialog";

export function Estimates() {
  const [showAddEstimate, setShowAddEstimate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [records, setRecords] = useState<EstimateRecord[]>([]);
  const [viewingRecord, setViewingRecord] = useState<EstimateRecord | null>(null);
  const [openRowMenuId, setOpenRowMenuId] = useState<string | null>(null);
  const [openRowMenuPosition, setOpenRowMenuPosition] = useState<{ left: number; top: number } | null>(null);

  useEffect(() => {
    fetch('/api/estimates')
      .then(res => res.json())
      .then(data => setRecords(data))
      .catch(err => console.error("Failed to fetch estimates:", err));
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
    if (window.confirm("Are you sure you want to delete this estimate?")) {
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
    }
  };

  const totalQuotations = records.reduce((sum, est) => sum + est.amount, 0);
  const totalConverted = records
    .filter((e) => e.status === "Converted")
    .reduce((sum, est) => sum + est.amount, 0);

  return (
    <>
      <div className="h-full flex flex-col bg-[#D0DCE7] gap-1 overflow-y-auto">
        <EstimatesHeader onAddEstimate={() => setShowAddEstimate(true)} />
        <EstimatesFilters />
        <EstimatesSummary
          totalQuotations={totalQuotations}
          totalConverted={totalConverted}
        />
        <EstimatesTable
          records={records}
          showSearchInput={showSearchInput}
          setShowSearchInput={setShowSearchInput}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchInputRef={searchInputRef}
          openRowMenuId={openRowMenuId}
          setOpenRowMenuId={setOpenRowMenuId}
          setOpenRowMenuPosition={setOpenRowMenuPosition}
        />
      </div>

      {showAddEstimate && (
        <div className="fixed inset-0 z-[100]">
          <AddEstimate onClose={() => setShowAddEstimate(false)} />
        </div>
      )}

      <EstimateRowMenu
        openRowMenuId={openRowMenuId}
        openRowMenuPosition={openRowMenuPosition}
        records={records}
        setViewingRecord={setViewingRecord}
        setShowAddEstimate={setShowAddEstimate}
        handleDelete={handleDelete}
        setOpenRowMenuId={setOpenRowMenuId}
        setOpenRowMenuPosition={setOpenRowMenuPosition}
      />

      <ViewEstimateDialog
        viewingRecord={viewingRecord}
        setViewingRecord={setViewingRecord}
      />
    </>
  );
}
