
import { getAllPaymentActive, updateStatus } from '@/lib/actions/payment';
import { initiateMonerooTransfert, MonerooTransfertRequest, MonerooTransfertResponse } from '@/lib/moneroo';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request:NextRequest){
  try{
    console.log("initialisation du transfert ")
    const transactions = await getAllPaymentActive();

    if (!transactions || !Array.isArray(transactions.data) || transactions.data.length === 0) {
      return NextResponse.json({ Message: "No data in payment table" }, { status: 404 });
    }

    const successes: any[] = [];
    const failures: any[] = [];

    for (const x of transactions.data) {
      try {
        // Prefer net_amount_cts if present (montant reçu après commission), sinon amount_cts
        const amountToSend = (typeof x.net_amount_cts === 'number' && x.net_amount_cts > 0) ? x.net_amount_cts : x.amount_cts;

        const profile = x.restaurant?.profiles?.[0] || {};
        const accountNumber = profile.account_number || profile.phone || 4149518161;

        const data: MonerooTransfertRequest = {
          amount: amountToSend,
          currency: x.currency,
          description: `Paiement journalier du ${x.day_payment}`,
          customerEmail: profile.email || 'no-reply@example.com',
          customerPhone: profile.phone || '4149518161',
          customerFirstName: profile.full_name || '',
          customerLastName: profile.full_name || '',
          method: 'moneroo_payout_demo',
          account_number: accountNumber,
        };

        const result: MonerooTransfertResponse = await initiateMonerooTransfert(data);

        if (!result.success) {
          failures.push({ id: x.id, error: result });
          // continue with next transaction
          continue;
        }

        // Update local status with the created transaction id
        const updateData = { id: x.id, transaction_id: result?.data?.id };
        try {
          const updateResult = await updateStatus(updateData);
          successes.push({ id: x.id, transaction_id: result?.data?.id, updated: updateResult });
        } catch (uErr) {
          failures.push({ id: x.id, transaction_id: result?.data?.id, updateError: String(uErr) });
        }

      } catch (err) {
        console.error('Transfer item error:', err);
        failures.push({ id: x.id, error: String(err) });
      }
    }

    const statusCode = failures.length === 0 ? 200 : (successes.length === 0 ? 500 : 207);
    return NextResponse.json({ successes, failures }, { status: statusCode });

  } catch (Error){
    console.log(Error)
    return NextResponse.json(
      { "error":String(Error) },
      { status:500}
    )
  }
}