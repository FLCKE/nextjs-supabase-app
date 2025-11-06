'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';

import { restaurants } from '@/lib/data';

export default function RestaurantsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('all');

  const filteredRestaurants = useMemo(() => {
    return restaurants
      .filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(restaurant =>
        cuisineFilter === 'all' || restaurant.cuisine === cuisineFilter
      );
  }, [searchTerm, cuisineFilter]);

  const cuisines = ['all', ...new Set(restaurants.map(r => r.cuisine))];

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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight">All Restaurants</h1>
          <p className="text-gray-600 mt-4 text-lg">Find the best food in town.</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search for a restaurant..."
            className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={cuisineFilter}
            onChange={e => setCuisineFilter(e.target.value)}
          >
            {cuisines.map(cuisine => (
              <option key={cuisine} value={cuisine}>{cuisine === 'all' ? 'All Cuisines' : cuisine}</option>
            ))}
          </select>
        </div>

        {/* Restaurant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRestaurants.map(restaurant => (
            <Link key={restaurant.id} href={`/restaurants/${restaurant.id}`}>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
                <img src={restaurant.image} alt={restaurant.name} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{restaurant.name}</h3>
                  <p className="text-gray-600 mb-4">{restaurant.cuisine}</p>
                  <div className="flex items-center">
                    <span className="text-purple-500">★★★★★</span>
                    <span className="text-gray-600 ml-2">{restaurant.rating}</span>
                  </div>
                </div>
              </div>
            </Link>
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
