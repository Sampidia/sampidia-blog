import { Metadata } from 'next';
import CategoryPage from '@/components/CategoryPage';

export const metadata: Metadata = {
  title: 'Tech',
  description: 'Explore tech trends, online education tools, and digital platforms on SamPidia.',
};

export default function Page() {
  return <CategoryPage category="Tech" />;
}
