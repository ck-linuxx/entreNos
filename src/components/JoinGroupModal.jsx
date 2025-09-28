import { useState } from 'react';
import { FiUserPlus, FiX, FiArrowRight, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import { useGroup } from '../contexts/GroupContext';
import Modal from './Modal';

export default function JoinGroupModal({ isOpen, onClose, onBack }) {
  const { joinGroup } = useGroup();
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inviteCode.trim()) {
      setError('Digite o código de convite');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const group = await joinGroup(inviteCode.trim());

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setInviteCode('');
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setInviteCode('');
    setError('');
    setSuccess(false);
    onClose();
  };

  if (success) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} size="sm">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUserPlus className="text-green-600 dark:text-green-400" size={24} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Bem-vindo ao grupo!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Você agora tem acesso aos dados compartilhados do grupo.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Voltar"
              >
                <FiArrowLeft size={20} />
              </button>
            )}
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <FiUserPlus className="text-green-600 dark:text-green-400" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Entrar em Grupo
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Digite o código de convite para ingressar
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Código de Convite
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => {
                setInviteCode(e.target.value.toUpperCase());
                setError('');
              }}
              placeholder="Ex: ABC123XY"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-center tracking-wider text-lg"
              maxLength={8}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
              <FiAlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              ⚠️ Importante
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Ao ingressar em um grupo, você sairá do seu grupo atual</li>
              <li>• Você terá acesso a todas as transações e metas do grupo</li>
              <li>• Todos os membros podem adicionar e editar dados</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg font-medium transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading || !inviteCode.trim()}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar no Grupo
                  <FiArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}