const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  printReceipt: (options) => ipcRenderer.invoke('print-receipt', options),
  cutReceipt: (options) => ipcRenderer.invoke('cut-receipt', options),
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  savePdf: (options) => ipcRenderer.invoke('save-pdf', options),
  openPdf: (options) => ipcRenderer.invoke('open-pdf', options),
  backup: {
    getDefaultPath: () => ipcRenderer.invoke('backup-get-default-path'),
    selectFolder: () => ipcRenderer.invoke('backup-select-folder'),
    openFolder: (folderPath) => ipcRenderer.invoke('backup-open-folder', folderPath),
    listRecent: (folderPath) => ipcRenderer.invoke('backup-list-recent', folderPath),
    create: (options) => ipcRenderer.invoke('backup-create', options),
    inspect: (filePath) => ipcRenderer.invoke('backup-inspect', filePath),
    restore: (options) => ipcRenderer.invoke('backup-restore', options),
    delete: (filePath) => ipcRenderer.invoke('backup-delete', filePath),
  },
  autoBackup: {
    getConfig: () => ipcRenderer.invoke('auto-backup-get-config'),
    saveConfig: (newConfig) => ipcRenderer.invoke('auto-backup-save-config', newConfig),
    triggerNow: () => ipcRenderer.invoke('auto-backup-trigger-now'),
    listRecent: (folderPath) => ipcRenderer.invoke('auto-backup-list', folderPath),
    selectFolder: () => ipcRenderer.invoke('auto-backup-select-folder'),
    openFolder: (folderPath) => ipcRenderer.invoke('auto-backup-open-folder', folderPath),
    onClosingBackup: (callback) => {
      const handler = () => callback();
      ipcRenderer.on('auto-backup-closing', handler);
      return () => ipcRenderer.removeListener('auto-backup-closing', handler);
    },
  },
  reloadApp: () => ipcRenderer.invoke('app-reload'),
});
