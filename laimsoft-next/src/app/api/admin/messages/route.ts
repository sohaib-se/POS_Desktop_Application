import { NextResponse } from 'next/server';
import { getDb, schema } from '@/db';
import { getSession } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });

  try {
    const db = await getDb();
    const messages = await db.select().from(schema.contacts).orderBy(desc(schema.contacts.createdAt)).all();
    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });

  try {
    const { action, id } = await request.json();
    const db = await getDb();

    if (action === 'delete') {
      await db.delete(schema.contacts).where(eq(schema.contacts.id, id)).run();
      return NextResponse.json({ status: 'success' });
    }

    if (action === 'mark_read') {
      await db.update(schema.contacts).set({ isRead: 1 }).where(eq(schema.contacts.id, id)).run();
      return NextResponse.json({ status: 'success' });
    }

    return NextResponse.json({ status: 'error', message: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
