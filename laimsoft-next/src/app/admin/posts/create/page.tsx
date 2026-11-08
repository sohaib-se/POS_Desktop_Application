import { getDb, schema } from '@/db';
import PostEditorForm from '../PostEditorForm';

export const dynamic = 'force-dynamic';

export default async function CreatePostPage() {
  let categories: any[] = [];
  try {
    const db = await getDb();
    categories = await db.select().from(schema.categories).all();
  } catch (err) {
    console.error('Error fetching categories:', err);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[32px] font-semibold text-black tracking-[-0.02em]">Create New Post</h1>
        <p className="text-sm text-[#5f5e5e] mt-1">Write a new article for your engineering blog.</p>
      </div>

      <PostEditorForm categories={categories} />
    </div>
  );
}
