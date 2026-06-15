import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');

  // Verify the secret token
  const expectedSecret = process.env.REVALIDATE_SECRET;
  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json(
      { message: 'Invalid token or secret not configured' },
      { status: 401 }
    );
  }

  try {
    // 1. Revalidate the specific posts fetch cache tag
    revalidateTag('posts', 'max');

    // 2. Revalidate all pages to purge static HTML cache on Vercel
    revalidatePath('/', 'layout');

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err: any) {
    return NextResponse.json(
      { message: 'Error revalidating', error: err.message },
      { status: 500 }
    );
  }
}

// Support POST requests as well in case the webhook uses POST
export async function POST(request: NextRequest) {
  return GET(request);
}
