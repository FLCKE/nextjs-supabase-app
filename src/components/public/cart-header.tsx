'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/lib/cart/cart-store';

export function CartHeader() {
  const router = useRouter();
  const itemCount = useCartStore((state) => state.getItemCount());
  const total = useCartStore((state) => state.getTotal());

  if (itemCount === 0) {
    return null;
  }

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/public/cart')}
        className="relative"
      >
        <ShoppingCart className="h-4 w-4 mr-2" />
        <span>{itemCount} items</span>
        {itemCount > 0 && (
          <Badge className="ml-2" variant="secondary">
            {formatPrice(total)}
          </Badge>
        )}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push('/public/checkout')}
      >
        Checkout
      </Button>
    </div>
  );
}
