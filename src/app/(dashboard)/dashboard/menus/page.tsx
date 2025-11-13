import { Suspense } from 'react';
import { MenusPageClient } from './menus-client';

export const metadata = {
  title: 'Menus | WEGO RestoPay',
  description: 'Manage your restaurant menus',
};

export default function MenusPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MenusPageClient />
    </Suspense>
  );
}
