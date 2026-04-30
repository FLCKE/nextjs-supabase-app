'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { DemoSidebar } from '@/components/layout/demo-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus, CheckCircle } from 'lucide-react';
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
    <DashboardLayout
      title="Gestion des Menus"
      description="Créez et modifiez vos menus en quelques clics"
      breadcrumbs={[
        { label: 'Démo', href: '/demo' },
        { label: 'Menus' }
      ]}
      sidebar={DemoSidebar}
    >
      {/* Info Card */}
      <Card className="mb-6 border-l-4 border-l-orange-600">
        <CardContent className="pt-6">
          <h2 className="text-lg font-bold mb-2">Gestion Simplifiée</h2>
          <p className="text-muted-foreground">
            Modifiez votre menu en temps réel. Les changements sont immédiatement visibles sur les QR codes des clients.
            Aucun délai d'attente!
          </p>
        </CardContent>
      </Card>

      {/* Menu Categories */}
      <div className="space-y-6">
        {menus.map((menu, menuIdx) => (
          <Card key={menu.id}>
            <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-white">{menu.category}</CardTitle>
                  <CardDescription className="text-orange-100">{menu.items.length} articles</CardDescription>
                </div>
                <Button variant="secondary" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Gérer
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {menu.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="p-6 hover:bg-muted/50 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-2xl font-bold text-green-600">€{item.price.toFixed(2)}</p>
                        <div className="flex gap-2 mt-2">
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 bg-muted/50 border-t">
                <Button variant="outline" className="w-full text-orange-600 hover:bg-orange-50 hover:text-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un article
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features & Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Fonctionnalités</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>✓ Édition en temps réel</li>
              <li>✓ Gestion des prix</li>
              <li>✓ Descriptions personnalisées</li>
              <li>✓ Gestion des allergènes</li>
              <li>✓ Images des articles</li>
            </ul>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">Astuces</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-green-800">
              <li>💡 Mettez à jour les prix avant les promotions</li>
              <li>💡 Signalez les articles épuisés</li>
              <li>💡 Ajoutez des images attrayantes</li>
              <li>💡 Décrivez les saveurs</li>
              <li>💡 Indiquez les portions</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Actions en Masse</CardTitle>
          <CardDescription>Gérez votre menu en lot</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="bg-blue-50 text-blue-600 hover:bg-blue-100">
              Importer un menu (CSV)
            </Button>
            <Button variant="outline" className="bg-green-50 text-green-600 hover:bg-green-100">
              Exporter le menu
            </Button>
            <Button variant="outline" className="bg-purple-50 text-purple-600 hover:bg-purple-100">
              Dupliquer une catégorie
            </Button>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Menus;
