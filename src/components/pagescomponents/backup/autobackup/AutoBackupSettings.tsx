import { useState, useEffect, useCallback } from "react";
import {
  Folder,
  FolderOpen,
  Power,
  Layers,
  RefreshCw,
  FileArchive,
  Trash2,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { toast } from "@/components/ui/Toast";
import type { BackupItem, AutoBackupConfig } from "@/types/electron";

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(iso?: string | null): string {
  if (!iso) return "Never";
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
    return String(iso);
  }
}

export function AutoBackupSettings() {
  const [config, setConfig] = useState<AutoBackupConfig>({
    enabled: true,
    backupOnClose: true,
    maxBackups: 10,
    destinationFolder: "",
    lastBackupTime: null,
    lastBackupFileName: null,
  });

  const [recentBackups, setRecentBackups] = useState<BackupItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTriggering, setIsTriggering] = useState<boolean>(false);
  const [backupToDelete, setBackupToDelete] = useState<BackupItem | null>(null);

  // Load config and existing auto backup files
  const loadConfigAndFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      if (window.electronAPI?.autoBackup) {
        const loadedConfig = await window.electronAPI.autoBackup.getConfig();
        setConfig(loadedConfig);

        const folder = loadedConfig.destinationFolder;
        if (folder) {
          const files = await window.electronAPI.autoBackup.listRecent(folder);
          setRecentBackups(files || []);
        }
      }
    } catch (err: any) {
      console.error("Failed to load auto backup settings:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfigAndFiles();
  }, [loadConfigAndFiles]);

  // Toggle master enabled state
  const handleToggleEnabled = async () => {
    if (!window.electronAPI?.autoBackup) return;

    const newEnabled = !config.enabled;
    try {
      const updated = await window.electronAPI.autoBackup.saveConfig({
        enabled: newEnabled,
        backupOnClose: newEnabled,
      });
      setConfig(updated);
      toast.success(
        newEnabled
          ? "Auto Backup enabled. It will run automatically when closing POS."
          : "Auto Backup disabled."
      );
    } catch (err: any) {
      toast.error(`Failed to update settings: ${err?.message || "Unknown error"}`);
    }
  };

  // Change destination folder via native directory dialog
  const handleChangeFolder = async () => {
    if (!window.electronAPI?.autoBackup) return;

    try {
      const res = await window.electronAPI.autoBackup.selectFolder();
      if (!res.canceled && res.folderPath) {
        const updated = await window.electronAPI.autoBackup.saveConfig({
          destinationFolder: res.folderPath,
        });
        setConfig(updated);
        toast.success("Auto backup destination folder updated.");

        // Refresh list from newly chosen folder
        const files = await window.electronAPI.autoBackup.listRecent(res.folderPath);
        setRecentBackups(files || []);
      }
    } catch (err: any) {
      toast.error(`Failed to select folder: ${err?.message || "Unknown error"}`);
    }
  };

  // Open folder in Windows Explorer
  const handleOpenFolder = async () => {
    if (!window.electronAPI?.autoBackup) return;
    try {
      await window.electronAPI.autoBackup.openFolder(config.destinationFolder);
    } catch (err: any) {
      toast.error("Could not open destination folder.");
    }
  };

  // Manually trigger an auto-backup snapshot now
  const handleTriggerNow = async () => {
    if (isTriggering) return;
    if (!window.electronAPI?.autoBackup) {
      toast.error("Auto backup is only available in the desktop application.");
      return;
    }

    setIsTriggering(true);
    try {
      const result = await window.electronAPI.autoBackup.triggerNow();
      if (!result.success) {
        throw new Error(result.failureReason || "Failed to create auto backup.");
      }

      toast.success(
        result.prunedCount && result.prunedCount > 0
          ? `Auto backup created (${result.fileName}). Pruned ${result.prunedCount} oldest file(s) to maintain 10 backups.`
          : `Auto backup created: ${result.fileName}`
      );

      // Refresh config & files list
      await loadConfigAndFiles();
    } catch (err: any) {
      console.error("Auto backup trigger error:", err);
      toast.error(`Auto backup failed: ${err?.message || "Unknown error"}`);
    } finally {
      setIsTriggering(false);
    }
  };

  // Delete an auto backup file
  const handleDeleteBackup = async (item: BackupItem) => {
    if (!window.electronAPI?.backup) return;
    try {
      const res = await window.electronAPI.backup.delete(item.filePath);
      if (res.success) {
        toast.success(`Deleted ${item.fileName}`);
        setRecentBackups((prev) => prev.filter((b) => b.filePath !== item.filePath));
      } else {
        toast.error(res.failureReason || "Failed to delete backup file.");
      }
    } catch (err: any) {
      toast.error("Could not delete backup file.");
    } finally {
      setBackupToDelete(null);
    }
  };

  // Jump to restore page with this auto backup file preloaded
  const handleRestoreFromHere = (item: BackupItem) => {
    sessionStorage.setItem("restore.targetFile", item.filePath);
    window.dispatchEvent(
      new CustomEvent("navigate-to-page", {
        detail: { page: "sync-restore-backup", filePath: item.filePath },
      })
    );
  };

  const backupCount = recentBackups.length;
  const maxLimit = config.maxBackups || 10;
  const capacityPercent = Math.min(100, Math.round((backupCount / maxLimit) * 100));

  return (
    <div className="space-y-6">
      {/* ── 1. Master Toggle & Status Card ── */}
      <div className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <div
              className={`p-3 rounded-xl ${
                config.enabled
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              <ShieldCheck size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-gray-900">
                  Automatic Backup on Close
                </h3>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    config.enabled
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {config.enabled ? "Active" : "Disabled"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 max-w-xl">
                Automatically creates a complete <code className="font-semibold text-gray-700">.lsb</code> backup archive whenever you close the POS software, ensuring you never lose transactions.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleEnabled}
            className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:ring-offset-2 ${
              config.enabled ? "bg-emerald-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                config.enabled ? "translate-x-7" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* ── 2. Trigger Strategy & Retention Rule Summary ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strategy card */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-lg flex items-start gap-3">
            <div className="p-2 bg-blue-100/70 text-[#1976D2] rounded-lg mt-0.5">
              <Power size={18} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Trigger Event
                </p>
                <span className="text-[11px] font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                  On Application Close
                </span>
              </div>
              <p className="text-sm font-medium text-slate-800 mt-1">
                Every time POS is closed
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Runs automatically before shutdown with an exit safeguard screen.
              </p>
            </div>
          </div>

          {/* Retention rule card */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-lg flex items-start gap-3">
            <div className="p-2 bg-purple-100/70 text-purple-700 rounded-lg mt-0.5">
              <Layers size={18} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Retention Policy
                </p>
                <span className="text-[11px] font-medium px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full font-mono">
                  Limit: 10 Files
                </span>
              </div>
              <p className="text-sm font-medium text-slate-800 mt-1">
                Keep Only 10 Auto Backups
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                When the 11th backup is created, the oldest archive is automatically pruned.
              </p>
            </div>
          </div>
        </div>

        {/* ── 3. Destination Folder Selector ── */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2 bg-blue-50 text-[#1976D2] rounded-lg mt-0.5 shrink-0">
              <Folder size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Auto Backup Folder Location
              </p>
              <p className="text-sm font-mono text-gray-800 break-all select-all mt-0.5 font-medium">
                {isLoading ? "Loading directory..." : config.destinationFolder || "Documents\\LaimsoftPOS_Backups\\Auto_Backups"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Auto-backup archives are safely stored inside this folder on your computer.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={handleChangeFolder}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-white transition-colors"
            >
              Change Folder
            </button>
            <button
              onClick={handleOpenFolder}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-white flex items-center gap-1.5 transition-colors"
            >
              <FolderOpen size={14} />
              Open Folder
            </button>
          </div>
        </div>

        {/* ── 4. Manual Test Trigger & Stats Strip ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-gray-400" />
              <span>
                Last Auto Backup:{" "}
                <span className="font-semibold text-gray-800">
                  {formatDate(config.lastBackupTime)}
                </span>
              </span>
            </div>
            {config.lastBackupFileName && (
              <>
                <span className="text-gray-300">•</span>
                <span className="font-mono text-gray-500 text-[11px] truncate max-w-[200px]">
                  {config.lastBackupFileName}
                </span>
              </>
            )}
          </div>

          <button
            onClick={handleTriggerNow}
            disabled={isTriggering}
            className="px-4 py-2 bg-[#1976D2] hover:bg-[#1565C0] text-white rounded-lg text-xs font-medium flex items-center gap-2 transition-colors shadow-sm disabled:opacity-60"
          >
            <RefreshCw size={14} className={isTriggering ? "animate-spin" : ""} />
            {isTriggering ? "Creating Auto Backup..." : "Create Auto Backup Now"}
          </button>
        </div>
      </div>

      {/* ── 5. Stored Auto Backups Table (10 Limit) ── */}
      <div className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">
                Stored Auto Backups
              </h3>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {backupCount} / {maxLimit} Max
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Archives are automatically sorted newest to oldest. Oldest file is pruned once capacity reaches 10.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Visual capacity progress bar */}
            <div className="w-28 hidden sm:block">
              <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                <span>Storage</span>
                <span>{capacityPercent}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    backupCount >= maxLimit ? "bg-amber-500" : "bg-[#1976D2]"
                  }`}
                  style={{ width: `${capacityPercent}%` }}
                />
              </div>
            </div>

            <button
              onClick={loadConfigAndFiles}
              className="p-1.5 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              title="Refresh Auto Backups"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {recentBackups.length === 0 ? (
          <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-xl">
            <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 text-[#1976D2] flex items-center justify-center mb-3">
              <FileArchive size={24} />
            </div>
            <h4 className="text-sm font-semibold text-gray-800">
              No auto backups created yet
            </h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
              An automatic backup will be created whenever you close the application, or you can click "Create Auto Backup Now" to make the first snapshot.
            </p>
            <button
              onClick={handleTriggerNow}
              disabled={isTriggering}
              className="px-4 py-2 bg-[#1976D2] text-white rounded-lg text-xs font-medium hover:bg-[#1565C0] transition-colors"
            >
              Create Auto Backup Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="pb-2.5 font-medium">Backup Archive</th>
                  <th className="pb-2.5 font-medium">Created Date</th>
                  <th className="pb-2.5 font-medium">File Size</th>
                  <th className="pb-2.5 font-medium">Status</th>
                  <th className="pb-2.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentBackups.map((item, index) => {
                  const isNewest = index === 0;
                  return (
                    <tr key={item.filePath} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-blue-50 text-[#1976D2] rounded-lg">
                            <FileArchive size={16} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 font-mono text-xs">
                              {item.fileName}
                            </p>
                            <p className="text-[10px] text-gray-400 font-mono truncate max-w-xs">
                              {item.filePath}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-gray-600 whitespace-nowrap">
                        {formatDate(item.createdAt || item.modifiedAt)}
                      </td>
                      <td className="py-3 font-mono text-gray-600 whitespace-nowrap">
                        {formatBytes(item.size)}
                      </td>
                      <td className="py-3">
                        {isNewest ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">
                            <Sparkles size={11} />
                            Latest
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            Auto #{backupCount - index}
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleRestoreFromHere(item)}
                            className="px-2.5 py-1 text-xs font-medium text-[#1976D2] bg-blue-50 hover:bg-blue-100 rounded-md transition-colors flex items-center gap-1"
                            title="Restore database from this auto backup"
                          >
                            Restore
                            <ArrowRight size={12} />
                          </button>
                          <button
                            onClick={() => setBackupToDelete(item)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                            title="Delete this backup"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {backupToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 bg-red-50 rounded-xl">
                <AlertCircle size={22} />
              </div>
              <h3 className="text-base font-semibold text-gray-900">
                Delete Auto Backup?
              </h3>
            </div>
            <p className="text-xs text-gray-600">
              Are you sure you want to permanently delete this auto-backup archive from disk?
            </p>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-700 break-all">
              {backupToDelete.fileName}
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBackupToDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteBackup(backupToDelete)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors"
              >
                Delete Backup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
