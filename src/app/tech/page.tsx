import { Metadata } from 'next';
import CategoryPage from '@/components/CategoryPage';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Tech',
  description: 'Explore tech trends, online education tools, and digital platforms on SamPidia.',
  alternates: { canonical: '/tech' },
};

export default function Page() {
  return <CategoryPage category="Tech" />;
}
