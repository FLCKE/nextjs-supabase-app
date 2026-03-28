'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Download, Copy, QrCode } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const QRDemo = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const tables = [
    { number: 1, qr: '🔲' },
    { number: 2, qr: '🔲' },
    { number: 3, qr: '🔲' },
    { number: 4, qr: '🔲' },
    { number: 5, qr: '🔲' },
    { number: 6, qr: '🔲' },
    { number: 7, qr: '🔲' },
    { number: 8, qr: '🔲' },
  ];

  const handleCopy = (tableNum: number) => {
    setCopied(`table-${tableNum}`);
    setTimeout(() => setCopied(null), 2000);
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
            <h1 className="text-2xl font-bold">QR Codes Tables</h1>
          </div>
          <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition flex items-center gap-2">
            <Download className="w-4 h-4" />
            Télécharger tout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-6 mb-8 border-l-4 border-l-blue-600"
        >
          <h2 className="text-lg font-bold mb-2">Comment ça marche?</h2>
          <p className="text-gray-700 mb-4">
            Chaque table a un QR code unique. Les clients scannent le code avec leur téléphone pour accéder au menu et commander directement à leur table.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex gap-3">
              <span className="text-2xl">📱</span>
              <div>
                <p className="font-semibold">1. Client scanne</p>
                <p className="text-sm text-gray-600">Le client scanne le QR code</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">🍽️</span>
              <div>
                <p className="font-semibold">2. Accès menu</p>
                <p className="text-sm text-gray-600">Accès immédiat au menu</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">📦</span>
              <div>
                <p className="font-semibold">3. Commande</p>
                <p className="text-sm text-gray-600">Commande reçue en cuisine</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tables.map((table, idx) => (
            <motion.div
              key={table.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition"
            >
              {/* Table Number */}
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-2">Table</p>
                <p className="text-4xl font-bold text-orange-600">{table.number}</p>
              </div>

              {/* QR Code Placeholder */}
              <div className="bg-gray-100 rounded-lg p-4 mb-4 flex items-center justify-center h-48 border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">QR Code</p>
                  <p className="text-xs text-gray-400 mt-1">
                    https://resto.pay/table/{table.number}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => handleCopy(table.number)}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition text-sm font-medium ${
                    copied === `table-${table.number}`
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  {copied === `table-${table.number}` ? 'Copié!' : 'Copier lien'}
                </button>
                <button className="w-full flex items-center justify-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-lg hover:bg-orange-200 transition text-sm font-medium">
                  <Download className="w-4 h-4" />
                  Télécharger
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Print Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-white rounded-lg p-8 shadow-sm"
        >
          <h2 className="text-lg font-bold mb-6">Aperçu d'impression</h2>
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-4 rounded border-2 border-gray-300 aspect-square flex flex-col items-center justify-center">
                <p className="text-sm font-bold mb-2">Table {i}</p>
                <div className="w-20 h-20 bg-gray-200 rounded border border-gray-300 flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
            Imprimer cette page
          </button>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-bold text-green-900 mb-2">Avantages</h3>
            <ul className="space-y-2 text-sm text-green-800">
              <li>✓ Pas de menu physique à imprimer</li>
              <li>✓ Mise à jour du menu en temps réel</li>
              <li>✓ Réduction de la consommation de papier</li>
              <li>✓ Meilleure traçabilité des commandes</li>
            </ul>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-bold text-blue-900 mb-2">Installation</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>📍 Imprimez les QR codes</li>
              <li>🔗 Plastifiez-les pour durabilité</li>
              <li>📌 Collez sur les tables</li>
              <li>✅ Prêt à l'emploi!</li>
            </ul>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default QRDemo;
