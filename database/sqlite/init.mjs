import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDatabase, dbPath } from './client.mjs';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(currentDir, 'schema.sql');

function ensureItemColumns(db) {
  const itemColumns = db.prepare(`PRAGMA table_info(items)`).all();
  const existingColumnNames = new Set(itemColumns.map((column) => column.name));

  if (!existingColumnNames.has('img_path')) {
    db.exec('ALTER TABLE items ADD COLUMN img_path TEXT');
  }

  if (!existingColumnNames.has('secondary_stock')) {
    db.exec('ALTER TABLE items ADD COLUMN secondary_stock REAL');
  }

  if (!existingColumnNames.has('conversion_rate')) {
    db.exec('ALTER TABLE items ADD COLUMN conversion_rate REAL');
  }
}

export function initDatabase() {
  const db = openDatabase();
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSql);
  ensureItemColumns(db);
  db.close();
  return dbPath;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const filePath = initDatabase();
  console.log(`SQLite schema initialized at: ${filePath}`);
}
