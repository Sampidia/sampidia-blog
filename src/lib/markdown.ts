import fs from 'fs/promises';
import path from 'path';

export async function getMarkdownContent(fileName: string): Promise<string> {
  try {
    let content = '';
    if (fileName === 'About us.md') {
      content = await fs.readFile(path.join(process.cwd(), 'About us.md'), 'utf-8');
    } else if (fileName === 'Disclaimer.md') {
      content = await fs.readFile(path.join(process.cwd(), 'Disclaimer.md'), 'utf-8');
    } else if (fileName === 'DMCA Statement.md') {
      content = await fs.readFile(path.join(process.cwd(), 'DMCA Statement.md'), 'utf-8');
    } else if (fileName === 'Privacy Policy.md') {
      content = await fs.readFile(path.join(process.cwd(), 'Privacy Policy.md'), 'utf-8');
    } else {
      content = await fs.readFile(path.join(process.cwd(), fileName), 'utf-8');
    }
    return content;
  } catch (error) {
    console.error(`Error reading markdown file ${fileName}:`, error);
    return '';
  }
}

export function parseMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';

  // Strip metadata front-matter if present:
  //   slug: /some-path
  //   Content: (optional inline text that becomes part of body)
  let cleanText = markdown
    .replace(/^slug:\s*\/[^\n]*\n?/im, '')          // remove "slug: /..." line
    .replace(/^Content:\s*/im, '')                   // remove "Content:" prefix (with or without trailing text)
    .trim();

  if (!cleanText) return '';

  // If the content already looks like HTML, return it with YouTube iframes
  // replaced by facades — this covers backup-posts.json HTML content.
  const isHtml = /^\s*<[a-zA-Z0-9]+[^>]*>/.test(cleanText);
  if (isHtml) {
    return applyYoutubeFacadeToHtml(cleanText);
  }

  const lines = cleanText.split('\n');
  const result: string[] = [];

  let inUl = false;
  let inOl = false;
  let currentParagraph: string[] = [];

  const closeLists = () => {
    if (inUl) { result.push('</ul>'); inUl = false; }
    if (inOl) { result.push('</ol>'); inOl = false; }
  };

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const pText = currentParagraph.join(' ').trim();
      if (pText) result.push(`<p>${parseInlineMarkdown(pText)}</p>`);
      currentParagraph = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Empty line → end current block
    if (!line) {
      closeLists();
      flushParagraph();
      continue;
    }

    // ── Markdown Table Parsing ───────────────────────────────────────────────
    if (line.startsWith('|') && line.endsWith('|')) {
      const nextLine = lines[i + 1];
      if (nextLine && isSeparatorRow(nextLine)) {
        closeLists();
        flushParagraph();

        const headerCells = parseTableRow(line);
        const alignments = getAlignments(nextLine);

        const bodyRows: string[][] = [];
        let j = i + 2;
        while (j < lines.length) {
          const nextRow = lines[j].trim();
          if (nextRow.startsWith('|') && nextRow.endsWith('|')) {
            bodyRows.push(parseTableRow(nextRow));
            j++;
          } else {
            break;
          }
        }

        let tableHtml = '<div class="overflow-x-auto my-6">\n<table>\n';
        
        // Header
        tableHtml += '<thead>\n<tr>\n';
        headerCells.forEach((cell, idx) => {
          const align = alignments[idx] ? ` align="${alignments[idx]}"` : '';
          const style = alignments[idx] ? ` style="text-align: ${alignments[idx]}"` : '';
          tableHtml += `<th${align}${style}>${parseInlineMarkdown(cell)}</th>\n`;
        });
        tableHtml += '</tr>\n</thead>\n';

        // Body
        if (bodyRows.length > 0) {
          tableHtml += '<tbody>\n';
          bodyRows.forEach(row => {
            tableHtml += '<tr>\n';
            for (let idx = 0; idx < headerCells.length; idx++) {
              const cell = row[idx] || '';
              const align = alignments[idx] ? ` align="${alignments[idx]}"` : '';
              const style = alignments[idx] ? ` style="text-align: ${alignments[idx]}"` : '';
              tableHtml += `<td${align}${style}>${parseInlineMarkdown(cell)}</td>\n`;
            }
            tableHtml += '</tr>\n';
          });
          tableHtml += '</tbody>\n';
        }

        tableHtml += '</table>\n</div>';
        result.push(tableHtml);
        
        i = j - 1; // Advance outer loop index to the last parsed row
        continue;
      }
    }

    // ── YouTube Facade (Lazy Embed) ──────────────────────────────────────────
    // A line that is just a YouTube URL becomes a facade: a clickable thumbnail
    // that only loads the real iframe (and YouTube's heavy JS) on user click.
    // Uses youtube-nocookie.com to avoid third-party tracking cookies.
    const ytMatch = line.match(
      /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})(?:\S+)?$/i
    );
    if (ytMatch) {
      closeLists();
      flushParagraph();
      const videoId = ytMatch[1];
      const thumbUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      // The onclick replaces the facade with the real iframe in-place.
      // autoplay=1 starts playback immediately after the user clicks.
      result.push(
        `<div class="yt-facade relative w-full aspect-video rounded-xl overflow-hidden my-6 bg-slate-900 shadow-md cursor-pointer" ` +
        `onclick="(function(el){` +
          `var ifr=document.createElement('iframe');` +
          `ifr.src='https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1';` +
          `ifr.title='YouTube video player';` +
          `ifr.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';` +
          `ifr.allowFullscreen=true;` +
          `ifr.style.cssText='position:absolute;top:0;left:0;width:100%;height:100%;border:0;';` +
          `el.innerHTML='';` +
          `el.appendChild(ifr);` +
          `el.onclick=null;` +
        `})(this)" ` +
        `aria-label="Play YouTube video" role="button" tabindex="0" ` +
        `onkeydown="if(event.key==='Enter'||event.key===' ')this.click()">` +
          `<img ` +
            `src="${thumbUrl}" ` +
            `alt="YouTube video thumbnail" ` +
            `loading="lazy" ` +
            `decoding="async" ` +
            `style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" />` +
          `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.25);">` +
            `<div style="width:68px;height:48px;background:#ff0000;border-radius:12px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 24px rgba(0,0,0,0.5);transition:transform 0.15s;">` +
              `<svg viewBox="0 0 24 24" width="28" height="28" fill="white"><polygon points="9.5,7.5 9.5,16.5 17,12"/></svg>` +
            `</div>` +
          `</div>` +
        `</div>`
      );
      continue;
    }

    // ── Headings H1–H6 ──────────────────────────────────────────────────────
    // Use (?!#) negative lookahead to match EXACT heading levels.
    // \s* allows headings with NO space (e.g. ##Heading) as well as ## Heading.
    const h6Match = line.match(/^######(?!#)\s*(.*)/);
    const h5Match = line.match(/^#####(?!#)\s*(.*)/);
    const h4Match = line.match(/^####(?!#)\s*(.*)/);
    const h3Match = line.match(/^###(?!#)\s*(.*)/);
    const h2Match = line.match(/^##(?!#)\s*(.*)/);
    const h1Match = line.match(/^#(?!#)\s*(.*)/);

    if (h6Match || h5Match || h4Match || h3Match || h2Match || h1Match) {
      closeLists();
      flushParagraph();
      if      (h6Match) result.push(`<h6>${parseInlineMarkdown(h6Match[1])}</h6>`);
      else if (h5Match) result.push(`<h5>${parseInlineMarkdown(h5Match[1])}</h5>`);
      else if (h4Match) result.push(`<h4>${parseInlineMarkdown(h4Match[1])}</h4>`);
      else if (h3Match) result.push(`<h3>${parseInlineMarkdown(h3Match[1])}</h3>`);
      else if (h2Match) result.push(`<h2>${parseInlineMarkdown(h2Match[1])}</h2>`);
      else if (h1Match) result.push(`<h1>${parseInlineMarkdown(h1Match[1])}</h1>`);
      continue;
    }

    // ── Blockquote ──────────────────────────────────────────────────────────
    const bqMatch = line.match(/^>\s*(.*)/);
    if (bqMatch) {
      closeLists();
      flushParagraph();
      result.push(`<blockquote>${parseInlineMarkdown(bqMatch[1])}</blockquote>`);
      continue;
    }

    // ── Unordered List (-, *, +) ────────────────────────────────────────────
    const ulMatch = line.match(/^[-*+]\s+(.*)/);
    if (ulMatch) {
      flushParagraph();
      if (inOl) { result.push('</ol>'); inOl = false; }
      if (!inUl) { result.push('<ul>'); inUl = true; }
      result.push(`<li>${parseInlineMarkdown(ulMatch[1])}</li>`);
      continue;
    }

    // ── Ordered List (1. 2. …) ─────────────────────────────────────────────
    const olMatch = line.match(/^\d+\.\s+(.*)/);
    if (olMatch) {
      flushParagraph();
      if (inUl) { result.push('</ul>'); inUl = false; }
      if (!inOl) { result.push('<ol>'); inOl = true; }
      result.push(`<li>${parseInlineMarkdown(olMatch[1])}</li>`);
      continue;
    }

    // ── Horizontal Rule (---, ***, ___) ────────────────────────────────────
    if (/^(?:-{3,}|\*{3,}|_{3,})$/.test(line)) {
      closeLists();
      flushParagraph();
      result.push('<hr />');
      continue;
    }

    // ── Regular paragraph text ──────────────────────────────────────────────
    closeLists();
    currentParagraph.push(line);
  }

  // Flush any remaining open blocks
  closeLists();
  flushParagraph();

  return result.join('\n');
}

// ── Table Parsing Helpers ──────────────────────────────────────────────────
function isSeparatorRow(line: string): boolean {
  if (!line) return false;
  const trimmed = line.trim();
  if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) return false;
  const content = trimmed.slice(1, -1);
  const cells = content.split(/(?<!\\)\|/);
  if (cells.length === 0) return false;
  return cells.every(cell => /^\s*:?-+\s*:?\s*$/.test(cell));
}

function getAlignments(line: string): string[] {
  const trimmed = line.trim();
  const content = trimmed.slice(1, -1);
  const cells = content.split(/(?<!\\)\|/);
  return cells.map(cell => {
    const c = cell.trim();
    const left = c.startsWith(':');
    const right = c.endsWith(':');
    if (left && right) return 'center';
    if (right) return 'right';
    if (left) return 'left';
    return '';
  });
}

function parseTableRow(line: string): string[] {
  const trimmed = line.trim();
  const content = trimmed.slice(1, -1);
  const cells = content.split(/(?<!\\)\|/);
  return cells.map(cell => cell.trim().replace(/\\\|/g, '|'));
}

// ── Inline Markdown ────────────────────────────────────────────────────────
function parseInlineMarkdown(text: string): string {
  let html = text;

  // Images first so they don't get caught by the link parser
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" class="rounded-xl my-6 max-w-full h-auto" />');

  // Bold (**text** or __text__)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g,     '<strong>$1</strong>');

  // Italic (*text* or _text_)
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g,   '<em>$1</em>');

  // Inline code (`code`)
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');

  // Links ([text](url))
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  return html;
}

// ── YouTube Facade Helper ──────────────────────────────────────────────────
// Replaces any eager YouTube <iframe> found inside already-HTML content with
// the same click-to-load facade used for markdown YouTube URL lines.
function applyYoutubeFacadeToHtml(html: string): string {
  // Match <iframe> tags whose src points to youtube.com or youtube-nocookie.com
  return html.replace(
    /<iframe[^>]*src=["']https?:\/\/(?:www\.)?(?:youtube(?:-nocookie)?\.com)\/embed\/([a-zA-Z0-9_-]{11})[^"']*["'][^>]*(?:\/>|><\/iframe>)/gi,
    (_match, videoId) => {
      const thumbUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      return (
        `<div class="yt-facade relative w-full aspect-video rounded-xl overflow-hidden my-6 bg-slate-900 shadow-md cursor-pointer" ` +
        `onclick="(function(el){` +
          `var ifr=document.createElement('iframe');` +
          `ifr.src='https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1';` +
          `ifr.title='YouTube video player';` +
          `ifr.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';` +
          `ifr.allowFullscreen=true;` +
          `ifr.style.cssText='position:absolute;top:0;left:0;width:100%;height:100%;border:0;';` +
          `el.innerHTML='';` +
          `el.appendChild(ifr);` +
          `el.onclick=null;` +
        `})(this)" ` +
        `aria-label="Play YouTube video" role="button" tabindex="0" ` +
        `onkeydown="if(event.key==='Enter'||event.key===' ')this.click()">` +
          `<img ` +
            `src="${thumbUrl}" ` +
            `alt="YouTube video thumbnail" ` +
            `loading="lazy" ` +
            `decoding="async" ` +
            `style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" />` +
          `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.25);">` +
            `<div style="width:68px;height:48px;background:#ff0000;border-radius:12px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 24px rgba(0,0,0,0.5);transition:transform 0.15s;">` +
              `<svg viewBox="0 0 24 24" width="28" height="28" fill="white"><polygon points="9.5,7.5 9.5,16.5 17,12"/></svg>` +
            `</div>` +
          `</div>` +
        `</div>`
      );
    }
  );
}
