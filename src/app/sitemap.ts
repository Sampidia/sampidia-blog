import { MetadataRoute } from 'next';
import { getPosts } from '@/lib/posts';

const BASE_URL = 'https://sampidia.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/tech`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/sports`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/jobs`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/entertainment`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/lifestyle`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/about-sampidia`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/disclaimer`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/dmca-statement`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];

  const postPages: MetadataRoute.Sitemap = posts.map((post) => {
    const d = post.date ? new Date(post.date) : null;
    const lastModified = d && !isNaN(d.getTime()) ? d : new Date();
    return {
      url: `${BASE_URL}/${post.slug}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    };
  });

  return [...staticPages, ...postPages];
}
