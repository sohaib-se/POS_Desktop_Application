'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';

export default function DeletePostButton({ postId }: { postId: number }) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to permanently delete this article?')) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/posts/${postId}`, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
      } else {
        alert('Failed to delete article.');
      }
    } catch {
      alert('An error occurred.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition-colors disabled:opacity-50"
      title="Delete Article"
    >
      {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
    </button>
  );
}
