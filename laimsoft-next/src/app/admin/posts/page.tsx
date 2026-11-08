import { Suspense } from 'react';
import Link from 'next/link';
import { getDb, schema } from '@/db';
import { desc } from 'drizzle-orm';
import ManagePostsClient from './ManagePostsClient';
import AdminCircularLoader from '../AdminCircularLoader';

export const dynamic = 'force-dynamic';

export default function ManagePostsPage() {
  return (
    <div className="space-y-8">
      {/* ── Instant Header & Add Button (0ms) ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[36px] sm:text-[40px] font-semibold text-black tracking-[-0.03em] leading-tight">
            Blog Management
          </h1>
          <p className="text-[16px] text-[#5f5e5e] mt-1">
            Manage your technical insights and industry updates.
          </p>
        </div>

        <Link
          href="/admin/posts/create"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-black text-white hover:shadow-[0_0_15px_rgba(0,255,136,0.3)] hover:scale-[1.02] active:scale-95 transition-all text-[12px] font-semibold tracking-wider uppercase"
          style={{ fontFamily: "'Space Grotesk', monospace" }}
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add New Post
        </Link>
      </div>

      {/* ── Live Database Posts with Circular Spinner ── */}
      <Suspense
        fallback={
          <AdminCircularLoader
            message="Fetching published and draft posts..."
            subtext="Loading articles and metadata from database"
            minHeight="min-h-[380px]"
          />
        }
      >
        <PostsDataLoader />
      </Suspense>
    </div>
  );
}

async function PostsDataLoader() {
  let posts: any[] = [];
  try {
    const db = await getDb();
    posts = await db.select().from(schema.posts).orderBy(desc(schema.posts.createdAt)).all();
  } catch (err) {
    console.error('Error fetching posts:', err);
  }

  return <ManagePostsClient posts={posts} />;
}
