import React from 'react';
import { getPageContent, AboutPageContent } from '@/lib/pageContent';

export default async function AboutPage() {
  const content = await getPageContent<AboutPageContent>('/about');

  return (
    <div className="about-page">
      {/* ══════════════════════════════════════════
           HERO — Full Screen, Fixed Background
      ══════════════════════════════════════════ */}
      <section className="about-hero" id="about-hero-top">
        <div className="about-hero-content">
          <div className="about-hero-badge">
            <span className="about-hero-badge-dot"></span>
            <span className="about-hero-badge-text">{content.heroBadge || 'Engineered for Excellence'}</span>
          </div>
          <h1>
            {content.heroTitle || 'Innovating at the speed of'}{' '}
            <span className="green-word">{content.heroTitleAccent || 'thought.'}</span>
          </h1>
          <p>
            {content.heroDescription ||
              'Laimsoft is a boutique software engineering firm dedicated to high-performance solutions. We bridge the gap between complex technical challenges and elegant, minimalist user experiences.'}
          </p>
          <div className="about-hero-btns">
            <a href="#about-content" className="about-btn-dark">
              {content.heroPrimaryBtnText || 'Our Journey'}
            </a>
            <a href="#about-team" className="about-btn-outline-white">
              {content.heroSecondaryBtnText || 'View Stack'}
            </a>
          </div>
          <a href="#about-content" className="about-hero-scroll" aria-label="Scroll to content">
            <span className="material-symbols-outlined">keyboard_arrow_down</span>
            Scroll
          </a>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           INTRO SPLIT — Text + Image
      ══════════════════════════════════════════ */}
      <section className="about-intro" id="about-content">
        <div className="about-intro-inner">
          <div>
            <span className="about-intro-label">{content.introBadge || content.heroBadge || 'Engineered for Excellence'}</span>
            <h1>
              {content.introTitle || content.heroTitle || 'Innovating at the speed of'}{' '}
              <span className="green-word">{content.introTitleAccent || content.heroTitleAccent || 'thought.'}</span>
            </h1>
            <p>
              {content.introDescription || content.heroDescription ||
                'Laimsoft is a boutique software engineering firm dedicated to high-performance solutions. We bridge the gap between complex technical challenges and elegant, minimalist user experiences.'}
            </p>
            <div className="about-intro-btns">
              <a href="#about-team" className="about-btn-black">
                {(content.heroPrimaryBtnText || 'OUR JOURNEY').toUpperCase()}
              </a>
              <a href="#about-mv" className="about-btn-outline-dark">
                {(content.heroSecondaryBtnText || 'VIEW STACK').toUpperCase()}
              </a>
            </div>
          </div>
          <div className="about-intro-img-wrap">
            <div className="about-intro-img">
              <img
                src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80"
                alt="Laimsoft — precision engineering"
              />
            </div>
            <div className="about-intro-glow"></div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           MISSION & VISION
      ══════════════════════════════════════════ */}
      <section className="about-mv" id="about-mv">
        <div className="about-mv-inner">
          {/* Mission */}
          <div className="about-mv-card">
            <div className="about-mv-icon">
              <span className="material-symbols-outlined">rocket_launch</span>
            </div>
            <h2>{content.missionTitle || 'Our Mission'}</h2>
            <p>
              {content.missionDescription ||
                "To empower forward-thinking enterprises through bespoke software architectures that prioritize speed, scalability, and technical integrity above all else. We don't just build apps; we engineer foundations."}
            </p>
          </div>
          {/* Vision */}
          <div className="about-mv-card">
            <div className="about-mv-icon">
              <span className="material-symbols-outlined">visibility</span>
            </div>
            <h2>{content.visionTitle || 'Our Vision'}</h2>
            <p>
              {content.visionDescription ||
                'A future where technology is invisible yet omnipotent. We strive to be the architects of a digital world where every line of code serves a purpose, and every interaction feels like a natural extension of human intent.'}
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           TEAM SECTION
      ══════════════════════════════════════════ */}
      <section className="about-team" id="about-team">
        <div className="about-team-inner">
          <div className="about-team-header">
            <span className="about-team-label">{content.teamLabel || 'The Architects'}</span>
            <h2>{content.teamHeading || 'The minds behind the code.'}</h2>
          </div>
          <div className="about-team-grid">
            {/* Member 1: Hilal Hussain (CMO) */}
            <div className="about-team-member">
              <div className="about-team-photo">
                <img
                  src="/images/team/Hilal Hussain.jpeg"
                  alt="Hilal Hussain"
                />
              </div>
              <h3 className="about-team-name">Hilal Hussain</h3>
              <p className="about-team-role">Chief Marketing Officer</p>
            </div>
            {/* Member 2: Muhammad Sohaib (CEO) */}
            <div className="about-team-member">
              <div className="about-team-photo">
                <img
                  src="/images/team/Muhammad Sohaib.jpeg"
                  alt="Muhammad Sohaib"
                />
              </div>
              <h3 className="about-team-name">Muhammad Sohaib</h3>
              <p className="about-team-role">Chief Executive Officer</p>
            </div>
            {/* Member 3: Zeeshan Malik (CTO) */}
            <div className="about-team-member">
              <div className="about-team-photo">
                <img
                  src="/images/team/Zeeshan Malik.jpeg"
                  alt="Zeeshan Malik"
                />
              </div>
              <h3 className="about-team-name">Zeeshan Malik</h3>
              <p className="about-team-role">Chief Technology Officer</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           STATS BENTO
      ══════════════════════════════════════════ */}
      <section className="about-stats">
        <div className="about-stats-inner">
          {/* Light Card */}
          <div className="about-stat-card-light">
            <span className="about-stat-number-green">{content.stat1Value || '120+'}</span>
            <div>
              <h4>{content.stat1Title || 'Systems Deployed'}</h4>
              <p>{content.stat1Desc || 'Global high-availability infrastructures.'}</p>
            </div>
          </div>
          {/* Dark Card */}
          <div className="about-stat-card-dark">
            <span className="about-stat-number-white">{content.stat2Value || '99.9%'}</span>
            <div>
              <h4>{content.stat2Title || 'Engineering Precision'}</h4>
              <p>{content.stat2Desc || 'We set the industry benchmark for uptime and code quality.'}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
