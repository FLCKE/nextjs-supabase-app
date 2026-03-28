'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Clock, CheckCircle, AlertCircle, ChefHat, Printer } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const Orders = () => {
  const [orders, setOrders] = useState([
    {
      id: '#2405',
      table: '7',
      items: ['2x Pizza Margherita', '1x Pâtes Carbonara', '1x Salade César'],
      montant: '€45.80',
      statut: 'Reçue',
      heure: '14:58',
      priorite: 'haute',
    },
    {
      id: '#2404',
      table: '5',
      items: ['3x Burgers', '2x Frites', '1x Milk-shake'],
      montant: '€32.40',
      statut: 'En préparation',
      heure: '14:42',
      priorite: 'normale',
    },
    {
      id: '#2403',
      table: '2',
      items: ['1x Ratatouille', '1x Riz pilaf'],
      montant: '€18.60',
      statut: 'Prête à servir',
      heure: '14:25',
      priorite: 'basse',
    },
    {
      id: '#2402',
      table: '4',
      items: ['2x Couscous', '1x Harira'],
      montant: '€28.50',
      statut: 'Servie',
      heure: '14:10',
      priorite: 'normale',
    },
  ]);

  const updateOrderStatus = (id: string, newStatus: string) => {
    setOrders(orders.map(order =>
      order.id === id ? { ...order, statut: newStatus } : order
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Reçue':
        return 'bg-blue-100 text-blue-700';
      case 'En préparation':
        return 'bg-yellow-100 text-yellow-700';
      case 'Prête à servir':
        return 'bg-green-100 text-green-700';
      case 'Servie':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priorite: string) => {
    switch (priorite) {
      case 'haute':
        return 'border-l-4 border-l-red-500 bg-red-50';
      case 'normale':
        return 'border-l-4 border-l-yellow-500 bg-yellow-50';
      case 'basse':
        return 'border-l-4 border-l-green-500 bg-green-50';
      default:
        return 'bg-white';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/demo" className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold">Gestion des Commandes</h1>
          </div>
          <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Imprimer
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="bg-white rounded-lg p-4 shadow-sm"
          >
            <p className="text-sm text-gray-600">En attente</p>
            <p className="text-3xl font-bold text-red-600">1</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg p-4 shadow-sm"
          >
            <p className="text-sm text-gray-600">En cuisine</p>
            <p className="text-3xl font-bold text-yellow-600">1</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg p-4 shadow-sm"
          >
            <p className="text-sm text-gray-600">Prête</p>
            <p className="text-3xl font-bold text-green-600">1</p>
          </motion.div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order, idx) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-white rounded-lg p-6 shadow-sm ${getPriorityColor(order.priorite)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold">{order.id}</h3>
                    <span className="text-sm font-semibold px-3 py-1 bg-orange-100 text-orange-700 rounded-full">
                      Table {order.table}
                    </span>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(order.statut)}`}>
                      {order.statut}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Reçue à {order.heure}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{order.montant}</p>
                </div>
              </div>

              {/* Items */}
              <div className="bg-white bg-opacity-50 rounded p-4 mb-4">
                <ul className="space-y-2">
                  {order.items.map((item, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
                      <span className="text-orange-600">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                {order.statut === 'Reçue' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'En préparation')}
                    className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition text-sm font-medium"
                  >
                    <ChefHat className="w-4 h-4" />
                    Commencer la préparation
                  </button>
                )}
                {order.statut === 'En préparation' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'Prête à servir')}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Marquer comme prête
                  </button>
                )}
                {order.statut === 'Prête à servir' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'Servie')}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Confirmer la livraison
                  </button>
                )}
                <button className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm font-medium">
                  <Printer className="w-4 h-4" />
                  Imprimer ticket
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3"
        >
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900">Gestion efficace</p>
            <p className="text-sm text-green-700 mt-1">
              Cliquez sur les boutons d'action pour mettre à jour le statut des commandes en temps réel. Votre cuisine reçoit les notifications instantanément.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Orders;
