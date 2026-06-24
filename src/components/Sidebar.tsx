import Link from 'next/link';
import Image from '@/components/SafeImage';
import AdUnit from './AdUnit';
import { Post } from '@/lib/posts';

interface SidebarProps {
  popularPosts: Post[];
}

export default function Sidebar({ popularPosts }: SidebarProps) {
  const categories = [
    { name: 'News', path: '/news' },
    { name: 'Tech', path: '/tech' },
    { name: 'Sports', path: '/sports' },
    { name: 'Jobs', path: '/jobs' },
    { name: 'Entertainment', path: '/entertainment' },
    { name: 'Lifestyle', path: '/lifestyle' }
  ];

  return (
    <aside className="space-y-8 lg:sticky lg:top-28">
      {/* Ad unit at the top of sidebar */}
      <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <AdUnit slot="sidebar-top" />
      </div>

      {/* Popular Posts */}
      <div className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
          Popular Posts
        </h3>
        <div className="space-y-4">
          {popularPosts.slice(0, 4).map((post) => (
            <Link key={post.id} href={`/${post.slug}`} className="flex gap-3 group items-start">
              <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-900">
                <Image
                  src={post.coverImage}
                  alt={post.imageAltText || post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  sizes="64px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                  {post.category}
                </span>
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors mt-0.5 animate-duration-300">
                  {post.title}
                </h4>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1">
                  {new Date(post.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
          Categories
        </h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.path}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50 hover:bg-sky-50 text-slate-600 hover:text-sky-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 dark:hover:text-sky-400 border border-slate-200/50 dark:border-slate-800 rounded-lg transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Ad unit at the bottom of sidebar */}
      <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <AdUnit slot="sidebar-bottom" />
      </div>
    </aside>
  );
}
