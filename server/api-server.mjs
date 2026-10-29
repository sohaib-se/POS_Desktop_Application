import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function registerApiRoutes(middlewares, customAppDataRoot) {
  const server = { middlewares };
  const appDataRoot = customAppDataRoot || process.env.POS_APPDATA_DIR || path.join(process.cwd(), "app_data");
  const itemsImagesRoot = path.join(appDataRoot, "items_images");
  const saleAttachmentsRoot = path.join(appDataRoot, "sale_attachments");
  const purchaseAttachmentsRoot = path.join(appDataRoot, "purchase_attachments");
  const estimateAttachmentsRoot = path.join(appDataRoot, "estimate_attachments");
  const paymentInAttachmentsRoot = path.join(appDataRoot, "paymentin_attachments");
  const paymentOutAttachmentsRoot = path.join(appDataRoot, "paymentout_attachments");
  const bankAccountAttachmentsRoot = path.join(appDataRoot, "bank_account_attachments");
  const expenseAttachmentsRoot = path.join(appDataRoot, "expense_attachments");
  const resolveManagedImagePath = (rawPath) => {
    if (!rawPath || typeof rawPath !== "string") {
      return null;
    }
    const trimmedPath = rawPath.trim();
    if (!trimmedPath.startsWith("/app_data/items_images/")) {
      return null;
    }
    const relativePath = trimmedPath.replace(/^\/app_data\//, "");
    const absolutePath = path.join(appDataRoot, relativePath);
    if (!absolutePath.startsWith(itemsImagesRoot)) {
      return null;
    }
    return absolutePath;
  };
  const resolveManagedAttachmentPath = (rawPath) => {
    if (!rawPath || typeof rawPath !== "string") {
      return null;
    }
    const trimmedPath = rawPath.trim();
    if (!trimmedPath.startsWith("/app_data/sale_attachments/")) {
      return null;
    }
    const relativePath = trimmedPath.replace(/^\/app_data\//, "");
    const absolutePath = path.join(appDataRoot, relativePath);
    if (!absolutePath.startsWith(saleAttachmentsRoot)) {
      return null;
    }
    return absolutePath;
  };
  const removeManagedImageFile = (rawPath) => {
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
  const removeManagedAttachmentFile = (rawPath) => {
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
  const resolveManagedPurchaseAttachmentPath = (rawPath) => {
    if (!rawPath || typeof rawPath !== "string") {
      return null;
    }
    const trimmedPath = rawPath.trim();
    if (!trimmedPath.startsWith("/app_data/purchase_attachments/")) {
      return null;
    }
    const relativePath = trimmedPath.replace(/^\/app_data\//, "");
    const absolutePath = path.join(appDataRoot, relativePath);
    if (!absolutePath.startsWith(purchaseAttachmentsRoot)) {
      return null;
    }
    return absolutePath;
  };
  const removeManagedPurchaseAttachmentFile = (rawPath) => {
    const absolutePath = resolveManagedPurchaseAttachmentPath(rawPath);
    if (!absolutePath || !fs.existsSync(absolutePath)) {
      return;
    }
    const stats = fs.statSync(absolutePath);
    if (!stats.isFile()) {
      return;
    }
    fs.unlinkSync(absolutePath);
  };
  const resolveManagedEstimateAttachmentPath = (rawPath) => {
    if (!rawPath || typeof rawPath !== "string") {
      return null;
    }
    const trimmedPath = rawPath.trim();
    if (!trimmedPath.startsWith("/app_data/estimate_attachments/")) {
      return null;
    }
    const relativePath = trimmedPath.replace(/^\/app_data\//, "");
    const absolutePath = path.join(appDataRoot, relativePath);
    if (!absolutePath.startsWith(estimateAttachmentsRoot)) {
      return null;
    }
    return absolutePath;
  };
  const removeManagedEstimateAttachmentFile = (rawPath) => {
    const absolutePath = resolveManagedEstimateAttachmentPath(rawPath);
    if (!absolutePath || !fs.existsSync(absolutePath)) {
      return;
    }
    const stats = fs.statSync(absolutePath);
    if (!stats.isFile()) {
      return;
    }
    fs.unlinkSync(absolutePath);
  };
  const resolveManagedPaymentInAttachmentPath = (rawPath) => {
    if (!rawPath || typeof rawPath !== "string") {
      return null;
    }
    const trimmedPath = rawPath.trim();
    if (!trimmedPath.startsWith("/app_data/paymentin_attachments/")) {
      return null;
    }
    const relativePath = trimmedPath.replace(/^\/app_data\//, "");
    const absolutePath = path.join(appDataRoot, relativePath);
    if (!absolutePath.startsWith(paymentInAttachmentsRoot)) {
      return null;
    }
    return absolutePath;
  };
  const removeManagedPaymentInAttachmentFile = (rawPath) => {
    const absolutePath = resolveManagedPaymentInAttachmentPath(rawPath);
    if (!absolutePath || !fs.existsSync(absolutePath)) {
      return;
    }
    const stats = fs.statSync(absolutePath);
    if (!stats.isFile()) {
      return;
    }
    fs.unlinkSync(absolutePath);
  };
  const resolveManagedPaymentOutAttachmentPath = (rawPath) => {
    if (!rawPath || typeof rawPath !== "string") {
      return null;
    }
    const trimmedPath = rawPath.trim();
    if (!trimmedPath.startsWith("/app_data/paymentout_attachments/")) {
      return null;
    }
    const relativePath = trimmedPath.replace(/^\/app_data\//, "");
    const absolutePath = path.join(appDataRoot, relativePath);
    if (!absolutePath.startsWith(paymentOutAttachmentsRoot)) {
      return null;
    }
    return absolutePath;
  };
  const removeManagedPaymentOutAttachmentFile = (rawPath) => {
    const absolutePath = resolveManagedPaymentOutAttachmentPath(rawPath);
    if (!absolutePath || !fs.existsSync(absolutePath)) {
      return;
    }
    const stats = fs.statSync(absolutePath);
    if (!stats.isFile()) {
      return;
    }
    fs.unlinkSync(absolutePath);
  };
  const resolveManagedBankAccountAttachmentPath = (rawPath) => {
    if (!rawPath || typeof rawPath !== "string") {
      return null;
    }
    const trimmedPath = rawPath.trim();
    if (!trimmedPath.startsWith("/app_data/bank_account_attachments/")) {
      return null;
    }
    const relativePath = trimmedPath.replace(/^\/app_data\//, "");
    const absolutePath = path.join(appDataRoot, relativePath);
    if (!absolutePath.startsWith(bankAccountAttachmentsRoot)) {
      return null;
    }
    return absolutePath;
  };
  const removeManagedBankAccountAttachmentFile = (rawPath) => {
    const absolutePath = resolveManagedBankAccountAttachmentPath(rawPath);
    if (!absolutePath || !fs.existsSync(absolutePath)) {
      return;
    }
    const stats = fs.statSync(absolutePath);
    if (!stats.isFile()) {
      return;
    }
    fs.unlinkSync(absolutePath);
  };
  const removeManagedExpenseAttachmentFile = (rawPath) => {
    if (!rawPath || typeof rawPath !== "string") return;
    const trimmedPath = rawPath.trim();
    if (!trimmedPath.startsWith("/app_data/")) return;
    const relativePath = trimmedPath.replace(/^\/app_data\//, "");
    const absolutePath = path.join(appDataRoot, relativePath);
    if (!absolutePath.startsWith(appDataRoot) || !fs.existsSync(absolutePath)) {
      return;
    }
    const stats = fs.statSync(absolutePath);
    if (!stats.isFile()) {
      return;
    }
    fs.unlinkSync(absolutePath);
  };
  const parseJsonBody = (req) => new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
  const saveDataUrlToAppData = ({
    dataUrl,
    prefix,
    targetRoot
  }) => {
    if (!dataUrl || typeof dataUrl !== "string") {
      return null;
    }
    const matchedDataUrl = dataUrl.match(/^data:([\w.+-]+\/[\w.+-]+);base64,(.+)$/);
    if (!matchedDataUrl) {
      throw new Error("Invalid file format.");
    }
    const mimeType = matchedDataUrl[1];
    const base64Payload = matchedDataUrl[2];
    const extensionByMimeType = {
      "image/png": ".png",
      "image/jpeg": ".jpg",
      "image/jpg": ".jpg",
      "image/webp": ".webp",
      "image/gif": ".gif",
      "application/pdf": ".pdf",
      "text/plain": ".txt",
      "application/msword": ".doc",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
      "application/vnd.ms-excel": ".xls",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx"
    };
    const fileName = `${prefix}_${Date.now()}${extensionByMimeType[mimeType] ?? ".bin"}`;
    const absolutePath = path.join(targetRoot, fileName);
    fs.mkdirSync(targetRoot, { recursive: true });
    fs.writeFileSync(absolutePath, Buffer.from(base64Payload, "base64"));
    return {
      fileName,
      filePath: `/app_data/${path.basename(targetRoot)}/${fileName}`
    };
  };
  server.middlewares.use("/app_data", (req, res, next) => {
    const requestPath = decodeURIComponent((req.url ?? "/").split("?")[0]);
    const normalizedPath = path.normalize(requestPath).replace(/^([.][.][\\/])+/, "");
    const targetPath = path.join(appDataRoot, normalizedPath);
    if (!targetPath.startsWith(appDataRoot)) {
      res.statusCode = 403;
      res.end("Forbidden");
      return;
    }
    if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isFile()) {
      next();
      return;
    }
    const extension = path.extname(targetPath).toLowerCase();
    const contentTypes = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".webp": "image/webp"
    };
    res.statusCode = 200;
    res.setHeader("Content-Type", contentTypes[extension] ?? "application/octet-stream");
    fs.createReadStream(targetPath).pipe(res);
  });
  void import("../database/sqlite/client.mjs").then((client) => {
    const db = client.openDatabase();
    db.close();
  }).catch((error) => {
    console.error(error);
  });
  server.middlewares.use("/api/passcode", async (req, res) => {
    try {
      const repository = await import("../database/sqlite/repository.mjs");
      const requestUrl = new URL(req.url ?? "/", "http://localhost");
      const pathName = requestUrl.pathname.replace(/\/$/, "");
      if (req.method === "GET" && pathName === "/status") {
        const passcodeRow = repository.getPasscode();
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({
          isSet: !!passcodeRow?.code,
          hasRecovery: !!(passcodeRow?.recovery_email || passcodeRow?.recovery_phone),
          hasEmail: !!passcodeRow?.recovery_email,
          hasPhone: !!passcodeRow?.recovery_phone
        }));
        return;
      }
      if (req.method === "DELETE" && (pathName === "" || pathName === "/")) {
        repository.deletePasscode();
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ success: true }));
        return;
      }
      if (req.method === "POST") {
        const payload = await parseJsonBody(req);
        const current = repository.getPasscode();
        if (pathName === "/setup") {
          if (current?.code && current.code !== payload.oldPasscode) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: false, message: "Invalid old passcode." }));
            return;
          }
          repository.setPasscode(payload.newPasscode, payload.email ?? current?.recovery_email, payload.phone ?? current?.recovery_phone);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ success: true }));
          return;
        }
        if (pathName === "/reset") {
          if (!current) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: false, message: "Passcode not set." }));
            return;
          }
          if (payload.method === "email" && current.recovery_email === payload.value || payload.method === "phone" && current.recovery_phone === payload.value) {
            repository.setPasscode(payload.newPasscode, current.recovery_email, current.recovery_phone);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: true }));
            return;
          } else {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: false, message: "Invalid recovery information." }));
            return;
          }
        }
        if (pathName === "/recovery/update") {
          repository.setPasscode(current?.code, payload.email, payload.phone);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ success: true }));
          return;
        }
        if (pathName === "/recovery/verify") {
          if (payload.method === "email" && current?.recovery_email === payload.value || payload.method === "phone" && current?.recovery_phone === payload.value) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: true }));
            return;
          } else {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: false, message: "Invalid recovery details." }));
            return;
          }
        }
        if (pathName === "/verify") {
          if (current?.code && current.code === payload.passcode) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: true }));
            return;
          } else {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: false, message: "Invalid passcode." }));
            return;
          }
        }
      }
      res.statusCode = 404;
      res.end(JSON.stringify({ message: "Not found" }));
    } catch (error) {
      console.error("/api/passcode error:", error);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Internal server error." }));
    }
  });
  server.middlewares.use("/api/user_profile", async (req, res) => {
    try {
      const repository = await import("../database/sqlite/repository.mjs");
      if (req.method === "GET") {
        const profile = repository.getUserProfile();
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(profile || {}));
        return;
      }
      if (req.method === "PUT") {
        const payload = await parseJsonBody(req);
        const currentProfile = repository.getUserProfile() || {};
        let logoPath = payload.logo;
        if (logoPath && logoPath.startsWith("data:image")) {
          if (currentProfile.logo) {
            try {
              const oldLogoPath = path.join(process.cwd(), currentProfile.logo.startsWith("/") ? currentProfile.logo.substring(1) : currentProfile.logo);
              if (fs.existsSync(oldLogoPath)) {
                fs.unlinkSync(oldLogoPath);
              }
            } catch (e) {
              console.error("Error deleting old logo", e);
            }
          }
          const saved = saveDataUrlToAppData({
            dataUrl: logoPath,
            prefix: "logo",
            targetRoot: path.join(appDataRoot, "user_images")
          });
          logoPath = saved?.filePath;
        }
        let signaturePath = payload.signature;
        if (signaturePath && signaturePath.startsWith("data:image")) {
          if (currentProfile.signature) {
            try {
              const oldSignaturePath = path.join(process.cwd(), currentProfile.signature.startsWith("/") ? currentProfile.signature.substring(1) : currentProfile.signature);
              if (fs.existsSync(oldSignaturePath)) {
                fs.unlinkSync(oldSignaturePath);
              }
            } catch (e) {
              console.error("Error deleting old signature", e);
            }
          }
          const saved = saveDataUrlToAppData({
            dataUrl: signaturePath,
            prefix: "signature",
            targetRoot: path.join(appDataRoot, "user_images")
          });
          signaturePath = saved?.filePath;
        }
        const updatedPayload = {
          businessName: payload.businessName !== void 0 ? payload.businessName : currentProfile.business_name,
          phone: payload.phone !== void 0 ? payload.phone : currentProfile.phone,
          email: payload.email !== void 0 ? payload.email : currentProfile.email,
          address: payload.address !== void 0 ? payload.address : currentProfile.address,
          businessType: payload.businessType !== void 0 ? payload.businessType : currentProfile.business_type,
          category: payload.category !== void 0 ? payload.category : currentProfile.category,
          pincode: payload.pincode !== void 0 ? payload.pincode : currentProfile.pincode,
          logo: logoPath !== void 0 ? logoPath : currentProfile.logo,
          signature: signaturePath !== void 0 ? signaturePath : currentProfile.signature,
          termsConditions: payload.termsConditions !== void 0 ? payload.termsConditions : currentProfile.terms_conditions
        };
        repository.updateUserProfile(updatedPayload);
        const updatedProfile = repository.getUserProfile();
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(updatedProfile));
        return;
      }
      res.statusCode = 405;
      res.end("Method Not Allowed");
    } catch (error) {
      console.error(error);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Internal server error." }));
    }
  });
  server.middlewares.use("/api/delete_profile_image", async (req, res) => {
    if (req.method !== "DELETE") {
      res.statusCode = 405;
      res.end("Method Not Allowed");
      return;
    }
    try {
      const repository = await import("../database/sqlite/repository.mjs");
      const payload = await parseJsonBody(req);
      const field = payload?.field;
      if (field !== "logo" && field !== "signature") {
        res.statusCode = 400;
        res.end(JSON.stringify({ message: 'field must be "logo" or "signature"' }));
        return;
      }
      const currentProfile = repository.getUserProfile() || {};
      const storedPath = currentProfile[field] || null;
      if (storedPath) {
        try {
          const relativePath = storedPath.startsWith("/") ? storedPath.substring(1) : storedPath;
          const absolutePath = path.join(process.cwd(), relativePath);
          const userImagesRoot = path.join(process.cwd(), "app_data", "user_images");
          if (absolutePath.startsWith(userImagesRoot) && fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
          }
        } catch (e) {
          console.error(`Error deleting ${field} file:`, e);
        }
      }
      repository.clearUserProfileImage(field);
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ success: true }));
    } catch (error) {
      console.error(error);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Internal server error." }));
    }
  });
  server.middlewares.use("/api/adjust_stock_transactions", async (req, res) => {
    try {
      const repository = await import("../database/sqlite/repository.mjs");
      const requestUrl = new URL(req.url ?? "/", "http://localhost");
      const checkConsumedId = requestUrl.searchParams.get("checkConsumed") || requestUrl.searchParams.get("check_consumed");
      const urlParts = requestUrl.pathname.split("/").filter(Boolean);
      const id = requestUrl.searchParams.get("id") || (urlParts.length > 0 ? urlParts[0] : null);
      if (req.method === "GET") {
        if (checkConsumedId) {
          const consumed = repository.isStockAdjustmentConsumed(checkConsumedId);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ consumed }));
          return;
        }
        const adjustments = repository.getStockAdjustments();
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(adjustments));
        return;
      }
      if (req.method === "POST") {
        const payload = await parseJsonBody(req);
        const newId = repository.addStockAdjustment(payload);
        let updatedItem = null;
        if (payload.adjustmentType === "Reduce Stock" && payload.itemId && payload.quantity) {
          try {
            const allItems = repository.getItems();
            const dbItem = allItems.find((i) => String(i.id) === String(payload.itemId));
            if (dbItem) {
              const isSecondary = payload.unit === dbItem.secondary_unit;
              repository.deductItemStockFifo(
                payload.itemId,
                Number(payload.quantity),
                isSecondary,
                dbItem.conversion_rate
              );
              const refreshedItems = repository.getItems();
              updatedItem = refreshedItems.find((i) => String(i.id) === String(payload.itemId)) ?? null;
            }
          } catch (fifoErr) {
            console.error("[Reduce Stock] FIFO deduction failed:", fifoErr);
          }
        }
        res.statusCode = 201;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ ...payload, id: newId, updatedItem }));
        return;
      }
      if (req.method === "PUT" && id) {
        if (repository.isStockAdjustmentConsumed(id)) {
          res.statusCode = 409;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({
            message: "STOCK_CONSUMED",
            detail: "Sales have already been made from this stock adjustment (remaining stock and stock quantity are not equal). You cannot edit this transaction."
          }));
          return;
        }
        const payload = await parseJsonBody(req);
        repository.updateStockAdjustment(id, payload);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ ...payload, id }));
        return;
      }
      if (req.method === "DELETE" && id) {
        if (repository.isStockAdjustmentConsumed(id)) {
          res.statusCode = 409;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({
            message: "STOCK_CONSUMED",
            detail: "Sales have already been made from this stock adjustment (remaining stock and stock quantity are not equal). You cannot delete this transaction."
          }));
          return;
        }
        const existingAdjustment = repository.getStockAdjustmentById(id);
        let updatedItem = null;
        if (existingAdjustment && existingAdjustment.adjustment_type === "Reduce Stock") {
          try {
            const allItems = repository.getItems();
            const dbItem = allItems.find((i) => String(i.id) === String(existingAdjustment.item_id));
            if (dbItem) {
              const isSecondary = existingAdjustment.unit === dbItem.secondary_unit;
              repository.restoreItemStockFifo(
                existingAdjustment.item_id,
                Number(existingAdjustment.quantity),
                isSecondary,
                dbItem.conversion_rate
              );
              const refreshedItems = repository.getItems();
              updatedItem = refreshedItems.find((i) => String(i.id) === String(existingAdjustment.item_id)) ?? null;
            }
          } catch (fifoErr) {
            console.error("[Delete Reduce Stock] FIFO restore failed:", fifoErr);
          }
        }
        repository.deleteStockAdjustment(id);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ id, updatedItem }));
        return;
      }
      res.statusCode = 405;
      res.end("Method Not Allowed");
    } catch (error) {
      console.error(error);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Internal server error." }));
    }
  });
  server.middlewares.use("/api/bank_accounts", async (req, res) => {
    try {
      const repository = await import("../database/sqlite/repository.mjs");
      const requestUrl = new URL(req.url ?? "/", "http://localhost");
      if (req.method === "GET") {
        const accounts = repository.getBankAccounts();
        const withTransactions = accounts.map((acc) => ({
          ...acc,
          transactions: repository.getBankAccountTransactions(acc.name)
        }));
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(withTransactions));
        return;
      }
      if (req.method === "POST") {
        const chunks = [];
        req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        req.on("end", () => {
          try {
            const raw = Buffer.concat(chunks).toString("utf8");
            const payload = raw ? JSON.parse(raw) : {};
            if (!payload.name || !String(payload.name).trim()) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ message: "Account name is required." }));
              return;
            }
            const id = repository.addBankAccount(payload);
            res.statusCode = 201;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ...payload, id }));
          } catch {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ message: "Invalid JSON payload." }));
          }
        });
        return;
      }
      if (req.method === "PUT") {
        const pathSegments = requestUrl.pathname.split("/").filter(Boolean);
        const id = requestUrl.searchParams.get("id") || pathSegments[0];
        const chunks = [];
        req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        req.on("end", () => {
          try {
            const raw = Buffer.concat(chunks).toString("utf8");
            const payload = raw ? JSON.parse(raw) : {};
            repository.updateBankAccount(id, payload);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ...payload, id }));
          } catch {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ message: "Invalid JSON payload." }));
          }
        });
        return;
      }
      if (req.method === "DELETE") {
        const pathSegments = requestUrl.pathname.split("/").filter(Boolean);
        const id = requestUrl.searchParams.get("id") || pathSegments[0];
        if (!id) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "ID is required." }));
          return;
        }
        repository.deleteBankAccount(id);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ success: true }));
        return;
      }
      res.statusCode = 405;
      res.end();
    } catch (error) {
      console.error(error);
      res.statusCode = 500;
      res.end(JSON.stringify({ message: "Internal Server Error" }));
    }
  });
  server.middlewares.use("/api/bank_account_transactions", async (req, res) => {
    try {
      const repository = await import("../database/sqlite/repository.mjs");
      if (req.method === "POST") {
        const payload = await parseJsonBody(req);
        if (payload.imageDataUrl && payload.imageDataUrl.startsWith("data:")) {
          const imageFile = saveDataUrlToAppData({
            dataUrl: payload.imageDataUrl,
            prefix: "bank_account_attachment",
            targetRoot: bankAccountAttachmentsRoot
          });
          if (imageFile) {
            payload.attachmentImagePath = imageFile.filePath;
          }
        } else if (payload.imageDataUrl === "") {
          payload.attachmentImagePath = null;
        }
        delete payload.imageDataUrl;
        repository.addBankAccountTransaction(payload);
        res.statusCode = 201;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ success: true }));
        return;
      }
      if (req.method === "PUT") {
        const requestUrl = new URL(req.url ?? "/", "http://localhost");
        const id = requestUrl.pathname.split("/").filter(Boolean)[0] || requestUrl.searchParams.get("id");
        const payload = await parseJsonBody(req);
        if (payload.imageDataUrl && payload.imageDataUrl.startsWith("data:")) {
          const imageFile = saveDataUrlToAppData({
            dataUrl: payload.imageDataUrl,
            prefix: "bank_account_attachment",
            targetRoot: bankAccountAttachmentsRoot
          });
          if (imageFile) {
            payload.attachmentImagePath = imageFile.filePath;
          }
        } else if (payload.imageDataUrl === "") {
          payload.attachmentImagePath = null;
        }
        delete payload.imageDataUrl;
        repository.updateBankAccountTransaction(id, payload);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ success: true }));
        return;
      }
      if (req.method === "DELETE") {
        const requestUrl = new URL(req.url ?? "/", "http://localhost");
        const id = requestUrl.pathname.split("/").filter(Boolean)[0] || requestUrl.searchParams.get("id");
        if (repository.getBankAccountTransactionById) {
          const tx = repository.getBankAccountTransactionById(id);
          if (tx && tx.attachment_image_path) {
            removeManagedBankAccountAttachmentFile(tx.attachment_image_path);
          }
        }
        if (String(id).startsWith("bank_pos_")) {
          const saleInvoiceId = String(id).replace("bank_pos_", "");
          try {
            const saleInvoice = repository.getSaleInvoiceById(saleInvoiceId);
            if (saleInvoice && !String(saleInvoice.transaction_type || "").includes("Returned")) {
              try {
                const lineItems = JSON.parse(saleInvoice.line_items_json || "[]");
                const allItems = repository.getItems();
                for (const lineItem of lineItems) {
                  if (!lineItem.itemId || !lineItem.quantity) continue;
                  const dbItem = allItems.find((i) => String(i.id) === String(lineItem.itemId));
                  if (!dbItem) continue;
                  const isSecondary = lineItem.unit === dbItem.secondary_unit;
                  repository.restoreItemStockFifo(lineItem.itemId, Number(lineItem.quantity), isSecondary, dbItem.conversion_rate);
                }
              } catch (stockErr) {
                console.error("[BankTx Delete] Failed to restore stock:", stockErr);
              }
              if (String(saleInvoice.payment_mode || "").toLowerCase() === "credit" && saleInvoice.party_id) {
                try {
                  const allParties = repository.getParties();
                  const party = allParties.find((p) => String(p.id) === String(saleInvoice.party_id));
                  if (party) {
                    party.balance = Number(party.balance || 0) - Number(saleInvoice.balance || 0);
                    repository.upsertParty(party);
                  }
                } catch (balanceErr) {
                  console.error("[BankTx Delete] Failed to restore party balance:", balanceErr);
                }
              }
              try {
                repository.deleteCashInHandTransactionsForSale(saleInvoiceId);
              } catch (e) {
              }
              try {
                repository.deleteSaleInvoice(saleInvoiceId);
              } catch (e) {
                console.error("[BankTx Delete] Failed to delete sale invoice:", e);
              }
            }
          } catch (cascadeErr) {
            console.error("[BankTx Delete] Cascade sale invoice cleanup failed:", cascadeErr);
          }
        }
        if (String(id).startsWith("bank_purchase_")) {
          const purchaseId = String(id).replace("bank_purchase_", "");
          try {
            const existingInvoice = repository.getPurchaseBillById(purchaseId);
            if (existingInvoice) {
              try {
                const lineItems = JSON.parse(existingInvoice.line_items_json || "[]");
                const allItems = repository.getItems();
                for (let i = 0; i < lineItems.length; i++) {
                  const lineItem = lineItems[i];
                  if (!lineItem.itemId || !lineItem.quantity) continue;
                  const dbItem = allItems.find((item) => String(item.id) === String(lineItem.itemId));
                  if (!dbItem) continue;
                  const isSecondary = lineItem.unit === dbItem.secondary_unit;
                  const lineItemId = lineItem.id || `line_${i}`;
                  repository.removePurchaseStock(
                    lineItem.itemId,
                    Number(lineItem.quantity),
                    isSecondary,
                    dbItem.conversion_rate,
                    lineItem.price ?? 0,
                    purchaseId,
                    lineItemId
                  );
                }
              } catch (stockErr) {
                console.error("[BankTx Delete] Failed to restore purchase stock:", stockErr);
              }
              if (existingInvoice.party_id) {
                try {
                  const allParties = repository.getParties();
                  const party = allParties.find((p) => String(p.id) === String(existingInvoice.party_id));
                  if (party) {
                    party.balance = Number(party.balance || 0) + Number(existingInvoice.balance || 0);
                    repository.upsertParty(party);
                  }
                } catch (balanceErr) {
                  console.error("[BankTx Delete] Failed to restore party balance:", balanceErr);
                }
              }
              try {
                repository.deleteCashInHandTransaction("cash_purchase_" + purchaseId);
              } catch (e) {
              }
              try {
                repository.deletePurchaseBill(purchaseId);
              } catch (e) {
                console.error("[BankTx Delete] Failed to delete purchase bill:", e);
              }
            }
          } catch (cascadeErr) {
            console.error("[BankTx Delete] Cascade purchase bill cleanup failed:", cascadeErr);
          }
        }
        if (String(id).startsWith("bank_expense_")) {
          const expenseId = String(id).replace("bank_expense_", "");
          try {
            repository.deleteExpenseRecord(expenseId);
            try {
              repository.deleteCashInHandTransaction("cash_expense_" + expenseId);
            } catch (e) {
            }
          } catch (cascadeErr) {
            console.error("[BankTx Delete] Cascade expense record cleanup failed:", cascadeErr);
          }
        }
        if (String(id).startsWith("bank_payment_in_")) {
          const paymentInId = String(id).replace("bank_payment_in_", "");
          try {
            const existingRecord = repository.getPaymentInRecordById(paymentInId);
            if (existingRecord) {
              if (existingRecord.party_id) {
                try {
                  const allParties = repository.getParties();
                  const party = allParties.find((p) => String(p.id) === String(existingRecord.party_id));
                  if (party) {
                    party.balance = Number(party.balance || 0) + Number(existingRecord.amount || 0);
                    repository.upsertParty(party);
                  }
                } catch (balanceError) {
                  console.error("[BankTx Delete] Failed to restore party balance:", balanceError);
                }
              }
              if (existingRecord.attachment_image_path || existingRecord.attachmentImagePath) {
                removeManagedPaymentInAttachmentFile(existingRecord.attachment_image_path || existingRecord.attachmentImagePath);
              }
              try {
                repository.deleteCashInHandTransaction("cash_payment_in_" + paymentInId);
              } catch (e) {
              }
              repository.deletePaymentInRecord(paymentInId);
            }
          } catch (cascadeErr) {
            console.error("[BankTx Delete] Cascade payment in record cleanup failed:", cascadeErr);
          }
        }
        if (String(id).startsWith("bank_payment_out_")) {
          const paymentOutId = String(id).replace("bank_payment_out_", "");
          try {
            const existingRecord = repository.getPaymentOutRecordById(paymentOutId);
            if (existingRecord) {
              if (existingRecord.party_id) {
                try {
                  const allParties = repository.getParties();
                  const party = allParties.find((p) => String(p.id) === String(existingRecord.party_id));
                  if (party) {
                    party.balance = Number(party.balance || 0) - Number(existingRecord.amount || 0);
                    repository.upsertParty(party);
                  }
                } catch (balanceError) {
                  console.error("[BankTx Delete] Failed to restore party balance:", balanceError);
                }
              }
              if (existingRecord.attachment_image_path || existingRecord.attachmentImagePath) {
                removeManagedPaymentOutAttachmentFile(existingRecord.attachment_image_path || existingRecord.attachmentImagePath);
              }
              try {
                repository.deleteCashInHandTransaction("cash_payment_out_" + paymentOutId);
              } catch (e) {
              }
              repository.deletePaymentOutRecord(paymentOutId);
            }
          } catch (cascadeErr) {
            console.error("[BankTx Delete] Cascade payment out record cleanup failed:", cascadeErr);
          }
        }
        repository.deleteBankAccountTransaction(id);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ success: true }));
        return;
      }
      res.statusCode = 405;
      res.end("Method Not Allowed");
    } catch (error) {
      console.error(error);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Internal server error." }));
    }
  });
  server.middlewares.use("/api/bank_to_cash_transfer", async (req, res) => {
    try {
      const repository = await import("../database/sqlite/repository.mjs");
      if (req.method === "POST") {
        const payload = await parseJsonBody(req);
        const baseId = Date.now().toString();
        const bankTxId = baseId + "-bank";
        let attachmentImagePath = null;
        if (payload.imageDataUrl && payload.imageDataUrl.startsWith("data:")) {
          const imageFile = saveDataUrlToAppData({
            dataUrl: payload.imageDataUrl,
            prefix: "bank_account_attachment",
            targetRoot: bankAccountAttachmentsRoot
          });
          if (imageFile) attachmentImagePath = imageFile.filePath;
        }
        repository.addBankAccountTransaction({
          id: bankTxId,
          paymentType: payload.fromBank,
          date: payload.date,
          name: payload.description || "Transfer to Cash",
          type: "Payment Out",
          amount: -Number(payload.amount),
          attachmentImagePath
        });
        const cashTxId = baseId + "-cash";
        repository.addCashInHandTransaction({
          id: cashTxId,
          date: payload.date,
          name: `Transfer from ${payload.fromBank}`,
          type: "Increase Cash",
          amount: Number(payload.amount)
        });
        res.statusCode = 201;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ success: true }));
        return;
      }
      res.statusCode = 405;
      res.end("Method Not Allowed");
    } catch (error) {
      console.error(error);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Internal server error." }));
    }
  });
  server.middlewares.use("/api/cash_to_bank_transfer", async (req, res) => {
    try {
      const repository = await import("../database/sqlite/repository.mjs");
      if (req.method === "POST") {
        const payload = await parseJsonBody(req);
        const baseId = Date.now().toString();
        const cashTxId = baseId + "-cash";
        repository.addCashInHandTransaction({
          id: cashTxId,
          date: payload.date,
          name: `Transfer to ${payload.toBank}`,
          type: "Decrease Cash",
          amount: Number(payload.amount)
        });
        const bankTxId = baseId + "-bank";
        let attachmentImagePath = null;
        if (payload.imageDataUrl && payload.imageDataUrl.startsWith("data:")) {
          const imageFile = saveDataUrlToAppData({
            dataUrl: payload.imageDataUrl,
            prefix: "bank_account_attachment",
            targetRoot: bankAccountAttachmentsRoot
          });
          if (imageFile) attachmentImagePath = imageFile.filePath;
        }
        repository.addBankAccountTransaction({
          id: bankTxId,
          paymentType: payload.toBank,
          date: payload.date,
          name: payload.description || "Transfer from Cash",
          type: "Payment In",
          amount: Number(payload.amount),
          attachmentImagePath
        });
        res.statusCode = 201;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ success: true }));
        return;
      }
      res.statusCode = 405;
      res.end("Method Not Allowed");
    } catch (error) {
      console.error(error);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Internal server error." }));
    }
  });
  server.middlewares.use("/api/bank_to_bank_transfer", async (req, res) => {
    try {
      const repository = await import("../database/sqlite/repository.mjs");
      if (req.method === "POST") {
        const payload = await parseJsonBody(req);
        const baseId = Date.now().toString();
        let attachmentImagePath = null;
        if (payload.imageDataUrl && payload.imageDataUrl.startsWith("data:")) {
          const imageFile = saveDataUrlToAppData({
            dataUrl: payload.imageDataUrl,
            prefix: "bank_account_attachment",
            targetRoot: bankAccountAttachmentsRoot
          });
          if (imageFile) attachmentImagePath = imageFile.filePath;
        }
        repository.addBankAccountTransaction({
          id: baseId + "-bank-out",
          paymentType: payload.fromBank,
          date: payload.date,
          name: payload.description || `Transfer to ${payload.toBank}`,
          type: "Payment Out",
          amount: -Number(payload.amount),
          attachmentImagePath
        });
        repository.addBankAccountTransaction({
          id: baseId + "-bank-in",
          paymentType: payload.toBank,
          date: payload.date,
          name: payload.description || `Transfer from ${payload.fromBank}`,
          type: "Payment In",
          amount: Number(payload.amount),
          attachmentImagePath
        });
        res.statusCode = 201;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ success: true }));
        return;
      }
      res.statusCode = 405;
      res.end("Method Not Allowed");
    } catch (error) {
      console.error(error);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Internal server error." }));
    }
  });
  server.middlewares.use("/api/payment_in_records", async (req, res) => {
    try {
      const repository = await import("../database/sqlite/repository.mjs");
      const requestUrl = new URL(req.url ?? "/", "http://localhost");
      if (req.method === "GET") {
        const records = repository.getPaymentInRecords();
        const mapped = records.filter((r) => r.payment_type !== "Receivable Opening Balance").map((r) => ({
          ...r,
          receiptNo: r.receipt_no,
          partyName: r.party_name,
          paymentType: r.payment_type
        }));
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(mapped));
        return;
      }
      if (req.method === "POST") {
        try {
          const payload = await parseJsonBody(req);
          let createdImagePath = null;
          if (payload.imageDataUrl) {
            const imageFile = saveDataUrlToAppData({
              dataUrl: payload.imageDataUrl,
              prefix: "payment_in_image",
              targetRoot: paymentInAttachmentsRoot
            });
            createdImagePath = imageFile?.filePath ?? null;
          }
          const record = {
            id: String(Date.now()),
            receiptNo: payload.receiptNo ?? "",
            date: payload.date ?? (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB"),
            partyName: payload.partyName ?? "Cash Sale",
            partyId: payload.partyId ?? null,
            amount: Number(payload.amount ?? 0),
            paymentType: payload.paymentType ?? "Cash",
            reference: payload.reference ?? null,
            description: payload.description ?? null,
            attachmentImagePath: createdImagePath,
            attachmentImageName: null,
            attachmentDocumentPath: null,
            attachmentDocumentName: null
          };
          repository.addPaymentInRecord(record);
          if (record.partyId) {
            const allParties = repository.getParties();
            const party = allParties.find((p) => String(p.id) === String(record.partyId));
            if (party) {
              party.balance = Number(party.balance || 0) - Number(record.amount || 0);
              repository.upsertParty(party);
            }
          }
          if (String(record.paymentType).toLowerCase() === "cash") {
            repository.addCashInHandTransaction({
              id: "cash_payment_in_" + record.id,
              date: record.date,
              name: record.partyName,
              type: "Payment In",
              amount: record.amount
            });
          } else if (record.paymentType) {
            repository.addBankAccountTransaction({
              id: "bank_payment_in_" + record.id,
              date: record.date,
              name: record.partyName,
              type: "Payment In",
              amount: record.amount,
              paymentType: record.paymentType
            });
          }
          res.statusCode = 201;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(record));
        } catch (error) {
          console.error("POST /api/payment_in_records error:", error);
          res.statusCode = 400;
          res.end(JSON.stringify({ message: "Bad Request" }));
        }
        return;
      }
      if (req.method === "PUT") {
        const segments = requestUrl.pathname.split("/").filter(Boolean);
        const lastSegment = segments.length > 0 ? segments[segments.length - 1] : null;
        const pathId = lastSegment && lastSegment !== "payment_in_records" && lastSegment !== "api" ? lastSegment : null;
        const queryId = requestUrl.searchParams.get("id");
        const id = (queryId || pathId || "").trim();
        if (!id) {
          res.statusCode = 400;
          res.end(JSON.stringify({ message: "ID required" }));
          return;
        }
        try {
          const payload = await parseJsonBody(req);
          const existingRecord = repository.getPaymentInRecordById(id);
          if (!existingRecord) {
            res.statusCode = 404;
            res.end(JSON.stringify({ message: "Record not found" }));
            return;
          }
          let updatedImagePath = existingRecord.attachment_image_path || existingRecord.attachmentImagePath;
          if (payload.imageDataUrl && payload.imageDataUrl !== updatedImagePath && payload.imageDataUrl.startsWith("data:")) {
            if (updatedImagePath) {
              removeManagedPaymentInAttachmentFile(updatedImagePath);
            }
            const imageFile = saveDataUrlToAppData({
              dataUrl: payload.imageDataUrl,
              prefix: "payment_in_image",
              targetRoot: paymentInAttachmentsRoot
            });
            updatedImagePath = imageFile?.filePath ?? null;
          } else if (payload.imageDataUrl === null || payload.imageDataUrl === "") {
            if (updatedImagePath) {
              removeManagedPaymentInAttachmentFile(updatedImagePath);
              updatedImagePath = null;
            }
          }
          if (existingRecord.party_id) {
            try {
              const allParties = repository.getParties();
              const party = allParties.find((p) => String(p.id) === String(existingRecord.party_id));
              if (party) {
                party.balance = Number(party.balance || 0) + Number(existingRecord.amount || 0);
                repository.upsertParty(party);
              }
            } catch (balanceError) {
              console.error("Failed to restore party balance:", balanceError);
            }
          }
          try {
            try {
              repository.deleteCashInHandTransaction("cash_payment_in_" + id);
            } catch (e) {
            }
            try {
              repository.deleteBankAccountTransaction("bank_payment_in_" + id);
            } catch (e) {
            }
          } catch (txError) {
            console.error("Failed to delete cash/bank transaction:", txError);
          }
          const record = {
            id,
            receiptNo: payload.receiptNo ?? existingRecord.receipt_no,
            date: payload.date ?? existingRecord.date,
            partyName: payload.partyName ?? existingRecord.party_name,
            partyId: payload.partyId ?? existingRecord.party_id,
            amount: Number(payload.amount ?? existingRecord.amount),
            paymentType: payload.paymentType ?? existingRecord.payment_type,
            reference: payload.reference ?? existingRecord.reference,
            description: payload.description ?? existingRecord.description,
            attachmentImagePath: updatedImagePath,
            attachmentImageName: existingRecord.attachment_image_name || existingRecord.attachmentImageName,
            attachmentDocumentPath: existingRecord.attachment_document_path || existingRecord.attachmentDocumentPath,
            attachmentDocumentName: existingRecord.attachment_document_name || existingRecord.attachmentDocumentName
          };
          repository.updatePaymentInRecord(record);
          if (record.partyId) {
            const allParties = repository.getParties();
            const party = allParties.find((p) => String(p.id) === String(record.partyId));
            if (party) {
              party.balance = Number(party.balance || 0) - Number(record.amount || 0);
              repository.upsertParty(party);
            }
          }
          if (String(record.paymentType).toLowerCase() === "cash") {
            repository.addCashInHandTransaction({
              id: "cash_payment_in_" + record.id,
              date: record.date,
              name: record.partyName,
              type: "Payment In",
              amount: record.amount
            });
          } else if (record.paymentType) {
            repository.addBankAccountTransaction({
              id: "bank_payment_in_" + record.id,
              date: record.date,
              name: record.partyName,
              type: "Payment In",
              amount: record.amount,
              paymentType: record.paymentType
            });
          }
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(record));
        } catch (error) {
          console.error("PUT /api/payment_in_records error:", error);
          res.statusCode = 400;
          res.end(JSON.stringify({ message: "Bad Request" }));
        }
        return;
      }
      if (req.method === "DELETE") {
        const segments = requestUrl.pathname.split("/").filter(Boolean);
        const lastSegment = segments.length > 0 ? segments[segments.length - 1] : null;
        const pathId = lastSegment && lastSegment !== "payment_in_records" && lastSegment !== "api" ? lastSegment : null;
        const queryId = requestUrl.searchParams.get("id");
        const id = (queryId || pathId || "").trim();
        if (id) {
          const existingRecord = repository.getPaymentInRecordById(id);
          if (existingRecord) {
            if (existingRecord.party_id) {
              try {
                const allParties = repository.getParties();
                const party = allParties.find((p) => String(p.id) === String(existingRecord.party_id));
                if (party) {
                  party.balance = Number(party.balance || 0) + Number(existingRecord.amount || 0);
                  repository.upsertParty(party);
                }
              } catch (balanceError) {
                console.error("Failed to restore party balance:", balanceError);
              }
            }
            try {
              try {
                repository.deleteCashInHandTransaction("cash_payment_in_" + id);
              } catch (e) {
              }
              try {
                repository.deleteBankAccountTransaction("bank_payment_in_" + id);
              } catch (e) {
              }
            } catch (txError) {
              console.error("Failed to delete cash/bank transaction:", txError);
            }
            if (existingRecord.attachment_image_path || existingRecord.attachmentImagePath) {
              removeManagedPaymentInAttachmentFile(existingRecord.attachment_image_path || existingRecord.attachmentImagePath);
            }
          }
          repository.deletePaymentInRecord(id);
          res.statusCode = 204;
          res.end();
        } else {
          res.statusCode = 400;
          res.end(JSON.stringify({ message: "ID required" }));
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
  server.middlewares.use("/api/payment_out_records", async (req, res) => {
    try {
      const repository = await import("../database/sqlite/repository.mjs");
      const requestUrl = new URL(req.url ?? "/", "http://localhost");
      if (req.method === "GET") {
        const records = repository.getPaymentOutRecordsReal();
        const mapped = records.filter((r) => r.payment_type !== "Payable Opening Balance").map((r) => ({
          ...r,
          paymentNo: r.payment_no,
          partyName: r.party_name,
          paymentType: r.payment_type
        }));
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(mapped));
        return;
      }
      if (req.method === "POST") {
        try {
          const payload = await parseJsonBody(req);
          let createdImagePath = null;
          if (payload.imageDataUrl) {
            const imageFile = saveDataUrlToAppData({
              dataUrl: payload.imageDataUrl,
              prefix: "payment_out_image",
              targetRoot: paymentOutAttachmentsRoot
            });
            createdImagePath = imageFile?.filePath ?? null;
          }
          const record = {
            id: String(Date.now()),
            paymentNo: payload.paymentNo ?? "",
            date: payload.date ?? (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB"),
            partyName: payload.partyName ?? "Cash Purchase",
            partyId: payload.partyId ? String(payload.partyId) : null,
            amount: Number(payload.amount ?? 0),
            paymentType: payload.paymentType ?? "Cash",
            reference: payload.reference ?? null,
            description: payload.description ?? null,
            attachmentImagePath: createdImagePath
          };
          repository.addPaymentOutRecord(record);
          if (payload.partyId) {
            const allParties = repository.getParties();
            const party = allParties.find((p) => String(p.id) === String(payload.partyId));
            if (party) {
              party.balance = Number(party.balance || 0) + Number(record.amount || 0);
              repository.upsertParty(party);
            }
          }
          if (String(record.paymentType).toLowerCase() === "cash") {
            repository.addCashInHandTransaction({
              id: "cash_payment_out_" + record.id,
              date: record.date,
              name: record.partyName,
              type: "Payment Out",
              amount: -record.amount
            });
          } else if (record.paymentType) {
            repository.addBankAccountTransaction({
              id: "bank_payment_out_" + record.id,
              date: record.date,
              name: record.partyName,
              type: "Payment Out",
              amount: -record.amount,
              paymentType: record.paymentType
            });
          }
          res.statusCode = 201;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(record));
        } catch (error) {
          console.error("POST /api/payment_out_records error:", error);
          res.statusCode = 400;
          res.end(JSON.stringify({ message: "Bad Request" }));
        }
        return;
      }
      if (req.method === "PUT") {
        const segments = requestUrl.pathname.split("/").filter(Boolean);
        const lastSegment = segments.length > 0 ? segments[segments.length - 1] : null;
        const pathId = lastSegment && lastSegment !== "payment_out_records" && lastSegment !== "api" ? lastSegment : null;
        const queryId = requestUrl.searchParams.get("id");
        const id = (queryId || pathId || "").trim();
        if (!id) {
          res.statusCode = 400;
          res.end(JSON.stringify({ message: "ID required" }));
          return;
        }
        try {
          const payload = await parseJsonBody(req);
          const existingRecord = repository.getPaymentOutRecordById(id);
          if (!existingRecord) {
            res.statusCode = 404;
            res.end(JSON.stringify({ message: "Record not found" }));
            return;
          }
          let updatedImagePath = existingRecord.attachment_image_path || existingRecord.attachmentImagePath;
          if (payload.imageDataUrl && payload.imageDataUrl !== updatedImagePath && payload.imageDataUrl.startsWith("data:")) {
            if (updatedImagePath) {
              removeManagedPaymentOutAttachmentFile(updatedImagePath);
            }
            const imageFile = saveDataUrlToAppData({
              dataUrl: payload.imageDataUrl,
              prefix: "payment_out_image",
              targetRoot: paymentOutAttachmentsRoot
            });
            updatedImagePath = imageFile?.filePath ?? null;
          } else if (payload.imageDataUrl === null || payload.imageDataUrl === "") {
            if (updatedImagePath) {
              removeManagedPaymentOutAttachmentFile(updatedImagePath);
              updatedImagePath = null;
            }
          }
          if (existingRecord.party_id) {
            try {
              const allParties = repository.getParties();
              const party = allParties.find((p) => String(p.id) === String(existingRecord.party_id));
              if (party) {
                party.balance = Number(party.balance || 0) - Number(existingRecord.amount || 0);
                repository.upsertParty(party);
              }
            } catch (balanceError) {
              console.error("Failed to restore party balance:", balanceError);
            }
          }
          try {
            try {
              repository.deleteCashInHandTransaction("cash_payment_out_" + id);
            } catch (e) {
            }
            try {
              repository.deleteBankAccountTransaction("bank_payment_out_" + id);
            } catch (e) {
            }
          } catch (txError) {
            console.error("Failed to delete cash/bank transaction:", txError);
          }
          const record = {
            id,
            paymentNo: payload.paymentNo ?? existingRecord.payment_no,
            date: payload.date ?? existingRecord.date,
            partyName: payload.partyName ?? existingRecord.party_name,
            partyId: payload.partyId ?? existingRecord.party_id,
            amount: Number(payload.amount ?? existingRecord.amount),
            paymentType: payload.paymentType ?? existingRecord.payment_type,
            reference: payload.reference ?? existingRecord.reference,
            description: payload.description ?? existingRecord.description,
            attachmentImagePath: updatedImagePath,
            attachmentImageName: existingRecord.attachment_image_name || existingRecord.attachmentImageName,
            attachmentDocumentPath: existingRecord.attachment_document_path || existingRecord.attachmentDocumentPath,
            attachmentDocumentName: existingRecord.attachment_document_name || existingRecord.attachmentDocumentName
          };
          repository.updatePaymentOutRecord(id, record);
          if (record.partyId) {
            const allParties = repository.getParties();
            const party = allParties.find((p) => String(p.id) === String(record.partyId));
            if (party) {
              party.balance = Number(party.balance || 0) + Number(record.amount || 0);
              repository.upsertParty(party);
            }
          }
          if (String(record.paymentType).toLowerCase() === "cash") {
            repository.addCashInHandTransaction({
              id: "cash_payment_out_" + record.id,
              date: record.date,
              name: record.partyName,
              type: "Payment Out",
              amount: -record.amount
            });
          } else if (record.paymentType) {
            repository.addBankAccountTransaction({
              id: "bank_payment_out_" + record.id,
              date: record.date,
              name: record.partyName,
              type: "Payment Out",
              amount: -record.amount,
              paymentType: record.paymentType
            });
          }
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(record));
        } catch (error) {
          console.error("PUT /api/payment_out_records error:", error);
          res.statusCode = 400;
          res.end(JSON.stringify({ message: "Bad Request" }));
        }
        return;
      }
      if (req.method === "DELETE") {
        const segments = requestUrl.pathname.split("/").filter(Boolean);
        const lastSegment = segments.length > 0 ? segments[segments.length - 1] : null;
        const pathId = lastSegment && lastSegment !== "payment_out_records" && lastSegment !== "api" ? lastSegment : null;
        const queryId = requestUrl.searchParams.get("id");
        const id = (queryId || pathId || "").trim();
        if (id) {
          const existingRecord = repository.getPaymentOutRecordById(id);
          if (existingRecord) {
            if (existingRecord.party_id) {
              try {
                const allParties = repository.getParties();
                const party = allParties.find((p) => String(p.id) === String(existingRecord.party_id));
                if (party) {
                  party.balance = Number(party.balance || 0) - Number(existingRecord.amount || 0);
                  repository.upsertParty(party);
                }
              } catch (balanceError) {
                console.error("Failed to restore party balance:", balanceError);
              }
            }
            try {
              try {
                repository.deleteCashInHandTransaction("cash_payment_out_" + id);
              } catch (e) {
              }
              try {
                repository.deleteBankAccountTransaction("bank_payment_out_" + id);
              } catch (e) {
              }
            } catch (txError) {
              console.error("Failed to delete cash/bank transaction:", txError);
            }
            if (existingRecord.attachment_image_path || existingRecord.attachmentImagePath) {
              removeManagedPaymentOutAttachmentFile(existingRecord.attachment_image_path || existingRecord.attachmentImagePath);
            }
          }
          repository.deletePaymentOutRecord(id);
          res.statusCode = 204;
          res.end();
        } else {
          res.statusCode = 400;
          res.end(JSON.stringify({ message: "ID required" }));
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
  server.middlewares.use("/api/estimates", async (req, res) => {
    try {
      const repository = await import("../database/sqlite/repository.mjs");
      const requestUrl = new URL(req.url ?? "/", "http://localhost");
      const resolveEstimateAttachment = (rawValue, prefix) => {
        if (!rawValue || typeof rawValue !== "string") {
          return null;
        }
        const trimmedValue = rawValue.trim();
        if (!trimmedValue) {
          return null;
        }
        if (trimmedValue.startsWith("/app_data/estimate_attachments/")) {
          return {
            filePath: trimmedValue,
            fileName: path.basename(trimmedValue)
          };
        }
        return saveDataUrlToAppData({
          dataUrl: trimmedValue,
          prefix,
          targetRoot: estimateAttachmentsRoot
        });
      };
      if (req.method === "GET") {
        const records = repository.getEstimates();
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(records));
        return;
      }
      if (req.method === "POST") {
        let createdImagePath = null;
        let createdDocumentPath = null;
        try {
          const payload = await parseJsonBody(req);
          if (!payload.partyName || !String(payload.partyName).trim()) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ message: "Party name is required." }));
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
          const imageFile = resolveEstimateAttachment(payload.imageDataUrl, "estimate_image");
          createdImagePath = imageFile?.filePath ?? null;
          const documentFile = resolveEstimateAttachment(payload.documentDataUrl, "estimate_document");
          createdDocumentPath = documentFile?.filePath ?? null;
          const estimate = {
            id: String(payload.id ?? Date.now().toString()),
            referenceNo: String(payload.referenceNo ?? repository.getNextEstimateNo()),
            date: String(payload.date ?? (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")),
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
            status: String(payload.status ?? "Open")
          };
          repository.addEstimate(estimate);
          res.statusCode = 201;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(estimate));
          return;
        } catch (err) {
          if (createdImagePath) {
            removeManagedEstimateAttachmentFile(createdImagePath);
          }
          if (createdDocumentPath) {
            removeManagedEstimateAttachmentFile(createdDocumentPath);
          }
          console.error("Error saving estimate:", err);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Failed to save estimate." }));
          return;
        }
      }
      if (req.method === "PUT") {
        const pathId = requestUrl.pathname.split("/").filter(Boolean)[0];
        const queryId = requestUrl.searchParams.get("id");
        const id = (pathId || queryId || "").trim();
        if (!id) {
          res.statusCode = 400;
          res.end(JSON.stringify({ message: "ID required" }));
          return;
        }
        let createdImagePath = null;
        let createdDocumentPath = null;
        const existingEstimate = repository.getEstimates().find((e) => String(e.id) === String(id));
        try {
          const payload = await parseJsonBody(req);
          const lineItems = Array.isArray(payload.lineItems) ? payload.lineItems : [];
          const imageFile = resolveEstimateAttachment(payload.imageDataUrl, "estimate_image");
          createdImagePath = imageFile?.filePath ?? null;
          const documentFile = resolveEstimateAttachment(payload.documentDataUrl, "estimate_document");
          createdDocumentPath = documentFile?.filePath ?? null;
          if (existingEstimate) {
            if (createdImagePath !== existingEstimate.attachmentImagePath && existingEstimate.attachmentImagePath) {
              removeManagedEstimateAttachmentFile(existingEstimate.attachmentImagePath);
            }
            if (createdDocumentPath !== existingEstimate.attachmentDocumentPath && existingEstimate.attachmentDocumentPath) {
              removeManagedEstimateAttachmentFile(existingEstimate.attachmentDocumentPath);
            }
          }
          const estimate = {
            referenceNo: String(payload.referenceNo ?? repository.getNextEstimateNo()),
            date: String(payload.date ?? (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")),
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
            status: String(payload.status ?? "Open")
          };
          repository.updateEstimate(id, estimate);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ...estimate, id }));
          return;
        } catch (err) {
          if (createdImagePath) {
            removeManagedEstimateAttachmentFile(createdImagePath);
          }
          if (createdDocumentPath) {
            removeManagedEstimateAttachmentFile(createdDocumentPath);
          }
          console.error("Error updating estimate:", err);
          res.statusCode = 500;
          res.end(JSON.stringify({ message: "Failed to update estimate." }));
          return;
        }
      }
      if (req.method === "DELETE") {
        const pathId = requestUrl.pathname.split("/").filter(Boolean)[0];
        const queryId = requestUrl.searchParams.get("id");
        const id = (pathId || queryId || "").trim();
        if (id) {
          const existingEstimate = repository.getEstimates().find((e) => String(e.id) === String(id));
          if (existingEstimate) {
            if (existingEstimate.attachmentImagePath) {
              removeManagedEstimateAttachmentFile(existingEstimate.attachmentImagePath);
            }
            if (existingEstimate.attachmentDocumentPath) {
              removeManagedEstimateAttachmentFile(existingEstimate.attachmentDocumentPath);
            }
          }
          repository.deleteEstimate(id);
          res.statusCode = 204;
          res.end();
        } else {
          res.statusCode = 400;
          res.end(JSON.stringify({ message: "ID required" }));
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
  server.middlewares.use("/api/parties", async (req, res) => {
    try {
      const repository = await import("../database/sqlite/repository.mjs");
      const requestUrl = new URL(req.url ?? "/", "http://localhost");
      if (req.method === "GET") {
        const parties = repository.getParties();
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(parties));
        return;
      }
      if (req.method === "POST") {
        const chunks = [];
        req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        req.on("end", () => {
          try {
            const raw = Buffer.concat(chunks).toString("utf8");
            const payload = raw ? JSON.parse(raw) : {};
            if (!payload.name || !String(payload.name).trim()) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ message: "Party name is required." }));
              return;
            }
            const normalizedBalance = Number(payload.balance ?? 0);
            const providedId = payload.id !== void 0 && payload.id !== null ? String(payload.id).trim() : "";
            const isNewParty = !providedId;
            const normalizedId = !isNewParty ? providedId : String(repository.getNextPartyId());
            const parsedCreditLimit = payload.creditLimit !== void 0 && payload.creditLimit !== null && payload.creditLimit !== "" && !isNaN(Number(payload.creditLimit)) ? Number(payload.creditLimit) : null;
            const party = {
              id: normalizedId,
              name: String(payload.name).trim(),
              phone: String(payload.phone ?? ""),
              email: payload.email ? String(payload.email) : null,
              address: payload.address ? String(payload.address) : null,
              shippingAddress: payload.shippingAddress ? String(payload.shippingAddress) : null,
              shipping_address: payload.shippingAddress ? String(payload.shippingAddress) : null,
              balance: Number.isFinite(normalizedBalance) ? normalizedBalance : 0,
              creditLimit: parsedCreditLimit,
              credit_limit: parsedCreditLimit,
              type: payload.type ?? "customer",
              status: payload.status ?? "active"
            };
            repository.upsertParty(party);
            if (isNewParty && Number.isFinite(normalizedBalance) && Math.abs(normalizedBalance) > 0) {
              try {
                const obDate = payload.asOfDate ? String(payload.asOfDate) : (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB");
                repository.saveOpeningBalanceTransaction(party.name, normalizedBalance, obDate);
              } catch (obErr) {
                console.error("Failed to save opening balance transaction:", obErr);
              }
            }
            res.statusCode = 201;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(party));
          } catch {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ message: "Invalid JSON payload." }));
          }
        });
        return;
      }
      if (req.method === "DELETE") {
        const pathId = requestUrl.pathname.split("/").filter(Boolean)[0];
        const queryId = requestUrl.searchParams.get("id");
        const deleteById = (rawId) => {
          const id = typeof rawId === "string" ? rawId.trim() : "";
          if (!id) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ message: "Party id is required." }));
            return;
          }
          const existingParties = repository.getParties();
          const partyToDelete = existingParties.find((p) => String(p.id) === String(id));
          if (partyToDelete?.name) {
            try {
              repository.deleteOpeningBalanceTransactionsByPartyName(partyToDelete.name);
            } catch (obErr) {
              console.error("Failed to delete opening balance transactions for party:", obErr);
            }
          }
          const deleted = repository.deleteParty(id);
          if (!deleted) {
            res.statusCode = 404;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ message: "Party not found." }));
            return;
          }
          res.statusCode = 204;
          res.end();
        };
        if (pathId || queryId) {
          deleteById(pathId || queryId);
          return;
        }
        const chunks = [];
        req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        req.on("end", () => {
          try {
            const raw = Buffer.concat(chunks).toString("utf8");
            const payload = raw ? JSON.parse(raw) : {};
            deleteById(payload?.id);
          } catch {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ message: "Invalid JSON payload." }));
          }
        });
        return;
      }
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Method not allowed." }));
    } catch {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Failed to process request." }));
    }
  });
  server.middlewares.use("/api/categories", async (req, res) => {
    try {
      const repository = await import("../database/sqlite/repository.mjs");
      const requestUrl = new URL(req.url ?? "/", "http://localhost");
      if (req.method === "GET") {
        const categories = repository.getCategories();
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(categories));
        return;
      }
      if (req.method === "POST") {
        const chunks = [];
        req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        req.on("end", () => {
          try {
            const raw = Buffer.concat(chunks).toString("utf8");
            const payload = raw ? JSON.parse(raw) : {};
            if (!payload.name || !String(payload.name).trim()) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ message: "Category name is required." }));
              return;
            }
            const category = {
              id: payload.id ? String(payload.id) : Date.now().toString(),
              name: String(payload.name).trim(),
              itemCount: Number.isFinite(Number(payload.itemCount)) ? Number(payload.itemCount) : 0
            };
            repository.upsertCategory(category);
            res.statusCode = 201;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(category));
          } catch {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ message: "Invalid JSON payload." }));
          }
        });
        return;
      }
      if (req.method === "DELETE") {
        const pathId = requestUrl.pathname.split("/").filter(Boolean)[0];
        const queryId = requestUrl.searchParams.get("id");
        const id = (pathId || queryId || "").trim();
        if (!id) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Category id is required." }));
          return;
        }
        const deleted = repository.deleteCategory(id);
        if (!deleted) {
          res.statusCode = 404;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Category not found." }));
          return;
        }
        res.statusCode = 204;
        res.end();
        return;
      }
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Method not allowed." }));
    } catch {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Failed to process request." }));
    }
  });
  server.middlewares.use("/api/expense_categories", async (req, res) => {
    try {
      const repository = await import("../database/sqlite/repository.mjs");
      const requestUrl = new URL(req.url ?? "/", "http://localhost");
      if (req.method === "GET") {
        const categories = repository.getExpenseCategories();
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(categories));
        return;
      }
      if (req.method === "POST") {
        try {
          const payload = await parseJsonBody(req);
          if (!payload.name || !String(payload.name).trim()) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ message: "Category name is required." }));
            return;
          }
          const category = {
            id: payload.id ? String(payload.id) : Date.now().toString(),
            name: String(payload.name).trim(),
            amount: Number(payload.amount) || 0
          };
          repository.upsertExpenseCategory(category);
          res.statusCode = 201;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(category));
        } catch {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Invalid JSON payload." }));
        }
        return;
      }
      if (req.method === "DELETE") {
        const pathId = requestUrl.pathname.split("/").filter(Boolean)[0];
        const queryId = requestUrl.searchParams.get("id");
        const id = (pathId || queryId || "").trim();
        if (!id) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Category id is required." }));
          return;
        }
        const deleted = repository.deleteExpenseCategory(id);
        if (!deleted) {
          res.statusCode = 404;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Category not found." }));
          return;
        }
        res.statusCode = 204;
        res.end();
        return;
      }
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Method not allowed." }));
    } catch {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Failed to process request." }));
    }
  });
  server.middlewares.use("/api/expense_items", async (req, res) => {
    try {
      const repository = await import("../database/sqlite/repository.mjs");
      if (req.method === "GET") {
        const items = repository.getExpenseItems();
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(items));
        return;
      }
      if (req.method === "POST") {
        try {
          const payload = await parseJsonBody(req);
          if (!payload.name || !String(payload.name).trim()) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ message: "Item name is required." }));
            return;
          }
          const item = {
            id: payload.id ? String(payload.id) : Date.now().toString(),
            category_id: payload.category_id ? String(payload.category_id) : "default",
            name: String(payload.name).trim(),
            price: Number(payload.price) || 0
          };
          repository.upsertExpenseItem(item);
          res.statusCode = 201;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(item));
        } catch {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Invalid JSON payload." }));
        }
        return;
      }
      if (req.method === "DELETE") {
        const requestUrl = new URL(req.url ?? "/", "http://localhost");
        const pathId = requestUrl.pathname.split("/").filter(Boolean)[0];
        const queryId = requestUrl.searchParams.get("id");
        const id = (pathId || queryId || "").trim();
        if (!id) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Item ID is required." }));
          return;
        }
        const success = repository.deleteExpenseItem(id);
        if (success) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ success: true }));
        } else {
          res.statusCode = 404;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Item not found." }));
        }
        return;
      }
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Method not allowed." }));
    } catch {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Failed to process request." }));
    }
  });
  server.middlewares.use("/api/expense_records", async (req, res) => {
    let createdImagePath = null;
    let createdDocumentPath = null;
    try {
      const repository = await import("../database/sqlite/repository.mjs");
      const resolveExpenseAttachment = (rawValue, prefix) => {
        if (!rawValue || typeof rawValue !== "string") {
          return null;
        }
        const trimmedValue = rawValue.trim();
        if (!trimmedValue) {
          return null;
        }
        if (trimmedValue.startsWith("/app_data/expense_attachments/")) {
          return {
            filePath: trimmedValue,
            fileName: path.basename(trimmedValue)
          };
        }
        return saveDataUrlToAppData({
          dataUrl: trimmedValue,
          prefix,
          targetRoot: expenseAttachmentsRoot
        });
      };
      if (req.method === "GET") {
        const records = repository.getExpenseRecords();
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(records));
        return;
      }
      if (req.method === "POST") {
        try {
          const payload = await parseJsonBody(req);
          const imageFile = resolveExpenseAttachment(payload.imageDataUrl ?? payload.attachmentImagePath, "expense_image");
          createdImagePath = imageFile?.filePath ?? null;
          const documentFile = resolveExpenseAttachment(payload.documentDataUrl ?? payload.attachmentDocumentPath, "expense_document");
          createdDocumentPath = documentFile?.filePath ?? null;
          const lineItems = Array.isArray(payload.lineItems) ? payload.lineItems : typeof payload.lineItemsJson === "string" ? JSON.parse(payload.lineItemsJson) : [];
          const record = {
            id: payload.id ? String(payload.id) : Date.now().toString(),
            expense_no: payload.expenseNo || repository.getNextExpenseNo(),
            category_id: payload.categoryId,
            category_name: payload.categoryName,
            amount: Number(payload.amount) || 0,
            payment_type: payload.paymentType || "Cash",
            description: payload.description || null,
            line_items_json: JSON.stringify(lineItems),
            attachment_image_path: createdImagePath ?? null,
            attachment_image_name: imageFile?.fileName ?? null,
            attachment_document_path: createdDocumentPath ?? null,
            attachment_document_name: documentFile?.fileName ?? null,
            round_off: payload.roundOff ? 1 : 0,
            round_off_amount: Number(payload.roundOffAmount) || 0
          };
          if (String(record.payment_type).toLowerCase() !== "cash") {
            const bankAccounts = repository.getBankAccounts();
            const bankAccount = bankAccounts.find((acc) => acc.name === record.payment_type);
            if (bankAccount) {
              let oldAmount = 0;
              if (payload.isUpdate) {
                const existingRecord = repository.getExpenseRecordById(record.id);
                if (existingRecord && existingRecord.payment_type === record.payment_type) {
                  oldAmount = Number(existingRecord.amount) || 0;
                }
              }
              const currentBalance = Number(bankAccount.balance) || 0;
              const requiredAmount = Number(record.amount) || 0;
              if (currentBalance + oldAmount < requiredAmount) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ message: `Insufficient balance in bank account: ${bankAccount.name}` }));
                return;
              }
            }
          }
          if (payload.isUpdate) {
            const existingRecord = repository.getExpenseRecordById(record.id);
            repository.updateExpenseRecord(record.id, record);
            if (existingRecord?.attachment_image_path && existingRecord.attachment_image_path !== createdImagePath) {
              removeManagedExpenseAttachmentFile(existingRecord.attachment_image_path);
            }
            if (existingRecord?.attachment_document_path && existingRecord.attachment_document_path !== createdDocumentPath) {
              removeManagedExpenseAttachmentFile(existingRecord.attachment_document_path);
            }
            try {
              repository.deleteCashInHandTransaction("cash_expense_" + record.id);
            } catch (e) {
            }
            try {
              repository.deleteBankAccountTransaction("bank_expense_" + record.id);
            } catch (e) {
            }
            if (String(record.payment_type).toLowerCase() === "cash") {
              repository.addCashInHandTransaction({
                id: "cash_expense_" + record.id,
                date: (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB"),
                name: record.category_name || "Expense",
                type: "Expense",
                amount: record.amount
              });
            } else {
              repository.addBankAccountTransaction({
                id: "bank_expense_" + record.id,
                date: (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB"),
                name: record.category_name || "Expense",
                type: "Expense",
                amount: -record.amount,
                paymentType: record.payment_type
              });
            }
          } else {
            repository.addExpenseRecord(record);
            if (String(record.payment_type).toLowerCase() === "cash") {
              repository.addCashInHandTransaction({
                id: "cash_expense_" + record.id,
                date: (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB"),
                name: record.category_name || "Expense",
                type: "Expense",
                amount: record.amount
              });
            } else {
              repository.addBankAccountTransaction({
                id: "bank_expense_" + record.id,
                date: (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB"),
                name: record.category_name || "Expense",
                type: "Expense",
                amount: -record.amount,
                paymentType: record.payment_type
              });
            }
          }
          res.statusCode = 201;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(record));
        } catch (err) {
          console.error(err);
          if (createdImagePath) {
            removeManagedExpenseAttachmentFile(createdImagePath);
          }
          if (createdDocumentPath) {
            removeManagedExpenseAttachmentFile(createdDocumentPath);
          }
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Invalid JSON payload." }));
        }
        return;
      }
      if (req.method === "DELETE") {
        const requestUrl = new URL(req.url ?? "/", "http://localhost");
        const pathId = requestUrl.pathname.split("/").filter(Boolean)[0];
        const queryId = requestUrl.searchParams.get("id");
        const id = (pathId || queryId || "").trim();
        if (!id) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Expense record ID is required." }));
          return;
        }
        const existingRecord = repository.getExpenseRecordById(id);
        const success = repository.deleteExpenseRecord(id);
        if (success) {
          try {
            repository.deleteCashInHandTransaction("cash_expense_" + id);
          } catch (e) {
          }
          try {
            repository.deleteBankAccountTransaction("bank_expense_" + id);
          } catch (e) {
          }
          try {
            if (existingRecord?.attachment_image_path) {
              removeManagedExpenseAttachmentFile(existingRecord.attachment_image_path);
            }
            if (existingRecord?.attachment_document_path) {
              removeManagedExpenseAttachmentFile(existingRecord.attachment_document_path);
            }
          } catch (error) {
            console.error("Failed to remove expense attachments on delete:", error);
          }
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ success: true }));
        } else {
          res.statusCode = 404;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Expense record not found." }));
        }
        return;
      }
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Method not allowed." }));
    } catch (error) {
      console.error(error);
      if (createdImagePath) {
        removeManagedExpenseAttachmentFile(createdImagePath);
      }
      if (createdDocumentPath) {
        removeManagedExpenseAttachmentFile(createdDocumentPath);
      }
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Failed to process request." }));
    }
  });
  server.middlewares.use("/api/units", async (req, res) => {
    try {
      const repository = await import("../database/sqlite/repository.mjs");
      const requestUrl = new URL(req.url ?? "/", "http://localhost");
      if (req.method === "GET") {
        const unitRows = repository.getUnits();
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(unitRows));
        return;
      }
      if (req.method === "POST") {
        const chunks = [];
        req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        req.on("end", () => {
          try {
            const raw = Buffer.concat(chunks).toString("utf8");
            const payload = raw ? JSON.parse(raw) : {};
            if (!payload.fullName || !String(payload.fullName).trim()) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ message: "Full name is required." }));
              return;
            }
            if (!payload.shortName || !String(payload.shortName).trim()) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ message: "Short name is required." }));
              return;
            }
            const unit = {
              id: payload.id ? String(payload.id) : Date.now().toString(),
              fullName: String(payload.fullName).trim(),
              shortName: String(payload.shortName).trim()
            };
            repository.upsertUnit(unit);
            res.statusCode = 201;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(unit));
          } catch {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ message: "Invalid JSON payload." }));
          }
        });
        return;
      }
      if (req.method === "DELETE") {
        const pathId = requestUrl.pathname.split("/").filter(Boolean)[0];
        const queryId = requestUrl.searchParams.get("id");
        const id = (pathId || queryId || "").trim();
        if (!id) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Unit id is required." }));
          return;
        }
        const deleted = repository.deleteUnit(id);
        if (!deleted) {
          res.statusCode = 404;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Unit not found." }));
          return;
        }
        res.statusCode = 204;
        res.end();
        return;
      }
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Method not allowed." }));
    } catch {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Failed to process request." }));
    }
  });
  server.middlewares.use("/api/barcode_generator", async (req, res) => {
    try {
      const repository = await import("../database/sqlite/repository.mjs");
      if (req.method === "GET") {
        const rows = repository.getBarcodeGenerators();
        const mappedRows = rows.map((r) => ({
          id: r.id,
          itemName: r.item_name,
          itemCode: r.item_code,
          noOfLabels: r.no_of_labels,
          header: r.header,
          line1: r.line1,
          line2: r.line2,
          line3: r.line3,
          line4: r.line4
        }));
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(mappedRows));
        return;
      }
      if (req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const data = JSON.parse(body);
            repository.insertBarcodeGenerator(data);
            res.statusCode = 201;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: true }));
          } catch (e) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }));
          }
        });
        return;
      }
      if (req.method === "DELETE") {
        const requestUrl = new URL(req.url ?? "/", "http://localhost");
        const id = requestUrl.pathname.split("/").pop();
        if (id) {
          repository.deleteBarcodeGenerator(id);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ success: true }));
          return;
        }
      }
      res.statusCode = 405;
      res.end(JSON.stringify({ message: "Method not allowed." }));
    } catch (e) {
      res.statusCode = 500;
      res.end(JSON.stringify({ message: "Server error", error: e instanceof Error ? e.message : String(e) }));
    }
  });
  server.middlewares.use("/api/items", async (req, res) => {
    try {
      const repository = await import("../database/sqlite/repository.mjs");
      const requestUrl = new URL(req.url ?? "/", "http://localhost");
      if (req.method === "GET") {
        const itemRows = repository.getItems();
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(itemRows));
        return;
      }
      if (req.method === "POST") {
        const chunks = [];
        req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        req.on("end", () => {
          try {
            const raw = Buffer.concat(chunks).toString("utf8");
            const payload = raw ? JSON.parse(raw) : {};
            if (!payload.name || !String(payload.name).trim()) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ message: "Item name is required." }));
              return;
            }
            if (!payload.unit || !String(payload.unit).trim()) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ message: "Unit is required." }));
              return;
            }
            let resolvedImgPath = payload.imgPath && String(payload.imgPath).trim() ? String(payload.imgPath).trim() : null;
            const existingItem = payload.id ? repository.getItems().find((itemRow) => String(itemRow.id) === String(payload.id)) : null;
            const previousImgPath = existingItem?.img_path ?? null;
            if (payload.imageDataUrl) {
              const imageDataUrl = String(payload.imageDataUrl);
              const matchedDataUrl = imageDataUrl.match(/^data:(image\/[\w.+-]+);base64,(.+)$/);
              if (!matchedDataUrl) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ message: "Invalid image format." }));
                return;
              }
              const mimeType = matchedDataUrl[1];
              const base64Payload = matchedDataUrl[2];
              const originalFileName = payload.imageFileName ? String(payload.imageFileName).trim() : "";
              const extensionByMimeType = {
                "image/png": ".png",
                "image/jpeg": ".jpg",
                "image/jpg": ".jpg",
                "image/webp": ".webp",
                "image/gif": ".gif"
              };
              const extensionFromFileName = path.extname(originalFileName).toLowerCase();
              const fileExtension = extensionFromFileName || extensionByMimeType[mimeType] || ".png";
              const fileName = `product_${Date.now()}${fileExtension}`;
              const imagesRoot = path.join(process.cwd(), "app_data", "items_images");
              const imageAbsolutePath = path.join(imagesRoot, fileName);
              fs.mkdirSync(imagesRoot, { recursive: true });
              fs.writeFileSync(imageAbsolutePath, Buffer.from(base64Payload, "base64"));
              resolvedImgPath = `/app_data/items_images/${fileName}`;
              if (previousImgPath && previousImgPath !== resolvedImgPath) {
                try {
                  removeManagedImageFile(previousImgPath);
                } catch (error) {
                  console.error("Failed to remove previous item image:", error);
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
              conversionRate: Number.isFinite(Number(payload.conversionRate)) ? Number(payload.conversionRate) : Number.isFinite(Number(payload.conversion_rate)) ? Number(payload.conversion_rate) : null,
              imgPath: resolvedImgPath,
              stockValue: Number.isFinite(Number(payload.stockValue)) ? Number(payload.stockValue) : null,
              minStock: Number.isFinite(Number(payload.minStock)) ? Number(payload.minStock) : null,
              lowStock: Number.isFinite(Number(payload.lowStock)) ? Number(payload.lowStock) : null,
              batchJson: payload.batchJson ? String(payload.batchJson) : null,
              location: payload.location ? String(payload.location).trim() : null,
              atPrice: payload.atPrice !== void 0 && payload.atPrice !== null ? Number(payload.atPrice) : null,
              mfgDate: payload.mfgDate ? String(payload.mfgDate) : null,
              expDate: payload.expDate ? String(payload.expDate) : null,
              status: payload.status ? String(payload.status).trim() : "active"
            };
            const secondaryStock = Number(item.stockQuantity) * Number(item.conversionRate ?? 0);
            repository.upsertItem(item);
            if (!payload.skipOpeningStockUpdate) {
              if (!existingItem && Number(item.stockQuantity) > 0) {
                try {
                  repository.addStockAdjustment({
                    itemId: item.id,
                    itemName: item.name,
                    adjustmentType: "Opening Stock",
                    date: (/* @__PURE__ */ new Date()).toISOString(),
                    quantity: Number(item.stockQuantity),
                    unit: item.unit,
                    atPrice: item.atPrice,
                    details: "Opening stock transaction"
                  });
                } catch (e) {
                  console.error("Failed to add opening stock transaction:", e);
                }
              } else if (existingItem) {
                try {
                  const allAdjustments = repository.getStockAdjustments();
                  const openingStockTx = allAdjustments.find((a) => String(a.item_id) === String(item.id) && a.adjustment_type === "Opening Stock");
                  if (openingStockTx) {
                    if (Number(item.stockQuantity) > 0) {
                      repository.updateStockAdjustment(openingStockTx.id, {
                        itemId: item.id,
                        itemName: item.name,
                        adjustmentType: "Opening Stock",
                        date: openingStockTx.date,
                        quantity: Number(item.stockQuantity),
                        unit: item.unit,
                        atPrice: item.atPrice,
                        details: openingStockTx.details
                      });
                    } else {
                      repository.deleteStockAdjustment(openingStockTx.id);
                    }
                  } else if (Number(item.stockQuantity) > 0) {
                    repository.addStockAdjustment({
                      itemId: item.id,
                      itemName: item.name,
                      adjustmentType: "Opening Stock",
                      date: (/* @__PURE__ */ new Date()).toISOString(),
                      quantity: Number(item.stockQuantity),
                      unit: item.unit,
                      atPrice: item.atPrice,
                      details: "Opening stock transaction"
                    });
                  }
                } catch (e) {
                  console.error("Failed to update opening stock transaction:", e);
                }
              }
            }
            res.statusCode = 201;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({
              ...item,
              secondaryStock
            }));
          } catch (err) {
            console.error("Error saving item:", err);
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ message: "Invalid JSON payload." }));
          }
        });
        return;
      }
      if (req.method === "DELETE") {
        const pathId = requestUrl.pathname.split("/").filter(Boolean)[0];
        const queryId = requestUrl.searchParams.get("id");
        const id = (pathId || queryId || "").trim();
        if (!id) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Item id is required." }));
          return;
        }
        const existingItem = repository.getItems().find((itemRow) => String(itemRow.id) === id);
        const existingImgPath = existingItem?.img_path ?? null;
        try {
          const deleted = repository.deleteItem(id);
          if (!deleted) {
            res.statusCode = 404;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ message: "Item not found." }));
            return;
          }
          try {
            if (existingImgPath) {
              removeManagedImageFile(existingImgPath);
            }
          } catch (error) {
            console.error("Failed to remove item image on delete:", error);
          }
          res.statusCode = 204;
          res.end();
        } catch (error) {
          if (error.message === "ITEM_IN_USE") {
            res.statusCode = 409;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ message: "Please delete all sales, purchases, and stock adjustment transactions for this item before deleting it." }));
          } else {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ message: "Failed to process request." }));
          }
        }
        return;
      }
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Method not allowed." }));
    } catch (error) {
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ message: "Failed to process request." }));
      }
    }
  });
  server.middlewares.use("/api/conversion_rates", async (req, res) => {
    try {
      const repository = await import("../database/sqlite/repository.mjs");
      const requestUrl = new URL(req.url ?? "/", "http://localhost");
      if (req.method === "GET") {
        const baseUnit = requestUrl.searchParams.get("baseUnit")?.trim() || void 0;
        const rows = repository.getConversionRates(baseUnit);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(rows));
        return;
      }
      if (req.method === "POST") {
        const chunks = [];
        req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        req.on("end", () => {
          try {
            const raw = Buffer.concat(chunks).toString("utf8");
            const payload = raw ? JSON.parse(raw) : {};
            const baseUnit = String(payload.baseUnit ?? "").trim();
            const secondaryUnit = String(payload.secondaryUnit ?? "").trim();
            const conversionRate = Number(payload.conversionRate);
            if (!baseUnit) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ message: "Base unit is required." }));
              return;
            }
            if (!secondaryUnit) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ message: "Secondary unit is required." }));
              return;
            }
            if (!Number.isFinite(conversionRate) || conversionRate <= 0) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ message: "Conversion rate must be greater than zero." }));
              return;
            }
            const id = repository.addConversionRate({
              baseUnit,
              secondaryUnit,
              conversionRate
            });
            res.statusCode = 201;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                id,
                base_unit: baseUnit,
                secondary_unit: secondaryUnit,
                conversion_rate: conversionRate
              })
            );
          } catch {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ message: "Invalid JSON payload." }));
          }
        });
        return;
      }
      if (req.method === "PUT") {
        const idMatch = requestUrl.pathname.match(/^\/(\d+)$/);
        if (!idMatch) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Invalid ID." }));
          return;
        }
        const id = parseInt(idMatch[1], 10);
        const chunks = [];
        req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        req.on("end", () => {
          try {
            const raw = Buffer.concat(chunks).toString("utf8");
            const payload = raw ? JSON.parse(raw) : {};
            const baseUnit = String(payload.baseUnit ?? "").trim();
            const secondaryUnit = String(payload.secondaryUnit ?? "").trim();
            const conversionRate = Number(payload.conversionRate);
            if (!baseUnit || !secondaryUnit || !Number.isFinite(conversionRate) || conversionRate <= 0) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ message: "Invalid input." }));
              return;
            }
            const updated = repository.updateConversionRate(id, {
              baseUnit,
              secondaryUnit,
              conversionRate
            });
            if (updated) {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  id,
                  base_unit: baseUnit,
                  secondary_unit: secondaryUnit,
                  conversion_rate: conversionRate
                })
              );
            } else {
              res.statusCode = 404;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ message: "Conversion rate not found." }));
            }
          } catch {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ message: "Invalid JSON payload." }));
          }
        });
        return;
      }
      if (req.method === "DELETE") {
        const idMatch = requestUrl.pathname.match(/^\/(\d+)$/);
        if (!idMatch) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Invalid ID." }));
          return;
        }
        const id = parseInt(idMatch[1], 10);
        const deleted = repository.deleteConversionRate(id);
        if (deleted) {
          res.statusCode = 204;
          res.end();
        } else {
          res.statusCode = 404;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Conversion rate not found." }));
        }
        return;
      }
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Method not allowed." }));
    } catch {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Failed to process request." }));
    }
  });
  server.middlewares.use("/api/sale_invoices", async (req, res) => {
    try {
      const repository = await import("../database/sqlite/repository.mjs");
      const requestUrl = new URL(req.url ?? "/", "http://localhost");
      const resolveSaleAttachment = (rawValue, prefix) => {
        if (!rawValue || typeof rawValue !== "string") return null;
        const trimmedValue = rawValue.trim();
        if (!trimmedValue) return null;
        if (trimmedValue.startsWith("/app_data/sale_attachments/")) {
          return { filePath: trimmedValue, fileName: path.basename(trimmedValue) };
        }
        return saveDataUrlToAppData({ dataUrl: trimmedValue, prefix, targetRoot: saleAttachmentsRoot });
      };
      if (req.method === "GET") {
        const saleInvoices = repository.getSaleInvoices();
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(saleInvoices));
        return;
      }
      if (req.method === "POST" && (requestUrl.pathname === "" || requestUrl.pathname === "/")) {
        let createdImagePath = null;
        let createdDocumentPath = null;
        try {
          const payload = await parseJsonBody(req);
          if (!payload.partyName || !String(payload.partyName).trim()) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ message: "Party name is required." }));
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
          const imageFile = resolveSaleAttachment(payload.imageDataUrl, "sale_invoice_image");
          createdImagePath = imageFile?.filePath ?? null;
          const documentFile = resolveSaleAttachment(payload.documentDataUrl, "sale_invoice_document");
          createdDocumentPath = documentFile?.filePath ?? null;
          const invoice = {
            id: String(payload.id ?? Date.now().toString()),
            invoiceNo: String(payload.invoiceNo ?? repository.getNextSaleInvoiceNo()),
            date: String(payload.date ?? (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")),
            partyName: String(payload.partyName).trim(),
            partyId: payload.partyId ? String(payload.partyId) : null,
            partyPhone: payload.partyPhone ? String(payload.partyPhone) : null,
            transactionType: "Sale",
            paymentType: String(payload.paymentType ?? "Credit"),
            paymentMode: String(payload.paymentMode ?? "credit"),
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
            attachmentDocumentName: documentFile?.fileName ?? null
          };
          repository.addSaleInvoice(invoice);
          if (payload.convertedFromEstimateId) {
            try {
              repository.markEstimateConverted(payload.convertedFromEstimateId, invoice.invoiceNo);
            } catch (e) {
              console.error("Failed to mark estimate as converted", e);
            }
          }
          try {
            const paymentModeLower = String(invoice.paymentMode).toLowerCase();
            const balanceAmount = Number(invoice.balance || 0);
            const totalAmount = Number(invoice.amount || 0);
            const receivedAmount = Math.max(0, totalAmount - balanceAmount);
            console.log("[POS Sale] paymentMode:", invoice.paymentMode, "| amount:", totalAmount, "| balance:", balanceAmount, "| id:", invoice.id);
            if (invoice.partyId && balanceAmount > 0) {
              const allParties = repository.getParties();
              const party = allParties.find((p) => String(p.id) === String(invoice.partyId));
              if (party) {
                party.balance = Number(party.balance || 0) + balanceAmount;
                repository.upsertParty(party);
              }
            }
            if (paymentModeLower === "cash" || paymentModeLower === "credit") {
              if (receivedAmount > 0) {
                try {
                  repository.addCashInHandTransaction({
                    id: invoice.id + "_cash_pos",
                    date: invoice.date,
                    name: invoice.partyName || "Cash Sale",
                    type: "POS Sale",
                    amount: receivedAmount
                  });
                  console.log("[POS Sale] Cash transaction saved successfully");
                } catch (cashErr) {
                  console.error("[POS Sale] addCashInHandTransaction failed:", cashErr);
                }
              }
            } else {
              if (receivedAmount > 0) {
                repository.addBankAccountTransaction({
                  id: "bank_pos_" + invoice.id,
                  date: invoice.date,
                  name: invoice.partyName || "POS Sale",
                  type: "POS Sale",
                  amount: receivedAmount,
                  paymentType: invoice.paymentMode
                });
              }
            }
          } catch (txError) {
            console.error("[POS Sale] Failed to update cash/bank/party balance:", txError);
          }
          try {
            const allItems = repository.getItems();
            let lineItemsUpdated = false;
            for (const lineItem of lineItems) {
              const soldQty = Number(lineItem.quantity ?? lineItem.qty ?? 0);
              if (!lineItem.itemId || soldQty <= 0) continue;
              lineItem.quantity = soldQty;
              const dbItem = allItems.find((i) => String(i.id) === String(lineItem.itemId));
              if (!dbItem) continue;
              const isSecondary = lineItem.unit === dbItem.secondary_unit;
              try {
                const fifoResult = repository.deductItemStockFifo(
                  lineItem.itemId,
                  soldQty,
                  isSecondary,
                  dbItem.conversion_rate
                );
                if (fifoResult && typeof fifoResult.costPerUnit === "number") {
                  lineItem.costPrice = fifoResult.costPerUnit;
                  lineItem.totalCost = fifoResult.valueToDeduct;
                  lineItemsUpdated = true;
                }
              } catch (fifoErr) {
                console.error("[Sale] Failed fifo deduction for item:", lineItem.itemId, fifoErr);
              }
              if (lineItem.costPrice == null) {
                const fallbackPrice = Number(dbItem.purchase_price || 0);
                lineItem.costPrice = fallbackPrice;
                lineItem.totalCost = soldQty * fallbackPrice;
                lineItemsUpdated = true;
              }
            }
            if (lineItemsUpdated) {
              invoice.lineItemsJson = JSON.stringify(lineItems);
              repository.updateSaleInvoice(invoice.id, invoice);
            }
          } catch (stockError) {
            console.error("Failed to deduct stock:", stockError);
          }
          res.statusCode = 201;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(invoice));
        } catch (error) {
          if (createdImagePath) {
            removeManagedAttachmentFile(createdImagePath);
          }
          if (createdDocumentPath) {
            removeManagedAttachmentFile(createdDocumentPath);
          }
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Invalid JSON payload." }));
        }
        return;
      }
      if (req.method === "PUT") {
        let createdImagePath = null;
        let createdDocumentPath = null;
        try {
          const pathId = requestUrl.pathname.split("/").filter(Boolean)[0];
          const queryId = requestUrl.searchParams.get("id");
          const id = (pathId || queryId || "").trim();
          if (!id) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ message: "Sale invoice id is required." }));
            return;
          }
          const existingInvoice = repository.getSaleInvoiceById(id);
          if (!existingInvoice) {
            res.statusCode = 404;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ message: "Sale invoice not found." }));
            return;
          }
          const payload = await parseJsonBody(req);
          const lineItems = Array.isArray(payload.lineItems) ? payload.lineItems : JSON.parse(existingInvoice.line_items_json ?? "[]");
          const imageFile = payload.imageDataUrl !== void 0 ? resolveSaleAttachment(payload.imageDataUrl, "sale_invoice_image") : null;
          createdImagePath = imageFile?.filePath ?? null;
          const documentFile = payload.documentDataUrl !== void 0 ? resolveSaleAttachment(payload.documentDataUrl, "sale_invoice_document") : null;
          createdDocumentPath = documentFile?.filePath ?? null;
          const roundOffFlag = payload.roundOff ?? existingInvoice.round_off;
          const invoice = {
            invoiceNo: String(payload.invoiceNo ?? existingInvoice.invoice_no),
            date: String(payload.date ?? existingInvoice.date),
            partyName: String(payload.partyName ?? existingInvoice.party_name).trim(),
            partyId: payload.partyId ? String(payload.partyId) : existingInvoice.party_id ?? null,
            partyPhone: payload.partyPhone ? String(payload.partyPhone) : existingInvoice.party_phone ?? null,
            transactionType: String(payload.transactionType ?? existingInvoice.transaction_type ?? "Sale"),
            paymentType: String(payload.paymentType ?? existingInvoice.payment_type ?? "Credit"),
            paymentMode: String(payload.paymentMode ?? existingInvoice.payment_mode ?? "credit"),
            subtotal: Number.isFinite(Number(payload.subtotal)) ? Number(payload.subtotal) : Number(existingInvoice.subtotal ?? 0),
            discountPercent: Number.isFinite(Number(payload.discountPercent)) ? Number(payload.discountPercent) : Number(existingInvoice.discount_percent ?? 0),
            discountAmount: Number.isFinite(Number(payload.discountAmount)) ? Number(payload.discountAmount) : Number(existingInvoice.discount_amount ?? 0),
            taxLabel: payload.taxLabel ? String(payload.taxLabel) : existingInvoice.tax_label ?? null,
            taxRate: Number.isFinite(Number(payload.taxRate)) ? Number(payload.taxRate) : Number(existingInvoice.tax_rate ?? 0),
            taxAmount: Number.isFinite(Number(payload.taxAmount)) ? Number(payload.taxAmount) : Number(existingInvoice.tax_amount ?? 0),
            roundOff: roundOffFlag ? 1 : 0,
            roundOffAmount: Number.isFinite(Number(payload.roundOffAmount)) ? Number(payload.roundOffAmount) : Number(existingInvoice.round_off_amount ?? 0),
            amount: Number.isFinite(Number(payload.amount)) ? Number(payload.amount) : Number(existingInvoice.amount ?? 0),
            balance: Number.isFinite(Number(payload.balance)) ? Number(payload.balance) : Number(existingInvoice.balance ?? 0),
            description: payload.description ? String(payload.description) : existingInvoice.description ?? null,
            lineItemsJson: JSON.stringify(lineItems),
            attachmentImagePath: payload.imageDataUrl !== void 0 ? createdImagePath : existingInvoice.attachment_image_path ?? null,
            attachmentImageName: payload.imageDataUrl !== void 0 ? imageFile?.fileName ?? null : existingInvoice.attachment_image_name ?? null,
            attachmentDocumentPath: payload.documentDataUrl !== void 0 ? createdDocumentPath : existingInvoice.attachment_document_path ?? null,
            attachmentDocumentName: payload.documentDataUrl !== void 0 ? documentFile?.fileName ?? null : existingInvoice.attachment_document_name ?? null
          };
          repository.updateSaleInvoice(id, invoice);
          try {
            const oldLineItems = JSON.parse(existingInvoice.line_items_json || "[]");
            const allItemsBeforeRestore = repository.getItems();
            for (const oldItem of oldLineItems) {
              const oldQty = Number(oldItem.quantity ?? oldItem.qty ?? 0);
              if (!oldItem.itemId || oldQty <= 0) continue;
              const dbItem = allItemsBeforeRestore.find((i) => String(i.id) === String(oldItem.itemId));
              if (!dbItem) continue;
              const isSecondary = oldItem.unit === dbItem.secondary_unit;
              try {
                repository.restoreItemStockFifo(
                  oldItem.itemId,
                  oldQty,
                  isSecondary,
                  dbItem.conversion_rate
                );
              } catch (restoreErr) {
                console.error("[Edit Sale] Failed to restore stock for item:", oldItem.itemId, restoreErr);
              }
            }
            const allItemsAfterRestore = repository.getItems();
            let lineItemsUpdated = false;
            for (const newItem of lineItems) {
              const newQty = Number(newItem.quantity ?? newItem.qty ?? 0);
              if (!newItem.itemId || newQty <= 0) continue;
              newItem.quantity = newQty;
              const dbItem = allItemsAfterRestore.find((i) => String(i.id) === String(newItem.itemId));
              const isSecondary = dbItem ? newItem.unit === dbItem.secondary_unit : false;
              const convRate = dbItem?.conversion_rate;
              try {
                const fifoResult = repository.deductItemStockFifo(
                  newItem.itemId,
                  newQty,
                  isSecondary,
                  convRate
                );
                if (fifoResult && typeof fifoResult.costPerUnit === "number") {
                  newItem.costPrice = fifoResult.costPerUnit;
                  newItem.totalCost = fifoResult.valueToDeduct;
                  lineItemsUpdated = true;
                }
              } catch (deductErr) {
                console.error("[Edit Sale] Failed to deduct fifo for item:", newItem.itemId, deductErr);
              }
              if (newItem.costPrice == null && dbItem) {
                const fallbackPrice = Number(dbItem.purchase_price || 0);
                newItem.costPrice = fallbackPrice;
                newItem.totalCost = newQty * fallbackPrice;
                lineItemsUpdated = true;
              }
            }
            if (lineItemsUpdated) {
              invoice.lineItemsJson = JSON.stringify(lineItems);
              repository.updateSaleInvoice(id, invoice);
            }
          } catch (stockError) {
            console.error("[Edit Sale] Failed to update stock:", stockError);
          }
          try {
            const oldBalance = Number(existingInvoice.balance || 0);
            const oldPartyId = existingInvoice.party_id;
            if (oldPartyId && oldBalance > 0) {
              const allParties = repository.getParties();
              const oldParty = allParties.find((p) => String(p.id) === String(oldPartyId));
              if (oldParty) {
                oldParty.balance = Number(oldParty.balance || 0) - oldBalance;
                repository.upsertParty(oldParty);
              }
            }
            const newBalance = Number(invoice.balance || 0);
            const newPartyId = invoice.partyId;
            if (newPartyId && newBalance > 0) {
              const allParties = repository.getParties();
              const newParty = allParties.find((p) => String(p.id) === String(newPartyId));
              if (newParty) {
                newParty.balance = Number(newParty.balance || 0) + newBalance;
                repository.upsertParty(newParty);
              }
            }
          } catch (balanceError) {
            console.error("[Edit Sale] Failed to update party balance:", balanceError);
          }
          try {
            repository.deleteCashInHandTransactionsForSale(id);
            repository.deleteBankAccountTransactionsForSale(id);
            const newPaymentModeLower = String(invoice.paymentMode).toLowerCase();
            const newTotalAmount = Number(invoice.amount || 0);
            const newReceivedAmount = Math.max(0, newTotalAmount - Number(invoice.balance || 0));
            if ((newPaymentModeLower === "cash" || newPaymentModeLower === "credit") && newReceivedAmount > 0) {
              repository.addCashInHandTransaction({
                id: id + "_cash_pos",
                date: invoice.date,
                name: invoice.partyName || "Cash Sale",
                type: "POS Sale",
                amount: newReceivedAmount
              });
            } else if (newPaymentModeLower !== "cash" && newPaymentModeLower !== "credit" && newReceivedAmount > 0) {
              repository.addBankAccountTransaction({
                id: "bank_pos_" + id,
                date: invoice.date,
                name: invoice.partyName || "POS Sale",
                type: "POS Sale",
                amount: newReceivedAmount,
                paymentType: invoice.paymentMode
              });
            }
          } catch (txError) {
            console.error("[Edit Sale] Failed to update cash/bank transaction:", txError);
          }
          if (existingInvoice.attachment_image_path && payload.imageDataUrl !== void 0 && existingInvoice.attachment_image_path !== createdImagePath) {
            removeManagedAttachmentFile(existingInvoice.attachment_image_path);
          }
          if (existingInvoice.attachment_document_path && payload.documentDataUrl !== void 0 && existingInvoice.attachment_document_path !== createdDocumentPath) {
            removeManagedAttachmentFile(existingInvoice.attachment_document_path);
          }
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ id, ...invoice }));
        } catch {
          if (createdImagePath) {
            removeManagedAttachmentFile(createdImagePath);
          }
          if (createdDocumentPath) {
            removeManagedAttachmentFile(createdDocumentPath);
          }
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Invalid JSON payload." }));
        }
        return;
      }
      if (req.method === "DELETE") {
        const pathId = requestUrl.pathname.split("/").filter(Boolean)[0];
        const queryId = requestUrl.searchParams.get("id");
        const id = (pathId || queryId || "").trim();
        if (!id) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Sale invoice id is required." }));
          return;
        }
        const existingInvoice = repository.getSaleInvoiceById(id);
        if (existingInvoice) {
          if (!existingInvoice.transaction_type?.includes("Returned")) {
            try {
              const lineItems = JSON.parse(existingInvoice.line_items_json || "[]");
              const allItems = repository.getItems();
              for (const lineItem of lineItems) {
                if (!lineItem.itemId || !lineItem.quantity) continue;
                const dbItem = allItems.find((i) => String(i.id) === String(lineItem.itemId));
                if (!dbItem) continue;
                const isSecondary = lineItem.unit === dbItem.secondary_unit;
                repository.restoreItemStockFifo(
                  lineItem.itemId,
                  Number(lineItem.quantity),
                  isSecondary,
                  dbItem.conversion_rate
                );
              }
            } catch (stockError) {
              console.error("Failed to restore stock:", stockError);
            }
            if (String(existingInvoice.payment_mode).toLowerCase() === "credit" && existingInvoice.party_id) {
              try {
                const allParties = repository.getParties();
                const party = allParties.find((p) => String(p.id) === String(existingInvoice.party_id));
                if (party) {
                  party.balance = Number(party.balance || 0) - Number(existingInvoice.balance || 0);
                  repository.upsertParty(party);
                }
              } catch (balanceError) {
                console.error("Failed to restore party balance:", balanceError);
              }
            }
            try {
              repository.deleteCashInHandTransactionsForSale(id);
              repository.deleteBankAccountTransactionsForSale(id);
            } catch (txError) {
              console.error("Failed to delete cash/bank transaction:", txError);
            }
          }
        }
        const deleted = repository.deleteSaleInvoice(id);
        if (!deleted) {
          res.statusCode = 404;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Sale invoice not found." }));
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
          console.error("Failed to remove sale invoice attachments on delete:", error);
        }
        res.statusCode = 204;
        res.end();
        return;
      }
      if (req.method === "POST" && requestUrl.pathname.endsWith("/return")) {
        const parts = requestUrl.pathname.split("/").filter(Boolean);
        let id = "";
        if (parts.length >= 2 && parts[parts.length - 1] === "return") {
          id = parts[parts.length - 2];
        } else {
          id = requestUrl.searchParams.get("id") || "";
        }
        if (!id) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Sale invoice id is required." }));
          return;
        }
        const existingInvoice = repository.getSaleInvoiceById(id);
        if (!existingInvoice) {
          res.statusCode = 404;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Sale invoice not found." }));
          return;
        }
        if (existingInvoice.transaction_type?.includes("Returned")) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Sale invoice is already returned." }));
          return;
        }
        try {
          const lineItems = JSON.parse(existingInvoice.line_items_json || "[]");
          const allItems = repository.getItems();
          for (const lineItem of lineItems) {
            if (!lineItem.itemId || !lineItem.quantity) continue;
            const dbItem = allItems.find((i) => String(i.id) === String(lineItem.itemId));
            if (!dbItem) continue;
            const isSecondary = lineItem.unit === dbItem.secondary_unit;
            repository.restoreItemStockFifo(
              lineItem.itemId,
              Number(lineItem.quantity),
              isSecondary,
              dbItem.conversion_rate
            );
          }
        } catch (stockError) {
          console.error("Failed to restore stock:", stockError);
        }
        if (String(existingInvoice.payment_mode).toLowerCase() === "credit" && existingInvoice.party_id) {
          try {
            const allParties = repository.getParties();
            const party = allParties.find((p) => String(p.id) === String(existingInvoice.party_id));
            if (party) {
              party.balance = Number(party.balance || 0) - Number(existingInvoice.balance || 0);
              repository.upsertParty(party);
            }
          } catch (balanceError) {
            console.error("Failed to restore party balance:", balanceError);
          }
        }
        try {
          repository.deleteCashInHandTransactionsForSale(id);
          repository.deleteBankAccountTransactionsForSale(id);
        } catch (txError) {
          console.error("Failed to delete cash/bank transaction on return:", txError);
        }
        const updatedInvoice = {
          invoiceNo: existingInvoice.invoice_no,
          date: existingInvoice.date,
          partyName: existingInvoice.party_name,
          partyId: existingInvoice.party_id,
          partyPhone: existingInvoice.party_phone,
          transactionType: "Returned",
          paymentType: existingInvoice.payment_type,
          paymentMode: existingInvoice.payment_mode,
          subtotal: existingInvoice.subtotal,
          discountPercent: existingInvoice.discount_percent,
          discountAmount: existingInvoice.discount_amount,
          taxLabel: existingInvoice.tax_label,
          taxRate: existingInvoice.tax_rate,
          taxAmount: existingInvoice.tax_amount,
          roundOff: existingInvoice.round_off,
          roundOffAmount: existingInvoice.round_off_amount,
          amount: existingInvoice.amount,
          balance: existingInvoice.balance,
          description: existingInvoice.description,
          lineItemsJson: existingInvoice.line_items_json,
          attachmentImagePath: existingInvoice.attachment_image_path,
          attachmentImageName: existingInvoice.attachment_image_name,
          attachmentDocumentPath: existingInvoice.attachment_document_path,
          attachmentDocumentName: existingInvoice.attachment_document_name
        };
        repository.updateSaleInvoice(id, updatedInvoice);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ message: "Sale returned successfully", updatedInvoice }));
        return;
      }
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Method not allowed." }));
    } catch (err) {
      console.error("SALE INVOICE 500 ERROR:", err);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Failed to process request." }));
    }
  });
  server.middlewares.use("/api/purchase_bills", async (req, res) => {
    try {
      const repository = await import("../database/sqlite/repository.mjs");
      const requestUrl = new URL(req.url ?? "/", "http://localhost");
      const resolvePurchaseAttachment = (rawValue, prefix) => {
        if (!rawValue || typeof rawValue !== "string") {
          return null;
        }
        const trimmedValue = rawValue.trim();
        if (!trimmedValue) {
          return null;
        }
        if (trimmedValue.startsWith("/app_data/purchase_attachments/")) {
          return {
            filePath: trimmedValue,
            fileName: path.basename(trimmedValue)
          };
        }
        return saveDataUrlToAppData({
          dataUrl: trimmedValue,
          prefix,
          targetRoot: purchaseAttachmentsRoot
        });
      };
      if (req.method === "GET") {
        const checkConsumedId = requestUrl.searchParams.get("checkConsumed") || requestUrl.searchParams.get("check_consumed");
        if (checkConsumedId) {
          const consumed = repository.isPurchaseFifoConsumed(checkConsumedId);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ consumed }));
          return;
        }
        const purchaseBills = repository.getPurchaseBills();
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(purchaseBills));
        return;
      }
      if (req.method === "POST") {
        let createdImagePath = null;
        let createdDocumentPath = null;
        try {
          const payload = await parseJsonBody(req);
          if (!payload.partyName || !String(payload.partyName).trim()) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ message: "Party name is required." }));
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
          const imageFile = resolvePurchaseAttachment(payload.imageDataUrl, "purchase_bill_image");
          createdImagePath = imageFile?.filePath ?? null;
          const documentFile = resolvePurchaseAttachment(payload.documentDataUrl, "purchase_bill_document");
          createdDocumentPath = documentFile?.filePath ?? null;
          const invoice = {
            id: String(payload.id ?? Date.now().toString()),
            invoiceNo: String(payload.invoiceNo ?? repository.getNextPurchaseBillNo()),
            date: String(payload.date ?? (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")),
            partyName: String(payload.partyName).trim(),
            partyId: payload.partyId ? String(payload.partyId) : null,
            partyPhone: payload.partyPhone ? String(payload.partyPhone) : null,
            transactionType: "Purchase",
            paymentType: String(payload.paymentType ?? "Credit"),
            paymentMode: String(payload.paymentMode ?? "credit"),
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
            status: balance === 0 ? "Paid" : "Unpaid",
            description: payload.description ? String(payload.description) : null,
            lineItemsJson: JSON.stringify(lineItems),
            attachmentImagePath: imageFile?.filePath ?? null,
            attachmentImageName: imageFile?.fileName ?? null,
            attachmentDocumentPath: documentFile?.filePath ?? null,
            attachmentDocumentName: documentFile?.fileName ?? null
          };
          const validationPaidAmount = Number(invoice.amount || 0) - Number(invoice.balance || 0);
          if (validationPaidAmount > 0 && String(invoice.paymentMode).toLowerCase() !== "cash" && String(invoice.paymentMode).toLowerCase() !== "credit") {
            const bankAccounts = repository.getBankAccounts();
            const bankAccount = bankAccounts.find((acc) => String(acc.name).trim().toLowerCase() === String(invoice.paymentMode).trim().toLowerCase());
            if (bankAccount) {
              const currentBalance = Number(bankAccount.balance) || 0;
              if (currentBalance < validationPaidAmount) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ message: `Insufficient balance in bank account: ${bankAccount.name}` }));
                return;
              }
            }
          }
          repository.addPurchaseBill(invoice);
          try {
            const paidAmount = Number(invoice.amount || 0) - Number(invoice.balance || 0);
            if (paidAmount > 0) {
              if (String(invoice.paymentMode).toLowerCase() === "cash") {
                repository.addCashInHandTransaction({
                  id: "cash_purchase_" + invoice.id,
                  date: invoice.date,
                  name: invoice.partyName || "Cash Purchase",
                  type: "Purchase Bill",
                  amount: -paidAmount
                });
              } else if (String(invoice.paymentMode).toLowerCase() !== "credit") {
                repository.addBankAccountTransaction({
                  id: "bank_purchase_" + invoice.id,
                  date: invoice.date,
                  name: invoice.partyName || "Bank Purchase",
                  type: "Purchase Bill",
                  amount: -paidAmount,
                  paymentType: invoice.paymentMode
                });
              }
            }
            if (invoice.partyId) {
              const allParties = repository.getParties();
              const party = allParties.find((p) => String(p.id) === String(invoice.partyId));
              if (party) {
                party.balance = Number(party.balance || 0) - Number(invoice.balance || 0);
                repository.upsertParty(party);
              }
            }
          } catch (txError) {
            console.error("Failed to update cash/bank/credit balance for purchase:", txError);
          }
          try {
            const allItems = repository.getItems();
            for (let i = 0; i < lineItems.length; i++) {
              const lineItem = lineItems[i];
              if (!lineItem.itemId || !lineItem.quantity) continue;
              const dbItem = allItems.find((i2) => i2.id === lineItem.itemId);
              if (!dbItem) continue;
              const isSecondary = lineItem.unit === dbItem.secondary_unit;
              const lineItemId = lineItem.id || `line_${i}`;
              repository.addPurchaseStock(
                lineItem.itemId,
                lineItem.quantity,
                isSecondary,
                dbItem.conversion_rate,
                lineItem.price ?? 0,
                invoice.id,
                lineItemId,
                invoice.date,
                dbItem.name
              );
            }
          } catch (stockError) {
            console.error("Failed to add stock for purchase:", stockError);
          }
          res.statusCode = 201;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(invoice));
        } catch (err) {
          console.error("DEBUG: POST /api/purchase_bills error:", err);
          if (createdImagePath) {
            removeManagedAttachmentFile(createdImagePath);
          }
          if (createdDocumentPath) {
            removeManagedAttachmentFile(createdDocumentPath);
          }
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Invalid JSON payload.", error: String(err) }));
        }
        return;
      }
      if (req.method === "PUT") {
        let createdImagePath = null;
        let createdDocumentPath = null;
        let existingInvoice = null;
        try {
          const pathId = requestUrl.pathname.split("/").filter(Boolean)[0];
          const queryId = requestUrl.searchParams.get("id");
          const id = (pathId || queryId || "").trim();
          if (!id) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ message: "Purchase bill id is required." }));
            return;
          }
          existingInvoice = repository.getPurchaseBillById(id);
          if (!existingInvoice) {
            res.statusCode = 404;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ message: "Purchase bill not found." }));
            return;
          }
          if (repository.isPurchaseFifoConsumed(id)) {
            res.statusCode = 409;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({
              message: "FIFO_CONSUMED",
              detail: "Sales have already been made from this purchase bill (the remaining stock and stock quantity are not equal). You cannot edit this purchase bill."
            }));
            return;
          }
          const payload = await parseJsonBody(req);
          const lineItems = Array.isArray(payload.lineItems) ? payload.lineItems : JSON.parse(existingInvoice.line_items_json ?? "[]");
          const imageFile = payload.imageDataUrl ? resolvePurchaseAttachment(payload.imageDataUrl, "purchase_bill_image") : null;
          createdImagePath = imageFile?.filePath ?? null;
          const documentFile = payload.documentDataUrl ? resolvePurchaseAttachment(payload.documentDataUrl, "purchase_bill_document") : null;
          createdDocumentPath = documentFile?.filePath ?? null;
          const roundOffFlag = payload.roundOff ?? existingInvoice.round_off;
          const resolvedBalance = Number.isFinite(Number(payload.balance)) ? Number(payload.balance) : Number(existingInvoice.balance ?? 0);
          const invoice = {
            invoiceNo: String(payload.invoiceNo ?? existingInvoice.invoice_no),
            date: String(payload.date ?? existingInvoice.date),
            partyName: String(payload.partyName ?? existingInvoice.party_name).trim(),
            partyId: payload.partyId ? String(payload.partyId) : existingInvoice.party_id ?? null,
            partyPhone: payload.partyPhone ? String(payload.partyPhone) : existingInvoice.party_phone ?? null,
            transactionType: String(payload.transactionType ?? existingInvoice.transaction_type ?? "Purchase"),
            paymentType: String(payload.paymentType ?? existingInvoice.payment_type ?? "Credit"),
            paymentMode: String(payload.paymentMode ?? existingInvoice.payment_mode ?? "credit"),
            subtotal: Number.isFinite(Number(payload.subtotal)) ? Number(payload.subtotal) : Number(existingInvoice.subtotal ?? 0),
            discountPercent: Number.isFinite(Number(payload.discountPercent)) ? Number(payload.discountPercent) : Number(existingInvoice.discount_percent ?? 0),
            discountAmount: Number.isFinite(Number(payload.discountAmount)) ? Number(payload.discountAmount) : Number(existingInvoice.discount_amount ?? 0),
            taxLabel: payload.taxLabel ? String(payload.taxLabel) : existingInvoice.tax_label ?? null,
            taxRate: Number.isFinite(Number(payload.taxRate)) ? Number(payload.taxRate) : Number(existingInvoice.tax_rate ?? 0),
            taxAmount: Number.isFinite(Number(payload.taxAmount)) ? Number(payload.taxAmount) : Number(existingInvoice.tax_amount ?? 0),
            roundOff: roundOffFlag ? 1 : 0,
            roundOffAmount: Number.isFinite(Number(payload.roundOffAmount)) ? Number(payload.roundOffAmount) : Number(existingInvoice.round_off_amount ?? 0),
            amount: Number.isFinite(Number(payload.amount)) ? Number(payload.amount) : Number(existingInvoice.amount ?? 0),
            balance: resolvedBalance,
            status: resolvedBalance === 0 ? "Paid" : "Unpaid",
            description: payload.description ? String(payload.description) : existingInvoice.description ?? null,
            lineItemsJson: JSON.stringify(lineItems),
            attachmentImagePath: createdImagePath,
            attachmentImageName: imageFile?.fileName ?? null,
            attachmentDocumentPath: createdDocumentPath,
            attachmentDocumentName: documentFile?.fileName ?? null
          };
          const validationPaidAmount = Number(invoice.amount || 0) - Number(invoice.balance || 0);
          if (validationPaidAmount > 0 && String(invoice.paymentMode).toLowerCase() !== "cash" && String(invoice.paymentMode).toLowerCase() !== "credit") {
            const bankAccounts = repository.getBankAccounts();
            const bankAccount = bankAccounts.find((acc) => String(acc.name).trim().toLowerCase() === String(invoice.paymentMode).trim().toLowerCase());
            if (bankAccount) {
              let oldAmount = 0;
              const oldPaidAmount = Number(existingInvoice.amount || 0) - Number(existingInvoice.balance || 0);
              if (String(existingInvoice.payment_mode).trim().toLowerCase() === String(invoice.paymentMode).trim().toLowerCase()) {
                oldAmount = oldPaidAmount;
              }
              const currentBalance = Number(bankAccount.balance) || 0;
              if (currentBalance + oldAmount < validationPaidAmount) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ message: `Insufficient balance in bank account: ${bankAccount.name}` }));
                return;
              }
            }
          }
          repository.updatePurchaseBill(id, invoice);
          if (existingInvoice.party_id) {
            try {
              const allParties = repository.getParties();
              const oldParty = allParties.find((p) => String(p.id) === String(existingInvoice.party_id));
              if (oldParty) {
                oldParty.balance = Number(oldParty.balance || 0) + Number(existingInvoice.balance || 0);
                repository.upsertParty(oldParty);
              }
            } catch (balanceError) {
              console.error("Failed to restore old party balance on edit:", balanceError);
            }
          }
          try {
            const oldPMode = String(existingInvoice.payment_mode).toLowerCase();
            if (oldPMode === "cash") {
              repository.deleteCashInHandTransaction("cash_purchase_" + id);
            } else if (oldPMode !== "credit") {
              repository.deleteBankAccountTransaction("bank_purchase_" + id);
            }
          } catch (txError) {
            console.error("Failed to delete old cash/bank transaction on edit:", txError);
          }
          try {
            const oldLineItems = JSON.parse(existingInvoice.line_items_json || "[]");
            const allItems = repository.getItems();
            for (let i = 0; i < oldLineItems.length; i++) {
              const lineItem = oldLineItems[i];
              if (!lineItem.itemId || !lineItem.quantity) continue;
              const dbItem = allItems.find((i2) => String(i2.id) === String(lineItem.itemId));
              if (!dbItem) continue;
              const isSecondary = lineItem.unit === dbItem.secondary_unit;
              const lineItemId = lineItem.id || `line_${i}`;
              repository.removePurchaseStock(
                lineItem.itemId,
                Number(lineItem.quantity),
                isSecondary,
                dbItem.conversion_rate,
                lineItem.price ?? 0,
                id,
                lineItemId
              );
            }
          } catch (stockError) {
            console.error("Failed to restore old stock on edit:", stockError);
          }
          try {
            const paidAmount = Number(invoice.amount || 0) - Number(invoice.balance || 0);
            if (paidAmount > 0) {
              if (String(invoice.paymentMode).toLowerCase() === "cash") {
                repository.addCashInHandTransaction({
                  id: "cash_purchase_" + id,
                  date: invoice.date,
                  name: invoice.partyName || "Cash Purchase",
                  type: "Purchase Bill",
                  amount: -paidAmount
                });
              } else if (String(invoice.paymentMode).toLowerCase() !== "credit") {
                repository.addBankAccountTransaction({
                  id: "bank_purchase_" + id,
                  date: invoice.date,
                  name: invoice.partyName || "Bank Purchase",
                  type: "Purchase Bill",
                  amount: -paidAmount,
                  paymentType: invoice.paymentMode
                });
              }
            }
            if (invoice.partyId) {
              const freshParties = repository.getParties();
              const newParty = freshParties.find((p) => String(p.id) === String(invoice.partyId));
              if (newParty) {
                newParty.balance = Number(newParty.balance || 0) - Number(invoice.balance || 0);
                repository.upsertParty(newParty);
              }
            }
          } catch (txError) {
            console.error("Failed to apply new cash/bank/credit balance for purchase edit:", txError);
          }
          try {
            const allItems = repository.getItems();
            for (let j = 0; j < lineItems.length; j++) {
              const lineItem = lineItems[j];
              if (!lineItem.itemId || !lineItem.quantity) continue;
              const dbItem = allItems.find((i) => i.id === lineItem.itemId);
              if (!dbItem) continue;
              const isSecondary = lineItem.unit === dbItem.secondary_unit;
              const newLineItemId = lineItem.id || `line_${j}`;
              repository.addPurchaseStock(
                lineItem.itemId,
                lineItem.quantity,
                isSecondary,
                dbItem.conversion_rate,
                lineItem.price ?? 0,
                id,
                newLineItemId,
                invoice.date,
                dbItem.name
              );
            }
          } catch (stockError) {
            console.error("Failed to add stock for purchase edit:", stockError);
          }
          if (createdImagePath !== existingInvoice.attachment_image_path && existingInvoice.attachment_image_path) {
            removeManagedPurchaseAttachmentFile(existingInvoice.attachment_image_path);
          }
          if (createdDocumentPath !== existingInvoice.attachment_document_path && existingInvoice.attachment_document_path) {
            removeManagedPurchaseAttachmentFile(existingInvoice.attachment_document_path);
          }
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ id, ...invoice }));
        } catch {
          if (createdImagePath && createdImagePath !== existingInvoice?.attachment_image_path) {
            removeManagedPurchaseAttachmentFile(createdImagePath);
          }
          if (createdDocumentPath && createdDocumentPath !== existingInvoice?.attachment_document_path) {
            removeManagedPurchaseAttachmentFile(createdDocumentPath);
          }
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Invalid JSON payload." }));
        }
        return;
      }
      if (req.method === "DELETE") {
        const pathId = requestUrl.pathname.split("/").filter(Boolean)[0];
        const queryId = requestUrl.searchParams.get("id");
        const id = (pathId || queryId || "").trim();
        if (!id) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Purchase bill id is required." }));
          return;
        }
        const existingInvoice = repository.getPurchaseBillById(id);
        if (repository.isPurchaseFifoConsumed(id)) {
          res.statusCode = 409;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({
            message: "FIFO_CONSUMED",
            detail: "This purchase has stock that has already been sold or reduced. Delete the related Sale and Reduce Stock transactions first."
          }));
          return;
        }
        if (existingInvoice) {
          try {
            const lineItems = JSON.parse(existingInvoice.line_items_json || "[]");
            const allItems = repository.getItems();
            for (let i = 0; i < lineItems.length; i++) {
              const lineItem = lineItems[i];
              if (!lineItem.itemId || !lineItem.quantity) continue;
              const dbItem = allItems.find((i2) => String(i2.id) === String(lineItem.itemId));
              if (!dbItem) continue;
              const isSecondary = lineItem.unit === dbItem.secondary_unit;
              const lineItemId = lineItem.id || `line_${i}`;
              repository.removePurchaseStock(
                lineItem.itemId,
                Number(lineItem.quantity),
                isSecondary,
                dbItem.conversion_rate,
                lineItem.price ?? 0,
                id,
                lineItemId
              );
            }
          } catch (stockError) {
            console.error("Failed to restore stock:", stockError);
          }
          if (existingInvoice.party_id) {
            try {
              const allParties = repository.getParties();
              const party = allParties.find((p) => String(p.id) === String(existingInvoice.party_id));
              if (party) {
                party.balance = Number(party.balance || 0) + Number(existingInvoice.balance || 0);
                repository.upsertParty(party);
              }
            } catch (balanceError) {
              console.error("Failed to restore party balance:", balanceError);
            }
          }
          if (existingInvoice.attachment_image_path) {
            removeManagedPurchaseAttachmentFile(existingInvoice.attachment_image_path);
          }
          if (existingInvoice.attachment_document_path) {
            removeManagedPurchaseAttachmentFile(existingInvoice.attachment_document_path);
          }
          try {
            const pMode = String(existingInvoice.payment_mode).toLowerCase();
            if (pMode === "cash") {
              repository.deleteCashInHandTransaction("cash_purchase_" + id);
            } else if (pMode !== "credit") {
              repository.deleteBankAccountTransaction("bank_purchase_" + id);
            }
          } catch (txError) {
            console.error("Failed to delete cash/bank transaction:", txError);
          }
        }
        const deleted = repository.deletePurchaseBill(id);
        if (!deleted) {
          res.statusCode = 404;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Purchase bill not found." }));
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
          console.error("Failed to remove purchase bill attachments on delete:", error);
        }
        res.statusCode = 204;
        res.end();
        return;
      }
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Method not allowed." }));
    } catch {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Failed to process request." }));
    }
  });
  server.middlewares.use("/api/recycle_bin/restore", async (req, res) => {
    try {
      const repository = await import("../database/sqlite/repository.mjs");
      if (req.method === "POST") {
        const chunks = [];
        req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        req.on("end", async () => {
          try {
            const raw = Buffer.concat(chunks).toString("utf8");
            const payload = raw ? JSON.parse(raw) : {};
            if (!payload.id) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ message: "ID is required." }));
              return;
            }
            const allRecycleBinItems = repository.getRecycleBinItems();
            const targetIndex = allRecycleBinItems.findIndex((i) => String(i.id) === String(payload.id));
            if (targetIndex < 0) {
              res.statusCode = 404;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ message: "Item not found in recycle bin." }));
              return;
            }
            if (targetIndex > 0) {
              const newerItem = allRecycleBinItems[0];
              const newerLabel = newerItem.party_name || newerItem.ref_no || newerItem.txn_type || "record";
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({
                message: `Restoration order constraint: Items must be restored in reverse order of deletion. Please restore '${newerLabel}' first.`
              }));
              return;
            }
            const recycleBinItem = allRecycleBinItems[targetIndex];
            const rowData = JSON.parse(recycleBinItem.data_payload || "{}");
            const originalTable = recycleBinItem.original_table;
            const originalId = recycleBinItem.original_id;
            const success = repository.restoreRecycleBinItem(payload.id);
            if (!success) {
              res.statusCode = 404;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ message: "Failed to restore item." }));
              return;
            }
            try {
              if (originalTable === "sale_invoices") {
                if (!rowData.transaction_type?.includes("Returned")) {
                  try {
                    const lineItems = JSON.parse(rowData.line_items_json || "[]");
                    const allItems = repository.getItems();
                    for (const lineItem of lineItems) {
                      if (!lineItem.itemId || !lineItem.quantity) continue;
                      const dbItem = allItems.find((i) => String(i.id) === String(lineItem.itemId));
                      if (!dbItem) continue;
                      const isSecondary = lineItem.unit === dbItem.secondary_unit;
                      repository.deductItemStockFifo(
                        lineItem.itemId,
                        Number(lineItem.quantity),
                        isSecondary,
                        dbItem.conversion_rate
                      );
                    }
                  } catch (stockErr) {
                    console.error("[Restore Sale] Stock deduction failed:", stockErr);
                  }
                  const balanceAmount = Number(rowData.balance || 0);
                  if (rowData.party_id && balanceAmount > 0) {
                    try {
                      const allParties = repository.getParties();
                      const party = allParties.find((p) => String(p.id) === String(rowData.party_id));
                      if (party) {
                        party.balance = Number(party.balance || 0) + balanceAmount;
                        repository.upsertParty(party);
                      }
                    } catch (balErr) {
                      console.error("[Restore Sale] Party balance update failed:", balErr);
                    }
                  }
                  try {
                    const paymentModeLower = String(rowData.payment_mode || "").toLowerCase();
                    const totalAmount = Number(rowData.amount || 0);
                    const receivedAmount = Math.max(0, totalAmount - Number(rowData.balance || 0));
                    if (receivedAmount > 0) {
                      if (paymentModeLower === "cash" || paymentModeLower === "credit") {
                        repository.addCashInHandTransaction({
                          id: originalId + "_cash_pos",
                          date: rowData.date,
                          name: rowData.party_name || "Cash Sale",
                          type: rowData.transaction_type || "Sale",
                          amount: receivedAmount
                        });
                      } else {
                        repository.addBankAccountTransaction({
                          id: "bank_pos_" + originalId,
                          date: rowData.date,
                          name: rowData.party_name || "Sale",
                          type: rowData.transaction_type || "Sale",
                          amount: receivedAmount,
                          paymentType: rowData.payment_mode
                        });
                      }
                    }
                  } catch (txErr) {
                    console.error("[Restore Sale] Cash/bank tx creation failed:", txErr);
                  }
                }
              } else if (originalTable === "purchase_bills") {
                try {
                  const lineItems = JSON.parse(rowData.line_items_json || "[]");
                  const allItems = repository.getItems();
                  for (let i = 0; i < lineItems.length; i++) {
                    const lineItem = lineItems[i];
                    if (!lineItem.itemId || !lineItem.quantity) continue;
                    const dbItem = allItems.find((it) => String(it.id) === String(lineItem.itemId));
                    if (!dbItem) continue;
                    const isSecondary = lineItem.unit === dbItem.secondary_unit;
                    const lineItemId = lineItem.id || `line_${i}`;
                    repository.addPurchaseStock(
                      lineItem.itemId,
                      Number(lineItem.quantity),
                      isSecondary,
                      dbItem.conversion_rate,
                      lineItem.price ?? 0,
                      originalId,
                      lineItemId,
                      rowData.date,
                      dbItem.name
                    );
                  }
                } catch (stockErr) {
                  console.error("[Restore Purchase] Stock re-add failed:", stockErr);
                }
                if (rowData.party_id) {
                  try {
                    const allParties = repository.getParties();
                    const party = allParties.find((p) => String(p.id) === String(rowData.party_id));
                    if (party) {
                      party.balance = Number(party.balance || 0) - Number(rowData.balance || 0);
                      repository.upsertParty(party);
                    }
                  } catch (balErr) {
                    console.error("[Restore Purchase] Party balance update failed:", balErr);
                  }
                }
                try {
                  const paidAmount = Number(rowData.amount || 0) - Number(rowData.balance || 0);
                  if (paidAmount > 0) {
                    const paymentModeLower = String(rowData.payment_mode || "").toLowerCase();
                    if (paymentModeLower === "cash") {
                      repository.addCashInHandTransaction({
                        id: "cash_purchase_" + originalId,
                        date: rowData.date,
                        name: rowData.party_name || "Cash Purchase",
                        type: "Purchase Bill",
                        amount: -paidAmount
                      });
                    } else if (paymentModeLower !== "credit") {
                      repository.addBankAccountTransaction({
                        id: "bank_purchase_" + originalId,
                        date: rowData.date,
                        name: rowData.party_name || "Bank Purchase",
                        type: "Purchase Bill",
                        amount: -paidAmount,
                        paymentType: rowData.payment_mode
                      });
                    }
                  }
                } catch (txErr) {
                  console.error("[Restore Purchase] Cash/bank tx creation failed:", txErr);
                }
              } else if (originalTable === "payment_in_records") {
                const partyId = rowData.party_id;
                if (partyId) {
                  try {
                    const allParties = repository.getParties();
                    const party = allParties.find((p) => String(p.id) === String(partyId));
                    if (party) {
                      party.balance = Number(party.balance || 0) - Number(rowData.amount || 0);
                      repository.upsertParty(party);
                    }
                  } catch (balErr) {
                    console.error("[Restore PayIn] Party balance update failed:", balErr);
                  }
                }
                try {
                  const paymentType = rowData.payment_type || rowData.paymentType || "Cash";
                  if (String(paymentType).toLowerCase() === "cash") {
                    repository.addCashInHandTransaction({
                      id: "cash_payment_in_" + originalId,
                      date: rowData.date,
                      name: rowData.party_name,
                      type: "Payment In",
                      amount: Number(rowData.amount || 0)
                    });
                  } else if (paymentType) {
                    repository.addBankAccountTransaction({
                      id: "bank_payment_in_" + originalId,
                      date: rowData.date,
                      name: rowData.party_name,
                      type: "Payment In",
                      amount: Number(rowData.amount || 0),
                      paymentType
                    });
                  }
                } catch (txErr) {
                  console.error("[Restore PayIn] Cash/bank tx creation failed:", txErr);
                }
              } else if (originalTable === "payment_out_records") {
                const partyId = rowData.party_id;
                if (partyId) {
                  try {
                    const allParties = repository.getParties();
                    const party = allParties.find((p) => String(p.id) === String(partyId));
                    if (party) {
                      party.balance = Number(party.balance || 0) + Number(rowData.amount || 0);
                      repository.upsertParty(party);
                    }
                  } catch (balErr) {
                    console.error("[Restore PayOut] Party balance update failed:", balErr);
                  }
                }
                try {
                  const paymentType = rowData.payment_type || rowData.paymentType || "Cash";
                  if (String(paymentType).toLowerCase() === "cash") {
                    repository.addCashInHandTransaction({
                      id: "cash_payment_out_" + originalId,
                      date: rowData.date,
                      name: rowData.party_name,
                      type: "Payment Out",
                      amount: -Number(rowData.amount || 0)
                    });
                  } else if (paymentType) {
                    repository.addBankAccountTransaction({
                      id: "bank_payment_out_" + originalId,
                      date: rowData.date,
                      name: rowData.party_name,
                      type: "Payment Out",
                      amount: -Number(rowData.amount || 0),
                      paymentType
                    });
                  }
                } catch (txErr) {
                  console.error("[Restore PayOut] Cash/bank tx creation failed:", txErr);
                }
              } else if (originalTable === "expense_records") {
                try {
                  const paymentType = rowData.payment_type || "Cash";
                  if (String(paymentType).toLowerCase() === "cash") {
                    repository.addCashInHandTransaction({
                      id: "cash_expense_" + originalId,
                      date: rowData.date,
                      name: rowData.category_name || "Expense",
                      type: "Expense",
                      amount: Number(rowData.amount || 0)
                    });
                  } else {
                    repository.addBankAccountTransaction({
                      id: "bank_expense_" + originalId,
                      date: rowData.date,
                      name: rowData.category_name || "Expense",
                      type: "Expense",
                      amount: -Number(rowData.amount || 0),
                      paymentType
                    });
                  }
                } catch (txErr) {
                  console.error("[Restore Expense] Cash/bank tx creation failed:", txErr);
                }
              } else if (originalTable === "items") {
                const stockQty = Number(rowData.stock_quantity ?? rowData.stockQuantity ?? 0);
                if (stockQty > 0) {
                  try {
                    const allAdjustments = repository.getStockAdjustments();
                    const existingOb = allAdjustments.find(
                      (a) => String(a.item_id) === String(originalId) && a.adjustment_type === "Opening Stock"
                    );
                    if (!existingOb) {
                      repository.addStockAdjustment({
                        itemId: String(originalId),
                        itemName: rowData.name || "",
                        adjustmentType: "Opening Stock",
                        date: rowData.created_at || (/* @__PURE__ */ new Date()).toISOString(),
                        quantity: stockQty,
                        unit: rowData.unit || "",
                        atPrice: rowData.at_price ?? rowData.atPrice ?? null,
                        details: "Opening stock transaction"
                      });
                    }
                  } catch (obErr) {
                    console.error("[Restore Item] Opening stock restoration failed:", obErr);
                  }
                }
              }
            } catch (sideEffectErr) {
              console.error("[Restore] Side-effect application failed:", sideEffectErr);
            }
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ message: "Restored successfully." }));
          } catch (e) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ message: "Invalid payload." }));
          }
        });
        return;
      }
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Method not allowed." }));
    } catch (e) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Server error." }));
    }
  });
  server.middlewares.use("/api/recycle_bin/empty", async (req, res) => {
    try {
      const repository = await import("../database/sqlite/repository.mjs");
      if (req.method === "DELETE") {
        repository.emptyRecycleBin();
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ message: "Recycle bin emptied successfully." }));
        return;
      }
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Method not allowed." }));
    } catch (e) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Server error." }));
    }
  });
  server.middlewares.use("/api/recycle_bin", async (req, res) => {
    try {
      const repository = await import("../database/sqlite/repository.mjs");
      const requestUrl = new URL(req.url ?? "/", "http://localhost");
      if (req.method === "GET") {
        const items = repository.getRecycleBinItems();
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(items));
        return;
      }
      if (req.method === "DELETE") {
        const id = requestUrl.searchParams.get("id");
        if (!id) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "ID is required." }));
          return;
        }
        const success = repository.permanentDeleteRecycleBinItem(id);
        if (success) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Deleted successfully." }));
        } else {
          res.statusCode = 404;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Item not found." }));
        }
        return;
      }
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Method not allowed." }));
    } catch (e) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Server error." }));
    }
  });
  server.middlewares.use("/api/cash_transactions", async (req, res) => {
    try {
      const repository = await import("../database/sqlite/repository.mjs");
      const requestUrl = new URL(req.url ?? "/", "http://localhost");
      if (req.method === "GET") {
        const cashInHand = repository.getCashInHandTransactions();
        const fromTransactions = repository.getCashTransactionsFromTransactions();
        const allMerged = [...cashInHand, ...fromTransactions];
        const uniqueMap = /* @__PURE__ */ new Map();
        allMerged.forEach((tx) => uniqueMap.set(tx.id, tx));
        const merged = Array.from(uniqueMap.values()).sort((a, b) => {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return dateB - dateA;
        });
        const CASH_IN_TYPES = /* @__PURE__ */ new Set([
          "sale",
          "pos sale",
          "payment in",
          "increase cash"
        ]);
        const CASH_OUT_TYPES = /* @__PURE__ */ new Set([
          "expense",
          "purchase bill",
          "pos purchase",
          "payment out",
          "decrease cash"
        ]);
        let totalCash = 0;
        for (const tx of merged) {
          const t = String(tx.type ?? "").toLowerCase().trim();
          const amt = Math.abs(Number(tx.amount) || 0);
          if (CASH_IN_TYPES.has(t)) {
            totalCash += amt;
          } else if (CASH_OUT_TYPES.has(t)) {
            totalCash -= amt;
          }
        }
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ transactions: merged, totalCash }));
        return;
      }
      if (req.method === "POST") {
        const chunks = [];
        req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        req.on("end", () => {
          try {
            const raw = Buffer.concat(chunks).toString("utf8");
            const payload = raw ? JSON.parse(raw) : {};
            if (!payload.amount || Number.isNaN(Number(payload.amount))) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ message: "Valid amount is required." }));
              return;
            }
            const entry = {
              id: payload.id ? String(payload.id) : Date.now().toString(),
              date: String(payload.date || (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")),
              name: String(payload.name || "").trim() || "Cash Adjustment",
              type: String(payload.type).trim(),
              amount: Number(payload.amount)
            };
            repository.addCashInHandTransaction(entry);
            res.statusCode = 201;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(entry));
          } catch {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ message: "Invalid JSON payload." }));
          }
        });
        return;
      }
      if (req.method === "PUT") {
        const pathId = requestUrl.pathname.split("/").filter(Boolean)[0];
        const queryId = requestUrl.searchParams.get("id");
        const id = (pathId || queryId || "").trim();
        if (!id) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Transaction id is required." }));
          return;
        }
        const payload = await parseJsonBody(req);
        const txAmount = id.startsWith("cash_payment_out_")
          ? -Math.abs(Number(payload.amount || 0))
          : Math.abs(Number(payload.amount || 0));
        repository.updateCashInHandTransaction(id, {
          date: payload.date,
          name: payload.name,
          type: payload.type,
          amount: txAmount
        });

        if (id.startsWith("cash_payment_in_")) {
          const paymentInId = id.slice("cash_payment_in_".length);
          const existingRecord = repository.getPaymentInRecordById(paymentInId);
          if (existingRecord) {
            const oldAmount = Math.abs(Number(existingRecord.amount || 0));
            const newAmount = Math.abs(Number(payload.amount || 0));
            if (existingRecord.party_id) {
              try {
                const allParties = repository.getParties();
                const party = allParties.find((p) => String(p.id) === String(existingRecord.party_id));
                if (party) {
                  party.balance = Number(party.balance || 0) + oldAmount - newAmount;
                  repository.upsertParty(party);
                }
              } catch (balanceError) {
                console.error("Failed to update party balance on cash payment in edit:", balanceError);
              }
            }
            existingRecord.amount = newAmount;
            if (payload.date) existingRecord.date = payload.date;
            if (payload.name) existingRecord.party_name = payload.name;
            repository.updatePaymentInRecord(existingRecord);
          }
        }

        if (id.startsWith("cash_payment_out_")) {
          const paymentOutId = id.slice("cash_payment_out_".length);
          const existingRecord = repository.getPaymentOutRecordById(paymentOutId);
          if (existingRecord) {
            const oldAmount = Math.abs(Number(existingRecord.amount || 0));
            const newAmount = Math.abs(Number(payload.amount || 0));
            if (existingRecord.party_id) {
              try {
                const allParties = repository.getParties();
                const party = allParties.find((p) => String(p.id) === String(existingRecord.party_id));
                if (party) {
                  party.balance = Number(party.balance || 0) - oldAmount + newAmount;
                  repository.upsertParty(party);
                }
              } catch (balanceError) {
                console.error("Failed to update party balance on cash payment out edit:", balanceError);
              }
            }
            existingRecord.amount = newAmount;
            if (payload.date) existingRecord.date = payload.date;
            if (payload.name) existingRecord.party_name = payload.name;
            repository.updatePaymentOutRecord(paymentOutId, existingRecord);
          }
        }

        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ success: true }));
        return;
      }
      if (req.method === "DELETE") {
        const pathId = requestUrl.pathname.split("/").filter(Boolean)[0];
        const queryId = requestUrl.searchParams.get("id");
        const id = (pathId || queryId || "").trim();
        if (!id) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Transaction id is required." }));
          return;
        }
        if (id.startsWith("cash_payment_in_")) {
          const paymentInId = id.slice("cash_payment_in_".length);
          const existingRecord = repository.getPaymentInRecordById(paymentInId);
          if (existingRecord) {
            if (existingRecord.party_id) {
              try {
                const allParties = repository.getParties();
                const party = allParties.find((p) => String(p.id) === String(existingRecord.party_id));
                if (party) {
                  party.balance = Number(party.balance || 0) + Number(existingRecord.amount || 0);
                  repository.upsertParty(party);
                }
              } catch (balanceError) {
                console.error("Failed to restore party balance on cash payment in delete:", balanceError);
              }
            }
            if (existingRecord.attachment_image_path || existingRecord.attachmentImagePath) {
              try {
                removeManagedPaymentInAttachmentFile(existingRecord.attachment_image_path || existingRecord.attachmentImagePath);
              } catch (attError) {
                console.error("Failed to remove payment in attachment:", attError);
              }
            }
            repository.deletePaymentInRecord(paymentInId);
          }
        }
        if (id.startsWith("cash_payment_out_")) {
          const paymentOutId = id.slice("cash_payment_out_".length);
          const existingRecord = repository.getPaymentOutRecordById(paymentOutId);
          if (existingRecord) {
            if (existingRecord.party_id) {
              try {
                const allParties = repository.getParties();
                const party = allParties.find((p) => String(p.id) === String(existingRecord.party_id));
                if (party) {
                  party.balance = Number(party.balance || 0) - Number(existingRecord.amount || 0);
                  repository.upsertParty(party);
                }
              } catch (balanceError) {
                console.error("Failed to restore party balance on cash payment out delete:", balanceError);
              }
            }
            if (existingRecord.attachment_image_path || existingRecord.attachmentImagePath) {
              try {
                removeManagedPaymentOutAttachmentFile(existingRecord.attachment_image_path || existingRecord.attachmentImagePath);
              } catch (attError) {
                console.error("Failed to remove payment out attachment:", attError);
              }
            }
            repository.deletePaymentOutRecord(paymentOutId);
          }
        }
        if (id.startsWith("cash_expense_")) {
          const expenseId = id.slice("cash_expense_".length);
          const existingExpenseRecord = repository.getExpenseRecordById(expenseId);
          if (existingExpenseRecord) {
            repository.deleteExpenseRecord(expenseId);
            try {
              if (existingExpenseRecord.attachment_image_path) {
                removeManagedExpenseAttachmentFile(existingExpenseRecord.attachment_image_path);
              }
              if (existingExpenseRecord.attachment_document_path) {
                removeManagedExpenseAttachmentFile(existingExpenseRecord.attachment_document_path);
              }
            } catch (attachmentError) {
              console.error("Failed to remove expense attachments on cash transaction delete:", attachmentError);
            }
          }
        }
        if (id.startsWith("cash_purchase_")) {
          const purchaseBillId = id.slice("cash_purchase_".length);
          const existingPurchaseBill = repository.getPurchaseBillById(purchaseBillId);
          if (existingPurchaseBill) {
            try {
              const lineItems = JSON.parse(existingPurchaseBill.line_items_json || "[]");
              const allItems = repository.getItems();
              for (let i = 0; i < lineItems.length; i++) {
                const lineItem = lineItems[i];
                if (!lineItem.itemId || !lineItem.quantity) continue;
                const dbItem = allItems.find((itm) => String(itm.id) === String(lineItem.itemId));
                if (!dbItem) continue;
                const isSecondary = lineItem.unit === dbItem.secondary_unit;
                const lineItemId = lineItem.id || `line_${i}`;
                repository.removePurchaseStock(
                  lineItem.itemId,
                  Number(lineItem.quantity),
                  isSecondary,
                  dbItem.conversion_rate,
                  lineItem.price ?? 0,
                  purchaseBillId,
                  lineItemId
                );
              }
            } catch (stockError) {
              console.error("Failed to restore purchase stock on cash transaction delete:", stockError);
            }
            if (existingPurchaseBill.party_id) {
              try {
                const allParties = repository.getParties();
                const party = allParties.find((p) => String(p.id) === String(existingPurchaseBill.party_id));
                if (party) {
                  party.balance = Number(party.balance || 0) + Number(existingPurchaseBill.balance || 0);
                  repository.upsertParty(party);
                }
              } catch (balanceError) {
                console.error("Failed to restore party balance on cash transaction delete:", balanceError);
              }
            }
            try {
              if (existingPurchaseBill.attachment_image_path) {
                removeManagedPurchaseAttachmentFile(existingPurchaseBill.attachment_image_path);
              }
              if (existingPurchaseBill.attachment_document_path) {
                removeManagedPurchaseAttachmentFile(existingPurchaseBill.attachment_document_path);
              }
            } catch (attachmentError) {
              console.error("Failed to remove purchase attachments on cash transaction delete:", attachmentError);
            }
            repository.deletePurchaseBill(purchaseBillId);
          }
        }
        if (id.endsWith("_cash_pos")) {
          const invoiceId = id.slice(0, -"_cash_pos".length);
          const existingInvoice = repository.getSaleInvoiceById(invoiceId);
          if (existingInvoice) {
            try {
              const lineItems = JSON.parse(existingInvoice.line_items_json || "[]");
              const allItems = repository.getItems();
              for (const lineItem of lineItems) {
                if (!lineItem.itemId || !lineItem.quantity) continue;
                const dbItem = allItems.find((i) => String(i.id) === String(lineItem.itemId));
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
              console.error("Failed to restore stock:", stockError);
            }
            if (String(existingInvoice.payment_mode).toLowerCase() === "credit" && existingInvoice.party_id) {
              try {
                const allParties = repository.getParties();
                const party = allParties.find((p) => String(p.id) === String(existingInvoice.party_id));
                if (party) {
                  party.balance = Number(party.balance || 0) - Number(existingInvoice.balance || 0);
                  repository.upsertParty(party);
                }
              } catch (balanceError) {
                console.error("Failed to restore party balance:", balanceError);
              }
            }
            repository.deleteSaleInvoice(invoiceId);
            try {
              if (existingInvoice?.attachment_image_path) {
                removeManagedAttachmentFile(existingInvoice.attachment_image_path);
              }
              if (existingInvoice?.attachment_document_path) {
                removeManagedAttachmentFile(existingInvoice.attachment_document_path);
              }
            } catch (error) {
              console.error("Failed to remove sale invoice attachments on delete:", error);
            }
          }
        }
        const deleted = repository.deleteCashInHandTransaction(id);
        if (!deleted) {
          res.statusCode = 404;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Transaction not found or it is a system transaction." }));
          return;
        }
        res.statusCode = 204;
        res.end();
        return;
      }
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Method not allowed." }));
    } catch {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Failed to process request." }));
    }
  });
}
function sqliteApiPlugin(customAppDataRoot) {
  return {
    name: "sqlite-api-plugin",
    configureServer(server) {
      registerApiRoutes(server.middlewares, customAppDataRoot);
    }
  };
}
function startLocalServer(port = 3001, options = {}) {
  const app = express();
  app.use(cors());
  const appDataRoot = options.appDataRoot || process.env.POS_APPDATA_DIR || path.join(process.cwd(), "app_data");
  registerApiRoutes(app, appDataRoot);
  if (options.staticDir && fs.existsSync(options.staticDir)) {
    app.use(express.static(options.staticDir));
    app.use((req, res) => {
      res.sendFile(path.join(options.staticDir, "index.html"));
    });
  }
  return new Promise((resolve, reject) => {
    const serverInstance = app.listen(port, "127.0.0.1", () => {
      const actualPort = serverInstance.address().port;
      console.log(`POS API Server running at http://127.0.0.1:${actualPort}`);
      resolve({ server: serverInstance, port: actualPort, app });
    });
    serverInstance.on("error", reject);
  });
}
export {
  registerApiRoutes,
  sqliteApiPlugin,
  startLocalServer
};
