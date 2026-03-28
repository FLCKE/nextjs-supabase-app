import cron from "node-cron";
import { createAdminClient } from '@/lib/supabase/server';
export function generate_daily_payment(){
    // const supabaseadmin = createAdminClient();
    cron.schedule("* * * * *",async ()=>{
        // const result = supabaseadmin.from("payments_by_day").select("*")
        
        console.log("le code marche");
    })

}