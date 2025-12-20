import { notFound } from 'next/navigation';
import { OrderDetail } from '@/components/orders/order-detail';
import { getOrderById } from '@/lib/actions/order-actions';

export const dynamic = 'force-dynamic';

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  const result = await getOrderById(id);

  if (!result) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <OrderDetail order={result} />
    </div>
  );
}
