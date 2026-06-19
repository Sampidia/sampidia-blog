import { getPosts } from '@/lib/posts';

/**
 * Google News Sitemap
 *
 * Google News sitemaps follow a specific format with the `news:` XML namespace.
 * Key rules from Google:
 * - Only include articles published in the **last 48 hours**
 * - Maximum 1,000 URLs per news sitemap
 * - Must include: publication name, language, publication date, and title
 *
 * @see https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap
 */
export async function GET() {
  try {
    const posts = await getPosts();
    const baseUrl = 'https://sampidia.com';

    // Google News only wants articles from the last 48 hours.
    // Set to start of the day 2 days ago to avoid filtering out day-precision dates.
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    twoDaysAgo.setHours(0, 0, 0, 0);

    const recentPosts = posts.filter((post) => {
      const postDate = new Date(post.date);
      return postDate >= twoDaysAgo;
    });

    const urlEntries = recentPosts
      .slice(0, 1000) // Google News sitemap limit
      .map((post) => {
        const title = escapeXml(post.title);
        const postUrl = `${baseUrl}/${post.slug}`;
        // Format date as W3C datetime (YYYY-MM-DD or full ISO)
        const pubDate = new Date(post.date).toISOString();

        return `
  <url>
    <loc>${postUrl}</loc>
    <news:news>
      <news:publication>
        <news:name>SamPidia</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${title}</news:title>
    </news:news>
  </url>`;
      })
      .join('');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${urlEntries}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=900, s-maxage=600', // 15min cache — news changes fast
      },
    });
  } catch (error) {
    console.error('Error generating Google News sitemap:', error);
    return new Response('Error generating news sitemap', { status: 500 });
  }
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
