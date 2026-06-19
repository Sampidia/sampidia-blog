import localPosts from '../../backup-posts.json';

export interface Author {
  name: string;
  avatar: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  date: string;
  content: string;
  coverImage: string;
  imageAltText: string;
  metaDescription: string;
  category: string;
  status: string;
  author: Author;
}

const SPREADSHEET_URL =
  process.env.SPREADSHEET_CSV_URL ||
  'https://docs.google.com/spreadsheets/d/1SoZVQQMlgQr_LqOYRUjOMrbsVR-Xu8D-Q4phlP4TPj4/export?format=csv';

const DEFAULT_DROPBOX_URL = 'https://www.dropbox.com/scl/fi/qfvjo4yz662ts8g07a0sk/backup-posts.json?rlkey=b31kgrp0si0ggb8az22h5l073&st=7jckqgo2&dl=1';

function cleanDropboxUrl(url: string): string {
  if (!url) return '';
  if (url.includes('dl=0')) {
    return url.replace('dl=0', 'dl=1');
  }
  return url;
}

/**
 * Parses dates in DD-MM-YYYY or DD/MM/YYYY format (as exported by Google Sheets)
 * into a valid ISO YYYY-MM-DD string that JavaScript's Date() can parse correctly.
 * Falls back to the original string if it's already a valid date.
 */
function parseDateString(rawDate: string): string {
  if (!rawDate) return '';
  // Match DD-MM-YYYY or DD/MM/YYYY
  const ddmmyyyy = rawDate.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  // Match YYYY-MM-DD already (return as-is)
  const yyyymmdd = rawDate.match(/^\d{4}-\d{2}-\d{2}/);
  if (yyyymmdd) return rawDate;
  // Fallback — return as-is and hope it works
  return rawDate;
}

/**
 * Normalises category values from the spreadsheet to the canonical
 * values used in the Next.js routes. Handles singular/plurals, case, etc.
 */
function normalizeCategory(raw: string): string {
  const lower = raw.trim().toLowerCase();
  switch (lower) {
    case 'sport':
    case 'sports':
      return 'Sports';
    case 'job':
    case 'jobs':
      return 'Jobs';
    case 'tech':
    case 'technology':
      return 'Tech';
    case 'news':
      return 'News';
    case 'lifestyle':
    case 'life':
      return 'Lifestyle';
    case 'entertainment':
      return 'Entertainment';
    default:
      // Title-case the raw value as a best-effort fallback
      return raw.trim().charAt(0).toUpperCase() + raw.trim().slice(1).toLowerCase();
  }
}

export function getAuthorForCategory(category: string): Author {
  const cat = category.trim().toLowerCase();
  switch (cat) {
    case 'news':
      return { name: 'Sarah', avatar: '/images/avatars/Sarah.webp' };
    case 'tech':
      return { name: 'Sam', avatar: '/images/avatars/SAM.webp' };
    case 'lifestyle':
      return { name: 'Ruth', avatar: '/images/avatars/Ruth.webp' };
    case 'jobs':
      return { name: 'Joy', avatar: '/images/avatars/Joy.webp' };
    case 'sports':
      return { name: 'John', avatar: '/images/avatars/John.webp' };
    case 'entertainment':
      return { name: 'Olivia', avatar: '/images/avatars/Olivia.webp' };
    default:
      return { name: 'Becky', avatar: '/images/avatars/Becky.webp' };
  }
}

function normalizePost(raw: any): Post {
  const id = String(raw.id || raw.ID || raw.Id || '');
  const title = String(raw.title || raw.Title || raw.TITLE || '');
  const slug = String(raw.slug || raw.Slug || raw.SLUG || '').trim().replace(/^\//, '');
  const rawDate = String(raw.date || raw.Date || raw.DATE || '');
  const date = parseDateString(rawDate);
  const content = String(raw.content || raw.Content || raw.CONTENT || '');
  const coverImage = String(raw.coverImage || raw.coverimage || raw.CoverImage || raw.COVERIMAGE || raw.image || raw.Image || '');
  const imageAltText = String(raw.imageAltText || raw.imagealttext || raw.ImageAltText || raw.IMAGEALTTEXT || raw.alt || raw.Alt || '');
  const metaDescription = String(raw.metaDescription || raw.metadescription || raw.MetaDescription || raw.METADESCRIPTION || raw.description || raw.Description || '');
  const rawCategory = String(raw.category || raw.Category || raw.CATEGORY || 'News');
  const category = normalizeCategory(rawCategory);
  const status = String(raw.status || raw.Status || raw.STATUS || 'published');

  return {
    id,
    title,
    slug,
    date,
    content,
    coverImage: coverImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1200',
    imageAltText: imageAltText || title,
    metaDescription: metaDescription || title,
    category,
    status,
    author: getAuthorForCategory(category)
  };
}

function parseCSVLine(lineText: string): string[] {
  const result: string[] = [];
  let currentValue = '';
  let inQuotes = false;
  for (let i = 0; i < lineText.length; i++) {
    const char = lineText[i];
    const nextChar = lineText[i + 1];
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentValue += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',') {
      if (inQuotes) {
        currentValue += char;
      } else {
        result.push(currentValue);
        currentValue = '';
      }
    } else {
      currentValue += char;
    }
  }
  result.push(currentValue);
  return result;
}

function parseCSV(csvText: string): Record<string, string>[] {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentLine += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
        currentLine += char;
      }
    } else if (char === '\r' || char === '\n') {
      if (inQuotes) {
        currentLine += char;
      } else {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        if (currentLine.trim()) lines.push(currentLine);
        currentLine = '';
      }
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) lines.push(currentLine);

  if (lines.length === 0) return [];
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);

  const result: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseCSVLine(lines[i]);
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header.trim()] = (values[index] || '').trim();
    });
    result.push(obj);
  }
  return result;
}

export async function getPosts(): Promise<Post[]> {
  try {
    const res = await fetch(SPREADSHEET_URL, { next: { revalidate: 3600, tags: ['posts'] } });
    if (!res.ok) throw new Error(`Spreadsheet fetch failed: ${res.status}`);
    const csvText = await res.text();
    const rawPosts = parseCSV(csvText);
    if (rawPosts && rawPosts.length > 0) {
      const posts = rawPosts
        .map(normalizePost)
        .filter(post => post.status.toLowerCase() === 'published' && post.slug && post.title);
      if (posts.length > 0) {
        return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
    }
  } catch (error) {
    console.error('Failed to fetch from Google Sheets, trying Dropbox...', error);
  }

  const dropboxUrl = cleanDropboxUrl(process.env.DROPBOX_BACKUP_URL || process.env.DROPBOX_BACKUP_UR || DEFAULT_DROPBOX_URL);
  if (dropboxUrl) {
    try {
      const res = await fetch(dropboxUrl, { next: { revalidate: 3600, tags: ['posts'] } });
      if (!res.ok) throw new Error('Dropbox fetch failed');
      const rawPosts = await res.json();
      if (Array.isArray(rawPosts)) {
        const posts = rawPosts
          .map(normalizePost)
          .filter(post => post.status.toLowerCase() === 'published' && post.slug && post.title);
        if (posts.length > 0) {
          return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
      }
    } catch (error) {
      console.error('Failed to fetch from Dropbox, trying local JSON...', error);
    }
  }

  const posts = (localPosts as any[])
    .map(normalizePost)
    .filter(post => post.status.toLowerCase() === 'published' && post.slug && post.title);
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const posts = await getPosts();
  return posts.find(p => p.slug.toLowerCase() === slug.toLowerCase()) || null;
}

export async function getPostsByCategory(category: string): Promise<Post[]> {
  const posts = await getPosts();
  return posts.filter(p => p.category.toLowerCase() === category.toLowerCase());
}

export async function getPopularPosts(): Promise<Post[]> {
  const posts = await getPosts();
  return posts.slice(0, 4);
}

export async function getCategories(): Promise<string[]> {
  const posts = await getPosts();
  const categories = new Set(posts.map(p => p.category));
  return Array.from(categories);
}
