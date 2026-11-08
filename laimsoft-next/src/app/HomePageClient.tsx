'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import LogoMarquee from '@/components/LogoMarquee';
import { HomePageContent } from '@/lib/pageContent';

const SERVICES = [
  {
    icon: 'trending_up',
    title: 'Digital Marketing',
    desc: 'Data-driven strategies to amplify your brand presence and conversion rates globally.',
    link: 'digital-marketing',
    image: 'Digital Marketing.jfif',
  },
  {
    icon: 'psychology',
    title: 'AI Solutions',
    desc: 'Custom machine learning models and automated workflows to optimize operations.',
    link: 'ai-solutions',
    image: 'ai.jfif',
  },
  {
    icon: 'code',
    title: 'Web Development',
    desc: 'High-performance, scalable web architectures built with modern frameworks.',
    link: 'web-development',
    image: 'website development.jfif',
  },
  {
    icon: 'smartphone',
    title: 'Mobile App Dev',
    desc: 'Seamless cross-platform mobile experiences for iOS and Android environments.',
    link: 'mobile-app',
    image: 'Mobile App Development.jfif',
  },
  {
    icon: 'brush',
    title: 'UI/UX Design',
    desc: 'Precision-crafted interfaces focusing on user centricity and minimalist aesthetics.',
    link: 'ui-ux',
    image: 'ui-ux.jpg',
  },
  {
    icon: 'terminal',
    title: 'Custom Software',
    desc: 'Bespoke enterprise software tailored to your specific organizational needs.',
    link: 'custom-software',
    image: 'custom-software.jpg',
  },
];

interface Props {
  content: HomePageContent;
}

export default function HomePageClient({ content }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay policy handled
        });
      }
    }
  }, []);

  const openConsultation = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-consultation-modal'));
    }
  };

  return (
    <>
      {/* ── Hero Section with Video Background ── */}
      <section className="relative isolate min-h-[95vh] flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="video-background absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
        >
          <source src="/videos/corporate.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Sophisticated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80 z-[1] pointer-events-none"></div>

        <div className="container mx-auto relative z-10 text-left px-6">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 backdrop-blur-xl mb-10 border border-white/10">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span className="font-sans text-[11px] font-bold uppercase tracking-[0.3em] text-white/90">
                {content.heroBadge || 'The Future of Software Engineering'}
              </span>
            </div>

            <h1 className="font-display text-5xl md:text-8xl text-white mb-8 leading-[1] font-extrabold tracking-tighter">
              {content.heroHeading || 'Precision Built'} <br className="hidden md:block" />{' '}
              <span className="text-white/60">{content.heroHeadingAccent || 'Digital Assets.'}</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 mb-12 leading-relaxed max-w-2xl font-medium">
              {content.heroSubheading ||
                'We orchestrate high-performance digital ecosystems through elite engineering and data-driven intelligence.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-start gap-6">
              <Link
                href={content.heroPrimaryBtnLink || '/contact'}
                className="w-full sm:w-auto btn-get-started inline-flex items-center justify-center bg-white text-black border border-white px-12 py-4 rounded-full font-bold text-sm transition-all active:scale-95 shadow-2xl shadow-black/50"
              >
                {content.heroPrimaryBtnText || 'Get Started'}
              </Link>
              <button
                id="hero-book-consultation-btn"
                type="button"
                onClick={openConsultation}
                className="w-full sm:w-auto btn-book-consultation border border-white text-white px-12 py-4 rounded-full font-bold text-sm transition-all active:scale-95 backdrop-blur-md cursor-pointer"
              >
                {content.heroSecondaryBtnText || 'Book Free Consultation'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trusted By Section (Premium Dual Marquee) ── */}
      <LogoMarquee />

      <hr className="divider-modern" />

      {/* ── Services Section ── */}
      <section className="py-12 px-6 container mx-auto overflow-hidden">
        <div>
          <div className="text-center mb-24">
            <span className="font-display font-bold text-accent mb-4 block uppercase tracking-[0.3em] text-xs">
              {content.servicesTag || 'Our Expertise'}
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-black tracking-tighter leading-none mb-6">
              {content.servicesHeading || 'Our Services'}
            </h2>
            <p className="text-slate-500 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-medium">
              {content.servicesSubheading ||
                'We deliver high-impact technological interventions designed for the modern enterprise landscape.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {SERVICES.map((s) => (
              <div
                key={s.title}
                className="service-card-premium group relative isolate overflow-hidden rounded-[32px] min-h-[360px] flex flex-col justify-end border border-white/10 shadow-2xl shadow-black/20 transform-gpu transition-all duration-500 hover:-translate-y-2 hover:shadow-black/30"
              >
                <img
                  src={`/images/${encodeURIComponent(s.image)}`}
                  alt={s.title}
                  className="service-card-image absolute inset-0 h-full w-full rounded-[32px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="service-card-overlay absolute inset-0 rounded-[32px] bg-gradient-to-t from-black via-black/75 to-black/35"></div>
                <div className="service-card-overlay absolute inset-0 rounded-[32px] bg-black/20"></div>
                <div className="relative z-10 p-8 sm:p-10 flex flex-col h-full justify-end">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 bg-white/10 backdrop-blur-md border border-white/15">
                    <span className="material-symbols-outlined text-3xl text-white transition-colors">
                      {s.icon}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white tracking-tight">{s.title}</h3>
                  <p className="text-slate-200 leading-relaxed mb-8 flex-grow font-medium">{s.desc}</p>
                  <Link
                    href={`/services/${s.link}`}
                    className="inline-flex items-center gap-2 text-white font-bold text-xs uppercase tracking-widest group-hover:gap-4 transition-all duration-300"
                  >
                    Explore Solution{' '}
                    <span className="material-symbols-outlined text-sm text-white transition-colors">
                      arrow_forward
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="divider-modern" />

      {/* ── Why Choose Us ── */}
      <section className="py-12 px-6 mb-20 lg:mb-28">
        <div className="max-w-6xl mx-auto px-8 sm:px-12 lg:px-20">
          <div className="text-center mb-24">
            <span className="font-display font-bold text-accent mb-4 block uppercase tracking-[0.3em] text-xs">
              {content.advantageTag || 'The Advantage'}
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-black tracking-tighter mb-8">
              {content.advantageHeading || 'Engineered for Excellence'}
            </h2>
            <p className="text-slate-500 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-medium">
              {content.advantageSubheading ||
                'We combine strategic expertise with technical precision to deliver solutions that drive measurable business impact and sustainable growth.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border border-slate-200 mb-10 group-hover:border-accent group-hover:bg-accent group-hover:text-white transition-all duration-500">
                <span className="material-symbols-outlined text-4xl">bolt</span>
              </div>
              <h4 className="text-2xl font-bold mb-6 text-black tracking-tight group-hover:text-accent transition-colors">
                Fast Delivery
              </h4>
              <p className="text-slate-500 leading-relaxed font-medium">
                Agile methodologies ensuring rapid prototyping and deployment cycles without compromising quality.
              </p>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border border-slate-200 mb-10 group-hover:border-accent group-hover:bg-accent group-hover:text-white transition-all duration-500">
                <span className="material-symbols-outlined text-4xl">groups</span>
              </div>
              <h4 className="text-2xl font-bold mb-6 text-black tracking-tight group-hover:text-accent transition-colors">
                Expert Team
              </h4>
              <p className="text-slate-500 leading-relaxed font-medium">
                Silicon Valley standards brought to your project by seasoned engineers and designers.
              </p>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border border-slate-200 mb-10 group-hover:border-accent group-hover:bg-accent group-hover:text-white transition-all duration-500">
                <span className="material-symbols-outlined text-4xl">layers</span>
              </div>
              <h4 className="text-2xl font-bold mb-6 text-black tracking-tight group-hover:text-accent transition-colors">
                Scalable Solutions
              </h4>
              <p className="text-slate-500 leading-relaxed font-medium">
                Architectures designed to grow with your user base from day one to global scale.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
