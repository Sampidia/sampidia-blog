import { Metadata } from 'next';
import { getMarkdownContent, parseMarkdownToHtml } from '@/lib/markdown';
import AdUnit from '@/components/AdUnit';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how SamPidia collects, protects, and handles your personal data, comments, cookies, and Google advertising tracking.',
};

export default async function Page() {
  const content = await getMarkdownContent('Privacy Policy.md');
  const htmlContent = parseMarkdownToHtml(content);

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-8 font-heading">
        Privacy Policy
      </h1>
      <div 
        className="prose dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
      <AdUnit slot="homepage-bottom" className="mt-12" />
    </article>
  );
}
