const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const backupService = require('./backup-service.cjs');
const autoBackupService = require('./auto-backup-service.cjs');

const isDev = process.env.ELECTRON_DEV === 'true';

// Ensure single instance to prevent database conflicts
const gotTheLock = app.requestSingleInstanceLock();

let mainWindow = null;
let serverInstance = null;

// Initialize user data directory for SQLite database & uploaded media
function setupUserDataPaths() {
  const userDataPath = app.getPath('userData');
  const dataDir = path.join(userDataPath, 'data');
  const appDataDir = path.join(userDataPath, 'app_data');

  fs.mkdirSync(dataDir, { recursive: true });
  fs.mkdirSync(appDataDir, { recursive: true });

  // Subfolders for media and attachments
  const subfolders = [
    'items_images',
    'sale_attachments',
    'purchase_attachments',
    'estimate_attachments',
    'paymentin_attachments',
    'paymentout_attachments',
    'bank_account_attachments',
    'expense_attachments'
  ];
  for (const folder of subfolders) {
    fs.mkdirSync(path.join(appDataDir, folder), { recursive: true });
  }

  // Copy bundled database on first launch if not present
  const destDb = path.join(dataDir, 'pos.db');
  if (!fs.existsSync(destDb)) {
    const srcDb = path.join(__dirname, '../data/pos.db');
    if (fs.existsSync(srcDb)) {
      try {
        fs.copyFileSync(srcDb, destDb);
        console.log('Initialized database from bundle to:', destDb);
      } catch (err) {
        console.error('Failed to copy initial database:', err);
      }
    }
  }

  // Set environment variables so database client and router use these paths
  process.env.POS_DATA_DIR = dataDir;
  process.env.POS_DB_PATH = destDb;
  process.env.POS_APPDATA_DIR = appDataDir;

  // Ensure .lsb file icon is registered in Windows Explorer for local development
  if (process.platform === 'win32') {
    try {
      const { registerLsbIcon } = require('../tools/register-file-icon.cjs');
      registerLsbIcon();
    } catch {}
  }

  return { userDataPath, dataDir, appDataDir };
}

async function createWindow() {
  const paths = setupUserDataPaths();

  // Start local embedded server
  const { startLocalServer } = await import('../server/api-server.mjs');
  
  const staticDir = isDev ? null : path.join(__dirname, '../dist');
  let port = 3001;
  try {
    const started = await startLocalServer(port, {
      appDataRoot: paths.appDataDir,
      staticDir,
    });
    port = started.port;
    serverInstance = started.server;
  } catch (err) {
    console.warn('Port 3001 busy, starting on dynamic port...');
    const started = await startLocalServer(0, {
      appDataRoot: paths.appDataDir,
      staticDir,
    });
    port = started.port;
    serverInstance = started.server;
  }

  const iconPath = path.join(__dirname, '../assets/app-icon.ico');

  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth: 1024,
    minHeight: 650,
    title: "POS Desktop Application",
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
  });

  mainWindow.maximize();

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  let isQuittingAfterBackup = false;

  mainWindow.on('close', async (e) => {
    if (isQuittingAfterBackup) {
      return;
    }

    try {
      const config = autoBackupService.getAutoBackupConfig();
      if (config && config.enabled && config.backupOnClose) {
        e.preventDefault();

        // Notify UI to render the saving modal
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('auto-backup-closing');
        }

        // Run auto backup with 8-second safety timeout
        await Promise.race([
          autoBackupService.runAutoBackup({
            dbPath: paths.destDb || process.env.POS_DB_PATH,
            appDataDir: paths.appDataDir || process.env.POS_APPDATA_DIR,
            win: mainWindow,
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Auto backup timeout')), 8000)),
        ]);
      }
    } catch (err) {
      console.warn('Auto backup before exit note:', err.message);
    } finally {
      isQuittingAfterBackup = true;
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.destroy();
      }
    }
  });

  // Handle thermal print IPC
  ipcMain.handle('print-receipt', async (event, options = {}) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return { success: false, failureReason: 'Window not found' };

    return new Promise((resolve) => {
      win.webContents.print(
        {
          silent: options.silent ?? false,
          printBackground: true,
          deviceName: options.deviceName || '',
        },
        (success, failureReason) => {
          resolve({ success, failureReason });
        }
      );
    });
  });

  ipcMain.handle('get-printers', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    return win ? await win.webContents.getPrintersAsync() : [];
  });

  // Handle Save PDF via Electron printToPDF and native Save As dialog
  ipcMain.handle('save-pdf', async (event, options = {}) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return { success: false, failureReason: 'Window not found' };

    try {
      const pdfOptions = {
        printBackground: true,
        preferCSSPageSize: true,
        landscape: false,
        ...(options.pdfOptions || {}),
      };

      // Generate the PDF buffer directly from Chromium's printing engine
      const pdfBuffer = await win.webContents.printToPDF(pdfOptions);

      // Open native Windows "Save As" file dialog so user can choose location and file name
      const defaultFilename = options.defaultFilename || 'Document.pdf';
      const defaultPath = options.defaultPath || path.join(app.getPath('documents'), defaultFilename);
      const { canceled, filePath } = await dialog.showSaveDialog(win, {
        title: options.title || 'Save as PDF',
        defaultPath,
        filters: [
          { name: 'PDF Documents (*.pdf)', extensions: ['pdf'] },
          { name: 'All Files (*.*)', extensions: ['*'] },
        ],
      });

      if (canceled || !filePath) {
        return { success: false, canceled: true };
      }

      await fs.promises.writeFile(filePath, pdfBuffer);
      return { success: true, filePath };
    } catch (err) {
      console.error('Failed to save PDF:', err);
      return { success: false, failureReason: err?.message || String(err) };
    }
  });

  // Handle Open PDF via Electron printToPDF and native system PDF viewer
  ipcMain.handle('open-pdf', async (event, options = {}) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return { success: false, failureReason: 'Window not found' };

    try {
      const pdfOptions = {
        printBackground: true,
        preferCSSPageSize: true,
        landscape: false,
        ...(options.pdfOptions || {}),
      };

      // Generate the PDF buffer directly from Chromium's printing engine
      const pdfBuffer = await win.webContents.printToPDF(pdfOptions);

      // Write to a temporary file and open with the system's default viewer
      const defaultFilename = options.defaultFilename || `Document_${Date.now()}.pdf`;
      const tempPath = path.join(app.getPath('temp'), defaultFilename);

      await fs.promises.writeFile(tempPath, pdfBuffer);
      await shell.openPath(tempPath);

      return { success: true, filePath: tempPath };
    } catch (err) {
      console.error('Failed to open PDF:', err);
      return { success: false, failureReason: err?.message || String(err) };
    }
  });

  // ── BACKUP & RESTORE IPC HANDLERS ──────────────────────────────────────────

  ipcMain.handle('backup-get-default-path', async () => {
    return { defaultDir: backupService.getDefaultBackupDir() };
  });

  ipcMain.handle('backup-select-folder', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      title: 'Select Destination Folder for Backups',
      defaultPath: backupService.getDefaultBackupDir(),
      properties: ['openDirectory', 'createDirectory'],
    });
    return { canceled, folderPath: !canceled && filePaths?.length ? filePaths[0] : null };
  });

  ipcMain.handle('backup-open-folder', async (event, folderPath) => {
    const target = folderPath || backupService.getDefaultBackupDir();
    await shell.openPath(target);
    return { success: true };
  });

  ipcMain.handle('backup-list-recent', async (event, folderPath) => {
    const target = folderPath || backupService.getDefaultBackupDir();
    return await backupService.listRecentBackups(target);
  });

  ipcMain.handle('backup-create', async (event, options = {}) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    try {
      const result = await backupService.createBackup({
        win,
        dbPath: paths.destDb || process.env.POS_DB_PATH,
        appDataDir: paths.appDataDir || process.env.POS_APPDATA_DIR,
        targetDir: options.targetDir,
        saveAs: options.saveAs ?? false,
        settings: options.settings || {},
      });
      return result;
    } catch (err) {
      console.error('Backup creation error:', err);
      return { success: false, failureReason: err.message };
    }
  });

  ipcMain.handle('backup-inspect', async (event, filePath) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    try {
      return await backupService.inspectBackup({ win, filePath });
    } catch (err) {
      console.error('Backup inspection error:', err);
      return { isValid: false, failureReason: err.message };
    }
  });

  ipcMain.handle('backup-restore', async (event, options = {}) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    try {
      const result = await backupService.restoreBackup({
        win,
        filePath: options.filePath,
        dbPath: paths.destDb || process.env.POS_DB_PATH,
        appDataDir: paths.appDataDir || process.env.POS_APPDATA_DIR,
        createSafetyBackup: options.createSafetyBackup ?? true,
      });
      return result;
    } catch (err) {
      console.error('Backup restore error:', err);
      return { success: false, failureReason: err.message };
    }
  });

  ipcMain.handle('backup-delete', async (event, filePath) => {
    try {
      return backupService.deleteBackupFile(filePath);
    } catch (err) {
      return { success: false, failureReason: err.message };
    }
  });

  ipcMain.handle('app-reload', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      win.reload();
    }
    return { success: true };
  });

  // Auto Backup IPC handlers
  ipcMain.handle('auto-backup-get-config', async () => {
    return autoBackupService.getAutoBackupConfig();
  });

  ipcMain.handle('auto-backup-save-config', async (event, newConfig) => {
    return autoBackupService.saveAutoBackupConfig(newConfig);
  });

  ipcMain.handle('auto-backup-trigger-now', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    try {
      const result = await autoBackupService.runAutoBackup({
        win,
        dbPath: paths.destDb || process.env.POS_DB_PATH,
        appDataDir: paths.appDataDir || process.env.POS_APPDATA_DIR,
        isManualTrigger: true,
      });
      return result;
    } catch (err) {
      console.error('Manual auto backup trigger error:', err);
      return { success: false, failureReason: err.message };
    }
  });

  ipcMain.handle('auto-backup-list', async (event, folderPath) => {
    return await autoBackupService.listAutoBackups(folderPath);
  });

  ipcMain.handle('auto-backup-select-folder', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const config = autoBackupService.getAutoBackupConfig();
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      title: 'Select Destination Folder for Auto Backups',
      defaultPath: config.destinationFolder || autoBackupService.getDefaultAutoBackupDir(),
      properties: ['openDirectory', 'createDirectory'],
    });
    return { canceled, folderPath: !canceled && filePaths?.length ? filePaths[0] : null };
  });

  ipcMain.handle('auto-backup-open-folder', async (event, folderPath) => {
    const config = autoBackupService.getAutoBackupConfig();
    const target = folderPath || config.destinationFolder || autoBackupService.getDefaultAutoBackupDir();
    await shell.openPath(target);
    return { success: true };
  });

  if (!app.isPackaged) {
    try {
      const res = await fetch('http://localhost:5173', { method: 'HEAD' });
      if (res.ok) {
        mainWindow.loadURL('http://localhost:5173');
        return;
      }
    } catch {}
  }
  mainWindow.loadURL(`http://127.0.0.1:${port}`);
}

if (!gotTheLock) {
  app.quit();
} else {
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.laimsoft.pos');
  }
  app.whenReady().then(createWindow);
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on('window-all-closed', () => {
  if (serverInstance) {
    try {
      serverInstance.close();
    } catch {}
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
