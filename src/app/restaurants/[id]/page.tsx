'use client';

import { useParams } from 'next/navigation';
import { restaurants } from '@/lib/data';
import Link from 'next/link';

export default function RestaurantMenuPage() {
  const params = useParams();
  const { id } = params;

  const restaurant = restaurants.find(r => r.id === id);

  if (!restaurant) {
    return <div>Restaurant not found</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-purple-700">
                Foodie
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/restaurants" className="text-gray-800 hover:text-purple-700 px-3 py-2 rounded-md text-sm font-medium">
                  Restaurants
                </Link>
                <Link href="/sign-in" className="text-gray-800 hover:text-purple-700 px-3 py-2 rounded-md text-sm font-medium">
                  Sign In
                </Link>
                <Link href="/sign-up" className="bg-purple-700 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-800">
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link href="/restaurants" className="text-purple-700 hover:underline">
            &larr; Back to all restaurants
          </Link>
        </div>

        <div className="relative h-64 rounded-lg overflow-hidden mb-8">
          <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-4xl font-bold text-white tracking-tight">{restaurant.name}</h1>
          </div>
        </div>

        <div>
          {Object.entries(restaurant.menu).map(([category, items]) => (
            <div key={category} className="mb-8">
              <h2 className="text-2xl font-bold mb-4 capitalize">{category.replace(/([A-Z])/g, ' $1')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.map(item => (
                  <div key={item.name} className="bg-white rounded-lg shadow-lg flex flex-col">
                    <img src={item.image} alt={item.name} className="w-full h-40 object-cover rounded-t-lg" />
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                      <p className="text-gray-600 mb-4 flex-grow">{item.description}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-lg font-bold">${item.price.toFixed(2)}</span>
                        <button className="bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800">
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Foodie. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
