'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Minus, Trash2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import type { Location, Table, MenuItemWithStock } from '@/types';

interface CartItem {
  itemId: string;
  name: string;
  price_cts: number;
  quantity: number;
  tax_rate: number;
}

interface PosPanelProps {
  selectedTable: string | null;
  onTableSelect: (tableId: string) => void;
  locationsWithTables: (Location & { tables: Table[] })[];
  menuItems: MenuItemWithStock[];
  onOrderCreated: () => void;
  restaurantId: string;
}

export default function PosPanel({
  selectedTable,
  onTableSelect,
  locationsWithTables,
  menuItems,
  onOrderCreated,
  restaurantId,
}: PosPanelProps) {
  const supabase = createClient();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredItems = useMemo(() => {
    return menuItems.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      item.active &&
      (item.stock_mode === 'INFINITE' || (item.stock_qty && item.stock_qty > 0))
    );
  }, [menuItems, searchQuery]);

  const allTables = useMemo(() => {
    return locationsWithTables.flatMap(location =>
      location.tables.map(table => ({
        ...table,
        locationName: location.name,
      }))
    );
  }, [locationsWithTables]);

  const subtotal = cart.reduce((sum, item) => sum + (item.price_cts * item.quantity), 0);
  const taxes = cart.reduce((sum, item) => {
    const itemTotal = item.price_cts * item.quantity;
    return sum + Math.round(itemTotal * (item.tax_rate / 100));
  }, 0);
  const total = subtotal + taxes;

  const addItem = (item: MenuItemWithStock) => {
    setCart(prevCart => {
      const existing = prevCart.find(c => c.itemId === item.id);
      if (existing) {
        return prevCart.map(c =>
          c.itemId === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [
        ...prevCart,
        {
          itemId: item.id,
          name: item.name,
          price_cts: item.price_cts,
          quantity: 1,
          tax_rate: item.tax_rate || 0,
        },
      ];
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
    } else {
      setCart(prevCart =>
        prevCart.map(c => (c.itemId === itemId ? { ...c, quantity } : c))
      );
    }
  };

  const removeItem = (itemId: string) => {
    setCart(prevCart => prevCart.filter(c => c.itemId !== itemId));
  };

  const submitOrder = async () => {
    if (!selectedTable) {
      toast.error('Please select a table');
      return;
    }

    if (cart.length === 0) {
      toast.error('Please add items to the cart');
      return;
    }

    setIsSubmitting(true);
    try {
      const {data, error } = await supabase.from('orders').insert({
        restaurant_id: restaurantId,
        table_id: selectedTable,
        location_id: locationsWithTables[0]?.id, // Get from first location
        status: 'pending',
        currency: 'USD',
        total_net_cts: subtotal,
        taxes_cts: taxes,
        total_gross_cts: total,
        notes: notes || null,
      }).select();

      if (error) {
        console.error('Error creating order:', error);
        throw error;
      }
      console.log('Created order:', data);
      const {data: orderItemsData, error: itemsError } = await supabase.from('order_items').insert(
        cart.map(item => ({
          order_id: data![0].id,
          item_id: item.itemId,
          name: item.name,
          qty: item.quantity,
          unit_price_cts: item.price_cts,
          total_price_cts: item.price_cts * item.quantity,
        }))
      );

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        throw itemsError;
      }

      toast.success('Order created successfully!');
      setCart([]);
      setNotes('');
      onOrderCreated();
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      {/* Table Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Select Table</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedTable || ''} onValueChange={onTableSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a table" />
            </SelectTrigger>
            <SelectContent>
              {locationsWithTables.map(location => (
                <div key={location.id}>
                  <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                    {location.name}
                  </p>
                  {location.tables.map(table => (
                    <SelectItem key={table.id} value={table.id}>
                      {table.label}
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Search Items */}
      <div>
        <Label className="text-xs">Search Items</Label>
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mt-1"
        />
      </div>

      {/* Items List */}
      <div>
        <Label className="text-xs mb-2 block">Items</Label>
        <ScrollArea className="h-48 border rounded-lg p-2">
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <Button
                key={item.id}
                variant="outline"
                className="w-full justify-between text-xs h-auto p-2"
                onClick={() => addItem(item)}
              >
                <div className="text-left">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ${(item.price_cts / 100).toFixed(2)}
                  </p>
                </div>
                <Plus className="w-4 h-4" />
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Cart Items */}
      {cart.length > 0 && (
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Cart</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 overflow-y-auto max-h-40">
            {cart.map((item) => (
              <div key={item.itemId} className="flex items-center justify-between text-xs p-2 bg-gray-50 dark:bg-gray-900 rounded">
                <div className="flex-1">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-muted-foreground">${(item.price_cts / 100).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-destructive"
                    onClick={() => removeItem(item.itemId)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Totals */}
      {cart.length > 0 && (
        <Card className="space-y-2">
          <CardContent className="pt-4 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>${(subtotal / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taxes:</span>
              <span>${(taxes / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold border-t pt-1">
              <span>Total:</span>
              <span>${(total / 100).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {cart.length > 0 && (
        <div>
          <Label htmlFor="notes" className="text-xs">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Add notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 text-xs resize-none h-20"
          />
        </div>
      )}

      {/* Submit Button */}
      <Button
        onClick={submitOrder}
        disabled={!selectedTable || cart.length === 0 || isSubmitting}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? 'Creating...' : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Create Order
          </>
        )}
      </Button>
    </div>
  );
}
