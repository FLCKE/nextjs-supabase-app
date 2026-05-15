/**
 * Tests d'intégration pour l'API Dashboard Stats
 * Vérifie que les calculs sont réels et non hardcodés
 */

import { NextRequest } from 'next/server';
import { GET } from '../route';

// Mock Supabase
const mockSupabase = {
  from: jest.fn(),
};

const mockQuery = {
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lt: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  single: jest.fn(),
};

jest.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => mockSupabase,
}));

describe('API Dashboard Stats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockRequest = (pathname = '/api/dashboard/stats') => {
    return new NextRequest(new URL(pathname, 'http://localhost:3000'));
  };

  describe('GET /api/dashboard/stats', () => {
    it('should return 500 when database query fails', async () => {
      mockSupabase.from.mockReturnValue({
        ...mockQuery,
        select: jest.fn().mockReturnThis(),
      });

      const response = await GET(createMockRequest());
      const data = await response.json();

      // Should return error response
      expect(data.success).toBe(false);
    });

    it('should calculate real percentage change vs yesterday', async () => {
      // Mock today's orders (5 orders)
      const todayOrders = [
        { id: '1', total_gross_cts: 1000, status: 'pending', created_at: new Date().toISOString(), table_id: 't1' },
        { id: '2', total_gross_cts: 2000, status: 'preparing', created_at: new Date().toISOString(), table_id: 't2' },
        { id: '3', total_gross_cts: 1500, status: 'completed', created_at: new Date().toISOString(), table_id: 't1' },
        { id: '4', total_gross_cts: 3000, status: 'pending', created_at: new Date().toISOString(), table_id: 't3' },
        { id: '5', total_gross_cts: 2500, status: 'ready', created_at: new Date().toISOString(), table_id: 't2' },
      ];

      // Mock yesterday's orders (4 orders)
      const yesterdayOrders = [
        { id: 'y1' },
        { id: 'y2' },
        { id: 'y3' },
        { id: 'y4' },
      ];

      // Setup mock responses
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'orders') {
          return {
            select: jest.fn().mockReturnThis(),
            gte: jest.fn().mockImplementation(() => ({
              data: todayOrders,
              error: null,
            })),
            lt: jest.fn().mockImplementation(() => ({
              data: yesterdayOrders,
              error: null,
            })),
          };
        }
        if (table === 'payments') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            gte: jest.fn().mockImplementation(() => ({
              data: [],
              error: null,
            })),
          };
        }
        if (table === 'tables') {
          return {
            select: jest.fn().mockReturnThis(),
            data: [{ id: 't1', label: 'Table 1' }, { id: 't2', label: 'Table 2' }],
            error: null,
          };
        }
        if (table === 'order_items') {
          return {
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockImplementation(() => ({
              data: [],
              error: null,
            })),
          };
        }
        return mockQuery;
      });

      const response = await GET(createMockRequest());
      const data = await response.json();

      // Percentage change: ((5 - 4) / 4) * 100 = 25%
      expect(data.percentageChange).toBe('+25.0%');
      expect(data.ordersToday).toBe(5);
    });

    it('should handle zero yesterday orders gracefully', async () => {
      const todayOrders = [
        { id: '1', total_gross_cts: 1000, status: 'pending', created_at: new Date().toISOString(), table_id: 't1' },
      ];

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'orders') {
          return {
            select: jest.fn().mockReturnThis(),
            gte: jest.fn().mockImplementation(() => ({
              data: todayOrders,
              error: null,
            })),
            lt: jest.fn().mockImplementation(() => ({
              data: [], // No yesterday orders
              error: null,
            })),
          };
        }
        if (table === 'payments') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            gte: jest.fn().mockImplementation(() => ({
              data: [],
              error: null,
            })),
          };
        }
        if (table === 'tables') {
          return {
            select: jest.fn().mockReturnThis(),
            data: [],
            error: null,
          };
        }
        if (table === 'order_items') {
          return {
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockImplementation(() => ({
              data: [],
              error: null,
            })),
          };
        }
        return mockQuery;
      });

      const response = await GET(createMockRequest());
      const data = await response.json();

      expect(data.percentageChange).toBe('+0.0%');
    });

    it('should calculate real top item from order_items', async () => {
      const todayOrders = [
        { id: 'order-1', total_gross_cts: 1000, status: 'pending', created_at: new Date().toISOString(), table_id: 't1', order_number: '001' },
      ];

      const orderItems = [
        { menu_item_id: 'item-1', name: 'Pizza Margherita', quantity: 3 },
        { menu_item_id: 'item-1', name: 'Pizza Margherita', quantity: 2 },
        { menu_item_id: 'item-2', name: 'Coca Cola', quantity: 1 },
      ];

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'orders') {
          return {
            select: jest.fn().mockReturnThis(),
            gte: jest.fn().mockImplementation(() => ({
              data: todayOrders,
              error: null,
            })),
            lt: jest.fn().mockImplementation(() => ({
              data: [],
              error: null,
            })),
          };
        }
        if (table === 'payments') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            gte: jest.fn().mockImplementation(() => ({
              data: [],
              error: null,
            })),
          };
        }
        if (table === 'tables') {
          return {
            select: jest.fn().mockReturnThis(),
            data: [{ id: 't1', label: 'Table 1' }],
            error: null,
          };
        }
        if (table === 'order_items') {
          return {
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockImplementation(() => ({
              data: orderItems,
              error: null,
            })),
          };
        }
        return mockQuery;
      });

      const response = await GET(createMockRequest());
      const data = await response.json();

      // Top item should be Pizza Margherita (5 total quantity)
      expect(data.topItem).toBe('Pizza Margherita');
    });

    it('should return N/A when no order items exist', async () => {
      const todayOrders = [
        { id: 'order-1', total_gross_cts: 1000, status: 'pending', created_at: new Date().toISOString(), table_id: 't1', order_number: '001' },
      ];

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'orders') {
          return {
            select: jest.fn().mockReturnThis(),
            gte: jest.fn().mockImplementation(() => ({
              data: todayOrders,
              error: null,
            })),
            lt: jest.fn().mockImplementation(() => ({
              data: [],
              error: null,
            })),
          };
        }
        if (table === 'payments') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            gte: jest.fn().mockImplementation(() => ({
              data: [],
              error: null,
            })),
          };
        }
        if (table === 'tables') {
          return {
            select: jest.fn().mockReturnThis(),
            data: [{ id: 't1', label: 'Table 1' }],
            error: null,
          };
        }
        if (table === 'order_items') {
          return {
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockImplementation(() => ({
              data: [], // No items
              error: null,
            })),
          };
        }
        return mockQuery;
      });

      const response = await GET(createMockRequest());
      const data = await response.json();

      expect(data.topItem).toBe('N/A');
    });

    it('should use real recent orders from database', async () => {
      const todayOrders = [
        {
          id: 'order-1',
          total_gross_cts: 2500,
          status: 'pending',
          created_at: '2026-05-01T10:30:00Z',
          table_id: 't1',
          order_number: '001',
        },
        {
          id: 'order-2',
          total_gross_cts: 1800,
          status: 'preparing',
          created_at: '2026-05-01T11:00:00Z',
          table_id: 't2',
          order_number: '002',
        },
      ];

      const tables = [{ id: 't1', label: 'Table 1' }, { id: 't2', label: 'Table 2' }];

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'orders') {
          return {
            select: jest.fn().mockReturnThis(),
            gte: jest.fn().mockImplementation(() => ({
              data: todayOrders,
              error: null,
            })),
            lt: jest.fn().mockImplementation(() => ({
              data: [],
              error: null,
            })),
          };
        }
        if (table === 'payments') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            gte: jest.fn().mockImplementation(() => ({
              data: [],
              error: null,
            })),
          };
        }
        if (table === 'tables') {
          return {
            select: jest.fn().mockReturnThis(),
            data: tables,
            error: null,
          };
        }
        if (table === 'order_items') {
          return {
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockImplementation(() => ({
              data: [],
              error: null,
            })),
          };
        }
        return mockQuery;
      });

      const response = await GET(createMockRequest());
      const data = await response.json();

      expect(data.recentOrders).toHaveLength(2);
      expect(data.recentOrders[0].table).toBe('Table 2'); // Most recent
      expect(data.recentOrders[1].table).toBe('Table 1');
    });

    it('should calculate active orders correctly', async () => {
      const todayOrders = [
        { id: '1', total_gross_cts: 1000, status: 'pending', created_at: new Date().toISOString(), table_id: 't1' },
        { id: '2', total_gross_cts: 2000, status: 'preparing', created_at: new Date().toISOString(), table_id: 't2' },
        { id: '3', total_gross_cts: 1500, status: 'ready', created_at: new Date().toISOString(), table_id: 't1' },
        { id: '4', total_gross_cts: 3000, status: 'completed', created_at: new Date().toISOString(), table_id: 't3' },
        { id: '5', total_gross_cts: 2500, status: 'paying', created_at: new Date().toISOString(), table_id: 't2' },
      ];

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'orders') {
          return {
            select: jest.fn().mockReturnThis(),
            gte: jest.fn().mockImplementation(() => ({
              data: todayOrders,
              error: null,
            })),
            lt: jest.fn().mockImplementation(() => ({
              data: [],
              error: null,
            })),
          };
        }
        if (table === 'payments') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            gte: jest.fn().mockImplementation(() => ({
              data: [],
              error: null,
            })),
          };
        }
        if (table === 'tables') {
          return {
            select: jest.fn().mockReturnThis(),
            data: [],
            error: null,
          };
        }
        if (table === 'order_items') {
          return {
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockImplementation(() => ({
              data: [],
              error: null,
            })),
          };
        }
        return mockQuery;
      });

      const response = await GET(createMockRequest());
      const data = await response.json();

      // activeOrders = orders with status 'pending' = 1
      expect(data.activeOrders).toBe(1);
      // paidOrders = orders with status 'preparing', 'ready', or 'completed' = 3
      expect(data.paidOrders).toBe(3);
    });

    it('should calculate revenue from payments', async () => {
      const payments = [
        { amount_cts: 10000, status: 'completed', created_at: new Date().toISOString() },
        { amount_cts: 5000, status: 'completed', created_at: new Date().toISOString() },
        { amount_cts: 7500, status: 'completed', created_at: new Date().toISOString() },
      ];

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'orders') {
          return {
            select: jest.fn().mockReturnThis(),
            gte: jest.fn().mockImplementation(() => ({
              data: [],
              error: null,
            })),
            lt: jest.fn().mockImplementation(() => ({
              data: [],
              error: null,
            })),
          };
        }
        if (table === 'payments') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            gte: jest.fn().mockImplementation(() => ({
              data: payments,
              error: null,
            })),
          };
        }
        if (table === 'tables') {
          return {
            select: jest.fn().mockReturnThis(),
            data: [],
            error: null,
          };
        }
        if (table === 'order_items') {
          return {
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockImplementation(() => ({
              data: [],
              error: null,
            })),
          };
        }
        return mockQuery;
      });

      const response = await GET(createMockRequest());
      const data = await response.json();

      // Total: (10000 + 5000 + 7500) / 100 = 225.00
      expect(data.totalRevenue).toBe('$225.00');
    });
  });
});
