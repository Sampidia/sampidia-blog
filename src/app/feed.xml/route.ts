import { getPosts } from '@/lib/posts';

export async function GET() {
  try {
    const posts = await getPosts();
    const baseUrl = 'https://sampidia.com';

    const feedItems = posts
      .slice(0, 50) // Limit to latest 50 posts for RSS efficiency
      .map((post) => {
        const title = escapeXml(post.title);
        const description = escapeXml(post.metaDescription || post.title);
        const url = `${baseUrl}/${post.slug}`;
        const pubDate = new Date(post.date).toUTCString();
        const author = escapeXml(post.author?.name || 'SamPidia Team');
        const category = escapeXml(post.category);

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

    const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
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
