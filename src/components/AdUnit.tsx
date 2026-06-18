'use client';

import { useEffect, useRef } from 'react';

interface AdUnitProps {
  slot?: string;
  className?: string;
}

export default function AdUnit({ slot, className = '' }: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-1169009766287256';

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
          data-ad-slot={slot || 'default-slot'}
          data-ad-format="auto"
          data-full-width-responsive="true"
          style={{ display: 'block', minHeight: '90px' }}
        />
      </div>
    </div>
  );
}
