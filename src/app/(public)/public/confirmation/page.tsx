'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/sonner';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';


function ConfirmationPage() {
    const router = useRouter();
  return (
    <div className="min-h-screen  bg-background">
       <header className="sticky top-0 z-40 bg-card border-b shadow-sm">
        <div className="container-lg py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Review Order</h1>
          </div>
        </div>
      </header>
      <main className='flex items-center justify-center p-4'>
       <Card className='w-full max-w-md text-center'>
            <CardHeader className=''>
                 <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                              <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
            <CardTitle className="text-2xl">Payment successfull !</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Order ID</p>
              <p className="text-xl font-mono font-bold">{}</p>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Your order has been sent to the kitchen. We'll bring it to your table shortly.
              </p>
            </div>
          </CardContent>
       </Card>
      </main>
    </div>
  )
}

export default ConfirmationPage