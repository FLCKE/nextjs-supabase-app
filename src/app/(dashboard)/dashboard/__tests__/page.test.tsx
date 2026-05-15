/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from '../page';
import { useCartStore } from '@/lib/cart/cart-store';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('Dashboard Page - Integration Tests', () => {
  const mockFetch = global.fetch as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset cart store
    useCartStore.setState({
      items: [],
      tableToken: null,
      restaurant: null,
    });
  });

  describe('Loading State', () => {
    it('should display loading spinner initially', () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<DashboardPage />);

      expect(screen.getByText(/chargement du dashboard/i)).toBeInTheDocument();
      expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    const mockStats = {
      totalRevenue: '$1,250.00',
      ordersToday: 15,
      activeOrders: 3,
      paidOrders: 12,
      avgOrderValue: '$83.33',
      activeTables: 5,
      totalTables: 10,
      topItem: 'Pizza Margherita',
      percentageChange: '+12.5%',
      recentOrders: [
        { id: '#2400', table: 'Table 1', amount: '$45.00', time: '10:30' },
        { id: '#2399', table: 'Table 2', amount: '$32.50', time: '10:15' },
      ],
      success: true,
    };

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockStats,
      });
    });

    it('should display all dashboard stats', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('$1,250.00')).toBeInTheDocument();
        expect(screen.getByText('+15')).toBeInTheDocument();
        expect(screen.getByText('12 payées')).toBeInTheDocument();
        expect(screen.getByText('5/10')).toBeInTheDocument();
        expect(screen.getByText('$83.33')).toBeInTheDocument();
      });
    });

    it('should display percentage change with trend icon', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('+12.5% depuis hier')).toBeInTheDocument();
      });
    });

    it('should display recent orders', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Table 1 - Commande #2400')).toBeInTheDocument();
        expect(screen.getByText('Montant: $45.00')).toBeInTheDocument();
        expect(screen.getByText('10:30')).toBeInTheDocument();
      });
    });

    it('should display top item', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Pizza Margherita')).toBeInTheDocument();
      });
    });

    it('should display conversion rate', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        // 12/15 * 100 = 80%
        expect(screen.getByText((text) => text.includes('80.0%'))).toBeInTheDocument();
      });
    });

    it('should display table utilization', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        // 5/10 * 100 = 50%
        expect(screen.getByText((text) => text.includes('50%'))).toBeInTheDocument();
      });
    });
  });

  describe('Error State', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({
          success: false,
        }),
      });
    });

    it('should display error message when fetch fails', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/erreur lors du chargement des données/i)
        ).toBeInTheDocument();
      });
    });

    it('should display alert icon in error state', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        // AlertCircle icon should be present
        expect(screen.getByTestId('alert-circle', { hidden: true })).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    const emptyStats = {
      totalRevenue: '$0.00',
      ordersToday: 0,
      activeOrders: 0,
      paidOrders: 0,
      avgOrderValue: '$0.00',
      activeTables: 0,
      totalTables: 0,
      topItem: 'N/A',
      percentageChange: '0%',
      recentOrders: [],
      success: true,
    };

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => emptyStats,
      });
    });

    it('should display "no orders" message when no recent orders', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText(/aucune commande pour le moment/i)).toBeInTheDocument();
      });
    });

    it('should display N/A for top item', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('N/A')).toBeInTheDocument();
      });
    });
  });

  describe('Polling Behavior', () => {
    const mockStatsV1 = {
      totalRevenue: '$1,000.00',
      ordersToday: 10,
      activeOrders: 2,
      paidOrders: 8,
      avgOrderValue: '$100.00',
      activeTables: 3,
      totalTables: 10,
      topItem: 'Pizza',
      percentageChange: '+10%',
      recentOrders: [],
      success: true,
    };

    const mockStatsV2 = {
      totalRevenue: '$1,500.00',
      ordersToday: 15,
      activeOrders: 5,
      paidOrders: 10,
      avgOrderValue: '$100.00',
      activeTables: 5,
      totalTables: 10,
      topItem: 'Burger',
      percentageChange: '+15%',
      recentOrders: [],
      success: true,
    };

    it('should refresh stats every 30 seconds', async () => {
      jest.useFakeTimers();

      mockFetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockStatsV1 })
        .mockResolvedValueOnce({ ok: true, json: async () => mockStatsV2 });

      render(<DashboardPage />);

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText('$1,000.00')).toBeInTheDocument();
      });

      // Fast-forward 30 seconds
      jest.advanceTimersByTime(30000);

      await waitFor(() => {
        expect(screen.getByText('$1,500.00')).toBeInTheDocument();
        expect(screen.getByText('Burger')).toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe('Accessibility', () => {
    const mockStats = {
      totalRevenue: '$1,250.00',
      ordersToday: 15,
      activeOrders: 3,
      paidOrders: 12,
      avgOrderValue: '$83.33',
      activeTables: 5,
      totalTables: 10,
      topItem: 'Pizza Margherita',
      percentageChange: '+12.5%',
      recentOrders: [],
      success: true,
    };

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockStats,
      });
    });

    it('should have proper heading hierarchy', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Dashboard');
      });
    });

    it('should have proper card structure', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByRole('region', { name: /revenu total/i })).toBeInTheDocument();
      });
    });
  });

  describe('Client-Side Data Fetching Detection', () => {
    it('should use client-side fetching with useEffect', async () => {
      const mockStats = {
        totalRevenue: '$1,000.00',
        ordersToday: 10,
        activeOrders: 2,
        paidOrders: 8,
        avgOrderValue: '$100.00',
        activeTables: 3,
        totalTables: 10,
        topItem: 'Pizza',
        percentageChange: '+10%',
        recentOrders: [],
        success: true,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockStats,
      });

      render(<DashboardPage />);

      // Verify fetch was called to /api/dashboard/stats
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/dashboard/stats',
          expect.objectContaining({
            cache: 'no-store',
          })
        );
      });
    });
  });
});
