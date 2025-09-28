import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://khdycojbspwvtfnymudy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZHljb2pic3B3dnRmbnltdWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMTI0ODYsImV4cCI6MjA3NDU4ODQ4Nn0.MYkZXOvcNHOZiVkEmf9ZuJM39Hf0PMiPAOXyz8L2ahI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

// Função para verificar conectividade
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()
    return { success: !error, error, data }
  } catch (err) {
    return { success: false, error: err, data: null }
  }
}

// Função para limpar sessão corrompida
export const clearCorruptedSession = async () => {
  try {
    await supabase.auth.signOut()
    localStorage.clear()
    sessionStorage.clear()
  } catch (err) {
    // Silently handle errors
  }
}