import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions } from '../contexts/TransactionsContext';
import { useGroup } from '../contexts/GroupContext';
import { FiPlus, FiTrash2, FiCheck, FiClock, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import AddTransactionModal from '../components/AddTransactionModal';

export default function Income() {
  const { user } = useAuth();
  const { transactions, loading, updateTransaction, deleteTransaction } = useTransactions();
  const { groupMembers, currentGroup } = useGroup();
  const [showAddModal, setShowAddModal] = useState(false);

  // Função para obter o nome do usuário logado
  const getUserName = () => {
    if (!user) return 'Usuário';
    return user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Usuário';
  };

  // Função para obter todos os membros do grupo
  const getAllMembers = () => {
    if (groupMembers && groupMembers.length > 1) {
      return groupMembers;
    }

    const currentUserMember = {
      userId: user?.id,
      name: getUserName(),
      email: user?.email
    };

    if (!groupMembers || groupMembers.length === 0) {
      return [currentUserMember];
    }

    const userExists = groupMembers.some(member => member.userId === user?.id);
    
    if (userExists) {
      return groupMembers;
    } else {
      return [currentUserMember, ...groupMembers];
    }
  };

  const togglePaidStatus = async (transactionId) => {
    try {
      const transaction = transactions.find(t => t.id === transactionId);
      if (!transaction) {
        alert('Transação não encontrada.');
        return;
      }

      const newStatus = !transaction.is_paid;
      const newPaidBy = newStatus ? getUserName() : null;

      const result = await updateTransaction(transactionId, {
        is_paid: newStatus,
        paid_by: newPaidBy
      });

      if (result.error) {
        alert(`Erro ao alterar status da transação: ${result.error}`);
        return;
      }

    } catch (error) {
      console.error('Erro inesperado ao atualizar status do pagamento:', error);
      alert('Erro inesperado ao atualizar o pagamento. Tente novamente.');
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (window.confirm('Tem certeza que deseja excluir esta receita?')) {
      try {
        const { error } = await deleteTransaction(transactionId);

        if (error) {
          console.error('Erro ao excluir receita:', error);
          alert('Erro ao excluir receita. Tente novamente.');
        }
      } catch (error) {
        console.error('Erro inesperado:', error);
        alert('Erro inesperado. Tente novamente.');
      }
    }
  };

  // Filtrar apenas receitas
  const incomeTransactions = transactions.filter(t => t.type === 'income');

  // Calcular estatísticas das receitas
  const totalIncome = incomeTransactions.reduce((acc, t) => acc + t.amount, 0);
  const paidIncome = incomeTransactions.filter(t => t.is_paid).reduce((acc, t) => acc + t.amount, 0);
  const pendingIncome = totalIncome - paidIncome;

  return (
    <div className="max-w-7xl mx-auto p-6 main-content">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-3">
            <FiTrendingUp className="text-4xl text-green-600" />
            Receitas
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie suas receitas e ganhos compartilhados</p>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium flex items-center gap-1">
                <FiTrendingUp size={16} />
                Total de Receitas
              </p>
              <p className="text-2xl font-bold">
                R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <FiTrendingUp className="text-3xl opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium flex items-center gap-1">
                <FiCheck size={16} />
                Recebidas
              </p>
              <p className="text-2xl font-bold">
                R$ {paidIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <FiCheck className="text-3xl opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium flex items-center gap-1">
                <FiClock size={16} />
                A Receber
              </p>
              <p className="text-2xl font-bold">
                R$ {pendingIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <FiClock className="text-3xl opacity-80" />
          </div>
        </div>
      </div>

      {/* Lista de receitas */}
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Suas Receitas</h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {incomeTransactions.length} {incomeTransactions.length === 1 ? 'receita' : 'receitas'}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Carregando receitas...</p>
          </div>
        ) : incomeTransactions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {incomeTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                  transaction.is_paid
                    ? 'border-green-200 dark:border-green-700 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10'
                    : 'border-orange-200 dark:border-orange-700 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10'
                }`}
              >
                {/* Header do Card */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FiTrendingUp className="text-2xl text-green-600" />
                    <div>
                      <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 leading-tight">
                        {transaction.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {transaction.category}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${transaction.is_paid
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                    }`}>
                    {transaction.is_paid ? (
                      <>
                        <FiCheck className="mr-1" size={10} />
                        Recebido
                      </>
                    ) : (
                      <>
                        <FiClock className="mr-1" size={10} />
                        A Receber
                      </>
                    )}
                  </span>
                </div>

                {/* Valor e Data */}
                <div className="mb-3">
                  <div className="text-2xl font-bold text-green-600">
                    +R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                    {transaction.paid_by && (
                      <span>Por: <strong>{transaction.paid_by}</strong></span>
                    )}
                  </div>
                </div>

                {/* Divisão */}
                <div className="mb-4">
                  {transaction.split_type === 'personalizado' && transaction.individual_amounts && Object.keys(transaction.individual_amounts).length > 0 ? (
                    <div>
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Divisão personalizada:
                      </div>
                      <div className="space-y-1">
                        {Object.entries(transaction.individual_amounts).slice(0, 2).map(([userId, amount]) => {
                          const member = getAllMembers().find(m => m.userId === userId);
                          return (
                            <div key={userId} className="flex justify-between text-xs">
                              <span className="text-gray-600 dark:text-gray-400 truncate">
                                {member?.name || 'Usuário'}
                              </span>
                              <span className="font-medium text-green-600">
                                +R$ {parseFloat(amount).toFixed(2)}
                              </span>
                            </div>
                          );
                        })}
                        {Object.keys(transaction.individual_amounts).length > 2 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            +{Object.keys(transaction.individual_amounts).length - 2} mais...
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    getAllMembers().length > 0 && (
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex justify-between">
                          <span>Divisão igual ({getAllMembers().length} pessoas)</span>
                          <span className="font-medium text-green-600">
                            +R$ {(transaction.amount / getAllMembers().length).toFixed(2)} cada
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-2">
                  <button
                    onClick={() => togglePaidStatus(transaction.id)}
                    className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1 ${
                      transaction.is_paid
                        ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {transaction.is_paid ? (
                      <>
                        <FiClock size={12} />
                        A Receber
                      </>
                    ) : (
                      <>
                        <FiCheck size={12} />
                        Receber
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteTransaction(transaction.id)}
                    className="py-2 px-3 bg-red-600 text-white hover:bg-red-700 text-xs font-medium rounded-lg transition-colors flex items-center justify-center"
                  >
                    <FiTrash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiTrendingUp className="text-6xl mb-4 text-gray-300 dark:text-gray-600 mx-auto" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Nenhuma receita cadastrada ainda
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              Clique no botão + para adicionar uma nova receita
            </p>
          </div>
        )}
      </div>

      {/* Botão flutuante para adicionar receita */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-50"
        title="Nova Receita"
      >
        <FiPlus size={24} />
      </button>

      {/* Modal de adicionar transação */}
      {showAddModal && (
        <AddTransactionModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          defaultType="income"
        />
      )}
    </div>
  );
}