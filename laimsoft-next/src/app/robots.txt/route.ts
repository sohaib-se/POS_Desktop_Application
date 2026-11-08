import { NextResponse } from 'next/server';
import { getGlobalSeo } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function GET() {
  let content = `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/admin/\n\nSitemap: https://laimsoft.site/sitemap.xml`;

  try {
    const globalSeo = await getGlobalSeo();
    if (globalSeo.robotsTxtCustom && globalSeo.robotsTxtCustom.trim()) {
      content = globalSeo.robotsTxtCustom.trim();
    }
  } catch {
    // Graceful fallback
  }

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
