import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { getDb, schema } from '@/db';
import { eq } from 'drizzle-orm';
import {
  getSeoPages,
  getGlobalSeo,
  DEFAULT_SEO_PAGES,
  DEFAULT_GLOBAL_SEO,
} from '@/lib/seo';
import {
  getAllPageContents,
  savePageContent,
  DEFAULT_PAGE_CONTENTS,
} from '@/lib/pageContent';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [pages, globalSettings, pageContents] = await Promise.all([
      getSeoPages(),
      getGlobalSeo(),
      getAllPageContents(),
    ]);

    return NextResponse.json({
      status: 'success',
      pages,
      global: globalSettings,
      contents: pageContents,
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', message: err.message || 'Failed to fetch SEO settings.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body;
    const db = await getDb();

    // 1. Save Page SEO
    if (action === 'save_page') {
      const {
        path,
        pageName,
        title,
        description,
        keywords,
        ogImage,
        canonicalUrl,
        noIndex,
        noFollow,
      } = body;

      if (!path || !title || !description) {
        return NextResponse.json(
          { status: 'error', message: 'Path, title, and description are required.' },
          { status: 400 }
        );
      }

      // Check if existing
      const existing = await db
        .select()
        .from(schema.seoPages)
        .where(eq(schema.seoPages.path, path))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(schema.seoPages)
          .set({
            pageName,
            title,
            description,
            keywords: keywords || null,
            ogImage: ogImage || null,
            canonicalUrl: canonicalUrl || null,
            noIndex: noIndex ? 1 : 0,
            noFollow: noFollow ? 1 : 0,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(schema.seoPages.path, path))
          .run();
      } else {
        await db
          .insert(schema.seoPages)
          .values({
            path,
            pageName: pageName || path,
            title,
            description,
            keywords: keywords || null,
            ogImage: ogImage || null,
            canonicalUrl: canonicalUrl || null,
            noIndex: noIndex ? 1 : 0,
            noFollow: noFollow ? 1 : 0,
          })
          .run();
      }

      return NextResponse.json({
        status: 'success',
        message: `SEO settings for "${pageName || path}" saved successfully.`,
      });
    }

    // 2. Save Global SEO & Verifications
    if (action === 'save_global') {
      const {
        siteName,
        titleTemplate,
        defaultDescription,
        defaultOgImage,
        googleVerification,
        bingVerification,
        gaMeasurementId,
        organizationSchema,
        robotsTxtCustom,
      } = body;

      const existing = await db.select().from(schema.seoGlobal).limit(1);

      if (existing.length > 0) {
        await db
          .update(schema.seoGlobal)
          .set({
            siteName: siteName || 'Laimsoft',
            titleTemplate: titleTemplate || '%s — Laimsoft',
            defaultDescription: defaultDescription || null,
            defaultOgImage: defaultOgImage || null,
            googleVerification: googleVerification || null,
            bingVerification: bingVerification || null,
            gaMeasurementId: gaMeasurementId || null,
            organizationSchema: organizationSchema || null,
            robotsTxtCustom: robotsTxtCustom || null,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(schema.seoGlobal.id, existing[0].id))
          .run();
      } else {
        await db
          .insert(schema.seoGlobal)
          .values({
            siteName: siteName || 'Laimsoft',
            titleTemplate: titleTemplate || '%s — Laimsoft',
            defaultDescription: defaultDescription || null,
            defaultOgImage: defaultOgImage || null,
            googleVerification: googleVerification || null,
            bingVerification: bingVerification || null,
            gaMeasurementId: gaMeasurementId || null,
            organizationSchema: organizationSchema || null,
            robotsTxtCustom: robotsTxtCustom || null,
          })
          .run();
      }

      return NextResponse.json({
        status: 'success',
        message: 'Global site SEO and verifications updated successfully.',
      });
    }

    // 3. Reset / Seed Defaults
    if (action === 'seed_defaults') {
      for (const page of DEFAULT_SEO_PAGES) {
        const existing = await db
          .select()
          .from(schema.seoPages)
          .where(eq(schema.seoPages.path, page.path))
          .limit(1);

        if (existing.length === 0) {
          await db
            .insert(schema.seoPages)
            .values({
              path: page.path,
              pageName: page.pageName,
              title: page.title,
              description: page.description,
              keywords: page.keywords,
              ogImage: page.ogImage,
              canonicalUrl: page.canonicalUrl,
              noIndex: page.noIndex || 0,
              noFollow: page.noFollow || 0,
            })
            .run();
        }
      }

      const existingGlobal = await db.select().from(schema.seoGlobal).limit(1);
      if (existingGlobal.length === 0) {
        await db.insert(schema.seoGlobal).values(DEFAULT_GLOBAL_SEO).run();
      }

      return NextResponse.json({
        status: 'success',
        message: 'Standard SEO metadata seeded successfully.',
      });
    }

    // 4. Save Page Live Content
    if (action === 'save_content') {
      const { path, sections } = body;
      if (!path || !sections) {
        return NextResponse.json(
          { status: 'error', message: 'Path and content sections are required.' },
          { status: 400 }
        );
      }

      await savePageContent(path, sections);

      // Instantly purge Edge CDN cache so visitors see updates in 0ms
      try {
        revalidatePath(path);
        revalidatePath('/', 'layout');
      } catch {
        // Ignored if outside request context
      }

      return NextResponse.json({
        status: 'success',
        message: `Live content for "${path}" updated and edge cache refreshed.`,
      });
    }

    // 5. Reset Page Content to Default
    if (action === 'reset_content') {
      const { path } = body;
      if (!path) {
        return NextResponse.json(
          { status: 'error', message: 'Path is required.' },
          { status: 400 }
        );
      }

      const defaultSections = DEFAULT_PAGE_CONTENTS[path];
      if (!defaultSections) {
        return NextResponse.json(
          { status: 'error', message: `No default content template exists for path "${path}".` },
          { status: 400 }
        );
      }

      await savePageContent(path, defaultSections);

      try {
        revalidatePath(path);
        revalidatePath('/', 'layout');
      } catch {
        // Ignored if outside request context
      }

      return NextResponse.json({
        status: 'success',
        message: `Content for "${path}" restored to standard default.`,
        sections: defaultSections,
      });
    }

    return NextResponse.json({ status: 'error', message: 'Invalid action.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', message: err.message || 'Failed to update SEO settings.' },
      { status: 500 }
    );
  }
}
