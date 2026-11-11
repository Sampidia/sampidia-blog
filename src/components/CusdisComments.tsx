'use client';

import { useEffect, useMemo, useState } from 'react';

interface CusdisCommentsProps {
  post: {
    id: string;
    title: string;
    slug: string;
  };
}

export default function CusdisComments({ post }: CusdisCommentsProps) {
  const [iframeHeight, setIframeHeight] = useState(450);
  const host = (process.env.NEXT_PUBLIC_CUSDIS_HOST || 'https://cusdis-xyxt.onrender.com').replace(/\/$/, '');
  const appId = process.env.NEXT_PUBLIC_CUSDIS_APP_ID || 'eb16b38e-d745-484d-9236-05e952c99b25';
  const pageId = post.id && String(post.id).trim() !== '' ? String(post.id) : post.slug;
  const pageUrl = `https://www.sampidia.com/${post.slug}`;

  // Listen for auto-resize messages sent by Cusdis inside the iframe
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      try {
        const msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (msg && msg.from === 'cusdis' && msg.event === 'resize') {
          const height = Number(msg.data);
          if (!isNaN(height) && height > 0) {
            setIframeHeight(Math.max(350, height + 40));
          }
        }
      } catch {
        // ignore non-Cusdis messages
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const srcDoc = useMemo(() => {
    const dataObj = {
      host,
      appId,
      pageId,
      pageTitle: post.title,
      pageUrl,
      theme: 'auto',
    };

    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="${host}/js/style.css">
    <base target="_parent" />
    <script>
      window.CUSDIS_LOCALE = undefined;
      window.__DATA__ = ${JSON.stringify(dataObj)};
    <\/script>
    <style>
      :root { color-scheme: light dark; }
      body { margin: 0; padding: 0; background: transparent; font-family: system-ui, -apple-system, sans-serif; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script src="${host}/js/iframe.umd.js" type="module"><\/script>
  </body>
</html>`;
  }, [host, appId, pageId, post.title, pageUrl]);

  return (
    <div className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-8">
      <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 font-heading">
        Discussion
      </h3>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 min-h-[350px]">
        <iframe
          key={`${post.slug}-${pageId}`}
          title="Comments"
          srcDoc={srcDoc}
          style={{
            width: '100%',
            height: `${iframeHeight}px`,
            border: 'none',
            overflow: 'hidden',
          }}
        />
      </div>
    </div>
  );
}
