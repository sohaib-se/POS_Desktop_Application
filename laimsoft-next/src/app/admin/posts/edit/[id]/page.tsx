import { notFound } from 'next/navigation';
import { getDb, schema } from '@/db';
import { eq } from 'drizzle-orm';
import PostEditorForm from '../../PostEditorForm';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const postId = parseInt(id, 10);

  let post: any = null;
  let categories: any[] = [];

  try {
    const db = await getDb();
    categories = await db.select().from(schema.categories).all();
    const rows = await db.select().from(schema.posts).where(eq(schema.posts.id, postId)).limit(1);
    if (rows.length > 0) post = rows[0];
  } catch (err) {
    console.error('Error fetching post for edit:', err);
  }

  if (!post) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[32px] font-semibold text-black tracking-[-0.02em]">Edit Post</h1>
        <p className="text-sm text-[#5f5e5e] mt-1">Update article content, featured media, or slug.</p>
      </div>

      <PostEditorForm initialData={post} categories={categories} />
    </div>
  );
}
