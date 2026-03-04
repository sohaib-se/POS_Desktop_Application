import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(currentDir, '../..');
const dataDir = path.join(workspaceRoot, 'data');
const dbPath = path.join(dataDir, 'pos.db');

export function ensureDataDirectory() {
  fs.mkdirSync(dataDir, { recursive: true });
}

export function openDatabase() {
  ensureDataDirectory();
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

export { dbPath };
