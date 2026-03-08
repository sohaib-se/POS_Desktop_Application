import { openDatabase } from './client.mjs';

export function getParties() {
  const db = openDatabase();
  const rows = db.prepare('SELECT * FROM parties ORDER BY name ASC').all();
  db.close();
  return rows;
}

export function getNextPartyId() {
  const db = openDatabase();
  const row = db.prepare('SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM parties').get();
  db.close();
  return Number(row?.nextId ?? 1);
}

export function upsertParty(party) {
  const db = openDatabase();
  db.prepare(`
    INSERT INTO parties (id, name, phone, email, address, balance, type, updated_at)
    VALUES (@id, @name, @phone, @email, @address, @balance, @type, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      phone = excluded.phone,
      email = excluded.email,
      address = excluded.address,
      balance = excluded.balance,
      type = excluded.type,
      updated_at = datetime('now')
  `).run({
    ...party,
    email: party.email ?? null,
    address: party.address ?? null
  });
  db.close();
}

export function deleteParty(id) {
  const db = openDatabase();
  const result = db
    .prepare('DELETE FROM parties WHERE id = ?')
    .run(String(id));
  db.close();
  return result.changes > 0;
}

export function getItems() {
  const db = openDatabase();
  const rows = db.prepare('SELECT * FROM items ORDER BY name ASC').all();
  db.close();
  return rows;
}

export function upsertItem(item) {
  const db = openDatabase();
  db.prepare(`
    INSERT INTO items (
      id, name, code, category, sale_price, purchase_price, stock_quantity, unit, stock_value, min_stock, location, updated_at
    )
    VALUES (
      @id, @name, @code, @category, @salePrice, @purchasePrice, @stockQuantity, @unit, @stockValue, @minStock, @location, datetime('now')
    )
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      code = excluded.code,
      category = excluded.category,
      sale_price = excluded.sale_price,
      purchase_price = excluded.purchase_price,
      stock_quantity = excluded.stock_quantity,
      unit = excluded.unit,
      stock_value = excluded.stock_value,
      min_stock = excluded.min_stock,
      location = excluded.location,
      updated_at = datetime('now')
  `).run({
    ...item,
    code: item.code ?? null,
    category: item.category ?? null,
    stockValue: item.stockValue ?? null,
    minStock: item.minStock ?? null,
    location: item.location ?? null
  });
  db.close();
}

export function getCategories() {
  const db = openDatabase();
  const rows = db
    .prepare('SELECT id, name, item_count AS itemCount FROM categories ORDER BY name ASC')
    .all();
  db.close();
  return rows;
}

export function upsertCategory(category) {
  const db = openDatabase();
  db.prepare(`
    INSERT INTO categories (id, name, item_count, updated_at)
    VALUES (@id, @name, @itemCount, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      item_count = excluded.item_count,
      updated_at = datetime('now')
  `).run({
    ...category,
    itemCount: Number.isFinite(Number(category.itemCount)) ? Number(category.itemCount) : 0,
  });
  db.close();
}

export function deleteCategory(id) {
  const db = openDatabase();
  const result = db
    .prepare('DELETE FROM categories WHERE id = ?')
    .run(String(id));
  db.close();
  return result.changes > 0;
}
