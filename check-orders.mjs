import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jkgbhwdgxulhsbjduztn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZ2Jod2RneHVsaHNiamR1enRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDkyOTQsImV4cCI6MjA3NzkyNTI5NH0.jq6rSnFBv399xa6OmXGqVpmYQgxcEHTSNiYxyIY_AUM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrders() {
  try {
    // Get one order to see schema
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error:', error);
    } else if (data && data.length > 0) {
      console.log('Sample order structure:', JSON.stringify(data[0], null, 2));
    } else {
      console.log('No existing orders found');
      // Try to get schema info
      const { data: schemaInfo } = await supabase
        .rpc('get_table_columns', { table_name: 'orders' })
        .catch(() => ({ data: null }));
      console.log('Schema info:', schemaInfo);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkOrders();
