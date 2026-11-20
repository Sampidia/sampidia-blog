import Link from 'next/link';
import { getPostsByCategory } from '@/lib/posts';
import AdUnit from './AdUnit';
import CategoryPostList from './CategoryPostList';

interface CategoryPageProps {
  category: string;
}

export default async function CategoryPage({ category }: CategoryPageProps) {
  const posts = await getPostsByCategory(category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Category Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
            Category
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1 font-heading">
            {category}
          </h1>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
          Explore all the latest updates, announcements, and in-depth articles about {category.toLowerCase()} on SamPidia.
        </p>
      </div>

      {/* Ad unit at the top */}
      <AdUnit slot="category-top" />

      {posts.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
            No published posts found in this category yet.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors shadow-sm"
          >
            Return Home
          </Link>
        </div>
      ) : (
        <CategoryPostList posts={posts} initialCount={12} pageSize={12} />
      )}

      {/* Ad unit at the bottom */}
      <AdUnit slot="category-bottom" className="mt-12" />
    </div>
  );
}
