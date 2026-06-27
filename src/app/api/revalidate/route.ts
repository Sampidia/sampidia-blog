import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  const slug = request.nextUrl.searchParams.get('slug');
  const category = request.nextUrl.searchParams.get('category');

  // Verify the secret token
  const expectedSecret = process.env.REVALIDATE_SECRET;
  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json(
      { message: 'Invalid token or secret not configured' },
      { status: 401 }
    );
  }

  try {
    // 1. Purge the main fetch cache for posts (so Next.js fetches fresh data from Google Sheets)
    revalidateTag('posts');

    // 2. Perform targeted revalidation of paths
    // Always revalidate the homepage to show the new post list
    revalidatePath('/', 'page');

    // Always revalidate the RSS feed and News Sitemap
    revalidatePath('/feed.xml', 'page');
    revalidatePath('/news-sitemap.xml', 'page');

    // Revalidate the specific post path if provided
    if (slug) {
      const cleanSlug = slug.trim().replace(/^\//, '');
      revalidatePath(`/${cleanSlug}`, 'page');
    }

    // Revalidate the category page if provided
    if (category) {
      const cleanCategory = category.trim().toLowerCase();
      revalidatePath(`/${cleanCategory}`, 'page');
    }

    // Fallback: If no parameters are provided (e.g. manual full sync), perform layout revalidation
    if (!slug && !category) {
      revalidatePath('/', 'layout');
    }

    return NextResponse.json({ 
      revalidated: true, 
      slug: slug || null, 
      category: category || null,
      now: Date.now() 
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: 'Error revalidating', error: err.message },
      { status: 500 }
    );
  }
}

// Support POST requests (often sent by automation tools like n8n)
export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  let slug = request.nextUrl.searchParams.get('slug');
  let category = request.nextUrl.searchParams.get('category');

  try {
    const body = await request.json();
    if (body) {
      if (body.slug) slug = body.slug;
      if (body.category) category = body.category;
    }
  } catch (e) {
    // POST request had no JSON body; fallback to query parameters
  }

  // Clone URL and attach parameters to invoke GET logic
  const nextUrl = request.nextUrl.clone();
  if (slug) nextUrl.searchParams.set('slug', slug);
  if (category) nextUrl.searchParams.set('category', category);
  
  return GET(new NextRequest(nextUrl, { headers: request.headers }));
}

