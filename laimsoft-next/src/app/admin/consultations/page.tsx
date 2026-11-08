import { Suspense } from 'react';
import { getDb, schema } from '@/db';
import { desc } from 'drizzle-orm';
import ConsultationsClient from './ConsultationsClient';
import AdminCircularLoader from '../AdminCircularLoader';

export const dynamic = 'force-dynamic';

export default function ConsultationsAdminPage() {
  return (
    <div className="space-y-8">
      {/* ── Instant Header (0ms) ── */}
      <div>
        <h1 className="text-[32px] font-semibold text-black tracking-[-0.02em]">
          Consultations
        </h1>
        <p className="text-[16px] text-[#5f5e5e] mt-1">
          Review, scope, and coordinate engineering consultation requests.
        </p>
      </div>

      {/* ── Live Database Consultations with Circular Spinner ── */}
      <Suspense
        fallback={
          <AdminCircularLoader
            message="Fetching consultation bookings..."
            subtext="Querying booking requests and attendee details"
            minHeight="min-h-[380px]"
          />
        }
      >
        <ConsultationsDataLoader />
      </Suspense>
    </div>
  );
}

async function ConsultationsDataLoader() {
  let list: any[] = [];
  try {
    const db = await getDb();
    list = await db.select().from(schema.consultations).orderBy(desc(schema.consultations.createdAt)).all();
  } catch (err) {
    console.error('Error fetching consultations:', err);
  }

  return <ConsultationsClient consultations={list} />;
}
