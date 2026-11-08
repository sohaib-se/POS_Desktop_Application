'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Consultation {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  isRead?: boolean | number | null;
  createdAt: string;
}

export default function ConsultationsClient({ consultations }: { consultations: Consultation[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [detailModal, setDetailModal] = useState<Consultation | null>(null);
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

  // Stats calculation
  const totalAll = consultations.length;
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const monthCount = consultations.filter((c) => {
    const d = new Date(c.createdAt || Date.now());
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;
  const unreadCount = consultations.filter((c) => !c.isRead).length;

  // Filtered list
  const filtered = consultations.filter((c) => {
    const query = search.toLowerCase();
    const matchesSearch =
      c.name?.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query) ||
      c.phone?.toLowerCase().includes(query) ||
      c.message?.toLowerCase().includes(query);

    if (!matchesSearch) return false;
    if (statusFilter === 'unread') return !c.isRead;
    if (statusFilter === 'read') return !!c.isRead;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleOpenDetail = async (c: Consultation) => {
    setDetailModal(c);
    if (!c.isRead) {
      try {
        await fetch('/api/admin/consultations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'mark_read', id: c.id }),
        });
        c.isRead = 1;
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
      await fetch('/api/admin/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id: deleteModalId }),
      });
      setDeleteModalId(null);
      router.refresh();
    } catch {
      alert('Failed to delete consultation.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* ── Stats Bar (Exact 1:1 PHP consultations.php) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[rgba(207,196,197,0.3)] shadow-sm">
          <p
            className="text-[10px] font-semibold tracking-wider uppercase text-[#5f5e5e] mb-2"
            style={{ fontFamily: "'Space Grotesk', monospace" }}
          >
            Total Requests
          </p>
          <p className="text-[32px] font-semibold text-black tracking-tight">{totalAll}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[rgba(207,196,197,0.3)] shadow-sm">
          <p
            className="text-[10px] font-semibold tracking-wider uppercase text-[#5f5e5e] mb-2"
            style={{ fontFamily: "'Space Grotesk', monospace" }}
          >
            This Month
          </p>
          <div className="flex items-center gap-2">
            <p className="text-[32px] font-semibold text-black tracking-tight">{monthCount}</p>
            <span className="w-2.5 h-2.5 rounded-full bg-[#00ff88]" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[rgba(207,196,197,0.3)] shadow-sm">
          <p
            className="text-[10px] font-semibold tracking-wider uppercase text-[#5f5e5e] mb-2"
            style={{ fontFamily: "'Space Grotesk', monospace" }}
          >
            Unread / Pending
          </p>
          <div className="flex items-center gap-2">
            <p className="text-[32px] font-semibold text-[#000] tracking-tight">{unreadCount}</p>
            {unreadCount > 0 && (
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#fff1f2] text-[#be123c]"
                style={{ fontFamily: "'Space Grotesk', monospace" }}
              >
                Action Needed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[rgba(207,196,197,0.3)] shadow-sm">
        <div className="relative flex-1 max-w-md flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-[20px] text-[#5f5e5e]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by client name, email, service..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-[#f3f3f3] rounded-lg border-none text-sm text-[#1b1b1b] outline-none placeholder-[#5f5e5e] focus:ring-1 focus:ring-black"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'unread', 'read'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === s
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-[#f3f3f3] text-[#5f5e5e] hover:bg-[#e8e8e8] hover:text-black'
              }`}
              style={{ fontFamily: "'Space Grotesk', monospace" }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Consultations Table (Exact 1:1 PHP consultations.php) ── */}
      <div className="bg-white rounded-xl border border-[rgba(207,196,197,0.3)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#eeeeee]">
              <tr>
                {['Client', 'Email', 'Service / Phone', 'Date', 'Status', 'Action'].map((h) => (
                  <th
                    key={h}
                    className="py-3.5 px-6 text-[10px] font-semibold tracking-wider uppercase text-[#5f5e5e] whitespace-nowrap"
                    style={{ fontFamily: "'Space Grotesk', monospace" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(207,196,197,0.2)]">
              {paginated.length > 0 ? (
                paginated.map((c) => (
                  <tr key={c.id} className="hover:bg-[#f9f9f9] transition-colors">
                    {/* Client */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#eeeeee] flex items-center justify-center font-bold text-xs text-black shrink-0">
                          {getInitials(c.name)}
                        </div>
                        <span className="font-semibold text-black text-[14px]">{c.name}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td
                      className="py-4 px-6 text-[14px] text-[#5f5e5e]"
                      style={{ fontFamily: "'Space Grotesk', monospace" }}
                    >
                      {c.email}
                    </td>

                    {/* Service/Phone */}
                    <td className="py-4 px-6 text-[14px] text-[#1b1b1b]">
                      {c.phone || 'Custom Consultation'}
                    </td>

                    {/* Date */}
                    <td
                      className="py-4 px-6 text-[14px] text-[#5f5e5e] whitespace-nowrap"
                      style={{ fontFamily: "'Space Grotesk', monospace" }}
                    >
                      {formatDate(c.createdAt)}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      {!c.isRead ? (
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[rgba(0,255,136,0.15)] text-[#00a859] border border-[rgba(0,255,136,0.3)]"
                          style={{ fontFamily: "'Space Grotesk', monospace" }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" />
                          New
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#eeeeee] text-[#5f5e5e]"
                          style={{ fontFamily: "'Space Grotesk', monospace" }}
                        >
                          Read
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(c)}
                          title="View Details"
                          className="p-1.5 rounded text-black hover:bg-black hover:text-white transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteModalId(c.id)}
                          title="Delete Request"
                          className="p-1.5 rounded text-[#5f5e5e] hover:bg-[#fff1f2] hover:text-[#be123c] transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#5f5e5e] text-sm">
                    No consultation requests found.
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
            {Math.min(page * perPage, filtered.length)} of {filtered.length} requests
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-[rgba(207,196,197,0.4)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#e8e8e8] text-black font-semibold uppercase tracking-wider text-[11px]"
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
              className="px-3 py-1.5 rounded-lg bg-black text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-800 font-semibold uppercase tracking-wider text-[11px]"
              style={{ fontFamily: "'Space Grotesk', monospace" }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ── Detail View Modal (Exact 1:1) ── */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDetailModal(null)}
          />
          <div className="relative bg-white rounded-xl p-6 sm:p-8 z-10 w-[min(680px,96%)] max-h-[85vh] overflow-y-auto shadow-2xl border border-[rgba(207,196,197,0.3)]">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#e2e2e2]">
              <h3 className="text-[20px] font-semibold text-black tracking-tight">
                Consultation Request #{detailModal.id}
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
                  Client Name
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

              {detailModal.phone && (
                <div>
                  <strong
                    className="text-[#5f5e5e] uppercase text-[10px] tracking-wider block"
                    style={{ fontFamily: "'Space Grotesk', monospace" }}
                  >
                    Requested Service / Contact Phone
                  </strong>
                  <p className="text-base mt-0.5">{detailModal.phone}</p>
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
                  Project Details / Message
                </strong>
                <div className="p-4 rounded-lg bg-[#f9f9f9] border border-[#cfc4c5] whitespace-pre-wrap leading-relaxed text-sm">
                  {detailModal.message || 'No additional message provided.'}
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
              Are you sure you want to permanently delete this consultation request? This action
              cannot be undone.
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

export { ConsultationsClient };
