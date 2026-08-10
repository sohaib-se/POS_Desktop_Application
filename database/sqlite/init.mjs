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

  if (existingColumnNames.has('batch_json')) {
    try {
      db.exec('ALTER TABLE items DROP COLUMN batch_json');
    } catch (error) {
      console.warn('Could not drop batch_json column, ignoring', error);
    }
  }

  if (!existingColumnNames.has('mfg_date')) {
    db.exec('ALTER TABLE items ADD COLUMN mfg_date TEXT');
  }

  if (!existingColumnNames.has('exp_date')) {
    db.exec('ALTER TABLE items ADD COLUMN exp_date TEXT');
  }

  if (!existingColumnNames.has('at_price')) {
    db.exec('ALTER TABLE items ADD COLUMN at_price REAL');
  }

  if (!existingColumnNames.has('location')) {
    db.exec('ALTER TABLE items ADD COLUMN location TEXT');
  }
}

function ensureSaleInvoiceColumns(db) {
  const saleInvoiceColumns = db.prepare(`PRAGMA table_info(sale_invoices)`).all();
  const existingColumnNames = new Set(saleInvoiceColumns.map((column) => column.name));

  const addColumn = (columnName, definition) => {
    if (!existingColumnNames.has(columnName)) {
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
  const purchaseBillColumns = db.prepare(`PRAGMA table_info(purchase_bills)`).all();
  const existingColumnNames = new Set(purchaseBillColumns.map((column) => column.name));

  const addColumn = (columnName, definition) => {
    if (!existingColumnNames.has(columnName)) {
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

function ensureEstimateColumns(db) {
  const estimateColumns = db.prepare(`PRAGMA table_info(estimates)`).all();
  const existingColumnNames = new Set(estimateColumns.map((column) => column.name));

  const addColumn = (columnName, definition) => {
    if (!existingColumnNames.has(columnName)) {
      db.exec(`ALTER TABLE estimates ADD COLUMN ${columnName} ${definition}`);
    }
  };

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
  const paymentOutColumns = db.prepare(`PRAGMA table_info(payment_out_records)`).all();
  const existingColumnNames = new Set(paymentOutColumns.map((column) => column.name));

  const addColumn = (columnName, definition) => {
    if (!existingColumnNames.has(columnName)) {
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
      amount REAL NOT NULL,
      payment_type TEXT NOT NULL,
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

  const expenseRecordColumns = db.prepare(`PRAGMA table_info(expense_records)`).all();
  const existingColumnNames = new Set(expenseRecordColumns.map((column) => column.name));

  const addColumn = (columnName, definition) => {
    if (!existingColumnNames.has(columnName)) {
      db.exec(`ALTER TABLE expense_records ADD COLUMN ${columnName} ${definition}`);
    }
  };

  addColumn('amount', 'REAL NOT NULL DEFAULT 0');
  addColumn('payment_type', 'TEXT NOT NULL DEFAULT "Cash"');
  addColumn('expense_no', 'TEXT');
  addColumn('description', 'TEXT');
  addColumn('line_items_json', 'TEXT');
  addColumn('attachment_image_path', 'TEXT');
  addColumn('attachment_image_name', 'TEXT');
  addColumn('attachment_document_path', 'TEXT');
  addColumn('attachment_document_name', 'TEXT');
  addColumn('round_off', 'INTEGER NOT NULL DEFAULT 0');
  addColumn('round_off_amount', 'REAL NOT NULL DEFAULT 0');
}

function ensureBankAccountColumns(db) {
  const bankAccountColumns = db.prepare(`PRAGMA table_info(bank_accounts)`).all();
  const existingColumnNames = new Set(bankAccountColumns.map((column) => column.name));

  const addColumn = (columnName, definition) => {
    if (!existingColumnNames.has(columnName)) {
      db.exec(`ALTER TABLE bank_accounts ADD COLUMN ${columnName} ${definition}`);
    }
  };

  addColumn('swift_code', 'TEXT');
  addColumn('iban', 'TEXT');
  addColumn('account_holder_name', 'TEXT');
  addColumn('print_details', 'INTEGER NOT NULL DEFAULT 0');
}

function ensureExpenseCategoryColumns(db) {
  const columns = db.prepare(`PRAGMA table_info(expense_categories)`).all();
  const existingColumnNames = new Set(columns.map((column) => column.name));

  if (!existingColumnNames.has('type')) {
    db.exec(`ALTER TABLE expense_categories ADD COLUMN type TEXT NOT NULL DEFAULT 'Indirect Expense'`);
  }
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
      amount,
      payment_type,
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
      amount,
      payment_type,
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

function ensureUserProfileColumns(db) {
  const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='user_profile'").get();
  if (!tableExists) return;

  const columns = db.prepare(`PRAGMA table_info(user_profile)`).all();
  const existingColumnNames = new Set(columns.map((column) => column.name));

  if (existingColumnNames.has('currency')) {
    try {
      db.exec('ALTER TABLE user_profile DROP COLUMN currency');
    } catch (error) {
      console.warn('Could not drop currency column from user_profile, ignoring', error);
    }
  }
}

export function initDatabase() {
  const db = openDatabase();
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSql);
  ensureItemColumns(db);
  ensureSaleInvoiceColumns(db);
  ensurePurchaseBillColumns(db);
  ensureEstimateColumns(db);
  ensurePaymentOutRecordColumns(db);
  ensureExpenseRecordColumns(db);
  ensureExpenseCategoryColumns(db);
  migratePaymentOutRecordsToExpenseRecords(db);
  ensureBankAccountColumns(db);
  ensureUserProfileColumns(db);
  db.close();
  return dbPath;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const filePath = initDatabase();
  console.log(`SQLite schema initialized at: ${filePath}`);
}
