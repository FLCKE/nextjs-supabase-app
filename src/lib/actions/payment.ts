'use server'
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { equal } from 'assert';

export async function getAllPaymentActive():Promise<any>{
    try{
        const supabase= createAdminClient();
        const result = supabase.from("payments_by_day")
  .select(`
    id,
    transaction_id,
    day_payment,
    amount_cts,
    currency,
    status,
    payment_method,
    restaurant:restaurants (
      id,
      name,
      profiles (
        id,
        email,
        full_name,
        phone,
        role
      )
    )
  `)
  .eq("status", "initiated")
  .eq("restaurants.profiles.role", "owner")
    if(!result){
        return false;
    }
    return result;
    }catch(e){
        // console.log(e)
        return e;
    }
    
}
export async function updateStatus(data:any):Promise<boolean>{
    try {
        const supabase = createAdminClient();
        await supabase.from('payments_by_day').update({status:'pending',transaction_id:data.transaction_id}).eq('id',data.id)
        return true;
    }catch(e){
        return false; 
    }
}