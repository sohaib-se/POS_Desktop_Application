import { getPageContent, ContactPageContent } from '@/lib/pageContent';
import ContactPageClient from './ContactPageClient';

export default async function ContactPage() {
  const content = await getPageContent<ContactPageContent>('/contact');
  return <ContactPageClient content={content} />;
}
