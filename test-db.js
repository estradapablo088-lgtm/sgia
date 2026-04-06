const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://kdkjuibrboetengqxjho.supabase.co', 'sb_publishable_YSGF3ErF2_gSI7IL-vtNqg_UcRaGLx7');

async function test() {
  const { data, error } = await supabase.rpc('hello'); // unlikely to work without a custom rpc
  // Let's try getting columns via standard pg query if not blocked:
  // Anon key usually can't read information_schema, but perhaps there's a workaround.
  // Actually, I can just deliberately query 'credits' and 'creditos' sequentially and see which one returns a PGRST200 error!
  
  // Test 'credits'
  const res1 = await supabase.from('profiles').select('credits').limit(1);
  console.log("Query 'credits':", res1.error ? res1.error.message : 'Success');

  // Test 'creditos'
  const res2 = await supabase.from('profiles').select('creditos').limit(1);
  console.log("Query 'creditos':", res2.error ? res2.error.message : 'Success');
}

test();
