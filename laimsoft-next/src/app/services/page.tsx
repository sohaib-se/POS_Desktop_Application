import Link from 'next/link';
import { getPageContent, ServicesPageContent } from '@/lib/pageContent';

export default async function ServicesPage() {
  const content = await getPageContent<ServicesPageContent>('/services');

  return (
    <div className="w-full">
      {/* ══════════════════════════════════════════
           HERO — Full Screen, Fixed Background
      ══════════════════════════════════════════ */}
      <section className="lms-hero" id="lms-hero-top">
        <div className="lms-hero-content">
          <div className="lms-hero-badge">
            <span className="lms-hero-badge-dot"></span>
            <span className="lms-hero-badge-text">{content.heroBadge || 'Excellence in Engineering'}</span>
          </div>
          <h1>{content.heroHeading || 'Architecting the future with precision code.'}</h1>
          <p>
            {content.heroDescription ||
              'We combine high-performance developer tools with a minimalist philosophy to deliver premium software solutions that scale with your vision.'}
          </p>
          <a href="#lms-services" className="lms-hero-scroll" aria-label="Scroll to services">
            <span className="material-symbols-outlined">keyboard_arrow_down</span>
            Scroll
          </a>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           BENTO GRID
      ══════════════════════════════════════════ */}
      <section className="lms-bento" id="lms-services">
        <div className="lms-bento-grid">
          {/* AI Solutions — col 8 */}
          <div className="lms-card lms-col-8 lms-card-ai">
            <div>
              <div className="lms-icon-box">
                <span className="material-symbols-outlined">neurology</span>
              </div>
              <h3 className="lms-card-title">AI Solutions</h3>
              <p className="lms-card-desc">
                Deploy state-of-the-art Large Language Models and custom neural architectures tailored to your specific operational workflows. We focus on ethical, scalable, and highly performant AI integration.
              </p>
              <div className="lms-tags">
                <span className="lms-tag">LLMs</span>
                <span className="lms-tag">PyTorch</span>
                <span className="lms-tag">NLP</span>
              </div>
            </div>
            <Link href="/services/ai-solutions" className="lms-btn-primary">
              Learn More
            </Link>
            <div className="lms-card-watermark">
              <span className="material-symbols-outlined">neurology</span>
            </div>
          </div>

          {/* Web Development — col 4 */}
          <div className="lms-card lms-col-4 lms-card-compact">
            <div>
              <div className="lms-icon-box">
                <span className="material-symbols-outlined">code</span>
              </div>
              <h3 className="lms-card-title">Web Development</h3>
              <p className="lms-card-desc">
                High-performance web applications and e-commerce solutions built with modern technologies like PHP, Node.js, and React.
              </p>
            </div>
            <Link href="/services/web-development" className="lms-btn-outline">
              Learn More
            </Link>
          </div>

          {/* Custom Software — col 4 */}
          <div
            className="lms-card lms-col-4"
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div className="lms-icon-box">
                <span className="material-symbols-outlined">code_blocks</span>
              </div>
              <h3 className="lms-card-title">Custom Software</h3>
              <p className="lms-card-desc">
                Tailor-made enterprise solutions including SaaS development, legacy modernization, and workflow automation.
              </p>
            </div>
            <Link href="/services/custom-software" className="lms-btn-outline">
              Learn More
            </Link>
          </div>

          {/* Digital Marketing — col 8, dark */}
          <div className="lms-card-dark lms-col-8">
            <div className="lms-card-dark-inner">
              <div style={{ flex: 1 }}>
                <div className="lms-icon-box">
                  <span className="material-symbols-outlined">trending_up</span>
                </div>
                <h3 className="lms-card-title">Digital Marketing</h3>
                <p className="lms-card-desc">
                  Data-driven marketing strategies including SEO, PPC advertising, social media management, and content marketing to grow your online presence.
                </p>
                <Link href="/services/digital-marketing" className="lms-btn-green">
                  Learn More
                </Link>
              </div>
              <div className="lms-cyber-img">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6u9Qsuk_Nz4sHUVGGy0UYfyvNm7Em8F5ZJrX2WyhSPI-8PVUup1GapuTWk2HX4i99YxAahgn4Es8rrPX4aTcbZEhoK89Xl6On8mR1tBxbg_JrP5FjwSUjCpMipKVDh_WnJvcefEoVVsldbeRL5ioCIBDvlIiSJQTECfol1KfCMGL-lIUcy6Fv3AcjXj9hPMRY5esGnACqHYhm45fIsiR4BwZKOykj-qOEbbOMn2XIhj-Tyq9TZgotI1GOpQ54Ff8hh3CYVfTlcbY"
                  alt="Digital marketing and analytics"
                />
              </div>
            </div>
          </div>

          {/* Mobile App Development — col 6 */}
          <div className="lms-card lms-col-6">
            <div className="lms-card-horiz">
              <div className="lms-icon-box">
                <span className="material-symbols-outlined">phone_iphone</span>
              </div>
              <div>
                <h3 className="lms-card-title">Mobile App Development</h3>
                <p className="lms-card-desc">
                  Native iOS, Android, and cross-platform mobile applications that users love, from concept to App Store deployment.
                </p>
                <Link href="/services/mobile-app" className="lms-btn-link">
                  LEARN MORE
                  <span className="material-symbols-outlined icon-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>

          {/* UI/UX Design — col 6 */}
          <div className="lms-card lms-col-6">
            <div className="lms-card-horiz">
              <div className="lms-icon-box">
                <span className="material-symbols-outlined">palette</span>
              </div>
              <div>
                <h3 className="lms-card-title">UI/UX Design</h3>
                <p className="lms-card-desc">
                  Beautiful, intuitive, and user-centric interface design through research, prototyping, and usability testing.
                </p>
                <Link href="/services/ui-ux" className="lms-btn-link">
                  LEARN MORE
                  <span className="material-symbols-outlined icon-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           CTA
      ══════════════════════════════════════════ */}
      <section className="lms-cta-section">
        <div className="lms-cta-box">
          <h2>{content.ctaHeading || 'Ready to engineer your next breakthrough?'}</h2>
          <p>
            {content.ctaDescription ||
              "Our team is currently accepting high-impact projects for Q4 2024. Let's build something exceptional together."}
          </p>
          <div className="lms-cta-btns">
            <Link
              href={content.ctaButtonLink || '/contact'}
              className="lms-btn-green"
              style={{ padding: '16px 40px' }}
            >
              {content.ctaButtonText || 'Start Your Project'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
