'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Home() {
  const [userType, setUserType] = useState('client'); // 'client' or 'restaurant'

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeInOut' } },
  };

  return (
    <div className="bg-white text-gray-800 font-sans">
      {/* Header */}
      <header className="absolute top-0 left-0 w-full z-20 bg-transparent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <Link href="/" className="text-3xl font-bold text-white tracking-wider">
                Foodie
              </Link>
            </motion.div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => setUserType('client')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${userType === 'client' ? 'bg-purple-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
                  Client
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => setUserType('restaurant')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${userType === 'restaurant' ? 'bg-purple-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
                  Restaurant
                </motion.button>
                <Link href="/sign-in" className="text-gray-300 hover:text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
                  Sign In
                </Link>
                <Link href="/sign-up" className="bg-purple-700 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-purple-800 transition-colors">
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {userType === 'client' ? (
        <>
          {/* Hero Section - Client */}
          <section
            className="relative bg-cover bg-center bg-no-repeat h-screen flex items-center justify-center text-white"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836')" }}
          >
            <div className="absolute inset-0 bg-black opacity-60"></div>
            <div className="relative z-10 text-center px-4">
              <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-5xl md:text-7xl font-extrabold leading-tight mb-4 tracking-tight">
                Your Cravings, Delivered.
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
                Experience the convenience of having your favorite meals delivered right to your door.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}>
                <Link href="/restaurants" className="bg-purple-700 text-white font-bold py-4 px-10 rounded-full text-lg hover:bg-purple-800 transition duration-300 transform hover:scale-105">
                  Find Food
                </Link>
              </motion.div>
            </div>
          </section>

          {/* Features Section - Client */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants} className="py-24 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold tracking-tight">Why You'll Love Foodie</h2>
                <p className="text-gray-600 mt-4 text-lg">The ultimate food delivery experience.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <motion.div whileHover={{ y: -10 }} className="text-center p-8 bg-white rounded-xl shadow-lg">
                  <h3 className="text-2xl font-semibold mb-4">Lightning-Fast Delivery</h3>
                  <p className="text-gray-600">Your food, delivered at the speed of light. Well, almost.</p>
                </motion.div>
                <motion.div whileHover={{ y: -10 }} className="text-center p-8 bg-white rounded-xl shadow-lg">
                  <h3 className="text-2xl font-semibold mb-4">Endless Choices</h3>
                  <p className="text-gray-600">From local gems to popular chains, we have it all.</p>
                </motion.div>
                <motion.div whileHover={{ y: -10 }} className="text-center p-8 bg-white rounded-xl shadow-lg">
                  <h3 className="text-2xl font-semibold mb-4">Seamless Ordering</h3>
                  <p className="text-gray-600">Order in seconds with our easy-to-use app.</p>
                </motion.div>
              </div>
            </div>
          </motion.section>
        </>
      ) : (
        <>
          {/* Hero Section - Restaurant */}
          <section
            className="relative bg-cover bg-center bg-no-repeat h-screen flex items-center justify-center text-white"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556911220-bff31c812dba')" }}
          >
            <div className="absolute inset-0 bg-black opacity-60"></div>
            <div className="relative z-10 text-center px-4">
              <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-5xl md:text-7xl font-extrabold leading-tight mb-4 tracking-tight">
                Partner with Foodie, Grow Your Reach
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
                Join our network of restaurants and connect with a new wave of customers.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}>
                <Link href="/join" className="bg-purple-700 text-white font-bold py-4 px-10 rounded-full text-lg hover:bg-purple-800 transition duration-300 transform hover:scale-105">
                  Become a Partner
                </Link>
              </motion.div>
            </div>
          </section>

          {/* Features Section - Restaurant */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants} className="py-24 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold tracking-tight">Supercharge Your Business</h2>
                <p className="text-gray-600 mt-4 text-lg">The tools you need to succeed in the digital age.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <motion.div whileHover={{ y: -10 }} className="text-center p-8 bg-white rounded-xl shadow-lg">
                  <h3 className="text-2xl font-semibold mb-4">Expand Your Customer Base</h3>
                  <p className="text-gray-600">Tap into our large and growing community of food lovers.</p>
                </motion.div>
                <motion.div whileHover={{ y: -10 }} className="text-center p-8 bg-white rounded-xl shadow-lg">
                  <h3 className="text-2xl font-semibold mb-4">Streamlined Operations</h3>
                  <p className="text-gray-600">Manage orders, menus, and payments all in one place.</p>
                </motion.div>
                <motion.div whileHover={{ y: -10 }} className="text-center p-8 bg-white rounded-xl shadow-lg">
                  <h3 className="text-2xl font-semibold mb-4">Powerful Insights</h3>
                  <p className="text-gray-600">Gain valuable data to optimize your business and drive growth.</p>
                </motion.div>
              </div>
            </div>
          </motion.section>
        </>
      )}

      {/* Common Sections */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants} className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <h3 className="text-2xl font-semibold mb-2">1. Discover</h3>
              <p className="text-gray-600">Explore a world of culinary delights from the comfort of your home.</p>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-semibold mb-2">2. Order</h3>
              <p className="text-gray-600">With a few simple clicks, your next meal is on its way.</p>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-semibold mb-2">3. Enjoy</h3>
              <p className="text-gray-600">Experience happiness in every bite, delivered right to your door.</p>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants} className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Featured Restaurants</h2>
            <p className="text-gray-600 mt-2">A taste of the best on our platform.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div whileHover={{ y: -10 }} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c" alt="Restaurant 1" className="w-full h-56 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">The Golden Spoon</h3>
                <p className="text-gray-600 mb-4">Italian Cuisine</p>
              </div>
            </motion.div>
            <motion.div whileHover={{ y: -10 }} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38" alt="Restaurant 2" className="w-full h-56 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">El Pescador</h3>
                <p className="text-gray-600 mb-4">Seafood</p>
              </div>
            </motion.div>
            <motion.div whileHover={{ y: -10 }} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd" alt="Restaurant 3" className="w-full h-56 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Green Leaf Cafe</h3>
                <p className="text-gray-600 mb-4">Vegan & Organic</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Foodie. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
