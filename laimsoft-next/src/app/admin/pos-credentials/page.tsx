import { Suspense } from 'react';
import { getDb, schema } from '@/db';
import { desc } from 'drizzle-orm';
import PosCredentialsClient from './PosCredentialsClient';
import AdminCircularLoader from '../AdminCircularLoader';

export const dynamic = 'force-dynamic';

export default function PosCredentialsAdminPage() {
  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[36px] sm:text-[40px] font-bold tracking-tight text-black leading-tight mb-1">
            POS Credentials
          </h1>
          <p className="text-[16px] text-[#5f5e5e]">
            Manage username and password licenses for the Laimsoft POS Desktop Installer.
          </p>
        </div>
      </div>

      {/* ── Live Database Credentials with Suspense Loader ── */}
      <Suspense
        fallback={
          <AdminCircularLoader
            message="Fetching POS credentials from database..."
            subtext="Loading active and inactive installer licenses"
            minHeight="min-h-[360px]"
          />
        }
      >
        <PosCredentialsDataLoader />
      </Suspense>
    </div>
  );
}

async function PosCredentialsDataLoader() {
  let credentialsList: any[] = [];
  try {
    const db = await getDb();
    credentialsList = await db
      .select()
      .from(schema.posCredentials)
      .orderBy(desc(schema.posCredentials.createdAt))
      .all();
  } catch (err) {
    console.error('Error fetching POS credentials:', err);
  }

  return <PosCredentialsClient initialCredentials={credentialsList} />;
}
