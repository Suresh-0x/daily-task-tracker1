const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ahajtqvcxykqxryujosk.supabase.co';
const supabaseKey ='sb_publishable_3rdqk0bmNGcR-sZpuGuqLw_JrzmF-tI'; // Mee Supabase anon key ni direct ga ikkada paste cheyyandi

const db = createClient(supabaseUrl, supabaseKey);

module.exports = db;