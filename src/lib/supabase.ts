import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || ''
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || ''

// If the environment variables are not supplied, the app will run in offline Simulator Mode
export const isSimulator = !supabaseUrl || !supabaseAnonKey

export const supabase = !isSimulator
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

if (isSimulator) {
  console.warn(
    'JalanKita Pekanbaru: Supabase credentials not found. Running in Offline Simulator Mode.\n' +
    'To connect to a live Supabase instance, create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
  )
} else {
  console.log('JalanKita Pekanbaru: Connected to live Supabase backend.')
}

// Helper functions for authentication and session management
export const getSession = async () => {
  if (!supabase) return null
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export const getCurrentUser = async () => {
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const signOut = async () => {
  if (!supabase) return
  await supabase.auth.signOut()
}

// Subscribe to auth state changes
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  if (!supabase) return () => {}
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback)
  return subscription?.unsubscribe || (() => {})
}
