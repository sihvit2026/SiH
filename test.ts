import { createClient } from './lib/supabase/client';

async function test() {
  const supabase = createClient();
  const { data, error } = await supabase.from('events').select('*');
  if (data) {
    const x = data[0].id;
  }
}
