import localPosts from '../../backup-posts.json';

export interface Author {
  name: string;
  avatar: string;
}

/** Full post including HTML content — only used on individual post pages. */
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

/**
 * Post metadata without the HTML content body.
 * Used everywhere except the individual post page (homepage, category pages,
 * sidebar, search, RSS feed, sitemaps). Keeps the in-memory cache small so
 * the server stays well under the 512 MB Render free-tier limit.
 */
export type PostMeta = Omit<Post, 'content'>;

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

/**
 * Builds a PostMeta object (no content) from a raw CSV row dict.
 * Used when populating the shared in-memory list cache.
 */
function normalizePostMeta(raw: Record<string, string>): PostMeta {
  const id = raw.id || raw.ID || raw.Id || '';
  const title = raw.title || raw.Title || raw.TITLE || '';
  const slug = (raw.slug || raw.Slug || raw.SLUG || '').trim().replace(/^\//, '');
  const rawDate = raw.date || raw.Date || raw.DATE || '';
  const date = parseDateString(rawDate);
  const coverImage = raw.coverImage || raw.coverimage || raw.CoverImage || raw.COVERIMAGE || raw.image || raw.Image || '';
  const imageAltText = raw.imageAltText || raw.imagealttext || raw.ImageAltText || raw.IMAGEALTTEXT || raw.alt || raw.Alt || '';
  const metaDescription = raw.metaDescription || raw.metadescription || raw.MetaDescription || raw.METADESCRIPTION || raw.description || raw.Description || '';
  const rawCategory = raw.category || raw.Category || raw.CATEGORY || 'News';
  const category = normalizeCategory(rawCategory);
  const status = raw.status || raw.Status || raw.STATUS || 'published';

  return {
    id,
    title,
    slug,
    date,
    coverImage: coverImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1200',
    imageAltText: imageAltText || title,
    metaDescription: metaDescription || title,
    category,
    status,
    author: getAuthorForCategory(category),
  };
}

/**
 * Builds a full Post (with content) from a raw CSV row dict.
 * Only used by getPostBySlug() when a specific post page is requested.
 */
function normalizePostFull(raw: Record<string, string>): Post {
  const meta = normalizePostMeta(raw);
  const content = raw.content || raw.Content || raw.CONTENT || '';
  return { ...meta, content };
}

/** Legacy shim — kept for the local backup-posts.json path only. */
function normalizePost(raw: any): Post {
  return normalizePostFull(raw as Record<string, string>);
}

/**
 * Single-pass state-machine CSV parser.
 * Returns PostMeta[] — the content column is intentionally skipped to keep
 * memory usage low (1301 posts × ~10 KB content each ≈ 13 MB saved per process).
 */
function parseCSVToPosts(csvText: string): PostMeta[] {
  const posts: PostMeta[] = [];
  let headers: string[] = [];
  const currentRow: string[] = [];
  let inQuotes = false;
  let valStart = 0;
  let quoteEnd = 0;
  let isQuoted = false;
  let i = 0;
  const n = csvText.length;

  while (i < n) {
    const c = csvText[i];
    if (c === '"') {
      if (!inQuotes) {
        inQuotes = true;
        isQuoted = true;
        valStart = i + 1;
      } else {
        if (i + 1 < n && csvText[i + 1] === '"') {
          i++; // skip escaped quote ""
        } else {
          inQuotes = false;
          quoteEnd = i;
        }
      }
    } else if (!inQuotes) {
      if (c === ',') {
        const val = isQuoted
          ? csvText.slice(valStart, quoteEnd).replace(/""/g, '"')
          : csvText.slice(valStart, i);
        currentRow.push(val);
        valStart = i + 1;
        isQuoted = false;
      } else if (c === '\n' || c === '\r') {
        const val = isQuoted
          ? csvText.slice(valStart, quoteEnd).replace(/""/g, '"')
          : csvText.slice(valStart, i);
        currentRow.push(val);
        if (c === '\r' && i + 1 < n && csvText[i + 1] === '\n') {
          i++;
        }
        valStart = i + 1;
        isQuoted = false;

        if (headers.length === 0) {
          headers = currentRow.map(h => h.trim());
        } else if (currentRow.some(x => x.trim() !== '')) {
          const rowDict: Record<string, string> = {};
          for (let idx = 0; idx < headers.length; idx++) {
            rowDict[headers[idx]] = idx < currentRow.length ? currentRow[idx] : '';
          }
          const post = normalizePostMeta(rowDict);
          if (post.status.toLowerCase() === 'published' && post.slug && post.title) {
            posts.push(post);
          }
        }
        currentRow.length = 0;
      }
    }
    i++;
  }

  // Handle final row if CSV does not end with a trailing newline
  if (currentRow.length > 0 && headers.length > 0) {
    const val = isQuoted
      ? csvText.slice(valStart, quoteEnd).replace(/""/g, '"')
      : csvText.slice(valStart, n);
    currentRow.push(val);
    if (currentRow.some(x => x.trim() !== '')) {
      const rowDict: Record<string, string> = {};
      for (let idx = 0; idx < headers.length; idx++) {
        rowDict[headers[idx]] = idx < currentRow.length ? currentRow[idx] : '';
      }
      const post = normalizePostMeta(rowDict);
      if (post.status.toLowerCase() === 'published' && post.slug && post.title) {
        posts.push(post);
      }
    }
  }

  return posts;
}

/**
 * Scans the CSV for the first row whose slug matches `targetSlug` and returns
 * a full Post (with content). Returns null if no matching row is found.
 * Uses the same state-machine parser as parseCSVToPosts but short-circuits
 * as soon as the target row is found.
 */
function parseCSVFindSlug(csvText: string, targetSlug: string): Post | null {
  let headers: string[] = [];
  const currentRow: string[] = [];
  let inQuotes = false;
  let valStart = 0;
  let quoteEnd = 0;
  let isQuoted = false;
  let i = 0;
  const n = csvText.length;
  const lowerTarget = targetSlug.toLowerCase();

  while (i < n) {
    const c = csvText[i];
    if (c === '"') {
      if (!inQuotes) {
        inQuotes = true;
        isQuoted = true;
        valStart = i + 1;
      } else {
        if (i + 1 < n && csvText[i + 1] === '"') {
          i++;
        } else {
          inQuotes = false;
          quoteEnd = i;
        }
      }
    } else if (!inQuotes) {
      if (c === ',') {
        const val = isQuoted
          ? csvText.slice(valStart, quoteEnd).replace(/""/g, '"')
          : csvText.slice(valStart, i);
        currentRow.push(val);
        valStart = i + 1;
        isQuoted = false;
      } else if (c === '\n' || c === '\r') {
        const val = isQuoted
          ? csvText.slice(valStart, quoteEnd).replace(/""/g, '"')
          : csvText.slice(valStart, i);
        currentRow.push(val);
        if (c === '\r' && i + 1 < n && csvText[i + 1] === '\n') {
          i++;
        }
        valStart = i + 1;
        isQuoted = false;

        if (headers.length === 0) {
          headers = currentRow.map(h => h.trim());
        } else if (currentRow.some(x => x.trim() !== '')) {
          const rowDict: Record<string, string> = {};
          for (let idx = 0; idx < headers.length; idx++) {
            rowDict[headers[idx]] = idx < currentRow.length ? currentRow[idx] : '';
          }
          const slugVal = (rowDict.slug || rowDict.Slug || rowDict.SLUG || '').trim().replace(/^\//, '');
          if (slugVal.toLowerCase() === lowerTarget) {
            return normalizePostFull(rowDict);
          }
        }
        currentRow.length = 0;
      }
    }
    i++;
  }

  // Handle final row
  if (currentRow.length > 0 && headers.length > 0) {
    const val = isQuoted
      ? csvText.slice(valStart, quoteEnd).replace(/""/g, '"')
      : csvText.slice(valStart, n);
    currentRow.push(val);
    if (currentRow.some(x => x.trim() !== '')) {
      const rowDict: Record<string, string> = {};
      for (let idx = 0; idx < headers.length; idx++) {
        rowDict[headers[idx]] = idx < currentRow.length ? currentRow[idx] : '';
      }
      const slugVal = (rowDict.slug || rowDict.Slug || rowDict.SLUG || '').trim().replace(/^\//, '');
      if (slugVal.toLowerCase() === lowerTarget) {
        return normalizePostFull(rowDict);
      }
    }
  }

  return null;
}

let cachedPosts: PostMeta[] | null = null;
let cacheExpiry = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes (instrumentation refreshes every 4 min)

/** Per-slug cache for full post content. Avoids re-fetching the 14 MB CSV
 *  on every individual post page visit. Keyed by lowercase slug. */
const slugContentCache = new Map<string, { post: Post; expiry: number }>();
const SLUG_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/** Wraps fetch with a hard timeout so a stalled Google Sheets connection
 *  fails fast instead of hanging a user request for 60+ seconds. */
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 25_000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

const SHEETS_FETCH_OPTIONS: RequestInit = {
  cache: 'no-store',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/csv,text/plain,*/*',
  },
};

export function clearPostsCache() {
  cachedPosts = null;
  cacheExpiry = 0;
  slugContentCache.clear();
}

/**
 * Returns all published PostMeta objects (no content field).
 * Results are cached in-process for CACHE_TTL to avoid re-fetching on
 * every request. The cache is intentionally content-free so that 1301 posts
 * only occupy ~3–4 MB instead of ~18+ MB.
 */
export async function getPosts(): Promise<PostMeta[]> {
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build';
  const now = Date.now();
  if (cachedPosts && (isBuild || now < cacheExpiry)) {
    return cachedPosts;
  }

  let posts: PostMeta[] | null = null;

  try {
    const res = await fetchWithTimeout(SPREADSHEET_URL, SHEETS_FETCH_OPTIONS);

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
            .map((r: any) => normalizePostMeta(r as Record<string, string>))
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
      .map((r: any) => normalizePostMeta(r as Record<string, string>))
      .filter(post => post.status.toLowerCase() === 'published' && post.slug && post.title)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  cachedPosts = posts;
  cacheExpiry = Date.now() + CACHE_TTL;
  return posts;
}

/**
 * Returns a single full Post (with content) for the given slug.
 *
 * Strategy:
 *  1. Check the per-slug in-memory cache (30-min TTL) — instant if hit.
 *  2. Fetch the CSV with a 25-second timeout and scan for the slug row.
 *  3. Fall back to Dropbox JSON backup.
 *  4. Fall back to local backup-posts.json.
 *
 * The slug cache means repeated visits to the same post page never re-fetch
 * the 14 MB CSV, and timeouts fail fast instead of hanging the user.
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const lowerSlug = slug.toLowerCase();

  // 1. Check per-slug content cache
  const cached = slugContentCache.get(lowerSlug);
  if (cached && Date.now() < cached.expiry) {
    return cached.post;
  }

  // 2. Try Google Sheets CSV with timeout
  try {
    const res = await fetchWithTimeout(SPREADSHEET_URL, SHEETS_FETCH_OPTIONS, 25_000);
    if (res.ok) {
      const csvText = await res.text();
      if (!csvText.trim().startsWith('<!DOCTYPE') && !csvText.trim().startsWith('<html')) {
        const post = parseCSVFindSlug(csvText, slug);
        if (post && post.status.toLowerCase() === 'published') {
          slugContentCache.set(lowerSlug, { post, expiry: Date.now() + SLUG_CACHE_TTL });
          return post;
        }
      }
    }
  } catch (error) {
    console.error(`[getPostBySlug] Google Sheets fetch failed for slug "${slug}":`, error);
  }

  // 3. Fall back to Dropbox JSON backup
  const dropboxUrl = cleanDropboxUrl(process.env.DROPBOX_BACKUP_URL || process.env.DROPBOX_BACKUP_UR || DEFAULT_DROPBOX_URL);
  if (dropboxUrl) {
    try {
      const res = await fetchWithTimeout(dropboxUrl, { cache: 'no-store' }, 15_000);
      if (res.ok) {
        const rawPosts = await res.json();
        if (Array.isArray(rawPosts)) {
          const match = rawPosts
            .map((r: any) => normalizePost(r))
            .find(p => p.slug.toLowerCase() === lowerSlug && p.status.toLowerCase() === 'published');
          if (match) {
            slugContentCache.set(lowerSlug, { post: match, expiry: Date.now() + SLUG_CACHE_TTL });
            return match;
          }
        }
      }
    } catch (error) {
      console.error(`[getPostBySlug] Dropbox fetch failed for slug "${slug}":`, error);
    }
  }

  // 4. Fall back to local JSON
  const localMatch = (localPosts as any[])
    .map((r: any) => normalizePost(r))
    .find(p => p.slug.toLowerCase() === lowerSlug && p.status.toLowerCase() === 'published');
  return localMatch || null;
}

export async function getPostsByCategory(category: string): Promise<PostMeta[]> {
  const posts = await getPosts();
  return posts.filter(p => p.category.toLowerCase() === category.toLowerCase());
}

export async function getPopularPosts(): Promise<PostMeta[]> {
  const posts = await getPosts();
  return posts.slice(0, 4);
}

export async function getCategories(): Promise<string[]> {
  const posts = await getPosts();
  const categories = new Set(posts.map(p => p.category));
  return Array.from(categories);
}
