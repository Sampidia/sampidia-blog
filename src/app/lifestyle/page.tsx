import { Metadata } from 'next';
import CategoryPage from '@/components/CategoryPage';

export const metadata: Metadata = {
  title: 'Lifestyle',
  description: 'Read tips, guides, and stories about student and graduate lifestyle on SamPidia.',
};

export default function Page() {
  return <CategoryPage category="Lifestyle" />;
}
