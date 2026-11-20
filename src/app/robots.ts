import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      // Restrict known AI scrapers per ai-crawler-policy.txt
      {
        userAgent: ['GPTBot', 'CCBot', 'Google-Extended', 'anthropic-ai', 'Claude-Web'],
        disallow: '/',
      },
      // Restrict aggressive commercial crawlers and scrapers that exhaust bandwidth
      {
        userAgent: [
          'Bytespider',
          'PetalBot',
          'SemrushBot',
          'AhrefsBot',
          'DotBot',
          'MJ12bot',
          'Amazonbot',
          'DataForSeoBot',
        ],
        disallow: '/',
      },
    ],
    sitemap: [
      'https://sampidia.com/sitemap.xml',
      'https://sampidia.com/news-sitemap.xml',
    ],
    host: 'https://sampidia.com',
  };
}
