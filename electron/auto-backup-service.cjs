const fs = require('fs');
const path = require('path');
const { app, dialog, shell } = require('electron');
const backupService = require('./backup-service.cjs');

/**
 * Returns the default Auto Backups directory: Documents\LaimsoftPOS_Backups\Auto_Backups
 */
function getDefaultAutoBackupDir() {
  const baseDir = backupService.getDefaultBackupDir();
  const autoBackupDir = path.join(baseDir, 'Auto_Backups');
  if (!fs.existsSync(autoBackupDir)) {
    fs.mkdirSync(autoBackupDir, { recursive: true });
  }
  return autoBackupDir;
}

/**
 * Path to configuration file in userData
 */
function getConfigPath() {
  let userDataDir = null;
  try {
    if (app && app.getPath) userDataDir = app.getPath('userData');
  } catch {}
  if (!userDataDir) {
    userDataDir = path.join(process.env.APPDATA || '.', 'POS_Desktop_Application');
  }
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }
  return path.join(userDataDir, 'auto_backup_config.json');
}

/**
 * Returns current Auto Backup configuration with fallback defaults
 */
function getAutoBackupConfig() {
  const configPath = getConfigPath();
  const defaultDir = getDefaultAutoBackupDir();

  const defaultConfig = {
    enabled: true,
    backupOnClose: true,
    maxBackups: 10,
    destinationFolder: defaultDir,
    lastBackupTime: null,
    lastBackupFileName: null,
    lastBackupSize: 0,
  };

  if (!fs.existsSync(configPath)) {
    try {
      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), 'utf8');
    } catch {}
    return defaultConfig;
  }

  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    const parsed = JSON.parse(raw);
    const merged = { ...defaultConfig, ...parsed };

    // Ensure directory exists
    if (merged.destinationFolder && !fs.existsSync(merged.destinationFolder)) {
      try {
        fs.mkdirSync(merged.destinationFolder, { recursive: true });
      } catch {
        merged.destinationFolder = defaultDir;
      }
    }

    return merged;
  } catch (err) {
    console.warn('Failed to parse auto_backup_config.json, returning defaults:', err.message);
    return defaultConfig;
  }
}

/**
 * Saves updated Auto Backup configuration
 */
function saveAutoBackupConfig(newConfig) {
  const current = getAutoBackupConfig();
  const updated = {
    ...current,
    ...newConfig,
    // Always enforce maxBackups = 10 as specified
    maxBackups: 10,
  };

  if (updated.destinationFolder && !fs.existsSync(updated.destinationFolder)) {
    fs.mkdirSync(updated.destinationFolder, { recursive: true });
  }

  const configPath = getConfigPath();
  fs.writeFileSync(configPath, JSON.stringify(updated, null, 2), 'utf8');
  return updated;
}

/**
 * Prunes older auto-backup files so that at most maxKeep (10) remain.
 * Oldest files are deleted first.
 */
function pruneAutoBackups(dirPath, maxKeep = 10) {
  const targetDir = dirPath || getDefaultAutoBackupDir();
  if (!fs.existsSync(targetDir)) {
    return { prunedCount: 0, remainingCount: 0 };
  }

  const entries = fs.readdirSync(targetDir, { withFileTypes: true });
  const autoBackups = [];

  for (const entry of entries) {
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.lsb')) {
      const fullPath = path.join(targetDir, entry.name);
      try {
        const stats = fs.statSync(fullPath);
        autoBackups.push({
          fileName: entry.name,
          filePath: fullPath,
          size: stats.size,
          mtime: stats.mtime.getTime(),
        });
      } catch {}
    }
  }

  // Sort descending by modified time (newest first)
  autoBackups.sort((a, b) => b.mtime - a.mtime);

  let prunedCount = 0;
  if (autoBackups.length > maxKeep) {
    const toPrune = autoBackups.slice(maxKeep);
    for (const item of toPrune) {
      try {
        fs.unlinkSync(item.filePath);
        prunedCount++;
        console.log(`[AutoBackup] Pruned oldest backup: ${item.fileName}`);
      } catch (err) {
        console.warn(`[AutoBackup] Failed to prune ${item.fileName}:`, err.message);
      }
    }
  }

  return {
    prunedCount,
    remainingCount: Math.min(autoBackups.length, maxKeep),
  };
}

/**
 * Executes an auto backup and automatically prunes oldest backups beyond limit of 10.
 */
async function runAutoBackup({ dbPath, appDataDir, win, isManualTrigger = false }) {
  const config = getAutoBackupConfig();

  // If not manually triggered, check if auto backup is enabled
  if (!isManualTrigger && !config.enabled) {
    return { skipped: true, reason: 'Auto backup is disabled in settings.' };
  }

  const destinationDir = config.destinationFolder || getDefaultAutoBackupDir();
  if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir, { recursive: true });
  }

  console.log(`[AutoBackup] Creating auto backup in: ${destinationDir}`);

  // Create .lsb snapshot
  const backupResult = await backupService.createBackup({
    win,
    dbPath,
    appDataDir,
    targetDir: destinationDir,
    saveAs: false,
    prefix: 'AutoBackup',
    settings: { isAutoBackup: true },
  });

  if (!backupResult.success) {
    return backupResult;
  }

  // Prune older auto backups (keep only 10)
  const pruneResult = pruneAutoBackups(destinationDir, config.maxBackups || 10);

  // Update last backup metadata in config
  saveAutoBackupConfig({
    lastBackupTime: new Date().toISOString(),
    lastBackupFileName: backupResult.fileName,
    lastBackupSize: backupResult.size,
  });

  return {
    ...backupResult,
    prunedCount: pruneResult.prunedCount,
    remainingCount: pruneResult.remainingCount,
  };
}

/**
 * Lists all existing auto backups in the configured directory
 */
async function listAutoBackups(folderPath) {
  const config = getAutoBackupConfig();
  const targetDir = folderPath || config.destinationFolder || getDefaultAutoBackupDir();
  return await backupService.listRecentBackups(targetDir);
}

module.exports = {
  getDefaultAutoBackupDir,
  getAutoBackupConfig,
  saveAutoBackupConfig,
  pruneAutoBackups,
  runAutoBackup,
  listAutoBackups,
};
