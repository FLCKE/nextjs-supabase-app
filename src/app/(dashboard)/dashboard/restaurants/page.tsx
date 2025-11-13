import { RestaurantsTable } from '@/components/restaurants/restaurants-table';
import { RestaurantCreateButton } from '@/components/restaurants/restaurant-create-button';
import { getRestaurants } from '@/lib/actions/restaurant-management';

export default async function RestaurantsPage() {
  const restaurants = await getRestaurants();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Restaurants</h1>
          <p className="text-muted-foreground">
            Manage your restaurants and their locations
          </p>
        </div>
        <RestaurantCreateButton />
      </div>

      <RestaurantsTable restaurants={restaurants} />
    </div>
  );
}
