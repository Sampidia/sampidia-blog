'use client';

import { useEffect, useRef, useState } from 'react';

interface CusdisCommentsProps {
  post: {
    id: string;
    title: string;
    slug: string;
  };
}

export default function CusdisComments({ post }: CusdisCommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isIntersected, setIsIntersected] = useState(false);
  const appId = process.env.NEXT_PUBLIC_CUSDIS_APP_ID || 'c3da25cf-9ca7-4de0-8e6d-74d1a0be5fe5';

  // Setup Intersection Observer to detect when the comment thread container approaches the viewport
  useEffect(() => {
    const container = containerRef.current;
    if (!container || isIntersected) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsIntersected(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px', // pre-load comments when 200px above/below viewport
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [isIntersected]);

  useEffect(() => {
    if (!isIntersected) return;

    const pageUrl = `${window.location.origin}/${post.slug}`;

    if (!containerRef.current) return;

    // Set data attributes on the widget container
    const el = containerRef.current;
    el.setAttribute('data-host', 'https://cusdis.com');
    el.setAttribute('data-app-id', appId);
    el.setAttribute('data-page-id', post.id);
    el.setAttribute('data-page-title', post.title);
    el.setAttribute('data-page-url', pageUrl);

    // Resize handler: Cusdis sends postMessage events with resize info
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://cusdis.com') return;
      const iframe = el.querySelector('iframe');
      if (!iframe) return;

      // Cusdis sends { event: 'resize', offsetHeight: number }
      if (event.data && event.data.event === 'resize' && event.data.offsetHeight) {
        const newHeight = Math.max(550, Number(event.data.offsetHeight) + 80);
        iframe.style.height = `${newHeight}px`;
      }
    };

    window.addEventListener('message', handleMessage);

    // Polling fallback: set a minimum height and grow as iframe content loads
    let pollAttempts = 0;
    const pollInterval = setInterval(() => {
      const iframe = el.querySelector('iframe');
      if (iframe) {
        // Ensure iframe never collapses
        if (!iframe.style.height || parseInt(iframe.style.height) < 550) {
          iframe.style.height = '550px';
        }
        iframe.style.width = '100%';
        iframe.style.border = 'none';
        iframe.scrolling = 'no';
      }
      pollAttempts++;
      if (pollAttempts > 20) clearInterval(pollInterval);
    }, 500);

    // Load (or reload) the Cusdis embed script
    const existingScript = document.getElementById('cusdis-script');
    if (existingScript) {
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

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(pollInterval);
    };
  }, [post.id, post.title, post.slug, appId, isIntersected]);

  return (
    <div className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-8">
      <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 font-heading">
        Discussion
      </h3>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 min-h-[250px]">
        <div ref={containerRef} id="cusdis_thread" />
      </div>
    </div>
  );
}
