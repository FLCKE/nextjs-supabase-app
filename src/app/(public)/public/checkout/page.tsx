'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Plus, Minus, Trash2, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCartStore } from '@/lib/cart/cart-store';
import { createPublicOrder } from '@/lib/actions/public-menu-actions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const {
    items,
    tableToken,
    setTableToken,
    updateQuantity,
    removeItem,
    updateNotes,
    clearCart,
    getSubtotal,
    getTaxes,
    getTotal,
  } = useCartStore();

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [orderId, setOrderId] = React.useState<string | null>(null);
  const [isOffline, setIsOffline] = React.useState(false);

  // Restore table token from URL if not in store
  React.useEffect(() => {
    const urlToken = searchParams.get('table_token');
    if (urlToken && !tableToken) {
      setTableToken(urlToken);
    }
  }, [searchParams, tableToken, setTableToken]);

  const subtotal = getSubtotal();
  const taxes = getTaxes();
  const total = getTotal();

  // Detect offline status
  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    setIsOffline(!navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Redirect if empty cart
  React.useEffect(() => {
    if (items.length === 0 && !orderId) {
      router.push('/public/menu');
    }
  }, [items.length, orderId, router]);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const handleIncrement = (itemId: string, currentQty: number) => {
    updateQuantity(itemId, currentQty + 1);
    
    // Announce to screen readers
    const item = items.find((i) => i.id === itemId);
    if (item) {
      const liveRegion = document.getElementById('cart-announcements');
      if (liveRegion) {
        liveRegion.textContent = `${item.name} quantity increased to ${currentQty + 1}`;
      }
    }
  };

  const handleDecrement = (itemId: string, currentQty: number) => {
    if (currentQty > 1) {
      updateQuantity(itemId, currentQty - 1);
      
      const item = items.find((i) => i.id === itemId);
      if (item) {
        const liveRegion = document.getElementById('cart-announcements');
        if (liveRegion) {
          liveRegion.textContent = `${item.name} quantity decreased to ${currentQty - 1}`;
        }
      }
    }
  };

  const handleRemove = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    removeItem(itemId);
    
    if (item) {
      const liveRegion = document.getElementById('cart-announcements');
      if (liveRegion) {
        liveRegion.textContent = `${item.name} removed from cart`;
      }
      toast.success('Item removed', { description: item.name });
    }
  };

  const handleConfirmOrder = async () => {
    const currentToken = tableToken || searchParams.get('table_token');
    
    if (!currentToken) {
      toast.error('Invalid session', {
        description: 'Please scan the QR code again to start a new order',
      });
      // Redirect to menu to restart
      setTimeout(() => router.push('/public/menu'), 2000);
      return;
    }

    if (isOffline) {
      toast.error('No internet connection', {
        description: 'Please check your connection and try again',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems = items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price_cts: item.price_cts,
        name: item.name,
      }));

      const generalNotes = items
        .filter((item) => item.notes)
        .map((item) => `${item.name}: ${item.notes}`)
        .join('\n');

      const result = await createPublicOrder(
        currentToken,
        orderItems,
        generalNotes || undefined
      );

      if (result.success) {
        setOrderId('success');
        toast.success('Order placed successfully!', {
          description: 'Your order has been sent to the kitchen',
        });
        clearCart();
      } else {
        toast.error('Failed to place order', {
          description: result.error || 'Please try again',
        });
      }
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Failed to place order', {
        description: 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayNow = () => {
    // TODO: Integrate with payment provider (Stripe)
    toast.info('Payment integration coming soon', {
      description: 'Please pay at the counter',
    });
    
    clearCart();
    router.push('/public/menu');
  };

  // Order confirmation screen
  if (orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Order ID</p>
              <p className="text-xl font-mono font-bold">{orderId.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Your order has been sent to the kitchen. We'll bring it to your table shortly.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button onClick={handlePayNow} className="w-full" size="lg">
              Pay Now ({formatPrice(total)})
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                clearCart();
                router.push('/public/menu');
              }}
              className="w-full"
            >
              Back to Menu
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Empty cart fallback
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-4">Add items from the menu to get started</p>
          <Button onClick={() => router.push('/public/menu')}>
            Browse Menu
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
            <h1 className="text-xl font-bold">Review Order</h1>
          </div>
        </div>
      </header>

      {/* Offline Banner */}
      {isOffline && (
        <div className="bg-destructive text-destructive-foreground py-2 px-4 text-center text-sm">
          <strong>No internet connection.</strong> Please check your connection to place orders.
        </div>
      )}

      {/* Live region for screen reader announcements */}
      <div
        id="cart-announcements"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      <main className="container-lg py-6" role="main">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Cart Items */}
          <section aria-labelledby="cart-items-heading">
            <h2 id="cart-items-heading" className="text-lg font-semibold mb-4">
              Your Items ({items.length})
            </h2>
            <div className="space-y-3" role="list" aria-label="Cart items">
              {items.map((item) => (
                <Card key={item.id} role="listitem">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
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
                            disabled={item.quantity <= 1}
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
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Item Notes */}
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
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <p className="font-bold">
                          {formatPrice(item.price_cts * item.quantity)}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleRemove(item.id)}
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
                <span className="text-muted-foreground">Taxes</span>
                <span className="font-medium">{formatPrice(taxes)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleConfirmOrder}
                disabled={isSubmitting || isOffline || items.length === 0}
                size="lg"
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  'Confirm Order'
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
