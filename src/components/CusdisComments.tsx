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
  const [isDark, setIsDark] = useState(false);
  const host = (process.env.NEXT_PUBLIC_CUSDIS_HOST || 'https://cusdis-xyxt.onrender.com').replace(/\/$/, '');
  const appId = process.env.NEXT_PUBLIC_CUSDIS_APP_ID || 'eb16b38e-d745-484d-9236-05e952c99b25';
  const pageId = post.id && String(post.id).trim() !== '' ? String(post.id) : post.slug;
  const pageUrl = `https://www.sampidia.com/${post.slug}`;

  // Sync theme with SamPidia's website theme toggle (detects .dark on <html>)
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

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
      theme: isDark ? 'dark' : 'light',
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
      :root {
        color-scheme: ${isDark ? 'dark' : 'light'};
      }
      body {
        margin: 0;
        padding: 0;
        background: transparent;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }

      /* 1. Hide "Comments powered by Cusdis" footer */
      a[href*="cusdis"],
      div.text-center,
      .my-8:last-child {
        display: none !important;
      }

      /* Base input & textarea styling */
      input, textarea {
        border-radius: 8px !important;
        border: 1px solid ${isDark ? '#334155' : '#cbd5e1'} !important;
        padding: 8px 12px !important;
        font-size: 14px !important;
        background-color: ${isDark ? '#0f172a' : '#ffffff'} !important;
        color: ${isDark ? '#ffffff' : '#0f172a'} !important;
        transition: border-color 0.2s, box-shadow 0.2s !important;
      }

      input:focus, textarea:focus {
        outline: none !important;
        border-color: #0284c7 !important;
        box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.2) !important;
      }

      /* Submit comment button */
      button.bg-blue-500 {
        background-color: #0284c7 !important;
        border-radius: 8px !important;
        padding: 8px 20px !important;
        font-weight: 600 !important;
        color: #ffffff !important;
      }
      button.bg-blue-500:hover {
        background-color: #0369a1 !important;
      }

      ${isDark ? `
        /* 2. Night Mode (Dark Mode) text colors */
        body, label, span, p {
          color: #f1f5f9 !important;
        }

        /* Comment author / user nickname */
        .font-bold, .font-medium, h4, .text-gray-900, .text-gray-800 {
          color: #ffffff !important;
        }

        /* Comment content text */
        .my-2, .text-gray-900, .text-gray-700 {
          color: #f8fafc !important;
        }

        /* Reply placeholder & input labels */
        label {
          color: #e2e8f0 !important;
          font-weight: 600 !important;
        }

        /* Input placeholders */
        input::placeholder, textarea::placeholder {
          color: #94a3b8 !important;
        }

        /* Comment boxes / replies background in dark mode */
        blockquote, [class*="bg-gray-100"], [class*="bg-gray-50"] {
          background-color: #1e293b !important;
          border-color: #334155 !important;
          color: #f1f5f9 !important;
        }

        /* Timestamps */
        time, .text-xs, .text-gray-500 {
          color: #94a3b8 !important;
        }

        /* Reply button on existing comments */
        button.text-sm, button.text-xs {
          color: #38bdf8 !important;
        }
      ` : `
        /* Light Mode text colors */
        body, label, span, p {
          color: #334155 !important;
        }
        .font-bold, .font-medium, h4 {
          color: #0f172a !important;
        }
      `}
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script defer src="${host}/js/iframe.umd.js"><\/script>
  </body>
</html>`;
  }, [host, appId, pageId, post.title, pageUrl, isDark]);

  return (
    <div className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-8">
      <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 font-heading">
        Discussion
      </h3>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 min-h-[350px]">
        <iframe
          key={`${post.slug}-${pageId}-${isDark ? 'dark' : 'light'}`}
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
