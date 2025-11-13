import { OwnerNavbar } from '@/components/dashboard/owner-navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <OwnerNavbar />
      <main>{children}</main>
    </div>
  );
}
