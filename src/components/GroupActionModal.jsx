import { useState } from 'react';
import { FiUsers, FiUserPlus, FiX, FiArrowLeft } from 'react-icons/fi';
import Modal from './Modal';
import GroupInviteModal from './GroupInviteModal';
import JoinGroupModal from './JoinGroupModal';

export default function GroupActionModal({ isOpen, onClose }) {
  const [selectedAction, setSelectedAction] = useState(null);

  const handleClose = () => {
    setSelectedAction(null);
    onClose();
  };

  const handleBackToSelection = () => {
    setSelectedAction(null);
  };

  // Se uma ação foi selecionada, mostrar o modal correspondente
  if (selectedAction === 'invite') {
    return (
      <GroupInviteModal
        isOpen={isOpen}
        onClose={handleClose}
        onBack={handleBackToSelection}
      />
    );
  }

  if (selectedAction === 'join') {
    return (
      <JoinGroupModal
        isOpen={isOpen}
        onClose={handleClose}
        onBack={handleBackToSelection}
      />
    );
  }

  // Modal de seleção de ação
  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <FiUsers className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Gerenciar Grupo
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                O que você gostaria de fazer?
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Opção: Convidar para o grupo atual */}
          <button
            onClick={() => setSelectedAction('invite')}
            className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                <FiUserPlus className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Convidar Alguém
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gerar código para convidar pessoa para seu grupo atual
                </p>
              </div>
            </div>
          </button>

          {/* Opção: Entrar em outro grupo */}
          <button
            onClick={() => setSelectedAction('join')}
            className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                <FiUsers className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Entrar em Grupo
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Usar código de convite para ingressar em outro grupo
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            💡 Como funciona?
          </h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• <strong>Convidar:</strong> Gera um código único para seu grupo</li>
            <li>• <strong>Entrar:</strong> Use um código recebido de outra pessoa</li>
            <li>• Todos os membros têm acesso total aos dados</li>
            <li>• Ideal para casais, famílias ou parceiros de negócio</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}