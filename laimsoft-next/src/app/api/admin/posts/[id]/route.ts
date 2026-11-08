import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDb, schema } from '@/db';
import { getSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: Props) {
  const session = await getSession();
  if (!session) return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const postId = parseInt(id, 10);

  try {
    const db = await getDb();
    const rows = await db.select().from(schema.posts).where(eq(schema.posts.id, postId)).limit(1);
    if (rows.length === 0) return NextResponse.json({ status: 'error', message: 'Not found' }, { status: 404 });
    return NextResponse.json({ status: 'success', data: rows[0] });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Props) {
  const session = await getSession();
  if (!session) return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const postId = parseInt(id, 10);

  try {
    const body = await request.json();
    const { title, slug, content, category, status, featuredImage } = body;

    const db = await getDb();
    await db
      .update(schema.posts)
      .set({
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        content: content.trim(),
        category: category ? category.trim() : null,
        status: status || 'published',
        featuredImage: featuredImage || null,
      })
      .where(eq(schema.posts.id, postId))
      .run();

    try {
      revalidatePath('/blog');
      revalidatePath('/');
    } catch {}

    return NextResponse.json({ status: 'success', message: 'Post updated successfully!' });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Props) {
  const session = await getSession();
  if (!session) return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const postId = parseInt(id, 10);

  try {
    const db = await getDb();
    await db.delete(schema.posts).where(eq(schema.posts.id, postId)).run();

    try {
      revalidatePath('/blog');
      revalidatePath('/');
    } catch {}

    return NextResponse.json({ status: 'success', message: 'Post deleted successfully!' });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
