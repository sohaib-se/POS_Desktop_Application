const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');

// Update payment_in_records
code = code.replace(
  /if \(req\.method === 'GET'\) \{\s+const records = repository\.getPaymentInRecords\(\);\s+res\.statusCode = 200;\s+res\.setHeader\('Content-Type', 'application\/json'\);\s+res\.end\(JSON\.stringify\(records\)\);\s+return;\s+\}/,
  \const requestUrl = new URL(req.url ?? '/', 'http://localhost');
          if (req.method === 'GET') {
            const records = repository.getPaymentInRecords();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(records));
            return;
          }
          if (req.method === 'DELETE') {
            const pathId = requestUrl.pathname.split('/').filter(Boolean)[0];
            const queryId = requestUrl.searchParams.get('id');
            const id = (pathId || queryId || '').trim();
            if (id) {
              repository.deletePaymentInRecord(id);
              res.statusCode = 204;
              res.end();
            } else {
              res.statusCode = 400;
              res.end(JSON.stringify({ message: 'ID required' }));
            }
            return;
          }\
);

// Update payment_out_records
code = code.replace(
  /if \(req\.method === 'GET'\) \{\s+const records = repository\.getPaymentOutRecordsReal\(\);\s+res\.statusCode = 200;\s+res\.setHeader\('Content-Type', 'application\/json'\);\s+res\.end\(JSON\.stringify\(records\)\);\s+return;\s+\}/,
  \const requestUrl = new URL(req.url ?? '/', 'http://localhost');
          if (req.method === 'GET') {
            const records = repository.getPaymentOutRecordsReal();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(records));
            return;
          }
          if (req.method === 'DELETE') {
            const pathId = requestUrl.pathname.split('/').filter(Boolean)[0];
            const queryId = requestUrl.searchParams.get('id');
            const id = (pathId || queryId || '').trim();
            if (id) {
              repository.deletePaymentOutRecord(id);
              res.statusCode = 204;
              res.end();
            } else {
              res.statusCode = 400;
              res.end(JSON.stringify({ message: 'ID required' }));
            }
            return;
          }\
);

// Add estimates route if not exists
if (!code.includes('/api/estimates')) {
  const insertIndex = code.indexOf("server.middlewares.use('/api/parties'");
  const estimatesApi = \      server.middlewares.use('/api/estimates', async (req, res) => {
        try {
          const repository = await import('./database/sqlite/repository.mjs');
          const requestUrl = new URL(req.url ?? '/', 'http://localhost');
          
          if (req.method === 'DELETE') {
            const pathId = requestUrl.pathname.split('/').filter(Boolean)[0];
            const queryId = requestUrl.searchParams.get('id');
            const id = (pathId || queryId || '').trim();
            if (id) {
              repository.deleteEstimate(id);
              res.statusCode = 204;
              res.end();
            } else {
              res.statusCode = 400;
              res.end(JSON.stringify({ message: 'ID required' }));
            }
            return;
          }
          res.statusCode = 405;
          res.end();
        } catch (error) {
          res.statusCode = 500;
          res.end();
        }
      });\n\n\;
  code = code.slice(0, insertIndex) + estimatesApi + code.slice(insertIndex);
}

fs.writeFileSync('vite.config.ts', code);
