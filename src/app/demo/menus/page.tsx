'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Edit, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const Menus = () => {
  const [menus, setMenus] = useState([
    {
      id: 1,
      category: 'Pizzas',
      items: [
        { name: 'Pizza Margherita', price: 9.50, desc: 'Tomate, mozzarella, basilic' },
        { name: 'Pizza Pepperoni', price: 11.00, desc: 'Sauce tomate, mozzarella, pepperoni' },
        { name: 'Pizza 4 Fromages', price: 12.50, desc: 'Mozzarella, chèvre, bleu, parmesan' },
      ]
    },
    {
      id: 2,
      category: 'Pâtes',
      items: [
        { name: 'Pâtes Carbonara', price: 10.00, desc: 'Crème, bacon, œuf, parmesan' },
        { name: 'Pâtes Bolognaise', price: 9.50, desc: 'Sauce viande, parmesan' },
        { name: 'Pâtes Pesto', price: 8.50, desc: 'Pesto, tomate, mozzarella' },
      ]
    },
    {
      id: 3,
      category: 'Salades',
      items: [
        { name: 'Salade César', price: 7.50, desc: 'Laitue, parmesan, croutons, sauce César' },
        { name: 'Salade Mixte', price: 6.50, desc: 'Tomate, concombre, oignon, vinaigrette' },
        { name: 'Salade Niçoise', price: 8.50, desc: 'Tomate, thon, œuf, anchois' },
      ]
    },
  ]);

  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/demo" className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold">Gestion des Menus</h1>
          </div>
          <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Ajouter une catégorie
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-6 mb-8 border-l-4 border-l-orange-600"
        >
          <h2 className="text-lg font-bold mb-2">Gestion Simplifiée</h2>
          <p className="text-gray-700">
            Modifiez votre menu en temps réel. Les changements sont immédiatement visibles sur les QR codes des clients.
            Aucun délai d'attente!
          </p>
        </motion.div>

        {/* Menu Categories */}
        <div className="space-y-6">
          {menus.map((menu, menuIdx) => (
            <motion.div
              key={menu.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: menuIdx * 0.1 }}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              {/* Category Header */}
              <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{menu.category}</h2>
                  <p className="text-orange-100">{menu.items.length} articles</p>
                </div>
                <button className="bg-white text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50 transition font-medium flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Gérer
                </button>
              </div>

              {/* Items */}
              <div className="divide-y">
                {menu.items.map((item, itemIdx) => (
                  <motion.div
                    key={itemIdx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (menuIdx * 0.1) + (itemIdx * 0.05) }}
                    className="p-6 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-2xl font-bold text-green-600">€{item.price.toFixed(2)}</p>
                        <div className="flex gap-2 mt-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded transition">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Add Item */}
              <div className="p-6 bg-gray-50 border-t">
                <button className="w-full flex items-center justify-center gap-2 text-orange-600 font-medium py-2 hover:bg-gray-100 rounded transition">
                  <Plus className="w-4 h-4" />
                  Ajouter un article
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-bold text-blue-900 mb-3">Fonctionnalités</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>✓ Édition en temps réel</li>
              <li>✓ Gestion des prix</li>
              <li>✓ Descriptions personnalisées</li>
              <li>✓ Gestion des allergènes</li>
              <li>✓ Images des articles</li>
            </ul>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-bold text-green-900 mb-3">Astuces</h3>
            <ul className="space-y-2 text-sm text-green-800">
              <li>💡 Mettez à jour les prix avant les promotions</li>
              <li>💡 Signalez les articles épuisés</li>
              <li>💡 Ajoutez des images attrayantes</li>
              <li>💡 Décrivez les saveurs</li>
              <li>💡 Indiquez les portions</li>
            </ul>
          </div>
        </motion.div>

        {/* Bulk Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-white rounded-lg shadow-sm p-6"
        >
          <h2 className="text-lg font-bold mb-4">Actions en Masse</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-3 rounded-lg transition font-medium">
              Importer un menu (CSV)
            </button>
            <button className="bg-green-50 text-green-600 hover:bg-green-100 px-4 py-3 rounded-lg transition font-medium">
              Exporter le menu
            </button>
            <button className="bg-purple-50 text-purple-600 hover:bg-purple-100 px-4 py-3 rounded-lg transition font-medium">
              Dupliquer une catégorie
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Menus;
