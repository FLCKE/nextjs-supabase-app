import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jkgbhwdgxulhsbjduztn.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZ2Jod2RneHVsaHNiamR1enRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM0OTI5NCwiZXhwIjoyMDc3OTI1Mjk0fQ.Gl4zu__GqhxcS5-kKmFP4hOXo43uFO5sP09MtRTkW7I';

const supabase = createClient(supabaseUrl, serviceKey);

async function createOrders() {
  try {
    const { data: locations } = await supabase.from('locations').select('id').limit(1);
    const locationId = locations[0].id;

    const { data: tablesData } = await supabase
      .from('tables')
      .select('id')
      .eq('location_id', locationId)
      .limit(3);

    console.log('Creating 3 orders...');
    const orders = [
      {
        table_id: tablesData[0].id,
        status: 'PENDING',
        total_net_cts: 2500,
        taxes_cts: 250,
        total_gross_cts: 2750,
        notes: 'Burger & Fries',
      },
      {
        table_id: tablesData[1].id,
        status: 'PENDING',
        total_net_cts: 3200,
        taxes_cts: 320,
        total_gross_cts: 3520,
        notes: 'Pizza & Salad',
      },
      {
        table_id: tablesData[2].id,
        status: 'PENDING',
        total_net_cts: 1800,
        taxes_cts: 180,
        total_gross_cts: 1980,
        notes: 'Pasta Carbonara',
      },
    ];

    const { data: ordersData, error } = await supabase
      .from('orders')
      .insert(orders)
      .select();

    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }

    console.log('✅ Successfully created 3 orders!\n');
    ordersData.forEach((order, i) => {
      const amount = (order.total_gross_cts / 100).toFixed(2);
      console.log(`📦 Order ${i + 1}:`);
      console.log(`   ID: ${order.id}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Amount: $${amount}`);
      console.log(`   Details: ${order.notes}`);
      console.log();
    });
    console.log('🎉 All 3 orders created and ready to view in staff dashboard!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createOrders();
