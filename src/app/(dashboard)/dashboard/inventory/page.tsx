'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StockOverview } from '@/components/inventory/stock-overview';
import { HistoryTable } from '@/components/inventory/history-table';
import { AdjustmentForm } from '@/components/inventory/adjustment-form';
import { getInventoryAdjustments } from '@/lib/actions/inventory';
import { getMenusByRestaurant, getMenuItemsByMenu } from '@/lib/actions/menu-actions';
import { getUserRestaurants } from '@/lib/actions/restaurant-management';
import { Package, Plus, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import type { Restaurant, Menu, MenuItem } from '@/types';

export default function InventoryPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  const [items, setItems] = useState<MenuItem[]>([]);
  const [adjustments, setAdjustments] = useState<any[]>([]);
  const [stockData, setStockData] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>();
  const [filterType, setFilterType] = useState<'ALL' | 'IN' | 'OUT' | 'SPOILAGE'>('ALL');

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestaurantId) {
      loadMenusAndItems();
    }
  }, [selectedRestaurantId]);

  const loadRestaurants = async () => {
    setIsLoading(true);
    try {
      const data = await getUserRestaurants();
      setRestaurants(data);
      if (data.length > 0) {
        setSelectedRestaurantId(data[0].id);
      }
    } catch (error) {
      toast.error('Failed to load restaurants');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMenusAndItems = async () => {
    setIsLoading(true);
    try {
      const result = await getMenusByRestaurant(selectedRestaurantId);
      if (result.success && result.data) {
        const allItems: MenuItem[] = [];
        for (const menu of result.data) {
          const itemsResult = await getMenuItemsByMenu(menu.id);
          if (itemsResult.success && itemsResult.data) {
            allItems.push(...itemsResult.data);
          }
        }
        setItems(allItems);
        await loadAdjustments();
        calculateStock(allItems);
      }
    } catch (error) {
      toast.error('Failed to load menu items');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAdjustments = async () => {
    try {
      const data = await getInventoryAdjustments();
      setAdjustments(data);
    } catch (error) {
      toast.error('Failed to load adjustments');
    }
  };

  const calculateStock = async (itemList: MenuItem[]) => {
    const data = await getInventoryAdjustments();
    const stockMap: Record<string, number> = {};
    
    itemList.forEach((item) => {
      if (item.stock_mode === 'FINITE') {
        const itemAdjustments = data.filter((adj: any) => adj.item_id === item.id);
        const stockIn = itemAdjustments
          .filter((adj: any) => adj.type === 'IN')
          .reduce((sum: number, adj: any) => sum + adj.quantity, 0);
        const stockOut = itemAdjustments
          .filter((adj: any) => adj.type === 'OUT')
          .reduce((sum: number, adj: any) => sum + adj.quantity, 0);
        const spoilage = itemAdjustments
          .filter((adj: any) => adj.type === 'SPOILAGE')
          .reduce((sum: number, adj: any) => sum + adj.quantity, 0);
        
        stockMap[item.id] = stockIn - stockOut - spoilage;
      }
    });
    
    setStockData(stockMap);
  };

  const handleAddAdjustment = (itemId?: string) => {
    setSelectedItemId(itemId);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    loadMenusAndItems();
  };

  const filteredAdjustments = adjustments.filter((adj) => {
    if (filterType === 'ALL') return true;
    return adj.type === filterType;
  });

  const finiteItems = items.filter((item) => item.stock_mode === 'FINITE');
  const lowStockItems = finiteItems.filter(
    (item) => stockData[item.id] !== undefined && stockData[item.id] <= 5 && stockData[item.id] > 0
  );
  const outOfStockItems = finiteItems.filter(
    (item) => stockData[item.id] === 0
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Restaurant Found</h2>
          <p className="text-muted-foreground mb-4">
            Create a restaurant first to manage inventory.
          </p>
          <Button onClick={() => window.location.href = '/dashboard/restaurants'}>
            Create Restaurant
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">Inventory Management</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage your menu item stock levels
            </p>
          </div>
          <Button onClick={() => handleAddAdjustment()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Adjustment
          </Button>
        </div>

        {restaurants.length > 1 && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Restaurant:</label>
            <Select value={selectedRestaurantId} onValueChange={setSelectedRestaurantId}>
              <SelectTrigger className="w-[250px]">
                <SelectValue />
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
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finiteItems.length}</div>
            <p className="text-xs text-muted-foreground">Tracked items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Items running low</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Items depleted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Adjustments</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adjustments.length}</div>
            <p className="text-xs text-muted-foreground">Total recorded</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="stock" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stock">Current Stock</TabsTrigger>
          <TabsTrigger value="history">Adjustment History</TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock Levels</CardTitle>
              <CardDescription>
                View and manage current stock levels for all items with finite stock tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StockOverview
                items={items}
                stockData={stockData}
                onAddAdjustment={handleAddAdjustment}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Adjustment History</CardTitle>
                  <CardDescription>
                    View all inventory adjustments for your items
                  </CardDescription>
                </div>
                <Select
                  value={filterType}
                  onValueChange={(value: any) => setFilterType(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="IN">Stock In</SelectItem>
                    <SelectItem value="OUT">Stock Out</SelectItem>
                    <SelectItem value="SPOILAGE">Spoilage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <HistoryTable adjustments={filteredAdjustments} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AdjustmentForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        items={items}
        selectedItemId={selectedItemId}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
