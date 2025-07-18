import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://tbexstwflcknsujzaskl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiZXhzdHdmbGNrbnN1anphc2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTEzMjEsImV4cCI6MjA2NzE2NzMyMX0.FLmlelXtTOf-P9gDJBDHBIH6xHD0zTU9Mub_ldD6TFc'

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

export default supabase