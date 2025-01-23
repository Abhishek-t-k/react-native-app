import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://iidipqlrpoxmpjajayjk.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZGlwcWxycG94bXBqYWpheWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2NDczMTgsImV4cCI6MjA1MzIyMzMxOH0.cHtVWVXJa6M-LyV51aC-tFkYcgd8sZWmrC3XFPAmqbo";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})