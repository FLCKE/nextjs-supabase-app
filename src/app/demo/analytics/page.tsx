'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { DemoSidebar } from '@/components/layout/demo-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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

  const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
  const totalOrders = monthlyData.reduce((sum, m) => sum + m.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const growth = ((monthlyData[5].revenue - monthlyData[0].revenue) / monthlyData[0].revenue) * 100;

  return (
    <DashboardLayout
      title="Analytics & Statistiques"
      description="Analysez vos performances et tendances"
      breadcrumbs={[
        { label: 'Démo', href: '/demo' },
        { label: 'Analytics' }
      ]}
      sidebar={DemoSidebar}
    >
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenu Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sur les 6 derniers mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Moyenne: {Math.round(totalOrders / 6)} / mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Panier Moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{avgOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Par commande
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Croissance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{growth.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Derniers 6 mois
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tendance Revenus</CardTitle>
            <CardDescription>Évolution mensuelle des ventes</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Peak Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Heures de Pointe</CardTitle>
            <CardDescription>Patterns de commande</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hoursData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#ffa500" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Categories */}
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
                  outerRadius={80}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Items */}
        <Card>
          <CardHeader>
            <CardTitle>Menus les Plus Populaires</CardTitle>
            <CardDescription>Top 5 des articles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between pb-4 border-b last:border-b-0">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.orders} commandes</p>
                  </div>
                  <div className="text-right">
                    <div className="w-32 bg-muted rounded-full h-2 mb-1">
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
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-600 font-semibold mb-1">HEURE DE POINTE</p>
            <p className="text-2xl font-bold text-blue-900">19h - 20h</p>
            <p className="text-xs text-blue-700 mt-2">42 commandes en moyenne</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <p className="text-sm text-green-600 font-semibold mb-1">CROISSANCE</p>
            <p className="text-2xl font-bold text-green-900">+97%</p>
            <p className="text-xs text-green-700 mt-2">Derniers 6 mois</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <p className="text-sm text-purple-600 font-semibold mb-1">PANIER MOYEN</p>
            <p className="text-2xl font-bold text-purple-900">€24.50</p>
            <p className="text-xs text-purple-700 mt-2">Augmentation de 8%</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
