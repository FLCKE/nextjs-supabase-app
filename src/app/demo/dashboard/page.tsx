'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { DemoSidebar } from '@/components/layout/demo-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, ShoppingCart, Users, AlertCircle } from 'lucide-react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

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
    { title: 'Chiffre d\'affaires', value: '€42,800', icon: DollarSign, change: '+18%', color: 'text-green-500' },
    { title: 'Commandes', value: '250', icon: ShoppingCart, change: '+12%', color: 'text-blue-500' },
    { title: 'Clients', value: '1,245', icon: Users, change: '+8%', color: 'text-purple-500' },
    { title: 'Panier Moyen', value: '€24.50', icon: TrendingUp, change: '+5%', color: 'text-orange-500' },
  ];

  const recentOrders = [
    { id: '#2401', table: 'Table 5', amount: '€28.50', status: 'En préparation', time: '14:32' },
    { id: '#2400', table: 'Table 3', amount: '€15.20', status: 'Livrée', time: '14:28' },
    { id: '#2399', table: 'Table 1', amount: '€42.80', status: 'Payée', time: '14:15' },
    { id: '#2398', table: 'À emporter', amount: '€19.90', status: 'Prête', time: '14:02' },
  ];

  return (
    <DashboardLayout
      title="Dashboard Principal"
      description="Vue d'ensemble de votre activité avec statistiques en temps réel"
      breadcrumbs={[
        { label: 'Démo', href: '/demo' },
        { label: 'Dashboard' }
      ]}
      sidebar={DemoSidebar}
    >
      {/* Demo Badge */}
      <div className="mb-4">
        <Badge variant="secondary">Mode démo • Semaine du 24-30 Mars</Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  {stat.change} depuis hier
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
        {/* Line Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ventes & Commandes</CardTitle>
            <CardDescription>Évolution quotidienne des performances</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Catégories</CardTitle>
            <CardDescription>Répartition par catégorie</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Commandes Récentes</CardTitle>
          <CardDescription>
            Vous avez {recentOrders.length} commandes actives en ce moment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {recentOrders.map((order, idx) => (
              <div key={idx} className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {order.table} - Commande {order.id}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Montant: {order.amount}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-4">
                  <Badge
                    variant={
                      order.status === 'En préparation' ? 'secondary' :
                      order.status === 'Livrée' ? 'default' :
                      order.status === 'Payée' ? 'outline' : 'secondary'
                    }
                  >
                    {order.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{order.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alert */}
      <Card className="mt-4 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900">Conseil</p>
              <p className="text-sm text-blue-700 mt-1">
                Le samedi est votre meilleur jour de ventes! Assurez-vous d'avoir suffisamment de stock ce jour-là.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Dashboard;
