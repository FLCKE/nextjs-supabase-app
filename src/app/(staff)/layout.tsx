'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { redirect, usePathname } from 'next/navigation';
import {
  Menu,
  LogOut,
  Bell,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types';

interface StaffLayoutProps {
  children: React.ReactNode;
}

async function getUserData(): Promise<Profile | null> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .maybeSingle()
  console.log('Profile Data:', profileData);
  return profileData as Profile;
}

const STAFF_MENU_ITEMS = [
  { label: 'Home', href: '/staff-dashboard', icon: '🏠' },
  { label: 'POS System', href: '/pos', icon: '🏪' },
  { label: 'Orders', href: '/orders', icon: '📋' },
];

export default function StaffLayout({ children }: StaffLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [userName, setUserName] = React.useState('Staff');
  const [userEmail, setUserEmail] = React.useState('staff@example.com');
  const pathname = usePathname();

  useEffect(() => {
    const fetchUserData = async () => {
      const profile = await getUserData();
      if (profile) {
        setUserName(profile.full_name || 'Staff');
        setUserEmail(profile.email || 'staff@example.com');
      }
    };
    fetchUserData();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect('/staff-login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 border-r bg-card">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <Link href="/staff-dashboard" className="text-xl font-bold text-primary">
              Staff Dashboard
            </Link>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {STAFF_MENU_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                  pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <Link href="/staff-dashboard" className="text-xl font-bold text-primary">
                Dashboard
              </Link>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              {STAFF_MENU_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                    pathname === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card px-4 lg:px-6">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link href="/staff-dashboard" className="flex items-center gap-2 font-bold text-lg lg:hidden">
            <Home className="h-5 w-5" />
            Dashboard
          </Link>

          <div className="flex items-center gap-2 ml-auto">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu */}
            <div className="flex items-center gap-2 ml-2 pl-2 border-l">
              <div className="flex flex-col text-right">
                <span className="text-sm font-medium">{userName}</span>
                <span className="text-xs text-muted-foreground">Staff</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-destructive hover:text-destructive"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto"
          role="main"
        >
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
