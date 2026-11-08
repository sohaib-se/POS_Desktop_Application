import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDb, schema } from '@/db';
import { eq, ne, desc } from 'drizzle-orm';
import type { Metadata } from 'next';
import SingleBlogNewsletter from '@/components/SingleBlogNewsletter';

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const db = await getDb();
    const all = await db.select().from(schema.posts).all();
    const p = all.find((item: any) => item.slug?.toLowerCase() === slug.toLowerCase());
    if (p) {
      return {
        title: `${p.title} | Laimsoft Blog`,
        description: p.content.replace(/<[^>]*>?/gm, '').slice(0, 160),
      };
    }
  } catch {}
  return { title: 'Blog Article | Laimsoft' };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  let post: any = null;
  let relatedPosts: any[] = [];

  try {
    const db = await getDb();
    const all = await db.select().from(schema.posts).all();
    post = all.find((item: any) => item.slug?.toLowerCase() === slug.toLowerCase()) || null;

    if (post) {
      relatedPosts = all.filter((item: any) => item.slug !== post.slug).slice(0, 3);
    }
  } catch (err) {
    console.error('Error fetching post:', err);
  }

  if (!post) {
    notFound();
  }

  const getImageUrl = (img?: string | null) => {
    if (!img) return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=80';
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    if (img.startsWith('/')) return img;
    return `/images/${img}`;
  };

  const wordCount = post.content
    ? post.content.replace(/<[^>]*>?/gm, '').split(/\s+/).filter(Boolean).length
    : 0;
  const readTime = Math.max(1, Math.round(wordCount / 200));

  const postDate = new Date(post.createdAt || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });

  // Wrap first <p> with drop-cap if content starts with <p>
  let processedContent = post.content || '';
  if (processedContent.trim().toLowerCase().startsWith('<p')) {
    processedContent = processedContent.replace(/<p(\s[^>]*)?>/i, '<p$1 class="bp-drop-cap">');
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://laimsoft.com/blog/${post.slug}`;
  const encodedShareUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(post.title);

  return (
    <div className="bp-page">
      {/* ══════════════════════════════════════════
           POST HERO
      ══════════════════════════════════════════ */}
      <header className="bp-hero">
        <div className="bp-hero-bg">
          <img src={getImageUrl(post.featuredImage)} alt={post.title} />
        </div>

        <div className="bp-hero-inner">
          {/* Badge */}
          <div className="bp-hero-badge">
            <span className="bp-hero-badge-dot"></span>
            <span className="bp-hero-badge-text">
              {post.category || 'Engineering Excellence'}
            </span>
          </div>

          {/* Title */}
          <h1>{post.title}</h1>

          {/* Meta */}
          <div className="bp-hero-meta">
            <div className="bp-author">
              <div className="bp-author-avatar">
                <span className="material-symbols-outlined">person</span>
              </div>
              <div>
                <div className="bp-author-name">Laimsoft Team</div>
                <div className="bp-author-role">Author</div>
              </div>
            </div>

            <div className="bp-meta-divider"></div>

            <div className="bp-meta-date">
              <div className="bp-meta-val">{postDate}</div>
              <div className="bp-meta-label">{readTime} min read</div>
            </div>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════
           ARTICLE BODY + SIDEBAR
      ══════════════════════════════════════════ */}
      <div className="bp-body">
        {/* Article */}
        <article className="bp-article">
          {/* Pull quote box */}
          <div className="bp-pullquote">
            <span className="material-symbols-outlined bp-pullquote-icon">terminal</span>
            <p>
              &ldquo;Engineering is the art of making what is necessary from what is possible. In software, that means balancing radical innovation with surgical precision.&rdquo;
            </p>
          </div>

          {/* Post content */}
          <div
            className="bp-article-content"
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />

          {/* Post footer: back + share */}
          <div className="bp-post-footer">
            <Link href="/blog" className="bp-back-btn">
              <span className="material-symbols-outlined">arrow_back</span>
              Back to Blog
            </Link>
            <div className="bp-share">
              <span className="bp-share-label">Share:</span>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodedShareUrl}&text=${encodedTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bp-share-btn"
                title="Share on Twitter"
              >
                <span className="material-symbols-outlined">share</span>
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bp-share-btn"
                title="Share on Facebook"
              >
                <span className="material-symbols-outlined">thumb_up</span>
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedShareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bp-share-btn"
                title="Share on LinkedIn"
              >
                <span className="material-symbols-outlined">work</span>
              </a>
            </div>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="bp-sidebar">
          <SingleBlogNewsletter />
        </aside>
      </div>

      {/* ══════════════════════════════════════════
           FURTHER READING
      ══════════════════════════════════════════ */}
      {relatedPosts.length > 0 && (
        <section className="bp-related">
          <div className="bp-related-inner">
            <div className="bp-related-header">
              <div>
                <h2>Further Reading</h2>
                <p>Continue exploring our technical insights.</p>
              </div>
              <Link href="/blog" className="bp-view-all">
                View All Posts
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
            <div className="bp-related-grid">
              {relatedPosts.map((rp) => (
                <Link key={rp.id} href={`/blog/${rp.slug}`} className="bp-related-card">
                  <div className="bp-related-img">
                    <img src={getImageUrl(rp.featuredImage)} alt={rp.title} />
                  </div>
                  <span className="bp-related-cat">
                    {rp.category || 'Engineering'}
                  </span>
                  <div className="bp-related-title">{rp.title}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
