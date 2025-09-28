import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Pegar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Login com Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) {
        console.error('Erro no login:', error.message)
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error('Erro no login:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('Erro no logout:', error.message)
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error('Erro no logout:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  // Pegar perfil do usuário
  const getUserProfile = async () => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', error.message)
        return null
      }

      return data
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
      return null
    }
  }

  // Atualizar perfil do usuário
  const updateUserProfile = async (updates) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...updates,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar perfil:', error.message)
        return { error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      return { error }
    }
  }

  return {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut,
    getUserProfile,
    updateUserProfile,
    isAuthenticated: !!user
  }
}