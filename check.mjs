import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jkgbhwdgxulhsbjduztn.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZ2Jod2RneHVsaHNiamR1enRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM0OTI5NCwiZXhwIjoyMDc3OTI1Mjk0fQ.Gl4zu__GqhxcS5-kKmFP4hOXo43uFO5sP09MtRTkW7I';

const supabase = createClient(supabaseUrl, serviceKey);

async function checkTables() {
  try {
    const { data: locations } = await supabase.from('locations').select('*').limit(1);
    console.log('Locations:', locations);
    
    const { data: tables } = await supabase.from('tables').select('*').limit(1);
    console.log('Tables:', tables);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkTables();
