
export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'owner' | 'staff' | 'admin';
  phone: string | null;
  created_at: string;
  updated_at: string;
};
