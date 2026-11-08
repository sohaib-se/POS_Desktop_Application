import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDb, schema } from '@/db';
import { getSession } from '@/lib/auth';
import { desc } from 'drizzle-orm';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });

  try {
    const db = await getDb();
    const posts = await db.select().from(schema.posts).orderBy(desc(schema.posts.createdAt)).all();
    return NextResponse.json({ status: 'success', data: posts });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { title, slug, content, category, status, featuredImage } = body;

    if (!title || !slug || !content) {
      return NextResponse.json({ status: 'error', message: 'Title, slug, and content are required.' }, { status: 400 });
    }

    const db = await getDb();
    await db.insert(schema.posts).values({
      title: title.trim(),
      slug: slug.trim().toLowerCase(),
      content: content.trim(),
      category: category ? category.trim() : null,
      status: status || 'published',
      featuredImage: featuredImage || null,
    }).run();

    try {
      revalidatePath('/blog');
      revalidatePath('/');
    } catch {}

    return NextResponse.json({ status: 'success', message: 'Post created successfully!' });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
