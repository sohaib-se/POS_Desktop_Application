import { Suspense } from 'react';
import { getDb, schema } from '@/db';
import { desc, count } from 'drizzle-orm';
import DashboardClient from './DashboardClient';
import AdminCircularLoader from '../AdminCircularLoader';

export const dynamic = 'force-dynamic';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-10">
      {/* ── Instant Welcome Header (0ms) ── */}
      <div>
        <h1 className="text-[36px] sm:text-[40px] font-semibold text-[#000000] tracking-[-0.02em] leading-tight">
          System Overview
        </h1>
        <p className="text-[#5f5e5e] text-[18px] mt-1">
          Engineering excellence in real-time performance.
        </p>
      </div>

      {/* ── Live Database Telemetry with Circular Spinner ── */}
      <Suspense
        fallback={
          <AdminCircularLoader
            message="Retrieving dashboard metrics and records..."
            subtext="Querying consultations, contacts, and blog statistics"
            minHeight="min-h-[360px]"
          />
        }
      >
        <DashboardDataLoader />
      </Suspense>
    </div>
  );
}

async function DashboardDataLoader() {
  let stats = {
    consultationsTotal: 0,
    consultationsMonth: 0,
    consultationsPrevMonth: 0,
    consultationGrowth: 0,
    postsTotal: 0,
    postsLast30: 0,
    contactsTotal: 0,
    contactsLast30: 0,
  };

  let recentConsultations: any[] = [];
  let recentContacts: any[] = [];

  try {
    const db = await getDb();

    const [
      postsCount,
      consCount,
      contactsCount,
      allCons,
      allContacts,
      allPosts,
    ] = await Promise.all([
      db.select({ value: count() }).from(schema.posts),
      db.select({ value: count() }).from(schema.consultations),
      db.select({ value: count() }).from(schema.contacts),
      db.select().from(schema.consultations).orderBy(desc(schema.consultations.createdAt)).all(),
      db.select().from(schema.contacts).orderBy(desc(schema.contacts.createdAt)).all(),
      db.select().from(schema.posts).orderBy(desc(schema.posts.createdAt)).all(),
    ]);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const consultationsThisMonth = allCons.filter((c: any) => {
      const d = new Date(c.createdAt || Date.now());
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const consultationsPrevMonth = allCons.filter((c: any) => {
      const d = new Date(c.createdAt || Date.now());
      return d.getMonth() === prevMonthDate.getMonth() && d.getFullYear() === prevMonthDate.getFullYear();
    }).length;

    let growth = 0;
    if (consultationsPrevMonth > 0) {
      growth = Math.round(((consultationsThisMonth - consultationsPrevMonth) / consultationsPrevMonth) * 1000) / 10;
    } else if (consultationsThisMonth > 0) {
      growth = 100.0;
    }

    const postsLast30 = allPosts.filter((p: any) => new Date(p.createdAt || Date.now()) >= thirtyDaysAgo).length;
    const contactsLast30 = allContacts.filter((c: any) => new Date(c.createdAt || Date.now()) >= thirtyDaysAgo).length;

    stats = {
      consultationsTotal: consCount[0]?.value || allCons.length,
      consultationsMonth: consultationsThisMonth,
      consultationsPrevMonth: consultationsPrevMonth,
      consultationGrowth: growth,
      postsTotal: postsCount[0]?.value || allPosts.length,
      postsLast30: postsLast30,
      contactsTotal: contactsCount[0]?.value || allContacts.length,
      contactsLast30: contactsLast30,
    };

    recentConsultations = allCons.slice(0, 5);
    recentContacts = allContacts.slice(0, 5);
  } catch (err) {
    console.error('Error loading dashboard stats:', err);
  }

  return (
    <DashboardClient
      stats={stats}
      consultations={recentConsultations}
      contacts={recentContacts}
    />
  );
}
