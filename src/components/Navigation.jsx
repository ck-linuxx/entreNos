import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../hooks/useLocalStorage';
import { useAuth } from '../contexts/AuthContext';
import { useGroup } from '../contexts/GroupContext';
import { useState, useEffect, useRef } from 'react';
import {
  FiHome,
  FiCreditCard,
  FiBarChart,
  FiTarget,
  FiSun,
  FiMoon,
  FiUser,
  FiLogOut,
  FiChevronDown,
  FiUserPlus,
  FiUsers,
  FiSettings
} from 'react-icons/fi';
import GroupActionModal from './GroupActionModal';

// Componente Avatar com fallback inteligente
const Avatar = ({ user, member, size = 'w-8 h-8', className = '' }) => {
  const [imageError, setImageError] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);

  useEffect(() => {
    if (user || member) {
      const userData = user || member;
      // Lista de possíveis URLs de avatar em ordem de prioridade
      const possibleAvatars = [
        userData.user_metadata?.avatar_url,
        userData.user_metadata?.picture,
        userData.identities?.[0]?.identity_data?.avatar_url,
        userData.identities?.[0]?.identity_data?.picture,
        userData.avatar, // Para membros do grupo
      ].filter(Boolean);

      setCurrentImageUrl(possibleAvatars[0] || null);
      setImageError(false);
    }
  }, [user, member]);

  const getInitials = (name) => {
    return name.split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const userData = user || member;
  const name = userData?.user_metadata?.full_name ||
    userData?.user_metadata?.name ||
    userData?.name ||
    userData?.email?.split('@')[0] ||
    'Usuário';

  // Se não há URL de imagem ou houve erro, mostrar avatar com iniciais
  if (!currentImageUrl || imageError) {
    const initials = getInitials(name);

    return (
      <div className={`${size} rounded-full bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600 ${className}`}>
        <span className="text-white font-bold text-xs">
          {initials}
        </span>
      </div>
    );
  }

  return (
    <img
      src={currentImageUrl}
      alt={name}
      title={name}
      className={`${size} rounded-full border-2 border-gray-200 dark:border-gray-600 object-cover ${className}`}
      onError={() => {
        console.log('Erro ao carregar avatar:', currentImageUrl);
        setImageError(true);
      }}
      onLoad={() => {
        console.log('Avatar carregado com sucesso:', currentImageUrl);
      }}
    />
  );
};

// Componente para avatares sobrepostos dos membros do grupo
const GroupAvatars = ({ members, currentUser }) => {
  if (!members || members.length <= 1) {
    return <Avatar user={currentUser} />;
  }

  const displayMembers = members.slice(0, 2); // Mostrar no máximo 2 avatares
  const hasMore = members.length > 2;

  return (
    <div className="flex items-center">
      {displayMembers.map((member, index) => (
        <Avatar
          key={member.userId}
          member={member}
          size="w-8 h-8"
          className={index > 0 ? '-ml-2' : ''}
        />
      ))}
      {hasMore && (
        <div className="w-8 h-8 -ml-2 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600">
          <span className="text-white font-bold text-xs">+{members.length - 2}</span>
        </div>
      )}
    </div>
  );
}; export default function Navigation() {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { currentGroup, groupMembers } = useGroup();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Função para obter o nome do usuário
  const getUserName = () => {
    if (!user) return 'Usuário';
    return user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Usuário';
  };

  // Função para obter o primeiro nome do usuário
  const getFirstName = () => {
    const fullName = getUserName();
    return fullName.split(' ')[0];
  };

  const handleSignOut = async () => {
    await signOut();
    setShowDropdown(false);
  };

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/expenses', label: 'Transações', icon: FiCreditCard },
    { path: '/goals', label: 'Metas', icon: FiTarget },
    { path: '/reports', label: 'Relatórios', icon: FiBarChart }
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
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive(item.path)
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                  >
                    <IconComponent className="mr-2" size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Perfil do usuário e toggle de tema */}
            <div className="flex items-center space-x-3">
              {/* Toggle de tema */}
              <button
                onClick={toggleTheme}
                className="theme-toggle p-2"
                title={isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
              >
                {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
              </button>

              {/* Perfil do usuário */}
              {user && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <GroupAvatars members={groupMembers} currentUser={user} />
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {getFirstName()}
                      </div>
                      {groupMembers?.length > 1 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {currentGroup?.name}
                        </div>
                      )}
                    </div>
                    <FiChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown */}
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                      <div className="py-1">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-3">
                            <Avatar user={user} size="w-10 h-10" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {getUserName()}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {user.email}
                              </p>
                              {currentGroup && (
                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                  {currentGroup.name} • {groupMembers?.length || 0} membros
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Opções do grupo */}
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">GRUPO</p>

                          <button
                            onClick={() => {
                              setShowGroupModal(true);
                              setShowDropdown(false);
                            }}
                            className="flex items-center w-full text-left px-2 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          >
                            <FiUsers className="mr-2" size={16} />
                            Gerenciar Grupo
                          </button>
                        </div>

                        <button
                          onClick={handleSignOut}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <FiLogOut className="mr-2" size={16} />
                          Sair
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Menu mobile */}
          <div className="md:hidden flex items-center space-x-2">
            <div className="flex space-x-2">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`p-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive(item.path)
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    title={item.label}
                  >
                    <IconComponent size={18} />
                  </Link>
                );
              })}
            </div>

            {/* Toggle de tema mobile */}
            <button
              onClick={toggleTheme}
              className="theme-toggle text-sm p-2"
              title={isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
            >
              {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            {/* Perfil mobile */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <GroupAvatars members={groupMembers} currentUser={user} />
                </button>

                {/* Dropdown mobile */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="py-1">
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                          <Avatar user={user} size="w-10 h-10" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {getUserName()}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {user.email}
                            </p>
                            {currentGroup && (
                              <p className="text-xs text-blue-600 dark:text-blue-400">
                                {currentGroup.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Opções do grupo mobile */}
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => {
                            setShowGroupModal(true);
                            setShowDropdown(false);
                          }}
                          className="flex items-center w-full text-left py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        >
                          <FiUsers className="mr-2" size={16} />
                          Gerenciar Grupo
                        </button>
                      </div>

                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de ações do grupo */}
      <GroupActionModal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
      />
    </nav>
  );
}