import { Metadata } from 'next';
import { getMarkdownContent, parseMarkdownToHtml } from '@/lib/markdown';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: 'Understand the terms of service, liability disclaimer, external links disclaimer, and guest contributors disclaimer on SamPidia.',
};

export default async function Page() {
  const content = await getMarkdownContent('Disclaimer.md');
  const htmlContent = parseMarkdownToHtml(content);

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-8 font-heading">
        Disclaimer
      </h1>
      <div 
        className="prose dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </article>
  );
}
