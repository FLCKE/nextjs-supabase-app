import { z } from 'zod';

export const adjustmentTypeEnum = z.enum(['IN', 'OUT', 'SPOILAGE'], {
  message: 'Type must be IN, OUT, or SPOILAGE',
});

export const createInventoryAdjustmentSchema = z.object({
  item_id: z.string().uuid('Invalid item ID'),
  type: adjustmentTypeEnum,
  quantity: z
    .number({ message: 'Quantity must be a number' })
    .int('Quantity must be a whole number')
    .positive('Quantity must be greater than 0'),
  reason: z.string().max(500, 'Reason must be 500 characters or less').optional().nullable(),
});

export type CreateInventoryAdjustmentInput = z.infer<typeof createInventoryAdjustmentSchema>;

export const inventoryFilterSchema = z.object({
  item_id: z.string().uuid().optional(),
  type: adjustmentTypeEnum.optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
});

export type InventoryFilterInput = z.infer<typeof inventoryFilterSchema>;
