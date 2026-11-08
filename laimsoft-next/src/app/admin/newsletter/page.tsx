import { Suspense } from 'react';
import { getDb, schema } from '@/db';
import { desc } from 'drizzle-orm';
import NewsletterClient from './NewsletterClient';
import AdminCircularLoader from '../AdminCircularLoader';

export const dynamic = 'force-dynamic';

export default function NewsletterAdminPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-8">
          {/* Instant Header Shell */}
          <div>
            <h1 className="text-[36px] sm:text-[40px] font-bold text-black tracking-[-0.03em] leading-tight">
              Newsletter
            </h1>
            <p className="text-[16px] text-[#5f5e5e] mt-1">
              Manage the email addresses subscribed to your newsletter.
            </p>
          </div>

          {/* Circular Data Loader */}
          <AdminCircularLoader
            message="Retrieving newsletter subscriber directory..."
            subtext="Querying subscribers from database"
            minHeight="min-h-[380px]"
          />
        </div>
      }
    >
      <NewsletterDataLoader />
    </Suspense>
  );
}

async function NewsletterDataLoader() {
  let list: any[] = [];
  try {
    const db = await getDb();
    list = await db.select().from(schema.newsletterSubscribers).orderBy(desc(schema.newsletterSubscribers.createdAt)).all();
  } catch (err) {
    console.error('Error fetching subscribers:', err);
  }

  return <NewsletterClient subscribers={list} />;
}
