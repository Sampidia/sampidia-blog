import Image from '@/components/SafeImage';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPostBySlug, getPosts } from '@/lib/posts';
import AdUnit from '@/components/AdUnit';
import CusdisComments from '@/components/CusdisComments';
import { parseMarkdownToHtml } from '@/lib/markdown';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Post Not Found' };

  const siteUrl = 'https://sampidia.com';

  return {
    title: post.title,
    description: post.metaDescription,
    alternates: { canonical: `/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      url: `${siteUrl}/${post.slug}`,
      siteName: 'SamPidia',
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.imageAltText || post.title,
        },
      ],
      type: 'article',
      publishedTime: post.date,
      authors: [post.author.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.metaDescription,
      images: [post.coverImage],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const allPosts = await getPosts();
  const related = allPosts
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, 3);

  const siteUrl = 'https://sampidia.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    image: post.coverImage,
    datePublished: new Date(post.date).toISOString(),
    description: post.metaDescription,
    url: `${siteUrl}/${post.slug}`,
    author: {
      '@type': 'Person',
      name: post.author.name,
      image: `${siteUrl}${post.author.avatar}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'SamPidia',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/${post.slug}`,
    },
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ── ARTICLE ──────────────────────────────────────────── */}
          <article className="lg:col-span-2 min-w-0" itemScope itemType="https://schema.org/BlogPosting">

            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-5">
              <Link href="/" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">Home</Link>
              <span>/</span>
              <Link
                href={`/${post.category.toLowerCase()}`}
                className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors capitalize"
              >
                {post.category}
              </Link>
              <span>/</span>
              <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{post.title}</span>
            </nav>

            {/* Category badge */}
            <div className="mb-4">
              <Link
                href={`/${post.category.toLowerCase()}`}
                className="inline-block px-3 py-1 text-[11px] font-bold uppercase tracking-widest bg-sky-500 hover:bg-sky-600 text-white rounded-full transition-colors"
              >
                {post.category}
              </Link>
            </div>

            {/* Title */}
            <h1
              itemProp="headline"
              className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight mb-6 font-heading"
            >
              {post.title}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-full overflow-hidden ring-2 ring-sky-100 dark:ring-sky-900 bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    fill
                    className="object-cover"
                    sizes="44px"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-none" itemProp="author">
                    {post.author.name}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Staff Writer</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 ml-auto">
                <time dateTime={post.date} itemProp="datePublished">
                  {new Date(post.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </time>
              </div>
            </div>

            {/* Cover image */}
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-8 bg-slate-100 dark:bg-slate-900 shadow-lg">
              <Image
                src={post.coverImage}
                alt={post.imageAltText || post.title}
                fill
                className="object-cover"
                priority
                fetchPriority="high"
                sizes="(max-width: 1024px) 100vw, 66vw"
                quality={60}
                itemProp="image"
              />
            </div>

            {/* In-article ad */}
            <AdUnit slot="in-article-top" className="mb-8" />

            {/* Post content */}
            <div
              className="prose dark:prose-invert"
              itemProp="articleBody"
              dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(post.content) }}
            />

            {/* In-article ad (mid) */}
            <AdUnit slot="in-article-bottom" className="mt-10" />

            {/* Comments */}
            <CusdisComments post={{ id: post.id, title: post.title, slug: post.slug }} />
          </article>

          {/* ── SIDEBAR ──────────────────────────────────────────── */}
          <aside className="lg:col-span-1 space-y-8">

            {/* Sticky ad */}
            <div className="lg:sticky lg:top-28 space-y-6">
              <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
                <AdUnit slot="post-sidebar" />
              </div>

              {/* About author card */}
              <div className="bg-white dark:bg-[#0d1321] rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-sm p-6 text-center">
                <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 ring-4 ring-sky-100 dark:ring-sky-900">
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <p className="font-bold text-lg text-slate-900 dark:text-white font-heading">{post.author.name}</p>
                <p className="text-xs text-sky-700 dark:text-sky-400 font-semibold uppercase tracking-wider mb-2">
                  {post.category} Editor
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Expert writer covering {post.category.toLowerCase()} topics, helping readers stay informed and ahead.
                </p>
              </div>
            </div>
          </aside>
        </div>

        {/* ── RELATED POSTS ──────────────────────────────────────── */}
        {related.length > 0 && (
          <section aria-labelledby="related-posts-heading" className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-7 bg-sky-500 rounded-full" />
              <h2 id="related-posts-heading" className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
                Related Posts
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((relPost) => (
                <article
                  key={relPost.id}
                  className="group bg-white dark:bg-[#0d1321] border border-slate-200/55 dark:border-slate-800/80 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col shadow-sm"
                >
                  <Link href={`/${relPost.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-900">
                    <Image
                      src={relPost.coverImage}
                      alt={relPost.imageAltText || relPost.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </Link>
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 rounded-full">
                        {relPost.category}
                      </span>
                      <span className="text-[11px] text-slate-600 dark:text-slate-400">
                        {new Date(relPost.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-sky-600 dark:hover:text-sky-400 transition-colors leading-snug font-heading">
                      <Link href={`/${relPost.slug}`}>{relPost.title}</Link>
                    </h3>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
