'use client';

import React, { useState } from 'react';
import { ContactPageContent } from '@/lib/pageContent';

const SERVICES_LIST = [
  'Web Development',
  'Custom Software',
  'AI Solutions',
  'Mobile App Development',
  'UI/UX Design',
  'Digital Marketing',
  'Consulting',
  'Other',
];

interface Props {
  content: ContactPageContent;
}

export default function ContactPageClient({ content }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Software Development',
    message: '',
  });
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const toggleService = (srv: string) => {
    setSelectedServices((prev) =>
      prev.includes(srv) ? prev.filter((item) => item !== srv) : [...prev, srv]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          services: selectedServices,
          message: formData.message,
        }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setStatusMsg({ type: 'success', text: data.message || 'Message sent successfully!' });
        setFormData({ name: '', email: '', subject: 'Software Development', message: '' });
        setSelectedServices([]);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'Failed to send message. Please try again.' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Network error. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <main className="contact-main" id="contact-content">
        <div className="contact-inner">
          {/* Page Header */}
          <div className="contact-page-header">
            <span className="contact-page-pill">{content.pillText || 'GET IN TOUCH'}</span>
            <h1>{content.heading || 'Engineering excellence starts with a conversation.'}</h1>
            <p>{content.subheading || 'Reach out to our technical team for custom software solutions, system architecture, or consulting.'}</p>
          </div>

          {/* Two-column grid */}
          <div className="contact-grid">
            {/* ── FORM ── */}
            <section className="contact-form-card">
              <form id="contactForm" onSubmit={handleSubmit}>
                {statusMsg && (
                  <div
                    style={{
                      padding: '14px 18px',
                      borderRadius: '8px',
                      marginBottom: '24px',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '13px',
                      fontWeight: 600,
                      backgroundColor: statusMsg.type === 'success' ? '#e6fbf0' : '#fee2e2',
                      color: statusMsg.type === 'success' ? '#047857' : '#b91c1c',
                      border: `1px solid ${statusMsg.type === 'success' ? '#34d399' : '#f87171'}`,
                    }}
                  >
                    {statusMsg.text}
                  </div>
                )}

                {/* Name + Email row */}
                <div className="contact-field-grid">
                  <div className="contact-field">
                    <label className="contact-label">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      className="contact-input"
                      placeholder="John Doe"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="contact-field">
                    <label className="contact-label">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      className="contact-input"
                      placeholder="john@example.com"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                {/* Subject dropdown */}
                <div className="contact-field">
                  <label className="contact-label">Subject</label>
                  <select
                    name="subject"
                    className="contact-select"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  >
                    <option value="Software Development">Software Development</option>
                    <option value="AI / ML Solutions">AI / ML Solutions</option>
                    <option value="Mobile App Development">Mobile App Development</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Cloud Architecture">Cloud Architecture</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Services multi-select pills */}
                <div className="contact-field">
                  <label className="contact-label">Services Required (Optional)</label>
                  <div className="contact-services-pills">
                    {SERVICES_LIST.map((srv) => {
                      const selected = selectedServices.includes(srv);
                      return (
                        <button
                          key={srv}
                          type="button"
                          className={`contact-pill ${selected ? 'selected' : ''}`}
                          onClick={() => toggleService(srv)}
                        >
                          <span className="material-symbols-outlined icon-sm">
                            {selected ? 'check' : 'add'}
                          </span>
                          {srv}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Message */}
                <div className="contact-field">
                  <label className="contact-label">Project Details</label>
                  <textarea
                    name="message"
                    rows={5}
                    className="contact-textarea"
                    placeholder="Tell us about your project, timeline, and goals..."
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  ></textarea>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="contact-submit-btn"
                  id="contact-submit-btn"
                  disabled={loading}
                >
                  <span className="material-symbols-outlined">send</span>
                  {loading ? 'Transmitting...' : 'Send Message'}
                </button>
              </form>
            </section>

            {/* ── SIDEBAR INFO ── */}
            <aside className="contact-sidebar">
              {/* Location */}
              <div className="contact-info-card">
                <div className="contact-info-icon">
                  <span className="material-symbols-outlined">location_on</span>
                </div>
                <div>
                  <h3>Global Operations</h3>
                  <p>Peshawar, Khyber Pakhtunkhwa, Pakistan</p>
                </div>
              </div>

              {/* Email */}
              <div className="contact-info-card">
                <div className="contact-info-icon">
                  <span className="material-symbols-outlined">alternate_email</span>
                </div>
                <div>
                  <h3>Email Us</h3>
                  <p>laimsoftofficial@gmail.com</p>
                </div>
              </div>

              {/* Phone */}
              <div className="contact-info-card">
                <div className="contact-info-icon">
                  <span className="material-symbols-outlined">call</span>
                </div>
                <div>
                  <h3>Call Us</h3>
                  <p>+92 336 9322038</p>
                </div>
              </div>

              {/* Office Image */}
              <div className="contact-office-img">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfC_xAwRK1DYXyumdEGqIpc0_qyqVvRhTJcC4YwCuCFPwywa2heI4GlboXiW8ZQ-Tr-nKodzoiJtgBI5_k6KkOt_9fa7C-DIcjTiWmYKCnIE7QXM1sR6bOHzXWe8oeSQwOrFE0p_DOUrTaTLoaKojCJeGmu6jleu5rJ-yhFW4GUTg2tfSJo0YFGTREGOHXjGGBzNkJOjWKF4FcRGlI4aNwoDLVaBYptB_qggZiIO0Ye89Gb2t7uEaEUwr1dDLpKtfMmwnbulvlGMs"
                  alt="Our Innovation Hub"
                />
                <div className="contact-office-overlay">
                  <span className="contact-office-label">Our Innovation Hub</span>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* ── MAP SECTION ── */}
        <div className="contact-map-section">
          <div className="contact-map-header">
            <h2>Global Presence</h2>
            <div className="contact-live-badge">
              <span className="contact-live-dot"></span>
              Live Operations
            </div>
          </div>
          <div className="contact-map-frame">
            <iframe
              title="Global Presence Map"
              src="https://maps.google.com/maps?q=Peshawar%2C%20Pakistan&t=&z=13&ie=UTF8&iwloc=&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </main>
    </div>
  );
}
