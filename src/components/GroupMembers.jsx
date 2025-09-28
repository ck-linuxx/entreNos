import { useState } from 'react';
import { useGroup } from '../contexts/GroupContext';
import { useAuth } from '../contexts/AuthContext';
import { FiUsers, FiUserPlus, FiMoreVertical, FiTrash2, FiStar, FiUser } from 'react-icons/fi';

const GroupMembers = ({ showTitle = true, maxMembers = null }) => {
  const { groupMembers, currentGroup, removeMember } = useGroup();
  const { user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(null);

  if (!groupMembers || groupMembers.length === 0) {
    return null;
  }

  const displayMembers = maxMembers ? groupMembers.slice(0, maxMembers) : groupMembers;
  const hasMore = maxMembers && groupMembers.length > maxMembers;
  const isAdmin = currentGroup?.userRole === 'admin';

  const handleRemoveMember = async (memberId, memberName) => {
    if (window.confirm(`Tem certeza que deseja remover ${memberName} do grupo?`)) {
      try {
        await removeMember(memberId);
        setShowDropdown(null);
      } catch (error) {
        alert('Erro ao remover membro: ' + error.message);
      }
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <FiStar className="text-yellow-500" size={16} />;
      default:
        return <FiUser className="text-gray-500" size={16} />;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'member':
        return 'Membro';
      default:
        return 'Membro';
    }
  };

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FiUsers size={20} />
            Membros do Grupo ({groupMembers.length})
          </h3>
        </div>
      )}

      <div className="space-y-3">
        {displayMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-center space-x-3">
              {/* Avatar */}
              <div className="relative">
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-600 object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600">
                    <span className="text-white font-bold text-sm">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Indicador de role */}
                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-1">
                  {getRoleIcon(member.role)}
                </div>
              </div>

              {/* Informações do membro */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {member.name}
                    {member.userId === user?.id && (
                      <span className="text-xs text-blue-600 dark:text-blue-400 ml-1">(Você)</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{getRoleLabel(member.role)}</span>
                  {member.email && member.email !== 'Membro do grupo' && member.email !== 'Email não disponível' && (
                    <>
                      <span>•</span>
                      <span className="truncate">{member.email}</span>
                    </>
                  )}
                  {(!member.email || member.email === 'Membro do grupo') && member.userId !== user?.id && (
                    <>
                      <span>•</span>
                      <span className="text-gray-400">Membro do grupo</span>
                    </>
                  )}
                </div>
                {member.joinedAt && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Entrou em {new Date(member.joinedAt).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            </div>

            {/* Ações (apenas para admin e não para si mesmo) */}
            {isAdmin && member.userId !== user?.id && (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(showDropdown === member.id ? null : member.id)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <FiMoreVertical size={16} />
                </button>

                {showDropdown === member.id && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                    <button
                      onClick={() => handleRemoveMember(member.id, member.name)}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <FiTrash2 className="mr-2" size={14} />
                      Remover do grupo
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {hasMore && (
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              E mais {groupMembers.length - maxMembers} membros...
            </p>
          </div>
        )}
      </div>

      {/* Mensagem quando há apenas um membro */}
      {groupMembers.length === 1 && (
        <div className="text-center py-4">
          <FiUserPlus className="mx-auto text-gray-400 mb-2" size={24} />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Você é o único membro deste grupo.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Convide outras pessoas para começar a compartilhar despesas!
          </p>
        </div>
      )}
    </div>
  );
};

export default GroupMembers;