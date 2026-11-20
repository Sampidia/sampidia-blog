import { Metadata } from 'next';
import CategoryPage from '@/components/CategoryPage';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Sports',
  description: 'Stay updated with school sports activities, athletic events, and youth sports coverage on SamPidia.',
  alternates: { canonical: '/sports' },
};

export default function Page() {
  return <CategoryPage category="Sports" />;
}
