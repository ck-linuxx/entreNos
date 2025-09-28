import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext({})

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Função para sincronizar perfil do usuário
  const syncUserProfile = async (userData) => {
    if (!userData) return;

    try {
      const profileData = {
        id: userData.id,
        display_name: userData.user_metadata?.full_name || 
                     userData.user_metadata?.name || 
                     userData.email?.split('@')[0] || 
                     'Usuário',
        avatar_url: userData.user_metadata?.avatar_url || 
                   userData.user_metadata?.picture || 
                   null,
        email: userData.email
      };

      // Tentar inserir ou atualizar o perfil
      const { error } = await supabase
        .from('user_profiles')
        .upsert(profileData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('Erro ao sincronizar perfil:', error);
      } else {
        console.log('Perfil sincronizado com sucesso');
      }
    } catch (err) {
      console.error('Erro ao sincronizar perfil:', err);
    }
  }

  useEffect(() => {
    let mounted = true

    // Verificar se há um usuário logado ao carregar a aplicação
    const getSession = async () => {
      try {
        // Debug: verificar URL atual
        console.log('AuthProvider: URL atual:', window.location.href)
        console.log('AuthProvider: Origin:', window.location.origin)
        console.log('AuthProvider: Ambiente:', import.meta.env.MODE)

        // Verificar se estamos em localhost quando deveríamos estar em produção
        if (window.location.origin.includes('localhost:3000') && import.meta.env.PROD) {
          console.error('❌ PROBLEMA: Redirecionado para localhost em produção!')
          console.error('Verifique a configuração do Supabase Dashboard')
        }

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
          const userData = session?.user ?? null;
          setUser(userData);
          if (userData) {
            syncUserProfile(userData);
          }
          setLoading(false);
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
          const userData = session?.user ?? null;
          setUser(userData);
          if (userData) {
            syncUserProfile(userData);
          }
          setLoading(false);
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
      // Forçar URL correta baseada no ambiente
      const redirectUrl = import.meta.env.DEV
        ? 'http://localhost:5173/dashboard'
        : 'https://entre-nos-gules.vercel.app/dashboard'

      console.log('Redirect URL sendo usado:', redirectUrl)
      console.log('Ambiente:', import.meta.env.MODE)

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


      return { data }
    } catch (err) {
      return { error: err }
    }
  }

  const signOut = async () => {
    try {
      console.log('Iniciando logout...')
      
      // Primeiro, limpar o estado local
      setUser(null)
      setLoading(true)
      
      // Fazer logout no Supabase
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Erro ao fazer logout:', error)
        // Mesmo com erro, vamos limpar tudo localmente
      }
      
      console.log('Logout realizado com sucesso')
      
      // Limpar dados locais de forma mais agressiva
      try {
        localStorage.clear()
        sessionStorage.clear()
      } catch (storageError) {
        console.warn('Erro ao limpar storage:', storageError)
      }
      
      // Forçar reload da página para garantir limpeza completa
      setTimeout(() => {
        window.location.replace('/login')
      }, 100)
      
      return { error: null }
    } catch (err) {
      console.error('Erro inesperado no logout:', err)
      
      // Em caso de erro, ainda assim limpar tudo localmente
      setUser(null)
      try {
        localStorage.clear()
        sessionStorage.clear()
      } catch (storageError) {
        console.warn('Erro ao limpar storage:', storageError)
      }
      
      // Forçar redirecionamento mesmo com erro
      setTimeout(() => {
        window.location.replace('/login')
      }, 100)
      
      return { error: err }
    }
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