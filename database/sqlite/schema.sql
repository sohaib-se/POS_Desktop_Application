PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS parties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  balance REAL NOT NULL DEFAULT 0,
  type TEXT NOT NULL CHECK (type IN ('customer', 'supplier', 'both')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT,
  category TEXT,
  sale_price REAL NOT NULL DEFAULT 0,
  wholesale_price REAL NOT NULL DEFAULT 0,
  purchase_price REAL NOT NULL DEFAULT 0,
  stock_quantity REAL NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  primary_unit TEXT,
  secondary_unit TEXT,
  secondary_stock REAL,
  conversion_rate REAL,
  img_path TEXT,
  stock_value REAL,
  min_stock REAL,
  location TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  invoice_no TEXT,
  reference_no TEXT,
  date TEXT NOT NULL,
  party_name TEXT NOT NULL,
  amount REAL NOT NULL,
  balance REAL NOT NULL,
  payment_type TEXT,
  status TEXT,
  quantity TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sale_invoices (
  id TEXT PRIMARY KEY,
  invoice_no TEXT NOT NULL,
  date TEXT NOT NULL,
  party_name TEXT NOT NULL,
  party_id TEXT,
  party_phone TEXT,
  transaction_type TEXT NOT NULL,
  payment_type TEXT,
  payment_mode TEXT,
  subtotal REAL NOT NULL DEFAULT 0,
  discount_percent REAL NOT NULL DEFAULT 0,
  discount_amount REAL NOT NULL DEFAULT 0,
  tax_label TEXT,
  tax_rate REAL NOT NULL DEFAULT 0,
  tax_amount REAL NOT NULL DEFAULT 0,
  round_off INTEGER NOT NULL DEFAULT 0,
  round_off_amount REAL NOT NULL DEFAULT 0,
  amount REAL NOT NULL,
  balance REAL NOT NULL,
  description TEXT,
  line_items_json TEXT,
  attachment_image_path TEXT,
  attachment_image_name TEXT,
  attachment_document_path TEXT,
  attachment_document_name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS estimates (
  id TEXT PRIMARY KEY,
  reference_no TEXT NOT NULL,
  date TEXT NOT NULL,
  party_name TEXT NOT NULL,
  amount REAL NOT NULL,
  balance REAL NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS payment_in_records (
  id TEXT PRIMARY KEY,
  receipt_no TEXT NOT NULL,
  date TEXT NOT NULL,
  party_name TEXT NOT NULL,
  amount REAL NOT NULL,
  payment_type TEXT NOT NULL,
  reference TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS purchase_bills (
  id TEXT PRIMARY KEY,
  invoice_no TEXT NOT NULL,
  date TEXT NOT NULL,
  party_name TEXT NOT NULL,
  party_id TEXT,
  party_phone TEXT,
  transaction_type TEXT,
  amount REAL NOT NULL,
  balance REAL NOT NULL,
  payment_type TEXT NOT NULL,
  payment_mode TEXT,
  subtotal REAL NOT NULL DEFAULT 0,
  discount_percent REAL NOT NULL DEFAULT 0,
  discount_amount REAL NOT NULL DEFAULT 0,
  tax_label TEXT,
  tax_rate REAL NOT NULL DEFAULT 0,
  tax_amount REAL NOT NULL DEFAULT 0,
  round_off INTEGER NOT NULL DEFAULT 0,
  round_off_amount REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  description TEXT,
  line_items_json TEXT,
  attachment_image_path TEXT,
  attachment_image_name TEXT,
  attachment_document_path TEXT,
  attachment_document_name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS payment_out_records (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  party_name TEXT NOT NULL,
  amount REAL NOT NULL,
  payment_type TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS expense_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  amount REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bank_accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  account_number TEXT,
  bank_name TEXT,
  balance REAL NOT NULL DEFAULT 0,
  type TEXT NOT NULL CHECK (type IN ('bank', 'cash', 'loan')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cash_in_hand_transactions (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  item_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS units (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS conversion_rates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  base_unit TEXT NOT NULL,
  secondary_unit TEXT NOT NULL,
  conversion_rate REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS chart_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  value REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  business_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  business_type TEXT,
  category TEXT,
  pincode TEXT,
  logo TEXT,
  signature TEXT,
  currency TEXT NOT NULL,
  decimal_places INTEGER NOT NULL,
  auto_backup INTEGER NOT NULL,
  backup_frequency INTEGER NOT NULL,
  transaction_history INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_party_name ON transactions(party_name);
CREATE INDEX IF NOT EXISTS idx_sale_invoices_date ON sale_invoices(date);
CREATE INDEX IF NOT EXISTS idx_purchase_bills_date ON purchase_bills(date);
CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);
CREATE INDEX IF NOT EXISTS idx_parties_name ON parties(name);
