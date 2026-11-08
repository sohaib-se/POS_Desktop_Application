'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Subscriber {
  id: number;
  email: string;
  createdAt: string;
}

export default function NewsletterClient({ subscribers }: { subscribers: Subscriber[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [deleteModalId, setDeleteModalId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getInitials = (email: string) => {
    if (!email) return 'NA';
    const local = email.split('@')[0] || '';
    const clean = local.replace(/[^a-zA-Z0-9]/g, '');
    return (clean.substring(0, 2) || 'NA').toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  // Stats
  const totalAll = subscribers.length;
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const monthCount = subscribers.filter((s) => {
    const d = new Date(s.createdAt || Date.now());
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentCount = subscribers.filter(
    (s) => new Date(s.createdAt || Date.now()) >= oneDayAgo
  ).length;

  const filtered = subscribers.filter((s) =>
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const confirmDelete = async () => {
    if (!deleteModalId) return;
    setIsDeleting(true);
    try {
      await fetch('/api/admin/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id: deleteModalId }),
      });
      setDeleteModalId(null);
      router.refresh();
    } catch {
      alert('Failed to delete subscriber.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadCsv = () => {
    window.location.href = '/api/admin/newsletter/export';
  };

  return (
    <div className="space-y-8">
      {/* ── Page Header & Download CSV ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[36px] sm:text-[40px] font-bold text-black tracking-[-0.03em] leading-tight">
            Newsletter
          </h1>
          <p className="text-[16px] text-[#5f5e5e] mt-1">
            Manage the email addresses subscribed to your newsletter.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#cfc4c5] bg-white text-black hover:bg-[#e8e8e8] text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
          style={{ fontFamily: "'Space Grotesk', monospace" }}
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Download CSV
        </button>
      </div>

      {/* ── Stats Grid (Exact 1:1 PHP newsletter.php) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Subscribers */}
        <div className="bg-white border border-[rgba(207,196,197,0.25)] rounded-xl p-6 shadow-sm">
          <p
            className="text-[10px] font-semibold tracking-widest uppercase text-[#5f5e5e] mb-3"
            style={{ fontFamily: "'Space Grotesk', monospace" }}
          >
            Total Subscribers
          </p>
          <div className="flex items-center gap-2.5">
            <span className="text-[40px] font-bold text-black tracking-[-0.04em] leading-none">
              {totalAll}
            </span>
          </div>
        </div>

        {/* This Month */}
        <div className="bg-white border border-[rgba(207,196,197,0.25)] rounded-xl p-6 shadow-sm">
          <p
            className="text-[10px] font-semibold tracking-widest uppercase text-[#5f5e5e] mb-3"
            style={{ fontFamily: "'Space Grotesk', monospace" }}
          >
            This Month
          </p>
          <div className="flex items-center gap-2.5">
            <span className="text-[40px] font-bold text-black tracking-[-0.04em] leading-none">
              {monthCount}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#00ff88]" />
          </div>
        </div>

        {/* Last 24 Hours */}
        <div className="bg-white border border-[rgba(207,196,197,0.25)] rounded-xl p-6 shadow-sm">
          <p
            className="text-[10px] font-semibold tracking-widest uppercase text-[#5f5e5e] mb-3"
            style={{ fontFamily: "'Space Grotesk', monospace" }}
          >
            Last 24 Hours
          </p>
          <div className="flex items-center gap-2.5">
            <span className="text-[40px] font-bold text-black tracking-[-0.04em] leading-none">
              {recentCount}
            </span>
          </div>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="bg-white p-4 rounded-xl border border-[rgba(207,196,197,0.3)] shadow-sm">
        <div className="relative flex items-center max-w-md">
          <span className="material-symbols-outlined absolute left-3 text-[20px] text-[#5f5e5e]">
            search
          </span>
          <input
            type="text"
            placeholder="Search subscribers by email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-[#f3f3f3] rounded-lg border-none text-sm text-[#1b1b1b] outline-none placeholder-[#5f5e5e] focus:ring-1 focus:ring-black"
          />
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white border border-[rgba(207,196,197,0.25)] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f3f3f3]">
              <tr>
                {['Email', 'Date Subscribed', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="py-3.5 px-6 text-[10px] font-semibold tracking-wider uppercase text-[#5f5e5e] border-b border-[rgba(207,196,197,0.25)] whitespace-nowrap"
                    style={{ fontFamily: "'Space Grotesk', monospace" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(207,196,197,0.15)]">
              {paginated.length > 0 ? (
                paginated.map((s) => (
                  <tr key={s.id} className="hover:bg-[#f3f3f3] transition-colors">
                    {/* Email */}
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-full border border-[#cfc4c5] bg-[#eeeeee] flex items-center justify-center text-[13px] font-bold text-black shrink-0">
                          {getInitials(s.email)}
                        </div>
                        <span className="text-[15px] font-bold text-black font-mono">
                          {s.email}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td
                      className="py-5 px-6 text-[14px] text-[#1b1b1b] whitespace-nowrap"
                      style={{ fontFamily: "'Space Grotesk', monospace" }}
                    >
                      {formatDate(s.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-5 px-6 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setDeleteModalId(s.id)}
                        title="Delete subscriber"
                        className="w-9 h-9 rounded-lg border border-[rgba(207,196,197,0.4)] flex items-center justify-center text-[#5f5e5e] hover:bg-[#fff1f2] hover:text-[#be123c] hover:border-[#be123c] transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-[#5f5e5e] text-sm">
                    No newsletter subscribers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className="p-4 border-t border-[rgba(207,196,197,0.2)] flex items-center justify-between text-xs text-[#5f5e5e]">
          <span style={{ fontFamily: "'Space Grotesk', monospace" }}>
            Showing {filtered.length === 0 ? 0 : (page - 1) * perPage + 1} -{' '}
            {Math.min(page * perPage, filtered.length)} of {filtered.length} subscribers
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3.5 py-1.5 rounded-lg border border-[rgba(207,196,197,0.4)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#e8e8e8] text-black font-semibold uppercase tracking-wider text-[11px]"
              style={{ fontFamily: "'Space Grotesk', monospace" }}
            >
              Previous
            </button>
            <span className="font-semibold text-black px-2">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3.5 py-1.5 rounded-lg bg-black text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-800 font-semibold uppercase tracking-wider text-[11px]"
              style={{ fontFamily: "'Space Grotesk', monospace" }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {deleteModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteModalId(null)}
          />
          <div className="relative bg-white rounded-xl p-6 sm:p-7 z-10 w-[min(440px,96%)] shadow-2xl border border-[rgba(207,196,197,0.3)]">
            <h3 className="text-[18px] font-semibold text-black tracking-tight mb-2">
              Confirm Delete
            </h3>
            <p className="text-sm text-[#5f5e5e] leading-relaxed mb-6">
              Are you sure you want to permanently remove this email from the newsletter subscriber
              list?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalId(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase text-[#5f5e5e] hover:bg-[#e8e8e8] hover:text-black transition-colors"
                style={{ fontFamily: "'Space Grotesk', monospace" }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase bg-[#be123c] text-white hover:bg-[#9f1239] transition-colors disabled:opacity-60"
                style={{ fontFamily: "'Space Grotesk', monospace" }}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
