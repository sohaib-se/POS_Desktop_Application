'use client';

const TRUSTED_LOGOS = [
  'DLA_logo-removebg-preview.png',
  'Rp_tech_logo-removebg-preview.png',
  'Securycor_logo-removebg-preview.png',
  'TabHouse__1_-removebg-preview.png',
  'WhatsApp_Image_2026-03-10_at_12.19.49_PM-removebg-preview.png',
  'WhatsApp_Image_2026-03-10_at_12.19.50_PM-removebg-preview.png',
  'WhatsApp_Image_2026-03-10_at_12.19.50_PM__1_-removebg-preview.png',
  'devspire_logo-removebg-preview.png',
  'softiro_tech-removebg-preview.png',
  'vera-removebg-preview.png',
  'xpert_logo-removebg-preview.png',
];

export default function LogoMarquee() {
  const reversedLogos = [...TRUSTED_LOGOS].reverse();

  return (
    <section className="bg-white py-12 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-24">
          <span className="font-display font-bold text-accent mb-4 block uppercase tracking-[0.3em] text-xs">
            Trusted By
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-black tracking-tighter leading-none mb-6">
            Teams We Build With
          </h2>
          <p className="text-slate-500 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-medium">
            Partnering with industry leaders and innovative companies worldwide to deliver transformative digital solutions.
          </p>
        </div>
        <div className="trusted-logos-marquee-premium">
          {/* Row 1: Scroll Right */}
          <div className="trusted-logos-row-premium trusted-logos-row-1">
            <div className="trusted-logos-track-premium trusted-logos-track-right-premium">
              {TRUSTED_LOGOS.map((logo, idx) => (
                <div key={`r1-a-${idx}`} className="trusted-logo-premium">
                  <img
                    src={`/logos/${encodeURIComponent(logo)}`}
                    alt={logo.replace(/-removebg-preview\.png$/, '')}
                  />
                </div>
              ))}
              {/* Repeat for seamless scroll */}
              {TRUSTED_LOGOS.map((logo, idx) => (
                <div key={`r1-b-${idx}`} className="trusted-logo-premium">
                  <img
                    src={`/logos/${encodeURIComponent(logo)}`}
                    alt={logo.replace(/-removebg-preview\.png$/, '')}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Row 2: Scroll Left */}
          <div className="trusted-logos-row-premium trusted-logos-row-2">
            <div className="trusted-logos-track-premium trusted-logos-track-left-premium">
              {reversedLogos.map((logo, idx) => (
                <div key={`r2-a-${idx}`} className="trusted-logo-premium">
                  <img
                    src={`/logos/${encodeURIComponent(logo)}`}
                    alt={logo.replace(/-removebg-preview\.png$/, '')}
                  />
                </div>
              ))}
              {/* Repeat for seamless scroll */}
              {reversedLogos.map((logo, idx) => (
                <div key={`r2-b-${idx}`} className="trusted-logo-premium">
                  <img
                    src={`/logos/${encodeURIComponent(logo)}`}
                    alt={logo.replace(/-removebg-preview\.png$/, '')}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
