import { Suspense } from 'react';
import { getDb, schema } from '@/db';
import { desc } from 'drizzle-orm';
import MessagesClient from './MessagesClient';
import AdminCircularLoader from '../AdminCircularLoader';

export const dynamic = 'force-dynamic';

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-8">
          {/* Instant Header Shell */}
          <div>
            <h1 className="text-[36px] sm:text-[40px] font-bold text-black tracking-[-0.03em] leading-tight">
              Messages
            </h1>
            <p className="text-[16px] text-[#5f5e5e] mt-1">
              Inquiries received via the contact portal.
            </p>
          </div>

          {/* Circular Data Loader */}
          <AdminCircularLoader
            message="Retrieving customer inquiries..."
            subtext="Querying messages and sender details from database"
            minHeight="min-h-[380px]"
          />
        </div>
      }
    >
      <MessagesDataLoader />
    </Suspense>
  );
}

async function MessagesDataLoader() {
  let list: any[] = [];
  try {
    const db = await getDb();
    list = await db.select().from(schema.contacts).orderBy(desc(schema.contacts.createdAt)).all();
  } catch (err) {
    console.error('Error fetching messages:', err);
  }

  return <MessagesClient messages={list} />;
}
