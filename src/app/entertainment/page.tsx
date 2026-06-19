import { Metadata } from 'next';
import CategoryPage from '@/components/CategoryPage';

export const metadata: Metadata = {
  title: 'Entertainment',
  description: 'Get the latest entertainment news, celebrity updates, and pop culture stories on SamPidia.',
};

export default function Page() {
  return <CategoryPage category="Entertainment" />;
}
