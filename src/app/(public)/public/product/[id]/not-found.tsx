import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProductNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div>
          <h1 className="text-4xl font-bold mb-2">Product Not Found</h1>
          <p className="text-muted-foreground">
            The product you're looking for doesn't exist or has been removed.
          </p>
        </div>

        <Link href="/public/menu" className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
          <ChevronLeft className="h-4 w-4" />
          Back to Menu
        </Link>
      </div>
    </div>
  );
}
