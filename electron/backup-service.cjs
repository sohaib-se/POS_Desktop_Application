const fs = require('fs');
const path = require('path');
const { app, dialog, shell } = require('electron');
const AdmZip = require('adm-zip');

function getNativeBindingPath() {
  const isElectron = Boolean(process.versions && process.versions.electron);
  const targetDir = isElectron ? 'node-v132-win32-x64' : 'node-v127-win32-x64';
  const customPath = path.join(__dirname, '..', 'node_modules/better-sqlite3/lib/binding', targetDir, 'better_sqlite3.node');
  if (fs.existsSync(customPath)) {
    return customPath;
  }
  return undefined;
}

function openDatabaseSafely(dbPath, readonly = false) {
  const Database = require('better-sqlite3');
  const nativeBinding = getNativeBindingPath();
  return new Database(dbPath, {
    readonly,
    ...(nativeBinding ? { nativeBinding } : {}),
  });
}

/**
 * Returns the default backup directory: Documents\LaimsoftPOS_Backups
 */
function getDefaultBackupDir() {
  let docs = null;
  try {
    if (app && app.getPath) docs = app.getPath('documents');
  } catch {}
  if (!docs) {
    docs = path.join(process.env.USERPROFILE || process.env.HOME || '.', 'Documents');
  }
  const backupDir = path.join(docs, 'LaimsoftPOS_Backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  return backupDir;
}

/**
 * Generates a default backup filename with current timestamp.
 */
function generateBackupFilename(prefix = 'Laimsoft_Backup') {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  return `${prefix}_${dateStr}.lsb`;
}

/**
 * Flushes WAL journal to main database file so pos.db is 100% self-contained.
 */
function checkpointWal(dbPath) {
  try {
    const db = openDatabaseSafely(dbPath, false);
    try {
      db.pragma('wal_checkpoint(TRUNCATE)');
    } finally {
      db.close();
    }
  } catch (err) {
    console.warn('WAL checkpoint note:', err.message);
  }
}

/**
 * Reads quick summary statistics from the database for the manifest.
 */
function getDatabaseStats(dbPath) {
  const stats = {
    partiesCount: 0,
    itemsCount: 0,
    saleInvoicesCount: 0,
    transactionsCount: 0,
    businessName: 'Laimsoft POS',
    businessPhone: '',
  };

  try {
    const db = openDatabaseSafely(dbPath, true);
    try {
      const getCount = (table) => {
        try {
          const row = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
          return row ? row.count : 0;
        } catch {
          return 0;
        }
      };

      stats.partiesCount = getCount('parties');
      stats.itemsCount = getCount('items');
      stats.saleInvoicesCount = getCount('sale_invoices');
      stats.transactionsCount = getCount('transactions');

      try {
        const profile = db.prepare('SELECT business_name, phone FROM user_profile LIMIT 1').get();
        if (profile) {
          if (profile.business_name) stats.businessName = profile.business_name;
          if (profile.phone) stats.businessPhone = profile.phone;
        }
      } catch {}
    } finally {
      db.close();
    }
  } catch (err) {
    console.warn('Could not read database stats:', err.message);
  }

  return stats;
}

/**
 * Recursively adds all files from a directory into an AdmZip instance.
 */
function addDirectoryToZip(zip, sourceDir, zipRootPath = '') {
  if (!fs.existsSync(sourceDir)) return;
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(sourceDir, entry.name);
    const targetZipPath = zipRootPath ? `${zipRootPath}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      addDirectoryToZip(zip, fullPath, targetZipPath);
    } else if (entry.isFile()) {
      try {
        const fileContent = fs.readFileSync(fullPath);
        const zipDir = path.dirname(targetZipPath).replace(/\\/g, '/');
        zip.addFile(targetZipPath.replace(/\\/g, '/'), fileContent);
      } catch (err) {
        console.warn(`Failed to add ${fullPath} to backup zip:`, err.message);
      }
    }
  }
}

/**
 * Creates a complete .lsb backup file.
 */
async function createBackup({
  win,
  dbPath,
  appDataDir,
  targetDir,
  saveAs = false,
  settings = {},
  prefix = 'Laimsoft_Backup',
}) {
  if (!fs.existsSync(dbPath)) {
    throw new Error('Database file pos.db was not found.');
  }

  const destinationDir = targetDir || getDefaultBackupDir();
  const defaultFilename = generateBackupFilename(prefix);
  let finalPath = path.join(destinationDir, defaultFilename);

  if (saveAs && win) {
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: 'Save POS Backup As',
      defaultPath: finalPath,
      filters: [
        { name: 'Laimsoft POS Backup (*.lsb)', extensions: ['lsb'] },
        { name: 'All Files (*.*)', extensions: ['*'] },
      ],
    });

    if (canceled || !filePath) {
      return { canceled: true };
    }
    finalPath = filePath;
  }

  // Ensure destination folder exists
  const parentDir = path.dirname(finalPath);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  // Flush WAL before packaging
  checkpointWal(dbPath);

  // Read stats for manifest
  const stats = getDatabaseStats(dbPath);

  const manifest = {
    appName: 'Laimsoft POS Desktop',
    appVersion: (app && app.getVersion) ? app.getVersion() : '1.0.0',
    backupFormat: 'lsb',
    createdAt: new Date().toISOString(),
    businessName: stats.businessName,
    businessPhone: stats.businessPhone,
    stats,
    settings,
  };

  const zip = new AdmZip();

  // 1. Add manifest
  zip.addFile('manifest.json', Buffer.from(JSON.stringify(manifest, null, 2), 'utf8'));

  // 2. Add database snapshot
  const dbContent = fs.readFileSync(dbPath);
  zip.addFile('database/pos.db', dbContent);

  // 3. Add app_data directory (images, receipts, attachments)
  if (fs.existsSync(appDataDir)) {
    addDirectoryToZip(zip, appDataDir, 'attachments');
  }

  // Write .lsb archive to target location
  await zip.writeZipPromise(finalPath);

  const fileStats = fs.statSync(finalPath);

  return {
    success: true,
    filePath: finalPath,
    fileName: path.basename(finalPath),
    size: fileStats.size,
    createdAt: manifest.createdAt,
    businessName: manifest.businessName,
    stats: manifest.stats,
  };
}

/**
 * Inspects a .lsb backup file without restoring it, returning manifest metadata.
 */
async function inspectBackup({ win, filePath }) {
  let targetPath = filePath;

  if (!targetPath && win) {
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      title: 'Select Backup File to Restore',
      defaultPath: getDefaultBackupDir(),
      properties: ['openFile'],
      filters: [
        { name: 'Laimsoft POS Backup (*.lsb)', extensions: ['lsb', 'zip'] },
        { name: 'All Files (*.*)', extensions: ['*'] },
      ],
    });

    if (canceled || !filePaths || filePaths.length === 0) {
      return { canceled: true };
    }
    targetPath = filePaths[0];
  }

  if (!targetPath || !fs.existsSync(targetPath)) {
    throw new Error('Selected backup file does not exist.');
  }

  try {
    const zip = new AdmZip(targetPath);
    const manifestEntry = zip.getEntry('manifest.json');
    const dbEntry = zip.getEntry('database/pos.db');

    if (!dbEntry) {
      return {
        isValid: false,
        failureReason: 'Invalid backup format: database/pos.db is missing in the backup archive.',
      };
    }

    let manifest = null;
    if (manifestEntry) {
      try {
        const text = zip.readAsText(manifestEntry);
        manifest = JSON.parse(text);
      } catch (err) {
        console.warn('Failed to parse manifest.json:', err.message);
      }
    }

    const fileStat = fs.statSync(targetPath);

    return {
      isValid: true,
      filePath: targetPath,
      fileName: path.basename(targetPath),
      fileSize: fileStat.size,
      createdAt: manifest?.createdAt || fileStat.mtime.toISOString(),
      businessName: manifest?.businessName || 'Unknown Business',
      businessPhone: manifest?.businessPhone || '',
      appName: manifest?.appName || 'Laimsoft POS',
      appVersion: manifest?.appVersion || '',
      stats: manifest?.stats || null,
      settings: manifest?.settings || null,
    };
  } catch (err) {
    return {
      isValid: false,
      failureReason: `Failed to read backup file: ${err.message}`,
    };
  }
}

/**
 * Restores a .lsb backup into the application data directories.
 */
async function restoreBackup({
  win,
  filePath,
  dbPath,
  appDataDir,
  createSafetyBackup = true,
}) {
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error('Backup file to restore does not exist.');
  }

  // 1. Inspect first to ensure validity
  const inspection = await inspectBackup({ filePath });
  if (!inspection.isValid) {
    throw new Error(inspection.failureReason || 'Invalid backup file.');
  }

  let safetyBackupPath = null;
  // 2. Create safety backup of current data if requested
  if (createSafetyBackup && fs.existsSync(dbPath)) {
    try {
      const safetyResult = await createBackup({
        win,
        dbPath,
        appDataDir,
        targetDir: getDefaultBackupDir(),
        saveAs: false,
        prefix: 'PreRestore_SafetyBackup',
      });
      if (safetyResult.success) {
        safetyBackupPath = safetyResult.filePath;
      }
    } catch (err) {
      console.warn('Safety backup could not be completed, continuing:', err.message);
    }
  }

  // 3. Open the backup zip archive
  const zip = new AdmZip(filePath);

  // 4. Extract database
  const dbEntry = zip.getEntry('database/pos.db');
  if (!dbEntry) {
    throw new Error('Database pos.db was not found in the backup archive.');
  }

  // Remove existing WAL/SHM files to prevent SQLite schema/journal mismatches
  const walPath = `${dbPath}-wal`;
  const shmPath = `${dbPath}-shm`;
  if (fs.existsSync(walPath)) {
    try { fs.unlinkSync(walPath); } catch {}
  }
  if (fs.existsSync(shmPath)) {
    try { fs.unlinkSync(shmPath); } catch {}
  }

  // Extract pos.db
  const dbBuffer = zip.readFile(dbEntry);
  if (!dbBuffer) {
    throw new Error('Failed to read database content from backup.');
  }
  fs.writeFileSync(dbPath, dbBuffer);

  // 5. Extract attachments into appDataDir
  const zipEntries = zip.getEntries();
  for (const entry of zipEntries) {
    if (entry.entryName.startsWith('attachments/') && !entry.isDirectory) {
      const relPath = entry.entryName.replace(/^attachments\//, '');
      const destPath = path.join(appDataDir, relPath);
      const destFolder = path.dirname(destPath);
      if (!fs.existsSync(destFolder)) {
        fs.mkdirSync(destFolder, { recursive: true });
      }
      const fileData = zip.readFile(entry);
      if (fileData) {
        fs.writeFileSync(destPath, fileData);
      }
    }
  }

  return {
    success: true,
    settings: inspection.settings || null,
    safetyBackupPath,
    businessName: inspection.businessName,
    createdAt: inspection.createdAt,
  };
}

/**
 * Lists all existing .lsb files in a directory sorted by newest first.
 */
async function listRecentBackups(dirPath) {
  const targetDir = dirPath || getDefaultBackupDir();
  if (!fs.existsSync(targetDir)) {
    return [];
  }

  const entries = fs.readdirSync(targetDir, { withFileTypes: true });
  const backups = [];

  for (const entry of entries) {
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.lsb')) {
      const fullPath = path.join(targetDir, entry.name);
      try {
        const stats = fs.statSync(fullPath);
        backups.push({
          fileName: entry.name,
          filePath: fullPath,
          size: stats.size,
          createdAt: stats.birthtime ? stats.birthtime.toISOString() : stats.mtime.toISOString(),
          modifiedAt: stats.mtime.toISOString(),
        });
      } catch (err) {
        console.warn(`Could not stat ${fullPath}:`, err.message);
      }
    }
  }

  // Sort newest first
  backups.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());
  return backups;
}

/**
 * Deletes a backup file from disk.
 */
function deleteBackupFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return { success: true };
  }
  return { success: false, failureReason: 'File does not exist' };
}

module.exports = {
  getDefaultBackupDir,
  createBackup,
  inspectBackup,
  restoreBackup,
  listRecentBackups,
  deleteBackupFile,
};
