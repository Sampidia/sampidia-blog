import { Metadata } from 'next';
import CategoryPage from '@/components/CategoryPage';

export const metadata: Metadata = {
  title: 'Sports',
  description: 'Stay updated with school sports activities, athletic events, and youth sports coverage on SamPidia.',
};

export default function Page() {
  return <CategoryPage category="Sports" />;
}
