import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

function sqliteApiPlugin() {
  return {
    name: 'sqlite-api-plugin',
    configureServer(server: import('vite').ViteDevServer) {
      server.middlewares.use('/api/parties', async (req, res) => {
        try {
          // @ts-expect-error Runtime-only Node module used in Vite middleware.
          const repository = await import('./database/sqlite/repository.mjs');
          const requestUrl = new URL(req.url ?? '/', 'http://localhost');

          if (req.method === 'GET') {
            const parties = repository.getParties();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(parties));
            return;
          }

          if (req.method === 'POST') {
            const chunks: Buffer[] = [];
            req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
            req.on('end', () => {
              try {
                const raw = Buffer.concat(chunks).toString('utf8');
                const payload = raw ? JSON.parse(raw) : {};

                if (!payload.name || !String(payload.name).trim()) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ message: 'Party name is required.' }));
                  return;
                }

                const normalizedBalance = Number(payload.balance ?? 0);
                const providedId = Number(payload.id);
                const normalizedId = Number.isFinite(providedId)
                  ? providedId
                  : repository.getNextPartyId();

                const party = {
                  id: normalizedId,
                  name: String(payload.name).trim(),
                  phone: String(payload.phone ?? ''),
                  email: payload.email ? String(payload.email) : null,
                  address: payload.address ? String(payload.address) : null,
                  balance: Number.isFinite(normalizedBalance) ? normalizedBalance : 0,
                  type: payload.type ?? 'customer'
                };

                repository.upsertParty(party);
                res.statusCode = 201;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(party));
              } catch {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'Invalid JSON payload.' }));
              }
            });
            return;
          }

          if (req.method === 'DELETE') {
            const pathId = requestUrl.pathname.split('/').filter(Boolean)[0];
            const queryId = requestUrl.searchParams.get('id');

            const deleteById = (rawId: unknown) => {
              const id = typeof rawId === 'string' ? rawId.trim() : '';

              if (!id) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'Party id is required.' }));
                return;
              }

              const deleted = repository.deleteParty(id);
              if (!deleted) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'Party not found.' }));
                return;
              }

              res.statusCode = 204;
              res.end();
            };

            if (pathId || queryId) {
              deleteById(pathId || queryId);
              return;
            }

            const chunks: Buffer[] = [];
            req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
            req.on('end', () => {
              try {
                const raw = Buffer.concat(chunks).toString('utf8');
                const payload = raw ? JSON.parse(raw) : {};
                deleteById(payload?.id);
              } catch {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'Invalid JSON payload.' }));
              }
            });
            return;
          }

          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'Method not allowed.' }));
        } catch {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'Failed to process request.' }));
        }
      });

      server.middlewares.use('/api/categories', async (req, res) => {
        try {
          // @ts-expect-error Runtime-only Node module used in Vite middleware.
          const repository = await import('./database/sqlite/repository.mjs');
          const requestUrl = new URL(req.url ?? '/', 'http://localhost');

          if (req.method === 'GET') {
            const categories = repository.getCategories();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(categories));
            return;
          }

          if (req.method === 'POST') {
            const chunks: Buffer[] = [];
            req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
            req.on('end', () => {
              try {
                const raw = Buffer.concat(chunks).toString('utf8');
                const payload = raw ? JSON.parse(raw) : {};

                if (!payload.name || !String(payload.name).trim()) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ message: 'Category name is required.' }));
                  return;
                }

                const category = {
                  id: payload.id ? String(payload.id) : Date.now().toString(),
                  name: String(payload.name).trim(),
                  itemCount: Number.isFinite(Number(payload.itemCount))
                    ? Number(payload.itemCount)
                    : 0,
                };

                repository.upsertCategory(category);
                res.statusCode = 201;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(category));
              } catch {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'Invalid JSON payload.' }));
              }
            });
            return;
          }

          if (req.method === 'DELETE') {
            const pathId = requestUrl.pathname.split('/').filter(Boolean)[0];
            const queryId = requestUrl.searchParams.get('id');
            const id = (pathId || queryId || '').trim();

            if (!id) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ message: 'Category id is required.' }));
              return;
            }

            const deleted = repository.deleteCategory(id);
            if (!deleted) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ message: 'Category not found.' }));
              return;
            }

            res.statusCode = 204;
            res.end();
            return;
          }

          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'Method not allowed.' }));
        } catch {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'Failed to process request.' }));
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [inspectAttr(), react(), sqliteApiPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
