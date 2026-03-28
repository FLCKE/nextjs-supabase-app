'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { MonerooPaymentRequest } from '@/lib/moneroo';

export function MonerooPaymentForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<'USD' | 'XOF'>('USD');
  const [formData, setFormData] = useState({
    amount: '',
    orderId: '',
    customerEmail: '',
    customerPhone: '',
    description: 'Payment',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrency(e.target.value as 'USD' | 'XOF');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const amountInCents = Math.round(parseFloat(formData.amount) * 100);

      const payload: MonerooPaymentRequest = {
        amount: amountInCents,
        currency,
        description: formData.description,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        orderId: formData.orderId,
      };

      const response = await fetch('/api/payments/moneroo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log('Payment API Response:', data);
      console.log('Response Status:', response.status);

      if (!response.ok) {
        throw new Error(data.error || 'Payment initiation failed');
      }

      setSuccess(true);

      // Check for payment link in response
      const transactionId = data.transactionId || data.transaction_id || data.id;
      let paymentLink = data.paymentLink || data.payment_link || data.checkout_url;

      console.log('Transaction ID:', transactionId);
      console.log('Payment Link:', paymentLink);

      if (transactionId && !paymentLink) {
        console.log('No payment link in response, polling for webhook...');
        
        // Poll with exponential backoff (up to 30 seconds)
        let attempts = 0;
        const maxAttempts = 12;
        let delay = 500; // Start with 500ms
        
        while (!paymentLink && attempts < maxAttempts) {
          attempts++;
          delay = Math.min(delay * 1.5, 5000); // Exponential backoff, max 5s
          
          console.log(`Polling attempt ${attempts}/${maxAttempts}, delay: ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          const linkResponse = await fetch('/api/payments/moneroo/link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transactionId }),
          });
          
          const linkData = await linkResponse.json();
          console.log(`Polling response attempt ${attempts}:`, linkData);
          
          if (linkResponse.ok && linkData.paymentLink) {
            paymentLink = linkData.paymentLink;
            console.log('Payment link received via polling!');
            break;
          }
        }
      }

      // Redirect to payment link after showing success
      if (paymentLink) {
        console.log('Redirecting to:', paymentLink);
        setTimeout(() => {
          window.location.href = paymentLink;
        }, 2000);
      } else {
        throw new Error('Payment link not available. Please check the browser console for details.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Moneroo Payment</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-red-50 p-3 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-green-50 p-3 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Redirecting to payment...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="currency">Currency</Label>
            <select
              id="currency"
              value={currency}
              onChange={handleCurrencyChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="USD">USD (United States)</option>
              <option value="XOF">XOF (CFA Franc - Benin)</option>
            </select>
          </div>

          <div>
            <Label htmlFor="amount">Amount ({currency})</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              required
              placeholder="1000"
            />
          </div>

          <div>
            <Label htmlFor="orderId">Order ID</Label>
            <Input
              id="orderId"
              name="orderId"
              value={formData.orderId}
              onChange={handleChange}
              required
              placeholder="ORD-12345"
            />
          </div>

          <div>
            <Label htmlFor="customerEmail">Email</Label>
            <Input
              id="customerEmail"
              name="customerEmail"
              type="email"
              value={formData.customerEmail}
              onChange={handleChange}
              required
              placeholder="customer@example.com"
            />
          </div>

          <div>
            <Label htmlFor="customerPhone">Phone</Label>
            <Input
              id="customerPhone"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleChange}
              required
              placeholder={currency === 'USD' ? '4149518161' : '+22900000000'}
            />
            {currency === 'USD' && (
              <p className="text-xs text-gray-500 mt-1">
                Test: 4149518161 (success), 4149518162 (failed), 4149518163 (pending)
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Order description"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Pay with Moneroo'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
