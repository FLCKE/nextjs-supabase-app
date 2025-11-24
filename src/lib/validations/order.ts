import { z } from 'zod';

export const orderItemSchema = z.object({
  item_id: z.string().uuid(),
  qty: z.number().int().positive(),
});

export const createOrderSchema = z.object({
  table_token: z.string().uuid(),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  notes: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAYING', 'PAID', 'SERVED', 'CANCELLED', 'REFUNDED']),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
