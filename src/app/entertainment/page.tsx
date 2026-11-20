import { Metadata } from 'next';
import CategoryPage from '@/components/CategoryPage';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Entertainment',
  description: 'Get the latest entertainment news, celebrity updates, and pop culture stories on SamPidia.',
  alternates: { canonical: '/entertainment' },
};

export default function Page() {
  return <CategoryPage category="Entertainment" />;
}
