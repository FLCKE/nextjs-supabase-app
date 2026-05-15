/**
 * Tests unitaires pour les actions du menu public
 * Vérifie: getPublicMenu, getPublicMenuByRestaurant, createPublicOrder
 */

import { getPublicMenu, getPublicMenuByRestaurant, createPublicOrder } from '../public-menu-actions';

// Mock Supabase clients
const mockSelectQuery = {
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  single: jest.fn(),
  maybeSingle: jest.fn(),
  limit: jest.fn().mockReturnThis(),
};

const mockSupabaseAdmin = {
  from: jest.fn(),
};

const mockSupabaseClient = {
  from: jest.fn(),
};

jest.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => mockSupabaseAdmin,
  createClient: () => mockSupabaseClient,
}));

describe('Public Menu Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPublicMenu', () => {
    it('should return error for invalid table token', async () => {
      mockSupabaseAdmin.from.mockReturnValue({
        ...mockSelectQuery,
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Table not found' },
        }),
      });

      const result = await getPublicMenu('invalid-token');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid or inactive table');
    });

    it('should return menu data for valid table token', async () => {
      // Mock table lookup
      mockSupabaseAdmin.from.mockImplementationOnce(() => ({
        ...mockSelectQuery,
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'table-123',
            label: 'Table 1',
            restaurant_id: 'restaurant-456',
            restaurants: { name: 'Test Restaurant', currency: 'EUR' },
          },
          error: null,
        }),
      }));

      // Mock menu items lookup
      mockSupabaseAdmin.from.mockImplementationOnce(() => ({
        ...mockSelectQuery,
        order: jest.fn().mockResolvedValue({
          data: [
            {
              id: 'item-1',
              name: 'Pizza Margherita',
              description: 'Tomato, mozzarella',
              price_cts: 1200,
              tax_rate: 10,
              image_url: 'https://example.com/pizza.jpg',
              active: true,
              stock_mode: 'INFINITE',
              stock_qty: null,
              menu_id: 'menu-1',
              menus: { name: 'Main Menu', restaurant_id: 'restaurant-456' },
            },
            {
              id: 'item-2',
              name: 'Coca Cola',
              description: null,
              price_cts: 300,
              tax_rate: 20,
              image_url: null,
              active: true,
              stock_mode: 'FINITE',
              stock_qty: 50,
              menu_id: 'menu-1',
              menus: { name: 'Main Menu', restaurant_id: 'restaurant-456' },
            },
          ],
          error: null,
        }),
      }));

      const result = await getPublicMenu('valid-token');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.restaurant_name).toBe('Test Restaurant');
      expect(result.data?.table_label).toBe('Table 1');
      expect(result.data?.currency).toBe('EUR');
      expect(result.data?.menu_items).toHaveLength(2);
    });

    it('should filter out items with zero stock', async () => {
      // Mock table lookup
      mockSupabaseAdmin.from.mockImplementationOnce(() => ({
        ...mockSelectQuery,
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'table-123',
            label: 'Table 1',
            restaurant_id: 'restaurant-456',
            restaurants: { name: 'Test Restaurant', currency: 'USD' },
          },
          error: null,
        }),
      }));

      // Mock menu items with zero stock
      mockSupabaseAdmin.from.mockImplementationOnce(() => ({
        ...mockSelectQuery,
        order: jest.fn().mockResolvedValue({
          data: [
            {
              id: 'item-1',
              name: 'Pizza',
              description: null,
              price_cts: 1200,
              tax_rate: 10,
              image_url: null,
              active: true,
              stock_mode: 'FINITE',
              stock_qty: 0, // Out of stock
              menu_id: 'menu-1',
              menus: { name: 'Main Menu', restaurant_id: 'restaurant-456' },
            },
            {
              id: 'item-2',
              name: 'Coca Cola',
              description: null,
              price_cts: 300,
              tax_rate: 20,
              image_url: null,
              active: true,
              stock_mode: 'FINITE',
              stock_qty: 50, // In stock
              menu_id: 'menu-1',
              menus: { name: 'Main Menu', restaurant_id: 'restaurant-456' },
            },
          ],
          error: null,
        }),
      }));

      const result = await getPublicMenu('valid-token');

      expect(result.data?.menu_items).toHaveLength(1);
      expect(result.data?.menu_items[0].name).toBe('Coca Cola');
    });

    it('should return error when menu items fetch fails', async () => {
      // Mock table lookup success
      mockSupabaseAdmin.from.mockImplementationOnce(() => ({
        ...mockSelectQuery,
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'table-123',
            label: 'Table 1',
            restaurant_id: 'restaurant-456',
            restaurants: { name: 'Test Restaurant', currency: 'USD' },
          },
          error: null,
        }),
      }));

      // Mock menu items fetch error
      mockSupabaseAdmin.from.mockImplementationOnce(() => ({
        ...mockSelectQuery,
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      }));

      const result = await getPublicMenu('valid-token');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to load menu items');
    });
  });

  describe('getPublicMenuByRestaurant', () => {
    it('should return error for non-existent restaurant', async () => {
      mockSupabaseClient.from.mockReturnValue({
        ...mockSelectQuery,
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Restaurant not found' },
        }),
      });

      const result = await getPublicMenuByRestaurant('invalid-restaurant');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Restaurant not found');
    });

    it('should return menu data for valid restaurant', async () => {
      // Mock restaurant lookup
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        ...mockSelectQuery,
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'restaurant-456',
            name: 'Test Restaurant',
            currency: 'USD',
          },
          error: null,
        }),
      }));

      // Mock menu items lookup
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        ...mockSelectQuery,
        order: jest.fn().mockResolvedValue({
          data: [
            {
              id: 'item-1',
              name: 'Pizza Margherita',
              description: 'Classic pizza',
              price_cts: 1200,
              tax_rate: 10,
              image_url: 'https://example.com/pizza.jpg',
              active: true,
              stock_mode: 'INFINITE',
              stock_qty: null,
              category: 'Pizza',
              menu_id: 'menu-1',
              menus: { name: 'Main Menu', restaurant_id: 'restaurant-456' },
            },
          ],
          error: null,
        }),
      }));

      const result = await getPublicMenuByRestaurant('restaurant-456');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.restaurant_name).toBe('Test Restaurant');
      expect(result.data?.table_label).toBe(''); // No specific table
      expect(result.data?.menu_items).toHaveLength(1);
      expect(result.data?.categories).toContain('Pizza');
    });

    it('should extract unique categories from menu items', async () => {
      // Mock restaurant lookup
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        ...mockSelectQuery,
        single: jest.fn().mockResolvedValue({
          data: { id: 'restaurant-456', name: 'Test', currency: 'USD' },
          error: null,
        }),
      }));

      // Mock menu items with various categories
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        ...mockSelectQuery,
        order: jest.fn().mockResolvedValue({
          data: [
            { id: 'item-1', name: 'Pizza', category: 'Pizza', menus: { name: 'Main' } },
            { id: 'item-2', name: 'Burger', category: 'Burgers', menus: { name: 'Main' } },
            { id: 'item-3', name: 'Coca', category: 'Drinks', menus: { name: 'Main' } },
            { id: 'item-4', name: 'Fries', category: 'Sides', menus: { name: 'Main' } },
          ],
          error: null,
        }),
      }));

      const result = await getPublicMenuByRestaurant('restaurant-456');

      expect(result.data?.categories).toEqual(
        expect.arrayContaining(['Pizza', 'Burgers', 'Drinks', 'Sides'])
      );
    });
  });

  describe('createPublicOrder', () => {
    const mockItems = [
      { id: 'item-1', quantity: 2, price_cts: 1200, name: 'Pizza Margherita' },
      { id: 'item-2', quantity: 3, price_cts: 300, name: 'Coca Cola' },
    ];

    it('should return error for invalid table token without restaurant_id', async () => {
      mockSupabaseAdmin.from.mockReturnValue({
        ...mockSelectQuery,
        maybeSingle: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      });

      const result = await createPublicOrder('invalid-token', mockItems);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid table token');
    });

    it('should return error when restaurant_id is missing', async () => {
      mockSupabaseAdmin.from.mockReturnValue({
        ...mockSelectQuery,
        maybeSingle: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      });

      const result = await createPublicOrder('', mockItems);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Restaurant ID is required');
    });

    it('should create order successfully with valid table token', async () => {
      // Mock table lookup
      mockSupabaseAdmin.from.mockImplementationOnce(() => ({
        ...mockSelectQuery,
        maybeSingle: jest.fn().mockResolvedValue({
          data: { id: 'table-123', restaurant_id: 'restaurant-456' },
          error: null,
        }),
      }));

      // Mock restaurant lookup
      mockSupabaseAdmin.from.mockImplementationOnce(() => ({
        ...mockSelectQuery,
        single: jest.fn().mockResolvedValue({
          data: { currency: 'USD' },
          error: null,
        }),
      }));

      // Mock menu items lookup for tax rates
      mockSupabaseAdmin.from.mockImplementationOnce(() => ({
        ...mockSelectQuery,
        in: jest.fn().mockResolvedValue({
          data: [
            { id: 'item-1', tax_rate: 10 },
            { id: 'item-2', tax_rate: 20 },
          ],
          error: null,
        }),
      }));

      // Mock order creation
      mockSupabaseAdmin.from.mockImplementationOnce(() => ({
        ...mockSelectQuery,
        insert: jest.fn().mockImplementation(() => ({
          select: () => ({
            single: jest.fn().mockResolvedValue({
              data: { id: 'order-789' },
              error: null,
            }),
          }),
        })),
      }));

      // Mock order items insertion
      mockSupabaseAdmin.from.mockImplementationOnce(() => ({
        ...mockSelectQuery,
        insert: jest.fn().mockResolvedValue({ error: null }),
      }));

      const result = await createPublicOrder('valid-token', mockItems, 'restaurant-456');

      expect(result.success).toBe(true);
      expect(result.orderId).toBe('order-789');
    });

    it('should calculate correct totals with taxes', async () => {
      // Mock table lookup
      mockSupabaseAdmin.from.mockImplementationOnce(() => ({
        ...mockSelectQuery,
        maybeSingle: jest.fn().mockResolvedValue({
          data: { id: 'table-123', restaurant_id: 'restaurant-456' },
          error: null,
        }),
      }));

      // Mock restaurant lookup
      mockSupabaseAdmin.from.mockImplementationOnce(() => ({
        ...mockSelectQuery,
        single: jest.fn().mockResolvedValue({
          data: { currency: 'EUR' },
          error: null,
        }),
      }));

      // Mock menu items with tax rates
      mockSupabaseAdmin.from.mockImplementationOnce(() => ({
        ...mockSelectQuery,
        in: jest.fn().mockResolvedValue({
          data: [
            { id: 'item-1', tax_rate: 10 },
            { id: 'item-2', tax_rate: 20 },
          ],
          error: null,
        }),
      }));

      // Mock order creation - capture the insert call
      const insertCalls: any[] = [];
      mockSupabaseAdmin.from.mockImplementationOnce(() => ({
        ...mockSelectQuery,
        insert: jest.fn((data) => {
          insertCalls.push(data);
          return {
            select: () => ({
              single: jest.fn().mockResolvedValue({
                data: { id: 'order-789', ...data },
                error: null,
              }),
            }),
          };
        }),
      }));

      // Mock order items insertion
      mockSupabaseAdmin.from.mockImplementationOnce(() => ({
        ...mockSelectQuery,
        insert: jest.fn().mockResolvedValue({ error: null }),
      }));

      await createPublicOrder('valid-token', mockItems, 'restaurant-456');

      // Verify totals calculation
      // Item 1: 1200 * 2 = 2400 (net), tax = 2400 * 10% = 240
      // Item 2: 300 * 3 = 900 (net), tax = 900 * 20% = 180
      // Total net: 3300, Total tax: 420, Total gross: 3720
      expect(insertCalls[0]).toMatchObject({
        total_net_cts: 3300,
        taxes_cts: 420,
        total_gross_cts: 3720,
      });
    });

    it('should handle order creation failure', async () => {
      // Mock table lookup
      mockSupabaseAdmin.from.mockImplementationOnce(() => ({
        ...mockSelectQuery,
        maybeSingle: jest.fn().mockResolvedValue({
          data: { id: 'table-123', restaurant_id: 'restaurant-456' },
          error: null,
        }),
      }));

      // Mock restaurant lookup
      mockSupabaseAdmin.from.mockImplementationOnce(() => ({
        ...mockSelectQuery,
        single: jest.fn().mockResolvedValue({
          data: { currency: 'USD' },
          error: null,
        }),
      }));

      // Mock menu items lookup
      mockSupabaseAdmin.from.mockImplementationOnce(() => ({
        ...mockSelectQuery,
        in: jest.fn().mockResolvedValue({
          data: [{ id: 'item-1', tax_rate: 10 }],
          error: null,
        }),
      }));

      // Mock order creation failure
      mockSupabaseAdmin.from.mockImplementationOnce(() => ({
        ...mockSelectQuery,
        insert: jest.fn().mockImplementation(() => ({
          select: () => ({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database constraint violation' },
            }),
          }),
        })),
      }));

      const result = await createPublicOrder('valid-token', mockItems, 'restaurant-456');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to create order');
    });

    it('should rollback order if items insertion fails', async () => {
      // Mock table lookup
      mockSupabaseAdmin.from.mockImplementationOnce(() => ({
        ...mockSelectQuery,
        maybeSingle: jest.fn().mockResolvedValue({
          data: { id: 'table-123', restaurant_id: 'restaurant-456' },
          error: null,
        }),
      }));

      // Mock restaurant lookup
      mockSupabaseAdmin.from.mockImplementationOnce(() => ({
        ...mockSelectQuery,
        single: jest.fn().mockResolvedValue({
          data: { currency: 'USD' },
          error: null,
        }),
      }));

      // Mock menu items lookup
      mockSupabaseAdmin.from.mockImplementationOnce(() => ({
        ...mockSelectQuery,
        in: jest.fn().mockResolvedValue({
          data: [{ id: 'item-1', tax_rate: 10 }],
          error: null,
        }),
      }));

      // Mock order creation success
      mockSupabaseAdmin.from.mockImplementationOnce(() => ({
        ...mockSelectQuery,
        insert: jest.fn().mockImplementation(() => ({
          select: () => ({
            single: jest.fn().mockResolvedValue({
              data: { id: 'order-789' },
              error: null,
            }),
          }),
        })),
      }));

      // Mock order items insertion failure
      mockSupabaseAdmin.from.mockImplementationOnce(() => ({
        ...mockSelectQuery,
        insert: jest.fn().mockResolvedValue({ error: { message: 'FK violation' } }),
      }));

      const result = await createPublicOrder('valid-token', mockItems, 'restaurant-456');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to add items to order');
    });

    it('should use default table when no table_id found', async () => {
      // Mock table lookup returns null
      mockSupabaseAdmin.from.mockImplementationOnce(() => ({
        ...mockSelectQuery,
        maybeSingle: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }));

      // Mock default table lookup
      mockSupabaseAdmin.from.mockImplementationOnce(() => ({
        ...mockSelectQuery,
        maybeSingle: jest.fn().mockResolvedValue({
          data: { id: 'default-table-123' },
          error: null,
        }),
      }));

      // Mock restaurant lookup
      mockSupabaseAdmin.from.mockImplementationOnce(() => ({
        ...mockSelectQuery,
        single: jest.fn().mockResolvedValue({
          data: { currency: 'USD' },
          error: null,
        }),
      }));

      // Mock menu items lookup
      mockSupabaseAdmin.from.mockImplementationOnce(() => ({
        ...mockSelectQuery,
        in: jest.fn().mockResolvedValue({
          data: [{ id: 'item-1', tax_rate: 10 }],
          error: null,
        }),
      }));

      // Mock order creation
      mockSupabaseAdmin.from.mockImplementationOnce(() => ({
        ...mockSelectQuery,
        insert: jest.fn().mockImplementation(() => ({
          select: () => ({
            single: jest.fn().mockResolvedValue({
              data: { id: 'order-789' },
              error: null,
            }),
          }),
        })),
      }));

      // Mock order items insertion
      mockSupabaseAdmin.from.mockImplementationOnce(() => ({
        ...mockSelectQuery,
        insert: jest.fn().mockResolvedValue({ error: null }),
      }));

      const result = await createPublicOrder('', mockItems, 'restaurant-456');

      expect(result.success).toBe(true);
    });
  });
});
