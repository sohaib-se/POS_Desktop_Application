import { useState, useEffect, useCallback, useRef } from "react";
import {
  Upload,
  FileArchive,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Building,
  Calendar,
  Layers,
  Users,
  ShoppingCart,
  Receipt,
  HardDrive,
  FileCheck,
  X,
} from "lucide-react";
import { toast } from "@/components/ui/Toast";
import type { InspectBackupResult } from "@/types/electron";

function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(iso?: string): string {
  if (!iso) return "Unknown Date";
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function RestoreBackupSettings() {
  const [backupInfo, setBackupInfo] = useState<InspectBackupResult | null>(null);
  const [isInspecting, setIsInspecting] = useState<boolean>(false);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [createSafetyBackup, setCreateSafetyBackup] = useState<boolean>(true);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Inspect a given file path
  const inspectFile = useCallback(async (filePath?: string) => {
    if (!window.electronAPI?.backup) {
      toast.error("Electron API is unavailable in this environment.");
      return;
    }

    setIsInspecting(true);
    try {
      const result = await window.electronAPI.backup.inspect(filePath);
      if (result.canceled) return;

      if (!result.isValid) {
        setBackupInfo(null);
        toast.error(result.failureReason || "Invalid or unsupported backup file.");
        return;
      }

      setBackupInfo(result);
      toast.success("Backup file verified successfully.");
    } catch (err: any) {
      console.error("Inspection error:", err);
      toast.error(`Could not read backup file: ${err?.message || "Unknown error"}`);
    } finally {
      setIsInspecting(false);
    }
  }, []);

  // Check if a file was passed via sessionStorage (e.g. from Recent Backups list)
  useEffect(() => {
    const target = sessionStorage.getItem("restore.targetFile");
    if (target) {
      sessionStorage.removeItem("restore.targetFile");
      inspectFile(target);
    }
  }, [inspectFile]);

  // Browse file dialog
  const handleBrowseFile = async () => {
    await inspectFile(undefined);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const filePath = (file as any).path;
      if (filePath && (filePath.endsWith(".lsb") || filePath.endsWith(".zip"))) {
        await inspectFile(filePath);
      } else {
        toast.error("Please drop a valid .lsb backup file.");
      }
    }
  };

  // Execute restore
  const handleConfirmRestore = async () => {
    if (!backupInfo?.filePath || isRestoring) return;
    if (!window.electronAPI?.backup) {
      toast.error("Restore is only available in the desktop application.");
      return;
    }

    setIsRestoring(true);
    setShowConfirmModal(false);

    try {
      const result = await window.electronAPI.backup.restore({
        filePath: backupInfo.filePath,
        createSafetyBackup,
      });

      if (!result.success) {
        throw new Error(result.failureReason || "Failed to restore backup.");
      }

      // Restore localStorage settings if available in manifest
      if (result.settings && typeof result.settings === "object") {
        try {
          Object.entries(result.settings).forEach(([key, val]) => {
            if (typeof val === "string") {
              localStorage.setItem(key, val);
            } else {
              localStorage.setItem(key, JSON.stringify(val));
            }
          });
        } catch (settingsErr) {
          console.warn("Settings restore note:", settingsErr);
        }
      }

      toast.success("Backup restored successfully! Refreshing application...");

      // Reload app after 1.5 seconds to reload SQLite state
      setTimeout(async () => {
        if (window.electronAPI?.reloadApp) {
          await window.electronAPI.reloadApp();
        } else {
          window.location.reload();
        }
      }, 1500);
    } catch (err: any) {
      console.error("Restore failed:", err);
      toast.error(`Restore failed: ${err?.message || "Unknown error"}`);
      setIsRestoring(false);
    }
  };

  const clearSelection = () => {
    setBackupInfo(null);
  };

  return (
    <div className="space-y-6">
      {/* ── File Selection Card ── */}
      <div className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm space-y-5">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Select Backup File (.lsb)
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Choose a Laimsoft POS backup archive from your computer or external USB drive.
          </p>
        </div>

        {/* Drag & Drop Zone */}
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            isDragging
              ? "border-[#1976D2] bg-blue-50/50 scale-[0.99]"
              : backupInfo
              ? "border-emerald-300 bg-emerald-50/20"
              : "border-gray-300 hover:border-gray-400 bg-gray-50/50"
          }`}
          onClick={handleBrowseFile}
        >
          {isInspecting ? (
            <div className="flex flex-col items-center justify-center gap-3 py-4">
              <RefreshCw size={32} className="animate-spin text-[#1976D2]" />
              <p className="text-sm font-semibold text-gray-700">
                Verifying backup archive integrity...
              </p>
            </div>
          ) : backupInfo ? (
            <div className="flex flex-col items-center justify-center gap-2 py-2">
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-full">
                <FileCheck size={28} />
              </div>
              <p className="text-sm font-semibold text-gray-900 font-mono">
                {backupInfo.fileName}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{formatBytes(backupInfo.fileSize)}</span>
                <span>•</span>
                <span>Click to choose a different file</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-4">
              <div className="p-3 bg-blue-50 text-[#1976D2] rounded-full">
                <Upload size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Click to browse or drag and drop your .lsb backup file
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supported format: Laimsoft POS Backup (.lsb)
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBrowseFile();
                }}
                className="mt-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 shadow-sm transition-colors"
              >
                Browse File
              </button>
            </div>
          )}
        </div>

        {/* Selected file path banner */}
        {backupInfo && (
          <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2.5 min-w-0">
              <FileArchive size={16} className="text-[#1976D2] shrink-0" />
              <span
                className="text-xs font-mono text-gray-700 truncate"
                title={backupInfo.filePath}
              >
                {backupInfo.filePath}
              </span>
            </div>
            <button
              onClick={clearSelection}
              className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
              title="Clear selection"
            >
              <X size={15} />
            </button>
          </div>
        )}
      </div>

      {/* ── Backup Inspection Summary Card (Vyapar Style) ── */}
      {backupInfo && (
        <div className="p-6 border border-emerald-200 rounded-xl bg-white shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-md">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <h4 className="text-base font-semibold text-gray-900">
                  Verified Backup Archive
                </h4>
                <p className="text-xs text-gray-500">
                  Archive validated and ready for full restoration.
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold">
              .lsb Archive
            </span>
          </div>

          {/* Business & Date Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 flex items-start gap-3">
              <Building size={18} className="text-[#1976D2] mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Business / Company</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {backupInfo.businessName || "Laimsoft POS"}
                </p>
                {backupInfo.businessPhone && (
                  <p className="text-xs text-gray-500 mt-0.5">{backupInfo.businessPhone}</p>
                )}
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 flex items-start gap-3">
              <Calendar size={18} className="text-[#1976D2] mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Backup Timestamp</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {formatDate(backupInfo.createdAt)}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Size: {formatBytes(backupInfo.fileSize)}
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          {backupInfo.stats && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                Contents Summary
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-1.5 text-blue-700 text-xs font-medium">
                    <Receipt size={14} />
                    <span>Sale Invoices</span>
                  </div>
                  <p className="text-lg font-bold text-blue-950 mt-1">
                    {backupInfo.stats.saleInvoicesCount}
                  </p>
                </div>

                <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-1.5 text-purple-700 text-xs font-medium">
                    <ShoppingCart size={14} />
                    <span>Inventory Items</span>
                  </div>
                  <p className="text-lg font-bold text-purple-950 mt-1">
                    {backupInfo.stats.itemsCount}
                  </p>
                </div>

                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-700 text-xs font-medium">
                    <Users size={14} />
                    <span>Parties / Customers</span>
                  </div>
                  <p className="text-lg font-bold text-emerald-950 mt-1">
                    {backupInfo.stats.partiesCount}
                  </p>
                </div>

                <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-1.5 text-amber-700 text-xs font-medium">
                    <Layers size={14} />
                    <span>Transactions</span>
                  </div>
                  <p className="text-lg font-bold text-amber-950 mt-1">
                    {backupInfo.stats.transactionsCount}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Safety Checkbox */}
          <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-lg flex items-start gap-3">
            <input
              type="checkbox"
              id="safetyBackupToggle"
              checked={createSafetyBackup}
              onChange={(e) => setCreateSafetyBackup(e.target.checked)}
              className="mt-1 h-4 w-4 text-[#1976D2] rounded border-gray-300 focus:ring-[#1976D2] cursor-pointer"
            />
            <label htmlFor="safetyBackupToggle" className="cursor-pointer">
              <span className="text-xs font-semibold text-amber-950">
                Create a safety backup of current data before restoring (Recommended)
              </span>
              <p className="text-xs text-amber-800 mt-0.5">
                Automatically saves an instant snapshot of your current database into your backups
                folder, so you can always revert back if needed.
              </p>
            </label>
          </div>

          {/* Restore Button */}
          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={clearSelection}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={isRestoring}
              className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm disabled:opacity-60"
            >
              <HardDrive size={16} />
              <span>Restore Backup Now</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Confirmation Modal ── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-2.5 bg-amber-100 rounded-full">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900">
                  Confirm Data Restoration
                </h4>
                <p className="text-xs text-gray-500">This action will replace active data</p>
              </div>
            </div>

            <div className="text-sm text-gray-600 space-y-2">
              <p>
                Are you sure you want to restore the backup from{" "}
                <span className="font-semibold text-gray-900">
                  {formatDate(backupInfo?.createdAt)}
                </span>
                ?
              </p>
              <p className="text-xs text-red-600 font-medium">
                ⚠️ All current sales invoices, inventory levels, and customer ledger entries will be
                replaced with the data inside this backup archive.
              </p>
              {createSafetyBackup && (
                <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-md border border-emerald-200">
                  ✓ A safety backup of your current database will be generated automatically before
                  proceeding.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRestore}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold shadow-sm"
              >
                Yes, Restore Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Fullscreen Restoring Progress Overlay ── */}
      {isRestoring && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md p-4 text-white">
          <div className="bg-white text-gray-900 rounded-2xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <RefreshCw size={44} className="animate-spin text-[#1976D2] mx-auto" />
            <h4 className="text-lg font-bold">Restoring Business Data...</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Replacing SQLite database and synchronizing attachments. Please do not close the
              application.
            </p>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-[#1976D2] h-full w-2/3 animate-pulse rounded-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
