'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Users, DollarSign, ShoppingCart, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  // Données de démonstration
  const dailyData = [
    { date: 'Lun', ventes: 4200, commandes: 24 },
    { date: 'Mar', ventes: 5100, commandes: 32 },
    { date: 'Mer', ventes: 4800, commandes: 28 },
    { date: 'Jeu', ventes: 6200, commandes: 35 },
    { date: 'Ven', ventes: 7100, commandes: 42 },
    { date: 'Sam', ventes: 8500, commandes: 51 },
    { date: 'Dim', ventes: 6800, commandes: 38 },
  ];

  const categoryData = [
    { name: 'Pizza', value: 35, color: '#ff7f50' },
    { name: 'Pâtes', value: 25, color: '#ffa500' },
    { name: 'Salades', value: 20, color: '#90ee90' },
    { name: 'Boissons', value: 20, color: '#87ceeb' },
  ];

  const stats = [
    { title: 'Chiffre d\'affaires', value: '€42,800', icon: DollarSign, color: 'bg-green-100 text-green-600' },
    { title: 'Commandes', value: '250', icon: ShoppingCart, color: 'bg-blue-100 text-blue-600' },
    { title: 'Clients', value: '1,245', icon: Users, color: 'bg-purple-100 text-purple-600' },
    { title: 'Tendance', value: '+18%', icon: TrendingUp, color: 'bg-orange-100 text-orange-600' },
  ];

  const recentOrders = [
    { id: '#2401', client: 'Table 5', montant: '€28.50', statut: 'En préparation', heure: '14:32' },
    { id: '#2400', client: 'Table 3', montant: '€15.20', statut: 'Livrée', heure: '14:28' },
    { id: '#2399', client: 'Table 1', montant: '€42.80', statut: 'Payée', heure: '14:15' },
    { id: '#2398', client: 'Commande à emporter', montant: '€19.90', statut: 'Prête', heure: '14:02' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/demo" className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold">Dashboard Principal</h1>
          </div>
          <div className="text-sm text-gray-500">
            Vue en temps réel • Semaine du 24-30 Mars
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`${stat.color} rounded-xl p-6 shadow-sm`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-75">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <Icon className="w-10 h-10 opacity-40" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Line Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-bold mb-4">Ventes & Commandes</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ventes" stroke="#ff7f50" name="Ventes (€)" />
                <Line type="monotone" dataKey="commandes" stroke="#4f46e5" name="Commandes" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-bold mb-4">Catégories</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} outerRadius={100} dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h2 className="text-lg font-bold mb-4">Commandes Récentes</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">N° Commande</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Client</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Montant</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Statut</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Heure</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{order.client}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">{order.montant}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.statut === 'En préparation' ? 'bg-yellow-100 text-yellow-700' :
                        order.statut === 'Livrée' ? 'bg-blue-100 text-blue-700' :
                        order.statut === 'Payée' ? 'bg-green-100 text-green-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {order.statut}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{order.heure}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900">Conseil</p>
            <p className="text-sm text-blue-700 mt-1">
              Le samedi est votre meilleur jour de ventes! Assurez-vous d'avoir suffisamment de stock ce jour-là.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
