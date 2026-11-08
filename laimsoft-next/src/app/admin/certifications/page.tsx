import { Suspense } from 'react';
import { getDb, schema } from '@/db';
import { desc } from 'drizzle-orm';
import CertificationsClient from './CertificationsClient';
import AdminCircularLoader from '../AdminCircularLoader';

export const dynamic = 'force-dynamic';

export default function CertificationsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-8">
          {/* Instant Hero Card */}
          <section className="rounded-[32px] border border-slate-200 bg-white px-6 py-7 shadow-sm sm:px-8">
            <div className="max-w-3xl">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500"
                style={{ fontFamily: "'Space Grotesk', monospace" }}
              >
                Certificates Admin
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                Course Certificates
              </h1>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Manage courses, issue certificates, and review verification links from one screen.
              </p>
            </div>
          </section>

          {/* Circular Data Loader */}
          <AdminCircularLoader
            message="Fetching courses and issued certificates..."
            subtext="Retrieving verified credentials from database"
            minHeight="min-h-[360px]"
          />
        </div>
      }
    >
      <CertificationsDataLoader />
    </Suspense>
  );
}

async function CertificationsDataLoader() {
  let coursesList: any[] = [];
  let certificatesList: any[] = [];

  try {
    const db = await getDb();
    coursesList = await db.select().from(schema.courses).orderBy(desc(schema.courses.createdAt)).all();
    certificatesList = await db.select().from(schema.certificates).orderBy(desc(schema.certificates.createdAt)).all();
  } catch (err) {
    console.error('Error fetching certs:', err);
  }

  return <CertificationsClient courses={coursesList} certificates={certificatesList} />;
}
