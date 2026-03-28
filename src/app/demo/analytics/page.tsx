'use client';

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Analytics = () => {
  const monthlyData = [
    { month: 'Janvier', revenue: 8200, orders: 145, customers: 320 },
    { month: 'Février', revenue: 9100, orders: 168, customers: 380 },
    { month: 'Mars', revenue: 10800, orders: 192, customers: 450 },
    { month: 'Avril', revenue: 12100, orders: 215, customers: 520 },
    { month: 'Mai', revenue: 14500, orders: 258, customers: 620 },
    { month: 'Juin', revenue: 16200, orders: 287, customers: 750 },
  ];

  const popularItems = [
    { name: 'Pizza Margherita', orders: 245, revenue: 2205 },
    { name: 'Pâtes Carbonara', orders: 198, revenue: 1980 },
    { name: 'Burger Classique', orders: 176, revenue: 1584 },
    { name: 'Salade César', orders: 142, revenue: 994 },
    { name: 'Risotto Milanese', orders: 118, revenue: 1416 },
  ];

  const hoursData = [
    { time: '10h', orders: 2 },
    { time: '11h', orders: 5 },
    { time: '12h', orders: 28 },
    { time: '13h', orders: 35 },
    { time: '14h', orders: 18 },
    { time: '18h', orders: 12 },
    { time: '19h', orders: 42 },
    { time: '20h', orders: 38 },
    { time: '21h', orders: 25 },
  ];

  const categoryData = [
    { name: 'Pizzas', value: 40, color: '#ff7f50' },
    { name: 'Pâtes', value: 25, color: '#ffa500' },
    { name: 'Salades', value: 20, color: '#90ee90' },
    { name: 'Desserts', value: 15, color: '#daa520' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/demo" className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Analytics & Statistiques</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
        >
          <h2 className="text-lg font-bold mb-4">Tendance Revenus</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `€${value}`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#ff7f50" name="Revenu (€)" />
              <Line type="monotone" dataKey="orders" stroke="#4f46e5" name="Commandes" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Peak Hours & Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Peak Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-lg font-bold mb-4">Heures de Pointe</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={hoursData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#ffa500" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-lg font-bold mb-4">Catégories</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} outerRadius={80} dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Top Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h2 className="text-lg font-bold mb-4">Menus les Plus Populaires</h2>
          <div className="space-y-4">
            {popularItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between pb-4 border-b last:border-b-0">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.orders} commandes</p>
                </div>
                <div className="text-right">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mb-1">
                    <div
                      className="bg-orange-600 h-2 rounded-full"
                      style={{ width: `${(item.orders / 245) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm font-semibold text-green-600">€{item.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Key Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-sm text-blue-600 font-semibold mb-1">HEURE DE POINTE</p>
            <p className="text-2xl font-bold text-blue-900">19h - 20h</p>
            <p className="text-xs text-blue-700 mt-2">42 commandes en moyenne</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <p className="text-sm text-green-600 font-semibold mb-1">CROISSANCE</p>
            <p className="text-2xl font-bold text-green-900">+97%</p>
            <p className="text-xs text-green-700 mt-2">Derniers 6 mois</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <p className="text-sm text-purple-600 font-semibold mb-1">PANIER MOYEN</p>
            <p className="text-2xl font-bold text-purple-900">€24.50</p>
            <p className="text-xs text-purple-700 mt-2">Augmentation de 8%</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Analytics;
