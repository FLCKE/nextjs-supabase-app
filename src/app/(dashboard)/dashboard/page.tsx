'use client';

import * as React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Download, TrendingUp, ShoppingCart, Users, DollarSign } from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  currency?: string;
}

export default function DashboardPage() {
  const [selectedRestaurant, setSelectedRestaurant] = React.useState<Restaurant>({
    id: '1',
    name: 'Main Restaurant',
    currency: 'USD',
  });

  const restaurants: Restaurant[] = [
    { id: '1', name: 'Main Restaurant', currency: 'USD' },
    { id: '2', name: 'Downtown Branch', currency: 'USD' },
    { id: '3', name: 'Airport Location', currency: 'EUR' },
  ];

  return (
      <>
      <div className="mb-4">
        <h1  className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
              Welcome back! Here's what's happening with your restaurants today.            </p>
      </div>
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Today</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+124</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +12% from yesterday
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tables</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              8 occupied, 4 available
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$32.50</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +5% from last week
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              You have 12 active orders right now
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Table 5 - Order #1234
                  </p>
                  <p className="text-sm text-muted-foreground">
                    2 Burgers, 1 Salad • $45.00
                  </p>
                </div>
                <div className="ml-auto font-medium">12:34 PM</div>
              </div>
              <div className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Table 3 - Order #1235
                  </p>
                  <p className="text-sm text-muted-foreground">
                    3 Pizzas, 2 Drinks • $72.00
                  </p>
                </div>
                <div className="ml-auto font-medium">12:28 PM</div>
              </div>
              <div className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Table 8 - Order #1236
                  </p>
                  <p className="text-sm text-muted-foreground">
                    1 Steak, 1 Wine • $65.00
                  </p>
                </div>
                <div className="ml-auto font-medium">12:15 PM</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Today's Performance</CardTitle>
            <CardDescription>
              Real-time metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Peak Hour</span>
                <span className="text-sm text-muted-foreground">12:00 - 1:00 PM</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Busiest Table</span>
                <span className="text-sm text-muted-foreground">Table 5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Top Item</span>
                <span className="text-sm text-muted-foreground">Cheeseburger</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avg. Wait Time</span>
                <span className="text-sm text-muted-foreground">15 min</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
