import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useLocalStorage';
import { useAuthContext } from '../contexts/AuthContext';
import { useState } from 'react';

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { user, signOut, loading } = useAuthContext();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      setIsSigningOut(true);
      const { error } = await signOut();

      if (error) {
        console.error('Erro ao fazer logout:', error);
        alert('Erro ao fazer logout. Tente novamente.');
      } else {
        navigate('/login', { replace: true });
      }
    } catch (err) {
      console.error('Erro inesperado ao fazer logout:', err);
      alert('Erro inesperado. Tente novamente.');
    } finally {
      setIsSigningOut(false);
    }
  };

  const getUserDisplayName = () => {
    if (!user) return 'Usuário';
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário';
  };

  const getUserAvatar = () => {
    return user?.user_metadata?.avatar_url || null;
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/expenses', label: 'Despesas', icon: '💸' },
    { path: '/goals', label: 'Metas', icon: '🎯' },
    { path: '/reports', label: 'Relatórios', icon: '📈' }
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EN</span>
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-gray-100">EntreNós</span>
            </Link>
          </div>

          {/* Menu de navegação */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive(item.path)
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Controles do usuário */}
            <div className="flex items-center space-x-3">
              {/* Toggle de tema */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                title={isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
              >
                {isDark ? '☀️' : '🌙'}
              </button>

              {/* Informações do usuário */}
              <div className="flex items-center space-x-3 pl-3 border-l border-gray-200 dark:border-gray-600">
                <div className="flex items-center space-x-2">
                  {getUserAvatar() ? (
                    <img
                      src={getUserAvatar()}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {getUserDisplayName().charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {getUserDisplayName()}
                  </span>
                </div>

                {/* Botão de logout */}
                <button
                  onClick={handleLogout}
                  disabled={isSigningOut}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Fazer logout"
                >
                  {isSigningOut ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : (
                    <span>🚪</span>
                  )}
                  <span className="hidden lg:inline">
                    {isSigningOut ? 'Saindo...' : 'Sair'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Menu mobile */}
          <div className="md:hidden flex items-center space-x-2">
            <div className="flex space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`p-2 rounded-md text-lg transition-colors duration-200 ${isActive(item.path)
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  title={item.label}
                >
                  {item.icon}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-2 pl-2 border-l border-gray-200 dark:border-gray-600">
              {/* Toggle de tema mobile */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                title={isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
              >
                {isDark ? '☀️' : '🌙'}
              </button>

              {/* Avatar do usuário mobile */}
              {getUserAvatar() ? (
                <img
                  src={getUserAvatar()}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {getUserDisplayName().charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Botão de logout mobile */}
              <button
                onClick={handleLogout}
                disabled={isSigningOut}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 disabled:opacity-50"
                title="Fazer logout"
              >
                {isSigningOut ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                ) : (
                  <span className="text-lg">🚪</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}