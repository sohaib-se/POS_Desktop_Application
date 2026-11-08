import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Folder,
  FolderOpen,
  HardDrive,
  Download,
  RefreshCw,
  FileArchive,
  Trash2,
  ShieldCheck,
  Clock,
  AlertCircle,
  Database,
  ArrowRight,
} from "lucide-react";
import { toast } from "@/components/ui/Toast";
import type { BackupItem } from "@/types/electron";

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(iso: string, locale = "en-US"): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(locale, {
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

export function BackupToComputerSettings() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === "de" ? "de-DE" : "en-US";
  const [destinationFolder, setDestinationFolder] = useState<string>("");
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isCreatingBackup, setIsCreatingBackup] = useState<boolean>(false);
  const [isSavingAs, setIsSavingAs] = useState<boolean>(false);
  const [recentBackups, setRecentBackups] = useState<BackupItem[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState<boolean>(false);
  const [backupToDelete, setBackupToDelete] = useState<BackupItem | null>(null);

  // Load default destination folder and stored preference
  const loadFolderAndBackups = useCallback(async () => {
    setIsLoadingBackups(true);
    try {
      let folder = localStorage.getItem("backup.destinationFolder");
      if (!folder && window.electronAPI?.backup) {
        const defaultRes = await window.electronAPI.backup.getDefaultPath();
        folder = defaultRes.defaultDir;
        localStorage.setItem("backup.destinationFolder", folder);
      }
      setDestinationFolder(folder || "");

      if (folder && window.electronAPI?.backup) {
        const backups = await window.electronAPI.backup.listRecent(folder);
        setRecentBackups(backups || []);
      }
    } catch (err: any) {
      console.error("Failed to load backup folder or recent files:", err);
    } finally {
      setIsInitializing(false);
      setIsLoadingBackups(false);
    }
  }, []);

  useEffect(() => {
    loadFolderAndBackups();
  }, [loadFolderAndBackups]);

  // Handle changing folder via native directory dialog
  const handleChangeFolder = async () => {
    if (!window.electronAPI?.backup) {
      toast.error("Electron API is unavailable in this environment.");
      return;
    }

    try {
      const res = await window.electronAPI.backup.selectFolder();
      if (!res.canceled && res.folderPath) {
        setDestinationFolder(res.folderPath);
        localStorage.setItem("backup.destinationFolder", res.folderPath);
        toast.success("Backup destination folder updated.");

        // Refresh list of backups for the new folder
        setIsLoadingBackups(true);
        const backups = await window.electronAPI.backup.listRecent(res.folderPath);
        setRecentBackups(backups || []);
        setIsLoadingBackups(false);
      }
    } catch (err: any) {
      toast.error(`Failed to select folder: ${err?.message || "Unknown error"}`);
    }
  };

  // Open destination folder in Windows Explorer
  const handleOpenFolder = async () => {
    if (!window.electronAPI?.backup) return;
    try {
      await window.electronAPI.backup.openFolder(destinationFolder);
    } catch (err: any) {
      toast.error("Could not open folder in Explorer.");
    }
  };

  // Gather current localStorage settings to embed in backup
  const exportCurrentSettings = () => {
    const settings: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("settings.") || key.startsWith("print_") || key.startsWith("backup."))) {
        try {
          settings[key] = JSON.parse(localStorage.getItem(key) || "null");
        } catch {
          settings[key] = localStorage.getItem(key);
        }
      }
    }
    return settings;
  };

  // Create backup directly to the configured destination folder
  const handleCreateBackup = async () => {
    if (isCreatingBackup || isSavingAs) return;
    if (!window.electronAPI?.backup) {
      toast.error("Backup creation is only available in the desktop application.");
      return;
    }

    setIsCreatingBackup(true);
    try {
      const result = await window.electronAPI.backup.create({
        targetDir: destinationFolder,
        saveAs: false,
        settings: exportCurrentSettings(),
      });

      if (result.canceled) return;

      if (!result.success) {
        throw new Error(result.failureReason || "Backup creation failed.");
      }

      toast.success(`Backup created: ${result.fileName}`);

      // Refresh recent backups
      const backups = await window.electronAPI.backup.listRecent(destinationFolder);
      setRecentBackups(backups || []);
    } catch (err: any) {
      console.error("Backup error:", err);
      toast.error(`Failed to create backup: ${err?.message || "Unknown error"}`);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  // Create backup with custom "Save As" location dialog
  const handleSaveAsBackup = async () => {
    if (isCreatingBackup || isSavingAs) return;
    if (!window.electronAPI?.backup) {
      toast.error("Backup creation is only available in the desktop application.");
      return;
    }

    setIsSavingAs(true);
    try {
      const result = await window.electronAPI.backup.create({
        targetDir: destinationFolder,
        saveAs: true,
        settings: exportCurrentSettings(),
      });

      if (result.canceled) return;

      if (!result.success) {
        throw new Error(result.failureReason || "Save As backup failed.");
      }

      toast.success(`Backup saved successfully to: ${result.fileName}`);

      // Refresh list if saved in the active directory
      const backups = await window.electronAPI.backup.listRecent(destinationFolder);
      setRecentBackups(backups || []);
    } catch (err: any) {
      console.error("Save As error:", err);
      toast.error(`Failed to save backup: ${err?.message || "Unknown error"}`);
    } finally {
      setIsSavingAs(false);
    }
  };

  // Delete a backup file
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

  // Jump to restore page with this file
  const handleRestoreFromHere = (item: BackupItem) => {
    sessionStorage.setItem("restore.targetFile", item.filePath);
    window.dispatchEvent(
      new CustomEvent("navigate-to-page", {
        detail: { page: "sync-restore-backup", filePath: item.filePath },
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* ── Main Settings Card ── */}
      <div className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm space-y-6">
        {/* Destination folder selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 text-[#1976D2] rounded-lg mt-0.5">
              <Folder size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {t("backup.backupLocation")}
              </p>
              <p
                className="text-sm font-medium text-gray-900 mt-0.5 break-all font-mono"
                title={destinationFolder}
              >
                {isInitializing ? t("common.loading") : destinationFolder || t("backup.disabled")}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {t("backup.backupLocationDesc")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={handleChangeFolder}
              className="px-3.5 py-1.5 border border-gray-300 bg-white hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 transition-colors shadow-sm"
              title={t("backup.changeFolder")}
            >
              {t("backup.changeFolder")}
            </button>
            <button
              onClick={handleOpenFolder}
              className="p-1.5 border border-gray-300 bg-white hover:bg-gray-100 rounded-lg text-gray-700 transition-colors shadow-sm"
              title={t("backup.openFolder")}
            >
              <FolderOpen size={16} />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Primary Backup Button */}
          <button
            onClick={handleCreateBackup}
            disabled={isCreatingBackup || isSavingAs}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1976D2] hover:bg-[#1565C0] text-white rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isCreatingBackup ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>{t("backup.creatingBackup")}</span>
              </>
            ) : (
              <>
                <HardDrive size={16} />
                <span>{t("backup.createBackupToFolder")}</span>
              </>
            )}
          </button>

          {/* Save As Custom Location */}
          <button
            onClick={handleSaveAsBackup}
            disabled={isCreatingBackup || isSavingAs}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            title={t("backup.saveAsCustom")}
          >
            {isSavingAs ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>{t("backup.savingAs")}</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>{t("backup.saveAsCustom")}</span>
              </>
            )}
          </button>

          <button
            onClick={handleOpenFolder}
            className="px-4 py-2.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            {t("backup.openInExplorer")}
          </button>
        </div>

        {/* Informative Security Banner */}
        <div className="flex items-start gap-3 p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-lg">
          <ShieldCheck size={18} className="text-[#1976D2] shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900 leading-relaxed">
            <span className="font-semibold">{t("backup.completeProtectionTitle")}</span>{" "}
            {t("backup.completeProtectionDesc")}
          </div>
        </div>
      </div>

      {/* ── Recent Backups List ── */}
      <div className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-gray-700" />
            <h3 className="text-base font-semibold text-gray-900">
              {t("backup.existingBackups")}
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
              {recentBackups.length}
            </span>
          </div>

          <button
            onClick={() => loadFolderAndBackups()}
            disabled={isLoadingBackups}
            className="flex items-center gap-1.5 text-xs text-[#1976D2] hover:text-[#1565C0] font-medium"
          >
            <RefreshCw size={13} className={isLoadingBackups ? "animate-spin" : ""} />
            <span>{t("backup.refreshList")}</span>
          </button>
        </div>

        {isLoadingBackups ? (
          <div className="py-8 text-center text-sm text-gray-500">{t("backup.loadingBackups")}</div>
        ) : recentBackups.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <FileArchive size={36} className="mx-auto text-gray-300" />
            <p className="text-sm font-medium text-gray-700">{t("backup.noBackupsFound")}</p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {t("backup.noBackupsFoundDesc")}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentBackups.map((item) => (
              <div
                key={item.filePath}
                className="py-3 px-2 flex items-center justify-between gap-4 hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                    <FileArchive size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate font-mono">
                      {item.fileName}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDate(item.modifiedAt || item.createdAt, dateLocale)}
                      </span>
                      <span>•</span>
                      <span className="font-medium text-gray-600">{formatBytes(item.size)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleRestoreFromHere(item)}
                    className="flex items-center gap-1 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md text-xs font-semibold transition-colors"
                    title={t("backup.restore")}
                  >
                    <span>{t("backup.restore")}</span>
                    <ArrowRight size={12} />
                  </button>

                  <button
                    onClick={() => setBackupToDelete(item)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title={t("backup.delete")}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Confirm Delete Modal ── */}
      {backupToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle size={22} />
              </div>
              <h4 className="text-base font-semibold text-gray-900">{t("backup.deleteBackupFileTitle")}</h4>
            </div>

            <p className="text-sm text-gray-600">
              {t("backup.deleteBackupFileConfirm", { fileName: backupToDelete.fileName })}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setBackupToDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={() => handleDeleteBackup(backupToDelete)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold"
              >
                {t("backup.yesDelete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
