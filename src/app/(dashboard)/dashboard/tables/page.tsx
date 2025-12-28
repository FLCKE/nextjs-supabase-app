import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { TablesClient } from './tables-client';

export const metadata = {
  title: 'Table Management | Dashboard',
};

export default function TablesPage() {
  return (
      <TablesClient />
  );
}
