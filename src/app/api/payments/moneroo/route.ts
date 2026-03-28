import { NextRequest, NextResponse } from 'next/server';
import {
  initiateMonerooPayment,
  MonerooPaymentRequest,
} from '@/lib/moneroo';
import { storePendingTransaction } from '@/lib/transaction-cache';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as MonerooPaymentRequest;

    console.log('Payment request body:', body);

    // Validate required fields
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount provided' },
        { status: 400 }
      );
    }

    if (!body.orderId) {
      return NextResponse.json(
        { error: 'Missing orderId' },
        { status: 400 }
      );
    }

    if (!body.customerEmail) {
      return NextResponse.json(
        { error: 'Missing customerEmail' },
        { status: 400 }
      );
    }

    // Currency defaults to USD if not provided
    if (!body.currency) {
      body.currency = 'USD';
    }

    // Description defaults if not provided
    if (!body.description) {
      body.description = 'Order Payment';
    }

    const result = await initiateMonerooPayment(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Store pending transaction for webhook processing
    if (result.transactionId) {
      await storePendingTransaction(result.transactionId, body.orderId);
      console.log('Transaction stored as pending:', result.transactionId);
    }

    // Save payment to database
    const supabase = await createClient();
    const { error: dbError } = await supabase
      .from('payments')
      .insert({
        order_id: body.orderId,
        transaction_id: result.transactionId,
        amount_cts: body.amount,
        currency: body.currency,
        status: 'pending',
        payment_method: 'moneroo',
        checkout_url: result.paymentLink,
        customer_email: body.customerEmail,
        customer_phone: body.customerPhone,
        customer_name: `${body.customerFirstName || ''} ${body.customerLastName || ''}`.trim(),
      });

    if (dbError) {
      console.error('Error saving payment to database:', dbError);
      // Don't fail the request if DB save fails, transaction is already created
    } else {
      console.log('Payment saved to database:', result.transactionId);
    }

    console.log('Payment initiated successfully:', result);

    return NextResponse.json({
      success: true,
      transactionId: result.transactionId,
      paymentLink: result.paymentLink,
      message: result.paymentLink ? 'Payment link ready' : 'Transaction created, waiting for payment link',
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { error: 'Payment initiation failed' },
      { status: 500 }
    );
  }
}
