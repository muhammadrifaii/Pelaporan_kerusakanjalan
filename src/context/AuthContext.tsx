import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase, onAuthStateChange, isSimulator } from '../lib/supabase'
import type { User, UserRole } from '../types'

interface AuthContextType {
  user: SupabaseUser | null
  profile: User | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state
  useEffect(() => {
    if (isSimulator) {
      setLoading(false)
      return
    }

    const initAuth = async () => {
      try {
        if (!supabase) return

        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          setUser(session.user)
          await fetchUserProfile(session.user.id)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Subscribe to auth changes
    if (supabase) {
      const unsubscribe = onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          setUser(session.user)
          setLoading(true)
          await fetchUserProfile(session.user.id)
          setLoading(false)
        } else {
          setUser(null)
          setProfile(null)
        }
      })

      return () => unsubscribe?.()
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data as User)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    phone: string,
  ) => {
    if (!supabase) return { error: new Error('Supabase not initialized') }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        // Create user profile as citizen
        const { error: profileError } = await supabase.from('users').insert({
          id: authData.user.id,
          email,
          role: 'citizen' as UserRole,
          full_name: fullName,
          phone,
          active: true,
        })

        if (profileError) throw profileError
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: new Error('Supabase not initialized') }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signOutUser = async () => {
    if (!supabase) return

    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    if (!supabase || !user) return { error: new Error('Not authenticated') }

    try {
      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', user.id)

      if (error) throw error

      setProfile((prev) => (prev ? { ...prev, ...data } : null))
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut: signOutUser,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
