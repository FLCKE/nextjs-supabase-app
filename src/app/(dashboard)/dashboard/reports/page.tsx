'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Calendar, TrendingUp, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon } from 'lucide-react';
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

interface ReportData {
  dailyRevenue: Array<{ date: string; revenue: number; orders: number }>;
  paymentMethods: Array<{ method: string; count: number; amount: number }>;
  ordersByStatus: Array<{ status: string; count: number; percentage: number }>;
  topItems: Array<{ name: string; orders: number; revenue: number }>;
  hourlyOrders: Array<{ hour: string; orders: number }>;
  success: boolean;
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('week'); // week, month, year

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reports?range=${dateRange}`, {
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (reportData) {
      const csv = generateDetailedCSV(reportData, dateRange);
      downloadCSV(csv, `rapport_ventes_${new Date().toISOString().split('T')[0]}.csv`);
    }
  };

  const generateDetailedCSV = (data: ReportData, range: string) => {
    const now = new Date().toLocaleString('fr-FR');
    const rangeLabel = {
      week: 'Semaine',
      month: 'Mois',
      year: 'Année'
    }[range] || 'Période';

    // Calcul des statistiques globales
    const totalRevenue = data.dailyRevenue.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrders = data.dailyRevenue.reduce((sum, d) => sum + d.orders, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const avgDailyRevenue = data.dailyRevenue.length > 0 ? totalRevenue / data.dailyRevenue.length : 0;
    const totalPayments = data.paymentMethods.reduce((sum, p) => sum + p.amount, 0);
    const totalTransactions = data.paymentMethods.reduce((sum, p) => sum + p.count, 0);

    let csv = '';

    // En-tête du rapport
    csv += '=====================================\n';
    csv += 'RAPPORT DE VENTES - WEGO RESTOPAY\n';
    csv += '=====================================\n';
    csv += `Période: ${rangeLabel}\n`;
    csv += `Généré le: ${now}\n`;
    csv += '\n';

    // Résumé exécutif
    csv += 'RÉSUMÉ EXÉCUTIF\n';
    csv += '=====================================\n';
    csv += `Revenu total (€),${totalRevenue.toFixed(2)}\n`;
    csv += `Nombre de commandes,${totalOrders}\n`;
    csv += `Panier moyen (€),${avgOrderValue.toFixed(2)}\n`;
    csv += `Revenu quotidien moyen (€),${avgDailyRevenue.toFixed(2)}\n`;
    csv += `Total transactions,${totalTransactions}\n`;
    csv += `Montant moyen transaction (€),${(totalPayments / totalTransactions).toFixed(2)}\n`;
    csv += '\n';

    // Tendance de revenu quotidienne
    csv += 'TENDANCE DE REVENU - DONNÉES QUOTIDIENNES\n';
    csv += '=====================================\n';
    csv += 'Date,Revenu (€),Nombre de commandes,Revenu moyen par commande (€),% du total\n';
    data.dailyRevenue.forEach(day => {
      const avgDay = day.orders > 0 ? day.revenue / day.orders : 0;
      const percentage = totalRevenue > 0 ? ((day.revenue / totalRevenue) * 100).toFixed(2) : 0;
      csv += `${day.date},${day.revenue.toFixed(2)},${day.orders},${avgDay.toFixed(2)},${percentage}%\n`;
    });
    csv += '\n';

    // Statut des commandes
    csv += 'DISTRIBUTION DES COMMANDES PAR STATUT\n';
    csv += '=====================================\n';
    csv += 'Statut,Nombre,Pourcentage,Tendance\n';
    const statusOrder = ['PAID', 'SERVED', 'PENDING', 'PAYING', 'CANCELLED', 'REFUNDED'];
    data.ordersByStatus
      .sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status))
      .forEach(status => {
        const trend = status.percentage > 50 ? '↑ Élevé' : status.percentage > 25 ? '→ Moyen' : '↓ Faible';
        csv += `${status.status},${status.count},${status.percentage.toFixed(1)}%,${trend}\n`;
      });
    csv += '\n';

    // Moyens de paiement
    csv += 'ANALYSE DES MOYENS DE PAIEMENT\n';
    csv += '=====================================\n';
    csv += 'Méthode,Nombre de transactions,Montant (€),Montant moyen (€),% du total\n';
    data.paymentMethods.forEach(method => {
      const avgTransaction = method.count > 0 ? method.amount / method.count : 0;
      const percentage = totalPayments > 0 ? ((method.amount / totalPayments) * 100).toFixed(2) : 0;
      csv += `${method.method},${method.count},${method.amount.toFixed(2)},${avgTransaction.toFixed(2)},${percentage}%\n`;
    });
    csv += '\n';

    // Articles populaires
    csv += 'TOP 20 ARTICLES PLUS VENDUS\n';
    csv += '=====================================\n';
    csv += 'Rang,Article,Nombre de commandes,Revenu total (€),Revenu moyen par commande (€),% du total\n';
    const allItemsRevenue = data.topItems.reduce((sum, item) => sum + item.revenue, 0);
    data.topItems.slice(0, 20).forEach((item, idx) => {
      const avgItemRevenue = item.orders > 0 ? item.revenue / item.orders : 0;
      const percentage = allItemsRevenue > 0 ? ((item.revenue / allItemsRevenue) * 100).toFixed(2) : 0;
      csv += `${idx + 1},${item.name},${item.orders},${item.revenue.toFixed(2)},${avgItemRevenue.toFixed(2)},${percentage}%\n`;
    });
    csv += '\n';

    // Heures de pointe
    csv += 'ANALYSE HORAIRE - COMMANDES PAR HEURE\n';
    csv += '=====================================\n';
    csv += 'Heure,Nombre de commandes,% du total\n';
    const totalHourlyOrders = data.hourlyOrders.reduce((sum, h) => sum + h.orders, 0);
    data.hourlyOrders.forEach(hour => {
      if (hour.orders > 0) {
        const percentage = totalHourlyOrders > 0 ? ((hour.orders / totalHourlyOrders) * 100).toFixed(2) : 0;
        csv += `${hour.hour},${hour.orders},${percentage}%\n`;
      }
    });
    csv += '\n';

    // Insights et recommendations
    csv += 'INSIGHTS & RECOMMENDATIONS\n';
    csv += '=====================================\n';
    
    // Meilleur jour
    const bestDay = data.dailyRevenue.reduce((best, current) => 
      current.revenue > best.revenue ? current : best, data.dailyRevenue[0] || { date: 'N/A', revenue: 0, orders: 0 });
    
    // Heure de pointe
    const peakHour = data.hourlyOrders.reduce((best, current) =>
      current.orders > best.orders ? current : best, data.hourlyOrders[0] || { hour: 'N/A', orders: 0 });
    
    // Article le plus populaire
    const topItem = data.topItems[0];

    csv += `Meilleur jour,${bestDay.date} (${bestDay.revenue.toFixed(2)}€)\n`;
    csv += `Heure de pointe,${peakHour.hour} (${peakHour.orders} commandes)\n`;
    csv += `Article le plus vendu,"${topItem?.name || 'N/A'}" (${topItem?.orders || 0} commandes)\n`;
    csv += `Taux de paiement,${data.ordersByStatus.find(s => s.status === 'PAID')?.percentage.toFixed(1) || 0}%\n`;
    csv += `Taux d'annulation,${data.ordersByStatus.find(s => s.status === 'CANCELLED')?.percentage.toFixed(1) || 0}%\n`;
    csv += '\n';

    // Notes
    csv += 'NOTES\n';
    csv += '=====================================\n';
    csv += 'Ce rapport a été généré automatiquement par WEGO RESTOPAY.\n';
    csv += 'Les données incluent toutes les commandes et transactions de la période sélectionnée.\n';
    csv += 'Pour plus d\'informations, consultez votre dashboard.\n';

    return csv;
  };

  const downloadCSV = (csv: string, filename: string) => {
    // Ajouter BOM pour UTF-8 correct dans Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadDataEngineerExport = async () => {
    try {
      const response = await fetch('/api/export/data-engineer');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `wego-data-export-${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Data export failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des rapports...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#ff7f50', '#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Rapports</h1>
          <p className="text-muted-foreground mt-1">
            Analysez vos performances et tendances
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
          <Button onClick={handleExport} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exporter CSV
          </Button>
          <Button 
            onClick={downloadDataEngineerExport}
            variant="outline"
            className="flex items-center gap-2"
            title="Export ZIP avec données brutes pour data engineers"
          >
            <Download className="w-4 h-4" />
            Data Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        {reportData?.dailyRevenue && (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Revenu Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${reportData.dailyRevenue.reduce((sum, d) => sum + d.revenue, 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <TrendingUp className="inline w-3 h-3 mr-1 text-green-500" />
                  +12% vs dernière période
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Commandes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reportData.dailyRevenue.reduce((sum, d) => sum + d.orders, 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Moyenne: {Math.round(reportData.dailyRevenue.reduce((sum, d) => sum + d.orders, 0) / reportData.dailyRevenue.length)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Panier Moyen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(reportData.dailyRevenue.reduce((sum, d) => sum + d.revenue, 0) / reportData.dailyRevenue.reduce((sum, d) => sum + d.orders, 0)).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Par commande
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Taux Complétion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reportData.ordersByStatus.find(s => s.status === 'PAID')?.percentage.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Commandes payées
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tendance Revenu</CardTitle>
            <CardDescription>
              Évolution quotidienne des ventes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reportData?.dailyRevenue && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportData.dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Revenu']} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#ff7f50" name="Revenu ($)" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Orders by Hour */}
        <Card>
          <CardHeader>
            <CardTitle>Commandes par Heure</CardTitle>
            <CardDescription>
              Patterns de commande
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reportData?.hourlyOrders && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.hourlyOrders}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition Commandes</CardTitle>
            <CardDescription>
              Par statut
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reportData?.ordersByStatus && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportData.ordersByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => {
                      const total = reportData.ordersByStatus.reduce((sum, s) => sum + s.count, 0);
                      const percentage = total > 0 ? ((value / total) * 100).toFixed(0) : 0;
                      return `${name} ${percentage}%`;
                    }}
                    outerRadius={100}
                    dataKey="count"
                  >
                    {reportData.ordersByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Moyens de Paiement</CardTitle>
            <CardDescription>
              Distribution des méthodes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData?.paymentMethods.map((method, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{method.method}</p>
                    <p className="text-sm text-muted-foreground">{method.count} transactions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${method.amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {reportData.paymentMethods.length > 0 ? ((method.amount / reportData.paymentMethods.reduce((s, m) => s + m.amount, 0)) * 100).toFixed(0) : 0}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Items */}
      <Card>
        <CardHeader>
          <CardTitle>Articles Populaires</CardTitle>
          <CardDescription>
            Les plus vendus
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData?.topItems.slice(0, 10).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between pb-4 border-b last:border-b-0">
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full"
                      style={{ width: `${(item.orders / Math.max(...reportData.topItems.map(i => i.orders))) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="font-bold">${item.revenue.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">{item.orders} commandes</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
