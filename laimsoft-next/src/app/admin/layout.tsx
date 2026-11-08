import { ReactNode } from 'react';
import AdminNavigationFrame from './AdminNavigationFrame';

export const metadata = {
  title: 'Laimsoft Admin Console',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminNavigationFrame>{children}</AdminNavigationFrame>;
}
