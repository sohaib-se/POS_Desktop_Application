const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const viteConfigPath = fs.existsSync(path.join(__dirname, '../vite.config.ts.bak')) 
  ? path.join(__dirname, '../vite.config.ts.bak') 
  : path.join(__dirname, '../vite.config.ts');
const viteContent = fs.readFileSync(viteConfigPath, 'utf8');

// Find the start of the body inside configureServer
const startMarker = 'const itemsImagesRoot = path.join(appDataRoot, \'items_images\');';
const startIndex = viteContent.indexOf(startMarker);

if (startIndex === -1) {
  console.error('Could not find start marker');
  process.exit(1);
}

// Find the end of configureServer
const endMarker = '    }\n\n  };\n}';
const altEndMarker = '    }\r\n\r\n  };\r\n}';
let endIndex = viteContent.lastIndexOf(endMarker);
if (endIndex === -1) {
  endIndex = viteContent.lastIndexOf(altEndMarker);
}

if (endIndex === -1) {
  console.error('Could not find end marker');
  process.exit(1);
}

const extractedBody = viteContent.substring(startIndex, endIndex);

// Replace relative paths from vite.config.ts to server/api-server.mjs
const adjustedBody = extractedBody
  .replace(/\.\/database\/sqlite\/repository\.mjs/g, '../database/sqlite/repository.mjs')
  .replace(/\.\/database\/sqlite\/client\.mjs/g, '../database/sqlite/client.mjs');

const rawModule = `import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function registerApiRoutes(middlewares, customAppDataRoot) {
  const server = { middlewares };
  const appDataRoot = customAppDataRoot || process.env.POS_APPDATA_DIR || path.join(process.cwd(), 'app_data');
  ${adjustedBody}
}

export function sqliteApiPlugin(customAppDataRoot) {
  return {
    name: 'sqlite-api-plugin',
    configureServer(server) {
      registerApiRoutes(server.middlewares, customAppDataRoot);
    }
  };
}

export function startLocalServer(port = 3001, options = {}) {
  const app = express();
  app.use(cors());
  
  const appDataRoot = options.appDataRoot || process.env.POS_APPDATA_DIR || path.join(process.cwd(), 'app_data');
  registerApiRoutes(app, appDataRoot);

  if (options.staticDir && fs.existsSync(options.staticDir)) {
    app.use(express.static(options.staticDir));
    app.use((req, res) => {
      res.sendFile(path.join(options.staticDir, 'index.html'));
    });
  }

  return new Promise((resolve, reject) => {
    const serverInstance = app.listen(port, '127.0.0.1', () => {
      const actualPort = serverInstance.address().port;
      console.log(\`POS API Server running at http://127.0.0.1:\${actualPort}\`);
      resolve({ server: serverInstance, port: actualPort, app });
    });
    serverInstance.on('error', reject);
  });
}
`;

// Transform with esbuild to strip TypeScript types cleanly
const transformed = esbuild.transformSync(rawModule, {
  loader: 'ts',
  target: 'node20',
  format: 'esm',
});

const serverDir = path.join(__dirname, '../server');
fs.mkdirSync(serverDir, { recursive: true });
fs.writeFileSync(path.join(serverDir, 'api-server.mjs'), transformed.code, 'utf8');
console.log('Successfully generated server/api-server.mjs!');
