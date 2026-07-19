import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xbvjfcngqxlvnzeoaeov.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhidmpmY25ncXhsdm56ZW9hZW92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0NjAzMzEsImV4cCI6MjEwMDAzNjMzMX0.WlmE7SfUdlGQR3OpXYE7haxECnPUWnM_yaGZdcERROI'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
