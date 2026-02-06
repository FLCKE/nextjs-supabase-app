'use client';

import * as React from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/cart/cart-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProductPageClientProps {
  children: React.ReactNode;
  productId: string;
  productName: string;
  restaurantId?: string | undefined;
  tableToken?: string | undefined;
  isOutOfStock: boolean;
  price: number;
  currency: string;
}

export function ProductPageClient({
  children,
  productId,
  productName,
  restaurantId,
  tableToken,
  isOutOfStock,
  currency,
  price,
}: ProductPageClientProps) {
  const { items, addItem, updateQuantity } = useCartStore();
  const [isAdding, setIsAdding] = React.useState(false);

  const cartItem = items.find((item) => item.id === productId);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = () => {
    if (isOutOfStock) return;

    setIsAdding(true);
    addItem({
      id: productId,
      name: productName,
      price_cts: price,
      tax_rate: 0,
    });

    const announcement = `Added ${productName} to cart. Quantity: ${quantity + 1}`;
    const liveRegion = document.getElementById('product-announcements');
    if (liveRegion) {
      liveRegion.textContent = announcement;
    }

    toast.success('Added to cart', {
      description: productName,
    });

    setTimeout(() => setIsAdding(false), 300);
  };

  const handleIncrement = () => {
    if (isOutOfStock) return;

    const newQuantity = quantity + 1;
    updateQuantity(productId, newQuantity);

    const liveRegion = document.getElementById('product-announcements');
    if (liveRegion) {
      liveRegion.textContent = `${productName} quantity increased to ${newQuantity}`;
    }
  };

  const handleDecrement = () => {
    const newQuantity = quantity - 1;
    updateQuantity(productId, newQuantity);

    const liveRegion = document.getElementById('product-announcements');
    if (liveRegion) {
      if (newQuantity === 0) {
        liveRegion.textContent = `${productName} removed from cart`;
      } else {
        liveRegion.textContent = `${productName} quantity decreased to ${newQuantity}`;
      }
    }
  };

  return (
    <>
      {children}
      
      {/* Cart Controls - Fixed at bottom on mobile, inline on desktop */}
      <div className="fixed bottom-0 left-0 right-0 md:static md:bottom-auto md:left-auto md:right-auto bg-background md:bg-transparent border-t md:border-0 px-4 py-4 md:p-0 md:mt-8 z-30">
        <div className="container-lg">
          <div className="flex items-center gap-3">
            {quantity === 0 ? (
              <Button
                onClick={handleAdd}
                disabled={isOutOfStock || isAdding}
                size="lg"
                className={cn(
                  "w-full",
                  isAdding && "scale-95"
                )}
                aria-label={`Add ${productName} to cart`}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {isAdding ? 'Adding...' : 'Add to Cart'}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDecrement}
                  className="h-10 w-10"
                  aria-label={`Decrease quantity of ${productName}`}
                >
                  <Minus className="h-5 w-5" />
                </Button>
                <span
                  className="flex-1 text-center font-semibold text-lg"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleIncrement}
                  disabled={isOutOfStock}
                  className="h-10 w-10"
                  aria-label={`Increase quantity of ${productName}`}
                >
                  <Plus className="h-5 w-5" />
                </Button>
                <Button
                  onClick={handleAdd}
                  disabled={isOutOfStock}
                  size="lg"
                  className="ml-2 flex-1"
                  aria-label={`Add more ${productName} to cart`}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Update Cart
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Spacer for mobile to prevent content overlap */}
      <div className="h-24 md:h-0" />
    </>
  );
}
