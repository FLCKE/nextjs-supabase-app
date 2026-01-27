'use client';

import * as React from 'react';
import {
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Loader2,
  Lock,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useCartStore } from '@/lib/cart/cart-store';
import { toast } from 'sonner';

interface ExtendedCheckoutPageProps {
  // Add payment provider and order options
}

export function CheckoutForm() {
  const { items, getSubtotal, getTaxes, getTotal, tableToken } = useCartStore();
  const [paymentMethod, setPaymentMethod] = React.useState<'cash' | 'card'>('card');
  const [deliveryMethod, setDeliveryMethod] = React.useState<'table' | 'pickup'>('table');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [orderConfirmed, setOrderConfirmed] = React.useState(false);
  const [orderId, setOrderId] = React.useState<string | null>(null);

  // Customer info
  const [customerName, setCustomerName] = React.useState('');
  const [customerPhone, setCustomerPhone] = React.useState('');
  const [specialInstructions, setSpecialInstructions] = React.useState('');

  const subtotal = getSubtotal();
  const taxes = getTaxes();
  const total = getTotal();

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const handleSubmitOrder = async () => {
    // Validation
    if (!customerName.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!customerPhone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate order submission
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setOrderConfirmed(true);
      setOrderId(`ORD-${Date.now().toString().slice(-8)}`);
      toast.success('Order placed successfully!');
    } catch (error) {
      toast.error('Failed to place order', {
        description: 'Please try again',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderConfirmed && orderId) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Order Confirmed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="text-2xl font-mono font-bold">{orderId}</p>
            </div>

            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900 dark:bg-blue-950 dark:text-blue-100">
              <div className="flex gap-2">
                <Clock className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Estimated Time</p>
                  <p>Your order will be ready in 15-20 minutes</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxes</span>
                <span>{formatPrice(taxes)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <p className="font-semibold">Payment: {paymentMethod === 'cash' ? 'At the counter' : 'Card'}</p>
              <p className="text-muted-foreground">Thank you for your order!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Complete Your Order</h1>
          <p className="text-muted-foreground mt-2">
            Please review your order and provide your information
          </p>
        </div>

        {/* Customer Info Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Your name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                disabled={isProcessing}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Your phone number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                disabled={isProcessing}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Delivery Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Delivery Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={deliveryMethod} onValueChange={(v: any) => setDeliveryMethod(v)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                <RadioGroupItem value="table" id="table" />
                <Label htmlFor="table" className="flex-1 cursor-pointer">
                  <span className="font-semibold">Delivery to Table</span>
                  <p className="text-sm text-muted-foreground">We'll bring it to your table</p>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                <RadioGroupItem value="pickup" id="pickup" />
                <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                  <span className="font-semibold">Pickup Counter</span>
                  <p className="text-sm text-muted-foreground">Pick up at the counter</p>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex-1 cursor-pointer">
                  <span className="font-semibold">Pay Now with Card</span>
                  <p className="text-sm text-muted-foreground">Secure online payment</p>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="flex-1 cursor-pointer">
                  <span className="font-semibold">Pay at Counter</span>
                  <p className="text-sm text-muted-foreground">Cash or card payment</p>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Special Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Special Instructions (Optional)</CardTitle>
            <CardDescription>
              Add any special requests or dietary restrictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="E.g., Extra napkins, allergies, special requests..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              disabled={isProcessing}
              className="min-h-20"
            />
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-medium">
                    {(item.price_cts * item.quantity / 100).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxes</span>
                <span className="font-medium">{formatPrice(taxes)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900 dark:bg-blue-950 dark:text-blue-100 flex gap-3">
          <Lock className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Your payment is secure</p>
            <p>All transactions are encrypted and secured by industry-standard protocols</p>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmitOrder}
          disabled={isProcessing || items.length === 0}
          size="lg"
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Order...
            </>
          ) : (
            <>
              <DollarSign className="mr-2 h-4 w-4" />
              Complete Order - {formatPrice(total)}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
