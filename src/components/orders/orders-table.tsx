'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useOrdersRealtime } from '@/hooks/use-orders-realtime';
import type { OrderWithDetails } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';

interface OrdersTableProps {
  initialOrders: OrderWithDetails[];
  restaurantId?: string;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  PAYING: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  PAID: 'bg-green-500/10 text-green-500 border-green-500/20',
  SERVED: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  CANCELLED: 'bg-red-500/10 text-red-500 border-red-500/20',
  REFUNDED: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export function OrdersTable({ initialOrders, restaurantId }: OrdersTableProps) {
  const { orders: realtimeOrders, isLoading } = useOrdersRealtime(restaurantId);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const orders = isLoading ? initialOrders : realtimeOrders;

  const filteredOrders = statusFilter === 'ALL'
    ? orders
    : orders.filter((order) => order.status === statusFilter);

  const formatCurrency = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(cents / 100);
  };

  if (orders.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12 border border-dashed rounded-lg">
        <p className="text-muted-foreground">No orders yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Orders</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PAYING">Paying</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="SERVED">Served</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground">
          {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs">
                  {order.id.slice(0, 8)}
                </TableCell>
                <TableCell className="font-medium">
                  {order.table_label}
                </TableCell>
                <TableCell>{order.location_name}</TableCell>
                <TableCell>{order.item_count}</TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(order.total_gross_cts, order.currency)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={statusColors[order.status]}
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(order.created_at), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/orders/${order.id}`}>
                      View
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
