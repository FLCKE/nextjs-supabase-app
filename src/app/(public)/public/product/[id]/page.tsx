import { notFound } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ProductPageClient } from './product-page-client';

export const dynamic = 'force-dynamic';
type Restaurant = {
  id: number;
  name: string;
  currency: string;
};

type Menu = {
  id: number;
  restaurants: Restaurant[];
};

type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  price_cts: number;
  tax_rate: number;
  category: string;
  stock_mode: string;
  stock_qty: number;
  image_url: string | null;
  menus: Menu[];
};

interface ProductPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ restaurant?: string; table_token?: string }>;
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const { id: productId } = await params;
  const { restaurant: restaurantId, table_token: tableToken } = await searchParams;

  const supabase = await createClient();

  // Fetch the menu item with restaurant info
  const { data: menuItem, error } = await supabase
    .from('menu_items')
    .select(`
      id,
      name,
      description,
      price_cts,
      tax_rate,
      category,
      stock_mode,
      stock_qty,
      image_url,
      menus!inner(
        id,
        restaurants!inner(
          id,
          name,
          currency
        )
      )
    `)
    .eq('id', productId)
    .eq('menus.restaurants.id', restaurantId ) 
    .single();

  if (error || !menuItem) {
    notFound();
  }

  const restaurant = Array.isArray(menuItem.menus?.[0]?.restaurants) 
    ? menuItem.menus?.[0]?.restaurants?.[0]
    : menuItem.menus?.[0]?.restaurants;
  

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(cents / 100);
  };

  const isOutOfStock = menuItem.stock_mode === 'FINITE' && (menuItem.stock_qty === null || menuItem.stock_qty === 0);
  const isLowStock = menuItem.stock_mode === 'FINITE' && menuItem.stock_qty !== null && menuItem.stock_qty <= 5;

  // Build back URL
  const backUrl = tableToken
    ? `/public/menu?table_token=${tableToken}`
    : restaurantId
      ? `/public/menu?restaurant=${restaurantId}`
      : '/public/menu';

  return (
    <ProductPageClient
      productId={productId}
      productName={menuItem.name}
      restaurantId={restaurantId}
      tableToken={tableToken}
      isOutOfStock={isOutOfStock}
      price={menuItem.price_cts}
      currency={restaurant?.currency || 'USD'}
    >
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-card border-b shadow-sm">
          <div className="container-lg py-4">
            <Link
              href={backUrl}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Menu
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="container-lg py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="space-y-4">
              {menuItem.image_url ? (
                <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={menuItem.image_url}
                    alt={menuItem.name}
                    fill
                    className="object-cover"
                    priority
                  />
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <Badge variant="destructive" className="text-lg px-4 py-2">
                        Out of Stock
                      </Badge>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">No image available</span>
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              {/* Title and Price */}
              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">{menuItem.name}</h1>
                <div className="text-3xl font-bold text-primary">
                  {formatPrice(menuItem.price_cts, restaurant?.currency || 'USD')}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {menuItem.category && (
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {menuItem.category}
                    </Badge>
                  )}
                  {menuItem.tax_rate && menuItem.tax_rate > 0 && (
                    <Badge variant="outline" className="text-sm px-3 py-1">
                      +{menuItem.tax_rate}% tax
                    </Badge>
                  )}
                  {isLowStock && !isOutOfStock && (
                    <Badge
                      variant="outline"
                      className="text-sm px-3 py-1 bg-orange-500/10 text-orange-600 border-orange-500/20"
                    >
                      Only {menuItem.stock_qty} left
                    </Badge>
                  )}
                </div>
              </div>

              {/* Description */}
              {menuItem.description && (
                <div className="space-y-2">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase">Description</h2>
                  <p className="text-base text-foreground leading-relaxed">
                    {menuItem.description}
                  </p>
                </div>
              )}

              {/* Stock Information */}
              {menuItem.stock_mode === 'FINITE' && (
                <Card className="bg-muted/50 border-muted">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">Availability</p>
                      <p className="text-sm text-muted-foreground">
                        {isOutOfStock
                          ? 'This item is currently out of stock'
                          : `${menuItem.stock_qty} unit${menuItem.stock_qty !== 1 ? 's' : ''} available`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Restaurant Info */}
              {restaurant && (
                <Card className="bg-muted/50 border-muted">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">Restaurant</p>
                      <p className="text-sm text-muted-foreground">{restaurant.name}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Add to Cart Section */}
              <div className="pt-4 space-y-3">
                <div
                  id="product-announcements"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                  className="sr-only"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProductPageClient>
  );
}
