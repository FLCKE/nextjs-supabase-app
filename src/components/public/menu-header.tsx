'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Store, MapPin, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/lib/cart/cart-store';
import { cn } from '@/lib/utils';

interface MenuHeaderProps {
  restaurantName: string;
  locationName?: string;
  tableLabel?: string;
  onMenuToggle?: () => void;
}

export function MenuHeader({
  restaurantName,
  locationName,
  tableLabel,
  onMenuToggle,
}: MenuHeaderProps) {
  const router = useRouter();
  const itemCount = useCartStore((state) => state.getItemCount());
  const total = useCartStore((state) => state.getTotal());

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  return (
    <header className="sticky top-0 z-40 bg-card border-b shadow-sm">
      <div className="container-lg py-4">
        <div className="space-y-3">
          {/* Main header with title and cart */}
          <div className="flex items-center gap-3">
            {/* Menu toggle button for mobile */}
            {onMenuToggle && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMenuToggle}
                className="md:hidden"
                aria-label="Toggle menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}

            {/* Title */}
            <div className="flex-1 flex items-center gap-3">
              <Store className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <h1 className="text-xl font-bold">{restaurantName}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {locationName && (
                    <>
                      <MapPin className="h-3 w-3" />
                      <span>{locationName}</span>
                    </>
                  )}
                  {tableLabel && (
                    <>
                      <span>•</span>
                      <span>Table {tableLabel}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Cart button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push('/public/cart')}
              className="relative"
              aria-label={`Shopping cart with ${itemCount} items`}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {itemCount > 99 ? '99+' : itemCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Cart summary when items exist */}
          {itemCount > 0 && (
            <div className="flex items-center justify-between gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="text-sm">
                <span className="font-medium">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
                <span className="text-muted-foreground ml-2">
                  {formatPrice(total)}
                </span>
              </div>
              <Button
                size="sm"
                onClick={() => router.push('/public/checkout')}
              >
                Checkout
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
