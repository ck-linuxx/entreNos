import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions } from '../contexts/TransactionsContext';
import { useGroup } from '../contexts/GroupContext';
import { FiPlus, FiTrash2, FiCheck, FiClock, FiDollarSign } from 'react-icons/fi';
import Modal from '../components/Modal';
import CategorySelector from '../components/CategorySelector';

export default function Expenses() {
  const { user } = useAuth();
  const { transactions, loading, addTransaction, updateTransaction, deleteTransaction, fetchTransactions } = useTransactions();
  const { groupMembers, currentGroup } = useGroup();

  // Função para obter o nome do usuário logado
  const getUserName = () => {
    if (!user) return 'Usuário';
    return user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Usuário';
  };

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'Outros',
    paid_by: '',
    split_type: 'igual',
    is_paid: false,
    date: new Date().toISOString().split('T')[0],
    custom_splits: {},
    individual_amounts: {}
  });

  // Função para obter todos os membros do grupo incluindo o usuário atual
  const getAllMembers = () => {
    const members = [...(groupMembers || [])];

    // Verificar se o usuário atual já está na lista
    const currentUserExists = members.some(member => member.userId === user?.id);

    if (!currentUserExists && user) {
      members.unshift({
        userId: user.id,
        name: getUserName(),
        role: 'current_user'
      });
    }

    return members;
  };

  // Função para calcular divisão automática em porcentagem
  const calculateEqualSplit = (members) => {
    const numMembers = members.length;
    if (numMembers === 0) return {};

    const equalPercentage = 100 / numMembers;
    const splits = {};

    members.forEach(member => {
      splits[member.userId] = equalPercentage;
    });

    return splits;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };

      // Se mudou o tipo de divisão, recalcular divisões
      if (name === 'split_type') {
        const members = getAllMembers();
        if (newData.split_type === 'igual') {
          newData.custom_splits = calculateEqualSplit(members);
        }
      }

      // Se mudou o valor total, recalcular valores individuais
      if (name === 'amount' && newData.custom_splits) {
        const totalAmount = parseFloat(value) || 0;
        const individualAmounts = {};

        Object.entries(newData.custom_splits).forEach(([userId, percentage]) => {
          individualAmounts[userId] = (totalAmount * percentage / 100);
        });

        newData.individual_amounts = individualAmounts;
      }

      return newData;
    });
  };

  // Função para atualizar divisão personalizada em porcentagem
  const handleCustomSplitChange = (userId, percentage) => {
    const numericPercentage = parseFloat(percentage) || 0;

    setFormData(prev => {
      const newSplits = {
        ...prev.custom_splits,
        [userId]: numericPercentage
      };

      // Calcular valores individuais se o valor total estiver disponível
      const totalAmount = parseFloat(prev.amount) || 0;
      const individualAmounts = {};

      if (totalAmount > 0) {
        Object.entries(newSplits).forEach(([id, percent]) => {
          individualAmounts[id] = (totalAmount * percent / 100);
        });
      }

      return {
        ...prev,
        custom_splits: newSplits,
        individual_amounts: individualAmounts
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.name && formData.amount) {
      // Validar porcentagens se for divisão personalizada
      if (formData.split_type === 'personalizado') {
        const totalPercentage = Object.values(formData.custom_splits).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
        if (Math.abs(totalPercentage - 100) >= 0.1) {
          alert(`As porcentagens devem somar 100%. Atualmente somam ${totalPercentage.toFixed(1)}%.`);
          return;
        }
      }

      try {
        const transactionData = {
          name: formData.name,
          amount: parseFloat(formData.amount),
          category: formData.category || 'Outros',
          paid_by: formData.paid_by || null,
          is_paid: formData.is_paid,
          split_type: formData.split_type,
          date: formData.date,
          custom_splits: formData.split_type === 'personalizado' ? formData.custom_splits : {},
          individual_amounts: formData.individual_amounts || {}
        };

        const { data, error } = await addTransaction(transactionData);

        if (error) {
          console.error('Erro ao salvar transação:', error);
          alert('Erro ao salvar transação. Tente novamente.');
          return;
        }

        // Limpar formulário após sucesso
        setFormData({
          name: '',
          amount: '',
          category: 'Outros',
          paid_by: '',
          split_type: 'igual',
          is_paid: false,
          date: new Date().toISOString().split('T')[0],
          custom_splits: {},
          individual_amounts: {}
        });
        setShowForm(false);

        // Feedback de sucesso
        console.log('Transação salva com sucesso:', data);

      } catch (error) {
        console.error('Erro inesperado:', error);
        alert('Erro inesperado. Tente novamente.');
      }
    }
  };

  const togglePaidStatus = async (transactionId) => {
    try {
      const transaction = transactions.find(t => t.id === transactionId);
      if (!transaction) {
        console.error('Transação não encontrada:', transactionId);
        alert('Transação não encontrada.');
        return;
      }

      console.log('🔄 Alterando status da transação:', {
        id: transactionId,
        name: transaction.name,
        currentStatus: transaction.is_paid,
        newStatus: !transaction.is_paid,
        userLogged: getUserName(),
        groupId: currentGroup?.id
      });

      // Determinar novos valores
      const newStatus = !transaction.is_paid;
      const newPaidBy = newStatus ? getUserName() : null;

      console.log('📝 Dados da atualização que serão enviados:', {
        transactionId: transactionId,
        is_paid: newStatus,
        paid_by: newPaidBy,
        currentGroup: currentGroup?.id
      });

      // Atualizar transação
      const result = await updateTransaction(transactionId, {
        is_paid: newStatus,
        paid_by: newPaidBy
      });

      if (result.error) {
        console.error('❌ Erro na atualização:', result.error);
        alert(`Erro ao alterar status da transação: ${result.error}`);
        return;
      }

      console.log('✅ Transação atualizada com sucesso:', result.data);

    } catch (error) {
      console.error('💥 Erro inesperado ao atualizar status do pagamento:', error);
      alert('Erro inesperado ao atualizar o pagamento. Tente novamente.');
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        const { error } = await deleteTransaction(transactionId);

        if (error) {
          console.error('Erro ao excluir transação:', error);
          alert('Erro ao excluir transação. Tente novamente.');
        }
      } catch (error) {
        console.error('Erro inesperado:', error);
        alert('Erro inesperado. Tente novamente.');
      }
    }
  };

  // Debug: verificar transações
  console.log('🔍 Estado atual das transações:', {
    total: transactions.length,
    pagas: transactions.filter(t => t.is_paid).length,
    pendentes: transactions.filter(t => !t.is_paid).length,
    usuario: getUserName(),
    grupo: currentGroup?.id,
    samples: transactions.slice(0, 3).map(t => ({
      id: t.id,
      name: t.name,
      is_paid: t.is_paid,
      paid_by: t.paid_by,
      amount: t.amount
    }))
  });

  // Calcular estatísticas das transações
  const totalExpenses = transactions.reduce((acc, t) => acc + t.amount, 0);
  const paidExpenses = transactions.filter(t => t.is_paid).reduce((acc, t) => acc + t.amount, 0);
  const pendingExpenses = totalExpenses - paidExpenses;

  return (
    <div className="max-w-7xl mx-auto p-6 main-content">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Despesas Compartilhadas</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie as transações financeiras</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary mt-4 sm:mt-0 flex items-center"
        >
          <FiPlus className="mr-2" size={18} />
          Nova Transação
        </button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total de Despesas</p>
              <p className="text-2xl font-bold">
                R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <FiDollarSign className="text-3xl opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Já Pagas</p>
              <p className="text-2xl font-bold">
                R$ {paidExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <FiCheck className="text-3xl opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Pendentes</p>
              <p className="text-2xl font-bold">
                R$ {pendingExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <FiClock className="text-3xl opacity-80" />
          </div>
        </div>
      </div>

      {/* Lista de despesas */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Lista de Despesas</h2>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Carregando transações...</p>
            </div>
          ) : transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`p-5 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${transaction.is_paid
                  ? 'border-green-200 dark:border-green-700 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10'
                  : 'border-orange-200 dark:border-orange-700 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10'
                  }`}
              >
                <div className="flex flex-col">
                  <div className="relative mb-3">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 pr-20">{transaction.name}</h3>
                    <span className={`absolute top-0 right-0 inline-flex items-center px-2 py-1 text-xs font-medium rounded-lg ${transaction.is_paid
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}>
                      {transaction.is_paid ? (
                        <>
                          <FiCheck className="mr-1" size={12} />
                          Pago
                        </>
                      ) : (
                        <>
                          <FiClock className="mr-1" size={12} />
                          Pendente
                        </>
                      )}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {/* Informações básicas compactas */}
                    <div className="flex flex-wrap gap-4 mb-3 text-sm text-gray-600 dark:text-gray-400">
                      <span><strong className="text-gray-900 dark:text-gray-100">R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
                      <span>•</span>
                      <span>{transaction.category}</span>
                      <span>•</span>
                      <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                      {transaction.paid_by && (
                        <>
                          <span>•</span>
                          <span>Pago por <strong className="text-gray-900 dark:text-gray-100">{transaction.paid_by}</strong></span>
                        </>
                      )}
                    </div>

                    {/* Divisão Personalizada */}
                    {transaction.split_type === 'personalizado' && transaction.individual_amounts && Object.keys(transaction.individual_amounts).length > 0 && (
                      <>
                        <div className={`text-xs font-medium mb-2 ${transaction.is_paid
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-orange-700 dark:text-orange-300'
                          }`}>Divisão personalizada:</div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {Object.entries(transaction.individual_amounts).map(([userId, amount]) => {
                            const member = getAllMembers().find(m => m.userId === userId);
                            const percentage = transaction.custom_splits?.[userId] || 0;
                            return (
                              <div key={userId} className={`flex items-center justify-between rounded px-2 py-1 ${transaction.is_paid
                                ? 'bg-green-200/30 dark:bg-green-700/20'
                                : 'bg-orange-200/30 dark:bg-orange-700/20'
                                }`}>
                                <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                                  {member?.name || 'Usuário'}
                                </span>
                                <div className="text-right ml-2">
                                  <div className={`text-xs font-semibold ${transaction.is_paid
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-orange-600 dark:text-orange-400'
                                    }`}>
                                    R$ {parseFloat(amount).toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {/* Divisão Igual */}
                    {(!transaction.split_type || transaction.split_type === 'igual') && getAllMembers().length > 0 && (
                      <div className="flex items-center justify-between">
                        <div className={`text-xs ${transaction.is_paid
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-orange-700 dark:text-orange-300'
                          }`}>
                          Divisão igual entre {getAllMembers().length} {getAllMembers().length === 1 ? 'pessoa' : 'pessoas'}
                        </div>
                        <div className={`text-sm font-semibold ${transaction.is_paid
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-orange-600 dark:text-orange-400'
                          }`}>
                          R$ {(transaction.amount / getAllMembers().length).toFixed(2)} cada
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Botões alinhados à direita */}
                  <div className="flex justify-end items-center space-x-2 mt-3">
                    <button
                      onClick={() => togglePaidStatus(transaction.id)}
                      className={`btn text-sm flex items-center ${transaction.is_paid
                        ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
                        : 'btn-secondary'
                        }`}
                    >
                      {transaction.is_paid ? (
                        <>
                          <FiClock className="mr-1" size={16} />
                          Marcar Pendente
                        </>
                      ) : (
                        <>
                          <FiCheck className="mr-1" size={16} />
                          Marcar como Pago
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="btn bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-600 text-sm flex items-center"
                    >
                      <FiTrash2 className="mr-1" size={16} />
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <FiDollarSign className="text-6xl mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">Nenhuma transação cadastrada ainda</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Clique em "Nova Transação" para começar</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal do formulário */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Nova Transação"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome da Transação *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Ex: Supermercado, Conta de luz..."
              required
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Valor Total *
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              className="input-field"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoria
            </label>
            <CategorySelector
              value={formData.category}
              onChange={handleInputChange}
              name="category"
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="paid_by" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quem Pagou
            </label>
            <select
              id="paid_by"
              name="paid_by"
              value={formData.paid_by}
              onChange={handleInputChange}
              className="input-field"
            >
              <option value="">Ainda não foi pago</option>
              {getAllMembers().map((member) => (
                <option key={member.userId} value={member.name}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="split_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Como Dividir
            </label>
            <select
              id="split_type"
              name="split_type"
              value={formData.split_type}
              onChange={handleInputChange}
              className="input-field"
            >
              <option value="igual">Dividir Igualmente</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>

          {/* Mostrar divisão personalizada se selecionado */}
          {formData.split_type === 'personalizado' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Divisão por Porcentagem
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const members = getAllMembers();
                    const equalPercentage = (100 / members.length).toFixed(1);
                    const newSplits = {};
                    members.forEach(member => {
                      newSplits[member.userId] = parseFloat(equalPercentage);
                    });
                    setFormData(prev => ({ ...prev, custom_splits: newSplits }));
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                >
                  Dividir Igualmente
                </button>
              </div>
              <div className="space-y-2">
                {getAllMembers().map((member) => {
                  const percentage = formData.custom_splits[member.userId] || 0;
                  const amount = formData.amount ? (parseFloat(formData.amount) * percentage / 100) : 0;

                  return (
                    <div key={member.userId} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {member.name}
                        </span>
                        {formData.amount && percentage > 0 && (
                          <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                            R$ {amount.toFixed(2)}
                          </div>
                        )}
                        {percentage > 0 && !formData.amount && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Digite o valor total para ver o valor individual
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={formData.custom_splits[member.userId] || ''}
                          onChange={(e) => {
                            let value = parseFloat(e.target.value) || 0;
                            // Limitar a 100%
                            if (value > 100) value = 100;
                            if (value < 0) value = 0;
                            handleCustomSplitChange(member.userId, value.toString());
                          }}
                          className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-right"
                          placeholder="0"
                        />
                        <span className="text-sm text-gray-500">%</span>
                      </div>
                    </div>
                  );
                })}
                {/* Resumo das Porcentagens */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      Total das porcentagens:
                    </span>
                    <span className={`text-sm font-medium ${Math.abs(Object.values(formData.custom_splits).reduce((sum, val) => sum + (parseFloat(val) || 0), 0) - 100) < 0.1
                      ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                      {Object.values(formData.custom_splits).reduce((sum, val) => sum + (parseFloat(val) || 0), 0).toFixed(1)}%
                    </span>
                  </div>
                  {Math.abs(Object.values(formData.custom_splits).reduce((sum, val) => sum + (parseFloat(val) || 0), 0) - 100) >= 0.1 && (
                    <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {Object.values(formData.custom_splits).reduce((sum, val) => sum + (parseFloat(val) || 0), 0) > 100
                        ? `Excesso de ${(Object.values(formData.custom_splits).reduce((sum, val) => sum + (parseFloat(val) || 0), 0) - 100).toFixed(1)}%`
                        : `Faltam ${(100 - Object.values(formData.custom_splits).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)).toFixed(1)}%`
                      }
                    </div>
                  )}
                </div>

                {/* Resumo dos Valores Individuais */}
                {formData.amount && formData.individual_amounts && Object.keys(formData.individual_amounts).length > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                      Resumo da Divisão
                    </h4>
                    <div className="space-y-1">
                      {getAllMembers().map(member => {
                        const amount = formData.individual_amounts[member.userId] || 0;
                        const percentage = formData.custom_splits[member.userId] || 0;
                        if (percentage > 0) {
                          return (
                            <div key={member.userId} className="flex justify-between text-sm">
                              <span className="text-green-700 dark:text-green-300">{member.name}:</span>
                              <span className="font-semibold text-green-800 dark:text-green-200">
                                R$ {amount.toFixed(2)} ({percentage}%)
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })}
                      <div className="border-t border-green-200 dark:border-green-700 pt-1 mt-2">
                        <div className="flex justify-between text-sm font-bold">
                          <span className="text-green-700 dark:text-green-300">Total:</span>
                          <span className="text-green-800 dark:text-green-200">
                            R$ {parseFloat(formData.amount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mostrar divisão automática se igual */}
          {formData.split_type === 'igual' && formData.amount && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Divisão por Pessoa
              </label>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  Cada pessoa paga: <strong>R$ {getAllMembers().length > 0 ? (parseFloat(formData.amount) / getAllMembers().length).toFixed(2) : '0.00'}</strong>
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Total de {getAllMembers().length} {getAllMembers().length === 1 ? 'pessoa' : 'pessoas'}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_paid"
              name="is_paid"
              checked={formData.is_paid}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded"
            />
            <label htmlFor="is_paid" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Transação já foi paga
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 btn bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 btn btn-primary"
            >
              Salvar Transação
            </button>
          </div>
        </form>
      </Modal>


    </div>
  );
}