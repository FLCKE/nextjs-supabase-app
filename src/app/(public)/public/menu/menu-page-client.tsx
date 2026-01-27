'use client';

import { ReactNode } from 'react';
import { CartDrawer } from '@/components/public/cart-drawer';
import { useCartDrawerStore } from '@/lib/cart/cart-drawer-store';

interface MenuPageClientProps {
  children: ReactNode;
}

export function MenuPageClient({ children }: MenuPageClientProps) {
  const { isOpen, closeCart } = useCartDrawerStore();

  return (
    <>
      {children}
      <CartDrawer isOpen={isOpen} onClose={closeCart} />
    </>
  );
}
