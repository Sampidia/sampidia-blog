'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from '@/components/SafeImage';
import { PostMeta } from '@/lib/posts';

interface CategoryPostListProps {
  posts: PostMeta[];
  initialCount?: number;
  pageSize?: number;
}

export default function CategoryPostList({
  posts,
  initialCount = 12,
  pageSize = 12,
}: CategoryPostListProps) {
  const [visibleCount, setVisibleCount] = useState(initialCount);

  const visiblePosts = posts.slice(0, visibleCount);
  const hasMore = visibleCount < posts.length;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {visiblePosts.map((post, index) => (
          <article
            key={post.id}
            className="bg-white dark:bg-[#0d1321] border border-slate-200/55 dark:border-slate-800/80 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full shadow-sm"
          >
            <Link
              href={`/${post.slug}`}
              className="relative block aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-900"
            >
              <Image
                src={post.coverImage}
                alt={post.imageAltText || post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={index === 0}
                fetchPriority={index === 0 ? 'high' : undefined}
                quality={70}
              />
            </Link>

            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 rounded-full border border-sky-100/50 dark:border-sky-900/30">
                  {post.category}
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400">
                  {(() => {
                    const d = post.date ? new Date(post.date) : null;
                    return d && !isNaN(d.getTime())
                      ? d.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '';
                  })()}
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 hover:text-sky-600 dark:hover:text-sky-400 transition-colors leading-snug font-heading">
                <Link href={`/${post.slug}`}>{post.title}</Link>
              </h2>

              <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
                {post.metaDescription}
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-3 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block leading-none">
                    {post.author.name}
                  </span>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400">
                    Staff Writer
                  </span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {hasMore && (
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={() =>
              setVisibleCount((prev) => Math.min(prev + pageSize, posts.length))
            }
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
          >
            Load More Articles ({posts.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </>
  );
}

