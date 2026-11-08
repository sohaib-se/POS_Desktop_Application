import { getPageContent, HomePageContent } from '@/lib/pageContent';
import HomePageClient from './HomePageClient';

export default async function HomePage() {
  const content = await getPageContent<HomePageContent>('/');
  return <HomePageClient content={content} />;
}
