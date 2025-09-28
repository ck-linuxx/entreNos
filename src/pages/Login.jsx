import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useLocalStorage';
import { useAuth } from '../contexts/AuthContext';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function Login() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { signInWithGoogle, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  // Usar useEffect para redirecionar quando o usuário for autenticado
  React.useEffect(() => {
    console.log('Login useEffect - user:', !!user, 'authLoading:', authLoading);
    if (user && !authLoading) {
      console.log('Usuário logado detectado, redirecionando para dashboard...');
      setLoading(false); // Parar loading local
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Se ainda está carregando a autenticação, mostrar loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">EN</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  const handleGoogleLogin = async () => {
    console.log('Iniciando login com Google...');
    setLoading(true);

    try {
      const { data, error } = await signInWithGoogle();

      if (error) {
        console.error('Erro no login:', error);
        alert(`Erro ao fazer login: ${error.message || 'Tente novamente.'}`);
        setLoading(false);
        return;
      }

      console.log('Login iniciado com sucesso:', data);
      // O redirecionamento será feito pelo useEffect quando user for atualizado
      // Manter loading por um tempo para dar feedback visual
      setTimeout(() => {
        if (!user) {
          setLoading(false); // Se após 3 segundos não tiver usuário, parar loading
        }
      }, 3000);

    } catch (error) {
      console.error('Erro inesperado no login:', error);
      alert('Erro inesperado ao fazer login. Verifique sua conexão e tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-all duration-300">
      <div className="max-w-md w-full">
        {/* Toggle de tema */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            title={isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
          >
            {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>
        </div>

        {/* Logo e título */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">EN</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">EntreNós</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Gestão financeira compartilhada</p>
        </div>

        {/* Formulário */}
        <div className="card">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Faça login para continuar
              </h2>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {loading ? 'Entrando...' : 'Continuar com Google'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ao continuar, você aceita nossos termos de uso e política de privacidade.
            </p>
          </div>
        </div>

        {/* Informação sobre o protótipo */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Este é um protótipo interativo. Clique em "Entrar" para explorar.
          </p>
        </div>
      </div>
    </div>
  );
}