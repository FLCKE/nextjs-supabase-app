'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { DemoSidebar } from '@/components/layout/demo-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Copy, QrCode, CheckCircle, Smartphone } from 'lucide-react';
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
    <DashboardLayout
      title="QR Codes Tables"
      description="Générez des QR codes pour vos tables"
      breadcrumbs={[
        { label: 'Démo', href: '/demo' },
        { label: 'QR Codes' }
      ]}
      sidebar={DemoSidebar}
    >
      {/* Info Card */}
      <Card className="mb-6 border-l-4 border-l-blue-600">
        <CardHeader>
          <CardTitle>Comment ça marche?</CardTitle>
          <CardDescription>
            Chaque table a un QR code unique. Les clients scannent le code avec leur téléphone pour accéder au menu et commander directement à leur table.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex gap-3 items-start">
              <Smartphone className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">1. Client scanne</p>
                <p className="text-sm text-muted-foreground">Le client scanne le QR code</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <QrCode className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">2. Accès menu</p>
                <p className="text-sm text-muted-foreground">Accès immédiat au menu</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">3. Commande</p>
                <p className="text-sm text-muted-foreground">Commande reçue en cuisine</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tables.map((table, idx) => (
          <Card key={table.number} className="hover:shadow-md transition">
            <CardContent className="pt-6">
              {/* Table Number */}
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground mb-2">Table</p>
                <p className="text-4xl font-bold text-orange-600">{table.number}</p>
              </div>

              {/* QR Code Placeholder */}
              <div className="bg-muted rounded-lg p-4 mb-4 flex items-center justify-center h-48 border-2 border-dashed">
                <div className="text-center">
                  <QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">QR Code</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    https://resto.pay/table/{table.number}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleCopy(table.number)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {copied === `table-${table.number}` ? 'Copié!' : 'Copier lien'}
                </Button>
                <Button variant="secondary" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Print Preview */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Aperçu d'impression</CardTitle>
          <CardDescription>Prévisualisation des QR codes à imprimer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted p-4 rounded-lg mb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-background p-4 rounded border-2 aspect-square flex flex-col items-center justify-center">
                <p className="text-sm font-bold mb-2">Table {i}</p>
                <div className="w-20 h-20 bg-muted rounded border flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
          <Button className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Imprimer cette page
          </Button>
        </CardContent>
      </Card>

      {/* Benefits & Installation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">Avantages</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-green-800">
              <li>✓ Pas de menu physique à imprimer</li>
              <li>✓ Mise à jour du menu en temps réel</li>
              <li>✓ Réduction de la consommation de papier</li>
              <li>✓ Meilleure traçabilité des commandes</li>
            </ul>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Installation</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>📍 Imprimez les QR codes</li>
              <li>🔗 Plastifiez-les pour durabilité</li>
              <li>📌 Collez sur les tables</li>
              <li>✅ Prêt à l'emploi!</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default QRDemo;
