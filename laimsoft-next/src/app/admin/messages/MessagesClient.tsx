'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
  id: number;
  name: string;
  email: string;
  subject?: string | null;
  services?: string | null;
  message: string;
  isRead?: boolean | number | null;
  createdAt: string;
}

export default function MessagesClient({ messages }: { messages: Message[] }) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [detailModal, setDetailModal] = useState<Message | null>(null);
  const [deleteModalId, setDeleteModalId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Stats
  const totalAll = messages.length;
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const monthCount = messages.filter((m) => {
    const d = new Date(m.createdAt || Date.now());
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;
  const unreadCount = messages.filter((m) => !m.isRead).length;

  // Filter
  const filtered = messages.filter((m) => {
    if (statusFilter === 'unread') return !m.isRead;
    if (statusFilter === 'read') return !!m.isRead;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleOpenDetail = async (m: Message) => {
    setDetailModal(m);
    if (!m.isRead) {
      try {
        await fetch('/api/admin/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'mark_read', id: m.id }),
        });
        m.isRead = 1;
        router.refresh();
      } catch {
        // ignore
      }
    }
  };

  const confirmDelete = async () => {
    if (!deleteModalId) return;
    setIsDeleting(true);
    try {
      await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id: deleteModalId }),
      });
      setDeleteModalId(null);
      router.refresh();
    } catch {
      alert('Failed to delete message.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Page Header & Filter Tabs (Exact 1:1 PHP messages.php) ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[36px] sm:text-[40px] font-bold text-black tracking-[-0.03em] leading-tight">
            Messages
          </h1>
          <p className="text-[16px] text-[#5f5e5e] mt-1">
            Inquiries received via the contact portal.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center bg-white border border-[#cfc4c5] rounded-lg overflow-hidden shadow-sm">
          {(['all', 'unread', 'read'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setStatusFilter(tab);
                setPage(1);
              }}
              className={`px-6 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                statusFilter === tab ? 'bg-black text-white' : 'text-[#5f5e5e] hover:text-black'
              }`}
              style={{ fontFamily: "'Space Grotesk', monospace" }}
            >
              {tab === 'all' ? 'All' : tab === 'unread' ? 'Unread' : 'Read'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats Grid (3 Cards) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Inquiries */}
        <div className="bg-white border border-[rgba(207,196,197,0.25)] rounded-xl p-6 shadow-sm">
          <p
            className="text-[10px] font-semibold tracking-widest uppercase text-[#5f5e5e] mb-3"
            style={{ fontFamily: "'Space Grotesk', monospace" }}
          >
            Total Inquiries
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

        {/* Unread */}
        <div className="bg-white border border-[rgba(207,196,197,0.25)] rounded-xl p-6 shadow-sm">
          <p
            className="text-[10px] font-semibold tracking-widest uppercase text-[#5f5e5e] mb-3"
            style={{ fontFamily: "'Space Grotesk', monospace" }}
          >
            Unread
          </p>
          <div className="flex items-center gap-2.5">
            <span className="text-[40px] font-bold text-black tracking-[-0.04em] leading-none">
              {unreadCount}
            </span>
            {unreadCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#4488ff] animate-pulse" />
            )}
          </div>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white border border-[rgba(207,196,197,0.25)] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f3f3f3]">
              <tr>
                {['Sender', 'Subject', 'Services', 'Date', 'Action'].map((h) => (
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
                paginated.map((m) => (
                  <tr key={m.id} className="hover:bg-[#f3f3f3] transition-colors">
                    {/* Sender */}
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-full border border-[#cfc4c5] bg-[#eeeeee] flex items-center justify-center text-[13px] font-bold text-black shrink-0">
                          {getInitials(m.name)}
                        </div>
                        <div>
                          <div className="text-[15px] font-bold text-black leading-tight">
                            {m.name}
                          </div>
                          <div className="text-[13px] text-[#5f5e5e] mt-0.5">{m.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Subject */}
                    <td className="py-5 px-6 text-[14px] text-[#1b1b1b] max-w-xs truncate">
                      {m.subject || 'No Subject'}
                    </td>

                    {/* Services */}
                    <td className="py-5 px-6">
                      <span
                        className="inline-block py-1 px-3 bg-[#f3f3f3] border border-[#cfc4c5] rounded-md text-[12px] font-medium text-[#1b1b1b] whitespace-nowrap"
                        style={{ fontFamily: "'Space Grotesk', monospace" }}
                      >
                        {m.services || 'General Inquiry'}
                      </span>
                    </td>

                    {/* Date */}
                    <td
                      className="py-5 px-6 text-[14px] text-[#1b1b1b] whitespace-nowrap"
                      style={{ fontFamily: "'Space Grotesk', monospace" }}
                    >
                      {formatDate(m.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-5 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(m)}
                          title="View Message"
                          className="w-9 h-9 rounded-lg border border-[rgba(207,196,197,0.4)] flex items-center justify-center text-black hover:bg-black hover:text-white transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteModalId(m.id)}
                          title="Delete Message"
                          className="w-9 h-9 rounded-lg border border-[rgba(207,196,197,0.4)] flex items-center justify-center text-[#5f5e5e] hover:bg-[#fff1f2] hover:text-[#be123c] hover:border-[#be123c] transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#5f5e5e] text-sm">
                    No messages found.
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
            {Math.min(page * perPage, filtered.length)} of {filtered.length} inquiries
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

      {/* ── Message Details Modal (Exact 1:1) ── */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDetailModal(null)}
          />
          <div className="relative bg-white rounded-xl p-6 sm:p-8 z-10 w-[min(680px,96%)] max-h-[85vh] overflow-y-auto shadow-2xl border border-[rgba(207,196,197,0.3)]">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#e2e2e2]">
              <h3 className="text-[20px] font-semibold text-black tracking-tight">
                Message #{detailModal.id}
              </h3>
              <button
                type="button"
                onClick={() => setDetailModal(null)}
                className="text-[#5f5e5e] hover:text-black font-semibold text-xs tracking-wider uppercase"
                style={{ fontFamily: "'Space Grotesk', monospace" }}
              >
                Close ✕
              </button>
            </div>

            <div className="space-y-4 text-sm text-[#1b1b1b]">
              <div>
                <strong
                  className="text-[#5f5e5e] uppercase text-[10px] tracking-wider block"
                  style={{ fontFamily: "'Space Grotesk', monospace" }}
                >
                  Sender Name
                </strong>
                <p className="font-semibold text-base mt-0.5">{detailModal.name}</p>
              </div>

              <div>
                <strong
                  className="text-[#5f5e5e] uppercase text-[10px] tracking-wider block"
                  style={{ fontFamily: "'Space Grotesk', monospace" }}
                >
                  Email
                </strong>
                <p
                  className="text-base mt-0.5 text-[#5f5e5e]"
                  style={{ fontFamily: "'Space Grotesk', monospace" }}
                >
                  {detailModal.email}
                </p>
              </div>

              <div>
                <strong
                  className="text-[#5f5e5e] uppercase text-[10px] tracking-wider block"
                  style={{ fontFamily: "'Space Grotesk', monospace" }}
                >
                  Subject
                </strong>
                <p className="text-base mt-0.5 font-medium">{detailModal.subject || 'No Subject'}</p>
              </div>

              {detailModal.services && (
                <div>
                  <strong
                    className="text-[#5f5e5e] uppercase text-[10px] tracking-wider block"
                    style={{ fontFamily: "'Space Grotesk', monospace" }}
                  >
                    Requested Services
                  </strong>
                  <p className="text-base mt-0.5 font-medium">{detailModal.services}</p>
                </div>
              )}

              <div>
                <strong
                  className="text-[#5f5e5e] uppercase text-[10px] tracking-wider block"
                  style={{ fontFamily: "'Space Grotesk', monospace" }}
                >
                  Date Received
                </strong>
                <p
                  className="text-base mt-0.5"
                  style={{ fontFamily: "'Space Grotesk', monospace" }}
                >
                  {formatDate(detailModal.createdAt)}
                </p>
              </div>

              <div className="pt-3 border-t border-[#e2e2e2]">
                <strong
                  className="text-[#5f5e5e] uppercase text-[10px] tracking-wider block mb-2"
                  style={{ fontFamily: "'Space Grotesk', monospace" }}
                >
                  Message Content
                </strong>
                <div className="p-4 rounded-lg bg-[#f9f9f9] border border-[#cfc4c5] whitespace-pre-wrap leading-relaxed text-sm">
                  {detailModal.message}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
              Are you sure you want to permanently delete this message inquiry? This action cannot
              be undone.
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

export { MessagesClient };
