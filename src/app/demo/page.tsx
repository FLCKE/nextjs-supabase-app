'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { DemoSidebar } from '@/components/layout/demo-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  ShoppingCart,
  FileText,
  QrCode,
  TrendingUp,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

const demoFeatures = [
  {
    title: 'Dashboard Principal',
    description: 'Vue d\'ensemble de votre activité avec statistiques en temps réel',
    link: '/demo/dashboard',
    icon: BarChart3,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  {
    title: 'Gestion des Commandes',
    description: 'Recevez, validez et préparez les commandes facilement',
    link: '/demo/orders',
    icon: ShoppingCart,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10'
  },
  {
    title: 'Gestion des Menus',
    description: 'Créez et modifiez vos menus en quelques clics',
    link: '/demo/menus',
    icon: FileText,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10'
  },
  {
    title: 'Analytics & Statistiques',
    description: 'Analysez vos ventes et comportements clients',
    link: '/demo/analytics',
    icon: TrendingUp,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  },
  {
    title: 'QR Codes Tables',
    description: 'Générez des QR codes pour vos tables',
    link: '/demo/qr',
    icon: QrCode,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10'
  },
];

export default function DemoPage() {
  const router = useRouter();

  return (
    <DashboardLayout
      title="Démo RestoPay"
      description="Explorez les fonctionnalités principales de notre plateforme"
      breadcrumbs={[
        { label: 'Accueil', href: '/' },
        { label: 'Démo' }
      ]}
      sidebar={DemoSidebar}
    >
      {/* Hero Section */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Bienvenue dans la démo</CardTitle>
            <CardDescription>
              Découvrez toutes les fonctionnalités de RestoPay à travers cette démo interactive
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Mode démo</Badge>
              <Badge variant="outline">Sans inscription requise</Badge>
              <Badge variant="outline">Accès complet</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {demoFeatures.map((feature, index) => (
          <Card
            key={index}
            className="group hover:shadow-lg transition-all cursor-pointer"
          >
            <CardHeader>
              <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={feature.link}>
                <Button
                  variant="outline"
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                >
                  Explorer
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Start Guide */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Guide de démarrage rapide</CardTitle>
            <CardDescription>
              4 étapes pour découvrir RestoPay
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { step: 1, title: 'Dashboard', desc: 'Vue d\'ensemble' },
                { step: 2, title: 'Commandes', desc: 'Gestion temps réel' },
                { step: 3, title: 'Menus', desc: 'Création & édition' },
                { step: 4, title: 'Analytics', desc: 'Statistiques' },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="mt-8">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardHeader>
            <CardTitle>Prêt à commencer ?</CardTitle>
            <CardDescription>
              Créez un compte gratuit et explorez toutes les fonctionnalités
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => router.push('/sign-up')}>
                Créer un compte gratuit
              </Button>
              <Button variant="outline" onClick={() => router.push('/')}>
                Retour à l\'accueil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
