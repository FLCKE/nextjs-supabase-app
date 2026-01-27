'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCartStore } from '@/lib/cart/cart-store';
import { cn } from '@/lib/utils';

export function MiniCart() {
  const router = useRouter();
  const { items, removeItem, getTotal } = useCartStore();
  const [isOpen, setIsOpen] = React.useState(false);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Trigger Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <ShoppingCart className="h-4 w-4" />
        <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
          {items.length}
        </Badge>
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-card border rounded-lg shadow-lg z-40">
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="font-semibold">Cart Preview</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Items */}
            <ScrollArea className="max-h-64">
              <div className="space-y-2 p-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 text-sm p-2 rounded border"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity}x @ {(item.price_cts / 100).toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => removeItem(item.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t p-4 space-y-3">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(getTotal())}</span>
              </div>
              <Button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/public/checkout');
                }}
                className="w-full"
                size="sm"
              >
                Checkout
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
