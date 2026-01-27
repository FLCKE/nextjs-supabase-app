'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCartStore } from '@/lib/cart/cart-store';
import { cn } from '@/lib/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  showCheckoutButton?: boolean;
}

export function CartDrawer({ isOpen, onClose, showCheckoutButton = true }: CartDrawerProps) {
  const router = useRouter();
  const {
    items,
    updateQuantity,
    removeItem,
    getSubtotal,
    getTaxes,
    getTotal,
  } = useCartStore();

  const subtotal = getSubtotal();
  const taxes = getTaxes();
  const total = getTotal();

  const handleCheckout = () => {
    onClose();
    router.push('/public/checkout');
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const handleIncrement = (itemId: string, currentQty: number) => {
    updateQuantity(itemId, currentQty + 1);
  };

  const handleDecrement = (itemId: string, currentQty: number) => {
    if (currentQty > 1) {
      updateQuantity(itemId, currentQty - 1);
    }
  };

  const handleRemove = (itemId: string) => {
    removeItem(itemId);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full w-full max-w-md bg-background shadow-lg transition-transform duration-300 z-50 flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 id="cart-drawer-title" className="text-lg font-semibold">
            Your Cart
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close cart drawer"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="font-semibold mb-1">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground">
              Add items from the menu to get started
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1">
              <div className="space-y-2 p-4" role="list" aria-label="Cart items">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 rounded-lg border p-3"
                    role="listitem"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm leading-tight truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatPrice(item.price_cts)} each
                      </p>
                      <div
                        className="flex items-center gap-1 mt-2"
                        role="group"
                        aria-label={`Quantity controls for ${item.name}`}
                      >
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleDecrement(item.id, item.quantity)}
                          disabled={item.quantity <= 1}
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span
                          className="w-8 text-center text-xs font-semibold"
                          aria-live="polite"
                          aria-atomic="true"
                        >
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleIncrement(item.id, item.quantity)}
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <p className="text-sm font-bold whitespace-nowrap">
                        {formatPrice(item.price_cts * item.quantity)}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => handleRemove(item.id)}
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t space-y-3 p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxes</span>
                  <span className="font-medium">{formatPrice(taxes)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {showCheckoutButton && (
                <Button
                  onClick={handleCheckout}
                  className="w-full"
                  size="lg"
                >
                  Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
