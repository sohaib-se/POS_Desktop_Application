import { NextResponse } from 'next/server';
import { getDb, schema } from '@/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { status: 'error', message: 'Email address is required.' },
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

    const db = await getDb();
    try {
      await db.insert(schema.newsletterSubscribers).values({
        email: email.trim().toLowerCase(),
      }).run();
    } catch (dbErr: any) {
      // Ignore unique constraint violation (already subscribed)
      if (!String(dbErr).includes('UNIQUE')) {
        throw dbErr;
      }
    }

    return NextResponse.json({
      status: 'success',
      message: 'Subscribed successfully! Thank you for joining.',
    });
  } catch (error: any) {
    console.error('Error subscribing:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}
