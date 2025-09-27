import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithGoogle, isAuthenticated, loading, user } = useAuthContext();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState(null);

  // Redireciona se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated && !loading) {
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, location.state]);

  const handleGoogleLogin = async () => {
    try {
      setIsSigningIn(true);
      setError(null);
      
      const { error } = await signInWithGoogle();
      
      if (error) {
        setError('Erro ao fazer login com Google. Tente novamente.');
        console.error('Erro de login:', error);
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
      console.error('Erro inesperado:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  // Mostra loading se ainda estiver verificando autenticação
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-all duration-300">
      <div className="max-w-md w-full">
        {/* Logo e título */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">EN</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">EntreNós</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Gestão financeira compartilhada</p>
        </div>

        {/* Card de Login */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          
          {/* Botão de Login com Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={isSigningIn}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isSigningIn ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span>
              {isSigningIn ? 'Entrando...' : 'Continuar com Google'}
            </span>
          </button>

          {/* Mensagem de erro */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
            </div>
          )}

          {/* Informações sobre a aplicação */}
          <div className="mt-6 space-y-3">
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ao continuar, você concorda com nossos termos de uso
              </p>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                ✨ Com o EntreNós você pode:
              </h3>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Gerenciar gastos compartilhados</li>
                <li>• Definir e acompanhar metas financeiras</li>
                <li>• Visualizar relatórios detalhados</li>
                <li>• Manter as contas sempre em dia</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Informação de segurança */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            🔒 Seus dados estão seguros e protegidos
          </p>
        </div>
      </div>
    </div>
  );
}