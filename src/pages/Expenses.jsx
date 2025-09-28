import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions } from '../contexts/TransactionsContext';
import { useGroup } from '../contexts/GroupContext';
import { FiPlus, FiTrash2, FiCheck, FiClock, FiDollarSign, FiCreditCard, FiTrendingUp } from 'react-icons/fi';
import Modal from '../components/Modal';
import CategorySelector from '../components/CategorySelector';

export default function Expenses() {
  const { user } = useAuth();
  const { transactions, loading, addTransaction, updateTransaction, deleteTransaction, fetchTransactions } = useTransactions();
  const { groupMembers, currentGroup } = useGroup();
  const [filter, setFilter] = useState('all');

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

      // Determinar novos valores
      const newStatus = !transaction.is_paid;
      const newPaidBy = newStatus ? getUserName() : null;

      // Atualizar transação
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

  // Filtrar transações baseado no filtro selecionado
  const filteredTransactions = transactions.filter(t => {
    if (filter === 'expenses') return t.type === 'expense' || !t.type;
    if (filter === 'income') return t.type === 'income';
    return true; // 'all'
  });

  // Calcular estatísticas das transações
  const expenses = transactions.filter(t => t.type === 'expense' || !t.type); // Incluir transações sem tipo como despesas
  const income = transactions.filter(t => t.type === 'income');
  
  const totalExpenses = expenses.reduce((acc, t) => acc + t.amount, 0);
  const totalIncome = income.reduce((acc, t) => acc + t.amount, 0);
  const paidExpenses = expenses.filter(t => t.is_paid).reduce((acc, t) => acc + t.amount, 0);
  const paidIncome = income.filter(t => t.is_paid).reduce((acc, t) => acc + t.amount, 0);
  const pendingExpenses = totalExpenses - paidExpenses;
  const pendingIncome = totalIncome - paidIncome;
  const netBalance = totalIncome - totalExpenses;

  return (
    <div className="max-w-7xl mx-auto p-6 main-content">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Transações Financeiras</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie despesas e receitas compartilhadas</p>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium flex items-center gap-1">
                <FiCreditCard size={16} />
                Despesas
              </p>
              <p className="text-xl font-bold">
                R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <FiDollarSign className="text-2xl opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium flex items-center gap-1">
                <FiTrendingUp size={16} />
                Receitas
              </p>
              <p className="text-xl font-bold">
                R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <FiCheck className="text-2xl opacity-80" />
          </div>
        </div>

        <div className={`card bg-gradient-to-br ${netBalance >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${netBalance >= 0 ? 'text-blue-100' : 'text-orange-100'} text-sm font-medium flex items-center gap-1`}>
                <FiDollarSign size={16} />
                Saldo
              </p>
              <p className="text-xl font-bold">
                R$ {netBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <FiDollarSign className="text-2xl opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-gray-500 to-gray-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-100 text-sm font-medium flex items-center gap-1">
                <FiClock size={16} />
                Pendentes
              </p>
              <p className="text-xl font-bold">
                R$ {(pendingExpenses + pendingIncome).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <FiClock className="text-2xl opacity-80" />
          </div>
        </div>
      </div>



      {/* Lista de transações */}
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Lista de Transações</h2>
          
          {/* Filtros */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Todas ({transactions.length})
            </button>
            <button
              onClick={() => setFilter('expenses')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                filter === 'expenses'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <FiCreditCard className="inline mr-1" size={14} />
              Despesas ({expenses.length})
            </button>
            <button
              onClick={() => setFilter('income')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                filter === 'income'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <FiTrendingUp className="inline mr-1" size={14} />
              Receitas ({income.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Carregando transações...</p>
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                  transaction.type === 'income'
                    ? transaction.is_paid
                      ? 'border-green-200 dark:border-green-700 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10'
                      : 'border-green-300 dark:border-green-600 bg-gradient-to-br from-green-100 to-green-200/50 dark:from-green-800/30 dark:to-green-700/20'
                    : transaction.is_paid
                      ? 'border-blue-200 dark:border-blue-700 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10'
                      : 'border-orange-200 dark:border-orange-700 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10'
                }`}
              >
                {/* Header do Card */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {transaction.type === 'income' ? (
                      <FiTrendingUp className="text-2xl text-green-600" />
                    ) : (
                      <FiCreditCard className="text-2xl text-red-600" />
                    )}
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
                        Pago
                      </>
                    ) : (
                      <>
                        <FiClock className="mr-1" size={10} />
                        Pendente
                      </>
                    )}
                  </span>
                </div>

                {/* Valor e Data */}
                <div className="mb-3">
                  <div className={`text-2xl font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                R$ {parseFloat(amount).toFixed(2)}
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
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            R$ {(transaction.amount / getAllMembers().length).toFixed(2)} cada
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
                        Pendente
                      </>
                    ) : (
                      <>
                        <FiCheck size={12} />
                        Pagar
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
            <div className="text-6xl mb-4 flex justify-center">
              {filter === 'expenses' ? (
                <FiCreditCard className="text-gray-300 dark:text-gray-600" />
              ) : filter === 'income' ? (
                <FiTrendingUp className="text-gray-300 dark:text-gray-600" />
              ) : (
                <FiDollarSign className="text-gray-300 dark:text-gray-600" />
              )}
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {filter === 'all' 
                ? 'Nenhuma transação cadastrada ainda'
                : filter === 'expenses'
                ? 'Nenhuma despesa encontrada'
                : 'Nenhuma receita encontrada'
              }
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              {filter === 'all' 
                ? 'Clique no botão + para adicionar uma nova transação'
                : `Altere o filtro ou adicione uma nova ${filter === 'expenses' ? 'despesa' : 'receita'}`
              }
            </p>
          </div>
        )}
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