'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, Play } from 'lucide-react';

export default function Demo() {
  const features = [
    {
      title: 'Dashboard Principal',
      description: 'Vue d\'ensemble de votre activité avec statistiques en temps réel',
      video: 'https://via.placeholder.com/400x300?text=Dashboard'
    },
    {
      title: 'Gestion des Commandes',
      description: 'Recevez, validez et préparez les commandes facilement',
      video: 'https://via.placeholder.com/400x300?text=Orders'
    },
    {
      title: 'Gestion des Menus',
      description: 'Créez et modifiez vos menus en quelques clics',
      video: 'https://via.placeholder.com/400x300?text=Menus'
    },
    {
      title: 'Gestion Inventaire',
      description: 'Contrôlez vos stocks et évitez les ruptures',
      video: 'https://via.placeholder.com/400x300?text=Inventory'
    },
    {
      title: 'QR Codes Tables',
      description: 'Générez des QR codes pour vos tables',
      video: 'https://via.placeholder.com/400x300?text=QR+Codes'
    },
    {
      title: 'Analytics',
      description: 'Analysez vos ventes et comportements clients',
      video: 'https://via.placeholder.com/400x300?text=Analytics'
    },
  ];

  return (
    <div className="bg-white text-gray-800 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-orange-600">
              RestoPay
            </Link>
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-orange-600">
              <ChevronLeft className="w-5 h-5" />
              Retour
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 bg-gradient-to-br from-orange-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold mb-4">Découvrez RestoPay</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explorez les fonctionnalités principales de notre plateforme
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Demo Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all"
              >
                <div className="relative h-48 bg-gradient-to-br from-orange-200 to-red-200 flex items-center justify-center group cursor-pointer">
                  <img 
                    src={feature.video} 
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                    <Play className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl p-12 text-center"
          >
            <h2 className="text-4xl font-bold mb-4">Prêt à Essayer?</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Créez un compte gratuit et explorez toutes les fonctionnalités sans engagement
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sign-up"
                className="bg-white text-orange-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition"
              >
                Créer un Compte Gratuit
              </Link>
              <a
                href="mailto:contact@restopay.com"
                className="border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white hover:bg-opacity-10 transition"
              >
                Demander une Démo Personnalisée
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Questions Fréquentes</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: 'Combien de temps faut-il pour configurer mon restaurant?',
                a: 'Moins de 10 minutes! Créez votre compte, configurez votre profil et votre premier menu. Vous pouvez commencer à recevoir des commandes immédiatement.'
              },
              {
                q: 'Puis-je gérer plusieurs restaurants?',
                a: 'Oui! Les plans Pro et Enterprise vous permettent de gérer plusieurs restaurants depuis un seul compte.'
              },
              {
                q: 'Comment fonctionnent les QR codes pour les tables?',
                a: 'Générez des QR codes uniques pour chaque table. Les clients scannent pour accéder à votre menu et commander directement à leur table.'
              },
              {
                q: 'Quels sont les moyens de paiement acceptés?',
                a: 'Nous intégrons les principaux processeurs de paiement: Stripe, Square, PayPal et bien d\'autres.'
              },
              {
                q: 'Y a-t-il une période d\'essai gratuite?',
                a: 'Oui! Vous avez 14 jours gratuits pour essayer toutes les fonctionnalités sans carte bancaire requise.'
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-lg shadow"
              >
                <h3 className="text-lg font-bold text-orange-600 mb-2">{item.q}</h3>
                <p className="text-gray-600">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-orange-50 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Vous Avez des Questions?</h2>
          <p className="text-gray-600 mb-6 text-lg">
            Notre équipe est disponible pour vous aider du lundi au vendredi de 9h à 18h
          </p>
          <a
            href="mailto:support@restopay.com"
            className="inline-block bg-orange-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-orange-700 transition"
          >
            Nous Contacter
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 RestoPay. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
