import { NextRequest, NextResponse } from 'next/server';
import { getPendingTransaction } from '@/lib/transaction-cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId } = body;

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Missing transactionId' },
        { status: 400 }
      );
    }

    console.log('Checking payment link for transaction:', transactionId);

    const transaction = await getPendingTransaction(transactionId);

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // If payment link is ready, return it
    if (transaction.paymentLink && transaction.status === 'ready') {
      return NextResponse.json({
        success: true,
        paymentLink: transaction.paymentLink,
        transactionId,
      });
    }

    // Still waiting for webhook with payment link
    return NextResponse.json(
      { 
        error: 'Payment link not available yet',
        status: transaction.status,
        message: 'Waiting for Moneroo webhook...'
      },
      { status: 202 } // 202 Accepted - still processing
    );
  } catch (error) {
    console.error('Payment link check error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve payment link' },
      { status: 500 }
    );
  }
}
