import { Suspense } from 'react';
import { getSeoPages, getGlobalSeo } from '@/lib/seo';
import { getAllPageContents } from '@/lib/pageContent';
import SeoManagerClient from './SeoManagerClient';
import AdminCircularLoader from '../AdminCircularLoader';

export const dynamic = 'force-dynamic';

export default function SeoManagerPage() {
  return (
    <div className="space-y-8">
      {/* ── Instant Header (0ms) ── */}
      <div>
        <h1 className="text-[36px] sm:text-[40px] font-bold text-black tracking-[-0.03em] leading-tight">
          SEO & Content Command Center
        </h1>
        <p className="text-[16px] text-[#5f5e5e] mt-1">
          Manage live website content, Google search indexing, OpenGraph preview cards, webmaster verifications, and sitemaps.
        </p>
      </div>

      {/* ── Live Database Telemetry with Circular Spinner ── */}
      <Suspense
        fallback={
          <AdminCircularLoader
            message="Fetching SEO configurations & page content..."
            subtext="Loading live page copy, metadata, robots directives, and search schemas"
            minHeight="min-h-[420px]"
          />
        }
      >
        <SeoDataLoader />
      </Suspense>
    </div>
  );
}

async function SeoDataLoader() {
  const [pages, globalSettings, pageContents] = await Promise.all([
    getSeoPages(),
    getGlobalSeo(),
    getAllPageContents(),
  ]);

  return (
    <SeoManagerClient
      initialPages={pages}
      initialGlobal={globalSettings}
      initialContents={pageContents}
    />
  );
}

