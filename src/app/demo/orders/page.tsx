'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { DemoSidebar } from '@/components/layout/demo-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChefHat, CheckCircle, Printer, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

const Orders = () => {
  const [orders, setOrders] = useState([
    {
      id: '#2405',
      table: '7',
      items: ['2x Pizza Margherita', '1x Pâtes Carbonara', '1x Salade César'],
      amount: '€45.80',
      status: 'Reçue',
      time: '14:58',
      priority: 'haute',
    },
    {
      id: '#2404',
      table: '5',
      items: ['3x Burgers', '2x Frites', '1x Milk-shake'],
      amount: '€32.40',
      status: 'En préparation',
      time: '14:42',
      priority: 'normale',
    },
    {
      id: '#2403',
      table: '2',
      items: ['1x Ratatouille', '1x Riz pilaf'],
      amount: '€18.60',
      status: 'Prête à servir',
      time: '14:25',
      priority: 'basse',
    },
    {
      id: '#2402',
      table: '4',
      items: ['2x Couscous', '1x Harira'],
      amount: '€28.50',
      status: 'Servie',
      time: '14:10',
      priority: 'normale',
    },
  ]);

  const updateOrderStatus = (id: string, newStatus: string) => {
    setOrders(orders.map(order =>
      order.id === id ? { ...order, status: newStatus } : order
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const stats = [
    { label: 'En attente', value: orders.filter(o => o.status === 'Reçue').length, color: 'text-red-600' },
    { label: 'En cuisine', value: orders.filter(o => o.status === 'En préparation').length, color: 'text-yellow-600' },
    { label: 'Prête', value: orders.filter(o => o.status === 'Prête à servir' || o.status === 'Servie').length, color: 'text-green-600' },
  ];

  return (
    <DashboardLayout
      title="Gestion des Commandes"
      description="Recevez, validez et préparez les commandes facilement"
      breadcrumbs={[
        { label: 'Démo', href: '/demo' },
        { label: 'Commandes' }
      ]}
      sidebar={DemoSidebar}
    >
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        {stats.map((stat, idx) => (
          <Card key={idx}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order, idx) => (
          <Card key={order.id} className={`${getPriorityColor(order.priority)}`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold">{order.id}</h3>
                    <Badge variant="secondary">Table {order.table}</Badge>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Reçue à {order.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{order.amount}</p>
                </div>
              </div>

              {/* Items */}
              <div className="bg-muted/50 rounded p-4 mb-4">
                <ul className="space-y-2">
                  {order.items.map((item, i) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      <span className="text-orange-600">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                {order.status === 'Reçue' && (
                  <Button
                    size="sm"
                    onClick={() => updateOrderStatus(order.id, 'En préparation')}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    <ChefHat className="w-4 h-4 mr-2" />
                    Commencer la préparation
                  </Button>
                )}
                {order.status === 'En préparation' && (
                  <Button
                    size="sm"
                    onClick={() => updateOrderStatus(order.id, 'Prête à servir')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marquer comme prête
                  </Button>
                )}
                {order.status === 'Prête à servir' && (
                  <Button
                    size="sm"
                    onClick={() => updateOrderStatus(order.id, 'Servie')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirmer la livraison
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimer ticket
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tip */}
      <Card className="mt-6 bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">Gestion efficace</p>
              <p className="text-sm text-green-700 mt-1">
                Cliquez sur les boutons d'action pour mettre à jour le statut des commandes en temps réel. Votre cuisine reçoit les notifications instantanément.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Orders;
