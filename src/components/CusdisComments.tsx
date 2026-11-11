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
  const host = (process.env.NEXT_PUBLIC_CUSDIS_HOST || 'https://cusdis-xyxt.onrender.com').replace(/\/$/, '');
  const appId = process.env.NEXT_PUBLIC_CUSDIS_APP_ID || 'eb16b38e-d745-484d-9236-05e952c99b25';
  const pageId = post.id && String(post.id).trim() !== '' ? String(post.id) : post.slug;
  const pageUrl = `https://www.sampidia.com/${post.slug}`;

  useEffect(() => {
    // 1. Listen for iframe resize events from Cusdis
    const handleMessage = (event: MessageEvent) => {
      try {
        if (!event.origin.startsWith(host)) return;
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data && data.event === 'resize' && data.offsetHeight) {
          const iframe = containerRef.current?.querySelector('iframe');
          if (iframe) {
            iframe.style.height = `${Math.max(350, Number(data.offsetHeight) + 50)}px`;
          }
        }
      } catch {
        // ignore non-json messages
      }
    };

    window.addEventListener('message', handleMessage);

    // 2. Load or re-initialize Cusdis script
    const loadCusdis = () => {
      // @ts-ignore
      if (window.CUSDIS) {
        // @ts-ignore
        window.CUSDIS.initial();
      } else {
        const existingScript = document.getElementById('cusdis-script');
        if (existingScript) {
          existingScript.remove(); // remove stale script tag to force fresh load
        }
        const script = document.createElement('script');
        script.id = 'cusdis-script';
        script.src = `${host}/js/cusdis.es.js`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          // @ts-ignore
          if (window.CUSDIS) window.CUSDIS.initial();
        };
        document.body.appendChild(script);
      }
    };

    loadCusdis();

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [post.slug, pageId, post.title, host, appId]);

  return (
    <div className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-8">
      <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 font-heading">
        Discussion
      </h3>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 min-h-[300px]">
        <div
          ref={containerRef}
          id="cusdis_thread"
          data-host={host}
          data-app-id={appId}
          data-page-id={pageId}
          data-page-title={post.title}
          data-page-url={pageUrl}
        />
      </div>
    </div>
  );
}
