'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { OrderWithItems } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { updateOrderStatus } from '@/lib/actions/order-actions';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface OrderDetailProps {
  order: OrderWithItems;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  PAYING: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  PAID: 'bg-green-500/10 text-green-500 border-green-500/20',
  SERVED: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  CANCELLED: 'bg-red-500/10 text-red-500 border-red-500/20',
  REFUNDED: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export function OrderDetail({ order }: OrderDetailProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: order.currency || 'USD',
    }).format(cents / 100);
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const result = await updateOrderStatus(order.id, newStatus);
      
      if (result.success) {
        toast.success('Order status updated');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to update order status');
      }
    } catch (error) {
      toast.error('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Order Details</h1>
          <p className="text-muted-foreground">
            Order ID: {order.id}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/orders')}
        >
          Back to Orders
        </Button>
      </div>

      {/* Order Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Table</div>
              <div className="font-medium">{order.table_label}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Location</div>
              <div className="font-medium">{order.location_name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Created</div>
              <div className="font-medium">
                {format(new Date(order.created_at), 'PPpp')}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Last Updated</div>
              <div className="font-medium">
                {format(new Date(order.updated_at), 'PPpp')}
              </div>
            </div>
            {order.notes && (
              <div>
                <div className="text-sm text-muted-foreground">Notes</div>
                <div className="font-medium">{order.notes}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status & Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-2">Current Status</div>
              <Badge
                variant="outline"
                className={`${statusColors[order.status]} text-base py-1 px-3`}
              >
                {order.status}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Change Status</div>
              <Select
                value={order.status}
                onValueChange={handleStatusChange}
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PAYING">Paying</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="SERVED">Served</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {formatCurrency(order.total_net_cts)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxes</span>
                <span className="font-medium">
                  {formatCurrency(order.taxes_cts)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span>{formatCurrency(order.total_gross_cts)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-right">{item.qty}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.unit_price_cts)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(item.total_price_cts)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
