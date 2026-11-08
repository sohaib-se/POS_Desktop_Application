import { getDb, schema } from '@/db';
import { eq } from 'drizzle-orm';

export interface SeoPageData {
  id?: number;
  path: string;
  pageName: string;
  title: string;
  description: string;
  keywords?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  noIndex?: number | null;
  noFollow?: number | null;
  updatedAt?: string | null;
}

export interface SeoGlobalData {
  id?: number;
  siteName: string;
  titleTemplate?: string | null;
  defaultDescription?: string | null;
  defaultOgImage?: string | null;
  googleVerification?: string | null;
  bingVerification?: string | null;
  gaMeasurementId?: string | null;
  organizationSchema?: string | null;
  robotsTxtCustom?: string | null;
  updatedAt?: string | null;
}

export const DEFAULT_SEO_PAGES: SeoPageData[] = [
  {
    path: '/',
    pageName: 'Homepage',
    title: 'Laimsoft — Engineering The Future of Software & AI',
    description:
      'Laimsoft provides cutting-edge software solutions including custom enterprise development, mobile apps, AI solutions, and digital marketing.',
    keywords: 'software engineering, AI development, custom web apps, Next.js development, boutique agency',
    ogImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    canonicalUrl: 'https://laimsoft.site',
    noIndex: 0,
    noFollow: 0,
  },
  {
    path: '/about',
    pageName: 'About Us',
    title: 'About Laimsoft — Innovating at the Speed of Thought',
    description:
      'Laimsoft is a boutique software engineering firm dedicated to high-performance solutions, scalable backend systems, and precision code.',
    keywords: 'about laimsoft, software firm, tech architects, bespoke software engineering',
    ogImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    canonicalUrl: 'https://laimsoft.site/about',
    noIndex: 0,
    noFollow: 0,
  },
  {
    path: '/services',
    pageName: 'Our Services',
    title: 'Engineering Services & Solutions — Laimsoft',
    description:
      'Explore Laimsoft services: enterprise software development, intelligent AI integrations, cross-platform mobile apps, and technical cloud consulting.',
    keywords: 'software services, cloud infrastructure, AI solutions, mobile app development',
    ogImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    canonicalUrl: 'https://laimsoft.site/services',
    noIndex: 0,
    noFollow: 0,
  },
  {
    path: '/blog',
    pageName: 'Blog & Insights',
    title: 'Engineering Insights & Tutorials — Laimsoft Blog',
    description:
      'In-depth engineering insights, architecture patterns, and technical trends authored by Laimsoft software specialists.',
    keywords: 'tech blog, software engineering blog, tech architecture, software insights',
    ogImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    canonicalUrl: 'https://laimsoft.site/blog',
    noIndex: 0,
    noFollow: 0,
  },
  {
    path: '/contact',
    pageName: 'Contact & Bookings',
    title: 'Contact Us & Book Consultation — Laimsoft',
    description:
      'Initiate your project discussion with Laimsoft architects. Book a technical scoping consultation or contact our executive team.',
    keywords: 'contact laimsoft, book consultation, hire software engineers',
    ogImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    canonicalUrl: 'https://laimsoft.site/contact',
    noIndex: 0,
    noFollow: 0,
  },
  {
    path: '/v/verify',
    pageName: 'Certificate Verification',
    title: 'Verify Credentials & Certificates — Laimsoft',
    description:
      'Instantly verify cryptographic certificates, course completion credentials, and diplomas issued by Laimsoft Technologies.',
    keywords: 'certificate verification, verify credentials, verify diplomas, laimsoft certification',
    ogImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
    canonicalUrl: 'https://laimsoft.site/v/verify',
    noIndex: 0,
    noFollow: 0,
  },
  {
    path: '/services/ai-solutions',
    pageName: 'AI Solutions & ML',
    title: 'AI Solutions & Machine Learning Services — Laimsoft',
    description:
      'Deploy state-of-the-art Large Language Models, custom neural architectures, and intelligent workflows tailored to enterprise needs.',
    keywords: 'AI solutions, machine learning, custom LLMs, PyTorch, enterprise AI, predictive analytics',
    ogImage: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80',
    canonicalUrl: 'https://laimsoft.site/services/ai-solutions',
    noIndex: 0,
    noFollow: 0,
  },
  {
    path: '/services/web-development',
    pageName: 'Web Development',
    title: 'Web Development & High-Performance Engineering — Laimsoft',
    description:
      'High-performance web applications, SaaS dashboards, and scalable e-commerce solutions built with Next.js, Node.js, and React.',
    keywords: 'web development, custom web app, React development, Next.js agency, fullstack engineering',
    ogImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    canonicalUrl: 'https://laimsoft.site/services/web-development',
    noIndex: 0,
    noFollow: 0,
  },
  {
    path: '/services/custom-software',
    pageName: 'Custom Software',
    title: 'Custom Software Development & Architecture — Laimsoft',
    description:
      'Bespoke enterprise software tailored to your specific organizational needs, legacy system modernization, and automated operations.',
    keywords: 'custom software, enterprise software development, SaaS engineering, legacy modernization',
    ogImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    canonicalUrl: 'https://laimsoft.site/services/custom-software',
    noIndex: 0,
    noFollow: 0,
  },
  {
    path: '/services/digital-marketing',
    pageName: 'Digital Marketing',
    title: 'Digital Marketing & Growth Engineering — Laimsoft',
    description:
      'Data-driven digital marketing strategies including SEO, targeted PPC campaigns, and content growth systems to amplify online presence.',
    keywords: 'digital marketing, SEO strategy, PPC advertising, growth engineering, brand marketing',
    ogImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    canonicalUrl: 'https://laimsoft.site/services/digital-marketing',
    noIndex: 0,
    noFollow: 0,
  },
  {
    path: '/services/mobile-app',
    pageName: 'Mobile App Development',
    title: 'Mobile App Development for iOS & Android — Laimsoft',
    description:
      'Native and cross-platform mobile apps for iOS and Android built for performance, tactile responsiveness, and App Store success.',
    keywords: 'mobile app development, iOS apps, Android development, React Native, mobile engineering',
    ogImage: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80',
    canonicalUrl: 'https://laimsoft.site/services/mobile-app',
    noIndex: 0,
    noFollow: 0,
  },
  {
    path: '/services/ui-ux',
    pageName: 'UI/UX Design',
    title: 'UI/UX Design & Product Prototyping — Laimsoft',
    description:
      'Precision-crafted user interfaces focusing on user-centric research, wireframing, high-fidelity prototypes, and design systems.',
    keywords: 'UI UX design, product design, user research, wireframing, Figma design systems',
    ogImage: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80',
    canonicalUrl: 'https://laimsoft.site/services/ui-ux',
    noIndex: 0,
    noFollow: 0,
  },
];

export const DEFAULT_GLOBAL_SEO: SeoGlobalData = {
  siteName: 'Laimsoft',
  titleTemplate: '%s — Laimsoft',
  defaultDescription:
    'Laimsoft provides cutting-edge software solutions including custom enterprise development, mobile apps, AI solutions, and digital marketing.',
  defaultOgImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  googleVerification: '',
  bingVerification: '',
  gaMeasurementId: '',
  organizationSchema: JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Laimsoft Technologies',
      url: 'https://laimsoft.site',
      logo: 'https://laimsoft.site/favicon.ico',
      sameAs: [
        'https://linkedin.com/company/laimsoft',
        'https://github.com/laimsoft',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'laimsoftofficial@gmail.com',
        contactType: 'customer support',
      },
    },
    null,
    2
  ),
  robotsTxtCustom: `# Standard crawlers allowed\nUser-agent: *\nAllow: /\nDisallow: /admin/\n\n# Sitemap location\nSitemap: https://laimsoft.site/sitemap.xml`,
};

// Helper: Ensure tables exist in local SQLite if running local development
async function ensureTables(db: any) {
  try {
    if (db?.run) {
      await db.run(`
        CREATE TABLE IF NOT EXISTS seo_pages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          path TEXT NOT NULL UNIQUE,
          page_name TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          keywords TEXT,
          og_image TEXT,
          canonical_url TEXT,
          no_index INTEGER DEFAULT 0,
          no_follow INTEGER DEFAULT 0,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await db.run(`
        CREATE TABLE IF NOT EXISTS seo_global (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          site_name TEXT NOT NULL DEFAULT 'Laimsoft',
          title_template TEXT DEFAULT '%s — Laimsoft',
          default_description TEXT,
          default_og_image TEXT,
          google_verification TEXT,
          bing_verification TEXT,
          ga_measurement_id TEXT,
          organization_schema TEXT,
          robots_txt_custom TEXT,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }
  } catch {
    // Drizzle client wrapper might not expose raw run; safe to ignore
  }
}

export async function getSeoPages(): Promise<SeoPageData[]> {
  try {
    const db = await getDb();
    await ensureTables(db);
    const rows = await db.select().from(schema.seoPages).all();

    if (!rows || rows.length === 0) {
      return DEFAULT_SEO_PAGES;
    }

    // Merge defaults so newly defined routes always appear
    const map = new Map<string, SeoPageData>();
    for (const def of DEFAULT_SEO_PAGES) {
      map.set(def.path, def);
    }
    for (const row of rows) {
      map.set(row.path, {
        ...row,
        pageName: row.pageName || map.get(row.path)?.pageName || row.path,
      });
    }

    return Array.from(map.values());
  } catch {
    return DEFAULT_SEO_PAGES;
  }
}

export async function getSeoForPath(path: string): Promise<SeoPageData> {
  const defaultPage = DEFAULT_SEO_PAGES.find((p) => p.path === path) || {
    path,
    pageName: path === '/' ? 'Home' : path.replace('/', '').toUpperCase(),
    title: 'Laimsoft — Engineering The Future of Software & AI',
    description:
      'Laimsoft provides cutting-edge software solutions including custom enterprise development, mobile apps, and AI solutions.',
    canonicalUrl: `https://laimsoft.site${path}`,
    noIndex: 0,
    noFollow: 0,
  };

  try {
    const db = await getDb();
    const rows = await db.select().from(schema.seoPages).where(eq(schema.seoPages.path, path)).limit(1);
    if (rows && rows.length > 0) {
      return {
        ...defaultPage,
        ...rows[0],
      };
    }
  } catch {
    // Fall back to default
  }

  return defaultPage;
}

export async function getGlobalSeo(): Promise<SeoGlobalData> {
  try {
    const db = await getDb();
    await ensureTables(db);
    const rows = await db.select().from(schema.seoGlobal).limit(1);
    if (rows && rows.length > 0) {
      return {
        ...DEFAULT_GLOBAL_SEO,
        ...rows[0],
      };
    }
  } catch {
    // Return default
  }

  return DEFAULT_GLOBAL_SEO;
}
