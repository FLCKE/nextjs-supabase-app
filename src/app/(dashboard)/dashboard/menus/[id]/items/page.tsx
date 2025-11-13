import { Suspense } from 'react';
import { MenuItemsPageClient } from './items-client';

export const metadata = {
  title: 'Menu Items | WEGO RestoPay',
  description: 'Manage menu items',
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MenuItemsPage({ params }: PageProps) {
  const { id } = await params;
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MenuItemsPageClient menuId={id} />
    </Suspense>
  );
}
