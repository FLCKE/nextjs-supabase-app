import { z } from 'zod';

/**
 * Zod schema for a single item within a new order.
 * The client only sends the item ID and quantity.
 * Price and other details are fetched server-side to prevent tampering.
 */
export const createOrderItemSchema = z.object({
  itemId: z.string().uuid("Invalid menu item ID."),
  quantity: z.number().int().min(1, "Quantity must be at least 1."),
});

/**
 * Zod schema for creating a new order from the POS.
 */
export const createOrderSchema = z.object({
  tableId: z.string().uuid("A table must be selected."),
  items: z.array(createOrderItemSchema).min(1, "Cannot create an empty order."),
  notes: z.string().max(500, "Notes cannot exceed 500 characters.").optional(),
});

export type CreateOrderPayload = z.infer<typeof createOrderSchema>;
export type CreateOrderItemPayload = z.infer<typeof createOrderItemSchema>;
