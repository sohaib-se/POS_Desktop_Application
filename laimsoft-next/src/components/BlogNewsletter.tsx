'use client';

import React, { useState } from 'react';

export default function BlogNewsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; color: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setMsg({ text: data.message || 'Subscribed successfully!', color: '#00ff88' });
        setEmail('');
      } else {
        setMsg({ text: data.message || 'Subscription failed.', color: '#ff6b6b' });
      }
    } catch {
      setMsg({ text: 'Something went wrong. Please try again.', color: '#ff6b6b' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="blog-newsletter-wrap">
      <div className="blog-newsletter-box">
        <div className="blog-newsletter-text">
          <h2>Stay ahead of the curve.</h2>
          <p>Subscribe to our monthly newsletter for a curated list of engineering breakthroughs, open-source projects, and industry analysis.</p>
        </div>
        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '440px' }}>
          <form className="blog-newsletter-form" onSubmit={handleSubmit}>
            <input
              type="email"
              className="blog-newsletter-input"
              placeholder="you@company.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="blog-newsletter-btn" disabled={loading}>
              {loading ? 'Submitting...' : 'Subscribe'}
            </button>
          </form>
          {msg && (
            <div
              style={{
                marginTop: '12px',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '13px',
                fontWeight: 600,
                color: msg.color,
              }}
            >
              {msg.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
