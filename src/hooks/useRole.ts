'use client';

import { useUser } from '@/hooks/useUser';

export function useRole() {
  const { user } = useUser();

  const isOwner = user?.role === 'owner';
  const isStaff = user?.role === 'staff';
  const isAdmin = user?.role === 'admin';
  const isReadOnly = isStaff;

  return {
    profile: user,
    isOwner,
    isStaff,
    isAdmin,
    isReadOnly,
  };
}
