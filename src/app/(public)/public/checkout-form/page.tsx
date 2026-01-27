'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckoutForm } from '@/components/public/checkout-form';
import { useCartStore } from '@/lib/cart/cart-store';

export default function CheckoutFormPage() {
  const searchParams = useSearchParams();
  const { setTableToken } = useCartStore();

  useEffect(() => {
    const token = searchParams.get('table_token');
    if (token) {
      setTableToken(token);
    }
  }, [searchParams, setTableToken]);

  return <CheckoutForm />;
}
