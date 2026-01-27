'use client';

import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/cart/cart-store';
import { useCartDrawerStore } from '@/lib/cart/cart-drawer-store';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CartButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
}

export function CartButton({ className, variant = 'outline' }: CartButtonProps) {
  const itemCount = useCartStore((state) => state.getItemCount());
  const { openCart } = useCartDrawerStore();

  return (
    <Button
      onClick={openCart}
      size="icon"
      variant={variant}
      className={cn('relative', className)}
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 && (
        <Badge
          className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
          variant="destructive"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </Badge>
      )}
    </Button>
  );
}
