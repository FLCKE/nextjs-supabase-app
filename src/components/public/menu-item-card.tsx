'use client';

import * as React from 'react';
import Image from 'next/image';
import { Plus, Minus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCartStore } from '@/lib/cart/cart-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MenuItemCardProps {
  id: string;
  name: string;
  description: string | null;
  price_cts: number;
  tax_rate: number;
  category: string | null;
  image_url: string | null;
  stock_mode: 'INFINITE' | 'FINITE';
  stock_qty: number | null;
  currency: string;
}

export function MenuItemCard({
  id,
  name,
  description,
  price_cts,
  tax_rate,
  category,
  image_url,
  stock_mode,
  stock_qty,
  currency,
}: MenuItemCardProps) {
  const { items, addItem, updateQuantity } = useCartStore();
  const [isAdding, setIsAdding] = React.useState(false);
  
  const cartItem = items.find((item) => item.id === id);
  const quantity = cartItem?.quantity || 0;

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(cents / 100);
  };

  const isLowStock = stock_mode === 'FINITE' && stock_qty !== null && stock_qty <= 5;
  const isOutOfStock = stock_mode === 'FINITE' && (stock_qty === null || stock_qty === 0);

  const handleAdd = () => {
    if (isOutOfStock) return;

    setIsAdding(true);
    addItem({
      id,
      name,
      price_cts,
      tax_rate,
    });

    // Announce to screen readers
    const announcement = `Added ${name} to cart. Quantity: ${quantity + 1}`;
    const liveRegion = document.getElementById('cart-announcements');
    if (liveRegion) {
      liveRegion.textContent = announcement;
    }

    toast.success('Added to cart', {
      description: name,
    });

    setTimeout(() => setIsAdding(false), 300);
  };

  const handleIncrement = () => {
    if (isOutOfStock) return;
    
    const newQuantity = quantity + 1;
    updateQuantity(id, newQuantity);

    // Announce to screen readers
    const liveRegion = document.getElementById('cart-announcements');
    if (liveRegion) {
      liveRegion.textContent = `${name} quantity increased to ${newQuantity}`;
    }
  };

  const handleDecrement = () => {
    const newQuantity = quantity - 1;
    updateQuantity(id, newQuantity);

    // Announce to screen readers
    const liveRegion = document.getElementById('cart-announcements');
    if (liveRegion) {
      if (newQuantity === 0) {
        liveRegion.textContent = `${name} removed from cart`;
      } else {
        liveRegion.textContent = `${name} quantity decreased to ${newQuantity}`;
      }
    }
  };

  return (
    <Card 
      className={cn(
        "h-full transition-all hover:shadow-md",
        isOutOfStock && "opacity-60"
      )}
      role="article"
      aria-label={`Menu item: ${name}`}
    >
      {image_url && (
        <div className="relative w-full h-48 overflow-hidden rounded-t-lg bg-muted">
          <Image
            src={image_url}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Badge variant="destructive" className="text-base">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>
      )}
      
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2">{name}</CardTitle>
          <span className="text-lg font-bold whitespace-nowrap">
            {formatPrice(price_cts)}
          </span>
        </div>
        
        {description && (
          <CardDescription className="line-clamp-2">
            {description}
          </CardDescription>
        )}
      </CardHeader>

      <CardFooter className="flex flex-col gap-3">
        <div className="flex items-center gap-2 w-full">
          {category && (
            <Badge variant="secondary" className="text-xs">
              {category}
            </Badge>
          )}
          {tax_rate > 0 && (
            <Badge variant="outline" className="text-xs">
              +{tax_rate}% tax
            </Badge>
          )}
          {isLowStock && !isOutOfStock && (
            <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-600 border-orange-500/20">
              Only {stock_qty} left
            </Badge>
          )}
        </div>

        {quantity === 0 ? (
          <Button
            onClick={handleAdd}
            disabled={isOutOfStock || isAdding}
            className={cn(
              "w-full",
              isAdding && "scale-95"
            )}
            aria-label={`Add ${name} to cart`}
          >
            {isAdding ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Added
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add to Cart
              </>
            )}
          </Button>
        ) : (
          <div 
            className="flex items-center justify-between w-full gap-2"
            role="group"
            aria-label={`Quantity controls for ${name}`}
          >
            <Button
              variant="outline"
              size="icon"
              onClick={handleDecrement}
              aria-label={`Decrease quantity of ${name}`}
            >
              <Minus className="h-4 w-4" />
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
              aria-label={`Increase quantity of ${name}`}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
