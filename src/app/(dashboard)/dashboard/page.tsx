'use client';

import * as React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Download, TrendingUp, ShoppingCart, Users, DollarSign, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DashboardStats {
  totalRevenue: string;
  ordersToday: number;
  activeOrders: number;
  paidOrders: number;
  avgOrderValue: string;
  activeTables: number;
  totalTables: number;
  topItem: string;
  percentageChange: string;
  recentOrders: Array<{
    id: string;
    table: string;
    amount: string;
    time: string;
  }>;
  success: boolean;
}

interface Restaurant {
  id: string;
  name: string;
  currency?: string;
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  try {
    const response = await fetch('/api/dashboard/stats', {
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('Failed to fetch stats');
    return await response.json();
  } catch (error) {
    return {
      totalRevenue: '$0.00',
      ordersToday: 0,
      activeOrders: 0,
      paidOrders: 0,
      avgOrderValue: '$0.00',
      activeTables: 0,
      totalTables: 0,
      topItem: 'N/A',
      percentageChange: '0%',
      recentOrders: [],
      success: false,
    };
  }
}

export default function DashboardPage() {
  const [selectedRestaurant, setSelectedRestaurant] = React.useState<Restaurant>({
    id: '1',
    name: 'Main Restaurant',
    currency: 'USD',
  });

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const restaurants: Restaurant[] = [
    { id: '1', name: 'Main Restaurant', currency: 'USD' },
    { id: '2', name: 'Downtown Branch', currency: 'USD' },
    { id: '3', name: 'Airport Location', currency: 'EUR' },
  ];

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await fetchDashboardStats();
        setStats(data);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats || !stats.success) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Erreur lors du chargement des données du dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Bienvenue! Voici ce qui se passe avec vos restaurants aujourd'hui.
        </p>
      </div>
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenu Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              {stats.percentageChange} depuis hier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes Aujourd'hui</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.ordersToday}</div>
            <p className="text-xs text-muted-foreground">
              {stats.paidOrders} payées • {stats.activeOrders} en cours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tables Actives</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.activeTables}/{stats.totalTables}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.activeTables} occupées, {stats.totalTables - stats.activeTables} disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Panier Moyen</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgOrderValue}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              Basé sur {stats.ordersToday} commandes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Commandes Récentes</CardTitle>
            <CardDescription>
              Vous avez {stats.activeOrders} commandes actives en ce moment
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentOrders.length > 0 ? (
              <div className="space-y-8">
                {stats.recentOrders.map((order, idx) => (
                  <div key={idx} className="flex items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {order.table} - Commande {order.id}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Montant: {order.amount}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">{order.time}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucune commande pour le moment
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Performance Aujourd'hui</CardTitle>
            <CardDescription>
              Métriques en temps réel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Articles Populaires</span>
                <span className="text-sm text-muted-foreground font-semibold">{stats.topItem}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Commandes Complétées</span>
                <span className="text-sm text-muted-foreground font-semibold">{stats.paidOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Taux de Conversion</span>
                <span className="text-sm text-muted-foreground font-semibold">
                  {stats.ordersToday > 0 ? ((stats.paidOrders / stats.ordersToday) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tables Utilisées</span>
                <span className="text-sm text-muted-foreground font-semibold">
                  {stats.totalTables > 0 ? ((stats.activeTables / stats.totalTables) * 100).toFixed(0) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
