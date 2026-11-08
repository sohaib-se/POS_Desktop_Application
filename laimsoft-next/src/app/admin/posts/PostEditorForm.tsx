'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Props {
  initialData?: {
    id?: number;
    title: string;
    slug: string;
    content: string;
    category?: string | null;
    status: string;
    featuredImage?: string | null;
  };
  categories: { id: number; name: string; slug: string }[];
}

export default function PostEditorForm({ initialData, categories }: Props) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    content: initialData?.content || '',
    category: initialData?.category || (categories[0]?.name || ''),
    status: initialData?.status || 'published',
    featuredImage: initialData?.featuredImage || '',
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleTitleChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: initialData
        ? prev.slug
        : val
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, ''),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: data,
      });
      const result = await res.json();

      if (res.ok && result.status === 'success') {
        setFormData((prev) => ({ ...prev, featuredImage: result.filename }));
      } else {
        setError(result.message || 'Image upload failed.');
      }
    } catch {
      setError('An error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const url = initialData?.id ? `/api/admin/posts/${initialData.id}` : '/api/admin/posts';
      const method = initialData?.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        router.push('/admin/posts');
        router.refresh();
      } else {
        setError(data.message || 'Failed to save post.');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[#e2e2e2]">
        <Link
          href="/admin/posts"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5f5e5e] hover:text-black uppercase tracking-wider transition-colors"
          style={{ fontFamily: "'Space Grotesk', monospace" }}
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Posts
        </Link>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-black text-white hover:shadow-[0_0_15px_rgba(0,255,136,0.3)] hover:scale-[1.02] text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
          style={{ fontFamily: "'Space Grotesk', monospace" }}
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          {saving ? 'Saving...' : initialData ? 'Update Post' : 'Publish Post'}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-[#ffebee] border border-[#ef5350] text-[#c62828] text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main 2-column form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-white rounded-xl border border-[#e2e2e2] shadow-sm space-y-5">
            <div>
              <label
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#5f5e5e] mb-2"
                style={{ fontFamily: "'Space Grotesk', monospace" }}
              >
                Post Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. How AI Is Transforming Modern Web Development in 2026"
                className="w-full px-4 py-2.5 rounded-lg border border-[#cfc4c5] text-black text-sm outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#5f5e5e] mb-2"
                style={{ fontFamily: "'Space Grotesk', monospace" }}
              >
                URL Slug *
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2.5 rounded-l-lg bg-[#f3f3f3] border border-r-0 border-[#cfc4c5] text-xs text-[#5f5e5e] font-mono">
                  /blog/
                </span>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="post-slug-url"
                  className="w-full px-4 py-2.5 rounded-r-lg border border-[#cfc4c5] text-black text-sm font-mono outline-none focus:border-black transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#5f5e5e] mb-2"
                style={{ fontFamily: "'Space Grotesk', monospace" }}
              >
                Post Content (HTML / Text) *
              </label>
              <textarea
                required
                rows={16}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="<p>Write your article content here...</p>"
                className="w-full px-4 py-3 rounded-lg border border-[#cfc4c5] text-black text-sm font-mono leading-relaxed outline-none focus:border-black transition-colors resize-y"
              />
            </div>
          </div>
        </div>

        {/* Sidebar settings */}
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-xl border border-[#e2e2e2] shadow-sm space-y-5">
            <h3
              className="text-[12px] font-bold text-black uppercase tracking-wider border-b border-[#e2e2e2] pb-3"
              style={{ fontFamily: "'Space Grotesk', monospace" }}
            >
              Publishing Options
            </h3>

            <div>
              <label
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#5f5e5e] mb-2"
                style={{ fontFamily: "'Space Grotesk', monospace" }}
              >
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#cfc4c5] text-sm text-black outline-none focus:border-black bg-white"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div>
              <label
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#5f5e5e] mb-2"
                style={{ fontFamily: "'Space Grotesk', monospace" }}
              >
                Category
              </label>
              <select
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#cfc4c5] text-sm text-black outline-none focus:border-black bg-white"
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#5f5e5e] mb-2"
                style={{ fontFamily: "'Space Grotesk', monospace" }}
              >
                Featured Image
              </label>

              {formData.featuredImage && (
                <div className="mb-3 relative rounded-lg overflow-hidden border border-[#cfc4c5] aspect-video bg-[#111]">
                  <img
                    src={
                      formData.featuredImage.startsWith('http') ||
                      formData.featuredImage.startsWith('/')
                        ? formData.featuredImage
                        : `/images/${formData.featuredImage}`
                    }
                    alt=""
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, featuredImage: '' })}
                    className="absolute top-2 right-2 p-1 rounded bg-black/75 text-white hover:bg-black"
                    title="Remove image"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="block w-full text-xs text-[#5f5e5e] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border file:border-[#cfc4c5] file:text-xs file:font-semibold file:bg-[#f3f3f3] file:text-black hover:file:bg-[#e8e8e8] file:cursor-pointer cursor-pointer"
              />
              {uploading && (
                <p className="text-xs text-[#5f5e5e] mt-1 font-mono">Uploading image...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
