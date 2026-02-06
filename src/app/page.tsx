'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, TrendingUp, Zap, BarChart3, Clock, Users } from 'lucide-react';

export default function Home() {
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeInOut' as const } },
  };

  const featureItems = [
    {
      icon: <Zap className="w-12 h-12 text-orange-500" />,
      title: 'Gestion Complète des Commandes',
      description: 'Recevez, gérez et suivez les commandes en temps réel depuis une interface unique et intuitive.',
    },
    {
      icon: <BarChart3 className="w-12 h-12 text-blue-500" />,
      title: 'Analyses & Insights',
      description: 'Accédez à des tableaux de bord détaillés pour optimiser vos ventes et comprendre vos clients.',
    },
    {
      icon: <Users className="w-12 h-12 text-green-500" />,
      title: 'Multi-Emplacements',
      description: 'Gérez plusieurs restaurants ou points de vente depuis une seule plateforme centralisée.',
    },
    {
      icon: <Clock className="w-12 h-12 text-purple-500" />,
      title: 'Gestion Inventaire',
      description: 'Contrôlez votre inventaire en temps réel et évitez les ruptures de stock.',
    },
    {
      icon: <TrendingUp className="w-12 h-12 text-red-500" />,
      title: 'Augmentez vos Revenus',
      description: 'Attirez plus de clients et augmentez vos commandes avec notre plateforme moderne.',
    },
    {
      icon: <CheckCircle className="w-12 h-12 text-emerald-500" />,
      title: 'Support 24/7',
      description: 'Notre équipe est toujours disponible pour vous aider et répondre à vos questions.',
    },
  ];

  return (
    <div className="bg-white text-gray-800 font-sans overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <Link href="/" className="text-2xl font-bold text-orange-600 tracking-wider">
                RestoPay
              </Link>
            </motion.div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-orange-600 transition-colors font-medium">
                Fonctionnalités
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-orange-600 transition-colors font-medium">
                Comment ça marche
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-orange-600 transition-colors font-medium">
                Tarifs
              </a>
              <Link href="/sign-in" className="text-gray-600 hover:text-orange-600 transition-colors font-medium">
                Connexion
              </Link>
              <Link href="/sign-up" className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors">
                Commencer Maintenant
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 via-white to-orange-50 py-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight"
            >
              La Solution Complète pour Votre Restaurant
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-gray-600 mb-8 leading-relaxed"
            >
              Gérez vos commandes, vos menus, votre inventaire et vos clients sur une seule plateforme. Augmentez vos ventes et optimisez vos opérations dès aujourd'hui.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                href="/sign-up"
                className="bg-orange-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-orange-700 transition duration-300 transform hover:scale-105 shadow-lg"
              >
                Démarrer Gratuitement
              </Link>
              <Link
                href="/demo"
                className="border-2 border-orange-600 text-orange-600 font-bold py-3 px-8 rounded-lg text-lg hover:bg-orange-50 transition duration-300"
              >
                Voir la Démo
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants} className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">500+</div>
              <p className="text-gray-600 text-lg">Restaurants Partenaires</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">100K+</div>
              <p className="text-gray-600 text-lg">Commandes par Jour</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">99.9%</div>
              <p className="text-gray-600 text-lg">Disponibilité</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section id="features" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants} className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Tout Ce Dont Vous Avez Besoin</h2>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto">
              Une plateforme puissante conçue spécifiquement pour les restaurants modernes
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureItems.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                className="bg-white p-8 rounded-xl shadow-lg transition-all duration-300"
              >
                <div className="mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Benefits Section */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants} className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold tracking-tight mb-6">Pourquoi Choisir RestoPay?</h2>
              <div className="space-y-4">
                {[
                  'Aucun frais mensuel - Payez uniquement 5% par vente',
                  'Interface intuitive et facile à utiliser',
                  'Gestion multi-restaurant en un seul compte',
                  'Analytics en temps réel pour optimiser vos ventes',
                  'QR codes générés automatiquement pour chaque table',
                  'Support client disponible 24/7',
                  'Migration gratuite depuis votre ancien système',
                  'Pas de contrat long terme - Résiliez quand vous voulez',
                ].map((benefit, index) => (
                  <motion.div key={index} whileHover={{ x: 10 }} className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-lg p-8 h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">💰</div>
                <p className="text-gray-700 text-lg font-semibold">Commission de 5%</p>
                <p className="text-gray-600 text-sm mt-2">C'est juste, transparent et aligné avec votre succès</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section id="how-it-works" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants} className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Comment Ça Marche?</h2>
            <p className="text-gray-600 text-xl">Seulement 4 étapes pour commencer</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Créer un Compte', description: 'Inscrivez-vous en quelques minutes' },
              { step: '2', title: 'Configurer Votre Menu', description: 'Ajoutez vos plats et prix' },
              { step: '3', title: 'Générer QR Codes', description: 'Créez des codes pour vos tables' },
              { step: '4', title: 'Recevoir des Commandes', description: 'Commencez à vendre!' },
            ].map((item, index) => (
              <motion.div key={index} whileHover={{ y: -10 }} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 text-white rounded-full font-bold text-2xl mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section id="pricing" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants} className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Tarification Simple et Juste</h2>
            <p className="text-gray-600 text-xl">Payez seulement 5% de commission sur vos ventes. Sans frais cachés.</p>
          </div>
          
          {/* Main Pricing Card */}
          <div className="max-w-2xl mx-auto mb-12">
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-gradient-to-br from-orange-600 to-red-600 text-white rounded-2xl p-12 shadow-2xl"
            >
              <h3 className="text-3xl font-bold mb-6">Un Plan Simple</h3>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-lg">5% de commission par vente</p>
                    <p className="text-orange-100 text-sm mt-1">C'est tout ce que vous payez. Aucun frais mensuel ou caché.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-lg">Restaurants illimités</p>
                    <p className="text-orange-100 text-sm mt-1">Gérez 1 restaurant ou 100, c'est le même prix.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-lg">Commandes illimitées</p>
                    <p className="text-orange-100 text-sm mt-1">Plus de commandes = plus de revenus pour vous.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-lg">Support prioritaire 24/7</p>
                    <p className="text-orange-100 text-sm mt-1">Notre équipe est toujours disponible.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-lg">Tous les outils inclus</p>
                    <p className="text-orange-100 text-sm mt-1">Analytics, QR codes, gestion inventaire, tout compris.</p>
                  </div>
                </div>
              </div>

              <Link
                href="/sign-up"
                className="block w-full bg-white text-orange-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition text-center"
              >
                Démarrer Gratuitement
              </Link>
            </motion.div>
          </div>

          {/* Example Calculation */}
          <div className="max-w-3xl mx-auto bg-gray-50 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-6 text-center">Exemple de Calcul</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Vente moyenne</p>
                <p className="text-3xl font-bold text-orange-600">50€</p>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-2xl text-gray-400">→</div>
              </div>
              <div className="text-center">
                <p className="text-gray-600 mb-2">Commission (5%)</p>
                <p className="text-3xl font-bold">2,50€</p>
              </div>
            </div>
            <p className="text-center text-gray-600 mt-6">
              Avec 100 commandes par jour à 50€ = <span className="font-bold">12,500€ de revenus</span> pour vous, <span className="font-bold">625€</span> pour nous.
            </p>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants} className="py-20 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Augmentez Vos Ventes, Payez Uniquement à la Commission</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Zéro frais mensuel. Vous ne payez que 5% de chaque commande. Plus vous vendez, plus vous gagnez!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/sign-up"
              className="bg-white text-orange-600 font-bold py-3 px-8 rounded-lg text-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105"
            >
              Démarrer Gratuitement
            </Link>
            <Link
              href="mailto:contact@restopay.com"
              className="border-2 border-white text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-white hover:bg-opacity-10 transition duration-300"
            >
              Discuter Avec Nous
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold text-orange-600 mb-4">RestoPay</h3>
              <p className="text-gray-400">La solution complète pour votre restaurant.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-orange-500">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-orange-500">Tarifs</a></li>
                <li><a href="#" className="hover:text-orange-500">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-orange-500">À Propos</a></li>
                <li><a href="#" className="hover:text-orange-500">Contact</a></li>
                <li><a href="#" className="hover:text-orange-500">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-orange-500">Confidentialité</a></li>
                <li><a href="#" className="hover:text-orange-500">Conditions</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 RestoPay. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
