import { Suspense } from 'react';
import { getDb, schema } from '@/db';
import { getSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import SettingsClient from './SettingsClient';
import AdminCircularLoader from '../AdminCircularLoader';

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[980px] mx-auto space-y-6">
          {/* Instant Header Shell */}
          <div className="mb-6">
            <h1 className="text-[36px] sm:text-[40px] font-bold tracking-tight text-black leading-tight mb-1">
              Settings
            </h1>
            <p className="text-[16px] text-[#5f5e5e]">
              Update your basic admin profile and login credentials.
            </p>
          </div>

          {/* Circular Data Loader */}
          <AdminCircularLoader
            message="Retrieving administrator configurations..."
            subtext="Loading secure profile and email settings from database"
            minHeight="min-h-[380px]"
          />
        </div>
      }
    >
      <SettingsDataLoader />
    </Suspense>
  );
}

async function SettingsDataLoader() {
  const session = await getSession();
  let admin: any = null;
  let mail: any = null;

  try {
    if (session) {
      const db = await getDb();
      const adminRows = await db.select().from(schema.admins).where(eq(schema.admins.id, session.id)).limit(1);
      if (adminRows.length > 0) admin = adminRows[0];
      if (!admin && session) {
        admin = {
          id: session.id,
          username: session.username,
          fullName: session.fullName,
          email: session.email,
          createdAt: '2026-01-01T00:00:00Z',
        };
      }
      const mailRows = await db.select().from(schema.mailSettings).limit(1);
      if (mailRows.length > 0) mail = mailRows[0];
    }
  } catch (err) {
    console.error('Error fetching settings:', err);
  }

  return <SettingsClient initialAdmin={admin} initialMail={mail} />;
}
