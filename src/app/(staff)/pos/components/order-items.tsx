'use client';
import { createClient } from '@/lib/supabase/client';
import React, { use, useEffect } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EyeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderItems {
  id: string;
  order_id: string;
  item_id: string;
  name: string;
  qty: number;
  unit_price_cts: number;
  total_price_cts: number;
}
export default function OrderItems({order_id}: {order_id: string | null}) {
    const [orderItems, setOrderItems] = React.useState<OrderItems[]>([]);
    const clickedOrderId = (order:string) => {
        console.log('Clicked order ID:', order);
    };
    const fetchOrderItems = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
            .from('order_items')
            .select('*') 
            .eq('order_id', order_id);  
            console.log('Fetching order items for order_id:', data);
            if (error) {
                console.error('Error fetching order items:', error);
                return;
            }   
            setOrderItems(data || []);
        };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline"  size="sm"  className="w-full mt-2" onClick={() => fetchOrderItems()}>
            <EyeIcon className="w-3 h-3 ml-1"/> View 
        </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
            <DialogHeader>  
                <DialogTitle>Order Items</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
                {orderItems.length === 0 ? (
                    <p>No items found for this order.</p>
                ) : (   
                    orderItems.map((item) => (
                        <div key={item.id} className="p-4 border rounded-md">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-semibold">{item.name}</h3>
                                <p>Quantity: {item.qty}</p>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <p>Unit Price: ${(item.unit_price_cts / 100).toFixed(2)}</p>
                            <p>Total Price: ${(item.total_price_cts / 100).toFixed(2)}</p>
                            </div>
                            
                        </div>

                    ))
                )}  
            </div>
        </DialogContent>
    </Dialog>

  );
}