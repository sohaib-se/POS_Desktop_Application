'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Category {
  id: number;
  name: string;
  slug?: string | null;
  postCount?: number;
  createdAt?: string;
}

export default function CategoriesClient({ categories }: { categories: Category[] }) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', name: name.trim(), slug: slug.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setMessage('Category created successfully.');
        setName('');
        setSlug('');
        router.refresh();
      } else {
        setError(data.message || 'That category already exists or could not be created.');
      }
    } catch {
      setError('An unexpected error occurred while creating category.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this category? Posts using it will be cleared.')) return;
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage('Category deleted successfully.');
        router.refresh();
      } else {
        setError(data.message || 'Could not delete category.');
      }
    } catch {
      setError('Failed to delete category.');
    }
  };

  return (
    <div className="space-y-8">

      {/* Alerts */}
      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 text-sm font-medium">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* ── 2-Column Grid (Exact 1:1 PHP categories.php) ── */}
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Left: Add Category Card */}
        <section className="bg-white border border-[#e2e2e2] rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] h-fit">
          <h2 className="text-[20px] font-semibold text-black mb-4">Add Category</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#5f5e5e] mb-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Category Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="AI & ML"
                className="w-full border border-[#cfc4c5] rounded-xl px-3.5 py-2.5 text-sm text-black outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="slug"
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#5f5e5e] mb-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Slug
              </label>
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="ai-ml"
                className="w-full border border-[#cfc4c5] rounded-xl px-3.5 py-2.5 text-sm text-black font-mono outline-none focus:border-black transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-black text-white rounded-xl text-[11px] font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-all cursor-pointer disabled:opacity-60"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              {loading ? 'Creating...' : 'Create Category'}
            </button>
          </form>
        </section>

        {/* Right: Existing Categories Card */}
        <section className="bg-white border border-[#e2e2e2] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="border-b border-[#e2e2e2] px-6 py-4">
            <h2 className="text-[20px] font-semibold text-black">Existing Categories</h2>
          </div>

          <div className="divide-y divide-[#e2e2e2]">
            {categories.length > 0 ? (
              categories.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-4 px-6 py-4 flex-wrap hover:bg-[#f9f9f9] transition-colors"
                >
                  <div>
                    <div className="font-semibold text-black text-[15px]">{c.name}</div>
                    <div
                      className="text-xs text-[#5f5e5e] mt-0.5"
                      style={{ fontFamily: "'Space Grotesk', monospace" }}
                    >
                      {c.slug || c.name.toLowerCase()} · {c.postCount || 0} posts
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-[#cfc4c5] bg-white text-[#1b1b1b] hover:bg-[#fff1f2] hover:text-[#be123c] hover:border-[#be123c] text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <div className="px-6 py-10 text-center text-[#5f5e5e] text-sm">
                No categories yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export { CategoriesClient };
