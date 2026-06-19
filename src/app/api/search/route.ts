import { NextResponse } from 'next/server';
import { getPosts } from '@/lib/posts';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim().toLowerCase() || '';

    if (!query) {
      return NextResponse.json([]);
    }

    const posts = await getPosts();
    
    // Filter posts matching title, description, category, or content
    const filtered = posts
      .filter((post) => {
        return (
          post.title.toLowerCase().includes(query) ||
          post.category.toLowerCase().includes(query) ||
          post.metaDescription.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query)
        );
      })
      .slice(0, 8) // Limit to top 8 search results for speed and design neatness
      .map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        category: post.category,
        coverImage: post.coverImage,
        date: post.date,
        authorName: post.author.name,
      }));

    return NextResponse.json(filtered, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=30', // cache short-term for fast typing/backspacing
      },
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
  }
}
