'use client';

import { useState } from 'react';
import type { Location, Table, MenuItemWithStock } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface PosClientProps {
  initialLocationsWithTables: (Location & { tables: Table[] })[];
  restaurantId: string;
  restaurantName: string;
  menuItems: MenuItemWithStock[];
}

export function PosClient({ initialLocationsWithTables, restaurantId, restaurantName, menuItems }: PosClientProps) {
  const [selectedTableId, setSelectedTableId] = useState<string | undefined>(undefined);

  const allTables = initialLocationsWithTables.flatMap(location =>
    location.tables.map(table => ({
      ...table,
      locationName: location.name,
    }))
  );

  const selectedTable = allTables.find(table => table.id === selectedTableId);

  const formatCurrency = (amountCts: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amountCts / 100);
  };

  return (
    <div className="flex h-full flex-col p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Staff POS - {restaurantName}</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-grow">
        {/* Left Pane: Table Selection & Current Order */}
        <Card className="md:w-1/3 flex flex-col">
          <CardHeader>
            <CardTitle>Table & Order</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col">
            {/* Table Selection Combobox */}
            <Label htmlFor="table-select" className="mb-2">Select Table</Label>
            <Select
              value={selectedTableId}
              onValueChange={setSelectedTableId}
            >
              <SelectTrigger id="table-select" className="w-full">
                <SelectValue placeholder="Choose a table" />
              </SelectTrigger>
              <SelectContent>
                {initialLocationsWithTables.map(location => (
                  <div key={location.id}>
                    <p className="px-2 py-1 text-sm font-semibold text-muted-foreground">{location.name}</p>
                    {location.tables.map(table => (
                      <SelectItem key={table.id} value={table.id}>
                        {table.label}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>

            {selectedTable && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <p className="text-lg font-semibold">Selected Table: {selectedTable.label}</p>
                <p className="text-sm text-muted-foreground">Location: {selectedTable.locationName}</p>
              </div>
            )}

            {/* QR Code Scan Placeholder */}
            <div className="mt-6 text-center">
              <p className="text-muted-foreground">Or scan a QR code:</p>
              <Button variant="outline" className="mt-2 w-full">Scan QR Code (Coming Soon)</Button>
            </div>

            {/* Current Order Summary Placeholder */}
            <div className="mt-8 flex-grow border-t pt-4">
              <h3 className="text-xl font-semibold mb-4">Current Order</h3>
              {selectedTableId ? (
                <div className="text-muted-foreground">
                  Order for {selectedTable?.label} will appear here.
                </div>
              ) : (
                <p className="text-muted-foreground">Select a table to view or start an order.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Pane: Menu & Order Actions */}
        <Card className="md:w-2/3 flex flex-col">
          <CardHeader>
            <CardTitle>Menu & Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col">
            {selectedTableId ? (
              <div className="flex-grow">
                <h3 className="text-xl font-semibold mb-4">Menu Items</h3>
                {menuItems.length === 0 ? (
                  <p className="text-muted-foreground">No menu items found for this restaurant.</p>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[50vh]">
                    {menuItems.map(item => (
                      <Card key={item.id} className="flex flex-col justify-between">
                        <CardHeader className="p-3 pb-0">
                          <CardTitle className="text-base">{item.name}</CardTitle>
                          {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                        </CardHeader>
                        <CardContent className="p-3 pt-2 flex justify-between items-center">
                          <span className="font-bold">{formatCurrency(item.price_cts, item.currency || 'USD')}</span>
                          <Button size="sm">Add</Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                <div className="mt-auto pt-4 border-t">
                  <Button className="w-full" disabled={!selectedTableId}>Add Items to Order</Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center flex-grow flex items-center justify-center">
                Select a table to view menu and manage orders.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
