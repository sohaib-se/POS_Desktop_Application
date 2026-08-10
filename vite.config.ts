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
      const saleAttachmentsRoot = path.join(appDataRoot, 'sale_attachments');

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

      const resolveManagedAttachmentPath = (rawPath: unknown) => {
        if (!rawPath || typeof rawPath !== 'string') {
          return null;
        }

        const trimmedPath = rawPath.trim();
        if (!trimmedPath.startsWith('/app_data/sale_attachments/')) {
          return null;
        }

        const relativePath = trimmedPath.replace(/^\/app_data\//, '');
        const absolutePath = path.join(appDataRoot, relativePath);

        if (!absolutePath.startsWith(saleAttachmentsRoot)) {
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

      const removeManagedAttachmentFile = (rawPath: unknown) => {
        const absolutePath = resolveManagedAttachmentPath(rawPath);
        if (!absolutePath || !fs.existsSync(absolutePath)) {
          return;
        }

        const stats = fs.statSync(absolutePath);
        if (!stats.isFile()) {
          return;
        }

        fs.unlinkSync(absolutePath);
      };

      const parseJsonBody = (req: import('node:http').IncomingMessage) =>
        new Promise<any>((resolve, reject) => {
          const chunks: Buffer[] = [];
          req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
          req.on('end', () => {
            try {
              const raw = Buffer.concat(chunks).toString('utf8');
              resolve(raw ? JSON.parse(raw) : {});
            } catch (error) {
              reject(error);
            }
          });
          req.on('error', reject);
        });

      const saveDataUrlToAppData = ({
        dataUrl,
        prefix,
        targetRoot,
      }: {
        dataUrl: unknown;
        prefix: string;
        targetRoot: string;
      }) => {
        if (!dataUrl || typeof dataUrl !== 'string') {
          return null;
        }

        const matchedDataUrl = dataUrl.match(/^data:([\w.+-]+\/[\w.+-]+);base64,(.+)$/);
        if (!matchedDataUrl) {
          throw new Error('Invalid file format.');
        }

        const mimeType = matchedDataUrl[1];
        const base64Payload = matchedDataUrl[2];
        const extensionByMimeType: Record<string, string> = {
          'image/png': '.png',
          'image/jpeg': '.jpg',
          'image/jpg': '.jpg',
          'image/webp': '.webp',
          'image/gif': '.gif',
          'application/pdf': '.pdf',
          'text/plain': '.txt',
          'application/msword': '.doc',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
          'application/vnd.ms-excel': '.xls',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
        };

        const fileName = `${prefix}_${Date.now()}${extensionByMimeType[mimeType] ?? '.bin'}`;
        const absolutePath = path.join(targetRoot, fileName);
        fs.mkdirSync(targetRoot, { recursive: true });
        fs.writeFileSync(absolutePath, Buffer.from(base64Payload, 'base64'));

        return {
          fileName,
          filePath: `/app_data/${path.basename(targetRoot)}/${fileName}`,
        };
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
      // @ts-expect-error Runtime-only Node module used in Vite middleware.
      void import('./database/sqlite/client.mjs')
        .then((client) => {
          const db = client.openDatabase();
          db.close();
        })
        .catch((error) => {
          console.error(error);
        });

      server.middlewares.use('/api/user_profile', async (req, res) => {
        try {
          // @ts-expect-error Runtime-only Node module used in Vite middleware.
          const repository = await import('./database/sqlite/repository.mjs');

          if (req.method === 'GET') {
            const profile = repository.getUserProfile();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(profile || {}));
            return;
          }

          if (req.method === 'PUT') {
            const payload = await parseJsonBody(req);
            
            const currentProfile = repository.getUserProfile() || {};
            
            // Handle image uploads
            let logoPath = payload.logo;
            if (logoPath && logoPath.startsWith('data:image')) {
              if (currentProfile.logo) {
                try {
                  const oldLogoPath = path.join(process.cwd(), currentProfile.logo.startsWith('/') ? currentProfile.logo.substring(1) : currentProfile.logo);
                  if (fs.existsSync(oldLogoPath)) {
                    fs.unlinkSync(oldLogoPath);
                  }
                } catch (e) { console.error("Error deleting old logo", e); }
              }
              const saved = saveDataUrlToAppData({
                dataUrl: logoPath,
                prefix: 'logo',
                targetRoot: path.join(appDataRoot, 'user_images'),
              });
              logoPath = saved?.filePath;
            }

            let signaturePath = payload.signature;
            if (signaturePath && signaturePath.startsWith('data:image')) {
              if (currentProfile.signature) {
                try {
                  const oldSignaturePath = path.join(process.cwd(), currentProfile.signature.startsWith('/') ? currentProfile.signature.substring(1) : currentProfile.signature);
                  if (fs.existsSync(oldSignaturePath)) {
                    fs.unlinkSync(oldSignaturePath);
                  }
                } catch (e) { console.error("Error deleting old signature", e); }
              }
              const saved = saveDataUrlToAppData({
                dataUrl: signaturePath,
                prefix: 'signature',
                targetRoot: path.join(appDataRoot, 'user_images'),
              });
              signaturePath = saved?.filePath;
            }

            const updatedPayload = {
              ...payload,
              logo: logoPath,
              signature: signaturePath
            };

            repository.updateUserProfile(updatedPayload);
            const updatedProfile = repository.getUserProfile();
            
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(updatedProfile));
            return;
          }

          res.statusCode = 405;
          res.end('Method Not Allowed');
        } catch (error) {
          console.error(error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'Internal server error.' }));
        }
      });

      server.middlewares.use('/api/adjust_stock_transactions', async (req, res) => {
        try {
          // @ts-expect-error Runtime-only Node module used in Vite middleware.
          const repository = await import('./database/sqlite/repository.mjs');

          if (req.method === 'GET') {
            const adjustments = repository.getStockAdjustments();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(adjustments));
            return;
          }

          if (req.method === 'POST') {
            const payload = await parseJsonBody(req);
            const id = repository.addStockAdjustment(payload);
            res.statusCode = 201;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ...payload, id }));
            return;
          }

          res.statusCode = 405;
          res.end('Method Not Allowed');
        } catch (error) {
          console.error(error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'Internal server error.' }));
        }
      });

      server.middlewares.use('/api/bank_accounts', async (req, res) => {
        try {
          // @ts-expect-error Runtime-only Node module used in Vite middleware.
          const repository = await import('./database/sqlite/repository.mjs');
          const requestUrl = new URL(req.url ?? '/', 'http://localhost');

          if (req.method === 'GET') {
            const accounts = repository.getBankAccounts();
            const withTransactions = accounts.map((acc: any) => ({
              ...acc,
              transactions: repository.getBankAccountTransactions(acc.name)
            }));
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(withTransactions));
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
                  res.end(JSON.stringify({ message: 'Account name is required.' }));
                  return;
                }

                const id = repository.addBankAccount(payload);
                res.statusCode = 201;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ ...payload, id }));
              } catch {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'Invalid JSON payload.' }));
              }
            });
            return;
          }

          if (req.method === 'PUT') {
            const pathSegments = requestUrl.pathname.split('/').filter(Boolean);
            const id = requestUrl.searchParams.get('id') || pathSegments[0];
            const chunks: Buffer[] = [];
            req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
            req.on('end', () => {
              try {
                const raw = Buffer.concat(chunks).toString('utf8');
                const payload = raw ? JSON.parse(raw) : {};

                repository.updateBankAccount(id, payload);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ ...payload, id }));
              } catch {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'Invalid JSON payload.' }));
              }
            });
            return;
          }

          if (req.method === 'DELETE') {
            const pathSegments = requestUrl.pathname.split('/').filter(Boolean);
            const id = requestUrl.searchParams.get('id') || pathSegments[0];

            if (!id) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ message: 'ID is required.' }));
              return;
            }

            repository.deleteBankAccount(id);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
            return;
          }

          res.statusCode = 405;
          res.end();
        } catch (error) {
          console.error(error);
          res.statusCode = 500;
          res.end(JSON.stringify({ message: 'Internal Server Error' }));
        }
      });

      server.middlewares.use('/api/payment_in_records', async (req, res) => {
        try {
          // @ts-expect-error Runtime-only Node module used in Vite middleware.
          const repository = await import('./database/sqlite/repository.mjs');

          const requestUrl = new URL(req.url ?? '/', 'http://localhost');

          if (req.method === 'GET') {
            const records = repository.getPaymentInRecords().filter((r: any) =>
              r.payment_type !== 'Opening Balance' &&
              r.payment_type !== 'Payable Opening Balance' &&
              r.payment_type !== 'Receivable Opening Balance'
            );
            const mapped = records.map((r: any) => ({
              ...r,
              receiptNo: r.receipt_no,
              partyName: r.party_name,
              paymentType: r.payment_type
            }));
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(mapped));
            return;
          }

          if (req.method === 'POST') {
            try {
              const payload = await parseJsonBody(req);
              let createdImagePath = null;

              if (payload.imageDataUrl) {
                const imageFile = saveDataUrlToAppData({
                  dataUrl: payload.imageDataUrl,
                  prefix: 'payment_in_image',
                  targetRoot: saleAttachmentsRoot,
                });
                createdImagePath = imageFile?.filePath ?? null;
              }

              const record = {
                id: String(Date.now()),
                receiptNo: payload.receiptNo ?? '',
                date: payload.date ?? new Date().toLocaleDateString('en-GB'),
                partyName: payload.partyName ?? 'Cash Sale',
                partyId: payload.partyId ?? null,
                amount: Number(payload.amount ?? 0),
                paymentType: payload.paymentType ?? 'Cash',
                reference: payload.reference ?? null,
                description: payload.description ?? null,
                attachmentImagePath: createdImagePath,
                attachmentImageName: null,
                attachmentDocumentPath: null,
                attachmentDocumentName: null,
              };

              repository.addPaymentInRecord(record);

              if (record.partyId) {
                const allParties = repository.getParties();
                const party = allParties.find((p: any) => String(p.id) === String(record.partyId));
                if (party) {
                  party.balance = Number(party.balance || 0) - Number(record.amount || 0);
                  repository.upsertParty(party);
                }
              }

              if (String(record.paymentType).toLowerCase() === 'cash') {
                repository.addCashInHandTransaction({
                  id: 'cash_payment_in_' + record.id,
                  date: record.date,
                  name: record.partyName,
                  type: 'Payment In',
                  amount: record.amount
                });
              } else if (record.paymentType) {
                repository.addBankAccountTransaction({
                  id: 'bank_payment_in_' + record.id,
                  date: record.date,
                  name: record.partyName,
                  type: 'Payment In',
                  amount: record.amount,
                  paymentType: record.paymentType
                });
              }

              res.statusCode = 201;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(record));
            } catch (error) {
              console.error('POST /api/payment_in_records error:', error);
              res.statusCode = 400;
              res.end(JSON.stringify({ message: 'Bad Request' }));
            }
            return;
          }

          if (req.method === 'DELETE') {
            const pathId = requestUrl.pathname.split('/').filter(Boolean)[0];
            const queryId = requestUrl.searchParams.get('id');
            const id = (pathId || queryId || '').trim();

            if (id) {
              const existingRecord = repository.getPaymentInRecordById(id);
              if (existingRecord) {
                if (existingRecord.party_id) {
                  try {
                    const allParties = repository.getParties();
                    const party = allParties.find((p: any) => String(p.id) === String(existingRecord.party_id));
                    if (party) {
                      party.balance = Number(party.balance || 0) + Number(existingRecord.amount || 0);
                      repository.upsertParty(party);
                    }
                  } catch (balanceError) {
                    console.error('Failed to restore party balance:', balanceError);
                  }
                }

                try {
                  const pMode = String(existingRecord.payment_type).toLowerCase();
                  if (pMode === 'cash') {
                    repository.deleteCashInHandTransaction('cash_payment_in_' + id);
                  } else if (pMode) {
                    repository.deleteBankAccountTransaction('bank_payment_in_' + id);
                  }
                } catch (txError) {
                  console.error('Failed to delete cash/bank transaction:', txError);
                }
              }

              repository.deletePaymentInRecord(id);
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
      });

      server.middlewares.use('/api/payment_out_records', async (req, res) => {
        try {
          // @ts-expect-error Runtime-only Node module used in Vite middleware.
          const repository = await import('./database/sqlite/repository.mjs');

          const requestUrl = new URL(req.url ?? '/', 'http://localhost');

          if (req.method === 'GET') {
            const records = repository.getPaymentOutRecordsReal().filter((r: any) =>
              r.payment_type !== 'Opening Balance' &&
              r.payment_type !== 'Payable Opening Balance' &&
              r.payment_type !== 'Receivable Opening Balance'
            );
            const mapped = records.map((r: any) => ({
              ...r,
              paymentNo: r.payment_no,
              partyName: r.party_name,
              paymentType: r.payment_type
            }));
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(mapped));
            return;
          }

          if (req.method === 'POST') {
            try {
              const payload = await parseJsonBody(req);
              let createdImagePath = null;

              if (payload.imageDataUrl) {
                const imageFile = saveDataUrlToAppData({
                  dataUrl: payload.imageDataUrl,
                  prefix: 'payment_out_image',
                  targetRoot: saleAttachmentsRoot,
                });
                createdImagePath = imageFile?.filePath ?? null;
              }

              const record = {
                id: String(Date.now()),
                paymentNo: payload.paymentNo ?? '',
                date: payload.date ?? new Date().toLocaleDateString('en-GB'),
                partyName: payload.partyName ?? 'Cash Purchase',
                partyId: payload.partyId ? String(payload.partyId) : null,
                amount: Number(payload.amount ?? 0),
                paymentType: payload.paymentType ?? 'Cash',
                reference: payload.reference ?? null,
                description: payload.description ?? null,
                attachmentImagePath: createdImagePath,
              };

              repository.addPaymentOutRecord(record);

              if (payload.partyId) {
                const allParties = repository.getParties();
                const party = allParties.find((p: any) => String(p.id) === String(payload.partyId));
                if (party) {
                  party.balance = Number(party.balance || 0) + Number(record.amount || 0);
                  repository.upsertParty(party);
                }
              }

              if (String(record.paymentType).toLowerCase() === 'cash') {
                repository.addCashInHandTransaction({
                  id: 'cash_payment_out_' + record.id,
                  date: record.date,
                  name: record.partyName,
                  type: 'Payment Out',
                  amount: -record.amount
                });
              } else if (record.paymentType) {
                repository.addBankAccountTransaction({
                  id: 'bank_payment_out_' + record.id,
                  date: record.date,
                  name: record.partyName,
                  type: 'Payment Out',
                  amount: -record.amount,
                  paymentType: record.paymentType
                });
              }

              res.statusCode = 201;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(record));
            } catch (error) {
              console.error('POST /api/payment_out_records error:', error);
              res.statusCode = 400;
              res.end(JSON.stringify({ message: 'Bad Request' }));
            }
            return;
          }

          if (req.method === 'DELETE') {
            const pathId = requestUrl.pathname.split('/').filter(Boolean)[0];
            const queryId = requestUrl.searchParams.get('id');
            const id = (pathId || queryId || '').trim();

            if (id) {
              const existingRecord = repository.getPaymentOutRecordById(id);
              if (existingRecord) {
                if (existingRecord.party_id) {
                  try {
                    const allParties = repository.getParties();
                    const party = allParties.find((p: any) => String(p.id) === String(existingRecord.party_id));
                    if (party) {
                      party.balance = Number(party.balance || 0) - Number(existingRecord.amount || 0);
                      repository.upsertParty(party);
                    }
                  } catch (balanceError) {
                    console.error('Failed to restore party balance:', balanceError);
                  }
                }

                try {
                  const pMode = String(existingRecord.payment_type).toLowerCase();
                  if (pMode === 'cash') {
                    repository.deleteCashInHandTransaction('cash_payment_out_' + id);
                  } else if (pMode) {
                    repository.deleteBankAccountTransaction('bank_payment_out_' + id);
                  }
                } catch (txError) {
                  console.error('Failed to delete cash/bank transaction:', txError);
                }
              }

              repository.deletePaymentOutRecord(id);
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
      });

      server.middlewares.use('/api/estimates', async (req, res) => {
        try {
          // @ts-expect-error Runtime-only Node module used in Vite middleware.
          const repository = await import('./database/sqlite/repository.mjs');
          const requestUrl = new URL(req.url ?? '/', 'http://localhost');

          if (req.method === 'GET') {
            const records = repository.getEstimates();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(records));
            return;
          }

          if (req.method === 'POST') {
            let createdImagePath: string | null = null;
            let createdDocumentPath: string | null = null;

            try {
              const payload = await parseJsonBody(req);

              if (!payload.partyName || !String(payload.partyName).trim()) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'Party name is required.' }));
                return;
              }

              const lineItems = Array.isArray(payload.lineItems) ? payload.lineItems : [];
              const subtotal = Number(payload.subtotal ?? 0);
              const discountPercent = Number(payload.discountPercent ?? 0);
              const discountAmount = Number(payload.discountAmount ?? 0);
              const taxRate = Number(payload.taxRate ?? 0);
              const taxAmount = Number(payload.taxAmount ?? 0);
              const roundOffAmount = Number(payload.roundOffAmount ?? 0);
              const amount = Number(payload.amount ?? 0);
              const balance = Number(payload.balance ?? 0);

              const imageFile = saveDataUrlToAppData({
                dataUrl: payload.imageDataUrl,
                prefix: 'estimate_image',
                targetRoot: saleAttachmentsRoot,
              });
              createdImagePath = imageFile?.filePath ?? null;
              
              const documentFile = saveDataUrlToAppData({
                dataUrl: payload.documentDataUrl,
                prefix: 'estimate_document',
                targetRoot: saleAttachmentsRoot,
              });
              createdDocumentPath = documentFile?.filePath ?? null;

              const estimate = {
                id: String(payload.id ?? Date.now().toString()),
                referenceNo: String(payload.referenceNo ?? repository.getNextEstimateNo()),
                date: String(payload.date ?? new Date().toLocaleDateString('en-GB')),
                partyName: String(payload.partyName).trim(),
                subtotal: Number.isFinite(subtotal) ? subtotal : 0,
                discountPercent: Number.isFinite(discountPercent) ? discountPercent : 0,
                discountAmount: Number.isFinite(discountAmount) ? discountAmount : 0,
                taxLabel: payload.taxLabel ? String(payload.taxLabel) : null,
                taxRate: Number.isFinite(taxRate) ? taxRate : 0,
                taxAmount: Number.isFinite(taxAmount) ? taxAmount : 0,
                roundOff: payload.roundOff ? 1 : 0,
                roundOffAmount: Number.isFinite(roundOffAmount) ? roundOffAmount : 0,
                amount: Number.isFinite(amount) ? amount : 0,
                balance: Number.isFinite(balance) ? balance : 0,
                description: payload.description ? String(payload.description) : null,
                lineItemsJson: JSON.stringify(lineItems),
                attachmentImagePath: imageFile?.filePath ?? null,
                attachmentImageName: imageFile?.fileName ?? null,
                attachmentDocumentPath: documentFile?.filePath ?? null,
                attachmentDocumentName: documentFile?.fileName ?? null,
                status: String(payload.status ?? 'Open'),
              };

              repository.addEstimate(estimate);

              res.statusCode = 201;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(estimate));
              return;
            } catch (err) {
              if (createdImagePath) { try { fs.unlinkSync(createdImagePath); } catch (e) {} }
              if (createdDocumentPath) { try { fs.unlinkSync(createdDocumentPath); } catch (e) {} }
              console.error('Error saving estimate:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ message: 'Failed to save estimate.' }));
              return;
            }
          }

          if (req.method === 'PUT') {
            const pathId = requestUrl.pathname.split('/').filter(Boolean)[0];
            const queryId = requestUrl.searchParams.get('id');
            const id = (pathId || queryId || '').trim();

            if (!id) {
              res.statusCode = 400;
              res.end(JSON.stringify({ message: 'ID required' }));
              return;
            }

            let createdImagePath: string | null = null;
            let createdDocumentPath: string | null = null;

            try {
              const payload = await parseJsonBody(req);
              const lineItems = Array.isArray(payload.lineItems) ? payload.lineItems : [];
              
              const imageFile = saveDataUrlToAppData({
                dataUrl: payload.imageDataUrl,
                prefix: 'estimate_image',
                targetRoot: saleAttachmentsRoot,
              });
              createdImagePath = imageFile?.filePath ?? null;
              
              const documentFile = saveDataUrlToAppData({
                dataUrl: payload.documentDataUrl,
                prefix: 'estimate_document',
                targetRoot: saleAttachmentsRoot,
              });
              createdDocumentPath = documentFile?.filePath ?? null;

              const estimate = {
                referenceNo: String(payload.referenceNo ?? repository.getNextEstimateNo()),
                date: String(payload.date ?? new Date().toLocaleDateString('en-GB')),
                partyName: String(payload.partyName).trim(),
                subtotal: Number(payload.subtotal ?? 0),
                discountPercent: Number(payload.discountPercent ?? 0),
                discountAmount: Number(payload.discountAmount ?? 0),
                taxLabel: payload.taxLabel ? String(payload.taxLabel) : null,
                taxRate: Number(payload.taxRate ?? 0),
                taxAmount: Number(payload.taxAmount ?? 0),
                roundOff: payload.roundOff ? 1 : 0,
                roundOffAmount: Number(payload.roundOffAmount ?? 0),
                amount: Number(payload.amount ?? 0),
                balance: Number(payload.balance ?? 0),
                description: payload.description ? String(payload.description) : null,
                lineItemsJson: JSON.stringify(lineItems),
                attachmentImagePath: createdImagePath,
                attachmentImageName: imageFile?.fileName ?? null,
                attachmentDocumentPath: createdDocumentPath,
                attachmentDocumentName: documentFile?.fileName ?? null,
                status: String(payload.status ?? 'Open'),
              };

              repository.updateEstimate(id, estimate);

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ...estimate, id }));
              return;
            } catch (err) {
              if (createdImagePath) { try { fs.unlinkSync(createdImagePath); } catch (e) {} }
              if (createdDocumentPath) { try { fs.unlinkSync(createdDocumentPath); } catch (e) {} }
              console.error('Error updating estimate:', err);
              res.statusCode = 500;
              res.end(JSON.stringify({ message: 'Failed to update estimate.' }));
              return;
            }
          }

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
                  shippingAddress: payload.shippingAddress ? String(payload.shippingAddress) : null,
                  balance: Number.isFinite(normalizedBalance) ? normalizedBalance : 0,
                  creditLimit: payload.creditLimit ? Number(payload.creditLimit) : null,
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

      server.middlewares.use('/api/expense_categories', async (req, res) => {
        try {
          // @ts-expect-error Runtime-only Node module used in Vite middleware.
          const repository = await import('./database/sqlite/repository.mjs');
          const requestUrl = new URL(req.url ?? '/', 'http://localhost');

          if (req.method === 'GET') {
            const categories = repository.getExpenseCategories();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(categories));
            return;
          }

          if (req.method === 'POST') {
            try {
              const payload = await parseJsonBody(req);

              if (!payload.name || !String(payload.name).trim()) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'Category name is required.' }));
                return;
              }

              const category = {
                id: payload.id ? String(payload.id) : Date.now().toString(),
                name: String(payload.name).trim(),
                type: payload.type ? String(payload.type).trim() : 'Indirect Expense',
                amount: Number(payload.amount) || 0
              };

              repository.upsertExpenseCategory(category);
              res.statusCode = 201;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(category));
            } catch {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ message: 'Invalid JSON payload.' }));
            }
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

            const deleted = repository.deleteExpenseCategory(id);
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

      server.middlewares.use('/api/expense_items', async (req, res) => {
        try {
          // @ts-expect-error Runtime-only Node module used in Vite middleware.
          const repository = await import('./database/sqlite/repository.mjs');

          if (req.method === 'GET') {
            const items = repository.getExpenseItems();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(items));
            return;
          }

          if (req.method === 'POST') {
            try {
              const payload = await parseJsonBody(req);

              if (!payload.name || !String(payload.name).trim()) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'Item name is required.' }));
                return;
              }

              const item = {
                id: payload.id ? String(payload.id) : Date.now().toString(),
                category_id: payload.category_id ? String(payload.category_id) : 'default',
                name: String(payload.name).trim(),
                price: Number(payload.price) || 0
              };

              repository.upsertExpenseItem(item);
              res.statusCode = 201;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(item));
            } catch {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ message: 'Invalid JSON payload.' }));
            }
            return;
          }

          if (req.method === 'DELETE') {
            const requestUrl = new URL(req.url ?? '/', 'http://localhost');
            const pathId = requestUrl.pathname.split('/').filter(Boolean)[0];
            const queryId = requestUrl.searchParams.get('id');
            const id = (pathId || queryId || '').trim();

            if (!id) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ message: 'Item ID is required.' }));
              return;
            }

            const success = repository.deleteExpenseItem(id);
            if (success) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
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
                  batchJson: payload.batchJson ? String(payload.batchJson) : null,
                  location: payload.location ? String(payload.location).trim() : null,
                  atPrice: payload.atPrice !== undefined && payload.atPrice !== null ? Number(payload.atPrice) : null,
                  mfgDate: payload.mfgDate ? String(payload.mfgDate) : null,
                  expDate: payload.expDate ? String(payload.expDate) : null,
                };

                const secondaryStock = Number(item.stockQuantity) * Number(item.conversionRate ?? 0);

                repository.upsertItem(item);
                res.statusCode = 201;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  ...item,
                  secondaryStock,
                }));
              } catch (err) {
                console.error('Error saving item:', err);
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

          if (req.method === 'PUT') {
            const idMatch = requestUrl.pathname.match(/^\/(\d+)$/);
            if (!idMatch) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ message: 'Invalid ID.' }));
              return;
            }
            const id = parseInt(idMatch[1], 10);

            const chunks: Buffer[] = [];
            req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
            req.on('end', () => {
              try {
                const raw = Buffer.concat(chunks).toString('utf8');
                const payload = raw ? JSON.parse(raw) : {};

                const baseUnit = String(payload.baseUnit ?? '').trim();
                const secondaryUnit = String(payload.secondaryUnit ?? '').trim();
                const conversionRate = Number(payload.conversionRate);

                if (!baseUnit || !secondaryUnit || !Number.isFinite(conversionRate) || conversionRate <= 0) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ message: 'Invalid input.' }));
                  return;
                }

                const updated = repository.updateConversionRate(id, {
                  baseUnit,
                  secondaryUnit,
                  conversionRate,
                });

                if (updated) {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(
                    JSON.stringify({
                      id,
                      base_unit: baseUnit,
                      secondary_unit: secondaryUnit,
                      conversion_rate: conversionRate,
                    }),
                  );
                } else {
                  res.statusCode = 404;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ message: 'Conversion rate not found.' }));
                }
              } catch {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'Invalid JSON payload.' }));
              }
            });
            return;
          }

          if (req.method === 'DELETE') {
            const idMatch = requestUrl.pathname.match(/^\/(\d+)$/);
            if (!idMatch) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ message: 'Invalid ID.' }));
              return;
            }
            const id = parseInt(idMatch[1], 10);

            const deleted = repository.deleteConversionRate(id);
            if (deleted) {
              res.statusCode = 204;
              res.end();
            } else {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ message: 'Conversion rate not found.' }));
            }
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

      server.middlewares.use('/api/expense_records', async (req, res) => {
        let createdImagePath: string | null = null;
        let createdDocumentPath: string | null = null;

        try {
          // @ts-expect-error Runtime-only Node module used in Vite middleware.
          const repository = await import('./database/sqlite/repository.mjs');
          const requestUrl = new URL(req.url ?? '/', 'http://localhost');

          const resolveExpenseAttachment = (rawValue: unknown, prefix: string) => {
            if (!rawValue || typeof rawValue !== 'string') {
              return null;
            }

            const trimmedValue = rawValue.trim();
            if (!trimmedValue) {
              return null;
            }

            if (trimmedValue.startsWith('/app_data/sale_attachments/')) {
              return {
                filePath: trimmedValue,
                fileName: path.basename(trimmedValue),
              };
            }

            return saveDataUrlToAppData({
              dataUrl: trimmedValue,
              prefix,
              targetRoot: saleAttachmentsRoot,
            });
          };

          if (req.method === 'GET') {
            const expenseRecords = repository.getExpenseRecords();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(expenseRecords));
            return;
          }

          if (req.method === 'POST') {
            try {
              const payload = await parseJsonBody(req);

              const imageFile = resolveExpenseAttachment(payload.imageDataUrl ?? payload.attachmentImagePath, 'expense_image');
              createdImagePath = imageFile?.filePath ?? null;

              const documentFile = resolveExpenseAttachment(payload.documentDataUrl ?? payload.attachmentDocumentPath, 'expense_document');
              createdDocumentPath = documentFile?.filePath ?? null;

              const lineItems = Array.isArray(payload.lineItems)
                ? payload.lineItems
                : typeof payload.lineItemsJson === 'string'
                  ? JSON.parse(payload.lineItemsJson)
                  : [];

              const record = {
                id: payload.id ?? crypto.randomUUID(),
                expense_no: String(payload.expenseNo ?? repository.getNextExpenseNo()),
                category_id: payload.categoryId ? String(payload.categoryId) : null,
                category_name: payload.categoryName ? String(payload.categoryName) : null,
                amount: Number(payload.amount ?? 0),
                payment_type: String(payload.paymentType ?? 'Cash'),
                description: payload.description ? String(payload.description) : null,
                line_items_json: JSON.stringify(lineItems),
                attachment_image_path: imageFile?.filePath ?? null,
                attachment_image_name: imageFile?.fileName ?? null,
                attachment_document_path: documentFile?.filePath ?? null,
                attachment_document_name: documentFile?.fileName ?? null,
                round_off: payload.roundOff ? 1 : 0,
                round_off_amount: Number(payload.roundOffAmount ?? 0),
              };


              repository.addExpenseRecord(record);

              res.statusCode = 201;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(record));
            } catch (error) {
              if (createdImagePath) {
                removeManagedAttachmentFile(createdImagePath);
              }

              if (createdDocumentPath) {
                removeManagedAttachmentFile(createdDocumentPath);
              }

              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ message: 'Invalid JSON payload.' }));
            }
            return;
          }

          if (req.method === 'PUT') {
            try {
              const pathId = requestUrl.pathname.split('/').filter(Boolean)[0];
              const queryId = requestUrl.searchParams.get('id');
              const id = (pathId || queryId || '').trim();

              if (!id) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'Expense record id is required.' }));
                return;
              }

              const existingRecord = repository.getExpenseRecordById(id);
              if (!existingRecord) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'Expense record not found.' }));
                return;
              }

              const payload = await parseJsonBody(req);

              const imageFile = payload.imageDataUrl || payload.attachmentImagePath
                ? resolveExpenseAttachment(payload.imageDataUrl ?? payload.attachmentImagePath, 'expense_image')
                : null;
              createdImagePath = imageFile?.filePath ?? null;

              const documentFile = payload.documentDataUrl || payload.attachmentDocumentPath
                ? resolveExpenseAttachment(payload.documentDataUrl ?? payload.attachmentDocumentPath, 'expense_document')
                : null;
              createdDocumentPath = documentFile?.filePath ?? null;

              const lineItems = Array.isArray(payload.lineItems)
                ? payload.lineItems
                : typeof payload.lineItemsJson === 'string'
                  ? JSON.parse(payload.lineItemsJson)
                  : JSON.parse(existingRecord.line_items_json ?? '[]');

              const record = {
                id: existingRecord.id,
                expense_no: String(payload.expenseNo ?? existingRecord.expense_no),
                category_id: payload.categoryId ? String(payload.categoryId) : existingRecord.category_id ?? null,
                category_name: payload.categoryName ? String(payload.categoryName) : existingRecord.category_name ?? null,
                amount: Number(payload.amount ?? existingRecord.amount),
                payment_type: String(payload.paymentType ?? existingRecord.payment_type ?? 'Cash'),
                description: payload.description ? String(payload.description) : existingRecord.description ?? null,
                lineItemsJson: JSON.stringify(lineItems),
                attachmentImagePath: createdImagePath ?? existingRecord.attachment_image_path ?? null,
                attachmentImageName: imageFile?.fileName ?? existingRecord.attachment_image_name ?? null,
                attachmentDocumentPath: createdDocumentPath ?? existingRecord.attachment_document_path ?? null,
                attachmentDocumentName: documentFile?.fileName ?? existingRecord.attachment_document_name ?? null,
                round_off: payload.roundOff ? 1 : 0,
                round_off_amount: Number.isFinite(Number(payload.roundOffAmount))
                  ? Number(payload.roundOffAmount)
                  : Number(existingRecord.round_off_amount ?? 0),
              };

              repository.updateExpenseRecord(id, record);

              if (createdImagePath && existingRecord.attachment_image_path && existingRecord.attachment_image_path !== createdImagePath) {
                removeManagedAttachmentFile(existingRecord.attachment_image_path);
              }

              if (createdDocumentPath && existingRecord.attachment_document_path && existingRecord.attachment_document_path !== createdDocumentPath) {
                removeManagedAttachmentFile(existingRecord.attachment_document_path);
              }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(record));
            } catch {
              if (createdImagePath) {
                removeManagedAttachmentFile(createdImagePath);
              }

              if (createdDocumentPath) {
                removeManagedAttachmentFile(createdDocumentPath);
              }

              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ message: 'Invalid JSON payload.' }));
            }
            return;
          }

          if (req.method === 'DELETE') {
            const pathId = requestUrl.pathname.split('/').filter(Boolean)[0];
            const queryId = requestUrl.searchParams.get('id');
            const id = (pathId || queryId || '').trim();

            if (!id) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ message: 'Expense record id is required.' }));
              return;
            }

            const existingRecord = repository.getExpenseRecordById(id);
            const deleted = repository.deleteExpenseRecord(id);
            if (!deleted) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ message: 'Expense record not found.' }));
              return;
            }

            try {
              if (existingRecord?.attachment_image_path) {
                removeManagedAttachmentFile(existingRecord.attachment_image_path);
              }

              if (existingRecord?.attachment_document_path) {
                removeManagedAttachmentFile(existingRecord.attachment_document_path);
              }
            } catch (error) {
              console.error('Failed to remove expense attachments on delete:', error);
            }

            res.statusCode = 204;
            res.end();
            return;
          }

          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'Method not allowed.' }));
        } catch {
          if (createdImagePath) {
            removeManagedAttachmentFile(createdImagePath);
          }

          if (createdDocumentPath) {
            removeManagedAttachmentFile(createdDocumentPath);
          }

          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'Failed to process request.' }));
        }
      });

      server.middlewares.use('/api/sale_invoices', async (req, res) => {
        try {
          // @ts-expect-error Runtime-only Node module used in Vite middleware.
          const repository = await import('./database/sqlite/repository.mjs');
          const requestUrl = new URL(req.url ?? '/', 'http://localhost');

          if (req.method === 'GET') {
            const saleInvoices = repository.getSaleInvoices();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(saleInvoices));
            return;
          }

          if (req.method === 'POST') {
            let createdImagePath: string | null = null;
            let createdDocumentPath: string | null = null;

            try {
              const payload = await parseJsonBody(req);

              if (!payload.partyName || !String(payload.partyName).trim()) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'Party name is required.' }));
                return;
              }

              const lineItems = Array.isArray(payload.lineItems) ? payload.lineItems : [];
              const subtotal = Number(payload.subtotal ?? 0);
              const discountPercent = Number(payload.discountPercent ?? 0);
              const discountAmount = Number(payload.discountAmount ?? 0);
              const taxRate = Number(payload.taxRate ?? 0);
              const taxAmount = Number(payload.taxAmount ?? 0);
              const roundOffAmount = Number(payload.roundOffAmount ?? 0);
              const amount = Number(payload.amount ?? 0);
              const balance = Number(payload.balance ?? 0);

              const imageFile = saveDataUrlToAppData({
                dataUrl: payload.imageDataUrl,
                prefix: 'sale_invoice_image',
                targetRoot: saleAttachmentsRoot,
              });
              createdImagePath = imageFile?.filePath ?? null;
              const documentFile = saveDataUrlToAppData({
                dataUrl: payload.documentDataUrl,
                prefix: 'sale_invoice_document',
                targetRoot: saleAttachmentsRoot,
              });
              createdDocumentPath = documentFile?.filePath ?? null;

              const invoice = {
                id: String(payload.id ?? Date.now().toString()),
                invoiceNo: String(payload.invoiceNo ?? repository.getNextSaleInvoiceNo()),
                date: String(payload.date ?? new Date().toLocaleDateString('en-GB')),
                partyName: String(payload.partyName).trim(),
                partyId: payload.partyId ? String(payload.partyId) : null,
                partyPhone: payload.partyPhone ? String(payload.partyPhone) : null,
                transactionType: 'Sale',
                paymentType: String(payload.paymentType ?? 'Credit'),
                paymentMode: String(payload.paymentMode ?? 'credit'),
                subtotal: Number.isFinite(subtotal) ? subtotal : 0,
                discountPercent: Number.isFinite(discountPercent) ? discountPercent : 0,
                discountAmount: Number.isFinite(discountAmount) ? discountAmount : 0,
                taxLabel: payload.taxLabel ? String(payload.taxLabel) : null,
                taxRate: Number.isFinite(taxRate) ? taxRate : 0,
                taxAmount: Number.isFinite(taxAmount) ? taxAmount : 0,
                roundOff: payload.roundOff ? 1 : 0,
                roundOffAmount: Number.isFinite(roundOffAmount) ? roundOffAmount : 0,
                amount: Number.isFinite(amount) ? amount : 0,
                balance: Number.isFinite(balance) ? balance : 0,
                description: payload.description ? String(payload.description) : null,
                lineItemsJson: JSON.stringify(lineItems),
                attachmentImagePath: imageFile?.filePath ?? null,
                attachmentImageName: imageFile?.fileName ?? null,
                attachmentDocumentPath: documentFile?.filePath ?? null,
                attachmentDocumentName: documentFile?.fileName ?? null,
              };

              repository.addSaleInvoice(invoice);

              if (payload.convertedFromEstimateId) {
                try {
                  repository.markEstimateConverted(payload.convertedFromEstimateId, invoice.invoiceNo);
                } catch (e) {
                  console.error('Failed to mark estimate as converted', e);
                }
              }

              try {
                if (String(invoice.paymentMode).toLowerCase() === 'cash') {
                  repository.addCashInHandTransaction({
                    id: 'cash_' + invoice.id,
                    date: invoice.date,
                    name: invoice.partyName || 'Cash Sale',
                    type: 'POS Sale',
                    amount: invoice.amount
                  });
                } else if (String(invoice.paymentMode).toLowerCase() === 'credit' && invoice.partyId) {
                  const allParties = repository.getParties();
                  const party = allParties.find((p: any) => String(p.id) === String(invoice.partyId));
                  if (party) {
                    party.balance = Number(party.balance || 0) + Number(invoice.balance || 0);
                    repository.upsertParty(party);
                  }

                  const receivedAmount = Number(invoice.amount || 0) - Number(invoice.balance || 0);
                  if (receivedAmount > 0) {
                    repository.addCashInHandTransaction({
                      id: 'cash_' + invoice.id + '_received',
                      date: invoice.date,
                      name: invoice.partyName,
                      type: 'POS Sale',
                      amount: receivedAmount
                    });
                  }
                }
              } catch (txError) {
                console.error("Failed to update cash/credit balance:", txError);
              }

              try {
                const allItems = repository.getItems();
                for (const lineItem of lineItems) {
                  if (!lineItem.itemId || !lineItem.quantity) continue;
                  const dbItem = allItems.find((i: any) => i.id === lineItem.itemId);
                  if (!dbItem) continue;

                  const isSecondary = lineItem.unit === dbItem.secondary_unit;
                  repository.deductItemStock(
                    lineItem.itemId,
                    lineItem.quantity,
                    isSecondary,
                    dbItem.conversion_rate
                  );
                }
              } catch (stockError) {
                console.error("Failed to deduct stock:", stockError);
              }

              res.statusCode = 201;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(invoice));
            } catch (error) {
              if (createdImagePath) {
                removeManagedAttachmentFile(createdImagePath);
              }

              if (createdDocumentPath) {
                removeManagedAttachmentFile(createdDocumentPath);
              }

              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ message: 'Invalid JSON payload.' }));
            }
            return;
          }

          if (req.method === 'PUT') {
            let createdImagePath: string | null = null;
            let createdDocumentPath: string | null = null;

            try {
              const pathId = requestUrl.pathname.split('/').filter(Boolean)[0];
              const queryId = requestUrl.searchParams.get('id');
              const id = (pathId || queryId || '').trim();

              if (!id) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'Sale invoice id is required.' }));
                return;
              }

              const existingInvoice = repository.getSaleInvoiceById(id);
              if (!existingInvoice) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'Sale invoice not found.' }));
                return;
              }

              const payload = await parseJsonBody(req);

              const lineItems = Array.isArray(payload.lineItems)
                ? payload.lineItems
                : JSON.parse(existingInvoice.line_items_json ?? '[]');

              const imageFile = payload.imageDataUrl
                ? saveDataUrlToAppData({
                  dataUrl: payload.imageDataUrl,
                  prefix: 'sale_invoice_image',
                  targetRoot: saleAttachmentsRoot,
                })
                : null;
              createdImagePath = imageFile?.filePath ?? null;

              const documentFile = payload.documentDataUrl
                ? saveDataUrlToAppData({
                  dataUrl: payload.documentDataUrl,
                  prefix: 'sale_invoice_document',
                  targetRoot: saleAttachmentsRoot,
                })
                : null;
              createdDocumentPath = documentFile?.filePath ?? null;

              const roundOffFlag = payload.roundOff ?? existingInvoice.round_off;
              const invoice = {
                invoiceNo: String(payload.invoiceNo ?? existingInvoice.invoice_no),
                date: String(payload.date ?? existingInvoice.date),
                partyName: String(payload.partyName ?? existingInvoice.party_name).trim(),
                partyId: payload.partyId ? String(payload.partyId) : existingInvoice.party_id ?? null,
                partyPhone: payload.partyPhone ? String(payload.partyPhone) : existingInvoice.party_phone ?? null,
                transactionType: String(payload.transactionType ?? existingInvoice.transaction_type ?? 'Sale'),
                paymentType: String(payload.paymentType ?? existingInvoice.payment_type ?? 'Credit'),
                paymentMode: String(payload.paymentMode ?? existingInvoice.payment_mode ?? 'credit'),
                subtotal: Number.isFinite(Number(payload.subtotal))
                  ? Number(payload.subtotal)
                  : Number(existingInvoice.subtotal ?? 0),
                discountPercent: Number.isFinite(Number(payload.discountPercent))
                  ? Number(payload.discountPercent)
                  : Number(existingInvoice.discount_percent ?? 0),
                discountAmount: Number.isFinite(Number(payload.discountAmount))
                  ? Number(payload.discountAmount)
                  : Number(existingInvoice.discount_amount ?? 0),
                taxLabel: payload.taxLabel ? String(payload.taxLabel) : existingInvoice.tax_label ?? null,
                taxRate: Number.isFinite(Number(payload.taxRate))
                  ? Number(payload.taxRate)
                  : Number(existingInvoice.tax_rate ?? 0),
                taxAmount: Number.isFinite(Number(payload.taxAmount))
                  ? Number(payload.taxAmount)
                  : Number(existingInvoice.tax_amount ?? 0),
                roundOff: roundOffFlag ? 1 : 0,
                roundOffAmount: Number.isFinite(Number(payload.roundOffAmount))
                  ? Number(payload.roundOffAmount)
                  : Number(existingInvoice.round_off_amount ?? 0),
                amount: Number.isFinite(Number(payload.amount))
                  ? Number(payload.amount)
                  : Number(existingInvoice.amount ?? 0),
                balance: Number.isFinite(Number(payload.balance))
                  ? Number(payload.balance)
                  : Number(existingInvoice.balance ?? 0),
                description: payload.description ? String(payload.description) : existingInvoice.description ?? null,
                lineItemsJson: JSON.stringify(lineItems),
                attachmentImagePath: createdImagePath ?? existingInvoice.attachment_image_path ?? null,
                attachmentImageName: imageFile?.fileName ?? existingInvoice.attachment_image_name ?? null,
                attachmentDocumentPath: createdDocumentPath ?? existingInvoice.attachment_document_path ?? null,
                attachmentDocumentName: documentFile?.fileName ?? existingInvoice.attachment_document_name ?? null,
              };

              repository.updateSaleInvoice(id, invoice);

              if (createdImagePath && existingInvoice.attachment_image_path && existingInvoice.attachment_image_path !== createdImagePath) {
                removeManagedAttachmentFile(existingInvoice.attachment_image_path);
              }

              if (createdDocumentPath && existingInvoice.attachment_document_path && existingInvoice.attachment_document_path !== createdDocumentPath) {
                removeManagedAttachmentFile(existingInvoice.attachment_document_path);
              }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ id, ...invoice }));
            } catch {
              if (createdImagePath) {
                removeManagedAttachmentFile(createdImagePath);
              }

              if (createdDocumentPath) {
                removeManagedAttachmentFile(createdDocumentPath);
              }

              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ message: 'Invalid JSON payload.' }));
            }
            return;
          }

          if (req.method === 'DELETE') {
            const pathId = requestUrl.pathname.split('/').filter(Boolean)[0];
            const queryId = requestUrl.searchParams.get('id');
            const id = (pathId || queryId || '').trim();

            if (!id) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ message: 'Sale invoice id is required.' }));
              return;
            }

            const existingInvoice = repository.getSaleInvoiceById(id);
            if (existingInvoice) {
              try {
                const lineItems = JSON.parse(existingInvoice.line_items_json || '[]');
                const allItems = repository.getItems();
                for (const lineItem of lineItems) {
                  if (!lineItem.itemId || !lineItem.quantity) continue;
                  const dbItem = allItems.find((i: any) => String(i.id) === String(lineItem.itemId));
                  if (!dbItem) continue;

                  const isSecondary = lineItem.unit === dbItem.secondary_unit;
                  repository.deductItemStock(
                    lineItem.itemId,
                    -Number(lineItem.quantity),
                    isSecondary,
                    dbItem.conversion_rate
                  );
                }
              } catch (stockError) {
                console.error('Failed to restore stock:', stockError);
              }

              if (String(existingInvoice.payment_mode).toLowerCase() === 'credit' && existingInvoice.party_id) {
                try {
                  const allParties = repository.getParties();
                  const party = allParties.find((p: any) => String(p.id) === String(existingInvoice.party_id));
                  if (party) {
                    party.balance = Number(party.balance || 0) - Number(existingInvoice.balance || 0);
                    repository.upsertParty(party);
                  }
                } catch (balanceError) {
                  console.error('Failed to restore party balance:', balanceError);
                }
              }

              try {
                if (String(existingInvoice.payment_mode).toLowerCase() === 'cash') {
                  repository.deleteCashInHandTransaction('cash_' + id);
                } else if (String(existingInvoice.payment_mode).toLowerCase() === 'credit') {
                  repository.deleteCashInHandTransaction('cash_' + id + '_received');
                }
              } catch (txError) {
                console.error('Failed to delete cash transaction:', txError);
              }
            }

            const deleted = repository.deleteSaleInvoice(id);
            if (!deleted) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ message: 'Sale invoice not found.' }));
              return;
            }

            try {
              if (existingInvoice?.attachment_image_path) {
                removeManagedAttachmentFile(existingInvoice.attachment_image_path);
              }

              if (existingInvoice?.attachment_document_path) {
                removeManagedAttachmentFile(existingInvoice.attachment_document_path);
              }
            } catch (error) {
              console.error('Failed to remove sale invoice attachments on delete:', error);
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

      server.middlewares.use('/api/purchase_bills', async (req, res) => {
        try {
          // @ts-expect-error Runtime-only Node module used in Vite middleware.
          const repository = await import('./database/sqlite/repository.mjs');
          const requestUrl = new URL(req.url ?? '/', 'http://localhost');

          if (req.method === 'GET') {
            const purchaseBills = repository.getPurchaseBills();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(purchaseBills));
            return;
          }

          if (req.method === 'POST') {
            let createdImagePath: string | null = null;
            let createdDocumentPath: string | null = null;

            try {
              const payload = await parseJsonBody(req);

              if (!payload.partyName || !String(payload.partyName).trim()) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'Party name is required.' }));
                return;
              }

              const lineItems = Array.isArray(payload.lineItems) ? payload.lineItems : [];
              const subtotal = Number(payload.subtotal ?? 0);
              const discountPercent = Number(payload.discountPercent ?? 0);
              const discountAmount = Number(payload.discountAmount ?? 0);
              const taxRate = Number(payload.taxRate ?? 0);
              const taxAmount = Number(payload.taxAmount ?? 0);
              const roundOffAmount = Number(payload.roundOffAmount ?? 0);
              const amount = Number(payload.amount ?? 0);
              const balance = Number(payload.balance ?? 0);

              const imageFile = saveDataUrlToAppData({
                dataUrl: payload.imageDataUrl,
                prefix: 'purchase_bill_image',
                targetRoot: saleAttachmentsRoot,
              });
              createdImagePath = imageFile?.filePath ?? null;

              const documentFile = saveDataUrlToAppData({
                dataUrl: payload.documentDataUrl,
                prefix: 'purchase_bill_document',
                targetRoot: saleAttachmentsRoot,
              });
              createdDocumentPath = documentFile?.filePath ?? null;

              const invoice = {
                id: String(payload.id ?? Date.now().toString()),
                invoiceNo: String(payload.invoiceNo ?? repository.getNextPurchaseBillNo()),
                date: String(payload.date ?? new Date().toLocaleDateString('en-GB')),
                partyName: String(payload.partyName).trim(),
                partyId: payload.partyId ? String(payload.partyId) : null,
                partyPhone: payload.partyPhone ? String(payload.partyPhone) : null,
                transactionType: 'Purchase',
                paymentType: String(payload.paymentType ?? 'Credit'),
                paymentMode: String(payload.paymentMode ?? 'credit'),
                subtotal: Number.isFinite(subtotal) ? subtotal : 0,
                discountPercent: Number.isFinite(discountPercent) ? discountPercent : 0,
                discountAmount: Number.isFinite(discountAmount) ? discountAmount : 0,
                taxLabel: payload.taxLabel ? String(payload.taxLabel) : null,
                taxRate: Number.isFinite(taxRate) ? taxRate : 0,
                taxAmount: Number.isFinite(taxAmount) ? taxAmount : 0,
                roundOff: payload.roundOff ? 1 : 0,
                roundOffAmount: Number.isFinite(roundOffAmount) ? roundOffAmount : 0,
                amount: Number.isFinite(amount) ? amount : 0,
                balance: Number.isFinite(balance) ? balance : 0,
                status: balance === 0 ? 'Paid' : 'Unpaid',
                description: payload.description ? String(payload.description) : null,
                lineItemsJson: JSON.stringify(lineItems),
                attachmentImagePath: imageFile?.filePath ?? null,
                attachmentImageName: imageFile?.fileName ?? null,
                attachmentDocumentPath: documentFile?.filePath ?? null,
                attachmentDocumentName: documentFile?.fileName ?? null,
              };

              repository.addPurchaseBill(invoice);

              try {
                const paidAmount = Number(invoice.amount || 0) - Number(invoice.balance || 0);
                if (paidAmount > 0) {
                  if (String(invoice.paymentMode).toLowerCase() === 'cash') {
                    repository.addCashInHandTransaction({
                      id: 'cash_purchase_' + invoice.id,
                      date: invoice.date,
                      name: invoice.partyName || 'Cash Purchase',
                      type: 'POS Purchase',
                      amount: -paidAmount
                    });
                  } else if (String(invoice.paymentMode).toLowerCase() !== 'credit') {
                    repository.addBankAccountTransaction({
                      id: 'bank_purchase_' + invoice.id,
                      date: invoice.date,
                      name: invoice.partyName || 'Bank Purchase',
                      type: 'POS Purchase',
                      amount: -paidAmount,
                      paymentType: invoice.paymentMode
                    });
                  }
                }

                if (invoice.partyId) {
                  const allParties = repository.getParties();
                  const party = allParties.find((p: any) => String(p.id) === String(invoice.partyId));
                  if (party) {
                    party.balance = Number(party.balance || 0) + Number(invoice.balance || 0); // Owe supplier more
                    repository.upsertParty(party);
                  }
                }
              } catch (txError) {
                console.error("Failed to update cash/bank/credit balance for purchase:", txError);
              }

              try {
                const allItems = repository.getItems();
                for (const lineItem of lineItems) {
                  if (!lineItem.itemId || !lineItem.quantity) continue;
                  const dbItem = allItems.find((i: any) => i.id === lineItem.itemId);
                  if (!dbItem) continue;

                  const isSecondary = lineItem.unit === dbItem.secondary_unit;
                  repository.deductItemStock(
                    lineItem.itemId,
                    -lineItem.quantity,
                    isSecondary,
                    dbItem.conversion_rate
                  );
                }
              } catch (stockError) {
                console.error("Failed to add stock for purchase:", stockError);
              }

              res.statusCode = 201;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(invoice));
            } catch {
              if (createdImagePath) {
                removeManagedAttachmentFile(createdImagePath);
              }

              if (createdDocumentPath) {
                removeManagedAttachmentFile(createdDocumentPath);
              }

              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ message: 'Invalid JSON payload.' }));
            }
            return;
          }

          if (req.method === 'PUT') {
            let createdImagePath: string | null = null;
            let createdDocumentPath: string | null = null;

            try {
              const pathId = requestUrl.pathname.split('/').filter(Boolean)[0];
              const queryId = requestUrl.searchParams.get('id');
              const id = (pathId || queryId || '').trim();

              if (!id) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'Purchase bill id is required.' }));
                return;
              }

              const existingInvoice = repository.getPurchaseBillById(id);
              if (!existingInvoice) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'Purchase bill not found.' }));
                return;
              }

              const payload = await parseJsonBody(req);

              const lineItems = Array.isArray(payload.lineItems)
                ? payload.lineItems
                : JSON.parse(existingInvoice.line_items_json ?? '[]');

              const imageFile = payload.imageDataUrl
                ? saveDataUrlToAppData({
                  dataUrl: payload.imageDataUrl,
                  prefix: 'purchase_bill_image',
                  targetRoot: saleAttachmentsRoot,
                })
                : null;
              createdImagePath = imageFile?.filePath ?? null;

              const documentFile = payload.documentDataUrl
                ? saveDataUrlToAppData({
                  dataUrl: payload.documentDataUrl,
                  prefix: 'purchase_bill_document',
                  targetRoot: saleAttachmentsRoot,
                })
                : null;
              createdDocumentPath = documentFile?.filePath ?? null;

              const roundOffFlag = payload.roundOff ?? existingInvoice.round_off;
              const resolvedBalance = Number.isFinite(Number(payload.balance))
                ? Number(payload.balance)
                : Number(existingInvoice.balance ?? 0);

              const invoice = {
                invoiceNo: String(payload.invoiceNo ?? existingInvoice.invoice_no),
                date: String(payload.date ?? existingInvoice.date),
                partyName: String(payload.partyName ?? existingInvoice.party_name).trim(),
                partyId: payload.partyId ? String(payload.partyId) : existingInvoice.party_id ?? null,
                partyPhone: payload.partyPhone ? String(payload.partyPhone) : existingInvoice.party_phone ?? null,
                transactionType: String(payload.transactionType ?? existingInvoice.transaction_type ?? 'Purchase'),
                paymentType: String(payload.paymentType ?? existingInvoice.payment_type ?? 'Credit'),
                paymentMode: String(payload.paymentMode ?? existingInvoice.payment_mode ?? 'credit'),
                subtotal: Number.isFinite(Number(payload.subtotal))
                  ? Number(payload.subtotal)
                  : Number(existingInvoice.subtotal ?? 0),
                discountPercent: Number.isFinite(Number(payload.discountPercent))
                  ? Number(payload.discountPercent)
                  : Number(existingInvoice.discount_percent ?? 0),
                discountAmount: Number.isFinite(Number(payload.discountAmount))
                  ? Number(payload.discountAmount)
                  : Number(existingInvoice.discount_amount ?? 0),
                taxLabel: payload.taxLabel ? String(payload.taxLabel) : existingInvoice.tax_label ?? null,
                taxRate: Number.isFinite(Number(payload.taxRate))
                  ? Number(payload.taxRate)
                  : Number(existingInvoice.tax_rate ?? 0),
                taxAmount: Number.isFinite(Number(payload.taxAmount))
                  ? Number(payload.taxAmount)
                  : Number(existingInvoice.tax_amount ?? 0),
                roundOff: roundOffFlag ? 1 : 0,
                roundOffAmount: Number.isFinite(Number(payload.roundOffAmount))
                  ? Number(payload.roundOffAmount)
                  : Number(existingInvoice.round_off_amount ?? 0),
                amount: Number.isFinite(Number(payload.amount))
                  ? Number(payload.amount)
                  : Number(existingInvoice.amount ?? 0),
                balance: resolvedBalance,
                status: resolvedBalance === 0 ? 'Paid' : 'Unpaid',
                description: payload.description ? String(payload.description) : existingInvoice.description ?? null,
                lineItemsJson: JSON.stringify(lineItems),
                attachmentImagePath: createdImagePath ?? existingInvoice.attachment_image_path ?? null,
                attachmentImageName: imageFile?.fileName ?? existingInvoice.attachment_image_name ?? null,
                attachmentDocumentPath: createdDocumentPath ?? existingInvoice.attachment_document_path ?? null,
                attachmentDocumentName: documentFile?.fileName ?? existingInvoice.attachment_document_name ?? null,
              };

              repository.updatePurchaseBill(id, invoice);

              if (createdImagePath && existingInvoice.attachment_image_path && existingInvoice.attachment_image_path !== createdImagePath) {
                removeManagedAttachmentFile(existingInvoice.attachment_image_path);
              }

              if (createdDocumentPath && existingInvoice.attachment_document_path && existingInvoice.attachment_document_path !== createdDocumentPath) {
                removeManagedAttachmentFile(existingInvoice.attachment_document_path);
              }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ id, ...invoice }));
            } catch {
              if (createdImagePath) {
                removeManagedAttachmentFile(createdImagePath);
              }

              if (createdDocumentPath) {
                removeManagedAttachmentFile(createdDocumentPath);
              }

              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ message: 'Invalid JSON payload.' }));
            }
            return;
          }

          if (req.method === 'DELETE') {
            const pathId = requestUrl.pathname.split('/').filter(Boolean)[0];
            const queryId = requestUrl.searchParams.get('id');
            const id = (pathId || queryId || '').trim();

            if (!id) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ message: 'Purchase bill id is required.' }));
              return;
            }

            const existingInvoice = repository.getPurchaseBillById(id);
            if (existingInvoice) {
              try {
                const lineItems = JSON.parse(existingInvoice.line_items_json || '[]');
                const allItems = repository.getItems();
                for (const lineItem of lineItems) {
                  if (!lineItem.itemId || !lineItem.quantity) continue;
                  const dbItem = allItems.find((i: any) => String(i.id) === String(lineItem.itemId));
                  if (!dbItem) continue;

                  const isSecondary = lineItem.unit === dbItem.secondary_unit;
                  repository.deductItemStock(
                    lineItem.itemId,
                    Number(lineItem.quantity),
                    isSecondary,
                    dbItem.conversion_rate
                  );
                }
              } catch (stockError) {
                console.error('Failed to restore stock:', stockError);
              }

              if (existingInvoice.party_id) {
                try {
                  const allParties = repository.getParties();
                  const party = allParties.find((p: any) => String(p.id) === String(existingInvoice.party_id));
                  if (party) {
                    party.balance = Number(party.balance || 0) - Number(existingInvoice.balance || 0);
                    repository.upsertParty(party);
                  }
                } catch (balanceError) {
                  console.error('Failed to restore party balance:', balanceError);
                }
              }

              try {
                const pMode = String(existingInvoice.payment_mode).toLowerCase();
                if (pMode === 'cash') {
                  repository.deleteCashInHandTransaction('cash_purchase_' + id);
                } else if (pMode !== 'credit') {
                  repository.deleteBankAccountTransaction('bank_purchase_' + id);
                }
              } catch (txError) {
                console.error('Failed to delete cash/bank transaction:', txError);
              }
            }

            const deleted = repository.deletePurchaseBill(id);
            if (!deleted) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ message: 'Purchase bill not found.' }));
              return;
            }

            try {
              if (existingInvoice?.attachment_image_path) {
                removeManagedAttachmentFile(existingInvoice.attachment_image_path);
              }

              if (existingInvoice?.attachment_document_path) {
                removeManagedAttachmentFile(existingInvoice.attachment_document_path);
              }
            } catch (error) {
              console.error('Failed to remove purchase bill attachments on delete:', error);
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
      
      server.middlewares.use('/api/recycle_bin/restore', async (req, res) => {
        try {
          // @ts-expect-error Runtime-only Node module used in Vite middleware.
          const repository = await import('./database/sqlite/repository.mjs');
          
          if (req.method === 'POST') {
            const chunks: Buffer[] = [];
            req.on('data', (chunk: Buffer | string) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
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

      server.middlewares.use('/api/recycle_bin/empty', async (req, res) => {
        try {
          // @ts-expect-error Runtime-only Node module used in Vite middleware.
          const repository = await import('./database/sqlite/repository.mjs');
          
          if (req.method === 'DELETE') {
            repository.emptyRecycleBin();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: 'Recycle bin emptied successfully.' }));
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

      server.middlewares.use('/api/cash_transactions', async (req, res) => {
        try {
          // @ts-expect-error Runtime-only Node module used in Vite middleware.
          const repository = await import('./database/sqlite/repository.mjs');
          const requestUrl = new URL(req.url ?? '/', 'http://localhost');

          if (req.method === 'GET') {
            const cashInHand = repository.getCashInHandTransactions();
            const fromTransactions = repository.getCashTransactionsFromTransactions();
            const allMerged = [...cashInHand, ...fromTransactions];
            const uniqueMap = new Map();
            allMerged.forEach(tx => uniqueMap.set(tx.id, tx));
            const merged = Array.from(uniqueMap.values()).sort((a, b) => {
              const dateA = new Date(a.created_at).getTime();
              const dateB = new Date(b.created_at).getTime();
              return dateB - dateA; // Descending
            });
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(merged));
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
                  res.end(JSON.stringify({ message: 'Name/description is required.' }));
                  return;
                }

                if (!payload.amount || Number.isNaN(Number(payload.amount))) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ message: 'Valid amount is required.' }));
                  return;
                }

                const entry = {
                  id: payload.id ? String(payload.id) : Date.now().toString(),
                  date: String(payload.date || new Date().toLocaleDateString('en-GB')),
                  name: String(payload.name).trim(),
                  type: String(payload.type).trim(),
                  amount: Number(payload.amount),
                };

                repository.addCashInHandTransaction(entry);
                res.statusCode = 201;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(entry));
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
              res.end(JSON.stringify({ message: 'Transaction id is required.' }));
              return;
            }

            const deleted = repository.deleteCashInHandTransaction(id);
            if (!deleted) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ message: 'Transaction not found or it is a system transaction.' }));
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
