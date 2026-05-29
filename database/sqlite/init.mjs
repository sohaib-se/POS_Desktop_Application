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

export function initDatabase() {
  const db = openDatabase();
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSql);
  ensureItemColumns(db);
  ensureSaleInvoiceColumns(db);
  ensurePurchaseBillColumns(db);
  db.close();
  return dbPath;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const filePath = initDatabase();
  console.log(`SQLite schema initialized at: ${filePath}`);
}
