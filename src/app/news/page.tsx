import { Metadata } from 'next';
import CategoryPage from '@/components/CategoryPage';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'News',
  description: 'Read the latest educational updates and local news announcements on SamPidia.',
  alternates: { canonical: '/news' },
};

export default function Page() {
  return <CategoryPage category="News" />;
}
