'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Consultation {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  createdAt: string;
}

interface Contact {
  id: number;
  name: string;
  email: string;
  subject?: string | null;
  services?: string | null;
  message: string;
  createdAt: string;
}

interface DashboardClientProps {
  stats: {
    consultationsTotal: number;
    consultationsMonth: number;
    consultationsPrevMonth: number;
    consultationGrowth: number;
    postsTotal: number;
    postsLast30: number;
    contactsTotal: number;
    contactsLast30: number;
  };
  consultations: Consultation[];
  contacts: Contact[];
}

export default function DashboardClient({ stats, consultations, contacts }: DashboardClientProps) {
  const [modalItem, setModalItem] = useState<{ item: any; type: 'consultation' | 'message' } | null>(null);

  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  return (
    <div className="space-y-10">
      {/* ── Metric Cards (Exact 1:1 PHP dashboard.php) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card: Total Consultations */}
        <div
          className="rounded-xl border border-[rgba(207,196,197,0.30)] p-6 flex flex-col justify-between hover:border-[#00ff88] transition-colors shadow-sm"
          style={{ background: 'rgba(255, 255, 255, 0.70)', backdropFilter: 'blur(20px)', minHeight: '140px' }}
        >
          <div className="flex justify-between items-start">
            <div className="p-2 bg-[#e8e8e8] rounded-lg text-black">
              <span className="material-symbols-outlined text-[20px] block">analytics</span>
            </div>
            <span
              className="text-[12px] font-bold"
              style={{
                fontFamily: "'Space Grotesk', monospace",
                color: stats.consultationGrowth >= 0 ? '#00ff88' : '#ba1a1a',
              }}
            >
              {(stats.consultationGrowth >= 0 ? '+' : '') + stats.consultationGrowth + '%'}
            </span>
          </div>
          <div className="mt-6">
            <p
              className="text-[10px] font-semibold tracking-wider uppercase text-[#5f5e5e]"
              style={{ fontFamily: "'Space Grotesk', monospace" }}
            >
              Total Consultations
            </p>
            <p className="text-[32px] font-semibold text-black tracking-[-0.02em] mt-1 leading-tight">
              {stats.consultationsTotal.toLocaleString()}
            </p>
            <p className="text-[12px] text-[#5f5e5e] mt-1.5">
              This month: {stats.consultationsMonth.toLocaleString()} — Prev month: {stats.consultationsPrevMonth.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Card: Active Blogs */}
        <div
          className="rounded-xl border border-[rgba(207,196,197,0.30)] p-6 flex flex-col justify-between hover:border-[#00ff88] transition-colors shadow-sm"
          style={{ background: 'rgba(255, 255, 255, 0.70)', backdropFilter: 'blur(20px)', minHeight: '140px' }}
        >
          <div className="flex justify-between items-start">
            <div className="p-2 bg-[#e8e8e8] rounded-lg text-black">
              <span className="material-symbols-outlined text-[20px] block">post_add</span>
            </div>
            <span
              className="text-[12px] font-bold text-[#5f5e5e]"
              style={{ fontFamily: "'Space Grotesk', monospace" }}
            >
              Last 30d: {stats.postsLast30.toLocaleString()}
            </span>
          </div>
          <div className="mt-6">
            <p
              className="text-[10px] font-semibold tracking-wider uppercase text-[#5f5e5e]"
              style={{ fontFamily: "'Space Grotesk', monospace" }}
            >
              Active Blogs
            </p>
            <p className="text-[32px] font-semibold text-black tracking-[-0.02em] mt-1 leading-tight">
              {stats.postsTotal.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Card: Contact Messages */}
        <div
          className="rounded-xl border border-[rgba(207,196,197,0.30)] p-6 flex flex-col justify-between hover:border-[#00ff88] transition-colors shadow-sm"
          style={{ background: 'rgba(255, 255, 255, 0.70)', backdropFilter: 'blur(20px)', minHeight: '140px' }}
        >
          <div className="flex justify-between items-start">
            <div className="p-2 bg-[#e8e8e8] rounded-lg text-black">
              <span className="material-symbols-outlined text-[20px] block">approval</span>
            </div>
            <span
              className="text-[12px] font-bold text-[#5f5e5e]"
              style={{ fontFamily: "'Space Grotesk', monospace" }}
            >
              Last 30d: {stats.contactsLast30.toLocaleString()}
            </span>
          </div>
          <div className="mt-6">
            <p
              className="text-[10px] font-semibold tracking-wider uppercase text-[#5f5e5e]"
              style={{ fontFamily: "'Space Grotesk', monospace" }}
            >
              Contact Messages
            </p>
            <p className="text-[32px] font-semibold text-black tracking-[-0.02em] mt-1 leading-tight">
              {stats.contactsTotal.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* ── Recent Consultations Table ── */}
      <section
        className="rounded-xl border border-[rgba(207,196,197,0.30)] overflow-hidden shadow-sm"
        style={{ background: 'rgba(255, 255, 255, 0.70)', backdropFilter: 'blur(20px)' }}
      >
        <div className="p-6 border-b border-[rgba(207,196,197,0.20)] flex justify-between items-center">
          <h3 className="text-[22px] font-semibold text-black tracking-[-0.01em]">
            Recent Consultations
          </h3>
          <Link
            href="/admin/consultations"
            className="flex items-center gap-1 text-black hover:gap-2 transition-all text-[11px] font-semibold tracking-wider uppercase"
            style={{ fontFamily: "'Space Grotesk', monospace" }}
          >
            <span>View All</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#eeeeee]">
              <tr>
                {['Client', 'Email', 'Date', 'Action'].map((h) => (
                  <th
                    key={h}
                    className="py-3 px-6 text-[10px] font-semibold tracking-wider uppercase text-[#5f5e5e] whitespace-nowrap"
                    style={{ fontFamily: "'Space Grotesk', monospace" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {consultations.length > 0 ? (
                consultations.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-[#f3f3f3] transition-colors border-t border-[rgba(207,196,197,0.15)]"
                  >
                    {/* Client */}
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-4">
                        <div className="shrink-0 w-10 h-10 rounded-lg bg-[#eeeeee] flex items-center justify-center font-bold text-black text-sm">
                          {getInitials(c.name)}
                        </div>
                        <p className="font-bold text-black text-[14px]">{c.name}</p>
                      </div>
                    </td>

                    {/* Email */}
                    <td
                      className="py-5 px-6 text-[14px] text-[#5f5e5e]"
                      style={{ fontFamily: "'Space Grotesk', monospace" }}
                    >
                      {c.email}
                    </td>

                    {/* Date */}
                    <td
                      className="py-5 px-6 text-[14px] text-[#5f5e5e] whitespace-nowrap"
                      style={{ fontFamily: "'Space Grotesk', monospace" }}
                    >
                      {formatDate(c.createdAt)}
                    </td>

                    {/* Action */}
                    <td className="py-5 px-6">
                      <button
                        type="button"
                        onClick={() => setModalItem({ item: c, type: 'consultation' })}
                        title="View details"
                        className="p-1 rounded text-black hover:bg-black hover:text-white transition-all inline-flex items-center justify-center cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[#5f5e5e] text-[14px]">
                    No consultations yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Recent Contact Messages Table ── */}
      <section
        className="rounded-xl border border-[rgba(207,196,197,0.30)] overflow-hidden shadow-sm"
        style={{ background: 'rgba(255, 255, 255, 0.70)', backdropFilter: 'blur(20px)' }}
      >
        <div className="p-6 border-b border-[rgba(207,196,197,0.20)] flex justify-between items-center">
          <h3 className="text-[22px] font-semibold text-black tracking-[-0.01em]">
            Recent Contact Messages
          </h3>
          <Link
            href="/admin/messages"
            className="flex items-center gap-1 text-black hover:gap-2 transition-all text-[11px] font-semibold tracking-wider uppercase"
            style={{ fontFamily: "'Space Grotesk', monospace" }}
          >
            <span>View All</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#eeeeee]">
              <tr>
                {['Sender', 'Subject', 'Services', 'Date', 'Action'].map((h) => (
                  <th
                    key={h}
                    className="py-3 px-6 text-[10px] font-semibold tracking-wider uppercase text-[#5f5e5e] whitespace-nowrap"
                    style={{ fontFamily: "'Space Grotesk', monospace" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contacts.length > 0 ? (
                contacts.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-[#f3f3f3] transition-colors border-t border-[rgba(207,196,197,0.15)]"
                  >
                    {/* Sender */}
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-4">
                        <div className="shrink-0 w-10 h-10 rounded-lg bg-[#eeeeee] flex items-center justify-center font-bold text-black text-sm">
                          {getInitials(m.name)}
                        </div>
                        <p className="font-bold text-black text-[14px]">{m.name}</p>
                      </div>
                    </td>

                    {/* Subject */}
                    <td className="py-5 px-6 text-[14px] text-[#5f5e5e]">
                      {m.subject || 'No Subject'}
                    </td>

                    {/* Services */}
                    <td className="py-5 px-6 text-[14px] text-[#5f5e5e]">
                      {m.services || 'No Services Selected'}
                    </td>

                    {/* Date */}
                    <td
                      className="py-5 px-6 text-[14px] text-[#5f5e5e] whitespace-nowrap"
                      style={{ fontFamily: "'Space Grotesk', monospace" }}
                    >
                      {formatDate(m.createdAt)}
                    </td>

                    {/* Action */}
                    <td className="py-5 px-6">
                      <button
                        type="button"
                        onClick={() => setModalItem({ item: m, type: 'message' })}
                        title="View details"
                        className="p-1 rounded text-black hover:bg-black hover:text-white transition-all inline-flex items-center justify-center cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#5f5e5e] text-[14px]">
                    No messages yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Details Modal (Exact 1:1 PHP modal) ── */}
      {modalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setModalItem(null)}
          />
          <div className="relative bg-white rounded-xl p-6 sm:p-8 z-10 w-[min(720px,96%)] max-h-[85vh] overflow-y-auto shadow-2xl border border-[rgba(207,196,197,0.3)]">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#e2e2e2]">
              <h3 className="text-[20px] font-semibold text-black tracking-[-0.01em]">
                {modalItem.type === 'consultation' ? 'Consultation Details' : 'Message Details'}
              </h3>
              <button
                type="button"
                onClick={() => setModalItem(null)}
                className="text-[#5f5e5e] hover:text-black font-semibold text-[13px] tracking-wider uppercase"
                style={{ fontFamily: "'Space Grotesk', monospace" }}
              >
                Close ✕
              </button>
            </div>

            <div className="space-y-4 text-[14px] text-[#1b1b1b]">
              <div>
                <strong className="text-[#5f5e5e] uppercase text-[11px] tracking-wider block font-mono">
                  Full Name
                </strong>
                <p className="font-semibold text-base mt-0.5">{modalItem.item.name}</p>
              </div>

              <div>
                <strong className="text-[#5f5e5e] uppercase text-[11px] tracking-wider block font-mono">
                  Email Address
                </strong>
                <p className="font-mono text-base mt-0.5 text-[#5f5e5e]">{modalItem.item.email}</p>
              </div>

              {modalItem.item.phone && (
                <div>
                  <strong className="text-[#5f5e5e] uppercase text-[11px] tracking-wider block font-mono">
                    Service / Phone
                  </strong>
                  <p className="font-medium text-base mt-0.5">{modalItem.item.phone}</p>
                </div>
              )}

              {modalItem.item.subject && (
                <div>
                  <strong className="text-[#5f5e5e] uppercase text-[11px] tracking-wider block font-mono">
                    Subject
                  </strong>
                  <p className="font-medium text-base mt-0.5">{modalItem.item.subject}</p>
                </div>
              )}

              {modalItem.item.services && (
                <div>
                  <strong className="text-[#5f5e5e] uppercase text-[11px] tracking-wider block font-mono">
                    Requested Services
                  </strong>
                  <p className="font-medium text-base mt-0.5">{modalItem.item.services}</p>
                </div>
              )}

              <div>
                <strong className="text-[#5f5e5e] uppercase text-[11px] tracking-wider block font-mono">
                  Submitted Date
                </strong>
                <p className="font-mono text-base mt-0.5">{formatDate(modalItem.item.createdAt)}</p>
              </div>

              {modalItem.item.message && (
                <div className="pt-3 border-t border-[#e2e2e2]">
                  <strong className="text-[#5f5e5e] uppercase text-[11px] tracking-wider block font-mono mb-2">
                    Message
                  </strong>
                  <div className="p-4 rounded-lg bg-[#f9f9f9] border border-[#cfc4c5] font-sans text-sm whitespace-pre-wrap leading-relaxed">
                    {modalItem.item.message}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
