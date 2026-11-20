import { Metadata } from 'next';
import CategoryPage from '@/components/CategoryPage';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Lifestyle',
  description: 'Read tips, guides, and stories about student and graduate lifestyle on SamPidia.',
  alternates: { canonical: '/lifestyle' },
};

export default function Page() {
  return <CategoryPage category="Lifestyle" />;
}
