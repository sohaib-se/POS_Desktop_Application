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

export function updateConversionRate(id, { baseUnit, secondaryUnit, conversionRate }) {
  const db = openDatabase();
  const result = db.prepare(`
    UPDATE conversion_rates 
    SET base_unit = ?, secondary_unit = ?, conversion_rate = ?
    WHERE id = ?
  `).run(baseUnit, secondaryUnit, conversionRate, id);
  db.close();
  return result.changes > 0;
}

export function deleteConversionRate(id) {
  const db = openDatabase();
  const result = db.prepare('DELETE FROM conversion_rates WHERE id = ?').run(id);
  db.close();
  return result.changes > 0;
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
    INSERT INTO parties (id, name, phone, email, address, shipping_address, balance, credit_limit, type, status, updated_at)
    VALUES (@id, @name, @phone, @email, @address, @shipping_address, @balance, @credit_limit, @type, @status, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      phone = excluded.phone,
      email = excluded.email,
      address = excluded.address,
      shipping_address = excluded.shipping_address,
      balance = excluded.balance,
      credit_limit = excluded.credit_limit,
      type = excluded.type,
      status = excluded.status,
      updated_at = datetime('now')
  `).run({
    ...party,
    email: party.email ?? null,
    address: party.address ?? null,
    shipping_address: party.shippingAddress ?? null,
    credit_limit: party.creditLimit ?? null,
    status: party.status ?? 'active'
  });
  db.close();
}

export function saveOpeningBalanceTransaction(partyName, balance, date) {
  const db = openDatabase();
  const id = Date.now().toString();
  if (balance > 0) {
    // Receivable Opening Balance -> payment_out_records (per user request)
    const nextNoRow = db.prepare('SELECT COALESCE(MAX(CAST(payment_no AS INTEGER)), 0) + 1 AS nextNo FROM payment_out_records').get();
    const nextNo = String(Number(nextNoRow?.nextNo ?? 1));
    db.prepare(`
      INSERT INTO payment_out_records (id, payment_no, date, party_name, amount, payment_type, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'Receivable Opening Balance', 'OB', datetime('now'), datetime('now'))
    `).run(id, nextNo, date, partyName, Math.abs(balance));
  } else if (balance < 0) {
    // Payable Opening Balance -> payment_in_records (per user request)
    const nextNoRow = db.prepare('SELECT COALESCE(MAX(CAST(receipt_no AS INTEGER)), 0) + 1 AS nextNo FROM payment_in_records').get();
    const nextNo = String(Number(nextNoRow?.nextNo ?? 1));
    db.prepare(`
      INSERT INTO payment_in_records (id, receipt_no, date, party_name, amount, payment_type, reference, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'Payable Opening Balance', 'OB', datetime('now'), datetime('now'))
    `).run(id, nextNo, date, partyName, Math.abs(balance));
  }
  db.close();
}

export function getPaymentInRecords() {
  const db = openDatabase();
  const rows = db.prepare('SELECT * FROM payment_in_records ORDER BY created_at DESC, date DESC').all();
  db.close();
  return rows;
}

export function addPaymentInRecord(record) {
  const db = openDatabase();
  db.prepare(`
    INSERT INTO payment_in_records (
      id, receipt_no, date, party_name, party_id, amount, payment_type, reference, description, attachment_image_path, attachment_image_name, attachment_document_path, attachment_document_name, created_at, updated_at
    ) VALUES (
      @id, @receiptNo, @date, @partyName, @partyId, @amount, @paymentType, @reference, @description, @attachmentImagePath, @attachmentImageName, @attachmentDocumentPath, @attachmentDocumentName, datetime('now'), datetime('now')
    )
  `).run({
    ...record,
    partyId: record.partyId ?? null,
    receiptNo: record.receiptNo ?? null,
    reference: record.reference ?? null,
    description: record.description ?? null,
    attachmentImagePath: record.attachmentImagePath ?? null,
    attachmentImageName: record.attachmentImageName ?? null,
    attachmentDocumentPath: record.attachmentDocumentPath ?? null,
    attachmentDocumentName: record.attachmentDocumentName ?? null,
  });
  db.close();
}

export function updatePaymentInRecord(record) {
  const db = openDatabase();
  db.prepare(`
    UPDATE payment_in_records SET
      receipt_no = @receiptNo,
      date = @date,
      party_name = @partyName,
      party_id = @partyId,
      amount = @amount,
      payment_type = @paymentType,
      reference = @reference,
      description = @description,
      attachment_image_path = @attachmentImagePath,
      attachment_image_name = @attachmentImageName,
      attachment_document_path = @attachmentDocumentPath,
      attachment_document_name = @attachmentDocumentName,
      updated_at = datetime('now')
    WHERE id = @id
  `).run({
    ...record,
    partyId: record.partyId ?? null,
    receiptNo: record.receiptNo ?? null,
    reference: record.reference ?? null,
    description: record.description ?? null,
    attachmentImagePath: record.attachmentImagePath ?? null,
    attachmentImageName: record.attachmentImageName ?? null,
    attachmentDocumentPath: record.attachmentDocumentPath ?? null,
    attachmentDocumentName: record.attachmentDocumentName ?? null,
  });
  db.close();
}

export function getPaymentInRecordById(id) {
  const db = openDatabase();
  const row = db.prepare('SELECT * FROM payment_in_records WHERE id = ?').get(String(id));
  db.close();
  return row;
}

export function deletePaymentInRecord(id) {
  const db = openDatabase();
  const row = db.prepare('SELECT * FROM payment_in_records WHERE id = ?').get(String(id));
  if (row) {
    try {
      db.prepare(`
        INSERT INTO recycle_bin (id, transaction_date, original_table, original_id, data_payload, txn_type, ref_no, party_name, amount, payment_type)
        VALUES (?, datetime('now'), 'payment_in_records', ?, ?, 'Payment In', ?, ?, ?, ?)
      `).run(
        Date.now().toString() + Math.floor(Math.random()*1000),
        String(id),
        JSON.stringify(row),
        row.payment_no || '',
        row.party_name || '',
        row.amount || 0,
        row.payment_mode || ''
      );
    } catch(e) { console.error('Error inserting to recycle_bin', e); }
  }
  const result = db.prepare('DELETE FROM payment_in_records WHERE id = ?').run(String(id));
  db.close();
  return result.changes > 0;
}

export function getPaymentOutRecordsReal() {
  const db = openDatabase();
  const rows = db.prepare('SELECT * FROM payment_out_records ORDER BY created_at DESC, date DESC').all();
  db.close();
  return rows;
}

export function addPaymentOutRecord(record) {
  const db = openDatabase();
  db.prepare(`
    INSERT INTO payment_out_records (
      id, payment_no, date, party_name, party_id, amount, payment_type, reference, description, attachment_image_path, attachment_image_name, attachment_document_path, attachment_document_name, created_at, updated_at
    ) VALUES (
      @id, @paymentNo, @date, @partyName, @partyId, @amount, @paymentType, @reference, @description, @attachmentImagePath, @attachmentImageName, @attachmentDocumentPath, @attachmentDocumentName, datetime('now'), datetime('now')
    )
  `).run({
    ...record,
    partyId: record.partyId ?? null,
    paymentNo: record.paymentNo ?? null,
    reference: record.reference ?? null,
    description: record.description ?? null,
    attachmentImagePath: record.attachmentImagePath ?? null,
    attachmentImageName: record.attachmentImageName ?? null,
    attachmentDocumentPath: record.attachmentDocumentPath ?? null,
    attachmentDocumentName: record.attachmentDocumentName ?? null,
  });
  db.close();
}

export function getEstimates() {
  const db = openDatabase();
  const rows = db.prepare('SELECT * FROM estimates ORDER BY created_at DESC, date DESC').all();
  db.close();
  return rows.map(r => ({
    ...r,
    referenceNo: r.reference_no,
    partyName: r.party_name,
    discountPercent: r.discount_percent,
    discountAmount: r.discount_amount,
    taxLabel: r.tax_label,
    taxRate: r.tax_rate,
    taxAmount: r.tax_amount,
    roundOff: r.round_off,
    roundOffAmount: r.round_off_amount,
    lineItemsJson: r.line_items_json,
    attachmentImagePath: r.attachment_image_path,
    attachmentImageName: r.attachment_image_name,
    attachmentDocumentPath: r.attachment_document_path,
    attachmentDocumentName: r.attachment_document_name,
    convertedSaleNo: r.converted_sale_no,
  }));
}

export function deleteEstimate(id) {
  const db = openDatabase();
  const row = db.prepare('SELECT * FROM estimates WHERE id = ?').get(String(id));
  if (row) {
    try {
      db.prepare(`
        INSERT INTO recycle_bin (id, transaction_date, original_table, original_id, data_payload, txn_type, ref_no, party_name, amount, payment_type)
        VALUES (?, datetime('now'), 'estimates', ?, ?, 'Estimate', ?, ?, ?, ?)
      `).run(
        Date.now().toString() + Math.floor(Math.random()*1000),
        String(id),
        JSON.stringify(row),
        row.estimate_no || '',
        row.party_name || '',
        row.amount || 0,
        row.payment_mode || ''
      );
    } catch(e) { console.error('Error inserting to recycle_bin', e); }
  }
  const result = db.prepare('DELETE FROM estimates WHERE id = ?').run(String(id));
  db.close();
  return result.changes > 0;
}



export function deleteParty(id) {
  const db = openDatabase();
  const row = db.prepare('SELECT * FROM parties WHERE id = ?').get(String(id));
  if (row) {
    try {
      db.prepare(`
        INSERT INTO recycle_bin (id, transaction_date, original_table, original_id, data_payload, txn_type, ref_no, party_name, amount, payment_type)
        VALUES (?, datetime('now'), 'parties', ?, ?, 'Party', '', ?, ?, '')
      `).run(
        Date.now().toString() + Math.floor(Math.random()*1000),
        String(id),
        JSON.stringify(row),
        row.name || '',
        row.balance || 0
      );
    } catch(e) { console.error('Error inserting to recycle_bin', e); }
  }
  const result = db.prepare('DELETE FROM parties WHERE id = ?').run(String(id));
  db.close();
  return result.changes > 0;
}

export function getItems() {
  const db = openDatabase();
  const rows = db.prepare('SELECT * FROM items ORDER BY name ASC').all();
  db.close();
  return rows;
}

export function deductItemStock(itemId, quantity, isSecondary, conversionRate) {
  const db = openDatabase();

  let primaryQtyToDeduct = Number(quantity);
  let secondaryQtyToDeduct = Number(quantity);

  const validConversion = Number.isFinite(Number(conversionRate)) && Number(conversionRate) > 0;

  if (isSecondary) {
    if (validConversion) {
      primaryQtyToDeduct = Number(quantity) / Number(conversionRate);
    }
  } else {
    if (validConversion) {
      secondaryQtyToDeduct = Number(quantity) * Number(conversionRate);
    }
  }

  const stmt = db.prepare(`
    UPDATE items 
    SET 
      stock_quantity = COALESCE(stock_quantity, 0) - @primaryQty,
      secondary_stock = CASE WHEN secondary_unit IS NOT NULL AND secondary_unit != '' THEN COALESCE(secondary_stock, 0) - @secondaryQty ELSE secondary_stock END,
      stock_value = (COALESCE(stock_quantity, 0) - @primaryQty) * COALESCE(purchase_price, 0)
    WHERE id = @id
  `);

  const result = stmt.run({
    id: String(itemId),
    primaryQty: primaryQtyToDeduct,
    secondaryQty: secondaryQtyToDeduct
  });
  db.close();
  return result.changes > 0;
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

export function getNextEstimateNo() {
  const db = openDatabase();
  const row = db.prepare('SELECT COALESCE(MAX(CAST(reference_no AS INTEGER)), 0) + 1 AS nextEstimateNo FROM estimates').get();
  db.close();
  return String(Number(row?.nextEstimateNo ?? 1));
}

export function addEstimate(estimate) {
  const db = openDatabase();
  db.prepare(`
    INSERT INTO estimates (
      id,
      reference_no,
      date,
      party_name,
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
      status,
      created_at,
      updated_at
    )
    VALUES (
      @id,
      @referenceNo,
      @date,
      @partyName,
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
      @status,
      datetime('now'),
      datetime('now')
    )
  `).run(estimate);
  db.close();
}

export function updateEstimate(id, estimate) {
  const db = openDatabase();
  db.prepare(`
    UPDATE estimates SET
      reference_no = @referenceNo,
      date = @date,
      party_name = @partyName,
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
      attachment_image_path = COALESCE(@attachmentImagePath, attachment_image_path),
      attachment_image_name = COALESCE(@attachmentImageName, attachment_image_name),
      attachment_document_path = COALESCE(@attachmentDocumentPath, attachment_document_path),
      attachment_document_name = COALESCE(@attachmentDocumentName, attachment_document_name),
      status = @status,
      updated_at = datetime('now')
    WHERE id = @id
  `).run({ ...estimate, id });
  db.close();
}

export function markEstimateConverted(id, saleNo) {
  const db = openDatabase();
  db.prepare(`
    UPDATE estimates SET
      status = 'Converted',
      converted_sale_no = @saleNo,
      updated_at = datetime('now')
    WHERE id = @id
  `).run({ id, saleNo });
  db.close();
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
  const row = db.prepare('SELECT * FROM sale_invoices WHERE id = ?').get(String(id));
  if (row) {
    try {
      db.prepare(`
        INSERT INTO recycle_bin (id, transaction_date, original_table, original_id, data_payload, txn_type, ref_no, party_name, amount, payment_type)
        VALUES (?, datetime('now'), 'sale_invoices', ?, ?, ?, ?, ?, ?, ?)
      `).run(
        Date.now().toString() + Math.floor(Math.random()*1000),
        String(id),
        JSON.stringify(row),
        row.transaction_type || 'Sale',
        row.invoice_no || '',
        row.party_name || '',
        row.amount || 0,
        row.payment_mode || ''
      );
    } catch(e) { console.error('Error inserting to recycle_bin', e); }
  }
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
  const row = db.prepare('SELECT * FROM purchase_bills WHERE id = ?').get(String(id));
  if (row) {
    try {
      db.prepare(`
        INSERT INTO recycle_bin (id, transaction_date, original_table, original_id, data_payload, txn_type, ref_no, party_name, amount, payment_type)
        VALUES (?, datetime('now'), 'purchase_bills', ?, ?, ?, ?, ?, ?, ?)
      `).run(
        Date.now().toString() + Math.floor(Math.random()*1000),
        String(id),
        JSON.stringify(row),
        row.transaction_type || 'Purchase',
        row.invoice_no || '',
        row.party_name || '',
        row.amount || 0,
        row.payment_mode || ''
      );
    } catch(e) { console.error('Error inserting to recycle_bin', e); }
  }
  const result = db.prepare('DELETE FROM purchase_bills WHERE id = ?').run(String(id));
  db.close();
  return result.changes > 0;
}

export function getExpenseRecords() {
  const db = openDatabase();
  const rows = db.prepare('SELECT * FROM expense_records ORDER BY created_at DESC').all();
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
  const row = db.prepare('SELECT COALESCE(MAX(CAST(expense_no AS INTEGER)), 0) + 1 AS nextExpenseNo FROM expense_records').get();
  db.close();
  return String(Number(row?.nextExpenseNo ?? 1));
}

export function addExpenseRecord(record) {
  const db = openDatabase();
  db.prepare(`
    INSERT INTO expense_records (
      id,
      expense_no,
      category_id,
      category_name,
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
    VALUES (
      @id,
      @expenseNo,
      @categoryId,
      @categoryName,
      @amount,
      @paymentType,
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
    id: record.id || Date.now().toString(),
    expenseNo: record.expense_no || null,
    categoryId: record.category_id || null,
    categoryName: record.category_name || null,
    amount: Number(record.amount) || 0,
    paymentType: record.payment_type || 'Cash',
    description: record.description || null,
    lineItemsJson: record.line_items_json || null,
    attachmentImagePath: record.attachment_image_path || null,
    attachmentImageName: record.attachment_image_name || null,
    attachmentDocumentPath: record.attachment_document_path || null,
    attachmentDocumentName: record.attachment_document_name || null,
    roundOff: record.round_off ? 1 : 0,
    roundOffAmount: Number(record.round_off_amount) || 0
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
      amount = @amount,
      payment_type = @paymentType,
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
    expenseNo: record.expense_no || null,
    categoryId: record.category_id || null,
    categoryName: record.category_name || null,
    amount: Number(record.amount) || 0,
    paymentType: record.payment_type || 'Cash',
    description: record.description || null,
    lineItemsJson: record.line_items_json || null,
    attachmentImagePath: record.attachment_image_path || null,
    attachmentImageName: record.attachment_image_name || null,
    attachmentDocumentPath: record.attachment_document_path || null,
    attachmentDocumentName: record.attachment_document_name || null,
    roundOff: record.round_off ? 1 : 0,
    roundOffAmount: Number(record.round_off_amount) || 0
  });
  db.close();
}

export function deleteExpenseRecord(id) {
  const db = openDatabase();
  const row = db.prepare('SELECT * FROM expense_records WHERE id = ?').get(String(id));
  if (row) {
    try {
      db.prepare(`
        INSERT INTO recycle_bin (id, transaction_date, original_table, original_id, data_payload, txn_type, ref_no, party_name, amount, payment_type)
        VALUES (?, datetime('now'), 'expense_records', ?, ?, 'Expense', ?, '', ?, ?)
      `).run(
        Date.now().toString() + Math.floor(Math.random()*1000),
        String(id),
        JSON.stringify(row),
        row.payment_no || '',
        row.amount || 0,
        row.payment_mode || ''
      );
    } catch(e) { console.error('Error inserting to recycle_bin', e); }
  }
  const result = db.prepare('DELETE FROM expense_records WHERE id = ?').run(String(id));
  db.close();
  return result.changes > 0;
}

// --- Recycle Bin ---
export function emptyRecycleBin() {
  const db = openDatabase();
  const result = db.prepare('DELETE FROM recycle_bin').run();
  db.close();
  return result.changes > 0;
}

export function getRecycleBinItems() {
  const db = openDatabase();
  const rows = db.prepare('SELECT * FROM recycle_bin ORDER BY deleted_on DESC').all();
  db.close();
  return rows;
}

export function restoreRecycleBinItem(id) {
  const db = openDatabase();
  const item = db.prepare('SELECT * FROM recycle_bin WHERE id = ?').get(String(id));
  if (!item) {
    db.close();
    return false;
  }
  
  const payload = JSON.parse(item.data_payload);
  const table = item.original_table;
  
  const columns = Object.keys(payload);
  const placeholders = columns.map(() => '?').join(', ');
  const values = Object.values(payload);
  
  try {
    db.prepare(`INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`).run(...values);
    db.prepare('DELETE FROM recycle_bin WHERE id = ?').run(String(id));
    db.close();
    return true;
  } catch (error) {
    console.error('Failed to restore from recycle bin:', error);
    db.close();
    return false;
  }
}

export function permanentDeleteRecycleBinItem(id) {
  const db = openDatabase();
  const result = db.prepare('DELETE FROM recycle_bin WHERE id = ?').run(String(id));
  db.close();
  return result.changes > 0;
}

export function getPaymentOutRecords() {
  return getExpenseRecords();
}

export function getNextPaymentOutNo() {
  return getNextExpenseNo();
}

export function updatePaymentOutRecord(id, record) {
  return updateExpenseRecord(id, record);
}

export function getPaymentOutRecordById(id) {
  const db = openDatabase();
  const row = db.prepare('SELECT * FROM payment_out_records WHERE id = ?').get(String(id));
  db.close();
  return row;
}

export function deletePaymentOutRecord(id) {
  const db = openDatabase();
  const row = db.prepare('SELECT * FROM payment_out_records WHERE id = ?').get(String(id));
  if (row) {
    try {
      db.prepare(`
        INSERT INTO recycle_bin (id, transaction_date, original_table, original_id, data_payload, txn_type, ref_no, party_name, amount, payment_type)
        VALUES (?, datetime('now'), 'payment_out_records', ?, ?, 'Payment Out', ?, ?, ?, ?)
      `).run(
        Date.now().toString() + Math.floor(Math.random()*1000),
        String(id),
        JSON.stringify(row),
        row.payment_no || '',
        row.party_name || '',
        row.amount || 0,
        row.payment_mode || ''
      );
    } catch(e) { console.error('Error inserting to recycle_bin', e); }
  }
  const result = db.prepare('DELETE FROM payment_out_records WHERE id = ?').run(String(id));
  db.close();
  return result.changes > 0;
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
  const resolvedMfgDate = typeof item.mfgDate === 'string' ? item.mfgDate : null;
  const resolvedExpDate = typeof item.expDate === 'string' ? item.expDate : null;

  db.prepare(`
    INSERT INTO items (
      id, name, code, category, sale_price, wholesale_price, purchase_price, at_price, stock_quantity, unit, primary_unit, secondary_unit, secondary_stock, conversion_rate, img_path, stock_value, min_stock, low_stock, mfg_date, exp_date, location, status, updated_at
    )
    VALUES (
      @id, @name, @code, @category, @salePrice, @wholesalePrice, @purchasePrice, @atPrice, @stockQuantity, @unit, @primaryUnit, @secondaryUnit, @secondaryStock, @conversionRate, @imgPath, @stockValue, @minStock, @lowStock, @mfgDate, @expDate, @location, @status, datetime('now')
    )
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      code = excluded.code,
      category = excluded.category,
      sale_price = excluded.sale_price,
      wholesale_price = excluded.wholesale_price,
      purchase_price = excluded.purchase_price,
      at_price = excluded.at_price,
      stock_quantity = excluded.stock_quantity,
      unit = excluded.unit,
      primary_unit = excluded.primary_unit,
      secondary_unit = excluded.secondary_unit,
        secondary_stock = excluded.secondary_stock,
        conversion_rate = excluded.conversion_rate,
        img_path = excluded.img_path,
      stock_value = excluded.stock_value,
      min_stock = excluded.min_stock,
      low_stock = excluded.low_stock,
      mfg_date = excluded.mfg_date,
      exp_date = excluded.exp_date,
      location = excluded.location,
      status = excluded.status,
      updated_at = datetime('now')
  `).run({
    ...item,
    atPrice: item.atPrice ?? null,
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
    lowStock: item.lowStock ?? null,
    mfgDate: resolvedMfgDate,
    expDate: resolvedExpDate,
    location: item.location ?? null,
    status: item.status ?? 'active'
  });
  syncCategoryItemCounts(db);
  db.close();
}

export function deleteItem(id) {
  const db = openDatabase();
  const idStr = String(id);

  // Check if item is used in sale invoices
  const sales = db.prepare(`SELECT id FROM sale_invoices WHERE line_items_json LIKE ? LIMIT 1`).get(`%"itemId":"${idStr}"%`);
  if (sales) {
    db.close();
    throw new Error('ITEM_IN_USE');
  }

  // Check if item is used in purchase bills
  const purchases = db.prepare(`SELECT id FROM purchase_bills WHERE line_items_json LIKE ? LIMIT 1`).get(`%"itemId":"${idStr}"%`);
  if (purchases) {
    db.close();
    throw new Error('ITEM_IN_USE');
  }

  // Check if item is used in stock adjustments
  const adjustments = db.prepare(`SELECT id FROM adjust_stock_transactions WHERE item_id = ? LIMIT 1`).get(idStr);
  if (adjustments) {
    db.close();
    throw new Error('ITEM_IN_USE');
  }

  const row = db.prepare('SELECT * FROM items WHERE id = ?').get(idStr);
  if (row) {
    try {
      db.prepare(`
        INSERT INTO recycle_bin (id, transaction_date, original_table, original_id, data_payload, txn_type, ref_no, party_name, amount, payment_type)
        VALUES (?, datetime('now'), 'items', ?, ?, 'Item', ?, ?, ?, '')
      `).run(
        Date.now().toString() + Math.floor(Math.random()*1000),
        idStr,
        JSON.stringify(row),
        row.code || '',
        row.name || '',
        row.sale_price || 0
      );
    } catch(e) { console.error('Error inserting to recycle_bin', e); }
  }
  const result = db
    .prepare('DELETE FROM items WHERE id = ?')
    .run(idStr);
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

export function getCashInHandTransactions() {
  const db = openDatabase();
  const rows = db.prepare('SELECT * FROM cash_in_hand_transactions ORDER BY date DESC, created_at DESC').all();
  db.close();
  return rows;
}

export function getCashTransactionsFromTransactions() {
  const db = openDatabase();
  const rows = db.prepare(`
    SELECT id, date, party_name AS name, type, amount, payment_type AS paymentType, created_at 
    FROM transactions 
    WHERE LOWER(payment_type) = 'cash' AND LOWER(type) NOT IN ('increase cash', 'decrease cash', 'adjustment-add', 'adjustment-reduce')
    ORDER BY date DESC, created_at DESC
  `).all();
  db.close();
  return rows;
}

export function addCashInHandTransaction(entry) {
  const db = openDatabase();
  const txId = entry.id || Date.now().toString();

  db.prepare(`
    INSERT INTO cash_in_hand_transactions (id, date, name, type, amount, created_at, updated_at)
    VALUES (@id, @date, @name, @type, @amount, datetime('now'), datetime('now'))
  `).run({
    id: txId,
    date: entry.date,
    name: entry.name,
    type: entry.type,
    amount: Number(entry.amount)
  });

  db.prepare(`
    INSERT INTO transactions (id, type, invoice_no, reference_no, date, party_name, amount, balance, payment_type, status, quantity, created_at, updated_at)
    VALUES (@id, @type, NULL, NULL, @date, @partyName, @amount, 0, 'cash', 'Completed', NULL, datetime('now'), datetime('now'))
  `).run({
    id: txId,
    type: entry.type,
    date: entry.date,
    partyName: entry.name,
    amount: Number(entry.amount)
  });

  db.close();
}

export function deleteCashInHandTransaction(id) {
  const db = openDatabase();
  const txId = String(id);
  const row = db.prepare('SELECT * FROM cash_in_hand_transactions WHERE id = ?').get(txId);
  if (row) {
    try {
      db.prepare(`
        INSERT INTO recycle_bin (id, transaction_date, original_table, original_id, data_payload, txn_type, ref_no, party_name, amount, payment_type)
        VALUES (?, datetime('now'), 'cash_in_hand_transactions', ?, ?, 'Cash In Hand', ?, '', ?, ?)
      `).run(
        Date.now().toString() + Math.floor(Math.random()*1000),
        txId,
        JSON.stringify(row),
        '',
        row.amount || 0,
        row.transaction_type || row.type || ''
      );
    } catch(e) { console.error('Error inserting to recycle_bin', e); }
  }
  const result = db
    .prepare('DELETE FROM cash_in_hand_transactions WHERE id = ?')
    .run(txId);
  db.prepare('DELETE FROM transactions WHERE id = ?').run(txId);

  if (txId.endsWith('-cash')) {
    const bankId = txId.replace('-cash', '-bank');
    const bankTx = db.prepare('SELECT amount, bank_account_name FROM bank_account_transactions WHERE id = ?').get(bankId);
    if (bankTx) {
      db.prepare(`
        UPDATE bank_accounts SET balance = balance - @amount WHERE name = @paymentType
      `).run({
        amount: bankTx.amount,
        paymentType: bankTx.bank_account_name
      });
      db.prepare('DELETE FROM bank_account_transactions WHERE id = ?').run(bankId);
      db.prepare('DELETE FROM transactions WHERE id = ?').run(bankId);
    }
  }

  db.close();
  return result.changes > 0;
}

export function updateCashInHandTransaction(id, entry) {
  const db = openDatabase();
  const txId = String(id);
  const oldTx = db.prepare('SELECT * FROM cash_in_hand_transactions WHERE id = ?').get(txId);
  if (!oldTx) {
    db.close();
    return false;
  }

  db.prepare(`
    UPDATE cash_in_hand_transactions 
    SET date = @date, name = @name, type = @type, amount = @amount, updated_at = datetime('now')
    WHERE id = @id
  `).run({
    id: txId,
    date: entry.date,
    name: entry.name,
    type: entry.type,
    amount: Number(entry.amount)
  });

  db.prepare(`
    UPDATE transactions 
    SET type = @type, date = @date, party_name = @name, amount = @amount, updated_at = datetime('now')
    WHERE id = @id
  `).run({
    id: txId,
    type: entry.type,
    date: entry.date,
    name: entry.name,
    amount: Number(entry.amount)
  });

  if (txId.endsWith('-cash')) {
    const bankId = txId.replace('-cash', '-bank');
    const bankTx = db.prepare('SELECT amount, bank_account_name FROM bank_account_transactions WHERE id = ?').get(bankId);
    if (bankTx) {
      // Revert old bank balance
      db.prepare(`UPDATE bank_accounts SET balance = balance - @amount WHERE name = @paymentType`).run({
        amount: bankTx.amount,
        paymentType: bankTx.bank_account_name
      });

      // Figure out new bank amount
      // Cash to Bank: Increase Cash (- amount) vs Bank Payment In (+ amount). Wait!
      // In Cash To Bank: Cash is "Decrease Cash" (+ amount). Bank is "Payment In" (+ amount).
      // In Bank To Cash: Cash is "Increase Cash" (+ amount). Bank is "Payment Out" (- amount).
      // If we are editing cash, we just read the raw amount entered. 
      // If type is Decrease Cash, bank gets Payment In (+ amount).
      // If type is Increase Cash, bank gets Payment Out (- amount).
      let bankType = '';
      let bankAmount = 0;
      let bankNameStr = bankTx.bank_account_name; // assuming paymentType doesn't change from cash UI

      if (entry.type === 'Decrease Cash') {
        bankType = 'Payment In';
        bankAmount = Math.abs(Number(entry.amount));
      } else {
        bankType = 'Payment Out';
        bankAmount = -Math.abs(Number(entry.amount));
      }

      // Update bank transaction
      db.prepare(`
        UPDATE bank_account_transactions 
        SET date = @date, name = @name, type = @type, amount = @amount, updated_at = datetime('now')
        WHERE id = @id
      `).run({
        id: bankId,
        date: entry.date,
        name: entry.name,
        type: bankType,
        amount: bankAmount
      });
      db.prepare(`
        UPDATE transactions 
        SET type = @type, date = @date, party_name = @name, amount = @amount, updated_at = datetime('now')
        WHERE id = @id
      `).run({
        id: bankId,
        type: bankType,
        date: entry.date,
        name: entry.name,
        amount: bankAmount
      });

      // Apply new bank balance
      db.prepare(`UPDATE bank_accounts SET balance = balance + @amount WHERE name = @paymentType`).run({
        amount: bankAmount,
        paymentType: bankNameStr
      });
    }
  }

  db.close();
  return true;
}

export function getBankAccounts() {
  const db = openDatabase();
  const rows = db.prepare('SELECT * FROM bank_accounts ORDER BY created_at DESC').all();
  db.close();
  return rows;
}

export function addBankAccount(account) {
  const db = openDatabase();
  const id = account.id || Date.now().toString();
  db.prepare(`
    INSERT INTO bank_accounts (id, name, account_number, bank_name, balance, type, swift_code, iban, account_holder_name, print_details, created_at, updated_at)
    VALUES (@id, @name, @account_number, @bank_name, @balance, @type, @swift_code, @iban, @account_holder_name, @print_details, datetime('now'), datetime('now'))
  `).run({
    id,
    name: account.name,
    account_number: account.account_number || null,
    bank_name: account.bank_name || null,
    balance: Number(account.balance || 0),
    type: account.type || 'bank',
    swift_code: account.swift_code || null,
    iban: account.iban || null,
    account_holder_name: account.account_holder_name || null,
    print_details: account.print_details ? 1 : 0
  });
  db.close();
  return id;
}

export function updateBankAccount(id, account) {
  const db = openDatabase();
  
  const oldBank = db.prepare('SELECT name FROM bank_accounts WHERE id = ?').get(String(id));

  const result = db.prepare(`
    UPDATE bank_accounts
    SET name = @name,
        account_number = @account_number,
        bank_name = @bank_name,
        balance = @balance,
        type = @type,
        swift_code = @swift_code,
        iban = @iban,
        account_holder_name = @account_holder_name,
        print_details = @print_details,
        updated_at = datetime('now')
    WHERE id = @id
  `).run({
    id: String(id),
    name: account.name,
    account_number: account.account_number || null,
    bank_name: account.bank_name || null,
    balance: Number(account.balance || 0),
    type: account.type || 'bank',
    swift_code: account.swift_code || null,
    iban: account.iban || null,
    account_holder_name: account.account_holder_name || null,
    print_details: account.print_details ? 1 : 0
  });

  if (oldBank && oldBank.name !== account.name) {
    db.prepare('UPDATE bank_account_transactions SET bank_account_name = ? WHERE bank_account_name = ?').run(account.name, oldBank.name);
    db.prepare('UPDATE transactions SET payment_type = ? WHERE payment_type = ?').run(account.name, oldBank.name);
  }

  db.close();
  return result.changes > 0;
}

export function deleteBankAccount(id) {
  const db = openDatabase();
  const result = db.prepare('DELETE FROM bank_accounts WHERE id = ?').run(String(id));
  db.close();
  return result.changes > 0;
}

export function deleteBankAccountTransaction(id) {
  const db = openDatabase();
  const tx = db.prepare('SELECT amount, bank_account_name FROM bank_account_transactions WHERE id = ?').get(String(id));
  if (!tx) {
    db.close();
    return false;
  }

  db.prepare(`
    UPDATE bank_accounts SET balance = balance - @amount WHERE name = @paymentType
  `).run({
    amount: tx.amount,
    paymentType: tx.bank_account_name
  });

  const result = db.prepare('DELETE FROM bank_account_transactions WHERE id = ?').run(String(id));
  db.prepare('DELETE FROM transactions WHERE id = ?').run(String(id));

  if (String(id).endsWith('-bank')) {
    const cashId = String(id).replace('-bank', '-cash');
    const cashTx = db.prepare('SELECT * FROM cash_in_hand_transactions WHERE id = ?').get(cashId);
    if (cashTx) {
      db.prepare('DELETE FROM cash_in_hand_transactions WHERE id = ?').run(cashId);
      db.prepare('DELETE FROM transactions WHERE id = ?').run(cashId);
    }
  } else if (String(id).endsWith('-bank-in') || String(id).endsWith('-bank-out')) {
    const isOut = String(id).endsWith('-bank-out');
    const twinId = isOut ? String(id).replace('-bank-out', '-bank-in') : String(id).replace('-bank-in', '-bank-out');
    const twinTx = db.prepare('SELECT amount, bank_account_name FROM bank_account_transactions WHERE id = ?').get(twinId);
    if (twinTx) {
      db.prepare(`UPDATE bank_accounts SET balance = balance - @amount WHERE name = @paymentType`).run({
        amount: twinTx.amount,
        paymentType: twinTx.bank_account_name
      });
      db.prepare('DELETE FROM bank_account_transactions WHERE id = ?').run(twinId);
      db.prepare('DELETE FROM transactions WHERE id = ?').run(twinId);
    }
  }

  db.close();
  return result.changes > 0;
}

export function addBankAccountTransaction(entry) {
  const db = openDatabase();
  const txId = entry.id || Date.now().toString();

  db.prepare(`
    INSERT INTO bank_account_transactions (id, bank_account_name, date, name, type, amount, created_at, updated_at)
    VALUES (@id, @paymentType, @date, @name, @type, @amount, datetime('now'), datetime('now'))
  `).run({
    id: txId,
    paymentType: entry.paymentType,
    date: entry.date,
    name: entry.name,
    type: entry.type,
    amount: Number(entry.amount)
  });

  db.prepare(`
    INSERT INTO transactions (id, type, invoice_no, reference_no, date, party_name, amount, balance, payment_type, status, quantity, created_at, updated_at)
    VALUES (@id, @type, NULL, NULL, @date, @partyName, @amount, 0, @paymentType, 'Completed', NULL, datetime('now'), datetime('now'))
  `).run({
    id: txId,
    type: entry.type,
    date: entry.date,
    partyName: entry.name,
    amount: Number(entry.amount),
    paymentType: entry.paymentType
  });

  db.prepare(`
    UPDATE bank_accounts SET balance = balance + @amount WHERE name = @paymentType
  `).run({
    amount: Number(entry.amount),
    paymentType: entry.paymentType
  });

  db.close();
}

export function updateBankAccountTransaction(id, entry) {
  const db = openDatabase();
  const tx = db.prepare('SELECT amount, bank_account_name FROM bank_account_transactions WHERE id = ?').get(String(id));
  if (!tx) {
    db.close();
    return false;
  }

  db.prepare(`
    UPDATE bank_account_transactions 
    SET bank_account_name = @paymentType, date = @date, name = @name, type = @type, amount = @amount, updated_at = datetime('now')
    WHERE id = @id
  `).run({
    id: String(id),
    paymentType: entry.paymentType,
    date: entry.date,
    name: entry.name,
    type: entry.type,
    amount: Number(entry.amount)
  });

  db.prepare(`
    UPDATE transactions 
    SET type = @type, date = @date, party_name = @name, amount = @amount, payment_type = @paymentType, updated_at = datetime('now')
    WHERE id = @id
  `).run({
    id: String(id),
    type: entry.type,
    date: entry.date,
    name: entry.name,
    amount: Number(entry.amount),
    paymentType: entry.paymentType
  });

  // Revert the old transaction's effect on balance using stored bank name
  db.prepare(`
    UPDATE bank_accounts SET balance = balance - @amount WHERE name = @name
  `).run({
    amount: tx.amount,
    name: tx.bank_account_name
  });
  
  // Apply the new transaction's effect on balance using new bank name
  db.prepare(`
    UPDATE bank_accounts SET balance = balance + @amount WHERE name = @name
  `).run({
    amount: Number(entry.amount),
    name: entry.paymentType
  });

  if (String(id).endsWith('-bank')) {
    const cashId = String(id).replace('-bank', '-cash');
    const cashTx = db.prepare('SELECT amount FROM cash_in_hand_transactions WHERE id = ?').get(cashId);
    if (cashTx) {
      let cashType = '';
      let cashAmount = 0;
      if (entry.type === 'Payment Out') { // Bank to cash
        cashType = 'Increase Cash';
        cashAmount = Math.abs(Number(entry.amount));
      } else { // Cash to bank
        cashType = 'Decrease Cash';
        cashAmount = Math.abs(Number(entry.amount));
      }
      
      db.prepare(`
        UPDATE cash_in_hand_transactions 
        SET date = @date, name = @name, type = @type, amount = @amount, updated_at = datetime('now')
        WHERE id = @id
      `).run({
        id: cashId,
        date: entry.date,
        name: entry.name,
        type: cashType,
        amount: cashAmount
      });

      db.prepare(`
        UPDATE transactions 
        SET type = @type, date = @date, party_name = @name, amount = @amount, updated_at = datetime('now')
        WHERE id = @id
      `).run({
        id: cashId,
        type: cashType,
        date: entry.date,
        name: entry.name,
        amount: cashAmount
      });
    }
  } else if (String(id).endsWith('-bank-in') || String(id).endsWith('-bank-out')) {
    const isOut = String(id).endsWith('-bank-out');
    const twinId = isOut ? String(id).replace('-bank-out', '-bank-in') : String(id).replace('-bank-in', '-bank-out');
    const twinTx = db.prepare('SELECT amount, bank_account_name FROM bank_account_transactions WHERE id = ?').get(twinId);
    if (twinTx) {
      // 1. Revert twin's old balance
      db.prepare(`UPDATE bank_accounts SET balance = balance - @amount WHERE name = @name`).run({
        amount: twinTx.amount,
        name: twinTx.bank_account_name
      });

      // 2. Twin gets the opposite amount
      const newTwinAmount = isOut ? Math.abs(Number(entry.amount)) : -Math.abs(Number(entry.amount));
      const twinType = isOut ? 'Payment In' : 'Payment Out';
      
      // We don't automatically update twin's bank_account_name if user is editing,
      // because we only show from/to in the modal, but the edit payload only sends the single bank name.
      // Wait, in an ideal world we'd update both, but we'll just update amounts, date, and description for twin.
      let twinName = entry.name;
      if (!twinName || twinName.startsWith('Transfer')) {
         // Auto-generate name for twin based on the edited bank
         twinName = isOut ? `Transfer from ${entry.paymentType}` : `Transfer to ${entry.paymentType}`;
      }

      db.prepare(`
        UPDATE bank_account_transactions 
        SET date = @date, name = @name, amount = @amount, updated_at = datetime('now')
        WHERE id = @id
      `).run({
        id: twinId,
        date: entry.date,
        name: twinName,
        amount: newTwinAmount
      });

      db.prepare(`
        UPDATE transactions 
        SET date = @date, party_name = @name, amount = @amount, updated_at = datetime('now')
        WHERE id = @id
      `).run({
        id: twinId,
        date: entry.date,
        name: twinName,
        amount: newTwinAmount
      });

      // 3. Apply twin's new balance
      db.prepare(`UPDATE bank_accounts SET balance = balance + @amount WHERE name = @name`).run({
        amount: newTwinAmount,
        name: twinTx.bank_account_name
      });
    }
  }

  db.close();
  return true;
}

export function getBankAccountTransactions(bankName) {
  const db = openDatabase();
  const rows = db.prepare(`
    SELECT id, date, name, type, amount, bank_account_name AS paymentType, created_at 
    FROM bank_account_transactions 
    WHERE bank_account_name = ?
    ORDER BY date DESC, created_at DESC
  `).all(bankName);
  db.close();
  return rows;
}

export function addStockAdjustment(data) {
  const db = openDatabase();
  const txId = data.id || Date.now().toString();

  db.prepare(`
    INSERT INTO adjust_stock_transactions (
      id, item_id, item_name, adjustment_type, date, quantity, unit, at_price, details, created_at, updated_at
    ) VALUES (
      @id, @itemId, @itemName, @adjustmentType, @date, @quantity, @unit, @atPrice, @details, datetime('now'), datetime('now')
    )
  `).run({
    id: txId,
    itemId: data.itemId,
    itemName: data.itemName,
    adjustmentType: data.adjustmentType,
    date: data.date,
    quantity: Number(data.quantity),
    unit: data.unit || null,
    atPrice: data.atPrice ? Number(data.atPrice) : null,
    details: data.details || null
  });

  db.close();
  return txId;
}

export function getStockAdjustments() {
  const db = openDatabase();
  const rows = db.prepare('SELECT * FROM adjust_stock_transactions ORDER BY created_at DESC, date DESC').all();
  db.close();
  return rows;
}

export function updateStockAdjustment(id, data) {
  const db = openDatabase();
  db.prepare(`
    UPDATE adjust_stock_transactions
    SET
      item_id = @itemId,
      item_name = @itemName,
      adjustment_type = @adjustmentType,
      date = @date,
      quantity = @quantity,
      unit = @unit,
      at_price = @atPrice,
      details = @details,
      updated_at = datetime('now')
    WHERE id = @id
  `).run({
    id,
    itemId: data.itemId,
    itemName: data.itemName,
    adjustmentType: data.adjustmentType,
    date: data.date,
    quantity: Number(data.quantity),
    unit: data.unit || null,
    atPrice: data.atPrice ? Number(data.atPrice) : null,
    details: data.details || null
  });
  db.close();
}

export function deleteStockAdjustment(id) {
  const db = openDatabase();
  const info = db.prepare('DELETE FROM adjust_stock_transactions WHERE id = ?').run(String(id));
  db.close();
  if (info.changes === 0) {
    throw new Error('Transaction not found');
  }
}

export function getExpenseCategories() {
  const db = openDatabase();
  const rows = db.prepare('SELECT * FROM expense_categories ORDER BY name ASC').all();
  db.close();
  return rows;
}

export function upsertExpenseCategory(category) {
  const db = openDatabase();
  const id = category.id || Date.now().toString();
  db.prepare(`
    INSERT INTO expense_categories (id, name, type, amount, updated_at)
    VALUES (@id, @name, @type, @amount, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      type = excluded.type,
      amount = excluded.amount,
      updated_at = datetime('now')
  `).run({
    id,
    name: category.name,
    type: category.type || 'Indirect Expense',
    amount: Number(category.amount) || 0
  });
  db.close();
  return id;
}

export function deleteExpenseCategory(id) {
  const db = openDatabase();
  const result = db.prepare('DELETE FROM expense_categories WHERE id = ?').run(String(id));
  db.close();
  return result.changes > 0;
}

export function getExpenseItems() {
  const db = openDatabase();
  const rows = db.prepare('SELECT * FROM expense_items ORDER BY name ASC').all();
  db.close();
  return rows;
}

export function upsertExpenseItem(item) {
  const db = openDatabase();
  const id = item.id || Date.now().toString();
  db.prepare(`
    INSERT INTO expense_items (id, name, price, updated_at)
    VALUES (@id, @name, @price, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      price = excluded.price,
      updated_at = datetime('now')
  `).run({
    id,
    name: item.name,
    price: Number(item.price) || 0
  });
  db.close();
  return id;
}

export function deleteExpenseItem(id) {
  const db = openDatabase();
  const result = db.prepare('DELETE FROM expense_items WHERE id = ?').run(String(id));
  db.close();
  return result.changes > 0;
}

export function getUserProfile() {
  const db = openDatabase();
  const row = db.prepare('SELECT * FROM user_profile WHERE id = 1').get();
  db.close();
  return row;
}

export function updateUserProfile(profile) {
  const db = openDatabase();
  db.prepare(`
    INSERT INTO user_profile (
      id, business_name, phone, email, address, business_type, category, pincode, logo, signature, terms_conditions, updated_at
    ) VALUES (
      1, @businessName, @phone, @email, @address, @businessType, @category, @pincode, @logo, @signature, @termsConditions, datetime('now')
    ) ON CONFLICT(id) DO UPDATE SET
      business_name = excluded.business_name,
      phone = excluded.phone,
      email = excluded.email,
      address = excluded.address,
      business_type = excluded.business_type,
      category = excluded.category,
      pincode = excluded.pincode,
      logo = COALESCE(excluded.logo, user_profile.logo),
      signature = COALESCE(excluded.signature, user_profile.signature),
      terms_conditions = excluded.terms_conditions,
      updated_at = excluded.updated_at
  `).run({
    businessName: profile.businessName || '',
    phone: profile.phone || '',
    email: profile.email || null,
    address: profile.address || null,
    businessType: profile.businessType || null,
    category: profile.category || null,
    pincode: profile.pincode || null,
    logo: profile.logo || null,
    signature: profile.signature || null,
    termsConditions: profile.termsConditions || null
  });
  db.close();
}

export function clearUserProfileImage(field) {
  const allowed = ['logo', 'signature'];
  if (!allowed.includes(field)) throw new Error(`Invalid field: ${field}`);
  const db = openDatabase();
  // Direct UPDATE — bypasses the COALESCE guard in updateUserProfile
  db.prepare(`UPDATE user_profile SET ${field} = NULL, updated_at = datetime('now') WHERE id = 1`).run();
  db.close();
}

export function getBarcodeGenerators() {
  const db = openDatabase();
  try {
    return db.prepare('SELECT * FROM barcode_generator').all();
  } finally {
    db.close();
  }
}

export function insertBarcodeGenerator(item) {
  const db = openDatabase();
  try {
    const stmt = db.prepare('INSERT INTO barcode_generator (id, item_name, item_code, no_of_labels, header, line1, line2, line3, line4) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    stmt.run(item.id, item.itemName, item.itemCode, item.noOfLabels, item.header, item.line1, item.line2, item.line3, item.line4);
  } finally {
    db.close();
  }
}

export function deleteBarcodeGenerator(id) {
  const db = openDatabase();
  try {
    const stmt = db.prepare('DELETE FROM barcode_generator WHERE id = ?');
    stmt.run(id);
  } finally {
    db.close();
  }
}

export function getPasscode() {
  const db = openDatabase();
  const row = db.prepare('SELECT code, recovery_email, recovery_phone FROM passcode LIMIT 1').get();
  db.close();
  return row || null;
}

export function setPasscode(code = null, email = null, phone = null) {
  const db = openDatabase();
  const existing = db.prepare('SELECT id FROM passcode LIMIT 1').get();
  if (existing) {
    db.prepare("UPDATE passcode SET code = COALESCE(?, code), recovery_email = COALESCE(?, recovery_email), recovery_phone = COALESCE(?, recovery_phone), updated_at = datetime('now') WHERE id = ?").run(code, email, phone, existing.id);
  } else {
    db.prepare('INSERT INTO passcode (id, code, recovery_email, recovery_phone) VALUES (?, ?, ?, ?)').run(Date.now().toString(), code, email, phone);
  }
  db.close();
}

export function deletePasscode() {
  const db = openDatabase();
  db.prepare('DELETE FROM passcode').run();
  db.close();
}
