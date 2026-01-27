'use client';

import * as React from 'react';
import { Tag, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface PromoCode {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  expiresAt?: string;
  isActive: boolean;
}

interface PromoSectionProps {
  onApply?: (code: string, discount: number) => void;
  subtotal: number;
}

// Mock promo codes - replace with API call
const AVAILABLE_PROMOS: PromoCode[] = [
  {
    code: 'WELCOME10',
    description: '10% off your first order',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 20 * 100, // $20 in cents
    isActive: true,
  },
  {
    code: 'SAVE20',
    description: '$5 off orders over $30',
    discountType: 'fixed',
    discountValue: 5 * 100, // $5 in cents
    minOrderAmount: 30 * 100, // $30 in cents
    isActive: true,
  },
];

export function PromoSection({ onApply, subtotal }: PromoSectionProps) {
  const [promoCode, setPromoCode] = React.useState('');
  const [appliedCode, setAppliedCode] = React.useState<PromoCode | null>(null);
  const [isValidating, setIsValidating] = React.useState(false);

  const calculateDiscount = (code: PromoCode): number => {
    if (!code.isActive) return 0;

    if (code.minOrderAmount && subtotal < code.minOrderAmount) {
      return 0;
    }

    if (code.discountType === 'percentage') {
      const discount = Math.round((subtotal * code.discountValue) / 100);
      if (code.maxDiscount && discount > code.maxDiscount) {
        return code.maxDiscount;
      }
      return discount;
    } else {
      return code.discountValue;
    }
  };

  const handleApplyCode = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setIsValidating(true);

    try {
      // Simulate API validation
      await new Promise((resolve) => setTimeout(resolve, 500));

      const found = AVAILABLE_PROMOS.find(
        (p) => p.code.toUpperCase() === promoCode.toUpperCase()
      );

      if (!found) {
        toast.error('Invalid promo code', {
          description: 'The code you entered is not valid',
        });
        setPromoCode('');
        return;
      }

      const discount = calculateDiscount(found);

      if (discount === 0) {
        if (found.minOrderAmount) {
          const minAmount = (found.minOrderAmount / 100).toFixed(2);
          toast.error('Minimum order not met', {
            description: `This code requires a minimum order of $${minAmount}`,
          });
        } else {
          toast.error('Code expired or inactive', {
            description: 'This promo code is no longer valid',
          });
        }
        setPromoCode('');
        return;
      }

      setAppliedCode(found);
      setPromoCode('');

      if (onApply) {
        onApply(found.code, discount);
      }

      toast.success('Promo code applied!', {
        description: `You saved ${new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(discount / 100)}`,
      });
    } catch (error) {
      toast.error('Failed to apply code', {
        description: 'Please try again',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCode = () => {
    setAppliedCode(null);
    setPromoCode('');

    if (onApply) {
      onApply('', 0);
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Title */}
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <Label className="font-semibold">Promo Code</Label>
        </div>

        {/* Applied Code Display */}
        {appliedCode ? (
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">
                  {appliedCode.code}
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  {appliedCode.description}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemoveCode}
              className="h-6 w-6"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          /* Code Input Form */
          <div className="flex gap-2">
            <Input
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleApplyCode();
                }
              }}
              disabled={isValidating}
              className="text-sm"
            />
            <Button
              onClick={handleApplyCode}
              disabled={isValidating || !promoCode.trim()}
              className="px-3"
            >
              {isValidating ? 'Applying...' : 'Apply'}
            </Button>
          </div>
        )}

        {/* Available Promos */}
        {!appliedCode && (
          <div className="text-xs space-y-2 pt-2 border-t">
            <p className="text-muted-foreground font-medium">Available codes:</p>
            {AVAILABLE_PROMOS.filter((p) => p.isActive).map((promo) => (
              <button
                key={promo.code}
                onClick={() => {
                  setPromoCode(promo.code);
                }}
                className="w-full text-left p-2 rounded hover:bg-muted transition-colors"
              >
                <div className="font-mono font-bold text-primary">{promo.code}</div>
                <div className="text-muted-foreground">{promo.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
