import { createClient } from '@supabase/supabase-js'

// Intha URL unga screenshot-la irunthathu
const supabaseUrl = 'https://csaqrbmuqpanujoeshsc.supabase.co'
// Itha mattum unga Supabase Settings > API-la irunthu copy panni paste pannunga
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYXFyYm11cXBhbnVqb2VzaHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0OTQ3MDQsImV4cCI6MjA4OTA3MDcwNH0.83rP2ac7YvfV_E7U_NVWxyoPLb-2sPaSteE-vxa5Evk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)