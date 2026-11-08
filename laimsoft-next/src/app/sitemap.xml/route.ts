import { NextResponse } from 'next/server';
import { getDb, schema } from '@/db';
import { desc } from 'drizzle-orm';
import { DEFAULT_SEO_PAGES } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = 'https://laimsoft.site';
  const nowIso = new Date().toISOString();

  let postUrls: { url: string; lastMod: string }[] = [];

  try {
    const db = await getDb();
    const published = await db
      .select({
        slug: schema.posts.slug,
        createdAt: schema.posts.createdAt,
      })
      .from(schema.posts)
      .orderBy(desc(schema.posts.createdAt))
      .all();

    postUrls = (published || []).map((p: any) => ({
      url: `${baseUrl}/blog/${p.slug}`,
      lastMod: p.createdAt ? new Date(p.createdAt).toISOString() : nowIso,
    }));
  } catch {
    // Graceful fallback
  }

  const staticUrls = DEFAULT_SEO_PAGES.filter((p) => !p.noIndex).map((p) => ({
    url: `${baseUrl}${p.path === '/' ? '' : p.path}`,
    lastMod: nowIso,
    changeFreq: p.path === '/' || p.path === '/blog' ? 'daily' : 'weekly',
    priority: p.path === '/' ? '1.0' : p.path === '/services' || p.path === '/blog' ? '0.9' : '0.8',
  }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls
  .map(
    (item) => `  <url>
    <loc>${item.url}</loc>
    <lastmod>${item.lastMod}</lastmod>
    <changefreq>${item.changeFreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join('\n')}
${postUrls
  .map(
    (item) => `  <url>
    <loc>${item.url}</loc>
    <lastmod>${item.lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
