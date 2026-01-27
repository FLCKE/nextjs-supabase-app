'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  Loader2,
  AlertCircle,
  Edit3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCartStore } from '@/lib/cart/cart-store';
import { toast } from 'sonner';

export function CartPageContent() {
  const router = useRouter();
  const {
    items,
    updateQuantity,
    updateNotes,
    removeItem,
    getSubtotal,
    getTaxes,
    getTotal,
  } = useCartStore();

  const [isEditing, setIsEditing] = React.useState(false);
  const subtotal = getSubtotal();
  const taxes = getTaxes();
  const total = getTotal();

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
    const item = items.find((i) => i.id === itemId);
    removeItem(itemId);
    if (item) {
      toast.success('Item removed', { description: item.name });
    }
  };

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="mb-6 flex justify-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">
            Add items from the menu to get started
          </p>
          <Button onClick={() => router.push('/public/menu')} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b shadow-sm">
        <div className="container-lg py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Your Cart</h1>
              <p className="text-sm text-muted-foreground">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </p>
            </div>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                {isEditing ? 'Done' : 'Edit'}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container-lg py-6" role="main">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Cart Items */}
          <section aria-labelledby="cart-items-heading">
            <h2 id="cart-items-heading" className="sr-only">
              Cart items
            </h2>
            <div className="space-y-3" role="list">
              {items.map((item) => (
                <Card key={item.id} role="listitem" className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Item Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatPrice(item.price_cts)} each
                        </p>

                        {/* Quantity Controls */}
                        <div
                          className="flex items-center gap-2 mt-3"
                          role="group"
                          aria-label={`Quantity controls for ${item.name}`}
                        >
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDecrement(item.id, item.quantity)}
                            disabled={item.quantity <= 1 || !isEditing}
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span
                            className="w-12 text-center font-semibold"
                            aria-live="polite"
                            aria-atomic="true"
                          >
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleIncrement(item.id, item.quantity)}
                            disabled={!isEditing}
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Item Notes */}
                        {isEditing && (
                          <div className="mt-3">
                            <Label htmlFor={`notes-${item.id}`} className="text-xs">
                              Special instructions (optional)
                            </Label>
                            <Textarea
                              id={`notes-${item.id}`}
                              placeholder="E.g., No onions, extra sauce..."
                              value={item.notes || ''}
                              onChange={(e) => updateNotes(item.id, e.target.value)}
                              className="mt-1 h-20 text-sm"
                              aria-label={`Special instructions for ${item.name}`}
                            />
                          </div>
                        )}
                      </div>

                      {/* Price & Remove */}
                      <div className="flex flex-col items-end gap-2">
                        <p className="font-bold text-lg">
                          {formatPrice(item.price_cts * item.quantity)}
                        </p>
                        {isEditing && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleRemove(item.id)}
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxes & Fees</span>
                <span className="font-medium">{formatPrice(taxes)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => router.push('/public/checkout')}
                disabled={items.length === 0}
                size="lg"
                className="w-full"
              >
                Proceed to Checkout
              </Button>
            </CardFooter>
          </Card>

          {/* Continue Shopping */}
          <Button
            variant="outline"
            onClick={() => router.push('/public/menu')}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Button>
        </div>
      </main>
    </div>
  );
}
