const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://ahajtqvcxykqxryujosk.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_3rdqk0bmNGcR-sZpuGuqLw_JrzmF-tI';

const db = createClient(supabaseUrl, supabaseKey);

module.exports = db;