import { NextResponse } from 'next/server';
import { getDb, schema } from '@/db';
import { getSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });

  try {
    const { action, name, slug, id } = await request.json();
    const db = await getDb();

    if (action === 'create') {
      if (!name) return NextResponse.json({ status: 'error', message: 'Category name is required' }, { status: 400 });
      const cleanSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      await db.insert(schema.categories).values({
        name: name.trim(),
        slug: cleanSlug,
      }).run();

      return NextResponse.json({ status: 'success', message: 'Category created!' });
    }

    if (action === 'delete') {
      await db.delete(schema.categories).where(eq(schema.categories.id, id)).run();
      return NextResponse.json({ status: 'success', message: 'Category deleted!' });
    }

    return NextResponse.json({ status: 'error', message: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
