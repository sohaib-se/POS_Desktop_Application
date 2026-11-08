import { NextResponse } from 'next/server';
import { getDb, schema } from '@/db';
import { getSession } from '@/lib/auth';
import { desc } from 'drizzle-orm';

export async function GET() {
  const session = await getSession();
  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  try {
    const db = await getDb();
    const rows = await db
      .select()
      .from(schema.newsletterSubscribers)
      .orderBy(desc(schema.newsletterSubscribers.createdAt))
      .all();

    // UTF-8 BOM + CSV format
    let csv = '\uFEFFEmail,Subscribed At\r\n';
    for (const row of rows) {
      csv += `"${row.email}","${row.createdAt || ''}"\r\n`;
    }

    const filename = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    return new NextResponse('Export failed', { status: 500 });
  }
}
