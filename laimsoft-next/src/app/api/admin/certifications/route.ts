import { NextResponse } from 'next/server';
import { getDb, schema } from '@/db';
import { getSession } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

// Helper to generate 8-character unique alphanumeric code
function generateKey(length = 8): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let key = '';
  for (let i = 0; i < length; i++) {
    key += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return key;
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { action } = body;
    const db = await getDb();

    if (action === 'create_course') {
      const { title, description } = body;
      if (!title) return NextResponse.json({ status: 'error', message: 'Course title is required' }, { status: 400 });

      await db.insert(schema.courses).values({
        title: title.trim(),
        description: description ? description.trim() : null,
      }).run();

      return NextResponse.json({ status: 'success', message: 'Course created successfully!' });
    }

    if (action === 'delete_course') {
      const { courseId } = body;
      await db.delete(schema.certificates).where(eq(schema.certificates.courseId, courseId)).run();
      await db.delete(schema.courses).where(eq(schema.courses.id, courseId)).run();
      return NextResponse.json({ status: 'success', message: 'Course deleted successfully!' });
    }

    if (action === 'issue_certificate') {
      const { recipientName, recipientEmail, certificateTitle, courseId, courseName, issueDate, expiryDate, description } = body;

      if (!recipientName || !recipientEmail || !certificateTitle || !issueDate) {
        return NextResponse.json({ status: 'error', message: 'Required fields missing' }, { status: 400 });
      }

      // Generate unique key
      let uniqueId = generateKey(8);
      // Ensure unique
      let attempts = 0;
      while (attempts < 10) {
        const existing = await db.select().from(schema.certificates).where(eq(schema.certificates.uniqueId, uniqueId)).limit(1);
        if (existing.length === 0) break;
        uniqueId = generateKey(8);
        attempts++;
      }

      await db.insert(schema.certificates).values({
        uniqueId,
        recipientName: recipientName.trim(),
        recipientEmail: recipientEmail.trim().toLowerCase(),
        certificateTitle: certificateTitle.trim(),
        courseId: courseId ? parseInt(courseId, 10) : null,
        courseName: courseName ? courseName.trim() : null,
        issueDate: issueDate.trim(),
        expiryDate: expiryDate ? expiryDate.trim() : null,
        description: description ? description.trim() : null,
        issuedBy: 'Laimsoft',
      }).run();

      return NextResponse.json({ status: 'success', uniqueId, message: 'Certificate issued successfully!' });
    }

    if (action === 'delete_certificate') {
      const { id } = body;
      await db.delete(schema.certificates).where(eq(schema.certificates.id, id)).run();
      return NextResponse.json({ status: 'success', message: 'Certificate deleted successfully!' });
    }

    return NextResponse.json({ status: 'error', message: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
