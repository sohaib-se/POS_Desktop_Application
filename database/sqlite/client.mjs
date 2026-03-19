import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(currentDir, '../..');
const dataDir = path.join(workspaceRoot, 'data');
const dbPath = path.join(dataDir, 'pos.db');

function ensureItemsTableColumns(db) {
  const rows = db.prepare('PRAGMA table_info(items)').all();
  const existingColumns = new Set(rows.map((row) => row.name));

  if (!existingColumns.has('wholesale_price')) {
    db.exec("ALTER TABLE items ADD COLUMN wholesale_price REAL NOT NULL DEFAULT 0");
  }

  if (!existingColumns.has('primary_unit')) {
    db.exec('ALTER TABLE items ADD COLUMN primary_unit TEXT');
  }

  if (!existingColumns.has('secondary_unit')) {
    db.exec('ALTER TABLE items ADD COLUMN secondary_unit TEXT');
  }

  if (!existingColumns.has('img_path')) {
    db.exec('ALTER TABLE items ADD COLUMN img_path TEXT');
  }

  if (!existingColumns.has('secondary_stock')) {
    db.exec('ALTER TABLE items ADD COLUMN secondary_stock REAL');
  }

  if (!existingColumns.has('conversion_rate')) {
    db.exec('ALTER TABLE items ADD COLUMN conversion_rate REAL');
  }
}

function ensureUnitsAndConversionRatesTables(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS conversion_rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      base_unit TEXT NOT NULL,
      secondary_unit TEXT NOT NULL,
      conversion_rate REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const conversionRateColumns = db.prepare('PRAGMA table_info(conversion_rates)').all();
  const conversionRateColumnNames = new Set(conversionRateColumns.map((row) => row.name));

  const hasRequiredConversionColumns =
    conversionRateColumnNames.has('base_unit') &&
    conversionRateColumnNames.has('secondary_unit') &&
    conversionRateColumnNames.has('conversion_rate') &&
    conversionRateColumnNames.has('created_at') &&
    conversionRateColumnNames.has('id');

  if (!hasRequiredConversionColumns) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS conversion_rates_rebuild (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        base_unit TEXT NOT NULL,
        secondary_unit TEXT NOT NULL,
        conversion_rate REAL NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    const canMigrateLegacyRows =
      conversionRateColumnNames.has('base_unit') &&
      conversionRateColumnNames.has('secondary_unit') &&
      conversionRateColumnNames.has('conversion_rate');

    if (canMigrateLegacyRows) {
      const hasCreatedAt = conversionRateColumnNames.has('created_at');
      db.exec(
        hasCreatedAt
          ? `
              INSERT INTO conversion_rates_rebuild (base_unit, secondary_unit, conversion_rate, created_at)
              SELECT base_unit, secondary_unit, conversion_rate, created_at
              FROM conversion_rates
            `
          : `
              INSERT INTO conversion_rates_rebuild (base_unit, secondary_unit, conversion_rate, created_at)
              SELECT base_unit, secondary_unit, conversion_rate, datetime('now')
              FROM conversion_rates
            `,
      );
    }

    db.exec('DROP TABLE conversion_rates');
    db.exec('ALTER TABLE conversion_rates_rebuild RENAME TO conversion_rates');
  }

  const rows = db.prepare('PRAGMA table_info(units)').all();
  const existingColumns = new Set(rows.map((row) => row.name));

  const hasLegacyUnitColumns =
    existingColumns.has('base_unit') ||
    existingColumns.has('secondary_unit') ||
    existingColumns.has('conversion_rate');

  if (!hasLegacyUnitColumns) {
    return;
  }

  const conversionRows = db
    .prepare(`
      SELECT
        base_unit AS baseUnit,
        secondary_unit AS secondaryUnit,
        conversion_rate AS conversionRate
      FROM units
      WHERE base_unit IS NOT NULL
        AND secondary_unit IS NOT NULL
        AND conversion_rate IS NOT NULL
    `)
    .all();

  db.exec(`
    CREATE TABLE IF NOT EXISTS units_normalized (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      short_name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    INSERT INTO units_normalized (id, full_name, short_name, created_at, updated_at)
    SELECT id, full_name, short_name, created_at, updated_at
    FROM units
  `);

  db.exec('DROP TABLE units');
  db.exec('ALTER TABLE units_normalized RENAME TO units');

  const insertConversion = db.prepare(`
    INSERT INTO conversion_rates (base_unit, secondary_unit, conversion_rate)
    VALUES (@baseUnit, @secondaryUnit, @conversionRate)
  `);

  conversionRows.forEach((row) => {
    insertConversion.run({
      baseUnit: String(row.baseUnit),
      secondaryUnit: String(row.secondaryUnit),
      conversionRate: Number(row.conversionRate),
    });
  });
}

export function ensureDataDirectory() {
  fs.mkdirSync(dataDir, { recursive: true });
}

export function openDatabase() {
  ensureDataDirectory();
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  ensureItemsTableColumns(db);
  ensureUnitsAndConversionRatesTables(db);
  return db;
}

export { dbPath };
