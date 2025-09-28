import React from 'react'

export default function ErrorMessage({ error, onRetry }) {
  if (!error) return null

  const isDatabaseError = error.includes('Database error saving new user')

  return (
    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            {isDatabaseError ? 'Problema no Servidor' : 'Erro de Autenticação'}
          </h3>
          <div className="mt-2 text-sm text-red-700 dark:text-red-300">
            {isDatabaseError ? (
              <div>
                <p>Não foi possível criar sua conta devido a um problema temporário no servidor.</p>
                <p className="mt-1">Aguarde alguns minutos e tente novamente. Se o problema persistir, entre em contato com o suporte.</p>
              </div>
            ) : (
              <p>Ocorreu um erro durante o processo de login. Tente novamente.</p>
            )}
          </div>
          
          <div className="mt-4">
            <button
              onClick={onRetry}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}