'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  category?: string | null;
  status: string;
  featuredImage?: string | null;
  author?: string | null;
  createdAt: string;
}

const GRADIENTS = [
  'linear-gradient(135deg, #0a0a0a 0%, #0d2b1a 100%)',
  'linear-gradient(135deg, #111 0%, #1a1a2e 100%)',
  'linear-gradient(135deg, #0f0f0f 0%, #1a0a0a 100%)',
  'linear-gradient(135deg, #0a0a0a 0%, #151515 100%)',
  'linear-gradient(135deg, #101018 0%, #0d1a0d 100%)',
];

const DOT_COLORS = ['#00ff88', '#4488ff', '#ff6644', '#ffffff', '#00ffcc'];

export default function ManagePostsClient({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [deleteModalId, setDeleteModalId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 5; // 5 posts + 1 ghost card = 6 slots

  const totalPosts = posts.length;
  const publishedCount = posts.filter((p) => !p.status || p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;

  const totalPages = Math.max(1, Math.ceil(totalPosts / perPage));
  const paginated = posts.slice((page - 1) * perPage, page * perPage);

  const getInitials = (name?: string | null) => {
    if (!name) return 'AD';
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

  const getImageUrl = (img?: string | null) => {
    if (!img) return null;
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    if (img.startsWith('/')) return img;
    return `/images/${img}`;
  };

  const confirmDelete = async () => {
    if (!deleteModalId) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/admin/posts/${deleteModalId}`, { method: 'DELETE' });
      setDeleteModalId(null);
      setOpenMenuId(null);
      router.refresh();
    } catch {
      alert('Failed to delete post.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8" onClick={() => setOpenMenuId(null)}>
      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Posts */}
        <div className="bg-white p-6 rounded-xl border border-[rgba(207,196,197,0.20)] shadow-sm">
          <p
            className="text-[10px] font-semibold tracking-wider uppercase text-[#5f5e5e] mb-2"
            style={{ fontFamily: "'Space Grotesk', monospace" }}
          >
            Total Posts
          </p>
          <p className="text-[32px] font-semibold text-black tracking-tight">{totalPosts}</p>
        </div>

        {/* Published */}
        <div className="bg-white p-6 rounded-xl border border-[rgba(207,196,197,0.20)] shadow-sm">
          <p
            className="text-[10px] font-semibold tracking-wider uppercase text-[#5f5e5e] mb-2"
            style={{ fontFamily: "'Space Grotesk', monospace" }}
          >
            Published
          </p>
          <div className="flex items-center gap-2">
            <p className="text-[32px] font-semibold text-black tracking-tight">{publishedCount}</p>
            <span className="w-2.5 h-2.5 rounded-full bg-[#00ff88]" />
          </div>
        </div>

        {/* Drafts */}
        <div className="bg-white p-6 rounded-xl border border-[rgba(207,196,197,0.20)] shadow-sm">
          <p
            className="text-[10px] font-semibold tracking-wider uppercase text-[#5f5e5e] mb-2"
            style={{ fontFamily: "'Space Grotesk', monospace" }}
          >
            Drafts
          </p>
          <p className="text-[32px] font-semibold text-[#5f5e5e] tracking-tight">{draftCount}</p>
        </div>
      </div>

      {/* ── Blog Card Grid (Exact 1:1 PHP manage_posts.php) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginated.map((post, i) => {
          const grad = GRADIENTS[i % GRADIENTS.length];
          const dot = DOT_COLORS[i % DOT_COLORS.length];
          const isDraft = post.status === 'draft';
          const authorName = post.author || 'Admin';
          const authorInitials = getInitials(authorName);
          const imgUrl = getImageUrl(post.featuredImage);

          return (
            <div
              key={post.id}
              className="bg-white rounded-xl border border-[rgba(207,196,197,0.25)] shadow-sm overflow-hidden group hover:border-[#00ff88] transition-all flex flex-col"
            >
              {/* Featured Image or Gradient Placeholder */}
              <div className="relative overflow-hidden aspect-video bg-[#111]">
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={post.title}
                    loading={i < 2 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <>
                    <div className="w-full h-full" style={{ background: grad }} />
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `radial-gradient(${dot} 0.5px, transparent 0.5px)`,
                        backgroundSize: '18px 18px',
                        opacity: 0.15,
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <span className="material-symbols-outlined text-white text-[48px]">
                        article
                      </span>
                    </div>
                  </>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  {isDraft ? (
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#e8e8e8] text-[#5f5e5e] border border-[rgba(207,196,197,0.3)]"
                      style={{ fontFamily: "'Space Grotesk', monospace" }}
                    >
                      Draft
                    </span>
                  ) : (
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#00ff88] text-black"
                      style={{ fontFamily: "'Space Grotesk', monospace" }}
                    >
                      Published
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex flex-col grow justify-between">
                <div>
                  {/* Meta Line */}
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-[10px] font-semibold tracking-wider uppercase text-[#5f5e5e]"
                      style={{ fontFamily: "'Space Grotesk', monospace" }}
                    >
                      {post.category || 'General'}
                    </span>
                    <span className="text-[#cfc4c5] text-[10px]">•</span>
                    <span
                      className="text-[10px] font-semibold tracking-wider uppercase text-[#5f5e5e]"
                      style={{ fontFamily: "'Space Grotesk', monospace" }}
                    >
                      {formatDate(post.createdAt)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-[18px] font-semibold text-black tracking-tight leading-snug line-clamp-2 mb-4">
                    {post.title}
                  </h3>
                </div>

                {/* Author + Actions Dropdown */}
                <div className="flex items-center justify-between pt-4 border-t border-[rgba(207,196,197,0.15)] mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#e2e2e2] flex items-center justify-center text-[10px] font-bold text-black shrink-0">
                      {authorInitials}
                    </div>
                    <span className="text-[13px] font-semibold text-[#5f5e5e] truncate max-w-[120px]">
                      {authorName}
                    </span>
                  </div>

                  {/* 3-dots Menu */}
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setOpenMenuId(openMenuId === post.id ? null : post.id)}
                      className="p-1 rounded text-black hover:text-[#5f5e5e] transition-colors cursor-pointer"
                      title="More options"
                    >
                      <span className="material-symbols-outlined text-[20px] block">more_vert</span>
                    </button>

                    {openMenuId === post.id && (
                      <div className="absolute right-0 bottom-full mb-1 w-40 bg-white border border-[rgba(207,196,197,0.3)] rounded-lg shadow-xl p-1 z-30 text-xs">
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="flex items-center gap-2 px-3 py-2 rounded text-[#1b1b1b] hover:bg-[#f3f3f3] font-medium"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                          <span>View Post</span>
                        </Link>
                        <Link
                          href={`/admin/posts/edit/${post.id}`}
                          className="flex items-center gap-2 px-3 py-2 rounded text-[#1b1b1b] hover:bg-[#f3f3f3] font-medium"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                          <span>Edit</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteModalId(post.id)}
                          className="flex items-center gap-2 px-3 py-2 rounded text-[#be123c] hover:bg-[#fff1f2] font-medium w-full text-left cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* 6th Slot Ghost "Create New Post" Card (Exact 1:1 PHP manage_posts.php) */}
        <Link
          href="/admin/posts/create"
          className="border-2 border-dashed border-[rgba(207,196,197,0.4)] rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3 hover:border-black hover:bg-[#f3f3f3] transition-all min-h-[300px] group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-[#eeeeee] flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[#5f5e5e] text-[24px]">post_add</span>
          </div>
          <p
            className="text-[12px] font-semibold tracking-wider uppercase text-[#5f5e5e] group-hover:text-black"
            style={{ fontFamily: "'Space Grotesk', monospace" }}
          >
            Create New Post
          </p>
        </Link>
      </div>

      {/* ── Pagination Bar (Exact 1:1 PHP manage_posts.php) ── */}
      <div className="flex items-center justify-between border-t border-[rgba(207,196,197,0.2)] pt-6 text-xs text-[#5f5e5e]">
        <span style={{ fontFamily: "'Space Grotesk', monospace" }}>
          Page {page} of {totalPages}
        </span>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex items-center gap-1 px-4 py-2 border border-[rgba(207,196,197,0.3)] rounded-lg text-[#5f5e5e] hover:text-black hover:border-black transition-all disabled:opacity-30 disabled:cursor-not-allowed font-semibold uppercase tracking-wider text-[11px]"
            style={{ fontFamily: "'Space Grotesk', monospace" }}
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            Previous
          </button>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="flex items-center gap-1 px-4 py-2 bg-black text-white rounded-lg hover:shadow-[0_0_15px_rgba(0,255,136,0.3)] transition-all disabled:opacity-30 disabled:cursor-not-allowed font-semibold uppercase tracking-wider text-[11px]"
            style={{ fontFamily: "'Space Grotesk', monospace" }}
          >
            Next
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
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
              Are you sure you want to permanently delete this blog post? This action cannot be
              undone.
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
