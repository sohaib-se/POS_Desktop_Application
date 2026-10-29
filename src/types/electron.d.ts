export interface SavePdfOptions {
  html?: string;
  defaultFilename?: string;
  defaultPath?: string;
  title?: string;
  isThermal?: boolean;
  pdfOptions?: {
    printBackground?: boolean;
    preferCSSPageSize?: boolean;
    landscape?: boolean;
    pageSize?: string | { width: number; height: number };
  };
}

export interface SavePdfResult {
  success: boolean;
  canceled?: boolean;
  filePath?: string;
  failureReason?: string;
}

export interface BackupItem {
  fileName: string;
  filePath: string;
  size: number;
  createdAt: string;
  modifiedAt: string;
}

export interface BackupStats {
  partiesCount: number;
  itemsCount: number;
  saleInvoicesCount: number;
  transactionsCount: number;
  businessName?: string;
  businessPhone?: string;
}

export interface CreateBackupResult {
  success?: boolean;
  canceled?: boolean;
  filePath?: string;
  fileName?: string;
  size?: number;
  createdAt?: string;
  businessName?: string;
  stats?: BackupStats;
  failureReason?: string;
}

export interface InspectBackupResult {
  isValid: boolean;
  canceled?: boolean;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  createdAt?: string;
  businessName?: string;
  businessPhone?: string;
  appName?: string;
  appVersion?: string;
  stats?: BackupStats | null;
  settings?: any;
  failureReason?: string;
}

export interface RestoreBackupResult {
  success: boolean;
  settings?: any;
  safetyBackupPath?: string | null;
  businessName?: string;
  createdAt?: string;
  failureReason?: string;
}

export interface BackupAPI {
  getDefaultPath: () => Promise<{ defaultDir: string }>;
  selectFolder: () => Promise<{ canceled: boolean; folderPath?: string | null }>;
  openFolder: (folderPath?: string) => Promise<{ success: boolean }>;
  listRecent: (folderPath?: string) => Promise<BackupItem[]>;
  create: (options?: {
    targetDir?: string;
    saveAs?: boolean;
    settings?: any;
  }) => Promise<CreateBackupResult>;
  inspect: (filePath?: string) => Promise<InspectBackupResult>;
  restore: (options: {
    filePath: string;
    createSafetyBackup?: boolean;
  }) => Promise<RestoreBackupResult>;
  delete: (filePath: string) => Promise<{ success: boolean; failureReason?: string }>;
}

export interface AutoBackupConfig {
  enabled: boolean;
  backupOnClose: boolean;
  maxBackups: number;
  destinationFolder: string;
  lastBackupTime?: string | null;
  lastBackupFileName?: string | null;
  lastBackupSize?: number;
}

export interface AutoBackupAPI {
  getConfig: () => Promise<AutoBackupConfig>;
  saveConfig: (newConfig: Partial<AutoBackupConfig>) => Promise<AutoBackupConfig>;
  triggerNow: () => Promise<CreateBackupResult & { prunedCount?: number; remainingCount?: number }>;
  listRecent: (folderPath?: string) => Promise<BackupItem[]>;
  selectFolder: () => Promise<{ canceled: boolean; folderPath?: string | null }>;
  openFolder: (folderPath?: string) => Promise<{ success: boolean }>;
  onClosingBackup: (callback: () => void) => () => void;
}

export interface ElectronAPI {
  platform: string;
  printReceipt: (options?: { silent?: boolean; deviceName?: string }) => Promise<{ success: boolean; failureReason?: string }>;
  cutReceipt?: (options?: { deviceName?: string; printerName?: string }) => Promise<{ success: boolean; output?: string; failureReason?: string }>;
  getPrinters: () => Promise<any[]>;
  savePdf: (options?: SavePdfOptions) => Promise<SavePdfResult>;
  openPdf: (options?: SavePdfOptions) => Promise<SavePdfResult>;
  backup: BackupAPI;
  autoBackup: AutoBackupAPI;
  reloadApp: () => Promise<{ success: boolean }>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
