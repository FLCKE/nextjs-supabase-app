import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Store, MapPin } from 'lucide-react';
import { getPublicMenu } from '@/lib/actions/public-menu-actions';
import { MenuContent } from './menu-content';
import { MenuSkeleton } from '@/components/public/menu-skeleton';

export const dynamic = 'force-dynamic';

interface PublicMenuPageProps {
  searchParams: Promise<{ table_token?: string }>;
}

export default async function PublicMenuPage({ searchParams }: PublicMenuPageProps) {
  const params = await searchParams;
  const tableToken = params.table_token;

  if (!tableToken) {
    notFound();
  }

  const result = await getPublicMenu(tableToken);

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">Menu Not Available</h1>
          <p className="text-muted-foreground">
            {result.error || 'The menu could not be loaded. Please scan the QR code again.'}
          </p>
        </div>
      </div>
    );
  }

  const { data } = result;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b shadow-sm">
        <div className="container-lg py-4">
          <div className="flex items-center gap-3">
            <Store className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <h1 className="text-xl font-bold">{data.restaurant_name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{data.location_name}</span>
                <span>•</span>
                <span>Table {data.table_label}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Live region for screen reader announcements */}
      <div
        id="cart-announcements"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Main Content */}
      <Suspense fallback={<MenuSkeleton />}>
        <MenuContent
          menuData={data}
          tableToken={tableToken}
        />
      </Suspense>
    </div>
  );
}
