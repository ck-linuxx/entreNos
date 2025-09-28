import { createContext, useContext } from 'react'
import { useAuth } from '../hooks/useAuth'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuthContext deve ser usado dentro de um AuthProvider')
  }

  return context
}