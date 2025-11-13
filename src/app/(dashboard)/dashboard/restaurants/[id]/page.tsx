import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LocationsTab } from '@/components/restaurants/locations-tab';
import { TablesTab } from '@/components/restaurants/tables-tab';
import {
  getRestaurant,
  getLocations,
  getTables,
} from '@/lib/actions/restaurant-management';
import type { Table } from '@/types';

interface RestaurantDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RestaurantDetailPage({
  params,
}: RestaurantDetailPageProps) {
  const { id } = await params;
  const restaurant = await getRestaurant(id);

  if (!restaurant) {
    notFound();
  }

  const locations = await getLocations(id);

  const tablesByLocation: Record<string, Table[]> = {};
  for (const location of locations) {
    const tables = await getTables(location.id);
    tablesByLocation[location.id] = tables;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/dashboard/restaurants">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Restaurants
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">{restaurant.name}</h1>
        <p className="text-muted-foreground">
          {restaurant.legal_name} • {restaurant.country} • {restaurant.currency}
        </p>
      </div>

      <Tabs defaultValue="locations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
        </TabsList>

        <TabsContent value="locations" className="space-y-4">
          <LocationsTab restaurantId={id} locations={locations} />
        </TabsContent>

        <TabsContent value="tables" className="space-y-4">
          <TablesTab
            restaurantId={id}
            locations={locations}
            tablesByLocation={tablesByLocation}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
