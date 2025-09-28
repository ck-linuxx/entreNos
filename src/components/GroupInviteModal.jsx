import React, { useState } from 'react';
import { FiCopy, FiShare2, FiUsers, FiX, FiCheck, FiRefreshCw, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import { useGroup } from '../contexts/GroupContext';
import Modal from './Modal';

export default function GroupInviteModal({ isOpen, onClose, onBack }) {
  const { currentGroup, generateInviteCode, loading: groupLoading } = useGroup();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentCode, setCurrentCode] = useState('');
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState('');
  const [hasGeneratedCode, setHasGeneratedCode] = useState(false);

  // Gerar código automaticamente quando o modal abre
  const generateNewCode = async () => {
    if (!currentGroup || hasGeneratedCode) {
      console.log('generateNewCode: Pulando - currentGroup:', !!currentGroup, 'hasGeneratedCode:', hasGeneratedCode);
      setInitializing(false);
      return;
    }

    console.log('generateNewCode: Iniciando geração de código...');
    try {
      setLoading(true);
      setError('');
      const newCode = await generateInviteCode();
      setCurrentCode(newCode);
      setHasGeneratedCode(true);
      console.log('Código gerado com sucesso:', newCode);
    } catch (err) {
      console.error('Erro ao gerar código:', err);
      setError(err.message || 'Erro ao gerar código');
      setCurrentCode(currentGroup.invite_code || '');
      setHasGeneratedCode(true); // Evitar tentar novamente
    } finally {
      console.log('generateNewCode: Finalizando - setLoading(false)');
      setLoading(false);
      setInitializing(false);
    }
  };

  // Gerar código quando o modal abre (apenas quando abre)
  React.useEffect(() => {
    if (isOpen && !hasGeneratedCode) {
      setInitializing(true);
      setCurrentCode('');
      setError('');

      if (currentGroup && !groupLoading) {
        console.log('Gerando código para o grupo:', currentGroup);
        generateNewCode();
      } else if (groupLoading) {
        console.log('Aguardando GroupContext carregar...');
        setError('Carregando dados do grupo...');
        setInitializing(false);
      } else if (!currentGroup && !groupLoading) {
        console.log('Grupo não encontrado, aguardando...');
        // Aguardar um pouco para o grupo carregar
        const timeout = setTimeout(() => {
          if (currentGroup) {
            generateNewCode();
          } else {
            setError('Aguarde enquanto seu grupo está sendo criado...');
            setInitializing(false);
          }
        }, 2000);

        return () => clearTimeout(timeout);
      }
    }
  }, [isOpen, currentGroup, groupLoading, hasGeneratedCode]);

  // Reset quando modal fecha
  React.useEffect(() => {
    if (!isOpen) {
      setHasGeneratedCode(false);
      setCurrentCode('');
      setError('');
      setInitializing(true);
      setLoading(false);
    }
  }, [isOpen]);

  const handleCopyCode = async () => {
    const codeToUse = currentCode || currentGroup?.invite_code;
    if (!codeToUse) return;

    try {
      await navigator.clipboard.writeText(codeToUse);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar código:', err);
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = codeToUse;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    const codeToUse = currentCode || currentGroup?.invite_code;
    const shareText = `Entre no meu grupo financeiro Entre Nós! Use o código: ${codeToUse}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Convite Entre Nós',
          text: shareText
        });
      } catch (err) {
        console.error('Erro ao compartilhar:', err);
      }
    } else {
      // Fallback - copiar texto
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Erro ao copiar:', err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                title="Voltar"
              >
                <FiArrowLeft size={18} />
              </button>
            )}
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiUsers className="text-blue-600 dark:text-blue-400" size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
                Convidar para o Grupo
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

        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Código de Convite
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg font-mono text-base sm:text-lg text-center tracking-wider min-h-[44px] flex items-center justify-center">
                {(() => {
                  console.log('Estados do modal:', { initializing, loading, groupLoading, hasGeneratedCode, currentCode: !!currentCode });

                  if (initializing || loading || groupLoading) {
                    return (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
                        {groupLoading ? 'Carregando grupo...' : initializing ? 'Inicializando...' : 'Gerando...'}
                      </div>
                    );
                  } else if (currentCode) {
                    return <span className="text-blue-600 dark:text-blue-400 font-bold">{currentCode}</span>;
                  } else if (currentGroup?.invite_code) {
                    return <span className="text-gray-600 dark:text-gray-400">{currentGroup.invite_code}</span>;
                  } else {
                    return <span className="text-red-500">Erro ao carregar</span>;
                  }
                })()}
              </div>
              <button
                onClick={handleCopyCode}
                disabled={loading || groupLoading || initializing}
                className="p-2 sm:p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors flex items-center gap-2 min-w-[44px] justify-center"
                title="Copiar código"
              >
                {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
              <FiAlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
            <h3 className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Como funciona?
            </h3>
            <ul className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Compartilhe este código com a pessoa que deseja convidar</li>
              <li>• Ela deve usar o código na opção "Entrar em Grupo"</li>
              <li>• Após o ingresso, ambos terão acesso aos mesmos dados</li>
              <li>• Podem adicionar, editar e visualizar transações e metas</li>
              <li>• O código é único e gerado automaticamente</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleShare}
              disabled={loading || groupLoading || initializing}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 min-h-[44px]"
            >
              <FiShare2 size={16} />
              <span className="text-sm sm:text-base">Compartilhar</span>
            </button>

            <button
              onClick={generateNewCode}
              disabled={loading || groupLoading || initializing}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 min-h-[44px] sm:w-auto"
              title="Gerar novo código"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} size={16} />
              <span className="text-sm sm:text-base">{loading ? 'Gerando...' : 'Novo Código'}</span>
            </button>
          </div>

          {copied && (
            <div className="text-center text-green-600 dark:text-green-400 text-sm font-medium">
              ✓ Copiado para a área de transferência!
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}