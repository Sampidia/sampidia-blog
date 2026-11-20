import { Metadata } from 'next';
import CategoryPage from '@/components/CategoryPage';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'News',
  description: 'Read the latest educational updates and local news announcements on SamPidia.',
  alternates: { canonical: '/news' },
};

export default function Page() {
  return <CategoryPage category="News" />;
}
