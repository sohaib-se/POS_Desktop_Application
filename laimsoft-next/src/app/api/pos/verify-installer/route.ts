import { NextResponse } from 'next/server';
import { getDb, schema } from '@/db';
import { eq } from 'drizzle-orm';

// Allow CORS preflight and access from installer or web
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  return NextResponse.json(
    { service: 'Laimsoft POS Verification Service', status: 'online' },
    { headers: corsHeaders }
  );
}

export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON request body.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const { username, password } = body;
    const cleanUsername = username?.trim();
    const cleanPassword = password?.trim();

    if (!cleanUsername || !cleanPassword) {
      return NextResponse.json(
        { success: false, message: 'Both username and password are required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const db = await getDb();
    const credential = await db
      .select()
      .from(schema.posCredentials)
      .where(eq(schema.posCredentials.username, cleanUsername))
      .get();

    // 1. Check if user exists
    if (!credential) {
      return NextResponse.json(
        { success: false, message: 'Invalid username or password.' },
        { status: 401, headers: corsHeaders }
      );
    }

    // 2. Check password match
    if (credential.password !== cleanPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid username or password.' },
        { status: 401, headers: corsHeaders }
      );
    }

    // 3. Check status
    if (credential.status !== 'active') {
      return NextResponse.json(
        {
          success: false,
          message: 'This account is currently inactive. Please contact your Laimsoft administrator to activate it.',
        },
        { status: 403, headers: corsHeaders }
      );
    }

    // 4. Automatically change the status to 'inactive' once verified for installation
    await db
      .update(schema.posCredentials)
      .set({
        status: 'inactive',
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.posCredentials.id, credential.id))
      .run();

    // 5. Success: Approved
    return NextResponse.json(
      {
        success: true,
        message: 'Credentials verified successfully. Installation approved.',
        client: credential.clientName || credential.username,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Internal server verification error: ' + error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
