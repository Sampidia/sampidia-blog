import Image from 'next/image';
import Link from 'next/link';
import { getPosts, getPopularPosts } from '@/lib/posts';
import Sidebar from '@/components/Sidebar';
import AdUnit from '@/components/AdUnit';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SamPidia - Breaking News, Tech, Sports & Lifestyle',
  description:
    'SamPidia is your go-to online hub for breaking news, tech trends, sports updates, and modern lifestyle tips from Nigeria and across Africa.',
  alternates: { canonical: '/' },
};

const CATEGORIES = ['News', 'Tech', 'Sports', 'Jobs', 'Entertainment', 'Lifestyle'];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function Home() {
  const allPosts = await getPosts();
  const popularPosts = await getPopularPosts();

  const heroPosts = allPosts.slice(0, 4);
  const [hero, ...sidePosts] = heroPosts;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="sr-only">SamPidia - Breaking News, Tech, Sports & Lifestyle</h1>

      {/* ── HERO SECTION ─────────────────────────────────────── */}
      {allPosts.length > 0 && (
        <section aria-label="Featured articles" className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Main hero card */}
            {hero && (
              <article className="lg:col-span-2 relative group rounded-2xl overflow-hidden shadow-xl min-h-[420px] flex flex-col justify-end">
                <Link href={`/${hero.slug}`} className="absolute inset-0 z-0">
                  <Image
                    src={hero.coverImage}
                    alt={hero.imageAltText || hero.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    priority
                    fetchPriority="high"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    quality={70}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                </Link>
                <div className="relative z-10 p-6 md:p-8">
                  <span className="inline-block mb-3 px-3 py-1 text-[11px] font-bold uppercase tracking-widest bg-sky-500 text-white rounded-full">
                    {hero.category}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-3 font-heading">
                    <Link href={`/${hero.slug}`} className="hover:underline underline-offset-2">
                      {hero.title}
                    </Link>
                  </h2>
                  <p className="text-slate-300 text-sm line-clamp-2 mb-4 max-w-lg">
                    {hero.metaDescription}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/30">
                      <Image src={hero.author.avatar} alt={hero.author.name} fill className="object-cover" sizes="32px" />
                    </div>
                    <span className="text-white/80 text-xs font-semibold">{hero.author.name}</span>
                    <span className="text-white/40 text-xs">·</span>
                    <span className="text-white/60 text-xs">{formatDate(hero.date)}</span>
                  </div>
                </div>
              </article>
            )}

            {/* Side hero cards */}
            <div className="flex flex-col gap-6">
              {sidePosts.slice(0, 3).map((post) => (
                <article
                  key={post.id}
                  className="relative group rounded-xl overflow-hidden shadow-md flex-1 min-h-[120px] flex flex-col justify-end"
                >
                  <Link href={`/${post.slug}`} className="absolute inset-0 z-0">
                    <Image
                      src={post.coverImage}
                      alt={post.imageAltText || post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </Link>
                  <div className="relative z-10 p-4">
                    <span className="inline-block mb-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-indigo-500 text-white rounded-full">
                      {post.category}
                    </span>
                    <h3 className="text-sm md:text-base font-bold text-white leading-snug font-heading line-clamp-2">
                      <Link href={`/${post.slug}`} className="hover:underline underline-offset-2">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-white/50 text-[11px] mt-1">{formatDate(post.date)}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Ad strip */}
      <AdUnit slot="homepage-top" className="mb-10" />

      {/* ── MAIN CONTENT + SIDEBAR ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Left: Category blocks */}
        <div className="lg:col-span-2 space-y-14">
          {CATEGORIES.map((cat) => {
            const categoryPosts = allPosts
              .filter((p) => p.category.toLowerCase() === cat.toLowerCase())
              .slice(0, 4);
            if (categoryPosts.length === 0) return null;

            return (
              <section key={cat} aria-labelledby={`section-${cat.toLowerCase()}`}>
                {/* Section header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-7 bg-sky-500 rounded-full" />
                    <h2
                      id={`section-${cat.toLowerCase()}`}
                      className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading"
                    >
                      {cat}
                    </h2>
                  </div>
                  <Link
                    href={`/${cat.toLowerCase()}`}
                    className="text-xs font-bold text-sky-700 dark:text-sky-400 hover:underline underline-offset-2 transition-colors"
                  >
                    View all →
                  </Link>
                </div>

                {/* Featured + grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {categoryPosts.map((post, idx) => (
                    <article
                      key={post.id}
                      className={`group bg-white dark:bg-[#0d1321] border border-slate-200/60 dark:border-slate-800/70 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col shadow-sm ${
                        idx === 0 ? 'sm:col-span-2' : ''
                      }`}
                    >
                      <Link
                        href={`/${post.slug}`}
                        className={`relative block overflow-hidden bg-slate-100 dark:bg-slate-900 ${
                          idx === 0 ? 'aspect-[21/9]' : 'aspect-[16/10]'
                        }`}
                      >
                        <Image
                          src={post.coverImage}
                          alt={post.imageAltText || post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, 50vw"
                        />
                      </Link>
                      <div className="p-5 flex flex-col flex-grow">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 rounded-full border border-sky-100/50 dark:border-sky-900/30">
                            {post.category}
                          </span>
                          <span className="text-[11px] text-slate-600 dark:text-slate-400">
                            {formatDate(post.date)}
                          </span>
                        </div>
                        <h3
                          className={`font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 hover:text-sky-600 dark:hover:text-sky-400 transition-colors leading-snug font-heading ${
                            idx === 0 ? 'text-xl' : 'text-base'
                          }`}
                        >
                          <Link href={`/${post.slug}`}>{post.title}</Link>
                        </h3>
                        {idx === 0 && (
                          <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-4 flex-grow leading-relaxed">
                            {post.metaDescription}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/70">
                          <div className="relative w-7 h-7 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                            <Image
                              src={post.author.avatar}
                              alt={post.author.name}
                              fill
                              className="object-cover"
                              sizes="28px"
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            {post.author.name}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Right: Sticky Sidebar */}
        <aside className="lg:col-span-1">
          <Sidebar popularPosts={popularPosts} />
        </aside>
      </div>

      {/* Bottom ad */}
      <AdUnit slot="homepage-bottom" className="mt-14" />
    </div>
  );
}
