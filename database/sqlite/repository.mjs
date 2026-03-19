// Conversion Rates
export function getConversionRates(baseUnit) {
  const db = openDatabase();
  let rows;
  if (baseUnit) {
    rows = db.prepare('SELECT * FROM conversion_rates WHERE base_unit = ? ORDER BY created_at DESC').all(baseUnit);
  } else {
    rows = db.prepare('SELECT * FROM conversion_rates ORDER BY created_at DESC').all();
  }
  db.close();
  return rows;
}

export function addConversionRate({ baseUnit, secondaryUnit, conversionRate }) {
  const db = openDatabase();
  const result = db.prepare(`
    INSERT INTO conversion_rates (base_unit, secondary_unit, conversion_rate)
    VALUES (?, ?, ?)
  `).run(baseUnit, secondaryUnit, conversionRate);
  db.close();
  return result.lastInsertRowid;
}
import { openDatabase } from './client.mjs';

function syncCategoryItemCounts(db) {
  db.exec(`
    UPDATE categories
    SET
      item_count = (
        SELECT COUNT(*)
        FROM items
        WHERE items.category = categories.name
      ),
      updated_at = datetime('now')
  `);
}

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
  const existingItem = item.id
    ? db
        .prepare('SELECT conversion_rate AS conversionRate, img_path AS imgPath FROM items WHERE id = ?')
        .get(String(item.id))
    : null;

  const resolvedConversionRate = Number.isFinite(Number(item.conversionRate))
    ? Number(item.conversionRate)
    : Number.isFinite(Number(existingItem?.conversionRate))
      ? Number(existingItem.conversionRate)
      : 0;

  const resolvedStockQuantity = Number.isFinite(Number(item.stockQuantity))
    ? Number(item.stockQuantity)
    : 0;

  const resolvedSecondaryStock = resolvedStockQuantity * resolvedConversionRate;

  db.prepare(`
    INSERT INTO items (
      id, name, code, category, sale_price, wholesale_price, purchase_price, stock_quantity, unit, primary_unit, secondary_unit, secondary_stock, conversion_rate, img_path, stock_value, min_stock, location, updated_at
    )
    VALUES (
      @id, @name, @code, @category, @salePrice, @wholesalePrice, @purchasePrice, @stockQuantity, @unit, @primaryUnit, @secondaryUnit, @secondaryStock, @conversionRate, @imgPath, @stockValue, @minStock, @location, datetime('now')
    )
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      code = excluded.code,
      category = excluded.category,
      sale_price = excluded.sale_price,
      wholesale_price = excluded.wholesale_price,
      purchase_price = excluded.purchase_price,
      stock_quantity = excluded.stock_quantity,
      unit = excluded.unit,
      primary_unit = excluded.primary_unit,
      secondary_unit = excluded.secondary_unit,
        secondary_stock = excluded.secondary_stock,
        conversion_rate = excluded.conversion_rate,
        img_path = excluded.img_path,
      stock_value = excluded.stock_value,
      min_stock = excluded.min_stock,
      location = excluded.location,
      updated_at = datetime('now')
  `).run({
    ...item,
    code: item.code ?? null,
    category: item.category ?? null,
    wholesalePrice: Number.isFinite(Number(item.wholesalePrice))
      ? Number(item.wholesalePrice)
      : 0,
    stockQuantity: resolvedStockQuantity,
    primaryUnit: item.primaryUnit ?? null,
    secondaryUnit: item.secondaryUnit ?? null,
    secondaryStock: resolvedSecondaryStock,
    conversionRate: resolvedConversionRate,
    imgPath: item.imgPath ?? existingItem?.imgPath ?? null,
    stockValue: item.stockValue ?? null,
    minStock: item.minStock ?? null,
    location: item.location ?? null
  });
  syncCategoryItemCounts(db);
  db.close();
}

export function deleteItem(id) {
  const db = openDatabase();
  const result = db
    .prepare('DELETE FROM items WHERE id = ?')
    .run(String(id));
  syncCategoryItemCounts(db);
  db.close();
  return result.changes > 0;
}

export function getCategories() {
  const db = openDatabase();
  syncCategoryItemCounts(db);
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
  syncCategoryItemCounts(db);
  db.close();
}

export function deleteCategory(id) {
  const db = openDatabase();
  const result = db
    .prepare('DELETE FROM categories WHERE id = ?')
    .run(String(id));
  syncCategoryItemCounts(db);
  db.close();
  return result.changes > 0;
}

export function getUnits() {
  const db = openDatabase();
  const rows = db
    .prepare('SELECT id, full_name AS fullName, short_name AS shortName FROM units ORDER BY full_name ASC')
    .all();
  db.close();
  return rows;
}

export function upsertUnit(unit) {
  const db = openDatabase();
  db.prepare(`
    INSERT INTO units (id, full_name, short_name, updated_at)
    VALUES (@id, @fullName, @shortName, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      full_name = excluded.full_name,
      short_name = excluded.short_name,
      updated_at = datetime('now')
  `).run({
    id: unit.id,
    fullName: String(unit.fullName).trim(),
    shortName: String(unit.shortName).trim(),
  });
  db.close();
}

export function deleteUnit(id) {
  const db = openDatabase();
  const result = db
    .prepare('DELETE FROM units WHERE id = ?')
    .run(String(id));
  db.close();
  return result.changes > 0;
}
