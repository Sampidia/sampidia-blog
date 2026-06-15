import fs from 'fs/promises';
import path from 'path';

export async function getMarkdownContent(fileName: string): Promise<string> {
  try {
    const filePath = path.join(/*turbopackIgnore: true*/ process.cwd(), fileName);
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error(`Error reading markdown file ${fileName}:`, error);
    return '';
  }
}

export function parseMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';

  let cleanText = markdown
    .replace(/^slug:\s*\/[^\n]*\n?/im, '')
    .replace(/^Content:\s*\n?/im, '')
    .trim();

  // Escape simple HTML elements to prevent issues, but keep it readable
  // Replace headers: ### heading -> <h3>heading</h3>
  cleanText = cleanText.replace(/^###\s*(.*?)$/gm, '<h3 class="text-lg font-bold mt-6 mb-2 text-slate-800 dark:text-slate-100 font-heading">$1</h3>');
  
  // Replace headers: ## heading -> <h2>heading</h2>
  cleanText = cleanText.replace(/^##\s*(.*?)$/gm, '<h2 class="text-xl font-bold mt-8 mb-3 border-b border-slate-200 dark:border-slate-800 pb-2 text-slate-900 dark:text-white font-heading">$1</h2>');

  // Replace links: [text](url) -> <a href="url" class="text-sky-600 dark:text-sky-400 hover:underline" target="_blank" rel="noopener noreferrer">text</a>
  cleanText = cleanText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-sky-600 dark:text-sky-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

  // Split into paragraphs by double newlines
  const paragraphs = cleanText.split(/\n\s*\n/);
  const formatted = paragraphs.map(p => {
    const trimmed = p.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<h2') || trimmed.startsWith('<h3')) {
      return trimmed;
    }
    return `<p class="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base">${trimmed}</p>`;
  });

  return formatted.join('\n');
}
