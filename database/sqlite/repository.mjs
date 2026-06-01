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

export function getSaleInvoices() {
  const db = openDatabase();
  const rows = db.prepare('SELECT * FROM sale_invoices ORDER BY created_at DESC, invoice_no DESC').all();
  db.close();
  return rows;
}

export function getSaleInvoiceById(id) {
  const db = openDatabase();
  const row = db.prepare('SELECT * FROM sale_invoices WHERE id = ?').get(String(id));
  db.close();
  return row ?? null;
}

export function getNextSaleInvoiceNo() {
  const db = openDatabase();
  const row = db.prepare('SELECT COALESCE(MAX(CAST(invoice_no AS INTEGER)), 0) + 1 AS nextInvoiceNo FROM sale_invoices').get();
  db.close();
  return String(Number(row?.nextInvoiceNo ?? 1));
}

export function addSaleInvoice(invoice) {
  const db = openDatabase();
  db.prepare(`
    INSERT INTO sale_invoices (
      id,
      invoice_no,
      date,
      party_name,
      party_id,
      party_phone,
      transaction_type,
      payment_type,
      payment_mode,
      subtotal,
      discount_percent,
      discount_amount,
      tax_label,
      tax_rate,
      tax_amount,
      round_off,
      round_off_amount,
      amount,
      balance,
      description,
      line_items_json,
      attachment_image_path,
      attachment_image_name,
      attachment_document_path,
      attachment_document_name,
      created_at,
      updated_at
    )
    VALUES (
      @id,
      @invoiceNo,
      @date,
      @partyName,
      @partyId,
      @partyPhone,
      @transactionType,
      @paymentType,
      @paymentMode,
      @subtotal,
      @discountPercent,
      @discountAmount,
      @taxLabel,
      @taxRate,
      @taxAmount,
      @roundOff,
      @roundOffAmount,
      @amount,
      @balance,
      @description,
      @lineItemsJson,
      @attachmentImagePath,
      @attachmentImageName,
      @attachmentDocumentPath,
      @attachmentDocumentName,
      datetime('now'),
      datetime('now')
    )
  `).run({
    ...invoice,
    partyId: invoice.partyId ?? null,
    partyPhone: invoice.partyPhone ?? null,
    paymentMode: invoice.paymentMode ?? null,
    paymentType: invoice.paymentType ?? null,
    taxLabel: invoice.taxLabel ?? null,
    description: invoice.description ?? null,
    lineItemsJson: invoice.lineItemsJson ?? null,
    attachmentImagePath: invoice.attachmentImagePath ?? null,
    attachmentImageName: invoice.attachmentImageName ?? null,
    attachmentDocumentPath: invoice.attachmentDocumentPath ?? null,
    attachmentDocumentName: invoice.attachmentDocumentName ?? null,
  });
  db.close();
}

export function updateSaleInvoice(id, invoice) {
  const db = openDatabase();
  db.prepare(`
    UPDATE sale_invoices
    SET
      invoice_no = @invoiceNo,
      date = @date,
      party_name = @partyName,
      party_id = @partyId,
      party_phone = @partyPhone,
      transaction_type = @transactionType,
      payment_type = @paymentType,
      payment_mode = @paymentMode,
      subtotal = @subtotal,
      discount_percent = @discountPercent,
      discount_amount = @discountAmount,
      tax_label = @taxLabel,
      tax_rate = @taxRate,
      tax_amount = @taxAmount,
      round_off = @roundOff,
      round_off_amount = @roundOffAmount,
      amount = @amount,
      balance = @balance,
      description = @description,
      line_items_json = @lineItemsJson,
      attachment_image_path = @attachmentImagePath,
      attachment_image_name = @attachmentImageName,
      attachment_document_path = @attachmentDocumentPath,
      attachment_document_name = @attachmentDocumentName,
      updated_at = datetime('now')
    WHERE id = @id
  `).run({
    id: String(id),
    ...invoice,
    partyId: invoice.partyId ?? null,
    partyPhone: invoice.partyPhone ?? null,
    paymentMode: invoice.paymentMode ?? null,
    paymentType: invoice.paymentType ?? null,
    taxLabel: invoice.taxLabel ?? null,
    description: invoice.description ?? null,
    lineItemsJson: invoice.lineItemsJson ?? null,
    attachmentImagePath: invoice.attachmentImagePath ?? null,
    attachmentImageName: invoice.attachmentImageName ?? null,
    attachmentDocumentPath: invoice.attachmentDocumentPath ?? null,
    attachmentDocumentName: invoice.attachmentDocumentName ?? null,
  });
  db.close();
}

export function deleteSaleInvoice(id) {
  const db = openDatabase();
  const result = db.prepare('DELETE FROM sale_invoices WHERE id = ?').run(String(id));
  db.close();
  return result.changes > 0;
}

export function getPurchaseBills() {
  const db = openDatabase();
  const rows = db.prepare('SELECT * FROM purchase_bills ORDER BY created_at DESC, invoice_no DESC').all();
  db.close();
  return rows;
}

export function getPurchaseBillById(id) {
  const db = openDatabase();
  const row = db.prepare('SELECT * FROM purchase_bills WHERE id = ?').get(String(id));
  db.close();
  return row ?? null;
}

export function getNextPurchaseBillNo() {
  const db = openDatabase();
  const row = db.prepare('SELECT COALESCE(MAX(CAST(invoice_no AS INTEGER)), 0) + 1 AS nextInvoiceNo FROM purchase_bills').get();
  db.close();
  return String(Number(row?.nextInvoiceNo ?? 1));
}

export function addPurchaseBill(invoice) {
  const db = openDatabase();
  db.prepare(`
    INSERT INTO purchase_bills (
      id,
      invoice_no,
      date,
      party_name,
      party_id,
      party_phone,
      transaction_type,
      payment_type,
      payment_mode,
      subtotal,
      discount_percent,
      discount_amount,
      tax_label,
      tax_rate,
      tax_amount,
      round_off,
      round_off_amount,
      amount,
      balance,
      status,
      description,
      line_items_json,
      attachment_image_path,
      attachment_image_name,
      attachment_document_path,
      attachment_document_name,
      created_at,
      updated_at
    )
    VALUES (
      @id,
      @invoiceNo,
      @date,
      @partyName,
      @partyId,
      @partyPhone,
      @transactionType,
      @paymentType,
      @paymentMode,
      @subtotal,
      @discountPercent,
      @discountAmount,
      @taxLabel,
      @taxRate,
      @taxAmount,
      @roundOff,
      @roundOffAmount,
      @amount,
      @balance,
      @status,
      @description,
      @lineItemsJson,
      @attachmentImagePath,
      @attachmentImageName,
      @attachmentDocumentPath,
      @attachmentDocumentName,
      datetime('now'),
      datetime('now')
    )
  `).run({
    ...invoice,
    partyId: invoice.partyId ?? null,
    partyPhone: invoice.partyPhone ?? null,
    paymentMode: invoice.paymentMode ?? null,
    paymentType: invoice.paymentType ?? null,
    taxLabel: invoice.taxLabel ?? null,
    description: invoice.description ?? null,
    lineItemsJson: invoice.lineItemsJson ?? null,
    attachmentImagePath: invoice.attachmentImagePath ?? null,
    attachmentImageName: invoice.attachmentImageName ?? null,
    attachmentDocumentPath: invoice.attachmentDocumentPath ?? null,
    attachmentDocumentName: invoice.attachmentDocumentName ?? null,
    status: invoice.status ?? 'Unpaid',
  });
  db.close();
}

export function updatePurchaseBill(id, invoice) {
  const db = openDatabase();
  db.prepare(`
    UPDATE purchase_bills
    SET
      invoice_no = @invoiceNo,
      date = @date,
      party_name = @partyName,
      party_id = @partyId,
      party_phone = @partyPhone,
      transaction_type = @transactionType,
      payment_type = @paymentType,
      payment_mode = @paymentMode,
      subtotal = @subtotal,
      discount_percent = @discountPercent,
      discount_amount = @discountAmount,
      tax_label = @taxLabel,
      tax_rate = @taxRate,
      tax_amount = @taxAmount,
      round_off = @roundOff,
      round_off_amount = @roundOffAmount,
      amount = @amount,
      balance = @balance,
      status = @status,
      description = @description,
      line_items_json = @lineItemsJson,
      attachment_image_path = @attachmentImagePath,
      attachment_image_name = @attachmentImageName,
      attachment_document_path = @attachmentDocumentPath,
      attachment_document_name = @attachmentDocumentName,
      updated_at = datetime('now')
    WHERE id = @id
  `).run({
    id: String(id),
    ...invoice,
    partyId: invoice.partyId ?? null,
    partyPhone: invoice.partyPhone ?? null,
    paymentMode: invoice.paymentMode ?? null,
    paymentType: invoice.paymentType ?? null,
    taxLabel: invoice.taxLabel ?? null,
    description: invoice.description ?? null,
    lineItemsJson: invoice.lineItemsJson ?? null,
    attachmentImagePath: invoice.attachmentImagePath ?? null,
    attachmentImageName: invoice.attachmentImageName ?? null,
    attachmentDocumentPath: invoice.attachmentDocumentPath ?? null,
    attachmentDocumentName: invoice.attachmentDocumentName ?? null,
    status: invoice.status ?? 'Unpaid',
  });
  db.close();
}

export function deletePurchaseBill(id) {
  const db = openDatabase();
  const result = db.prepare('DELETE FROM purchase_bills WHERE id = ?').run(String(id));
  db.close();
  return result.changes > 0;
}

export function getExpenseRecords() {
  const db = openDatabase();
  const rows = db.prepare('SELECT * FROM expense_records ORDER BY created_at DESC, date DESC').all();
  db.close();
  return rows;
}

export function getExpenseRecordById(id) {
  const db = openDatabase();
  const row = db.prepare('SELECT * FROM expense_records WHERE id = ?').get(String(id));
  db.close();
  return row ?? null;
}

export function getNextExpenseNo() {
  const db = openDatabase();
  const row = db.prepare('SELECT COALESCE(MAX(CAST(payment_no AS INTEGER)), 0) + 1 AS nextPaymentNo FROM expense_records').get();
  db.close();
  return String(Number(row?.nextPaymentNo ?? 1));
}

export function addExpenseRecord(record) {
  const db = openDatabase();
  db.prepare(`
    INSERT INTO expense_records (
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
    VALUES (
      @id,
      @expenseNo,
      @categoryId,
      @categoryName,
      @paymentNo,
      @date,
      @partyName,
      @expenseCategoryId,
      @expenseCategoryName,
      @amount,
      @paymentType,
      @subtotal,
      @balance,
      @description,
      @lineItemsJson,
      @attachmentImagePath,
      @attachmentImageName,
      @attachmentDocumentPath,
      @attachmentDocumentName,
      @roundOff,
      @roundOffAmount,
      datetime('now'),
      datetime('now')
    )
  `).run({
    ...record,
    expenseNo: record.expenseNo ?? record.paymentNo ?? null,
    categoryId: record.categoryId ?? record.expenseCategoryId ?? null,
    categoryName: record.categoryName ?? record.expenseCategoryName ?? null,
    paymentNo: record.paymentNo ?? null,
    expenseCategoryId: record.expenseCategoryId ?? null,
    expenseCategoryName: record.expenseCategoryName ?? null,
    subtotal: record.subtotal ?? record.amount ?? 0,
    balance: record.balance ?? 0,
    description: record.description ?? null,
    lineItemsJson: record.lineItemsJson ?? null,
    attachmentImagePath: record.attachmentImagePath ?? null,
    attachmentImageName: record.attachmentImageName ?? null,
    attachmentDocumentPath: record.attachmentDocumentPath ?? null,
    attachmentDocumentName: record.attachmentDocumentName ?? null,
    roundOff: record.roundOff ?? 0,
    roundOffAmount: record.roundOffAmount ?? 0,
  });
  db.close();
}

export function updateExpenseRecord(id, record) {
  const db = openDatabase();
  db.prepare(`
    UPDATE expense_records
    SET
      expense_no = @expenseNo,
      category_id = @categoryId,
      category_name = @categoryName,
      payment_no = @paymentNo,
      date = @date,
      party_name = @partyName,
      expense_category_id = @expenseCategoryId,
      expense_category_name = @expenseCategoryName,
      amount = @amount,
      payment_type = @paymentType,
      subtotal = @subtotal,
      balance = @balance,
      description = @description,
      line_items_json = @lineItemsJson,
      attachment_image_path = @attachmentImagePath,
      attachment_image_name = @attachmentImageName,
      attachment_document_path = @attachmentDocumentPath,
      attachment_document_name = @attachmentDocumentName,
      round_off = @roundOff,
      round_off_amount = @roundOffAmount,
      updated_at = datetime('now')
    WHERE id = @id
  `).run({
    id: String(id),
    ...record,
    expenseNo: record.expenseNo ?? record.paymentNo ?? null,
    categoryId: record.categoryId ?? record.expenseCategoryId ?? null,
    categoryName: record.categoryName ?? record.expenseCategoryName ?? null,
    paymentNo: record.paymentNo ?? null,
    expenseCategoryId: record.expenseCategoryId ?? null,
    expenseCategoryName: record.expenseCategoryName ?? null,
    subtotal: record.subtotal ?? record.amount ?? 0,
    balance: record.balance ?? 0,
    description: record.description ?? null,
    lineItemsJson: record.lineItemsJson ?? null,
    attachmentImagePath: record.attachmentImagePath ?? null,
    attachmentImageName: record.attachmentImageName ?? null,
    attachmentDocumentPath: record.attachmentDocumentPath ?? null,
    attachmentDocumentName: record.attachmentDocumentName ?? null,
    roundOff: record.roundOff ?? 0,
    roundOffAmount: record.roundOffAmount ?? 0,
  });
  db.close();
}

export function deleteExpenseRecord(id) {
  const db = openDatabase();
  const result = db.prepare('DELETE FROM expense_records WHERE id = ?').run(String(id));
  db.close();
  return result.changes > 0;
}

export function getPaymentOutRecords() {
  return getExpenseRecords();
}

export function getPaymentOutRecordById(id) {
  return getExpenseRecordById(id);
}

export function getNextPaymentOutNo() {
  return getNextExpenseNo();
}

export function addPaymentOutRecord(record) {
  return addExpenseRecord(record);
}

export function updatePaymentOutRecord(id, record) {
  return updateExpenseRecord(id, record);
}

export function deletePaymentOutRecord(id) {
  return deleteExpenseRecord(id);
}

export function upsertItem(item) {
  const db = openDatabase();
  const existingItem = item.id
    ? db
        .prepare('SELECT conversion_rate AS conversionRate, img_path AS imgPath, batch_json AS batchJson FROM items WHERE id = ?')
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
  const resolvedBatchJson =
    typeof item.batchJson === 'string'
      ? item.batchJson
      : typeof existingItem?.batchJson === 'string'
        ? existingItem.batchJson
        : null;

  db.prepare(`
    INSERT INTO items (
      id, name, code, category, sale_price, wholesale_price, purchase_price, stock_quantity, unit, primary_unit, secondary_unit, secondary_stock, conversion_rate, img_path, stock_value, min_stock, batch_json, location, updated_at
    )
    VALUES (
      @id, @name, @code, @category, @salePrice, @wholesalePrice, @purchasePrice, @stockQuantity, @unit, @primaryUnit, @secondaryUnit, @secondaryStock, @conversionRate, @imgPath, @stockValue, @minStock, @batchJson, @location, datetime('now')
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
      batch_json = excluded.batch_json,
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
    batchJson: resolvedBatchJson,
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
