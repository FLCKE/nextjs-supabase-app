import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jkgbhwdgxulhsbjduztn.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZ2Jod2RneHVsaHNiamR1enRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM0OTI5NCwiZXhwIjoyMDc3OTI1Mjk0fQ.Gl4zu__GqhxcS5-kKmFP4hOXo43uFO5sP09MtRTkW7I';

const supabase = createClient(supabaseUrl, serviceKey);

async function checkTableSchema() {
  try {
    const { data: tables } = await supabase
      .from('tables')
      .select('*')
      .limit(1);
    
    if (tables && tables.length > 0) {
      console.log('Sample table:', JSON.stringify(tables[0], null, 2));
    } else {
      console.log('No tables exist yet. Checking restaurants table...');
      const { data: restaurants } = await supabase
        .from('restaurants')
        .select('*')
        .limit(1);
      console.log('Sample restaurant:', JSON.stringify(restaurants[0], null, 2));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTableSchema();
