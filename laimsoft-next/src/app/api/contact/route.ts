import { NextResponse } from 'next/server';
import { getDb, schema } from '@/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, services, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { status: 'error', message: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { status: 'error', message: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const servicesStr = Array.isArray(services) ? services.join(', ') : (services || '');

    const db = await getDb();
    await db.insert(schema.contacts).values({
      name: name.trim(),
      email: email.trim(),
      subject: subject ? subject.trim() : null,
      services: servicesStr,
      message: message.trim(),
      isRead: 0,
    }).run();

    return NextResponse.json({
      status: 'success',
      message: 'Message sent successfully! We will get back to you soon.',
    });
  } catch (error: any) {
    console.error('Error saving contact inquiry:', error);
    return NextResponse.json(
      { status: 'error', message: error?.message || 'Failed to process inquiry. Please try again.', details: String(error?.stack || error) },
      { status: 500 }
    );
  }
}
