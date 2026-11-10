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
  let candidate = rawDate;
  // Match DD-MM-YYYY or DD/MM/YYYY
  const ddmmyyyy = rawDate.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    candidate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  // Validate the resulting date — return '' if it's unparseable
  const d = new Date(candidate);
  if (isNaN(d.getTime())) return '';
  return candidate;
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

function parseCSVToPosts(csvText: string): Post[] {
  const len = csvText.length;
  let i = 0;

  // 1. Parse header row
  const headers: string[] = [];
  while (i < len) {
    let value = '';
    if (csvText[i] === '"') {
      i++; // skip opening quote
      const start = i;
      while (i < len) {
        if (csvText[i] === '"') {
          if (csvText[i + 1] === '"') {
            i += 2;
          } else {
            break;
          }
        } else {
          i++;
        }
      }
      value = csvText.slice(start, i).replace(/""/g, '"');
      if (csvText[i] === '"') i++; // skip closing quote
    } else {
      const start = i;
      while (i < len && csvText[i] !== ',' && csvText[i] !== '\r' && csvText[i] !== '\n') {
        i++;
      }
      value = csvText.slice(start, i);
    }

    headers.push(value.trim());

    if (i < len && csvText[i] === ',') {
      i++;
    } else if (i < len && (csvText[i] === '\r' || csvText[i] === '\n')) {
      if (csvText[i] === '\r' && csvText[i + 1] === '\n') i++;
      i++;
      break;
    }
  }

  // 2. Parse data rows directly into Post objects (streaming without intermediate 2D arrays)
  const posts: Post[] = [];
  const headerCount = headers.length;

  while (i < len) {
    const row: Record<string, string> = {};
    let colIndex = 0;
    let hasContent = false;

    while (i < len && colIndex < headerCount) {
      let value = '';
      if (csvText[i] === '"') {
        i++; // skip opening quote
        const start = i;
        while (i < len) {
          if (csvText[i] === '"') {
            if (csvText[i + 1] === '"') {
              i += 2;
            } else {
              break;
            }
          } else {
            i++;
          }
        }
        value = csvText.slice(start, i).replace(/""/g, '"');
        if (csvText[i] === '"') i++; // skip closing quote
      } else {
        const start = i;
        while (i < len && csvText[i] !== ',' && csvText[i] !== '\r' && csvText[i] !== '\n') {
          i++;
        }
        value = csvText.slice(start, i);
      }

      if (value.trim() !== '') hasContent = true;
      const header = headers[colIndex];
      if (header) {
        row[header] = value;
      }
      colIndex++;

      if (i < len && csvText[i] === ',') {
        i++;
      } else if (i < len && (csvText[i] === '\r' || csvText[i] === '\n')) {
        if (csvText[i] === '\r' && csvText[i + 1] === '\n') i++;
        i++;
        break;
      }
    }

    // Skip any extra trailing newlines
    while (i < len && (csvText[i] === '\r' || csvText[i] === '\n')) {
      i++;
    }

    if (hasContent) {
      const post = normalizePost(row);
      if (post.status.toLowerCase() === 'published' && post.slug && post.title) {
        posts.push(post);
      }
    }
  }

  return posts;
}

let cachedPosts: Post[] | null = null;
let cacheExpiry = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function clearPostsCache() {
  cachedPosts = null;
  cacheExpiry = 0;
}

export async function getPosts(): Promise<Post[]> {
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build';
  const now = Date.now();
  if (cachedPosts && (isBuild || now < cacheExpiry)) {
    return cachedPosts;
  }

  let posts: Post[] | null = null;

  try {
    const res = await fetch(SPREADSHEET_URL, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/csv,text/plain,*/*'
      }
    });

    console.log(`[Google Sheets] Response Status: ${res.status}, Type: ${res.headers.get('content-type')}`);

    if (!res.ok) throw new Error(`Spreadsheet fetch failed: ${res.status}`);
    const csvText = await res.text();

    console.log(`[Google Sheets] Received ${csvText.length} characters. Start: ${csvText.substring(0, 80).replace(/\n/g, ' ')}`);

    if (csvText.trim().startsWith('<!DOCTYPE') || csvText.trim().startsWith('<html')) {
      throw new Error(`Google returned an HTML page instead of CSV: ${csvText.substring(0, 150)}`);
    }

    const parsed = parseCSVToPosts(csvText);
    console.log(`[Google Sheets] Successfully parsed ${parsed.length} published posts.`);
    if (parsed.length > 0) {
      posts = parsed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  } catch (error) {
    console.error('Failed to fetch from Google Sheets, trying Dropbox...', error);
  }

  if (!posts) {
    const dropboxUrl = cleanDropboxUrl(process.env.DROPBOX_BACKUP_URL || process.env.DROPBOX_BACKUP_UR || DEFAULT_DROPBOX_URL);
    if (dropboxUrl) {
      try {
        const res = await fetch(dropboxUrl, { cache: 'no-store' });
        if (!res.ok) throw new Error('Dropbox fetch failed');
        const rawPosts = await res.json();
        if (Array.isArray(rawPosts)) {
          const parsed = rawPosts
            .map(normalizePost)
            .filter(post => post.status.toLowerCase() === 'published' && post.slug && post.title);
          if (parsed.length > 0) {
            posts = parsed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          }
        }
      } catch (error) {
        console.error('Failed to fetch from Dropbox, trying local JSON...', error);
      }
    }
  }

  if (!posts) {
    posts = (localPosts as any[])
      .map(normalizePost)
      .filter(post => post.status.toLowerCase() === 'published' && post.slug && post.title)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  cachedPosts = posts;
  cacheExpiry = Date.now() + CACHE_TTL;
  return posts;
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
