import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { SEED_CATEGORIES, SEED_POSTS } from './seedData';

function createMockQuery(table?: any, filterValue?: any, limitNum?: number) {
  let currentTable = table;
  let targetValue = filterValue;
  let limit = limitNum;

  const query: any = {
    from: (t: any) => createMockQuery(t, targetValue, limit),
    where: (clause: any) => {
      let extracted: any = targetValue;
      try {
        if (clause?.queryChunks) {
          for (const chunk of clause.queryChunks) {
            if (chunk?.value !== undefined) {
              extracted = chunk.value;
            }
          }
        }
      } catch {}
      return createMockQuery(currentTable, extracted, limit);
    },
    orderBy: () => query,
    limit: (n: number) => createMockQuery(currentTable, targetValue, n),
    offset: () => query,
    leftJoin: () => query,
    all: async () => {
      let data: any[] = [];
      if (currentTable === schema.categories) {
        data = [...SEED_CATEGORIES];
      } else if (currentTable === schema.admins) {
        data = [
          {
            id: 3,
            username: 'admin',
            password: 'Laimsoft@admin123',
            fullName: 'Laimsoft',
            email: 'laimsoftofficial@gmail.com',
            createdAt: '2026-05-22 16:08:16',
          },
        ];
      } else if (currentTable === schema.posts) {
        data = [...SEED_POSTS];
      } else {
        data = [];
      }
      if (targetValue !== undefined && targetValue !== null && targetValue !== 'published') {
        const valStr = String(targetValue).toLowerCase();
        data = data.filter(
          (item) =>
            item.slug?.toLowerCase() === valStr ||
            item.category?.toLowerCase() === valStr ||
            String(item.id) === valStr ||
            item.username?.toLowerCase() === valStr
        );
      }
      if (limit !== undefined) {
        data = data.slice(0, limit);
      }
      return data;
    },
    get: async () => {
      const results = await query.all();
      return results[0] || null;
    },
    then: (resolve: (val: any) => any) => query.all().then(resolve),
  };

  return query;
}

const emptyMutation: any = {
  values: () => ({
    run: async () => ({ success: true }),
    then: (resolve: (val: any) => any) => Promise.resolve({ success: true }).then(resolve),
  }),
  set: () => ({
    where: () => ({
      run: async () => ({ success: true }),
      then: (resolve: (val: any) => any) => Promise.resolve({ success: true }).then(resolve),
    }),
    run: async () => ({ success: true }),
    then: (resolve: (val: any) => any) => Promise.resolve({ success: true }).then(resolve),
  }),
  where: () => ({
    run: async () => ({ success: true }),
    then: (resolve: (val: any) => any) => Promise.resolve({ success: true }).then(resolve),
  }),
  run: async () => ({ success: true }),
};

const mockDb: any = {
  select: () => createMockQuery(),
  insert: () => emptyMutation,
  update: () => emptyMutation,
  delete: () => emptyMutation,
};

let localDbInstance: any = null;

function getLocalD1Db() {
  if (localDbInstance) return localDbInstance;
  try {
    if (typeof process === 'undefined' || !process.versions?.node) return null;
    const fs = eval("require('node:fs')");
    const path = eval("require('node:path')");
    const d1Dir = path.join(process.cwd(), '.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject');
    if (!fs.existsSync(d1Dir)) return null;
    const files = fs.readdirSync(d1Dir);
    const sqliteFile = files.find((f: string) => f.endsWith('.sqlite') && !f.startsWith('metadata'));
    if (!sqliteFile) return null;
    const fullPath = path.join(d1Dir, sqliteFile);
    const { DatabaseSync } = eval("require('node:sqlite')");
    const sdb = new DatabaseSync(fullPath);

    const d1Adapter = {
      prepare(query: string) {
        return {
          bind(...params: any[]) {
            return {
              async all() {
                return { results: sdb.prepare(query).all(...params), success: true };
              },
              async get() {
                return sdb.prepare(query).get(...params);
              },
              async run() {
                return { success: true, meta: sdb.prepare(query).run(...params) };
              },
              async raw() {
                return sdb.prepare(query).all(...params).map((r: any) => Object.values(r));
              },
            };
          },
          async all() {
            return { results: sdb.prepare(query).all(), success: true };
          },
          async get() {
            return sdb.prepare(query).get();
          },
          async run() {
            return { success: true, meta: sdb.prepare(query).run() };
          },
          async raw() {
            return sdb.prepare(query).all().map((r: any) => Object.values(r));
          },
        };
      },
    };

    localDbInstance = drizzle(d1Adapter as any, { schema });
    return localDbInstance;
  } catch {
    return null;
  }
}

export async function getDb(): Promise<any> {
  try {
    const { env } = await getCloudflareContext();
    if (env && (env as any).DB) {
      return drizzle((env as any).DB, { schema });
    }
  } catch (e) {
    // Context unavailable during static prerender or next dev
  }

  if (typeof (globalThis as any).DB !== 'undefined') {
    return drizzle((globalThis as any).DB, { schema });
  }

  // Check local D1 sqlite state if running locally in node
  const localD1 = getLocalD1Db();
  if (localD1) {
    return localD1;
  }

  // Fallback for build time and local dev
  return mockDb;
}

export { schema };
