import { FiX, FiArrowLeft, FiUsers, FiInfo } from 'react-icons/fi';
import Modal from './Modal';
import GroupMembers from './GroupMembers';
import { useGroup } from '../contexts/GroupContext';

export default function GroupMembersModal({ isOpen, onClose, onBack }) {
  const { currentGroup } = useGroup();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                title="Voltar"
              >
                <FiArrowLeft size={18} />
              </button>
            )}
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <FiUsers className="text-blue-600 dark:text-blue-400" size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                Membros do Grupo
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                {currentGroup?.name || 'Carregando...'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          <GroupMembers showTitle={false} />
        </div>

        <div className="mt-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-1">
            <FiInfo size={14} />
            Informações do Grupo
          </h4>
          <ul className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Todos os membros podem adicionar e editar transações</li>
            <li>• Administradores podem convidar e remover membros</li>
            <li>• Os dados são compartilhados entre todos os membros</li>
            <li>• Para sair do grupo, use a opção "Entrar em Grupo" com um novo código</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}