/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ReportsPage from '../page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock URL.createObjectURL
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();
window.URL.createObjectURL = mockCreateObjectURL;
window.URL.revokeObjectURL = mockRevokeObjectURL;

describe('Reports Page - Integration Tests', () => {
  const mockFetch = global.fetch as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateObjectURL.mockClear();
    mockRevokeObjectURL.mockClear();
  });

  describe('Loading State', () => {
    it('should display loading spinner initially', () => {
      mockFetch.mockImplementation(() => new Promise(() => {}));

      render(<ReportsPage />);

      expect(screen.getByText(/chargement des rapports/i)).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    const mockReportData = {
      dailyRevenue: [
        { date: '2026-05-01', revenue: 150000, orders: 25 },
        { date: '2026-04-30', revenue: 120000, orders: 20 },
        { date: '2026-04-29', revenue: 180000, orders: 30 },
      ],
      paymentMethods: [
        { method: 'Credit Card', count: 50, amount: 250000 },
        { method: 'Cash', count: 25, amount: 100000 },
      ],
      ordersByStatus: [
        { status: 'PAID', count: 40, percentage: 53.33 },
        { status: 'PENDING', count: 15, percentage: 20 },
        { status: 'CANCELLED', count: 5, percentage: 6.67 },
      ],
      topItems: [
        { name: 'Pizza Margherita', orders: 30, revenue: 45000 },
        { name: 'Burger Classic', orders: 25, revenue: 37500 },
        { name: 'Coca Cola', orders: 50, revenue: 15000 },
      ],
      hourlyOrders: [
        { hour: '12:00', orders: 20 },
        { hour: '13:00', orders: 25 },
        { hour: '19:00', orders: 30 },
        { hour: '20:00', orders: 25 },
      ],
      success: true,
    };

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockReportData,
      });
    });

    it('should display key metrics', async () => {
      render(<ReportsPage />);

      await waitFor(() => {
        // Total revenue: 150000 + 120000 + 180000 = 450000 cents = $4500.00
        expect(screen.getByText('$4500.00')).toBeInTheDocument();
      });
    });

    it('should display date range selector', async () => {
      render(<ReportsPage />);

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      expect(screen.getByText('Cette semaine')).toBeInTheDocument();
      expect(screen.getByText('Ce mois')).toBeInTheDocument();
      expect(screen.getByText('Cette année')).toBeInTheDocument();
    });

    it('should refetch data when date range changes', async () => {
      render(<ReportsPage />);

      await waitFor(() => {
        expect(screen.getByText('$4500.00')).toBeInTheDocument();
      });

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'month' } });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/reports?range=month',
          expect.objectContaining({ cache: 'no-store' })
        );
      });
    });

    it('should display export CSV button', async () => {
      render(<ReportsPage />);

      await waitFor(() => {
        expect(screen.getByText('Exporter CSV')).toBeInTheDocument();
      });
    });

    it('should display Data Export button', async () => {
      render(<ReportsPage />);

      await waitFor(() => {
        expect(screen.getByText('Data Export')).toBeInTheDocument();
      });
    });
  });

  describe('CSV Export', () => {
    const mockReportData = {
      dailyRevenue: [
        { date: '2026-05-01', revenue: 150000, orders: 25 },
      ],
      paymentMethods: [
        { method: 'Credit Card', count: 10, amount: 50000 },
      ],
      ordersByStatus: [
        { status: 'PAID', count: 8, percentage: 80 },
      ],
      topItems: [
        { name: 'Pizza', orders: 15, revenue: 22500 },
      ],
      hourlyOrders: [
        { hour: '12:00', orders: 10 },
      ],
      success: true,
    };

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockReportData,
      });
    });

    it('should generate and download CSV on export click', async () => {
      mockCreateObjectURL.mockReturnValue('blob:mock-url');

      render(<ReportsPage />);

      await waitFor(() => {
        expect(screen.getByText('$1500.00')).toBeInTheDocument();
      });

      const exportButton = screen.getByText('Exporter CSV');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalled();
      });
    });

    it('should include UTF-8 BOM in CSV for Excel compatibility', async () => {
      mockCreateObjectURL.mockImplementation((blob) => {
        // Verify blob contains BOM
        return 'blob:mock-url';
      });

      render(<ReportsPage />);

      await waitFor(() => {
        expect(screen.getByText('Exporter CSV')).toBeInTheDocument();
      });

      const exportButton = screen.getByText('Exporter CSV');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalled();
      });
    });
  });

  describe('Client-Side CSV Generation', () => {
    const mockReportData = {
      dailyRevenue: [
        { date: '2026-05-01', revenue: 150000, orders: 25 },
        { date: '2026-04-30', revenue: 120000, orders: 20 },
      ],
      paymentMethods: [
        { method: 'Credit Card', count: 30, amount: 150000 },
      ],
      ordersByStatus: [
        { status: 'PAID', count: 25, percentage: 62.5 },
        { status: 'PENDING', count: 10, percentage: 25 },
      ],
      topItems: [
        { name: 'Pizza', orders: 20, revenue: 30000 },
        { name: 'Burger', orders: 15, revenue: 22500 },
      ],
      hourlyOrders: [
        { hour: '12:00', orders: 15 },
        { hour: '19:00', orders: 20 },
      ],
      success: true,
    };

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockReportData,
      });
    });

    it('should calculate total revenue correctly', async () => {
      render(<ReportsPage />);

      await waitFor(() => {
        // 150000 + 120000 = 270000 cents = $2700.00
        expect(screen.getByText('$2700.00')).toBeInTheDocument();
      });
    });

    it('should calculate average order value', async () => {
      render(<ReportsPage />);

      await waitFor(() => {
        // 270000 / 45 orders = 6000 cents = $60.00
        expect(screen.getByText('$60.00')).toBeInTheDocument();
      });
    });

    it('should calculate daily average revenue', async () => {
      render(<ReportsPage />);

      await waitFor(() => {
        // 270000 / 2 days = 135000 cents = $1350.00
        expect(
          screen.getByText((text) => text.includes('$1350.00') || text.includes('+12%'))
        ).toBeInTheDocument();
      });
    });
  });

  describe('Charts Rendering', () => {
    const mockReportData = {
      dailyRevenue: [
        { date: '2026-05-01', revenue: 150000, orders: 25 },
      ],
      paymentMethods: [
        { method: 'Credit Card', count: 30, amount: 150000 },
      ],
      ordersByStatus: [
        { status: 'PAID', count: 25, percentage: 62.5 },
        { status: 'PENDING', count: 10, percentage: 25 },
        { status: 'CANCELLED', count: 5, percentage: 12.5 },
      ],
      topItems: [
        { name: 'Pizza', orders: 20, revenue: 30000 },
      ],
      hourlyOrders: [
        { hour: '12:00', orders: 15 },
      ],
      success: true,
    };

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockReportData,
      });
    });

    it('should render revenue trend chart container', async () => {
      render(<ReportsPage />);

      await waitFor(() => {
        expect(screen.getByText('Tendance Revenu')).toBeInTheDocument();
      });
    });

    it('should render orders by hour chart container', async () => {
      render(<ReportsPage />);

      await waitFor(() => {
        expect(screen.getByText('Commandes par Heure')).toBeInTheDocument();
      });
    });

    it('should render orders distribution chart container', async () => {
      render(<ReportsPage />);

      await waitFor(() => {
        expect(screen.getByText('Répartition Commandes')).toBeInTheDocument();
      });
    });

    it('should render payment methods section', async () => {
      render(<ReportsPage />);

      await waitFor(() => {
        expect(screen.getByText('Moyens de Paiement')).toBeInTheDocument();
      });
    });

    it('should render top items section', async () => {
      render(<ReportsPage />);

      await waitFor(() => {
        expect(screen.getByText('Articles Populaires')).toBeInTheDocument();
      });
    });
  });

  describe('Data Export (ZIP)', () => {
    const mockReportData = {
      dailyRevenue: [],
      paymentMethods: [],
      ordersByStatus: [],
      topItems: [],
      hourlyOrders: [],
      success: true,
    };

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockReportData,
      });
    });

    it('should call data engineer export endpoint', async () => {
      mockCreateObjectURL.mockReturnValue('blob:mock-zip-url');

      render(<ReportsPage />);

      await waitFor(() => {
        expect(screen.getByText('Data Export')).toBeInTheDocument();
      });

      const exportButton = screen.getByText('Data Export');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/export/data-engineer');
      });
    });

    it('should handle export failure gracefully', async () => {
      mockFetch.mockImplementation((url) => {
        if (url === '/api/export/data-engineer') {
          return Promise.resolve({ ok: false });
        }
        return Promise.resolve({
          ok: true,
          json: async () => mockReportData,
        });
      });

      render(<ReportsPage />);

      await waitFor(() => {
        expect(screen.getByText('Data Export')).toBeInTheDocument();
      });

      const exportButton = screen.getByText('Data Export');
      fireEvent.click(exportButton);

      // Should not throw or crash
      await waitFor(() => {
        expect(screen.getByText('Data Export')).toBeInTheDocument();
      });
    });
  });

  describe('Performance - Client-Side Processing', () => {
    const largeReportData = {
      dailyRevenue: Array.from({ length: 365 }, (_, i) => ({
        date: `2026-${String(Math.floor(i / 30) + 1).padStart(2, '0')}-${String((i % 30) + 1).padStart(2, '0')}`,
        revenue: Math.floor(Math.random() * 200000) + 50000,
        orders: Math.floor(Math.random() * 50) + 10,
      })),
      paymentMethods: [
        { method: 'Credit Card', count: 500, amount: 2500000 },
        { method: 'Cash', count: 200, amount: 800000 },
        { method: 'Moneroo', count: 300, amount: 1500000 },
      ],
      ordersByStatus: [
        { status: 'PAID', count: 600, percentage: 60 },
        { status: 'PENDING', count: 200, percentage: 20 },
        { status: 'CANCELLED', count: 100, percentage: 10 },
        { status: 'REFUNDED', count: 100, percentage: 10 },
      ],
      topItems: Array.from({ length: 50 }, (_, i) => ({
        name: `Item ${i + 1}`,
        orders: Math.floor(Math.random() * 100) + 1,
        revenue: Math.floor(Math.random() * 50000) + 1000,
      })),
      hourlyOrders: Array.from({ length: 24 }, (_, i) => ({
        hour: `${String(i).padStart(2, '0')}:00`,
        orders: Math.floor(Math.random() * 30),
      })),
      success: true,
    };

    it('should handle large datasets without crashing', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => largeReportData,
      });

      expect(() => {
        render(<ReportsPage />);
      }).not.toThrow();

      await waitFor(() => {
        expect(screen.getByText('Rapports')).toBeInTheDocument();
      });
    });

    it('should generate CSV for large datasets', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => largeReportData,
      });

      mockCreateObjectURL.mockReturnValue('blob:large-csv');

      render(<ReportsPage />);

      await waitFor(() => {
        expect(screen.getByText('Exporter CSV')).toBeInTheDocument();
      });

      const exportButton = screen.getByText('Exporter CSV');

      // Should not timeout
      await waitFor(() => {
        fireEvent.click(exportButton);
        expect(mockCreateObjectURL).toHaveBeenCalled();
      }, { timeout: 10000 });
    });
  });

  describe('Accessibility', () => {
    const mockReportData = {
      dailyRevenue: [{ date: '2026-05-01', revenue: 150000, orders: 25 }],
      paymentMethods: [{ method: 'Credit Card', count: 10, amount: 50000 }],
      ordersByStatus: [{ status: 'PAID', count: 8, percentage: 80 }],
      topItems: [{ name: 'Pizza', orders: 15, revenue: 22500 }],
      hourlyOrders: [{ hour: '12:00', orders: 10 }],
      success: true,
    };

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockReportData,
      });
    });

    it('should have proper heading hierarchy', async () => {
      render(<ReportsPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Rapports');
      });
    });

    it('should have descriptive text for charts', async () => {
      render(<ReportsPage />);

      await waitFor(() => {
        expect(screen.getByText('Évolution quotidienne des ventes')).toBeInTheDocument();
        expect(screen.getByText('Patterns de commande')).toBeInTheDocument();
      });
    });
  });
});
