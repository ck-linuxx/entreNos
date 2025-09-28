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
  FiLogOut,
  FiChevronDown,
  FiUsers,
  FiPlus
} from 'react-icons/fi';
import GroupActionModal from './GroupActionModal';
import AddTransactionModal from './AddTransactionModal';
import Logo from './Logo';

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

  // Debug: log quando o estado do modal muda
  useEffect(() => {
    console.log('showGroupModal mudou para:', showGroupModal);
  }, [showGroupModal]);

  const [showAddTransaction, setShowAddTransaction] = useState(false);
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
      // Não fechar se o modal estiver aberto ou se clicou em um modal
      if (showGroupModal || event.target.closest('.modal-overlay')) {
        return;
      }
      
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showGroupModal]);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/expenses', label: 'Transações', icon: FiCreditCard },
    { path: '/goals', label: 'Metas', icon: FiTarget },
    { path: '/reports', label: 'Relatórios', icon: FiBarChart }
  ];

  return (
    <>
      {/* Header principal */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <Logo size="w-8 h-8" showBackground={true} />
                <span className="font-bold text-xl text-gray-900 dark:text-gray-100">Entre Nós</span>
              </Link>
            </div>

            {/* Menu de navegação - Desktop */}
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

              {/* Botão de Nova Transação - Desktop */}
              <button
                onClick={() => setShowAddTransaction(true)}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white rounded-md text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                title="Nova Transação"
              >
                <FiPlus className="mr-2" size={18} />
                Nova Transação
              </button>


              {/* Perfil do usuário e toggle de tema - Desktop */}
              <div className="flex items-center space-x-3">
                {/* Toggle de tema */}
                <button
                  onClick={toggleTheme}
                  className="theme-toggle p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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

                    {/* Dropdown Desktop */}
                    {showDropdown && (
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-[100]">
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

            {/* Header Mobile - Apenas perfil e tema */}
            <div className="md:hidden flex items-center space-x-3">
              {/* Toggle de tema mobile */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
              >
                {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
              </button>

              {/* Perfil mobile */}
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

                  {/* Dropdown Mobile */}
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-[100]">
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

                        {/* Opções do grupo mobile */}
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
        </div>
      </nav>

      {/* Bottom Navigation - Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40">
        <div className="grid grid-cols-5 items-center py-2 relative">
          {/* Primeira metade dos itens */}
          {navItems.slice(0, 2).map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`bottom-nav-item flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors duration-200 min-h-[60px] ${isActive(item.path)
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
              >
                <IconComponent size={20} />
                <span className="text-xs mt-1 font-medium text-center leading-tight">{item.label}</span>
              </Link>
            );
          })}

          {/* Botão central de adicionar transação */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowAddTransaction(true)}
              className="floating-add-btn relative -top-4 w-14 h-14 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center border-4 border-white dark:border-gray-800"
              title="Nova Transação"
            >
              <FiPlus size={24} className="font-bold" />
            </button>
          </div>

          {/* Segunda metade dos itens */}
          {navItems.slice(2).map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`bottom-nav-item flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors duration-200 min-h-[60px] ${isActive(item.path)
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
              >
                <IconComponent size={20} />
                <span className="text-xs mt-1 font-medium text-center leading-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Modal de ações do grupo */}
      <GroupActionModal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
      />

      {/* Modal de adicionar transação */}
      <AddTransactionModal
        isOpen={showAddTransaction}
        onClose={() => setShowAddTransaction(false)}
      />
    </>
  );
}