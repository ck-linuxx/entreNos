// Configurações de ambiente para URLs de redirecionamento

export const getBaseUrl = () => {
  // Em desenvolvimento
  if (import.meta.env.DEV) {
    return 'http://localhost:5173'
  }

  // URL fixa do site em produção
  return 'https://entre-nos-gules.vercel.app'
}

export const getRedirectUrl = (path = '') => {
  const baseUrl = getBaseUrl()
  return `${baseUrl}${path}`
}

// Debug: função para verificar qual URL está sendo usada
export const debugUrls = () => {
  console.log('Environment:', import.meta.env.MODE)
  console.log('Base URL:', getBaseUrl())
  console.log('Window Origin:', typeof window !== 'undefined' ? window.location.origin : 'N/A')
}

export const isProduction = () => import.meta.env.PROD
export const isDevelopment = () => import.meta.env.DEV