import { NextResponse } from 'next/server';
import { getDb, schema } from '@/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, service, message } = body;

    if (!name || !email) {
      return NextResponse.json(
        { status: 'error', message: 'Name and email are required.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { status: 'error', message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const db = await getDb();
    await db.insert(schema.consultations).values({
      name: name.trim(),
      email: email.trim(),
      phone: (service || phone) ? String(service || phone).trim() : null,
      message: message ? message.trim() : null,
      isRead: 0,
    }).run();

    return NextResponse.json({
      status: 'success',
      message: 'Consultation request received successfully!',
    });
  } catch (error: any) {
    console.error('Error saving consultation:', error);
    return NextResponse.json(
      { status: 'error', message: 'Database error. Please try again later.' },
      { status: 500 }
    );
  }
}
