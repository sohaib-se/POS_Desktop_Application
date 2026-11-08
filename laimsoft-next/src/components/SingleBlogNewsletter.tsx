'use client';

import React, { useState } from 'react';

export default function SingleBlogNewsletter() {
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
    <div className="bp-newsletter-card">
      <h3>Precision Engineering, Delivered.</h3>
      <p>Join 10,000+ developers receiving our weekly deep-dives into high-performance architecture.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          className="bp-newsletter-input"
          placeholder="email@company.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="bp-newsletter-btn" disabled={loading}>
          {loading ? 'Subscribing...' : 'Subscribe Now'}
        </button>
      </form>
      {msg && (
        <div
          style={{
            display: 'block',
            marginTop: '16px',
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
  );
}
