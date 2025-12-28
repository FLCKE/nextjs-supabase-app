'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Store,
  UtensilsCrossed,
  ShoppingCart,
  CreditCard,
  Package,
  Users,
  BarChart3,
  Shield,
  ChevronRight,
  TableIcon,
  QrCode,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number | string;
  roles?: string[]; // If specified, only these roles can see it
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

interface AppSidebarProps {
  userRole?: string;
  onNavigate?: () => void;
}

const navGroups: NavGroup[] = [
  {
    title: 'Main',
    items: [
      {
        title: 'Home',
        href: '/dashboard',
        icon: Home,
      },
      {
        title: 'Restaurants',
        href: '/dashboard/restaurants',
        icon: Store,
      },
      {
        title: 'Menus',
        href: '/dashboard/menus',
        icon: UtensilsCrossed,
      },
    ],
  },
  {
    title: 'Operations',
    items: [
      {
        title: 'Orders',
        href: '/dashboard/orders',
        icon: ShoppingCart,
        badge: 'Live',
      },
      {
        title: 'Tables',
        href: '/dashboard/tables',
        icon: TableIcon,
      },
      {
        title: 'QR Codes',
        href: '/dashboard/qr-codes',
        icon: QrCode,
      },
      {
        title: 'Payments',
        href: '/dashboard/payments',
        icon: CreditCard,
      },
      {
        title: 'Inventory',
        href: '/dashboard/inventory',
        icon: Package,
      },
      {
        title: 'Staff',
        href: '/dashboard/staff',
        icon: Users,
        // roles: ['owner', 'admin'], // Temporarily disabled for debugging
      },
    ],
  },
  {
    title: 'Analytics',
    items: [
      {
        title: 'Reports',
        href: '/dashboard/reports',
        icon: BarChart3,
      },
    ],
  },
  {
    title: 'System',
    items: [
      {
        title: 'Admin',
        href: '/dashboard/admin',
        icon: Shield,
        roles: ['admin'],
      },
    ],
  },
];

export function AppSidebar({ userRole = 'user', onNavigate }: AppSidebarProps) {
  const pathname = usePathname();

  const filterItemsByRole = (items: NavItem[]) => {
    return items.filter((item) => {
      if (!item.roles || item.roles.length === 0) return true;
      return item.roles.includes(userRole);
    });
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <aside className="flex h-full flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link
          href="/dashboard"
          className="flex items-center space-x-2"
          onClick={onNavigate}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Store className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm leading-tight">WEGO</span>
            <span className="text-xs text-muted-foreground leading-tight">
              RestoPay
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6">
          {navGroups.map((group) => {
            const visibleItems = filterItemsByRole(group.items);
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title}>
                <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          active
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1">{item.title}</span>
                        {item.badge && (
                          <Badge
                            variant={active ? 'secondary' : 'outline'}
                            className="ml-auto"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">
            {userRole === 'admin' && (
              <Badge variant="secondary" className="mb-2">
                Admin
              </Badge>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            Version 1.0.0
          </p>
        </div>
      </div>
    </aside>
  );
}
