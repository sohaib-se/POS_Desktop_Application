import { useState } from 'react';
import { ReportsHeader } from '../components/pagescomponents/reports/ReportsHeader';
import { ReportsList } from '../components/pagescomponents/reports/ReportsList';
import { reportCategories } from '../components/pagescomponents/reports/constants';

export function Reports() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="h-full flex flex-col bg-white">
      <ReportsHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <ReportsList categories={reportCategories} searchTerm={searchTerm} />
    </div>
  );
}
