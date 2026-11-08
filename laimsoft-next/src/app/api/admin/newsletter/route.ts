import { NextResponse } from 'next/server';
import { getDb, schema } from '@/db';
import { getSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });

  try {
    const { action, id } = await request.json();
    const db = await getDb();

    if (action === 'delete') {
      await db.delete(schema.newsletterSubscribers).where(eq(schema.newsletterSubscribers.id, id)).run();
      return NextResponse.json({ status: 'success' });
    }

    return NextResponse.json({ status: 'error', message: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
