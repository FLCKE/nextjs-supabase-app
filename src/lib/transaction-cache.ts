import { getRedisClient } from './redis';

interface PendingTransaction {
  transactionId: string;
  orderId: string;
  paymentLink?: string;
  status: 'pending' | 'ready' | 'completed' | 'failed';
  createdAt: number;
}

const TRANSACTION_TTL = 3600; // 1 hour in seconds
const TRANSACTION_PREFIX = 'moneroo:transaction:';
const WEBHOOK_PROCESSED_PREFIX = 'moneroo:webhook:processed:';

/**
 * Store a pending transaction in Redis
 */
export async function storePendingTransaction(
  transactionId: string,
  orderId: string
): Promise<void> {
  try {
    const redis = await getRedisClient();
    const transaction: PendingTransaction = {
      transactionId,
      orderId,
      status: 'pending',
      createdAt: Date.now(),
    };

    await redis.setEx(
      `${TRANSACTION_PREFIX}${transactionId}`,
      TRANSACTION_TTL,
      JSON.stringify(transaction)
    );

    console.log(`Transaction stored in Redis: ${transactionId}`);
  } catch (error) {
    console.error('Error storing transaction in Redis:', error);
    throw error;
  }
}

/**
 * Get a pending transaction from Redis
 */
export async function getPendingTransaction(
  transactionId: string
): Promise<PendingTransaction | undefined> {
  try {
    const redis = await getRedisClient();
    const data = await redis.get(`${TRANSACTION_PREFIX}${transactionId}`);
    
    if (!data) {
      return undefined;
    }

    return JSON.parse(data) as PendingTransaction;
  } catch (error) {
    console.error('Error retrieving transaction from Redis:', error);
    return undefined;
  }
}

/**
 * Update transaction with payment link in Redis
 */
export async function updateTransactionWithPaymentLink(
  transactionId: string,
  paymentLink: string
): Promise<void> {
  try {
    const redis = await getRedisClient();
    const key = `${TRANSACTION_PREFIX}${transactionId}`;
    const data = await redis.get(key);

    if (data) {
      const transaction = JSON.parse(data) as PendingTransaction;
      transaction.paymentLink = paymentLink;
      transaction.status = 'ready';

      await redis.setEx(key, TRANSACTION_TTL, JSON.stringify(transaction));
      console.log(`Transaction link updated in Redis: ${transactionId}`);
    }
  } catch (error) {
    console.error('Error updating transaction link in Redis:', error);
    throw error;
  }
}

/**
 * Update transaction status in Redis
 */
export async function updateTransactionStatus(
  transactionId: string,
  status: 'completed' | 'failed'
): Promise<void> {
  try {
    const redis = await getRedisClient();
    const key = `${TRANSACTION_PREFIX}${transactionId}`;
    const data = await redis.get(key);

    if (data) {
      const transaction = JSON.parse(data) as PendingTransaction;
      transaction.status = status;

      await redis.setEx(key, TRANSACTION_TTL, JSON.stringify(transaction));
      console.log(`Transaction status updated in Redis: ${transactionId} -> ${status}`);
    }
  } catch (error) {
    console.error('Error updating transaction status in Redis:', error);
    throw error;
  }
}

/**
 * Check if a webhook has already been processed (idempotence)
 */
export async function isWebhookProcessed(
  transactionId: string
): Promise<boolean> {
  try {
    const redis = await getRedisClient();
    const key = `${WEBHOOK_PROCESSED_PREFIX}${transactionId}`;
    const exists = await redis.exists(key);
    return exists === 1;
  } catch (error) {
    console.error('Error checking webhook processed status:', error);
    return false;
  }
}

/**
 * Mark a webhook as processed (for idempotence)
 */
export async function markWebhookAsProcessed(
  transactionId: string
): Promise<void> {
  try {
    const redis = await getRedisClient();
    const key = `${WEBHOOK_PROCESSED_PREFIX}${transactionId}`;
    // Keep webhook processed markers for 24 hours
    await redis.setEx(key, 86400, '1');
    console.log(`Webhook marked as processed: ${transactionId}`);
  } catch (error) {
    console.error('Error marking webhook as processed:', error);
    throw error;
  }
}

/**
 * Get webhook processing error (for retry logic)
 */
export async function getWebhookError(
  transactionId: string
): Promise<string | null> {
  try {
    const redis = await getRedisClient();
    const key = `${WEBHOOK_PROCESSED_PREFIX}:error:${transactionId}`;
    return await redis.get(key);
  } catch (error) {
    console.error('Error retrieving webhook error:', error);
    return null;
  }
}

/**
 * Store webhook processing error (for debugging)
 */
export async function storeWebhookError(
  transactionId: string,
  error: string
): Promise<void> {
  try {
    const redis = await getRedisClient();
    const key = `${WEBHOOK_PROCESSED_PREFIX}:error:${transactionId}`;
    // Keep error logs for 24 hours
    await redis.setEx(key, 86400, error);
  } catch (error) {
    console.error('Error storing webhook error:', error);
  }
}
