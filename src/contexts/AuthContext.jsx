import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { getRedirectUrl } from '../config/environment.js'

const AuthContext = createContext({})

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    
    // Verificar se há um usuário logado ao carregar a aplicação
    const getSession = async () => {
      try {
        // Verificar se há erro na URL (problema do banco de dados)
        const urlParams = new URLSearchParams(window.location.search)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        
        const errorFromUrl = urlParams.get('error') || hashParams.get('error')
        const errorDescription = urlParams.get('error_description') || hashParams.get('error_description')
        
        if (errorFromUrl === 'server_error' && errorDescription?.includes('Database error saving new user')) {
          // Limpar a URL e mostrar mensagem de erro
          window.history.replaceState({}, document.title, window.location.pathname)
          
          if (mounted) {
            setUser(null)
            setLoading(false)
          }
          
          return
        }
        
        // Aguardar um pouco se estivermos vindo de um OAuth redirect
        if (urlParams.has('code') || hashParams.has('access_token') || window.location.hash.includes('access_token')) {
          await new Promise(resolve => setTimeout(resolve, 3000))
        }
        
        // Obter sessão
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (mounted) {
          setUser(session?.user ?? null)
          setLoading(false)
        }
      } catch (err) {
        if (mounted) {
          setUser(null)
          setLoading(false)
        }
      }
    }

    getSession()

    // Escutar mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          setUser(session?.user ?? null)
          setLoading(false)
        }
        
        // Redirecionamento automático após login bem-sucedido
        if (event === 'SIGNED_IN' && session?.user && mounted) {
          // Limpar a URL de parâmetros OAuth
          if (window.location.search || window.location.hash) {
            window.history.replaceState({}, document.title, window.location.pathname)
          }
          
          // Redirecionar se estiver na página de login
          setTimeout(() => {
            if (window.location.pathname === '/login' || window.location.pathname === '/') {
              window.location.href = '/dashboard'
            }
          }, 100)
        }
        
        if (event === 'SIGNED_OUT') {
          if (mounted) {
            setUser(null)
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signInWithGoogle = async () => {
    try {
      const redirectUrl = getRedirectUrl('/dashboard')
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account'
          }
        }
      })
      
      if (error) {
        return { error }
      }
      
      return { data }
    } catch (err) {
      return { error: err }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      return { error }
    }
    return { error: null }
  }

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}