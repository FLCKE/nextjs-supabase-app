/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CheckoutPage from '../page';
import { useCartStore } from '@/lib/cart/cart-store';
import * as publicMenuActions from '@/lib/actions/public-menu-actions';

// Mock les modules externes
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(() => null),
  }),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock createPublicOrder
jest.mock('@/lib/actions/public-menu-actions', () => ({
  createPublicOrder: jest.fn(),
}));

describe('Checkout Page', () => {
  const mockRouterPush = jest.fn();
  const mockRouterBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset cart store
    useCartStore.setState({
      items: [],
      tableToken: null,
      restaurant: null,
    });

    // Mock router
    require('next/navigation').useRouter.mockReturnValue({
      push: mockRouterPush,
      back: mockRouterBack,
      replace: jest.fn(),
    });
  });

  describe('Empty Cart', () => {
    it('should redirect to menu when cart is empty', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalledWith('/public/menu');
      });
    });

    it('should display empty cart message', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByText(/cart is empty/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/Browse Menu/i)).toBeInTheDocument();
    });
  });

  describe('Cart Items Display', () => {
    beforeEach(() => {
      useCartStore.getState().addItem({
        id: 'item-1',
        name: 'Pizza Margherita',
        price_cts: 1200,
        tax_rate: 10,
        quantity: 2,
      });

      useCartStore.getState().addItem({
        id: 'item-2',
        name: 'Coca Cola',
        price_cts: 300,
        tax_rate: 20,
        quantity: 3,
      });
    });

    it('should display all cart items', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByText('Pizza Margherita')).toBeInTheDocument();
        expect(screen.getByText('Coca Cola')).toBeInTheDocument();
      });
    });

    it('should display correct item count', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByText(/Your Items \(2\)/i)).toBeInTheDocument();
      });
    });

    it('should display item quantities', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });
  });

  describe('Quantity Controls', () => {
    beforeEach(() => {
      useCartStore.getState().addItem({
        id: 'item-1',
        name: 'Pizza Margherita',
        price_cts: 1200,
        tax_rate: 10,
        quantity: 2,
      });
    });

    it('should increment quantity on + button click', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByText('Pizza Margherita')).toBeInTheDocument();
      });

      const incrementButton = screen.getByLabelText(/increase quantity/i);
      fireEvent.click(incrementButton);

      await waitFor(() => {
        const state = useCartStore.getState();
        expect(state.items[0].quantity).toBe(3);
      });
    });

    it('should decrement quantity on - button click', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByText('Pizza Margherita')).toBeInTheDocument();
      });

      const decrementButton = screen.getByLabelText(/decrease quantity/i);
      fireEvent.click(decrementButton);

      await waitFor(() => {
        const state = useCartStore.getState();
        expect(state.items[0].quantity).toBe(1);
      });
    });

    it('should disable decrement button when quantity is 1', async () => {
      useCartStore.setState({
        items: [
          { id: 'item-1', name: 'Pizza', price_cts: 1200, tax_rate: 10, quantity: 1 },
        ],
        tableToken: null,
        restaurant: null,
      });

      render(<CheckoutPage />);

      await waitFor(() => {
        const decrementButton = screen.getByLabelText(/decrease quantity/i);
        expect(decrementButton).toBeDisabled();
      });
    });
  });

  describe('Remove Item', () => {
    beforeEach(() => {
      useCartStore.getState().addItem({
        id: 'item-1',
        name: 'Pizza Margherita',
        price_cts: 1200,
        tax_rate: 10,
        quantity: 1,
      });
    });

    it('should remove item when trash button clicked', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByText('Pizza Margherita')).toBeInTheDocument();
      });

      const removeButton = screen.getByLabelText(/remove.*from cart/i);
      fireEvent.click(removeButton);

      await waitFor(() => {
        const state = useCartStore.getState();
        expect(state.items).toHaveLength(0);
      });
    });
  });

  describe('Special Instructions', () => {
    beforeEach(() => {
      useCartStore.getState().addItem({
        id: 'item-1',
        name: 'Pizza Margherita',
        price_cts: 1200,
        tax_rate: 10,
        quantity: 1,
      });
    });

    it('should allow adding notes to items', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByText('Pizza Margherita')).toBeInTheDocument();
      });

      const notesTextarea = screen.getByLabelText(/special instructions for pizza/i);
      fireEvent.change(notesTextarea, { target: { value: 'No onions, extra cheese' } });

      await waitFor(() => {
        const state = useCartStore.getState();
        expect(state.items[0].notes).toBe('No onions, extra cheese');
      });
    });
  });

  describe('Order Summary', () => {
    beforeEach(() => {
      useCartStore.getState().addItem({
        id: 'item-1',
        name: 'Pizza Margherita',
        price_cts: 1200,
        tax_rate: 10,
        quantity: 2,
      });
    });

    it('should display correct subtotal', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        // Subtotal: 1200 * 2 = 2400 cents = $24.00
        expect(screen.getByText('$24.00')).toBeInTheDocument();
      });
    });

    it('should display correct taxes', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        // Taxes: (1200 * 2) * 10% = 240 cents = $2.40
        const subtotalElement = screen.getByText((content) => content.includes('2.40'));
        expect(subtotalElement).toBeInTheDocument();
      });
    });

    it('should display correct total', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        // Total: 2400 + 240 = 2640 cents = $26.40
        const totalElement = screen.getByText('$26.40');
        expect(totalElement).toBeInTheDocument();
      });
    });
  });

  describe('Order Confirmation', () => {
    beforeEach(() => {
      useCartStore.getState().addItem({
        id: 'item-1',
        name: 'Pizza Margherita',
        price_cts: 1200,
        tax_rate: 10,
        quantity: 1,
      });

      useCartStore.getState().setTableToken('table-123');
      useCartStore.getState().setRestaurant('restaurant-456');
    });

    it('should call createPublicOrder on confirm button click', async () => {
      jest.spyOn(publicMenuActions, 'createPublicOrder').mockResolvedValue({
        success: true,
        orderId: 'order-123',
      });

      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByText('Confirm Order')).toBeInTheDocument();
      });

      const confirmButton = screen.getByText('Confirm Order');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(publicMenuActions.createPublicOrder).toHaveBeenCalledWith(
          'table-123',
          expect.arrayContaining([
            expect.objectContaining({
              id: 'item-1',
              quantity: 1,
              price_cts: 1200,
              name: 'Pizza Margherita',
            }),
          ]),
          'restaurant-456',
          undefined
        );
      });
    });

    it('should show loading state during order submission', async () => {
      jest.spyOn(publicMenuActions, 'createPublicOrder').mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true, orderId: 'order-123' }), 100))
      );

      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByText('Confirm Order')).toBeInTheDocument();
      });

      const confirmButton = screen.getByText('Confirm Order');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/placing order/i)).toBeInTheDocument();
      });
    });

    it('should display success message on order success', async () => {
      jest.spyOn(publicMenuActions, 'createPublicOrder').mockResolvedValue({
        success: true,
        orderId: 'order-123',
      });

      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByText('Confirm Order')).toBeInTheDocument();
      });

      const confirmButton = screen.getByText('Confirm Order');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Order Confirmed/i)).toBeInTheDocument();
      });
    });

    it('should display error message on order failure', async () => {
      jest.spyOn(publicMenuActions, 'createPublicOrder').mockResolvedValue({
        success: false,
        error: 'Table not found',
      });

      const { toast } = require('sonner');

      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByText('Confirm Order')).toBeInTheDocument();
      });

      const confirmButton = screen.getByText('Confirm Order');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to place order', expect.anything());
      });
    });
  });

  describe('Offline Mode', () => {
    beforeEach(() => {
      useCartStore.getState().addItem({
        id: 'item-1',
        name: 'Pizza Margherita',
        price_cts: 1200,
        tax_rate: 10,
        quantity: 1,
      });
    });

    it('should detect offline status', async () => {
      // Simulate offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByText(/no internet connection/i)).toBeInTheDocument();
      });
    });

    it('should disable order confirmation when offline', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      render(<CheckoutPage />);

      await waitFor(() => {
        const confirmButton = screen.getByText('Confirm Order');
        expect(confirmButton).toBeDisabled();
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      useCartStore.getState().addItem({
        id: 'item-1',
        name: 'Pizza Margherita',
        price_cts: 1200,
        tax_rate: 10,
        quantity: 1,
      });
    });

    it('should have live region for screen reader announcements', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
      });
    });

    it('should have proper aria-labels on quantity controls', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/increase quantity of pizza/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/decrease quantity of pizza/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/remove pizza from cart/i)).toBeInTheDocument();
      });
    });

    it('should have proper role for cart items', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByRole('list', { name: /cart items/i })).toBeInTheDocument();
      });
    });
  });

  describe('No Debug UI in Production', () => {
    it('should NOT contain debug elements', async () => {
      useCartStore.getState().addItem({
        id: 'item-1',
        name: 'Pizza Margherita',
        price_cts: 1200,
        tax_rate: 10,
        quantity: 1,
      });

      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.queryByText(/debug/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Entered:/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/length:/i)).not.toBeInTheDocument();
      });
    });
  });
});
