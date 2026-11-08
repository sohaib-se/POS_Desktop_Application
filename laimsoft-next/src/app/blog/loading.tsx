export default function BlogLoading() {
  return (
    <div className="blog-page">
      {/* Hero Skeleton matching real hero layout */}
      <section className="blog-hero" id="blog-hero-top">
        <div className="blog-hero-bg" aria-hidden="true" />
        <div className="blog-hero-content">
          <div className="blog-hero-badge">
            <span className="blog-hero-badge-dot" />
            <span className="blog-hero-badge-text">Engineering Insights</span>
          </div>
          <h1>Precision in Every Line of Code.</h1>
          <p>
            Exploring the future of minimalist architecture, scalable backend systems, and the intersection of design and performance.
          </p>
          <div className="blog-hero-scroll">
            <span className="material-symbols-outlined">keyboard_arrow_down</span>
            Scroll
          </div>
        </div>
      </section>

      {/* Main Content Skeleton */}
      <main className="blog-main" id="blog-content">
        <div className="blog-page-header">
          <span className="eng-label">Engineering Insights</span>
          <h1>Laimsoft Blog</h1>
          <p>Insights, trends, and tutorials from our tech experts.</p>
        </div>

        <section className="blog-posts-section">
          {/* Filter Pills Skeleton */}
          <div className="blog-filters">
            <div className="h-10 w-28 bg-black/10 animate-pulse rounded-full" />
            <div className="h-10 w-24 bg-black/5 animate-pulse rounded-full" />
            <div className="h-10 w-36 bg-black/5 animate-pulse rounded-full" />
            <div className="h-10 w-32 bg-black/5 animate-pulse rounded-full" />
          </div>

          {/* Post Card Skeletons */}
          <div className="blog-grid-wrap mt-8">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="blog-card animate-pulse border border-slate-200/60 rounded-xl overflow-hidden bg-white shadow-sm"
              >
                <div className="w-full bg-slate-200" style={{ height: '240px' }} />
                <div className="p-6">
                  <div className="h-3 w-28 bg-slate-200 rounded mb-4" />
                  <div className="h-6 w-5/6 bg-slate-200 rounded mb-3" />
                  <div className="h-4 w-full bg-slate-100 rounded mb-2" />
                  <div className="h-4 w-4/6 bg-slate-100 rounded mb-6" />
                  <div className="h-9 w-28 bg-slate-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
