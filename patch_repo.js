const fs = require('fs');
const path = require('path');

const repoPath = path.join(__dirname, 'database', 'sqlite', 'repository.mjs');
let code = fs.readFileSync(repoPath, 'utf8');

// 1. Add Recycle Bin Methods at the end of the file
const recycleBinMethods = `
// --- Recycle Bin ---
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
  
  // Re-insert into original table
  const columns = Object.keys(payload);
  const placeholders = columns.map(() => '?').join(', ');
  const values = Object.values(payload);
  
  try {
    db.prepare(\`INSERT OR REPLACE INTO \${table} (\${columns.join(', ')}) VALUES (\${placeholders})\`).run(...values);
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
`;

if (!code.includes('export function getRecycleBinItems')) {
  code += recycleBinMethods;
}

// 2. Modify existing delete functions
const modifications = [
  {
    name: 'deleteItem',
    table: 'items',
    query: "SELECT * FROM items WHERE id = ?",
    extract: `
      'Item',
      row.code || '',
      row.name || '',
      row.sale_price || 0,
      ''
    `
  },
  {
    name: 'deleteParty',
    table: 'parties',
    query: "SELECT * FROM parties WHERE id = ?",
    extract: `
      'Party',
      '',
      row.name || '',
      row.balance || 0,
      ''
    `
  },
  {
    name: 'deleteSaleInvoice',
    table: 'sale_invoices',
    query: "SELECT * FROM sale_invoices WHERE id = ?",
    extract: `
      row.transaction_type || 'Sale',
      row.invoice_no || '',
      row.party_name || '',
      row.amount || 0,
      row.payment_mode || ''
    `
  },
  {
    name: 'deletePurchaseBill',
    table: 'purchase_bills',
    query: "SELECT * FROM purchase_bills WHERE id = ?",
    extract: `
      row.transaction_type || 'Purchase',
      row.invoice_no || '',
      row.party_name || '',
      row.amount || 0,
      row.payment_mode || ''
    `
  }
];

modifications.forEach(mod => {
  const searchRegex = new RegExp(\`export function \${mod.name}\\(id\\) \\{\\s*const db = openDatabase\\(\\);\\s*const result = db\\.prepare\\('DELETE FROM \${mod.table} WHERE id = \\?'\\)\\.run\\(String\\(id\\)\\);\\s*db\\.close\\(\\);\\s*return result\\.changes > 0;\\s*\\}\`);
  
  const replacement = \`export function \${mod.name}(id) {
  const db = openDatabase();
  const row = db.prepare('${mod.query}').get(String(id));
  if (row) {
    try {
      db.prepare(\\\`
        INSERT INTO recycle_bin (id, transaction_date, original_table, original_id, data_payload, txn_type, ref_no, party_name, amount, payment_type)
        VALUES (?, datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?)
      \\\`).run(
        Date.now().toString() + Math.floor(Math.random()*1000),
        '${mod.table}',
        String(id),
        JSON.stringify(row),
        \${mod.extract}
      );
    } catch(e) { console.error('Error inserting to recycle_bin', e); }
  }
  const result = db.prepare('DELETE FROM ${mod.table} WHERE id = ?').run(String(id));
  db.close();
  return result.changes > 0;
}\`;

  code = code.replace(searchRegex, replacement);
});

fs.writeFileSync(repoPath, code);
console.log('Successfully patched repository.mjs');
