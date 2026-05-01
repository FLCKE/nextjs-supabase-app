import { NextRequest, NextResponse } from 'next/server';
import {
  verifyMonerooWebhookSignature,
  processMonerooWebhook,
} from '@/lib/moneroo';
import { calculateNetAmount } from '@/lib/commission';
import { 
  updateTransactionWithPaymentLink,
  updateTransactionStatus,
  isWebhookProcessed,
  markWebhookAsProcessed,
  storeWebhookError,
} from '@/lib/transaction-cache';
import { createAdminClient, createClient } from '@/lib/supabase/server';

/**
 * Moneroo Webhook Handler
 * Receives payment status updates and updates database + cache
 */
export async function POST(request: NextRequest) {
  const requestId = `webhook-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  let body: string = '';
  let payload: any = null;
  
  try {
    // ⚠️ IMPORTANT: Read body ONCE - it's a stream and can only be consumed once
    body = await request.text();
    const signature = request.headers.get('x-moneroo-signature') || '';

    console.log(`[${requestId}] Webhook received, signature present: ${!!signature}`);

    // ✅ FIX 1: Better signature verification with error handling
    if (!signature) {
      console.error(`[${requestId}] Missing signature header`);
      return NextResponse.json(
        { error: 'Missing signature header' },
        { status: 401 }
      );
    }

    if (!verifyMonerooWebhookSignature(body, signature)) {
      console.error(`[${requestId}] Invalid webhook signature`);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    console.log(`[${requestId}] Signature verified successfully`);

    // Parse payload AFTER signature verification
    try {
      payload = JSON.parse(body);
    } catch (parseError) {
      console.error(`[${requestId}] Failed to parse webhook body:`, parseError);
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const webhookData = processMonerooWebhook(payload);
    console.log(`[${requestId}] Parsed webhook data:`, webhookData);

    // ✅ FIX 2: Idempotence check - prevent duplicate processing
    if (await isWebhookProcessed(webhookData.transactionId)) {
      console.log(`[${requestId}] Webhook already processed for transaction: ${webhookData.transactionId}`);
      return NextResponse.json({ 
        success: true, 
        message: 'Webhook already processed (idempotent)' 
      });
    }

    // ✅ FIX 3: Validate required fields
    if (!webhookData.transactionId) {
      console.error(`[${requestId}] Missing transaction_id in webhook payload`);
      await storeWebhookError(webhookData.transactionId, 'Missing transaction_id');
      return NextResponse.json(
        { error: 'Missing transaction_id in payload' },
        { status: 400 }
      );
    }

    if (!webhookData.orderId) {
      console.warn(`[${requestId}] Warning: Missing order_id in webhook payload for transaction: ${webhookData.transactionId}`);
      // Don't fail - order_id might be in metadata or not required for all webhooks
    }

    console.log(`[${requestId}] Processing webhook for transaction: ${webhookData.transactionId}, event: ${webhookData.event}, status: ${webhookData.status}`);

    const supabase = createAdminClient();

    // ✅ FIX 4: Map payment status correctly
    const paymentStatus = 
      webhookData.status === 'completed' ? 'completed' : 
      webhookData.status === 'failed' ? 'failed' : 
      'pending';

    console.log(`[${requestId}] Updating payment status: ${paymentStatus}`);

    // ✅ FIX 5: Handle payment.success vs payout.success webhooks
    if (webhookData.event === 'payment.success') {
      // Payment webhook: Update both payments and orders tables
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .update({
          status: paymentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('transaction_id', webhookData.transactionId)
        .select();

      if (paymentError) {
        console.error(`[${requestId}] Error updating payment:`, paymentError);
        await storeWebhookError(webhookData.transactionId, `Payment update failed: ${paymentError.message}`);
        return NextResponse.json(
          { error: 'Failed to update payment', details: paymentError.message },
          { status: 500 }
        );
      }

      if (!paymentData || paymentData.length === 0) {
        console.warn(`[${requestId}] No payment found with transaction_id: ${webhookData.transactionId}`);
      } else {
        console.log(`[${requestId}] Payment updated successfully:`, paymentData[0]);
      }

      // Update order status only if orderId provided
      if (webhookData.orderId) {
        console.log(`[${requestId}] Updating order status for order: ${webhookData.orderId}`);
        
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .update({
            status: webhookData.status === 'completed' ? 'PAID' : webhookData.status === 'failed' ? 'CANCELLED' : 'PENDING',
            updated_at: new Date().toISOString(),
          })
          .eq('id', webhookData.orderId)
          .select();

        if (orderError) {
          console.error(`[${requestId}] Error updating order:`, orderError);
          await storeWebhookError(webhookData.transactionId, `Order update failed: ${orderError.message}`);
        } else if (orderData && orderData.length > 0) {
          console.log(`[${requestId}] Order updated successfully:`, orderData[0]);
        } else {
          console.warn(`[${requestId}] No order found with id: ${webhookData.orderId}`);
        }
      }
    } else if (webhookData.event === 'payout.success') {
      // Payout webhook: Update payments_by_day table only
      console.log(`[${requestId}] Processing payout webhook for transaction: ${webhookData.transactionId}`);
      
      // First, fetch the existing record to compute net_amount_cts if needed
      const { data: existingRows, error: fetchError } = await supabase
        .from('payments_by_day')
        .select('id, amount_cts, net_amount_cts')
        .eq('transaction_id', webhookData.transactionId)
        .limit(1);

      if (fetchError) {
        console.error(`[${requestId}] Error fetching payout row:`, fetchError);
        await storeWebhookError(webhookData.transactionId, `Payout fetch failed: ${fetchError.message}`);
        return NextResponse.json({ error: 'Failed to fetch payout', details: fetchError.message }, { status: 500 });
      }

      if (!existingRows || existingRows.length === 0) {
        console.warn(`[${requestId}] No payout found with transaction_id: ${webhookData.transactionId}`);
      }

      // Compute net_amount_cts if missing
      let netAmountToSet: number | undefined = undefined;
      if (existingRows && existingRows.length > 0) {
        const row = existingRows[0] as any;
        if ((row.net_amount_cts === null || row.net_amount_cts === undefined) && typeof row.amount_cts === 'number') {
          try {
            netAmountToSet = calculateNetAmount(row.amount_cts, 5);
            console.log(`[${requestId}] Computed net_amount_cts=${netAmountToSet} from amount_cts=${row.amount_cts}`);
          } catch (err) {
            console.error(`[${requestId}] Failed to compute net amount:`, err);
          }
        }
      }

      const updatePayload: any = {
        status: paymentStatus,
        updated_at: new Date().toISOString(),
      };
      if (typeof netAmountToSet === 'number') updatePayload.net_amount_cts = netAmountToSet;

      const { data: payoutData, error: payoutError } = await supabase
        .from('payments_by_day')
        .update(updatePayload)
        .eq('transaction_id', webhookData.transactionId)
        .select();

      if (payoutError) {
        console.error(`[${requestId}] Error updating payout:`, payoutError);
        await storeWebhookError(webhookData.transactionId, `Payout update failed: ${payoutError.message}`);
        return NextResponse.json(
          { error: 'Failed to update payout', details: payoutError.message },
          { status: 500 }
        );
      }

      if (!payoutData || payoutData.length === 0) {
        console.warn(`[${requestId}] No payout updated with transaction_id: ${webhookData.transactionId}`);
      } else {
        console.log(`[${requestId}] Payout updated successfully:`, payoutData[0]);
      }
    } else {
      console.warn(`[${requestId}] Unknown webhook event type: ${webhookData.event}`);
    }

    // ✅ FIX 7: Update transaction cache with payment link if available
    if (webhookData.event === 'payment.success' && (payload.data?.payment_link || payload.data?.checkout_url)) {
      const paymentLink = payload.data.payment_link || payload.data.checkout_url;
      await updateTransactionWithPaymentLink(webhookData.transactionId, paymentLink);
      console.log(`[${requestId}] Payment link updated in cache`);
    }

    // ✅ FIX 8: Update transaction status in Redis
    if (webhookData.status === 'completed' || webhookData.status === 'failed') {
      await updateTransactionStatus(
        webhookData.transactionId,
        webhookData.status as 'completed' | 'failed'
      );
      console.log(`[${requestId}] Transaction status updated in cache: ${webhookData.status}`);
    }

    // ✅ FIX 9: Mark webhook as processed (idempotence)
    await markWebhookAsProcessed(webhookData.transactionId);
    console.log(`[${requestId}] Webhook marked as processed`);

    console.log(`[${requestId}] Webhook processed successfully`);
    return NextResponse.json({ 
      success: true,
      message: 'Webhook processed successfully',
      transactionId: webhookData.transactionId,
    });

  } catch (error) {
    console.error(`[${requestId}] Unexpected webhook error:`, error);
    
    // Use captured payload from earlier in the function
    if (payload && payload.transaction_id) {
      try {
        await storeWebhookError(payload.transaction_id, error instanceof Error ? error.message : 'Unknown error');
      } catch {
        // Ignore errors storing the error
      }
    }

    return NextResponse.json(
      { 
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        requestId,
      },
      { status: 500 }
    );
  }
}
