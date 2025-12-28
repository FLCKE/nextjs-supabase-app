'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QrCode, Download } from 'lucide-react';
import { generateTableQRCode } from '@/lib/actions/restaurant-management';
import { toast } from 'sonner';

interface QRCodeDisplayProps {
  tableId: string;
  tableLabel: string | number;
}

export function QRCodeDisplay({ tableId, tableLabel }: QRCodeDisplayProps) {
  const [open, setOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenDialog = async () => {
    if (qrCodeUrl) {
      setOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateTableQRCode(tableId, String(tableLabel));

      if (result.success && result.qrCodeImageUrl) {
        setQrCodeUrl(result.qrCodeImageUrl);
        setOpen(true);
      } else {
        toast.error(result.error || 'Failed to generate QR code');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `table-${tableLabel}-qr-code.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('QR code downloaded');
    } catch (error) {
      toast.error('Failed to download QR code');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleOpenDialog}
          disabled={isLoading}
        >
          <QrCode className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code - Table {tableLabel}</DialogTitle>
          <DialogDescription>
            Scan this QR code to access the menu for this table
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          {qrCodeUrl && (
            <div className="bg-white p-4 rounded-lg border">
              <img
                src={qrCodeUrl}
                alt={`QR Code for Table ${tableLabel}`}
                className="w-64 h-64"
              />
            </div>
          )}

          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button className="flex-1" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
