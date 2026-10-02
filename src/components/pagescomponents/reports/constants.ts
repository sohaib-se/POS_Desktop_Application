import { FileText, BarChart2, Users, Package } from 'lucide-react';
import type { ReportCategory } from './types';

export const reportCategories: ReportCategory[] = [
  { name: 'Transaction report', icon: FileText, reports: ['Sale', 'Purchase', 'Day book', 'All Transactions'] },
  { name: 'Financial Reports', icon: BarChart2, reports: ['Profit And Loss', 'Bill Wise Profit'] },
  { name: 'Party Reports', icon: Users, reports: ['All parties', 'Party report'] },
  { name: 'Item/Stock Reports', icon: Package, reports: ['Sale Purchase By Party', 'Low stock details', 'Stock details'] },
];
