import { openDatabase, dbPath } from './client.mjs';
import { seedData } from './seed-data.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function seedDatabase() {
  const db = openDatabase();

  const seed = db.transaction(() => {
    db.exec(`
      DELETE FROM chart_data;
      DELETE FROM reports;
      DELETE FROM units;
      DELETE FROM categories;
      DELETE FROM cash_in_hand_transactions;
      DELETE FROM bank_accounts;
      DELETE FROM expense_categories;
      DELETE FROM payment_out_records;
      DELETE FROM purchase_bills;
      DELETE FROM payment_in_records;
      DELETE FROM estimates;
      DELETE FROM sale_invoices;
      DELETE FROM transactions;
      DELETE FROM items;
      DELETE FROM parties;
      DELETE FROM user_settings;
    `);

    const insertParty = db.prepare(`
      INSERT INTO parties (id, name, phone, email, address, balance, type)
      VALUES (@id, @name, @phone, @email, @address, @balance, @type)
    `);
    seedData.parties.forEach((party) => insertParty.run({ ...party, address: party.address ?? null, email: party.email ?? null }));

    const insertItem = db.prepare(`
      INSERT INTO items (id, name, code, category, sale_price, purchase_price, stock_quantity, unit, stock_value, min_stock, location)
      VALUES (@id, @name, @code, @category, @salePrice, @purchasePrice, @stockQuantity, @unit, @stockValue, @minStock, @location)
    `);
    seedData.items.forEach((item) => insertItem.run({
      ...item,
      code: item.code ?? null,
      category: item.category ?? null,
      stockValue: item.stockValue ?? null,
      minStock: item.minStock ?? null,
      location: item.location ?? null
    }));

    const insertTransaction = db.prepare(`
      INSERT INTO transactions (id, type, invoice_no, reference_no, date, party_name, amount, balance, payment_type, status, quantity)
      VALUES (@id, @type, @invoiceNo, @referenceNo, @date, @partyName, @amount, @balance, @paymentType, @status, @quantity)
    `);
    seedData.transactions.forEach((transaction) => insertTransaction.run({
      ...transaction,
      invoiceNo: transaction.invoiceNo ?? null,
      referenceNo: transaction.referenceNo ?? null,
      paymentType: transaction.paymentType ?? null,
      status: transaction.status ?? null,
      quantity: transaction.quantity ?? null
    }));

    const insertSaleInvoice = db.prepare(`
      INSERT INTO sale_invoices (id, invoice_no, date, party_name, transaction_type, payment_type, amount, balance)
      VALUES (@id, @invoiceNo, @date, @partyName, @transaction, @paymentType, @amount, @balance)
    `);
    seedData.saleInvoices.forEach((invoice) => insertSaleInvoice.run(invoice));

    const insertEstimate = db.prepare(`
      INSERT INTO estimates (id, reference_no, date, party_name, amount, balance, status)
      VALUES (@id, @referenceNo, @date, @partyName, @amount, @balance, @status)
    `);
    seedData.estimates.forEach((estimate) => insertEstimate.run(estimate));

    const insertPaymentIn = db.prepare(`
      INSERT INTO payment_in_records (id, receipt_no, date, party_name, amount, payment_type, reference)
      VALUES (@id, @receiptNo, @date, @partyName, @amount, @paymentType, @reference)
    `);
    seedData.paymentInRecords.forEach((record) => insertPaymentIn.run({ ...record, reference: record.reference ?? null }));

    const insertPurchaseBill = db.prepare(`
      INSERT INTO purchase_bills (id, invoice_no, date, party_name, amount, balance, payment_type, status)
      VALUES (@id, @invoiceNo, @date, @partyName, @amount, @balance, @paymentType, @status)
    `);
    seedData.purchaseBills.forEach((bill) => insertPurchaseBill.run(bill));

    const insertPaymentOut = db.prepare(`
      INSERT INTO payment_out_records (id, date, party_name, amount, payment_type)
      VALUES (@id, @date, @partyName, @amount, @paymentType)
    `);
    seedData.paymentOutRecords.forEach((record) => insertPaymentOut.run(record));

    const insertExpenseCategory = db.prepare(`
      INSERT INTO expense_categories (id, name, amount)
      VALUES (@id, @name, @amount)
    `);
    seedData.expenseCategories.forEach((category) => insertExpenseCategory.run(category));

    const insertBankAccount = db.prepare(`
      INSERT INTO bank_accounts (id, name, account_number, bank_name, balance, type)
      VALUES (@id, @name, @accountNumber, @bankName, @balance, @type)
    `);
    seedData.bankAccounts.forEach((account) => insertBankAccount.run({
      ...account,
      accountNumber: account.accountNumber ?? null,
      bankName: account.bankName ?? null
    }));

    const insertCashInHand = db.prepare(`
      INSERT INTO cash_in_hand_transactions (id, date, name, type, amount)
      VALUES (@id, @date, @name, @type, @amount)
    `);
    seedData.cashInHandTransactions.forEach((entry) => insertCashInHand.run(entry));

    const insertCategory = db.prepare(`
      INSERT INTO categories (id, name, item_count)
      VALUES (@id, @name, @itemCount)
    `);
    seedData.categories.forEach((category) => insertCategory.run(category));

    const insertUnit = db.prepare(`
      INSERT INTO units (id, full_name, short_name, base_unit, secondary_unit, conversion_rate)
      VALUES (@id, @fullName, @shortName, @baseUnit, @secondaryUnit, @conversionRate)
    `);
    seedData.units.forEach((unit) => insertUnit.run({
      id: unit.id,
      fullName: unit.fullName,
      shortName: unit.shortName,
      baseUnit: unit.conversion?.baseUnit ?? null,
      secondaryUnit: unit.conversion?.secondaryUnit ?? null,
      conversionRate: unit.conversion?.rate ?? null
    }));

    const insertReport = db.prepare(`
      INSERT INTO reports (id, name, description)
      VALUES (@id, @name, @description)
    `);
    seedData.reports.forEach((report) => insertReport.run(report));

    const insertChartData = db.prepare(`
      INSERT INTO chart_data (date, value)
      VALUES (@date, @value)
    `);
    seedData.chartData.forEach((entry) => insertChartData.run(entry));

    db.prepare(`
      INSERT INTO user_settings (
        id, business_name, phone, email, address, business_type, category, pincode, logo, signature,
        currency, decimal_places, auto_backup, backup_frequency, transaction_history
      )
      VALUES (
        1, @businessName, @phone, @email, @address, @businessType, @category, @pincode, @logo, @signature,
        @currency, @decimalPlaces, @autoBackup, @backupFrequency, @transactionHistory
      )
    `).run({
      ...seedData.userSettings,
      autoBackup: seedData.userSettings.autoBackup ? 1 : 0,
      transactionHistory: seedData.userSettings.transactionHistory ? 1 : 0
    });
  });

  seed();
  db.close();
  return dbPath;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const filePath = seedDatabase();
  console.log(`SQLite seed data applied to: ${filePath}`);
}
