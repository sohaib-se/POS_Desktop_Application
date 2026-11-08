'use client';

import React from 'react';
import Link from 'next/link';

import { ServiceDetail } from '@/lib/servicesData';
export type { ServiceDetail };

interface Props {
  data: ServiceDetail;
}

export default function SingleServicePageClient({ data }: Props) {
  const openConsultation = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-consultation-modal'));
    }
  };

  return (
    <div className="sp-page w-full">
      {/* ══════════════════════════════════════════
           HERO — Internal service page style
      ══════════════════════════════════════════ */}
      <section className="sp-hero">
        <div className="sp-hero-bg">
          <img src={data.bgImage} alt="" aria-hidden="true" />
        </div>
        <div className="sp-hero-inner">
          <div className="sp-hero-pill">
            <span className="sp-hero-pill-dot"></span>
            <span className="sp-hero-pill-text">{data.badge}</span>
          </div>
          <h1>{data.title}</h1>
          <p>{data.heroDesc}</p>
          <div className="sp-hero-btns">
            <button
              type="button"
              onClick={openConsultation}
              className="sp-btn-dark cursor-pointer"
            >
              Start Your Project
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <a href="#sp-features" className="sp-btn-outline">
              View Case Studies
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           FEATURES BENTO GRID
      ══════════════════════════════════════════ */}
      <section className="sp-section sp-features-bg" id="sp-features">
        <div className="sp-container">
          <div className="sp-features-header">
            <div>
              <h2>{data.capabilities.title}</h2>
              <p>{data.capabilities.desc}</p>
            </div>
            <div className="sp-capabilities-tag">{data.capabilities.tag}</div>
          </div>

          <div className="sp-bento">
            {/* Card 1 — Large (8 cols) */}
            <div className="sp-card sp-col-8">
              <div className="sp-card-icon">
                <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>
                  {data.card1.icon}
                </span>
              </div>
              <h3>{data.card1.title}</h3>
              <p>{data.card1.desc}</p>
              <div className="sp-card-stats">
                {data.card1.stats.map((stat, idx) => (
                  <div key={idx}>
                    <div className="sp-stat-val">{stat.val}</div>
                    <div className="sp-stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>
              <img
                className="sp-card-watermark"
                src={data.card1.watermark}
                alt=""
                aria-hidden="true"
              />
            </div>

            {/* Card 2 — Small Dark (4 cols) */}
            <div className="sp-card-dark sp-col-4">
              <span className="material-symbols-outlined">{data.card2.icon}</span>
              <h3>{data.card2.title}</h3>
              <p>{data.card2.desc}</p>
            </div>

            {/* Card 3 — Small Light (4 cols) */}
            <div className="sp-card sp-col-4">
              <div className="sp-card-icon">
                <span className="material-symbols-outlined">{data.card3.icon}</span>
              </div>
              <h3>{data.card3.title}</h3>
              <p>{data.card3.desc}</p>
            </div>

            {/* Card 4 — Medium with bar chart (8 cols) */}
            <div className="sp-card sp-col-8">
              <div className="sp-analytics-inner">
                <div className="sp-analytics-text">
                  <h3>{data.card4.title}</h3>
                  <p>{data.card4.desc}</p>
                </div>
                <div className="sp-bar-chart">
                  {data.card4.bars.map((height, i) => (
                    <div
                      key={i}
                      className={`sp-bar ${i === data.card4.bars.length - 1 ? 'sp-bar-dark' : ''}`}
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           ENGINEERING WORKFLOW
      ══════════════════════════════════════════ */}
      <section className="sp-section sp-process-bg">
        <div className="sp-container">
          <div className="sp-process-header">
            <h2>{data.workflow.title}</h2>
            <p>{data.workflow.desc}</p>
          </div>

          <div className="sp-steps">
            {data.workflow.steps.map((step) => (
              <div key={step.num} className="sp-step">
                <div className={`sp-step-circle ${step.active ? 'sp-step-active' : ''}`}>
                  {step.num}
                </div>
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           CTA SECTION
      ══════════════════════════════════════════ */}
      <section className="sp-cta-bg">
        <div className="sp-container">
          <div className="sp-cta-box">
            <div className="sp-cta-inner">
              <h2>{data.cta.title}</h2>
              <p>{data.cta.desc}</p>
              <div className="sp-cta-btns">
                <button
                  type="button"
                  onClick={openConsultation}
                  className="sp-btn-green cursor-pointer"
                >
                  {data.cta.btnText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
