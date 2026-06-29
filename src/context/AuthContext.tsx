import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase, onAuthStateChange, isSimulator } from '../lib/supabase'
import { simulator } from '../lib/supabase-simulator'
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
      const sessionUser = simulator.getSessionUser()
      if (sessionUser) {
        setUser({ id: sessionUser.id, email: sessionUser.email } as SupabaseUser)
        setProfile(sessionUser)
      }
      setLoading(false)
      return
    }

    const initAuth = async () => {
      try {
        if (!supabase) {
          setLoading(false)
          return
        }

        const timeoutId = setTimeout(() => {
          setLoading(false)
        }, 8000)

        const {
          data: { session },
        } = await supabase.auth.getSession()

        clearTimeout(timeoutId)

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
      const unsubscribe = onAuthStateChange(async (event, session) => {
        if (event === 'INITIAL_SESSION') return

        if (session?.user) {
          setUser(session.user)
          setLoading(true)
          try {
            await fetchUserProfile(session.user.id)
          } finally {
            setLoading(false)
          }
        } else {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      })

      return () => unsubscribe?.()
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
    if (!supabase) return

    const tryTable = async (table: string): Promise<User | null> => {
      try {
        const { data, error } = await supabase!
          .from(table)
          .select('*')
          .eq('id', userId)
          .maybeSingle()
        if (error) {
          console.warn(`fetchUserProfile: ${table} query error:`, error.message)
          return null
        }
        return data as User | null
      } catch (e) {
        console.warn(`fetchUserProfile: ${table} exception:`, e)
        return null
      }
    }

    try {
      let userData = await tryTable('profiles')
      if (!userData) {
        console.log('fetchUserProfile: profiles return null, coba users table...')
        userData = await tryTable('users')
        if (userData) {
          console.log('fetchUserProfile: migrasi profil dari users ke profiles...')
          const { error: insertError } = await supabase!
            .from('profiles')
            .insert({
              id: userData.id,
              email: userData.email,
              full_name: userData.full_name,
              phone: userData.phone,
              role: userData.role,
              address: userData.address || '',
              active: userData.active ?? true,
              avatar_url: userData.avatar_url || null,
            })
          if (insertError) {
            console.error('fetchUserProfile: gagal migrasi ke profiles:', insertError.message)
          } else {
            const { data: newProfile } = await supabase!
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .maybeSingle()
            if (newProfile) {
              userData = newProfile as User
              console.log('fetchUserProfile: migrasi berhasil, profil baru:', userData.id, userData.full_name, 'avatar_url:', userData.avatar_url?.substring(0, 50))
            }
          }
        }
      }
      if (userData) {
        console.log('fetchUserProfile: profil ditemukan:', userData.id, userData.full_name, 'avatar_url:', userData.avatar_url?.substring(0, 50))
        setProfile(userData)
      } else {
        console.error('fetchUserProfile: profil TIDAK ditemukan di tabel profiles maupun users untuk userId:', userId)
        // Fallback: buat profil dari metadata auth user
        try {
          const { data: { user: authUser } } = await supabase!.auth.getUser()
          if (authUser?.email) {
            const meta = authUser.user_metadata || {}
            const newUser: User = {
              id: userId,
              email: authUser.email,
              full_name: meta.full_name || authUser.email.split('@')[0],
              phone: meta.phone || '',
              role: 'citizen',
              active: true,
              address: '',
              created_at: authUser.created_at || new Date().toISOString(),
            }
            const { error: createError } = await supabase!
              .from('profiles')
              .insert({ ...newUser })
            if (createError) {
              console.error('fetchUserProfile: gagal buat profil dari metadata:', createError.message)
            } else {
              setProfile(newUser)
              console.log('fetchUserProfile: profil baru dibuat dari metadata auth untuk:', userId)
            }
          }
        } catch (metaErr) {
          console.error('fetchUserProfile: error fallback metadata:', metaErr)
        }
      }
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
    if (isSimulator) {
      const result = await simulator.signUp(email, fullName, phone)
      if (result.data.user) {
        setUser({ id: result.data.user.id, email: result.data.user.email } as SupabaseUser)
        setProfile(result.data.user)
      }
      return { error: result.error }
    }

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
        const { error: profileError } = await supabase.from('profiles').insert({
          id: authData.user.id,
          email,
          role: 'citizen' as UserRole,
          full_name: fullName,
          phone,
          active: true,
        })

        if (profileError) {
          console.warn('signUp: gagal insert profile (akan dibuat otomatis saat login):', profileError.message)
        }

        await supabase.auth.signOut()
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signIn = async (email: string, password: string) => {
    if (isSimulator) {
      const result = await simulator.signIn(email, password)
      if (result.data.user) {
        setUser({ id: result.data.user.id, email: result.data.user.email } as SupabaseUser)
        setProfile(result.data.user)
      }
      return { error: result.error }
    }

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
    if (isSimulator) {
      await simulator.signOut()
      setUser(null)
      setProfile(null)
      return
    }

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
    if (isSimulator) {
      const result = simulator.updateProfile(
        data.full_name || profile?.full_name || '',
        data.phone || profile?.phone || '',
        data.avatar_url || profile?.avatar_url,
      )
      if (result.user) {
        setProfile(result.user)
      }
      return { error: result.error }
    }

    if (!supabase || !user) return { error: new Error('Not authenticated') }

    try {
      const updateData: Record<string, unknown> = {}
      if (data.full_name !== undefined) updateData.full_name = data.full_name
      if (data.phone !== undefined) updateData.phone = data.phone
      if (data.avatar_url !== undefined) updateData.avatar_url = data.avatar_url
      if (data.address !== undefined) updateData.address = data.address

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)

      if (error) {
        if (data.address !== undefined && error.message?.includes('address')) {
          delete updateData.address
          const { error: retryError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', user.id)
          if (retryError) throw retryError
        } else {
          throw error
        }
      }

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
