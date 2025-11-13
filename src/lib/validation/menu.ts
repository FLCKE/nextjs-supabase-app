import { z } from 'zod';

export const createMenuSchema = z.object({
  restaurant_id: z.string().uuid(),
  name: z.string().min(1, 'Menu name is required').max(100, 'Menu name is too long'),
  is_active: z.boolean().default(true),
});

export const updateMenuSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Menu name is required').max(100, 'Menu name is too long').optional(),
  is_active: z.boolean().optional(),
});

export const createMenuItemSchema = z.object({
  menu_id: z.string().uuid(),
  name: z.string().min(1, 'Item name is required').max(100, 'Item name is too long'),
  description: z.string().max(500, 'Description is too long').optional().nullable(),
  price_cts: z.number().int().min(0, 'Price must be positive'),
  currency: z.string().length(3, 'Currency must be 3 letters').default('USD'),
  tax_rate: z.number().min(0).max(100, 'Tax rate must be between 0 and 100').optional().nullable(),
  stock_mode: z.enum(['FINITE', 'INFINITE', 'HIDDEN_WHEN_OOS']).default('INFINITE'),
  stock_qty: z.number().int().min(0).optional().nullable(),
  image_url: z.string().url().nullable().or(z.literal(null)).optional(),
  active: z.boolean().default(true),
});

export const updateMenuItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Item name is required').max(100, 'Item name is too long').optional(),
  description: z.string().max(500, 'Description is too long').optional().nullable(),
  price_cts: z.number().int().min(0, 'Price must be positive').optional(),
  currency: z.string().length(3, 'Currency must be 3 letters').optional(),
  tax_rate: z.number().min(0).max(100, 'Tax rate must be between 0 and 100').optional().nullable(),
  stock_mode: z.enum(['FINITE', 'INFINITE', 'HIDDEN_WHEN_OOS']).optional(),
  stock_qty: z.number().int().min(0).optional().nullable(),
  image_url: z.string().url().nullable().or(z.literal(null)).optional(),
  active: z.boolean().optional(),
});

export type CreateMenuInput = z.infer<typeof createMenuSchema>;
export type UpdateMenuInput = z.infer<typeof updateMenuSchema>;
export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
