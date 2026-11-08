import { getDb, schema } from '@/db';
import { eq } from 'drizzle-orm';

// ── 1. Page Content Types ──

export interface HomePageContent {
  heroBadge: string;
  heroHeading: string;
  heroHeadingAccent: string;
  heroSubheading: string;
  heroPrimaryBtnText: string;
  heroPrimaryBtnLink: string;
  heroSecondaryBtnText: string;
  servicesTag: string;
  servicesHeading: string;
  servicesSubheading: string;
  advantageTag: string;
  advantageHeading: string;
  advantageSubheading: string;
}

export interface AboutPageContent {
  heroBadge: string;
  heroTitle: string;
  heroTitleAccent: string;
  heroDescription: string;
  heroPrimaryBtnText: string;
  heroSecondaryBtnText: string;
  introBadge: string;
  introTitle: string;
  introTitleAccent: string;
  introDescription: string;
  missionTitle: string;
  missionDescription: string;
  visionTitle: string;
  visionDescription: string;
  teamLabel: string;
  teamHeading: string;
  stat1Value: string;
  stat1Title: string;
  stat1Desc: string;
  stat2Value: string;
  stat2Title: string;
  stat2Desc: string;
}

export interface ServicesPageContent {
  heroBadge: string;
  heroHeading: string;
  heroDescription: string;
  ctaHeading: string;
  ctaDescription: string;
  ctaButtonText: string;
  ctaButtonLink: string;
}

export interface ContactPageContent {
  pillText: string;
  heading: string;
  subheading: string;
}

export interface SingleServiceContent {
  title: string;
  badge: string;
  heroDesc: string;
  capabilitiesTitle: string;
  capabilitiesDesc: string;
  capabilitiesTag: string;
  card1Title: string;
  card1Desc: string;
  card2Title: string;
  card2Desc: string;
  card3Title: string;
  card3Desc: string;
  card4Title: string;
  card4Desc: string;
  ctaTitle: string;
  ctaDesc: string;
  ctaBtnText: string;
}

export const SERVICE_SLUGS = [
  'ai-solutions',
  'web-development',
  'custom-software',
  'digital-marketing',
  'mobile-app',
  'ui-ux',
] as const;

// ── 2. Built-in Hardcoded Defaults (Fallback Safety) ──

export const DEFAULT_PAGE_CONTENTS: Record<string, any> = {
  '/': {
    heroBadge: 'The Future of Software Engineering',
    heroHeading: 'Precision Built',
    heroHeadingAccent: 'Digital Assets.',
    heroSubheading:
      'We orchestrate high-performance digital ecosystems through elite engineering and data-driven intelligence.',
    heroPrimaryBtnText: 'Get Started',
    heroPrimaryBtnLink: '/contact',
    heroSecondaryBtnText: 'Book Free Consultation',
    servicesTag: 'Our Expertise',
    servicesHeading: 'Our Services',
    servicesSubheading:
      'We deliver high-impact technological interventions designed for the modern enterprise landscape.',
    advantageTag: 'The Advantage',
    advantageHeading: 'Engineered for Excellence',
    advantageSubheading:
      'We combine strategic expertise with technical precision to deliver solutions that drive measurable business impact and sustainable growth.',
  } satisfies HomePageContent,

  '/about': {
    heroBadge: 'Engineered for Excellence',
    heroTitle: 'Innovating at the speed of',
    heroTitleAccent: 'thought.',
    heroDescription:
      'Laimsoft is a boutique software engineering firm dedicated to high-performance solutions. We bridge the gap between complex technical challenges and elegant, minimalist user experiences.',
    heroPrimaryBtnText: 'Our Journey',
    heroSecondaryBtnText: 'View Stack',
    introBadge: 'Engineered for Excellence',
    introTitle: 'Innovating at the speed of',
    introTitleAccent: 'thought.',
    introDescription:
      'Laimsoft is a boutique software engineering firm dedicated to high-performance solutions. We bridge the gap between complex technical challenges and elegant, minimalist user experiences.',
    missionTitle: 'Our Mission',
    missionDescription:
      "To empower forward-thinking enterprises through bespoke software architectures that prioritize speed, scalability, and technical integrity above all else. We don't just build apps; we engineer foundations.",
    visionTitle: 'Our Vision',
    visionDescription:
      'A future where technology is invisible yet omnipotent. We strive to be the architects of a digital world where every line of code serves a purpose, and every interaction feels like a natural extension of human intent.',
    teamLabel: 'The Architects',
    teamHeading: 'The minds behind the code.',
    stat1Value: '120+',
    stat1Title: 'Systems Deployed',
    stat1Desc: 'Global high-availability infrastructures.',
    stat2Value: '99.9%',
    stat2Title: 'Engineering Precision',
    stat2Desc: 'We set the industry benchmark for uptime and code quality.',
  } satisfies AboutPageContent,

  '/services': {
    heroBadge: 'Excellence in Engineering',
    heroHeading: 'Architecting the future with precision code.',
    heroDescription:
      'We combine high-performance developer tools with a minimalist philosophy to deliver premium software solutions that scale with your vision.',
    ctaHeading: 'Ready to engineer your next breakthrough?',
    ctaDescription:
      "Our team is currently accepting high-impact projects. Let's build something exceptional together.",
    ctaButtonText: 'Start Your Project',
    ctaButtonLink: '/contact',
  } satisfies ServicesPageContent,

  '/contact': {
    pillText: 'GET IN TOUCH',
    heading: 'Engineering excellence starts with a conversation.',
    subheading: 'Reach out to our technical team for custom software solutions, system architecture, or consulting.',
  } satisfies ContactPageContent,

  '/services/ai-solutions': {
    title: 'AI Solutions & Machine Learning',
    badge: 'Core Engineering Service',
    heroDesc:
      'Precision-engineered intelligence systems designed to scale with your ambition. We bridge the gap between academic theory and production-ready enterprise software through custom neural architectures and automated optimization.',
    capabilitiesTitle: 'Unmatched Technical Depth',
    capabilitiesDesc: "Our AI implementations aren't just wrappers. We build the infrastructure that powers decisions.",
    capabilitiesTag: '01 // CAPABILITIES',
    card1Title: 'Custom LLM Orchestration',
    card1Desc:
      'Fine-tuned models deployed on private infrastructure ensuring total data sovereignty and latency optimization for real-time applications.',
    card2Title: 'Data Pipeline Engineering',
    card2Desc: 'Robust ETL processes that transform raw noise into high-fidelity training signals.',
    card3Title: 'Ethical Guardrails',
    card3Desc: 'Built-in bias detection and alignment protocols to ensure safe enterprise deployment.',
    card4Title: 'Predictive Analytics',
    card4Desc:
      'Move from reactive to proactive with time-series forecasting and anomaly detection algorithms tuned to your business vertical.',
    ctaTitle: 'Ready to Build the Future?',
    ctaDesc:
      "Let's discuss how our AI solutions can integrate into your current ecosystem. Our engineers are ready to solve your most complex data challenges.",
    ctaBtnText: 'Book Free Consultation',
  } satisfies SingleServiceContent,

  '/services/web-development': {
    title: 'Web Development',
    badge: 'Core Engineering Service',
    heroDesc:
      'High-performance websites and web applications built for reliability, clarity, and scalable digital growth.',
    capabilitiesTitle: 'Built for Performance',
    capabilitiesDesc:
      'We develop web products that are fast, maintainable, and ready to evolve as your needs change.',
    capabilitiesTag: '01 // CAPABILITIES',
    card1Title: 'Custom Web Applications',
    card1Desc:
      'Business platforms, dashboards, and operational tools tailored to your requirements.',
    card2Title: 'E-commerce Solutions',
    card2Desc: 'Stores built to convert, scale, and integrate cleanly with your operations.',
    card3Title: 'CMS Development',
    card3Desc: 'Editable content systems that keep your site flexible without adding complexity.',
    card4Title: 'API Integration & Development',
    card4Desc:
      'We connect your web platform to the tools and services your business relies on.',
    ctaTitle: 'Ready to build your next web product?',
    ctaDesc:
      'Let’s create a website or application that is fast, dependable, and aligned with your business goals.',
    ctaBtnText: 'Book Free Consultation',
  } satisfies SingleServiceContent,

  '/services/custom-software': {
    title: 'Custom Software Development',
    badge: 'Core Engineering Service',
    heroDesc:
      'Tailor-made solutions designed around your exact workflows, team structure, and business goals. We build software that fits your operation instead of forcing your operation to fit the software.',
    capabilitiesTitle: 'Built for Complex Operations',
    capabilitiesDesc:
      'Our software work focuses on reliability, maintainability, and clean integration with the systems you already use.',
    capabilitiesTag: '01 // CAPABILITIES',
    card1Title: 'Enterprise Software Systems',
    card1Desc:
      'We design and build core business applications that centralize operations, improve visibility, and support long-term growth.',
    card2Title: 'SaaS Product Development',
    card2Desc: 'Subscription platforms built for scale, performance, and product evolution.',
    card3Title: 'Legacy Modernization',
    card3Desc:
      'We refactor and modernize older systems without disrupting the business processes that depend on them.',
    card4Title: 'Workflow Automation',
    card4Desc:
      'Reduce manual work and remove bottlenecks with custom automation logic, approvals, and operational dashboards.',
    ctaTitle: 'Ready to build the right software?',
    ctaDesc:
      'Let’s discuss how a custom system can streamline your operations and support your next stage of growth.',
    ctaBtnText: 'Book Free Consultation',
  } satisfies SingleServiceContent,

  '/services/digital-marketing': {
    title: 'Digital Marketing',
    badge: 'Core Engineering Service',
    heroDesc:
      'Performance-focused campaigns designed to increase visibility, traffic, and conversions across the channels that matter most to your business.',
    capabilitiesTitle: 'Growth That’s Measured',
    capabilitiesDesc:
      'We combine creative execution with clear analytics so every campaign has a measurable purpose.',
    capabilitiesTag: '01 // CAPABILITIES',
    card1Title: 'SEO Strategy',
    card1Desc:
      'Technical and content-driven search optimization built to improve rankings and attract high-intent visitors.',
    card2Title: 'PPC Campaigns',
    card2Desc: 'Targeted paid media built for immediate traffic and conversion lift.',
    card3Title: 'Social Media Management',
    card3Desc:
      'Brand-first content and community execution across the channels your audience uses most.',
    card4Title: 'Content Marketing',
    card4Desc:
      'Strategic content plans that educate prospects, build trust, and support conversion across the funnel.',
    ctaTitle: 'Ready to grow your reach?',
    ctaDesc:
      'Let’s build a marketing system that drives traffic, leads, and real business outcomes.',
    ctaBtnText: 'Book Free Consultation',
  } satisfies SingleServiceContent,

  '/services/mobile-app': {
    title: 'Mobile App Development',
    badge: 'Core Engineering Service',
    heroDesc:
      'Native and cross-platform mobile experiences that feel fast, intuitive, and reliable across every major device ecosystem.',
    capabilitiesTitle: 'Built for Modern Devices',
    capabilitiesDesc:
      'We create mobile products that are designed for performance, usability, and long-term maintainability.',
    capabilitiesTag: '01 // CAPABILITIES',
    card1Title: 'iOS & Android Apps',
    card1Desc:
      'High-quality native experiences for both major platforms with consistent functionality and polish.',
    card2Title: 'Cross-Platform Delivery',
    card2Desc: 'Shared-code app builds for efficient launches without sacrificing user quality.',
    card3Title: 'Mobile UI/UX Design',
    card3Desc: 'Interfaces optimized for touch, speed, accessibility, and retention.',
    card4Title: 'App Store Ready',
    card4Desc:
      'We handle the product details that matter during release, from QA to launch preparation and store submission.',
    ctaTitle: 'Ready to launch your app?',
    ctaDesc:
      'Let’s design and build a mobile experience that your customers will actually want to use.',
    ctaBtnText: 'Book Free Consultation',
  } satisfies SingleServiceContent,

  '/services/ui-ux': {
    title: 'UI/UX Design',
    badge: 'Core Engineering Service',
    heroDesc:
      'Intuitive interfaces and thoughtful product experiences that make complex systems feel simple, clear, and enjoyable to use.',
    capabilitiesTitle: 'Design That Moves Users',
    capabilitiesDesc:
      'We translate research and product goals into interfaces that are clear, usable, and polished.',
    capabilitiesTag: '01 // CAPABILITIES',
    card1Title: 'User Research & Strategy',
    card1Desc:
      'We start with the people using your product, then shape the experience around their needs and expectations.',
    card2Title: 'Visual Design',
    card2Desc: 'Clean, high-fidelity screens that reinforce your brand and guide action.',
    card3Title: 'Wireframing',
    card3Desc:
      'Early structure and layout decisions that make the final product easier to build and use.',
    card4Title: 'Usability Testing',
    card4Desc:
      'We validate interaction patterns and refine friction points before launch so the experience feels natural.',
    ctaTitle: 'Ready to improve your product experience?',
    ctaDesc:
      'Let’s design interfaces that feel simple to use and strong enough to scale with your business.',
    ctaBtnText: 'Book Free Consultation',
  } satisfies SingleServiceContent,
};

// ── 3. Table Creation Helper ──

async function ensureTable(db: any) {
  try {
    if (db?.run) {
      await db.run(`
        CREATE TABLE IF NOT EXISTS page_contents (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          path TEXT NOT NULL UNIQUE,
          sections TEXT NOT NULL,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }
  } catch {
    // Safe to ignore if unsupported or already exists
  }
}

// ── 4. Retrieve Page Content with Edge Fallback ──

export async function getPageContent<T>(path: string): Promise<T> {
  const defaultContent = (DEFAULT_PAGE_CONTENTS[path] || {}) as T;

  try {
    const db = await getDb();
    await ensureTable(db);

    const rows = await db
      .select()
      .from(schema.pageContents)
      .where(eq(schema.pageContents.path, path))
      .limit(1);

    if (rows && rows.length > 0 && rows[0].sections) {
      const parsed = typeof rows[0].sections === 'string'
        ? JSON.parse(rows[0].sections)
        : rows[0].sections;

      // Deep merge with default values so newly introduced keys never evaluate to undefined
      return {
        ...defaultContent,
        ...parsed,
      };
    }
  } catch (err) {
    // If database is unavailable, immediately serve hardcoded defaults with 0ms delay
  }

  return defaultContent;
}

// ── 5. Retrieve All Page Contents for Admin Panel ──

export async function getAllPageContents(): Promise<Record<string, any>> {
  const result: Record<string, any> = {};

  // Populate defaults first
  for (const [path, defaults] of Object.entries(DEFAULT_PAGE_CONTENTS)) {
    result[path] = { ...defaults };
  }

  try {
    const db = await getDb();
    await ensureTable(db);

    const rows = await db.select().from(schema.pageContents).all();

    if (rows && rows.length > 0) {
      for (const row of rows) {
        if (row.path && row.sections) {
          const parsed = typeof row.sections === 'string'
            ? JSON.parse(row.sections)
            : row.sections;

          result[row.path] = {
            ...(result[row.path] || {}),
            ...parsed,
          };
        }
      }
    }
  } catch {
    // Return defaults on error
  }

  return result;
}

// ── 6. Save or Upsert Page Content ──

export async function savePageContent(path: string, sections: any): Promise<void> {
  const db = await getDb();
  await ensureTable(db);

  const serialized = typeof sections === 'string' ? sections : JSON.stringify(sections);

  const existing = await db
    .select()
    .from(schema.pageContents)
    .where(eq(schema.pageContents.path, path))
    .limit(1);

  if (existing && existing.length > 0) {
    await db
      .update(schema.pageContents)
      .set({
        sections: serialized,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.pageContents.path, path))
      .run();
  } else {
    await db
      .insert(schema.pageContents)
      .values({
        path,
        sections: serialized,
        updatedAt: new Date().toISOString(),
      })
      .run();
  }
}
