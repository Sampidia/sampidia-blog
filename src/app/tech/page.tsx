import { Metadata } from 'next';
import CategoryPage from '@/components/CategoryPage';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tech',
  description: 'Explore tech trends, online education tools, and digital platforms on SamPidia.',
  alternates: { canonical: '/tech' },
};

export default function Page() {
  return <CategoryPage category="Tech" />;
}
