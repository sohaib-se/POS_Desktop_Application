'use client';

import { useState, useEffect } from 'react';

export default function ConsultationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: '',
    message: '',
  });

  useEffect(() => {
    const handleOpen = () => {
      setStatusMessage(null);
      setIsOpen(true);
    };
    window.addEventListener('open-consultation-modal', handleOpen);
    return () => window.removeEventListener('open-consultation-modal', handleOpen);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setStatusMessage({ type: 'success', text: data.message || 'Consultation request received successfully!' });
        setFormData({ name: '', email: '', service: '', message: '' });
        setTimeout(() => {
          setIsOpen(false);
          setStatusMessage(null);
        }, 2200);
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Failed to submit request. Please try again.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'An unexpected error occurred. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setIsOpen(false)}
    >
      <style jsx>{`
        .consultation-modal-content {
          border-radius: 28px !important;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(30, 41, 59, 0.96) 44%, rgba(248, 250, 252, 0.98) 44%, rgba(255, 255, 255, 0.98) 100%) !important;
          box-shadow: 0 30px 80px rgba(15, 23, 42, 0.28) !important;
          overflow: hidden;
          width: 100%;
          max-width: 720px;
        }

        .consultation-modal-grid {
          display: grid;
          grid-template-columns: 1fr;
        }

        .consultation-modal-aside {
          padding: 1.35rem;
          color: #fff;
          background:
            radial-gradient(circle at top right, rgba(79, 70, 229, 0.22), transparent 38%),
            radial-gradient(circle at bottom left, rgba(14, 165, 233, 0.18), transparent 35%),
            linear-gradient(160deg, #0f172a 0%, #111827 100%);
        }

        .consultation-modal-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.45rem 0.85rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .consultation-modal-title {
          margin: 0.8rem 0 0.6rem;
          font-size: clamp(1.45rem, 2.3vw, 1.8rem);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.03em;
        }

        .consultation-modal-copy {
          margin: 0;
          color: rgba(255, 255, 255, 0.76);
          font-size: 0.94rem;
          line-height: 1.55;
          max-width: 26rem;
        }

        .consultation-modal-points {
          display: grid;
          gap: 0.6rem;
          margin-top: 1rem;
        }

        .consultation-modal-point {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          font-size: 0.9rem;
          line-height: 1.45;
          color: rgba(255, 255, 255, 0.92);
        }

        .consultation-modal-point .material-symbols-outlined {
          font-size: 1.2rem;
          color: #00ff88;
          margin-top: 0.1rem;
          flex-shrink: 0;
        }

        .consultation-modal-form-wrap {
          position: relative;
          padding: 1.35rem;
          background: rgba(255, 255, 255, 0.98);
        }

        .consultation-modal-close {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          z-index: 2;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #475569;
          transition: background 0.2s;
        }

        .consultation-modal-close:hover {
          background: rgba(0, 0, 0, 0.1);
          color: #0f172a;
        }

        .consultation-form {
          display: grid;
          gap: 0.75rem;
          padding-top: 0.35rem;
        }

        .consultation-form-field {
          display: grid;
          gap: 0.45rem;
        }

        .consultation-form-label {
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          color: #334155;
        }

        .consultation-form-input {
          width: 100%;
          padding: 0.78rem 0.9rem;
          border: 1px solid #cbd5e1;
          border-radius: 16px;
          background: #fff;
          color: #0f172a;
          font-size: 0.96rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
        }

        .consultation-form-input::placeholder {
          color: #94a3b8;
        }

        .consultation-form-input:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.14);
        }

        .consultation-form-textarea {
          min-height: 88px;
          resize: vertical;
        }

        .consultation-form-submit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.55rem;
          width: 100%;
          padding: 1rem 1.15rem;
          border: 0;
          border-radius: 16px;
          color: #ffffff;
          font-weight: 700;
          background: linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%);
          box-shadow: 0 12px 24px rgba(79, 70, 229, 0.28);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .consultation-form-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 16px 28px rgba(79, 70, 229, 0.34);
        }

        .consultation-form-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .consultation-form-submit .material-symbols-outlined {
          font-size: 1.1rem;
        }

        @media (min-width: 992px) {
          .consultation-modal-grid {
            grid-template-columns: 0.92fr 1.08fr;
          }

          .consultation-modal-form-wrap {
            padding: 1.45rem;
          }
        }

        @media (max-width: 991.98px) {
          .consultation-modal-content {
            background: #fff !important;
          }

          .consultation-modal-aside {
            border-radius: 28px 28px 0 0;
          }

          .consultation-modal-form-wrap {
            border-radius: 0 0 28px 28px;
          }
        }

        @media (max-width: 576px) {
          .consultation-modal-aside,
          .consultation-modal-form-wrap {
            padding: 0.95rem;
          }

          .consultation-modal-close {
            top: 0.9rem;
            right: 0.9rem;
          }
        }
      `}</style>

      <div
        className="consultation-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="consultation-modal-grid">
          {/* Left Hero Sidebar */}
          <div className="consultation-modal-aside">
            <div className="consultation-modal-badge">
              <span className="material-symbols-outlined">bolt</span>
              Free strategy call
            </div>
            <h5 className="consultation-modal-title">Book Free Consultation</h5>
            <p className="consultation-modal-copy">
              Share your goals, timeline, and challenges. We’ll map out practical next steps tailored to your business.
            </p>
            <div className="consultation-modal-points">
              <div className="consultation-modal-point">
                <span className="material-symbols-outlined">check_circle</span>
                Clear recommendations before you commit
              </div>
              <div className="consultation-modal-point">
                <span className="material-symbols-outlined">check_circle</span>
                Fast response from the Laimsoft team
              </div>
              <div className="consultation-modal-point">
                <span className="material-symbols-outlined">check_circle</span>
                Aligned with your website’s design language
              </div>
            </div>
          </div>

          {/* Right Form Container */}
          <div className="consultation-modal-form-wrap">
            <button
              type="button"
              className="consultation-modal-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            {statusMessage && (
              <div
                className={`mb-3 p-3 rounded-xl text-xs font-semibold ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {statusMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="consultation-form">
              <div className="consultation-form-field">
                <label className="consultation-form-label">Full Name</label>
                <input
                  type="text"
                  className="consultation-form-input"
                  name="name"
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="consultation-form-field">
                <label className="consultation-form-label">Email Address</label>
                <input
                  type="email"
                  className="consultation-form-input"
                  name="email"
                  required
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="consultation-form-field">
                <label className="consultation-form-label">Service</label>
                <select
                  className="consultation-form-input"
                  name="service"
                  required
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                >
                  <option value="" disabled>
                    Select a service
                  </option>
                  <option value="Digital Marketing">Digital Marketing</option>
                  <option value="AI Solutions">AI Solutions</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Mobile App Development">Mobile App Development</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Custom Software">Custom Software</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="consultation-form-field">
                <label className="consultation-form-label">Message</label>
                <textarea
                  className="consultation-form-input consultation-form-textarea"
                  name="message"
                  rows={4}
                  placeholder="Tell us about your project..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button type="submit" disabled={loading} className="consultation-form-submit">
                <span className="material-symbols-outlined">send</span>
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
