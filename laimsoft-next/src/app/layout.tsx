import type { Metadata } from 'next';
import './globals.css';
import PublicSiteShell from '@/components/PublicSiteShell';
import { getGlobalSeo } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const globalSeo = await getGlobalSeo();

  return {
    title: {
      default: 'Laimsoft — Engineering The Future of Software & AI',
      template: globalSeo.titleTemplate || '%s — Laimsoft',
    },
    description:
      globalSeo.defaultDescription ||
      'Laimsoft provides cutting-edge software solutions including custom enterprise development, mobile apps, AI solutions, and digital marketing.',
    metadataBase: new URL('https://laimsoft.site'),
    verification: {
      google: globalSeo.googleVerification || undefined,
      other: globalSeo.bingVerification
        ? { 'msvalidate.01': globalSeo.bingVerification }
        : undefined,
    },
    openGraph: {
      title: 'Laimsoft — Precision Built Digital Assets',
      description:
        globalSeo.defaultDescription ||
        'We orchestrate high-performance digital ecosystems through elite engineering and data-driven intelligence.',
      url: 'https://laimsoft.site',
      siteName: globalSeo.siteName || 'Laimsoft',
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url:
            globalSeo.defaultOgImage ||
            'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        },
      ],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const globalSeo = await getGlobalSeo();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        {globalSeo.organizationSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: globalSeo.organizationSchema }}
          />
        )}
      </head>
      <body className="min-h-screen bg-white text-slate-900 antialiased flex flex-col">
        <PublicSiteShell>{children}</PublicSiteShell>
      </body>
    </html>
  );
}
