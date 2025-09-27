import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../hooks/useLocalStorage';

export default function Navigation() {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const isActive = (path) => location.pathname === path;

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
            
            {/* Toggle de tema */}
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              title={isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>

          {/* Menu mobile */}
          <div className="md:hidden flex items-center space-x-2">
            <div className="flex space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`p-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive(item.path)
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  title={item.label}
                >
                  {item.icon}
                </Link>
              ))}
            </div>
            
            {/* Toggle de tema mobile */}
            <button
              onClick={toggleTheme}
              className="theme-toggle text-sm"
              title={isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}