
export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'owner' | 'staff' | 'admin';
  phone: string | null;
  created_at: string;
  updated_at: string;
};

export type StaffMember = {
  id: string;
  restaurant_id: string;
  user_id: string;
  name: string;
  username: string;
  login_code_hash: string;
  created_at: string;
  updated_at: string;
  role: string;
};

export type Restaurant = {
  id: string;
  owner_id: string;
  name: string;
  legal_name: string;
  country: string;
  currency: string;
  created_at: string;
  updated_at: string;
};

export type Location = {
  id: string;
  restaurant_id: string;
  name: string;
  timezone: string;
  created_at: string;
  updated_at: string;
};

export type Table = {
  id: string;
  location_id: string;
  label: string;
  qr_token: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type Menu = {
  id: string;
  restaurant_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type MenuItem = {
  id: string;
  menu_id: string;
  name: string;
  description: string | null;
  price_cts: number;
  currency: string;
  tax_rate: number | null;
  stock_mode: 'FINITE' | 'INFINITE' | 'HIDDEN_WHEN_OOS';
  stock_qty: number | null;
  image_url: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type MenuWithItemCount = Menu & {
  item_count: number;
};

export type InventoryAdjustment = {
  id: string;
  item_id: string;
  type: 'IN' | 'OUT' | 'SPOILAGE';
  quantity: number;
  reason: string | null;
  created_at: string;
};

export type MenuItemWithStock = MenuItem & {
  current_stock: number | null;
  restaurant_id: string;
};

export type MenuItemWithMenu = {
  id: string;
  name: string;
  description: string | null;
  price_cts: number;
  currency: string;
  stock_mode: 'FINITE' | 'INFINITE' | 'HIDDEN_WHEN_OOS';
  stock_qty: number | null;
  image_url: string | null;
  category?: string;
};

export type LocationWithTables = Location & {
  tables: Table[];
};

export type OrderStatus = 'PENDING' | 'PAYING' | 'PAID' | 'SERVED' | 'CANCELLED' | 'REFUNDED';

export type Order = {
  id: string;
  restaurant_id: string; // Added
  location_id: string;   // Added
  table_id: string;
  status: OrderStatus;
  currency: string;
  total_net_cts: number;
  taxes_cts: number;
  total_gross_cts: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  item_id: string;
  name: string;
  qty: number;
  unit_price_cts: number;
  total_price_cts: number;
  created_at: string;
};

export type OrderWithDetails = Order & {
  table_label: string;
  location_name: string;
  restaurant_id: string;
  restaurant_name: string;
  item_count: number;
};

export type OrderWithItems = Order & {
  items: OrderItem[];
  table_label?: string;
  location_name?: string;
};
