import { Suspense } from 'react';
import { getDb, schema } from '@/db';
import { desc } from 'drizzle-orm';
import CategoriesClient from './CategoriesClient';
import AdminCircularLoader from '../AdminCircularLoader';

export const dynamic = 'force-dynamic';

export default function CategoriesAdminPage() {
  return (
    <div className="space-y-8">
      {/* ── Instant Header (0ms) ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[36px] sm:text-[40px] font-bold tracking-tight text-black leading-tight mb-1">
            Categories
          </h1>
          <p className="text-[16px] text-[#5f5e5e]">
            Create categories and use them when publishing blog posts.
          </p>
        </div>
      </div>

      {/* ── Live Database Categories with Circular Spinner ── */}
      <Suspense
        fallback={
          <AdminCircularLoader
            message="Fetching categories from database..."
            subtext="Loading classifications and linked post counts"
            minHeight="min-h-[360px]"
          />
        }
      >
        <CategoriesDataLoader />
      </Suspense>
    </div>
  );
}

async function CategoriesDataLoader() {
  let categoriesWithCount: any[] = [];
  try {
    const db = await getDb();
    const [categoriesList, postsList] = await Promise.all([
      db.select().from(schema.categories).orderBy(desc(schema.categories.createdAt)).all(),
      db.select().from(schema.posts).all(),
    ]);

    categoriesWithCount = categoriesList.map((cat: any) => {
      const count = postsList.filter(
        (p: any) => p.category?.toLowerCase() === cat.name?.toLowerCase()
      ).length;
      return {
        ...cat,
        postCount: count,
      };
    });
  } catch (err) {
    console.error('Error fetching categories:', err);
  }

  return <CategoriesClient categories={categoriesWithCount} />;
}
