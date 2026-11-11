/**
 * Next.js Instrumentation Hook
 * Runs once when the server starts (Node.js runtime only).
 *
 * Purpose: Pre-warm the posts cache so the FIRST user request to any page
 * is served instantly from memory instead of waiting for a 14 MB CSV fetch.
 *
 * Also starts a background refresh timer that re-fetches the CSV every
 * 4 minutes, keeping the cache perpetually warm so no user ever waits.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { getPosts, refreshPosts } = await import('./lib/posts');

    // --- Initial warm-up ---
    console.log('[Instrumentation] Pre-warming posts cache on startup...');
    try {
      const posts = await getPosts();
      console.log(`[Instrumentation] Cache warmed with ${posts.length} posts.`);
    } catch (err) {
      console.error('[Instrumentation] Initial cache warm-up failed:', err);
    }

    // --- Background refresh every 5 minutes ---
    // Safely re-fetches without clearing existing cache beforehand
    const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

    const refresh = async () => {
      try {
        const posts = await refreshPosts();
        console.log(`[Instrumentation] Background refresh complete: ${posts.length} posts.`);
      } catch (err) {
        console.error('[Instrumentation] Background refresh failed:', err);
      }
    };

    setInterval(refresh, REFRESH_INTERVAL_MS);
  }
}

