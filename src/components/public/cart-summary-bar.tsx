'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/lib/cart/cart-store';
import { cn } from '@/lib/utils';

interface CartSummaryBarProps {
  currency: string;
}

export function CartSummaryBar({ currency }: CartSummaryBarProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const { items, getItemCount, getSubtotal, getTaxes, getTotal } = useCartStore();

  const itemCount = getItemCount();
  const subtotal = getSubtotal();
  const taxes = getTaxes();
  const total = getTotal();

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(cents / 100);
  };

  if (itemCount === 0) {
    return null;
  }

  return (
    <>
      {/* Spacer to prevent content from being hidden under the sticky bar */}
      <div className="h-20 md:h-24" aria-hidden="true" />

      {/* Sticky Cart Bar */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg transition-all z-50",
          isExpanded ? "h-auto" : "h-20 md:h-24"
        )}
        role="complementary"
        aria-label="Shopping cart summary"
      >
        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-b bg-muted/50 p-4 animate-in slide-in-from-bottom-4">
            <div className="max-w-2xl mx-auto space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxes</span>
                <span className="font-medium">{formatPrice(taxes)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Bar */}
        <div className="max-w-2xl mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center gap-3">
            {/* Cart Icon & Count */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="relative p-2 rounded-full hover:bg-accent transition-colors"
              aria-label={isExpanded ? "Collapse cart details" : "Expand cart details"}
              aria-expanded={isExpanded}
            >
              <ShoppingCart className="h-6 w-6" />
              <Badge
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                aria-label={`${itemCount} items in cart`}
              >
                {itemCount}
              </Badge>
            </button>

            {/* Quick Summary */}
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-muted-foreground">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
                <span className="font-bold text-lg">
                  {formatPrice(total)}
                </span>
              </div>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                aria-label={isExpanded ? "Collapse cart details" : "View cart details"}
              >
                {isExpanded ? 'Hide details' : 'View details'}
                <ChevronUp 
                  className={cn(
                    "h-3 w-3 transition-transform",
                    !isExpanded && "rotate-180"
                  )} 
                />
              </button>
            </div>

            {/* Checkout Button */}
            <Button
              size="lg"
              onClick={() => router.push('/public/checkout')}
              className="font-semibold"
              aria-label={`Proceed to checkout with ${itemCount} items`}
            >
              Checkout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
