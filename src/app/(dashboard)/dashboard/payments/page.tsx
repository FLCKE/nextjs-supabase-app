'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface Payment {
  id: string;
  order_id: string;
  transaction_id: string;
  amount_cts: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_method: string;
  checkout_url: string | null;
  customer_email: string;
  customer_phone: string;
  customer_name: string;
  created_at: string;
  updated_at: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        const supabase = createClient();

        let query = supabase
          .from('payments')
          .select('*')
          .order('created_at', { ascending: false });

        if (filter !== 'all') {
          query = query.eq('status', filter);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching payments:', error);
          return;
        }

        setPayments(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [filter]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      completed: 'default',
      failed: 'destructive',
      cancelled: 'outline',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatAmount = (cts: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(cts / 100);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payments</h1>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'pending', 'completed', 'failed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === status
                ? 'bg-orange-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Payments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      ) : payments.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">No payments found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <Card key={payment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {/* Transaction ID */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Transaction ID</p>
                    <p className="font-mono text-sm">{payment.transaction_id}</p>
                  </div>

                  {/* Customer */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Customer</p>
                    <p className="text-sm font-medium">{payment.customer_name}</p>
                    <p className="text-xs text-gray-600">{payment.customer_email}</p>
                  </div>

                  {/* Amount */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Amount</p>
                    <p className="text-lg font-bold text-orange-600">
                      {formatAmount(payment.amount_cts, payment.currency)}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Status</p>
                    {getStatusBadge(payment.status)}
                  </div>

                  {/* Date */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Date</p>
                    <p className="text-sm text-gray-600">{formatDate(payment.created_at)}</p>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-mono text-xs">{payment.customer_phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Method</p>
                    <p className="font-medium text-xs">{payment.payment_method}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Order ID</p>
                    <p className="font-mono text-xs">{payment.order_id.slice(0, 8)}...</p>
                  </div>
                  {payment.checkout_url && (
                    <div>
                      <p className="text-xs text-gray-500">Checkout URL</p>
                      <a
                        href={payment.checkout_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-600 hover:underline text-xs"
                      >
                        View →
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      {payments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{payments.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {payments.filter((p) => p.status === 'completed').length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">
                {payments.filter((p) => p.status === 'pending').length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">
                {payments.filter((p) => p.status === 'failed').length}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
