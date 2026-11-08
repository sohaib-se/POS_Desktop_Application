'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

interface Props {
  categories: any[];
  initialPosts: any[];
}

export default function BlogClientView({ categories, initialPosts }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const queryCategory = searchParams?.get('category') || '';
  const [selectedCategory, setSelectedCategory] = useState<string>(queryCategory);

  const handleCategoryClick = (catName: string) => {
    setSelectedCategory(catName);
    startTransition(() => {
      const url = catName ? `/blog?category=${encodeURIComponent(catName)}#blog-content` : '/blog#blog-content';
      window.history.replaceState(null, '', url);
    });
  };

  const filteredPosts = initialPosts.filter((p: any) => {
    if (!selectedCategory) return true;
    const cat = p.category?.toLowerCase() || '';
    const target = selectedCategory.toLowerCase();
    return cat === target || cat.replace(/\s+/g, '-') === target;
  });

  const featured = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const gridPosts = filteredPosts.length > 1 ? filteredPosts.slice(1) : [];

  const getImageUrl = (img?: string | null) => {
    if (!img) return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80';
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    if (img.startsWith('/')) return img;
    return `/images/${img}`;
  };

  const getReadTime = (content?: string) => {
    if (!content) return 1;
    const clean = content.replace(/<[^>]*>?/gm, '');
    const words = clean.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  };

  const getExcerpt = (content?: string, maxLen = 160) => {
    if (!content) return '';
    const clean = content.replace(/<[^>]*>?/gm, '').trim();
    return clean.length > maxLen ? clean.substring(0, maxLen) + '...' : clean;
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'OCT 15, 2026';
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? 'OCT 15, 2026'
      : d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();
  };

  return (
    <section className="blog-posts-section" id="blog-posts-section">
      {/* Filters with Instant 0ms Switching */}
      <div className="blog-filters">
        <button
          type="button"
          onClick={() => handleCategoryClick('')}
          className={`blog-filter-btn ${selectedCategory === '' ? 'active' : ''}`}
        >
          ALL TOPICS
        </button>
        {categories.map((cat) => {
          const isActive =
            selectedCategory.toLowerCase() === cat.name.toLowerCase() ||
            selectedCategory.toLowerCase() === cat.slug?.toLowerCase();
          return (
            <button
              type="button"
              key={cat.id}
              onClick={() => handleCategoryClick(cat.name)}
              className={`blog-filter-btn ${isActive ? 'active' : ''}`}
            >
              {cat.name.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Featured Post */}
      {featured && (
        <div className="blog-featured-wrap">
          <div className="blog-featured-card">
            <div className="blog-featured-inner">
              <div className="blog-featured-img">
                <img
                  src={getImageUrl(featured.featuredImage)}
                  alt={featured.title}
                  loading="eager"
                  decoding="async"
                />
              </div>
              <div className="blog-featured-body">
                <div className="blog-featured-meta">
                  <span className="blog-featured-tag">FEATURED</span>
                  <span className="blog-featured-readtime">
                    {getReadTime(featured.content)} MIN READ
                  </span>
                </div>
                <Link href={`/blog/${featured.slug}`} className="blog-featured-title">
                  {featured.title}
                </Link>
                <p className="blog-featured-desc">
                  {getExcerpt(featured.content, 200)}
                </p>
                <Link href={`/blog/${featured.slug}`} className="blog-read-more-btn">
                  Read More
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blog Grid */}
      <div className="blog-grid-wrap">
        {gridPosts.length > 0 ? (
          gridPosts.map((post) => (
            <article key={post.id} className="blog-card">
              <div className="blog-card-img">
                <img
                  src={getImageUrl(post.featuredImage)}
                  alt={post.title}
                  loading="lazy"
                  decoding="async"
                />
                {post.category && (
                  <span className="blog-card-category">{post.category.toUpperCase()}</span>
                )}
              </div>
              <div className="blog-card-body">
                <span className="blog-card-date">
                  {formatDate(post.createdAt)} • {getReadTime(post.content)} MIN READ
                </span>
                <Link href={`/blog/${post.slug}`} className="blog-card-title">
                  {post.title}
                </Link>
                <p className="blog-card-excerpt">
                  {getExcerpt(post.content, 160)}
                </p>
                <Link href={`/blog/${post.slug}`} className="blog-card-btn">
                  READ MORE
                </Link>
              </div>
            </article>
          ))
        ) : !featured ? (
          <div className="blog-empty">
            <span className="material-symbols-outlined">article</span>
            <h3>No posts available yet.</h3>
          </div>
        ) : null}
      </div>
    </section>
  );
}
