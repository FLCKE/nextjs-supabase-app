'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import QRCode from 'qrcode';
import { Download, Copy, RefreshCw, Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import type { Location, Table } from '@/types';

interface Restaurant {
  id: string;
  name: string;
}

interface LocationWithTables {
  location: Location;
  tables: Table[];
}

interface QRCodeGeneratorProps {
  restaurants: Restaurant[];
  initialRestaurantId: string;
  initialLocationsWithTables: LocationWithTables[];
}

export function QRCodeGenerator({
  restaurants,
  initialRestaurantId,
  initialLocationsWithTables,
}: QRCodeGeneratorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedRestaurant, setSelectedRestaurant] = useState(initialRestaurantId);
  const [locationsWithTables, setLocationsWithTables] = useState(initialLocationsWithTables);
  const [generatedQRCodes, setGeneratedQRCodes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isLoadingTables, setIsLoadingTables] = useState(false);

  useEffect(() => {
    const restaurantId = searchParams.get('restaurant') || initialRestaurantId;
    setSelectedRestaurant(restaurantId);
  }, [searchParams, initialRestaurantId]);

  useEffect(() => {
    const loadLocationsAndTables = async () => {
      if (selectedRestaurant === initialRestaurantId && initialLocationsWithTables.length > 0) {
        setLocationsWithTables(initialLocationsWithTables);
        return;
      }

      setIsLoadingTables(true);
      try {
        const response = await fetch(
          `/api/qr-codes/locations?restaurant=${selectedRestaurant}`
        );
        if (!response.ok) throw new Error('Failed to load tables');
        const data = await response.json();
        setLocationsWithTables(data.locationsWithTables || []);
        setGeneratedQRCodes({});
      } catch (error) {
        console.error('Error loading tables:', error);
        toast.error('Failed to load tables');
      } finally {
        setIsLoadingTables(false);
      }
    };

    loadLocationsAndTables();
  }, [selectedRestaurant, initialRestaurantId, initialLocationsWithTables]);

  const handleRestaurantChange = (restaurantId: string) => {
    setSelectedRestaurant(restaurantId);
    const params = new URLSearchParams();
    params.set('restaurant', restaurantId);
    router.push(`/dashboard/qr-codes?${params.toString()}`);
  };

  const getQRUrl = (qrToken: string) => {
    return `${typeof window !== 'undefined' ? window.location.origin : ''}/qr/${qrToken}`;
  };

  const generateQRCode = async (tableId: string, qrToken: string) => {
    try {
      const url = getQRUrl(qrToken);
      const qrDataUrl = await QRCode.toDataURL(url, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.95,
        margin: 2,
        width: 300,
      });
      setGeneratedQRCodes((prev) => ({
        ...prev,
        [tableId]: qrDataUrl,
      }));
      toast.success('QR code generated');
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const generateAllQRCodes = async () => {
    setLoading(true);
    try {
      const allCodes: Record<string, string> = {};
      for (const locationData of locationsWithTables) {
        for (const table of locationData.tables) {
          const url = getQRUrl(table.qr_token);
          const qrDataUrl = await QRCode.toDataURL(url, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            quality: 0.95,
            margin: 2,
            width: 300,
          });
          allCodes[table.id] = qrDataUrl;
        }
      }
      setGeneratedQRCodes(allCodes);
      toast.success('All QR codes generated');
    } catch (error) {
      console.error('Error generating QR codes:', error);
      toast.error('Failed to generate QR codes');
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = (tableId: string, tableLabel: string) => {
    const qrDataUrl = generatedQRCodes[tableId];
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `table-${tableLabel}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateRestaurantQRCode = async () => {
    try {
      const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/restaurant/${selectedRestaurant}`;
      const qrDataUrl = await QRCode.toDataURL(url, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.95,
        margin: 2,
        width: 300,
      });
      setGeneratedQRCodes((prev) => ({
        ...prev,
        ['restaurant']: qrDataUrl,
      }));
      toast.success('Restaurant QR code generated');
    } catch (error) {
      console.error('Error generating restaurant QR code:', error);
      toast.error('Failed to generate restaurant QR code');
    }
  };

  const downloadRestaurantQRCode = () => {
    const qrDataUrl = generatedQRCodes['restaurant'];
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = 'restaurant-qr.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyRestaurantUrl = () => {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/restaurant/${selectedRestaurant}`;
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  const copyQRUrl = (qrToken: string) => {
    const url = getQRUrl(qrToken);
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* Header with Restaurant selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">QR Codes</h2>
          <p className="text-sm text-muted-foreground">
            Generate QR codes for your restaurant or tables
          </p>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          {restaurants.length > 1 && (
            <div className="flex-1 sm:flex-none">
              <Select value={selectedRestaurant} onValueChange={handleRestaurantChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {restaurants.map((restaurant) => (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto"
          >
            <a href={`/public/menu?restaurant=${selectedRestaurant}`} target="_blank">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </a>
          </Button>
        </div>
      </div>

      {/* Two column layout: Restaurant QR + Generate buttons */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Restaurant QR Code - Left column */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Restaurant</CardTitle>
              <CardDescription className="text-xs">
                Direct entry point
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {generatedQRCodes['restaurant'] ? (
                <div className="flex justify-center p-2 bg-gray-50 rounded">
                  <img
                    src={generatedQRCodes['restaurant']}
                    alt="Restaurant QR code"
                    className="w-40 h-40"
                  />
                </div>
              ) : (
                <div className="flex justify-center p-2 bg-gray-50 rounded h-40 items-center">
                  <p className="text-xs text-muted-foreground text-center">Not generated</p>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => generateRestaurantQRCode()}
                className="w-full"
              >
                Generate
              </Button>

              {generatedQRCodes['restaurant'] && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadRestaurantQRCode()}
                    className="w-full"
                  >
                    <Download className="h-3 w-3 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyRestaurantUrl()}
                    className="w-full"
                  >
                    <Copy className="h-3 w-3 mr-2" />
                    Copy URL
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action buttons - Right column */}
        <div className="lg:col-span-2 space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Table QR Codes</CardTitle>
              <CardDescription className="text-xs">
                {locationsWithTables.reduce((sum, loc) => sum + loc.tables.length, 0)} tables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={generateAllQRCodes}
                disabled={loading || isLoadingTables}
                className="w-full"
                size="lg"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {loading ? 'Generating...' : 'Generate All'}
              </Button>
            </CardContent>
          </Card>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {Object.keys(generatedQRCodes).filter(k => k !== 'restaurant').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Tables Generated</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {locationsWithTables.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Locations</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Locations and tables - Full width */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Tables by Location</h3>
        
        {isLoadingTables ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading tables...</span>
            </CardContent>
          </Card>
        ) : locationsWithTables.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No tables found for this restaurant</p>
            </CardContent>
          </Card>
        ) : (
          locationsWithTables.map((locationData) => (
            <Card key={locationData.location.id}>
              <CardHeader>
                <CardTitle>{locationData.location.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {locationData.tables.map((table) => (
                    <Card key={table.id} className="border">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">T {table.label}</CardTitle>
                          {!table.active && <Badge variant="secondary" className="text-xs">Off</Badge>}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {generatedQRCodes[table.id] ? (
                          <div className="flex justify-center p-1 bg-gray-50 rounded">
                            <img
                              src={generatedQRCodes[table.id]}
                              alt={`QR code for table ${table.label}`}
                              className="w-32 h-32"
                            />
                          </div>
                        ) : (
                          <div className="flex justify-center p-1 bg-gray-50 rounded h-32 items-center">
                            <p className="text-xs text-muted-foreground text-center">Not generated</p>
                          </div>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateQRCode(table.id, table.qr_token)}
                          className="w-full text-xs h-8"
                        >
                          Generate
                        </Button>

                        {generatedQRCodes[table.id] && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadQRCode(table.id, table.label)}
                            className="w-full text-xs h-8"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
