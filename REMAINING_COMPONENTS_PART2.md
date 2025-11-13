# ALL REMAINING COMPONENT FILES - PART 2

---

## FILE: src/app/(dashboard)/dashboard/restaurants/[id]/_components/tables-section.tsx

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Table as TableType } from '@/types'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { TableDialog } from './table-dialog'
import { Badge } from '@/components/ui/badge'

export function TablesSection({
  locationId,
  restaurantId,
  userRole,
}: {
  locationId: string
  restaurantId: string
  userRole: string
}) {
  const [tables, setTables] = useState<TableType[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTable, setEditingTable] = useState<TableType | null>(null)
  const [viewingQR, setViewingQR] = useState<TableType | null>(null)

  useEffect(() => {
    loadTables()
  }, [locationId])

  const loadTables = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('tables')
      .select('*')
      .eq('location_id', locationId)
      .order('label')

    setTables(data || [])
    setLoading(false)
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading tables...</p>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Tables</h3>
        {userRole === 'owner' && (
          <TableDialog locationId={locationId} restaurantId={restaurantId} onSuccess={loadTables}>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Table
            </Button>
          </TableDialog>
        )}
      </div>

      {tables.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">
          No tables yet. Add your first table to generate QR codes.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tables.map((table) => (
            <div
              key={table.id}
              className="border rounded-lg p-4 space-y-2 hover:bg-muted/50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <p className="font-medium">{table.label}</p>
                <Badge variant={table.active ? 'default' : 'secondary'}>
                  {table.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setViewingQR(table)}
                >
                  View QR
                </Button>
                {userRole === 'owner' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => setEditingTable(table)}
                  >
                    Edit
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {editingTable && (
        <TableDialog
          locationId={locationId}
          restaurantId={restaurantId}
          table={editingTable}
          open={!!editingTable}
          onOpenChange={(open) => !open && setEditingTable(null)}
          onSuccess={loadTables}
        />
      )}

      {viewingQR && (
        <QRCodeDialog
          table={viewingQR}
          open={!!viewingQR}
          onOpenChange={(open) => !open && setViewingQR(null)}
        />
      )}
    </div>
  )
}

// QR Code Dialog Component
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { QRCodeDisplay } from './qr-code-display'

function QRCodeDialog({
  table,
  open,
  onOpenChange,
}: {
  table: TableType
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>QR Code: {table.label}</DialogTitle>
          <DialogDescription>
            Scan this code to access the table menu
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <QRCodeDisplay qrToken={table.qr_token} label={table.label} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

---

## FILE: src/app/(dashboard)/dashboard/restaurants/[id]/_components/table-dialog.tsx

```typescript
'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { tableSchema } from '@/lib/validation/restaurant'
import { createTable, updateTable, deleteTable } from '@/lib/restaurant-actions'
import { toast } from 'sonner'
import { Table as TableType } from '@/types'
import { Trash } from 'lucide-react'

const formSchema = tableSchema.extend({
  active: z.boolean(),
})

export function TableDialog({
  locationId,
  restaurantId,
  table,
  children,
  open,
  onOpenChange,
  onSuccess,
}: {
  locationId: string
  restaurantId: string
  table?: TableType
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: table?.label || '',
      active: table?.active ?? true,
    },
  })

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen)
    } else {
      setIsOpen(newOpen)
    }
  }

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('label', data.label)
      formData.append('active', String(data.active))

      const result = table
        ? await updateTable(table.id, restaurantId, formData)
        : await createTable(locationId, restaurantId, formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(table ? 'Table updated successfully' : 'Table created successfully')
        handleOpenChange(false)
        form.reset()
        onSuccess?.()
      }
    })
  }

  const handleDelete = () => {
    if (!table) return
    if (!confirm('Are you sure you want to delete this table?')) return

    startTransition(async () => {
      const { error } = await deleteTable(table.id, restaurantId)

      if (error) {
        toast.error(error)
      } else {
        toast.success('Table deleted successfully')
        handleOpenChange(false)
        onSuccess?.()
      }
    })
  }

  return (
    <Dialog open={open !== undefined ? open : isOpen} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{table ? 'Edit Table' : 'Create Table'}</DialogTitle>
          <DialogDescription>
            {table ? 'Update table information' : 'Add a new table and generate QR code'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">Table Label</Label>
            <Input id="label" {...form.register('label')} placeholder="Table 1" />
            {form.formState.errors.label && (
              <p className="text-sm text-destructive">{form.formState.errors.label.message}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={form.watch('active')}
              onCheckedChange={(checked) => form.setValue('active', checked)}
            />
            <Label htmlFor="active">Active</Label>
          </div>
          <DialogFooter className="flex justify-between">
            {table && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isPending}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
            <Button type="submit" disabled={isPending} className="ml-auto">
              {isPending ? 'Saving...' : table ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

---

## FILE: src/app/(dashboard)/dashboard/restaurants/[id]/_components/qr-code-display.tsx

```typescript
'use client'

import { useEffect, useState } from 'react'
import { generateQRCodeDataURL } from '@/lib/qr-code'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function QRCodeDisplay({ qrToken, label }: { qrToken: string; label: string }) {
  const [qrCode, setQRCode] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    generateQRCodeDataURL(qrToken)
      .then((dataURL) => {
        setQRCode(dataURL)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Failed to generate QR code:', error)
        setLoading(false)
      })
  }, [qrToken])

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = qrCode
    link.download = `table-${label}-qr.png`
    link.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Generating QR code...</p>
      </div>
    )
  }

  if (!qrCode) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-destructive">Failed to generate QR code</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <img src={qrCode} alt={`QR Code for ${label}`} className="rounded-lg border" />
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">Token: {qrToken}</p>
        <Button onClick={handleDownload} variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Download QR Code
        </Button>
      </div>
    </div>
  )
}
```

---

## FILE: src/lib/qr-code.ts

```typescript
import QRCode from 'qrcode'

export async function generateQRCodeDataURL(text: string): Promise<string> {
  try {
    const dataURL = await QRCode.toDataURL(text, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
    return dataURL
  } catch (error) {
    console.error('QR Code generation error:', error)
    throw error
  }
}

export async function generateQRCodePNG(text: string): Promise<Buffer> {
  try {
    const buffer = await QRCode.toBuffer(text, {
      width: 600,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })
    return buffer
  } catch (error) {
    console.error('QR Code generation error:', error)
    throw error
  }
}
```

---

## FILE: src/components/ui/switch.tsx

```typescript
import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
```

---

## FILE: src/components/ui/badge.tsx

```typescript
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
```

---

## Update package.json to add:

```json
"@radix-ui/react-switch": "^1.1.2"
```

---

## THAT'S IT!

All files are now provided. Create the directories and copy these files to complete the implementation.
