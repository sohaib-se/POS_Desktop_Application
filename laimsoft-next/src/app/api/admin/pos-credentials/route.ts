import { NextResponse } from 'next/server';
import { getDb, schema } from '@/db';
import { getSession } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDb();
    const credentials = await db
      .select()
      .from(schema.posCredentials)
      .orderBy(desc(schema.posCredentials.createdAt))
      .all();

    return NextResponse.json({ status: 'success', data: credentials });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { action, id, username, password, clientName, status } = await request.json();
    const db = await getDb();

    // ── CREATE CREDENTIAL ───────────────────────────────
    if (action === 'create') {
      const cleanUsername = username?.trim();
      const cleanPassword = password?.trim();
      const cleanClientName = clientName?.trim() || null;
      const initialStatus = status === 'inactive' ? 'inactive' : 'active';

      if (!cleanUsername) {
        return NextResponse.json({ status: 'error', message: 'Username is required' }, { status: 400 });
      }
      if (!cleanPassword) {
        return NextResponse.json({ status: 'error', message: 'Password is required' }, { status: 400 });
      }

      // Check if username already exists
      const existing = await db
        .select()
        .from(schema.posCredentials)
        .where(eq(schema.posCredentials.username, cleanUsername))
        .get();

      if (existing) {
        return NextResponse.json(
          { status: 'error', message: 'A credential with this username already exists.' },
          { status: 409 }
        );
      }

      await db.insert(schema.posCredentials).values({
        username: cleanUsername,
        password: cleanPassword,
        clientName: cleanClientName,
        status: initialStatus,
      }).run();

      return NextResponse.json({ status: 'success', message: 'POS credential created successfully!' });
    }

    // ── TOGGLE STATUS (ACTIVE <-> INACTIVE) ─────────────
    if (action === 'toggle-status') {
      if (!id) {
        return NextResponse.json({ status: 'error', message: 'Credential ID is required' }, { status: 400 });
      }

      const current = await db
        .select()
        .from(schema.posCredentials)
        .where(eq(schema.posCredentials.id, id))
        .get();

      if (!current) {
        return NextResponse.json({ status: 'error', message: 'Credential not found' }, { status: 404 });
      }

      const nextStatus = current.status === 'active' ? 'inactive' : 'active';

      await db
        .update(schema.posCredentials)
        .set({
          status: nextStatus,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.posCredentials.id, id))
        .run();

      return NextResponse.json({
        status: 'success',
        message: `Status changed to ${nextStatus}`,
        newStatus: nextStatus,
      });
    }

    // ── UPDATE CREDENTIAL ───────────────────────────────
    if (action === 'update') {
      if (!id) {
        return NextResponse.json({ status: 'error', message: 'Credential ID is required' }, { status: 400 });
      }

      const updateData: any = {
        updatedAt: new Date().toISOString(),
      };

      if (clientName !== undefined) updateData.clientName = clientName?.trim() || null;
      if (password && password.trim()) updateData.password = password.trim();
      if (status && (status === 'active' || status === 'inactive')) updateData.status = status;

      await db
        .update(schema.posCredentials)
        .set(updateData)
        .where(eq(schema.posCredentials.id, id))
        .run();

      return NextResponse.json({ status: 'success', message: 'Credential updated successfully!' });
    }

    // ── DELETE CREDENTIAL ───────────────────────────────
    if (action === 'delete') {
      if (!id) {
        return NextResponse.json({ status: 'error', message: 'Credential ID is required' }, { status: 400 });
      }

      await db
        .delete(schema.posCredentials)
        .where(eq(schema.posCredentials.id, id))
        .run();

      return NextResponse.json({ status: 'success', message: 'Credential deleted successfully!' });
    }

    return NextResponse.json({ status: 'error', message: 'Invalid action requested' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
