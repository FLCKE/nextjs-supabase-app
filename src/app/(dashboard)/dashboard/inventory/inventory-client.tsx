'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InventoryAdjustmentForm } from '@/components/inventory/inventory-adjustment-form';
import { InventoryTable } from '@/components/inventory/inventory-table';
import { StockOverview } from '@/components/inventory/stock-overview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getRestaurants } from '@/lib/actions/restaurant-management';
import { getMenuItemsWithStock, getInventoryAdjustments } from '@/lib/actions/inventory';
import type { Restaurant, MenuItemWithStock, InventoryAdjustment } from '@/types';
import { Loader2 } from 'lucide-react';

export function InventoryPageClient() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  const [menuItems, setMenuItems] = useState<MenuItemWithStock[]>([]);
  const [adjustments, setAdjustments] = useState<InventoryAdjustment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestaurantId) {
      loadInventoryData();
    }
  }, [selectedRestaurantId]);

  async function loadRestaurants() {
    try {
      const data = await getRestaurants();
      setRestaurants(data);
      
      if (data.length > 0 && !selectedRestaurantId) {
        setSelectedRestaurantId(data[0].id);
      } else if (data.length === 0) {
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to load restaurants:', error);
      setLoading(false);
    }
  }

  async function loadInventoryData() {
    setLoading(true);
    try {
      const [itemsData, adjustmentsData] = await Promise.all([
        getMenuItemsWithStock(selectedRestaurantId),
        getInventoryAdjustments(),
      ]);

      setMenuItems(itemsData);
      setAdjustments(adjustmentsData);
    } catch (error) {
      console.error('Failed to load inventory data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>No Restaurants Found</CardTitle>
            <CardDescription>
              You need to create a restaurant before managing inventory.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button
              onClick={() => router.push('/dashboard/restaurants')}
              className="text-primary hover:underline"
            >
              Go to Restaurant Management →
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">
            Track stock levels and adjustments for menu items
          </p>
        </div>
      </div>

      {/* Restaurant Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Restaurant</CardTitle>
          <CardDescription>Choose a restaurant to manage its inventory</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <Select value={selectedRestaurantId} onValueChange={setSelectedRestaurantId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a restaurant" />
              </SelectTrigger>
              <SelectContent>
                {restaurants.map((restaurant) => (
                  <SelectItem key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <InventoryAdjustmentForm menuItems={menuItems} />
        </CardContent>
      </Card>

      {selectedRestaurantId && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Stock Overview</TabsTrigger>
            <TabsTrigger value="history">Adjustment History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <StockOverview menuItems={menuItems} />
          </TabsContent>

          <TabsContent value="history">
            <InventoryTable adjustments={adjustments} menuItems={menuItems} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
