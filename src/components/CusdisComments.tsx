'use client';

import { useEffect, useRef } from 'react';

interface CusdisCommentsProps {
  post: {
    id: string;
    title: string;
    slug: string;
  };
}

export default function CusdisComments({ post }: CusdisCommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appId = process.env.NEXT_PUBLIC_CUSDIS_APP_ID || 'c3da25cf-9ca7-4de0-8e6d-74d1a0be5fe5';

  useEffect(() => {
    const pageUrl = `${window.location.origin}/${post.slug}`;

    if (!containerRef.current) return;

    // Set data attributes on the widget container
    const el = containerRef.current;
    el.setAttribute('data-host', 'https://cusdis.com');
    el.setAttribute('data-app-id', appId);
    el.setAttribute('data-page-id', post.id);
    el.setAttribute('data-page-title', post.title);
    el.setAttribute('data-page-url', pageUrl);

    // Load (or reload) the Cusdis embed script
    const existingScript = document.getElementById('cusdis-script');
    if (existingScript) {
      // If the script already exists (e.g. navigation), re-init the widget
      // @ts-ignore
      if (window.CUSDIS) window.CUSDIS.initial();
    } else {
      const script = document.createElement('script');
      script.id = 'cusdis-script';
      script.src = 'https://cusdis.com/js/cusdis.es.js';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, [post.id, post.title, post.slug, appId]);

  return (
    <div className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-8">
      <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 font-heading">
        Discussion
      </h3>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div ref={containerRef} id="cusdis_thread" />
      </div>
    </div>
  );
}
