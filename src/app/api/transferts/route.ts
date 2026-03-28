
import { getAllPaymentActive, updateStatus } from '@/lib/actions/payment';
import { initiateMonerooTransfert, MonerooTransfertRequest, MonerooTransfertResponse } from '@/lib/moneroo';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request:NextRequest){
    try{
        
        // const body =await request.json() as MonerooTransfertRequest;
        console.log("initialisation du transfert ")
        let transactions = await getAllPaymentActive();
        // transactions =JSON.stringify(transactions, null, 2);
        console.log(transactions)
        for (const x of transactions.data){
            const data:MonerooTransfertRequest={
                "amount": x.amount_cts,
                "currency": x.currency,
                "description": `Paiement journalier du `+x.day_payment,
                "customerEmail": x.restaurant.profiles[0].email,
                "customerPhone": '4149518161',
                "customerFirstName": x.restaurant.profiles[0].full_name,
                "customerLastName": x.restaurant.profiles[0].full_name,
                "method": "moneroo_payout_demo",
                "account_number": 4149518161
                }
                // data = data as MonerooTransfertRequest;
                const result= await initiateMonerooTransfert(data);
                if (!result.success){
                    return NextResponse.json(
                    {"Message":result},
                    {status:400},
                )
                }
                const updateData={
                    id:x.id,
                    transaction_id:result?.data?.id
                }
                console.log(updateData)
                // if(!updateStatus(updateData)){
                //     return NextResponse.json(
                //     {"Message":result},
                //     {status:400},
                // )
                // }
               const result_updating=  updateStatus(updateData)
                console.log("resustats",result_updating)
               return NextResponse.json(
                    {"Message":result},
                    {status:200},
                )
        }
        if (transactions.data.length===0){
            return NextResponse.json(
                {"Message":"No data in a payment table"},
                {status:404},
            )
        }
    }catch (Error){   
        console.log(Error)
        return NextResponse.json(
           { "error":Error},
           { status:500}
        )
    }
}