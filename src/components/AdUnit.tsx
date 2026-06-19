'use client';

import { useEffect, useRef } from 'react';

interface AdUnitProps {
  slot?: string;
  className?: string;
}

export default function AdUnit({ slot, className = '' }: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-1169009766287256';

  // Map friendly named slot keys to their respective 10-digit numeric AdSense Slot IDs.
  // This supports all slots used across the website: homepage, categories, sidebar, and article pages.
  // Gracious fallback hierarchy: if a specific slot ID is missing, it falls back to the configured homepage/global top or bottom slot.
  const resolvedSlot = slot ? (
    // Top Banner Ads
    slot === 'homepage-top' || slot === 'category-top' || slot === 'in-article-top' ? (
      (slot === 'homepage-top' && process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOMEPAGE_TOP) ||
      (slot === 'category-top' && process.env.NEXT_PUBLIC_ADSENSE_SLOT_CATEGORY_TOP) ||
      (slot === 'in-article-top' && process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE_TOP) ||
      process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOMEPAGE_TOP // global top fallback
    ) :
    // Bottom Banner Ads
    slot === 'homepage-bottom' || slot === 'category-bottom' || slot === 'in-article-bottom' ? (
      (slot === 'homepage-bottom' && process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOMEPAGE_BOTTOM) ||
      (slot === 'category-bottom' && process.env.NEXT_PUBLIC_ADSENSE_SLOT_CATEGORY_BOTTOM) ||
      (slot === 'in-article-bottom' && process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE_BOTTOM) ||
      process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOMEPAGE_BOTTOM // global bottom fallback
    ) :
    // Sidebar/Side Vertical Ads
    slot === 'sidebar-top' || slot === 'sidebar-bottom' || slot === 'post-sidebar' ? (
      (slot === 'sidebar-top' && process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR_TOP) ||
      (slot === 'sidebar-bottom' && process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR_BOTTOM) ||
      (slot === 'post-sidebar' && process.env.NEXT_PUBLIC_ADSENSE_SLOT_POST_SIDEBAR) ||
      process.env.NEXT_PUBLIC_ADSENSE_SLOT_POST_SIDEBAR || // global sidebar fallback
      process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOMEPAGE_BOTTOM // absolute fallback
    ) :
    slot // fallback if a direct numeric ID is passed
  ) : undefined;

  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      // AdSense script might not be loaded in development/adblockers
    }
  }, []);

  return (
    <div className={`my-6 flex justify-center items-center overflow-hidden w-full ${className}`}>
      <div className="bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-lg p-3 w-full text-center">
        <span className="text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-400 font-semibold block mb-1">
          Advertisement
        </span>
        <ins
          ref={adRef}
          className="adsbygoogle block"
          data-ad-client={adsenseId}
          data-ad-slot={resolvedSlot || 'default-slot'}
          data-ad-format="auto"
          data-full-width-responsive="true"
          style={{ display: 'block', minHeight: '90px' }}
        />
      </div>
    </div>
  );
}
