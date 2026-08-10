const fs = require('fs');
const path = require('path');

const vitePath = path.join(__dirname, 'vite.config.ts');
let code = fs.readFileSync(vitePath, 'utf8');

const apiBlock = `
      server.middlewares.use('/api/recycle_bin/restore', async (req, res) => {
        try {
          // @ts-expect-error Runtime-only Node module used in Vite middleware.
          const repository = await import('./database/sqlite/repository.mjs');
          
          if (req.method === 'POST') {
            const chunks = [];
            req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
            req.on('end', () => {
              try {
                const raw = Buffer.concat(chunks).toString('utf8');
                const payload = raw ? JSON.parse(raw) : {};
                
                if (!payload.id) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ message: 'ID is required.' }));
                  return;
                }
                
                const success = repository.restoreRecycleBinItem(payload.id);
                if (success) {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ message: 'Restored successfully.' }));
                } else {
                  res.statusCode = 404;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ message: 'Failed to restore item.' }));
                }
              } catch(e) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'Invalid payload.' }));
              }
            });
            return;
          }
          
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'Method not allowed.' }));
        } catch(e) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'Server error.' }));
        }
      });

      server.middlewares.use('/api/recycle_bin', async (req, res) => {
        try {
          // @ts-expect-error Runtime-only Node module used in Vite middleware.
          const repository = await import('./database/sqlite/repository.mjs');
          const requestUrl = new URL(req.url ?? '/', 'http://localhost');

          if (req.method === 'GET') {
            const items = repository.getRecycleBinItems();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(items));
            return;
          }

          if (req.method === 'DELETE') {
            const id = requestUrl.searchParams.get('id');
            if (!id) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ message: 'ID is required.' }));
              return;
            }
            const success = repository.permanentDeleteRecycleBinItem(id);
            if (success) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ message: 'Deleted successfully.' }));
            } else {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ message: 'Item not found.' }));
            }
            return;
          }
          
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'Method not allowed.' }));
        } catch(e) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'Server error.' }));
        }
      });
`;

if (!code.includes('/api/recycle_bin')) {
  // Find the last middleware block
  const searchString = "server.middlewares.use('/api/cash_transactions', async (req, res) => {";
  const searchIndex = code.indexOf(searchString);
  if (searchIndex !== -1) {
    code = code.slice(0, searchIndex) + apiBlock + "\\n" + code.slice(searchIndex);
    fs.writeFileSync(vitePath, code);
    console.log('Successfully patched vite.config.ts');
  } else {
    console.error('Could not find anchor point in vite.config.ts');
  }
} else {
  console.log('Already patched.');
}
