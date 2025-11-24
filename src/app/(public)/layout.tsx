import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Menu | WEGO RestoPay',
  description: 'Browse and order from our menu',
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
