import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSeoForPath } from '@/lib/seo';
import { getPageContent, SingleServiceContent, SERVICE_SLUGS } from '@/lib/pageContent';
import SingleServicePageClient from './SingleServicePageClient';
import { ServiceDetail, STATIC_SERVICES_STRUCTURE } from '@/lib/servicesData';

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return SERVICE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const seo = await getSeoForPath(`/services/${slug}`);

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords || undefined,
    alternates: { canonical: seo.canonicalUrl || `https://laimsoft.site/services/${slug}` },
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

export default async function SingleServicePage({ params }: Props) {
  const { slug } = await params;
  const baseStructure = STATIC_SERVICES_STRUCTURE[slug];

  if (!baseStructure) {
    notFound();
  }

  // Fetch dynamic content from edge cache / D1 (with automatic fallback)
  const content = await getPageContent<SingleServiceContent>(`/services/${slug}`);

  // Merge dynamic text fields on top of structural layout
  const serviceData: ServiceDetail = {
    ...baseStructure,
    title: content.title || baseStructure.title,
    badge: content.badge || baseStructure.badge,
    heroDesc: content.heroDesc || baseStructure.heroDesc,
    capabilities: {
      ...baseStructure.capabilities,
      title: content.capabilitiesTitle || baseStructure.capabilities.title,
      desc: content.capabilitiesDesc || baseStructure.capabilities.desc,
      tag: content.capabilitiesTag || baseStructure.capabilities.tag,
    },
    card1: {
      ...baseStructure.card1,
      title: content.card1Title || baseStructure.card1.title,
      desc: content.card1Desc || baseStructure.card1.desc,
    },
    card2: {
      ...baseStructure.card2,
      title: content.card2Title || baseStructure.card2.title,
      desc: content.card2Desc || baseStructure.card2.desc,
    },
    card3: {
      ...baseStructure.card3,
      title: content.card3Title || baseStructure.card3.title,
      desc: content.card3Desc || baseStructure.card3.desc,
    },
    card4: {
      ...baseStructure.card4,
      title: content.card4Title || baseStructure.card4.title,
      desc: content.card4Desc || baseStructure.card4.desc,
    },
    cta: {
      ...baseStructure.cta,
      title: content.ctaTitle || baseStructure.cta.title,
      desc: content.ctaDesc || baseStructure.cta.desc,
      btnText: content.ctaBtnText || baseStructure.cta.btnText,
    },
  };

  return <SingleServicePageClient data={serviceData} />;
}
