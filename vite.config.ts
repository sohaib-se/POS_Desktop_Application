import path from "path"
import fs from "node:fs"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

function sqliteApiPlugin() {
  return {
    name: 'sqlite-api-plugin',
    configureServer(server: import('vite').ViteDevServer) {
      const appDataRoot = path.join(process.cwd(), 'app_data');
      const itemsImagesRoot = path.join(appDataRoot, 'items_images');

      const resolveManagedImagePath = (rawPath: unknown) => {
        if (!rawPath || typeof rawPath !== 'string') {
          return null;
        }

        const trimmedPath = rawPath.trim();
        if (!trimmedPath.startsWith('/app_data/items_images/')) {
          return null;
        }

        const relativePath = trimmedPath.replace(/^\/app_data\//, '');
        const absolutePath = path.join(appDataRoot, relativePath);

        if (!absolutePath.startsWith(itemsImagesRoot)) {
          return null;
        }

        return absolutePath;
      };

      const removeManagedImageFile = (rawPath: unknown) => {
        const absolutePath = resolveManagedImagePath(rawPath);
        if (!absolutePath || !fs.existsSync(absolutePath)) {
          return;
        }

        const stats = fs.statSync(absolutePath);
        if (!stats.isFile()) {
          return;
        }

        fs.unlinkSync(absolutePath);
      };

      server.middlewares.use('/app_data', (req, res, next) => {
        const requestPath = decodeURIComponent((req.url ?? '/').split('?')[0]);
        const normalizedPath = path.normalize(requestPath).replace(/^([.][.][\\/])+/, '');
        const targetPath = path.join(appDataRoot, normalizedPath);

        if (!targetPath.startsWith(appDataRoot)) {
          res.statusCode = 403;
          res.end('Forbidden');
          return;
        }

        if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isFile()) {
          next();
          return;
        }

        const extension = path.extname(targetPath).toLowerCase();
        const contentTypes: Record<string, string> = {
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.gif': 'image/gif',
          '.webp': 'image/webp',
        };

        res.statusCode = 200;
        res.setHeader('Content-Type', contentTypes[extension] ?? 'application/octet-stream');
        fs.createReadStream(targetPath).pipe(res);
      });

      // Ensure DB migrations run as soon as dev server starts.
      void import('./database/sqlite/client.mjs')
        .then((client) => {
          const db = client.openDatabase();
          db.close();
        })
        .catch((error) => {
          console.error(error);
        });

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

      server.middlewares.use('/api/units', async (req, res) => {
        try {
          // @ts-expect-error Runtime-only Node module used in Vite middleware.
          const repository = await import('./database/sqlite/repository.mjs');
          const requestUrl = new URL(req.url ?? '/', 'http://localhost');

          if (req.method === 'GET') {
            const unitRows = repository.getUnits();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(unitRows));
            return;
          }

          if (req.method === 'POST') {
            const chunks: Buffer[] = [];
            req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
            req.on('end', () => {
              try {
                const raw = Buffer.concat(chunks).toString('utf8');
                const payload = raw ? JSON.parse(raw) : {};

                if (!payload.fullName || !String(payload.fullName).trim()) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ message: 'Full name is required.' }));
                  return;
                }

                if (!payload.shortName || !String(payload.shortName).trim()) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ message: 'Short name is required.' }));
                  return;
                }

                const unit = {
                  id: payload.id ? String(payload.id) : Date.now().toString(),
                  fullName: String(payload.fullName).trim(),
                  shortName: String(payload.shortName).trim(),
                };

                repository.upsertUnit(unit);
                res.statusCode = 201;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(unit));
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
              res.end(JSON.stringify({ message: 'Unit id is required.' }));
              return;
            }

            const deleted = repository.deleteUnit(id);
            if (!deleted) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ message: 'Unit not found.' }));
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

      server.middlewares.use('/api/items', async (req, res) => {
        try {
          // @ts-expect-error Runtime-only Node module used in Vite middleware.
          const repository = await import('./database/sqlite/repository.mjs');
          const requestUrl = new URL(req.url ?? '/', 'http://localhost');

          if (req.method === 'GET') {
            const itemRows = repository.getItems();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(itemRows));
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
                  res.end(JSON.stringify({ message: 'Item name is required.' }));
                  return;
                }

                if (!payload.unit || !String(payload.unit).trim()) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ message: 'Unit is required.' }));
                  return;
                }

                let resolvedImgPath =
                  payload.imgPath && String(payload.imgPath).trim()
                    ? String(payload.imgPath).trim()
                    : null;
                const existingItem = payload.id
                  ? repository
                      .getItems()
                      .find((itemRow: { id: string; img_path?: string | null }) => String(itemRow.id) === String(payload.id))
                  : null;
                const previousImgPath = existingItem?.img_path ?? null;

                if (payload.imageDataUrl) {
                  const imageDataUrl = String(payload.imageDataUrl);
                  const matchedDataUrl = imageDataUrl.match(/^data:(image\/[\w.+-]+);base64,(.+)$/);

                  if (!matchedDataUrl) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ message: 'Invalid image format.' }));
                    return;
                  }

                  const mimeType = matchedDataUrl[1];
                  const base64Payload = matchedDataUrl[2];
                  const originalFileName = payload.imageFileName
                    ? String(payload.imageFileName).trim()
                    : '';

                  const extensionByMimeType: Record<string, string> = {
                    'image/png': '.png',
                    'image/jpeg': '.jpg',
                    'image/jpg': '.jpg',
                    'image/webp': '.webp',
                    'image/gif': '.gif',
                  };

                  const extensionFromFileName = path.extname(originalFileName).toLowerCase();
                  const fileExtension =
                    extensionFromFileName || extensionByMimeType[mimeType] || '.png';

                  const fileName = `product_${Date.now()}${fileExtension}`;
                  const imagesRoot = path.join(process.cwd(), 'app_data', 'items_images');
                  const imageAbsolutePath = path.join(imagesRoot, fileName);

                  fs.mkdirSync(imagesRoot, { recursive: true });
                  fs.writeFileSync(imageAbsolutePath, Buffer.from(base64Payload, 'base64'));

                  resolvedImgPath = `/app_data/items_images/${fileName}`;

                  if (previousImgPath && previousImgPath !== resolvedImgPath) {
                    try {
                      removeManagedImageFile(previousImgPath);
                    } catch (error) {
                      console.error('Failed to remove previous item image:', error);
                    }
                  }
                }

                const item = {
                  id: payload.id ? String(payload.id) : Date.now().toString(),
                  name: String(payload.name).trim(),
                  code: payload.code ? String(payload.code).trim() : null,
                  category: payload.category ? String(payload.category).trim() : null,
                  salePrice: Number.isFinite(Number(payload.salePrice)) ? Number(payload.salePrice) : 0,
                  wholesalePrice: Number.isFinite(Number(payload.wholesalePrice)) ? Number(payload.wholesalePrice) : 0,
                  purchasePrice: Number.isFinite(Number(payload.purchasePrice)) ? Number(payload.purchasePrice) : 0,
                  stockQuantity: Number.isFinite(Number(payload.stockQuantity)) ? Number(payload.stockQuantity) : 0,
                  unit: String(payload.unit).trim(),
                  primaryUnit: payload.primaryUnit ? String(payload.primaryUnit).trim() : null,
                  secondaryUnit: payload.secondaryUnit ? String(payload.secondaryUnit).trim() : null,
                  conversionRate: Number.isFinite(Number(payload.conversionRate))
                    ? Number(payload.conversionRate)
                    : Number.isFinite(Number(payload.conversion_rate))
                      ? Number(payload.conversion_rate)
                      : null,
                  imgPath: resolvedImgPath,
                  stockValue: Number.isFinite(Number(payload.stockValue)) ? Number(payload.stockValue) : null,
                  minStock: Number.isFinite(Number(payload.minStock)) ? Number(payload.minStock) : null,
                  location: payload.location ? String(payload.location).trim() : null,
                };

                const secondaryStock = Number(item.stockQuantity) * Number(item.conversionRate ?? 0);

                repository.upsertItem(item);
                res.statusCode = 201;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  ...item,
                  secondaryStock,
                }));
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
              res.end(JSON.stringify({ message: 'Item id is required.' }));
              return;
            }

            const existingItem = repository
              .getItems()
              .find((itemRow: { id: string; img_path?: string | null }) => String(itemRow.id) === id);
            const existingImgPath = existingItem?.img_path ?? null;

            const deleted = repository.deleteItem(id);
            if (!deleted) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ message: 'Item not found.' }));
              return;
            }

            try {
              if (existingImgPath) {
                removeManagedImageFile(existingImgPath);
              }
            } catch (error) {
              console.error('Failed to remove item image on delete:', error);
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

      server.middlewares.use('/api/conversion_rates', async (req, res) => {
        try {
          // @ts-expect-error Runtime-only Node module used in Vite middleware.
          const repository = await import('./database/sqlite/repository.mjs');
          const requestUrl = new URL(req.url ?? '/', 'http://localhost');

          if (req.method === 'GET') {
            const baseUnit = requestUrl.searchParams.get('baseUnit')?.trim() || undefined;
            const rows = repository.getConversionRates(baseUnit);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(rows));
            return;
          }

          if (req.method === 'POST') {
            const chunks: Buffer[] = [];
            req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
            req.on('end', () => {
              try {
                const raw = Buffer.concat(chunks).toString('utf8');
                const payload = raw ? JSON.parse(raw) : {};

                const baseUnit = String(payload.baseUnit ?? '').trim();
                const secondaryUnit = String(payload.secondaryUnit ?? '').trim();
                const conversionRate = Number(payload.conversionRate);

                if (!baseUnit) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ message: 'Base unit is required.' }));
                  return;
                }

                if (!secondaryUnit) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ message: 'Secondary unit is required.' }));
                  return;
                }

                if (!Number.isFinite(conversionRate) || conversionRate <= 0) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ message: 'Conversion rate must be greater than zero.' }));
                  return;
                }

                const id = repository.addConversionRate({
                  baseUnit,
                  secondaryUnit,
                  conversionRate,
                });

                res.statusCode = 201;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    id,
                    base_unit: baseUnit,
                    secondary_unit: secondaryUnit,
                    conversion_rate: conversionRate,
                  }),
                );
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
