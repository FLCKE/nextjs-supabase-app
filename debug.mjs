import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jkgbhwdgxulhsbjduztn.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZ2Jod2RneHVsaHNiamR1enRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM0OTI5NCwiZXhwIjoyMDc3OTI1Mjk0fQ.Gl4zu__GqhxcS5-kKmFP4hOXo43uFO5sP09MtRTkW7I';

const supabase = createClient(supabaseUrl, serviceKey);

async function debug() {
  try {
    const { data, error } = await supabase
      .from('tables')
      .insert([{ location_id: '99d4af49-7fb8-4b94-aeeb-b85b5dbd5d6f' }])
      .select();

    console.log('Data:', data);
    console.log('Error:', error);
  } catch (error) {
    console.error('Exception:', error.message);
  }
}

debug();
