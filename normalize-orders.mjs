import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jkgbhwdgxulhsbjduztn.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZ2Jod2RneHVsaHNiamR1enRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM0OTI5NCwiZXhwIjoyMDc3OTI1Mjk0fQ.Gl4zu__GqhxcS5-kKmFP4hOXo43uFO5sP09MtRTkW7I';

const supabase = createClient(supabaseUrl, serviceKey);

async function normalizeOrders() {
  try {
    const { data: restaurants } = await supabase.from('restaurants').select('id').limit(1);
    const restaurantId = restaurants[0].id;

    // Update all existing orders with restaurant_id
    const { error } = await supabase
      .from('orders')
      .update({ restaurant_id: restaurantId })
      .is('restaurant_id', null);

    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }

    // Verify the updates
    const { data: orders } = await supabase
      .from('orders')
      .select('id, restaurant_id, status, notes')
      .order('created_at', { ascending: false })
      .limit(3);

    console.log('✅ Successfully normalized all orders with restaurant_id!\n');
    orders.forEach((order, i) => {
      console.log(`📦 Order ${i + 1}:`);
      console.log(`   ID: ${order.id}`);
      console.log(`   Restaurant ID: ${order.restaurant_id}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Details: ${order.notes}`);
      console.log();
    });
    console.log('🎉 All orders now properly associated with their restaurant!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

normalizeOrders();
