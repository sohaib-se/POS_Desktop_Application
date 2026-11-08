import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { getSeoForPath } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoForPath('/about');
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonicalUrl || 'https://laimsoft.site/about' },
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

export default function AboutLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
