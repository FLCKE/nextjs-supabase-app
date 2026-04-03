import { Console, error } from 'console';
import crypto from 'crypto';

const MONEROO_API_URL = process.env.MONEROO_API_URL || 'https://api.moneroo.io/v1';
const MONEROO_API_KEY = process.env.MONEROO_API_KEY;
const MONEROO_MERCHANT_ID = process.env.MONEROO_MERCHANT_ID;
const MONEROO_SECRET= process.env.SECRET_MONEROO;
if (!MONEROO_API_KEY || !MONEROO_MERCHANT_ID) {
  console.warn('Moneroo API credentials not configured');
}

export interface MonerooPaymentRequest {
  amount: number;
  currency: string;
  description: string;
  customerEmail: string;
  customerPhone: string;
  customerFirstName?: string;
  customerLastName?: string;
  orderId: string;
  returnUrl?: string;
  webhookUrl?: string;
  methods?: string[];
}
export interface MonerooTransfertRequest{
  amount: number;
  currency: string;
  description: string;
  customerEmail: string;
  customerPhone: string;
  customerFirstName?: string;
  customerLastName?: string;
  method?: string;
  account_number: number;

}

// Mapping of supported currencies to compatible payment methods
const CURRENCY_PAYMENT_METHODS: Record<string, string[]> = {
  'NGN': ['qr_ngn', 'bank_transfer_ngn', 'airtel_ng', 'mtn_ng', 'ussd_ngn', 'card_ngn'],
};

export interface MonerooPaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentLink?: string;
  error?: string;
}
export interface MonerooTransfertResponse{
  success:boolean;
  message:string;
  data?:{
    id:string
  }
  error?:any
}
export interface MonerooTransaction {
  id: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  orderId: string;
  createdAt: string;
}

/**
 * Get compatible payment methods for a currency
 */
export function getCompatibleMethods(currency: string): string[] {
  return CURRENCY_PAYMENT_METHODS[currency] || CURRENCY_PAYMENT_METHODS['NGN'];
}

/**
 * Initiate a payment with Moneroo
 */
export async function initiateMonerooPayment(
  payment: MonerooPaymentRequest
): Promise<MonerooPaymentResponse> {
  try {
    if (!MONEROO_API_KEY || !MONEROO_MERCHANT_ID) {
      throw new Error('Moneroo API credentials not configured');
    }

    const payload = {
      amount: payment.amount,  // Already in currency units, send as-is to Moneroo
      currency: payment.currency,
      description: payment.description,
      customer: {
        email: payment.customerEmail,
        first_name: payment.customerFirstName || 'Customer',
        last_name: payment.customerLastName || 'Order',
      },
      return_url: payment.returnUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/public/confirmation`,
      metadata: {
        order_id: payment.orderId,
        merchant_id: MONEROO_MERCHANT_ID,
      },
    };

    // Only add methods if explicitly provided
    if (payment.methods && payment.methods.length > 0) {
      (payload as any).methods = payment.methods;
    }

    console.log('Moneroo API Request Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${MONEROO_API_URL}/payments/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MONEROO_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    console.log('Moneroo API Response Status:', response.status);
    
    const responseText = await response.text();
    console.log('Moneroo API Response Body:', responseText);

    if (!response.ok) {
      // Try to parse as JSON, but handle HTML error responses
      try {
        const error = JSON.parse(responseText);
        return {
          success: false,
          error: error.message || 'Payment initiation failed',
        };
      } catch (parseError) {
        // If response is HTML or other non-JSON, return generic error with status code
        return {
          success: false,
          error: `Payment initiation failed with status ${response.status}. Please try again.`,
        };
      }
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Moneroo response as JSON:', parseError);
      return {
        success: false,
        error: 'Invalid response from payment server',
      };
    }
    console.log('Moneroo Response Data:', JSON.stringify(data, null, 2));
    
    // Moneroo returns data nested under 'data' key
    const transactionData = data.data || data;
    
    return {
      success: true,
      transactionId: transactionData.id || transactionData.transaction_id || transactionData.reference,
      paymentLink: transactionData.checkout_url || transactionData.payment_link || transactionData.link,
    };
  } catch (error) {
    console.error('Moneroo payment initiation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Verify a Moneroo webhook signature
 */
export function verifyMonerooWebhookSignature(
  payload: string,
  signature: string
): boolean {
  try {
    if (!MONEROO_API_KEY) {
      console.warn('Cannot verify webhook: API key not configured');
      return false;
    }
    if (!MONEROO_SECRET) {
      console.warn('Cannot verify webhook: SECRET WEBHOOK  not configured');
      return false;
    }

    // Compute expected signature
    const computedSignature = crypto
      .createHmac('sha256', MONEROO_SECRET)
      .update(payload)
      .digest('hex');
    console.log(payload)

    // ✅ FIX: Handle different signature lengths gracefully
    if (signature.length !== computedSignature.length) {
      console.warn(
        'Signature length mismatch. Expected:',
        computedSignature.length,
        'Got:',
        signature.length
      );
      return false;
    }

    // Use timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computedSignature)
    );
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
}

/**
 * Poll for transaction payment link
 */
export async function getPaymentLink(
  transactionId: string,
  maxAttempts: number = 10,
  delayMs: number = 1000
): Promise<string | null> {
  try {
    if (!MONEROO_API_KEY) {
      throw new Error('Moneroo API key not configured');
    }

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const response = await fetch(
        `${MONEROO_API_URL}/transactions/${transactionId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${MONEROO_API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        console.warn(`Attempt ${attempt + 1}: Failed to fetch transaction`);
        if (attempt < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
        continue;
      }

      const data = await response.json();
      if (data.payment_link || data.checkout_url) {
        return data.payment_link || data.checkout_url;
      }

      // If link not available yet, wait and retry
      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching payment link:', error);
    return null;
  }
}

/**
 * Process Moneroo webhook payload
 * Handles both payment.success and payout.success events
 */
export function processMonerooWebhook(payload: any) {
  const data = payload.data || payload;
  const event = payload.event || '';
  
  // Extract currency from amount_formatted (e.g., "6500 USD" -> "USD")
  let currency = 'USD';
  if (data.amount_formatted) {
    const parts = data.amount_formatted.split(' ');
    if (parts.length > 1) {
      currency = parts[1];
    }
  }
  
  return {
    transactionId: data.id, // Moneroo uses 'id' not 'transaction_id'
    orderId: data.metadata?.order_id || undefined,
    status: data.status === 'success' ? 'completed' : data.status === 'failed' ? 'failed' : 'pending',
    amount: data.amount,
    currency: currency,
    timestamp: new Date().toISOString(),
    event: event, // Store event type for debugging
  };
}

export async function initiateMonerooTransfert(transfert:MonerooTransfertRequest): Promise<MonerooTransfertResponse>{
try{
  if (!MONEROO_API_KEY || !MONEROO_MERCHANT_ID) {
      throw new Error('Moneroo API credentials not configured');
    }
   
  const payload={
    amount: transfert.amount,
    currency: transfert.currency,
    description: transfert.description,
    customer:{
      email: transfert.customerEmail,
      first_name: transfert.customerFirstName,
      last_name: transfert.customerLastName,
    },
    phone: transfert.customerPhone,
    method: transfert.method,
    recipient:{
      account_number: transfert.account_number
    }
  }
//   const payload={
//   amount: 7000,
//   currency: "USD",
//   description: "envoie de frais",
//   customer: {
//     email: "mathieu@gmail.com",
//     first_name: "mathieu",
//     last_name: "DUPONT",
//   },
//   phone: "4149518161",
//   method: "moneroo_payout_demo",
  
//   account_number: "4149518161",
// };
   console.log(payload)
   const response  = await fetch(`${MONEROO_API_URL}/payouts/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MONEROO_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });
    const responseText = await response.text()
    if (!response.ok){
      // Try to parse as JSON, but handle HTML error responses
      try {
        const error = JSON.parse(responseText);
        return {
          success: false,
          message: error.message || 'Payment initiation failed',
          error: error.message || 'Payment initiation failed',
        };
      } catch (parseError) {
        // If response is HTML or other non-JSON, return generic error
        return {
          success: false,
          message: `Payment initiation failed with status ${response.status}`,
          error: `Error with status ${response.status}`,
        };
      }
    }
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Moneroo response as JSON:', parseError);
      return {
        success: false,
        message: 'Invalid response from payment server',
        error: 'Invalid response format',
      };
    }
    console.log(data)
  return {
    success:true,
    message:data?.message,
    data: data?.data
  } ;

}catch (Error:any){

  return {
    success:false,
    message:"Error in the transfert initalisation function",
    error:Error
  }
}

}
