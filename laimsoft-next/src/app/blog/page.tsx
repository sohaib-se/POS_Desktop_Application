import { Suspense } from 'react';
import { getDb, schema } from '@/db';
import { desc } from 'drizzle-orm';
import BlogNewsletter from '@/components/BlogNewsletter';
import BlogClientView from './BlogClientView';

import type { Metadata } from 'next';
import { getSeoForPath } from '@/lib/seo';

// Cache on Cloudflare Edge with 60s background revalidation for instantaneous navigation
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoForPath('/blog');
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonicalUrl || 'https://laimsoft.site/blog' },
    openGraph: {
      title: seo.title,
      description: seo.description,
      images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
    },
    robots: {
      index: !seo.noIndex,
      follow: !seo.noFollow,
    },
  };
}

function BlogGridSkeleton() {
  return (
    <div className="blog-posts-section">
      <div className="blog-filters">
        <div className="h-10 w-24 bg-slate-200 animate-pulse rounded-full" />
        <div className="h-10 w-28 bg-slate-200 animate-pulse rounded-full" />
        <div className="h-10 w-32 bg-slate-200 animate-pulse rounded-full" />
      </div>
      <div className="blog-grid-wrap mt-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="blog-card animate-pulse">
            <div className="blog-card-img bg-slate-200" style={{ minHeight: '220px' }} />
            <div className="blog-card-body">
              <div className="h-4 w-32 bg-slate-200 rounded mb-3" />
              <div className="h-6 w-full bg-slate-200 rounded mb-2" />
              <div className="h-4 w-5/6 bg-slate-200 rounded mb-4" />
              <div className="h-8 w-28 bg-slate-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function BlogPage() {
  let publishedPosts: any[] = [];
  let categoriesList: any[] = [];

  try {
    const db = await getDb();
    const [categories, posts] = await Promise.all([
      db.select().from(schema.categories).all(),
      db.select().from(schema.posts).orderBy(desc(schema.posts.createdAt)).all(),
    ]);

    categoriesList = categories || [];
    publishedPosts = (posts || []).filter((p: any) => !p.status || p.status === 'published');
  } catch (err) {
    console.error('Error fetching blog data:', err);
  }

  return (
    <div className="blog-page">
      {/* ══════════════════════════════════════════
           HERO — Full Screen, Fixed Background
      ══════════════════════════════════════════ */}
      <section className="blog-hero" id="blog-hero-top">
        <div className="blog-hero-bg" aria-hidden="true" />
        <div className="blog-hero-content">
          <div className="blog-hero-badge">
            <span className="blog-hero-badge-dot"></span>
            <span className="blog-hero-badge-text">Engineering Insights</span>
          </div>
          <h1>Precision in Every Line of Code.</h1>
          <p>
            Exploring the future of minimalist architecture, scalable backend systems, and the intersection of design and performance.
          </p>
          <a href="#blog-content" className="blog-hero-scroll" aria-label="Scroll to blog posts">
            <span className="material-symbols-outlined">keyboard_arrow_down</span>
            Scroll
          </a>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           BLOG MAIN CONTENT
      ══════════════════════════════════════════ */}
      <main className="blog-main" id="blog-content">
        {/* Page Header */}
        <div className="blog-page-header">
          <span className="eng-label">Engineering Insights</span>
          <h1>Laimsoft Blog</h1>
          <p>Insights, trends, and tutorials from our tech experts.</p>
        </div>

        {/* Dynamic Filters & Posts with Instant 0ms Client Navigation */}
        <Suspense fallback={<BlogGridSkeleton />}>
          <BlogClientView categories={categoriesList} initialPosts={publishedPosts} />
        </Suspense>

        {/* Newsletter */}
        <BlogNewsletter />
      </main>
    </div>
  );
}
