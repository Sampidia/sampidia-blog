import { Metadata } from 'next';
import CategoryPage from '@/components/CategoryPage';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Jobs',
  description: 'Browse the latest graduate trainee programs, scholarship announcements, and recruitment applications on SamPidia.',
  alternates: { canonical: '/jobs' },
};

export default function Page() {
  return <CategoryPage category="Jobs" />;
}
