import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Store, MapPin } from 'lucide-react';
import { getPublicMenu, getPublicMenuByRestaurant } from '@/lib/actions/public-menu-actions';
import { MenuContent } from './menu-content';
import { MenuSkeleton } from '@/components/public/menu-skeleton';
import { RestaurantSelector } from '@/components/public/restaurant-selector';
import { CartButton } from '@/components/public/cart-button';
import { CartDrawer } from '@/components/public/cart-drawer';
import { MenuPageClient } from './menu-page-client';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface PublicMenuPageProps {
  searchParams: Promise<{ table_token?: string; restaurant?: string }>;
}

export default async function PublicMenuPage({ searchParams }: PublicMenuPageProps) {
  const params = await searchParams;
  const tableToken = params?.table_token;
  const restaurantIdParam = params?.restaurant;
  const supabase = await createClient();

  // If neither table_token nor restaurant param provided, check if user is logged in
  if (!tableToken && !restaurantIdParam) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      notFound();
    }

    // Get user's first restaurant for preview
    const { data: restaurants } = await supabase
      .from('restaurants')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1);

    if (!restaurants || restaurants.length === 0) {
      notFound();
    }

    // Redirect to first restaurant
    return <RestaurantPreviewPage restaurantId={restaurants[0].id} />;
  }

  let result;

  if (tableToken) {
    // Fetch menu for specific table
    result = await getPublicMenu(tableToken);
  } else if (restaurantIdParam) {
    // Fetch menu for restaurant (without specific table)
    result = await getPublicMenuByRestaurant(restaurantIdParam);
  }

  if (!result || !result.success || !result.data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">Menu Not Available</h1>
          <p className="text-muted-foreground">
            {result?.error || 'The menu could not be loaded. Please try again.'}
          </p>
        </div>
      </div>
    );
  }

  const { data } = result;

  // Get all public restaurants for selector
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('id, name')
    .order('name');

  return (
    <MenuPageClient>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-card border-b shadow-sm">
          <div className="container-lg py-4 space-y-3">
            <div className="flex items-center gap-3">
              <Store className="h-6 w-6 text-primary" />
              <div className="flex-1">
                <h1 className="text-xl font-bold">{data.restaurant_name}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{data.location_name}</span>
                  {data.table_label && (
                    <>
                      <span>•</span>
                      <span>Table {data.table_label}</span>
                    </>
                  )}
                </div>
              </div>
              <Suspense fallback={null}>
                <CartButton />
              </Suspense>
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
            tableToken={tableToken ? tableToken : ''}
            restaurantId={restaurantIdParam}
          />
        </Suspense>
      </div>
    </MenuPageClient>
  );
}

async function RestaurantPreviewPage({ restaurantId }: { restaurantId: string }) {
  const result = await getPublicMenuByRestaurant(restaurantId);

  if (!result.success || !result.data) {
    return notFound();
  }

  const { data } = result;
  const supabase = await createClient();

  // Get all public restaurants for selector
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('id, name')
    .order('name');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b shadow-sm">
        <div className="container-lg py-4 space-y-3">
          <div className="flex items-center gap-3">
            <Store className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <h1 className="text-xl font-bold">{data.restaurant_name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{data.location_name}</span>
              </div>
            </div>
          </div>

          {/* Restaurant selector for owners */}
          {restaurants && restaurants.length > 1 && (
            <RestaurantSelector 
              restaurants={restaurants}
              currentRestaurantId={restaurantId}
              currentTableToken={undefined}
            />
          )}
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
          tableToken=""
        />
      </Suspense>
    </div>
  );
}
