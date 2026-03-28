'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { MonerooPaymentRequest } from '@/lib/moneroo';

interface MonerooPaymentButtonProps {
  amount: number;
  orderId: string;
  customerEmail: string;
  customerPhone: string;
  customerFirstName?: string;
  customerLastName?: string;
  description?: string;
  currency?: 'USD' | 'XOF';
  onSuccess?: (transactionId: string) => void;
  onError?: (error: string) => void;
}

export function MonerooPaymentButton({
  amount,
  orderId,
  customerEmail,
  customerPhone,
  customerFirstName,
  customerLastName,
  description = 'Order Payment',
  currency = 'USD',
  onSuccess,
  onError,
}: MonerooPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Validation: require name and phone
  const hasName = customerFirstName && customerFirstName.trim().length > 0;
  const hasPhone = customerPhone && customerPhone.trim().length > 0;
  const hasValidAmount = amount && amount > 0;
  
  const isDisabled = !hasName || !hasPhone || !hasValidAmount;

  const handlePayment = async () => {
    console.log('✅ Payment button clicked!');
    console.log('Current values:', { customerFirstName, customerPhone, amount });
    
    // Validation: require name and phone
    const hasName = customerFirstName && customerFirstName.trim().length > 0;
    const hasPhone = customerPhone && customerPhone.trim().length > 0;
    const hasValidAmount = amount && amount > 0;
    
    console.log('Validation:', { hasName, hasPhone, hasValidAmount });

    // Additional validation
    if (!hasName) {
      console.warn('⚠️ No name provided');
      if (onError) onError('Please enter your name');
      return;
    }

    if (!hasPhone) {
      console.warn('⚠️ No phone provided');
      if (onError) onError('Please enter your phone number');
      return;
    }

    if (!hasValidAmount) {
      console.warn('⚠️ Invalid amount');
      if (onError) onError('Invalid amount');
      return;
    }

    console.log('✅ All validations passed, proceeding with payment...');
    setIsLoading(true);
    try {
      // Use provided values or sensible defaults
      const firstName = customerFirstName?.trim() || 'Customer';
      const lastName = customerLastName?.trim() || '';
      const email = customerEmail?.trim() || `customer-${Date.now()}@restaurant.com`;
      const phone = customerPhone?.trim() || '0700000000';

      const payload: MonerooPaymentRequest = {
        amount,
        currency,
        description: 'Order Payment',
        customerEmail: email,
        customerPhone: phone,
        customerFirstName: firstName,
        customerLastName: lastName,
        orderId,
      };

      console.log('📤 Sending payment request:', payload);

      const response = await fetch('/api/payments/moneroo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log('📥 Payment response:', { status: response.status, ok: response.ok, data });

      if (!response.ok) {
        throw new Error(data.error || 'Payment initiation failed');
      }
      console.log("les données sont :",data)
      // Redirect to payment link
      if (data.paymentLink) {
        console.log('🔗 Redirecting to payment link:', data.paymentLink);
        window.location.href = data.paymentLink;
        if (onSuccess) {
          onSuccess(data.transactionId);
        }
      } else {
        throw new Error('No payment link received from API');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Payment failed';
      console.error('❌ Moneroo payment error:', error);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading || isDisabled}
      className="w-full bg-orange-600 hover:bg-orange-700"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : isDisabled ? (
        'Please fill in your details'
      ) : (
        `Pay ${(amount / 100).toLocaleString('fr-FR', {
          style: 'currency',
          currency: 'XOF',
        })}`
      )}
    </Button>
  );
}
