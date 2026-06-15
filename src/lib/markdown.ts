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

  // Clean metadata if present
  let cleanText = markdown
    .replace(/^slug:\s*\/[^\n]*\n?/im, '')
    .replace(/^Content:\s*\n?/im, '')
    .trim();

  // If the text already looks like HTML (starts with common HTML tags and doesn't contain markdown symbols at start of lines),
  // we return it as-is to preserve HTML posts (like those in local backup-posts.json).
  const isHtml = /^\s*<[a-zA-Z0-9]+[^>]*>/.test(cleanText);
  if (isHtml) {
    return cleanText;
  }

  const lines = cleanText.split('\n');
  const result: string[] = [];
  
  let inUl = false;
  let inOl = false;
  let currentParagraph: string[] = [];

  const closeLists = () => {
    if (inUl) {
      result.push('</ul>');
      inUl = false;
    }
    if (inOl) {
      result.push('</ol>');
      inOl = false;
    }
  };

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const pText = currentParagraph.join(' ').trim();
      if (pText) {
        result.push(`<p>${parseInlineMarkdown(pText)}</p>`);
      }
      currentParagraph = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 1. Empty line -> starts a new paragraph or ends list
    if (!line) {
      closeLists();
      flushParagraph();
      continue;
    }

    // 2. YouTube Auto-Embed: check if the line is just a YouTube link
    const ytMatch = line.match(/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})(?:\S+)?$/i);
    if (ytMatch) {
      closeLists();
      flushParagraph();
      const videoId = ytMatch[1];
      result.push(
        `<div class="relative w-full aspect-video rounded-xl overflow-hidden my-6 bg-slate-900 shadow-md">` +
        `<iframe src="https://www.youtube.com/embed/${videoId}" class="absolute top-0 left-0 w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>` +
        `</div>`
      );
      continue;
    }

    // 3. Headers (H1 - H6)
    const h6Match = line.match(/^######\s+(.*)$/);
    const h5Match = line.match(/^#####\s+(.*)$/);
    const h4Match = line.match(/^####\s+(.*)$/);
    const h3Match = line.match(/^###\s+(.*)$/);
    const h2Match = line.match(/^##\s+(.*)$/);
    const h1Match = line.match(/^#\s+(.*)$/);

    if (h1Match || h2Match || h3Match || h4Match || h5Match || h6Match) {
      closeLists();
      flushParagraph();
      
      if (h1Match) result.push(`<h1>${parseInlineMarkdown(h1Match[1])}</h1>`);
      else if (h2Match) result.push(`<h2>${parseInlineMarkdown(h2Match[1])}</h2>`);
      else if (h3Match) result.push(`<h3>${parseInlineMarkdown(h3Match[1])}</h3>`);
      else if (h4Match) result.push(`<h4>${parseInlineMarkdown(h4Match[1])}</h4>`);
      else if (h5Match) result.push(`<h5>${parseInlineMarkdown(h5Match[1])}</h5>`);
      else if (h6Match) result.push(`<h6>${parseInlineMarkdown(h6Match[1])}</h6>`);
      
      continue;
    }

    // 4. Blockquotes
    const bqMatch = line.match(/^>\s*(.*)$/);
    if (bqMatch) {
      closeLists();
      flushParagraph();
      result.push(`<blockquote>${parseInlineMarkdown(bqMatch[1])}</blockquote>`);
      continue;
    }

    // 5. Unordered Lists (- or * or +)
    const ulMatch = line.match(/^[-*+]\s+(.*)$/);
    if (ulMatch) {
      flushParagraph();
      if (inOl) {
        result.push('</ol>');
        inOl = false;
      }
      if (!inUl) {
        result.push('<ul>');
        inUl = true;
      }
      result.push(`<li>${parseInlineMarkdown(ulMatch[1])}</li>`);
      continue;
    }

    // 6. Ordered Lists (1. or 2.)
    const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      flushParagraph();
      if (inUl) {
        result.push('</ul>');
        inUl = false;
      }
      if (!inOl) {
        result.push('<ol>');
        inOl = true;
      }
      result.push(`<li>${parseInlineMarkdown(olMatch[2])}</li>`);
      continue;
    }

    // 7. Horizontal Rule (---, ***, ___)
    if (/^(?:-{3,}|\*{3,}|\_{3,})$/.test(line)) {
      closeLists();
      flushParagraph();
      result.push('<hr />');
      continue;
    }

    // 8. Regular text -> part of active paragraph
    closeLists();
    currentParagraph.push(line);
  }

  // Flush any remaining text/lists
  closeLists();
  flushParagraph();

  return result.join('\n');
}

function parseInlineMarkdown(text: string): string {
  let html = text;

  // 1. Images: ![alt](url) -> parsed first so it doesn't collide with standard link parser
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-xl my-6 max-w-full h-auto" />');

  // 2. Bold: **text** or __text__
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // 3. Italic: *text* or _text_
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');

  // 4. Inline code: `code`
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');

  // 5. Links: [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  return html;
}
