import { getPosts } from '@/lib/posts';

export async function GET() {
  try {
    const posts = await getPosts();
    const baseUrl = 'https://sampidia.com';

    const feedItems = posts
      .slice(0, 50) // Limit to latest 50 posts for RSS efficiency
      .map((post) => {
        const title = cdata(sanitizeXml(post.title));
        const description = cdata(sanitizeXml(post.metaDescription || post.title));
        const url = `${baseUrl}/${post.slug}`;
        const rawDate = post.date ? new Date(post.date) : null;
        const pubDate = rawDate && !isNaN(rawDate.getTime()) ? rawDate.toUTCString() : new Date().toUTCString();
        const author = sanitizeXml(post.author?.name || 'SamPidia Team');
        const category = sanitizeXml(post.category);

        return `
    <item>
      <title>${title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
      <author>sampidiablog@gmail.com (${author})</author>
      <category>${category}</category>
    </item>`;
      })
      .join('');

    const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>SamPidia</title>
    <link>${baseUrl}</link>
    <description>Your premier hub for breaking news, tech trends, sports coverage, and lifestyle content from Nigeria and Africa.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${feedItems}
  </channel>
</rss>`;

    return new Response(rssFeed, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=1800',
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new Response('Error generating feed', { status: 500 });
  }
}

/**
 * Wraps text in a CDATA section, safely escaping any embedded "]]>" sequences.
 * This lets ANY character appear in XML content without escaping.
 */
function cdata(text: string): string {
  // Escape the only sequence that can break out of CDATA
  return `<![CDATA[${text.replace(/\]\]>/g, ']]]]><![CDATA[>')}]]>`;
}

/**
 * Strips characters that are illegal in XML 1.0 regardless of encoding:
 *   - Control chars: U+0000–U+0008, U+000B, U+000C, U+000E–U+001F, U+007F
 *   - Windows-1252 "smart" chars that appear as invalid bytes in UTF-8 streams
 */
function sanitizeXml(text: string): string {
  if (!text) return '';
  return text
    // Remove XML 1.0 illegal control characters (keep \t \n \r)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize Windows-1252 curly quotes / dashes to their ASCII equivalents
    .replace(/[\u2018\u2019]/g, "'")   // ' '  → '
    .replace(/[\u201C\u201D]/g, '"')   // " "  → "
    .replace(/[\u2013\u2014]/g, '-');  // – —  → -
}
