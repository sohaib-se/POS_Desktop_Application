import AdminCircularLoader from './AdminCircularLoader';

export default function AdminLoading() {
  return (
    <div className="py-12">
      <AdminCircularLoader
        message="Loading console interface..."
        subtext="Initializing layout framework"
        minHeight="min-h-[400px]"
      />
    </div>
  );
}
