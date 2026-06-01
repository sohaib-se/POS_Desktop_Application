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

  if (!existingColumns.has('batch_json')) {
    db.exec('ALTER TABLE items ADD COLUMN batch_json TEXT');
  }
}

function ensureSaleInvoiceColumns(db) {
  const rows = db.prepare('PRAGMA table_info(sale_invoices)').all();
  const existingColumns = new Set(rows.map((row) => row.name));

  const addColumn = (columnName, definition) => {
    if (!existingColumns.has(columnName)) {
      db.exec(`ALTER TABLE sale_invoices ADD COLUMN ${columnName} ${definition}`);
    }
  };

  addColumn('party_id', 'TEXT');
  addColumn('party_phone', 'TEXT');
  addColumn('payment_mode', 'TEXT');
  addColumn('subtotal', 'REAL NOT NULL DEFAULT 0');
  addColumn('discount_percent', 'REAL NOT NULL DEFAULT 0');
  addColumn('discount_amount', 'REAL NOT NULL DEFAULT 0');
  addColumn('tax_label', 'TEXT');
  addColumn('tax_rate', 'REAL NOT NULL DEFAULT 0');
  addColumn('tax_amount', 'REAL NOT NULL DEFAULT 0');
  addColumn('round_off', 'INTEGER NOT NULL DEFAULT 0');
  addColumn('round_off_amount', 'REAL NOT NULL DEFAULT 0');
  addColumn('description', 'TEXT');
  addColumn('line_items_json', 'TEXT');
  addColumn('attachment_image_path', 'TEXT');
  addColumn('attachment_image_name', 'TEXT');
  addColumn('attachment_document_path', 'TEXT');
  addColumn('attachment_document_name', 'TEXT');
}

function ensurePurchaseBillColumns(db) {
  const rows = db.prepare('PRAGMA table_info(purchase_bills)').all();
  const existingColumns = new Set(rows.map((row) => row.name));

  const addColumn = (columnName, definition) => {
    if (!existingColumns.has(columnName)) {
      db.exec(`ALTER TABLE purchase_bills ADD COLUMN ${columnName} ${definition}`);
    }
  };

  addColumn('party_id', 'TEXT');
  addColumn('party_phone', 'TEXT');
  addColumn('transaction_type', 'TEXT');
  addColumn('payment_mode', 'TEXT');
  addColumn('subtotal', 'REAL NOT NULL DEFAULT 0');
  addColumn('discount_percent', 'REAL NOT NULL DEFAULT 0');
  addColumn('discount_amount', 'REAL NOT NULL DEFAULT 0');
  addColumn('tax_label', 'TEXT');
  addColumn('tax_rate', 'REAL NOT NULL DEFAULT 0');
  addColumn('tax_amount', 'REAL NOT NULL DEFAULT 0');
  addColumn('round_off', 'INTEGER NOT NULL DEFAULT 0');
  addColumn('round_off_amount', 'REAL NOT NULL DEFAULT 0');
  addColumn('description', 'TEXT');
  addColumn('line_items_json', 'TEXT');
  addColumn('attachment_image_path', 'TEXT');
  addColumn('attachment_image_name', 'TEXT');
  addColumn('attachment_document_path', 'TEXT');
  addColumn('attachment_document_name', 'TEXT');
}

function ensurePaymentOutRecordColumns(db) {
  const rows = db.prepare('PRAGMA table_info(payment_out_records)').all();
  const existingColumns = new Set(rows.map((row) => row.name));

  const addColumn = (columnName, definition) => {
    if (!existingColumns.has(columnName)) {
      db.exec(`ALTER TABLE payment_out_records ADD COLUMN ${columnName} ${definition}`);
    }
  };

  addColumn('payment_no', 'TEXT');
  addColumn('expense_category_id', 'TEXT');
  addColumn('expense_category_name', 'TEXT');
  addColumn('description', 'TEXT');
  addColumn('line_items_json', 'TEXT');
  addColumn('attachment_image_path', 'TEXT');
  addColumn('attachment_image_name', 'TEXT');
  addColumn('attachment_document_path', 'TEXT');
  addColumn('attachment_document_name', 'TEXT');
  addColumn('round_off', 'INTEGER NOT NULL DEFAULT 0');
  addColumn('round_off_amount', 'REAL NOT NULL DEFAULT 0');
}

function ensureExpenseRecordColumns(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS expense_records (
      id TEXT PRIMARY KEY,
      expense_no TEXT,
      category_id TEXT,
      category_name TEXT,
      payment_no TEXT,
      date TEXT NOT NULL,
      party_name TEXT NOT NULL,
      expense_category_id TEXT,
      expense_category_name TEXT,
      amount REAL NOT NULL,
      payment_type TEXT NOT NULL,
      subtotal REAL NOT NULL DEFAULT 0,
      balance REAL NOT NULL DEFAULT 0,
      description TEXT,
      line_items_json TEXT,
      attachment_image_path TEXT,
      attachment_image_name TEXT,
      attachment_document_path TEXT,
      attachment_document_name TEXT,
      round_off INTEGER NOT NULL DEFAULT 0,
      round_off_amount REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const rows = db.prepare('PRAGMA table_info(expense_records)').all();
  const existingColumns = new Set(rows.map((row) => row.name));

  const addColumn = (columnName, definition) => {
    if (!existingColumns.has(columnName)) {
      db.exec(`ALTER TABLE expense_records ADD COLUMN ${columnName} ${definition}`);
    }
  };

  addColumn('date', 'TEXT NOT NULL DEFAULT (datetime(\'now\'))');
  addColumn('party_name', 'TEXT NOT NULL DEFAULT \"Expense\"');
  addColumn('amount', 'REAL NOT NULL DEFAULT 0');
  addColumn('payment_type', 'TEXT NOT NULL DEFAULT \"Cash\"');
  addColumn('expense_no', 'TEXT');
  addColumn('category_id', 'TEXT');
  addColumn('category_name', 'TEXT');
  addColumn('subtotal', 'REAL NOT NULL DEFAULT 0');
  addColumn('balance', 'REAL NOT NULL DEFAULT 0');
  addColumn('payment_no', 'TEXT');
  addColumn('expense_category_id', 'TEXT');
  addColumn('expense_category_name', 'TEXT');
  addColumn('description', 'TEXT');
  addColumn('line_items_json', 'TEXT');
  addColumn('attachment_image_path', 'TEXT');
  addColumn('attachment_image_name', 'TEXT');
  addColumn('attachment_document_path', 'TEXT');
  addColumn('attachment_document_name', 'TEXT');
  addColumn('round_off', 'INTEGER NOT NULL DEFAULT 0');
  addColumn('round_off_amount', 'REAL NOT NULL DEFAULT 0');
}

function migratePaymentOutRecordsToExpenseRecords(db) {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all();
  const tableNames = new Set(tables.map((row) => row.name));

  if (!tableNames.has('payment_out_records') || !tableNames.has('expense_records')) {
    return;
  }

  db.exec(`
    INSERT OR IGNORE INTO expense_records (
      id,
      expense_no,
      category_id,
      category_name,
      payment_no,
      date,
      party_name,
      expense_category_id,
      expense_category_name,
      amount,
      payment_type,
      subtotal,
      balance,
      description,
      line_items_json,
      attachment_image_path,
      attachment_image_name,
      attachment_document_path,
      attachment_document_name,
      round_off,
      round_off_amount,
      created_at,
      updated_at
    )
    SELECT
      id,
      payment_no,
      expense_category_id,
      expense_category_name,
      payment_no,
      date,
      party_name,
      expense_category_id,
      expense_category_name,
      amount,
      payment_type,
      amount,
      0,
      description,
      line_items_json,
      attachment_image_path,
      attachment_image_name,
      attachment_document_path,
      attachment_document_name,
      round_off,
      round_off_amount,
      created_at,
      updated_at
    FROM payment_out_records
  `);
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
  ensureSaleInvoiceColumns(db);
  ensurePurchaseBillColumns(db);
  ensurePaymentOutRecordColumns(db);
  ensureExpenseRecordColumns(db);
  migratePaymentOutRecordsToExpenseRecords(db);
  ensureUnitsAndConversionRatesTables(db);
  return db;
}

export { dbPath };
