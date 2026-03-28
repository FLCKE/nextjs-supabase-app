'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, MoreHorizontal, Trash, Plus, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TableDialog } from '@/components/restaurants/table-dialog';
import { QRCodeDisplay } from '@/components/restaurants/qr-code-display';
import { deleteTable, regenerateQRToken } from '@/lib/actions/restaurant-management';
import { useRole } from '@/hooks/useRole';
import { toast } from 'sonner';
import type { Table as TableType } from '@/types';

interface TablesTabProps {
  restaurantId: string;
  tables: TableType[];
}

export function TablesTab({ restaurantId, tables }: TablesTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<TableType | null>(null);
  const [qrTable, setQrTable] = useState<TableType | null>(null);
  const { isReadOnly } = useRole();
  const router = useRouter();

  const handleEdit = (table: TableType) => {
    setSelectedTable(table);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedTable(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return;

    try {
      await deleteTable(id, restaurantId);
      toast.success('Table deleted successfully');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete table');
    }
  };

  const handleRegenerateQR = async (id: string) => {
    if (!confirm('Are you sure you want to regenerate the QR code? The old QR code will no longer work.')) return;

    try {
      await regenerateQRToken(id, restaurantId);
      toast.success('QR code regenerated successfully');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to regenerate QR code');
    }
  };

  const handleViewQR = (table: TableType) => {
    setQrTable(table);
    setQrDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedTable(null);
  };

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Tables</h3>
          <p className="text-sm text-muted-foreground">{tables.length} tables</p>
        </div>
        {!isReadOnly && (
          <Button onClick={handleCreate} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Table
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>QR Token</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tables.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No tables found. Create your first table to get started.
                </TableCell>
              </TableRow>
            ) : (
              tables.map((table) => (
                <TableRow key={table.id}>
                  <TableCell className="font-medium">{table.label}</TableCell>
                  <TableCell>
                    <Badge variant={table.active ? 'default' : 'secondary'}>
                      {table.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {table.qr_token.slice(0, 8)}...
                    </code>
                  </TableCell>
                  <TableCell>{new Date(table.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewQR(table)}>
                          <Download className="mr-2 h-4 w-4" />
                          View QR Code
                        </DropdownMenuItem>
                        {!isReadOnly && (
                          <>
                            <DropdownMenuItem onClick={() => handleEdit(table)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRegenerateQR(table.id)}>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Regenerate QR
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(table.id)}
                              className="text-red-600"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TableDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        restaurantId={restaurantId}
        table={selectedTable}
        onSuccess={handleSuccess}
      />

      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR Code - {qrTable?.label}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            {qrTable && (
              <>
                <div data-qr={qrTable.qr_token}>
                  <QRCodeDisplay value={qrTable.qr_token} size={300} />
                </div>
                <Button
                  onClick={() => {
                    const canvas = document.querySelector(`canvas`) as HTMLCanvasElement;
                    if (!canvas) return;

                    const url = canvas.toDataURL('image/png');
                    const link = document.createElement('a');
                    link.download = `table-${qrTable.label}-qr.png`;
                    link.href = url;
                    link.click();
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download QR Code
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
