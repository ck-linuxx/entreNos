import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions } from '../contexts/TransactionsContext';
import { useGroup } from '../contexts/GroupContext';
import { FiX, FiDollarSign } from 'react-icons/fi';
import Modal from './Modal';
import CategorySelector from './CategorySelector';

export default function AddTransactionModal({ isOpen, onClose, defaultType = 'expense' }) {
  const { user } = useAuth();
  const { addTransaction } = useTransactions();
  const { groupMembers } = useGroup();

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    type: defaultType,
    category: 'Alimentação',
    date: new Date().toISOString().split('T')[0],
    paid_by: '',
    split_type: 'igual',
    custom_splits: {},
    is_paid: false,
    individual_amounts: {}
  });

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
    // Se há membros do grupo (mais de 1 pessoa), usar apenas os dados do grupo
    if (groupMembers && groupMembers.length > 1) {
      return groupMembers;
    }

    // Se não há grupo ou é só o usuário atual, incluir o usuário atual
    const currentUserMember = {
      userId: user?.id,
      name: getUserName(),
      email: user?.email
    };

    if (!groupMembers || groupMembers.length === 0) {
      return [currentUserMember];
    }

    // Verificar se o usuário atual já está na lista
    const userExists = groupMembers.some(member => member.userId === user?.id);

    if (userExists) {
      return groupMembers;
    } else {
      return [currentUserMember, ...groupMembers];
    }
  };

  // Função para formatar valor monetário brasileiro
  const formatCurrency = (value) => {
    // Remove tudo que não é dígito
    const numericValue = value.replace(/\D/g, '');

    // Se não há valor, retorna vazio
    if (!numericValue) return '';

    // Converte para número e divide por 100 para ter centavos
    const numberValue = parseFloat(numericValue) / 100;

    // Formata no padrão brasileiro
    return numberValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Função para converter valor formatado para número
  const parseCurrencyToNumber = (formattedValue) => {
    if (!formattedValue) return 0;

    // Remove pontos de milhares e substitui vírgula por ponto
    const numericString = formattedValue
      .replace(/\./g, '') // Remove pontos de milhares
      .replace(',', '.'); // Substitui vírgula por ponto

    return parseFloat(numericString) || 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'amount') {
      // Formatação especial para o campo de valor
      const formattedValue = formatCurrency(value);
      setFormData(prev => ({ ...prev, [name]: formattedValue }));

      // Se está em modo personalizado, recalcular valores individuais
      if (formData.split_type === 'personalizado') {
        const numericValue = parseCurrencyToNumber(formattedValue);
        const newIndividualAmounts = {};
        Object.entries(formData.custom_splits).forEach(([userId, percentage]) => {
          newIndividualAmounts[userId] = numericValue * (parseFloat(percentage) || 0) / 100;
        });
        setFormData(prev => ({ ...prev, individual_amounts: newIndividualAmounts }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCustomSplitChange = (userId, percentage) => {
    const newSplits = { ...formData.custom_splits, [userId]: parseFloat(percentage) || 0 };
    const newIndividualAmounts = {};

    // Converter o valor formatado para número antes de calcular
    const numericAmount = parseCurrencyToNumber(formData.amount);

    Object.entries(newSplits).forEach(([id, perc]) => {
      newIndividualAmounts[id] = numericAmount * (parseFloat(perc) || 0) / 100;
    });

    setFormData(prev => ({
      ...prev,
      custom_splits: newSplits,
      individual_amounts: newIndividualAmounts
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validações
      if (!formData.name.trim()) {
        alert('Nome da transação é obrigatório');
        return;
      }

      const numericAmount = parseCurrencyToNumber(formData.amount);
      if (!formData.amount || numericAmount <= 0) {
        alert('Valor deve ser maior que zero');
        return;
      }

      // Validar divisão personalizada
      if (formData.split_type === 'personalizado') {
        const totalPercentage = Object.values(formData.custom_splits).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
        if (Math.abs(totalPercentage - 100) >= 0.1) {
          alert('A soma das porcentagens deve ser 100%');
          return;
        }
      }

      // Preparar dados da transação
      const transactionData = {
        name: formData.name.trim(),
        amount: numericAmount, // Usar o valor numérico convertido
        type: formData.type,
        category: formData.category,
        date: formData.date,
        paid_by: formData.paid_by || null,
        split_type: formData.split_type,
        is_paid: formData.is_paid,
        custom_splits: formData.split_type === 'personalizado' ? formData.custom_splits : null,
        individual_amounts: formData.split_type === 'personalizado' ? formData.individual_amounts : {}
      };

      await addTransaction(transactionData);

      // Reset form
      setFormData({
        name: '',
        amount: '',
        type: defaultType,
        category: 'Alimentação',
        date: new Date().toISOString().split('T')[0],
        paid_by: '',
        split_type: 'igual',
        custom_splits: {},
        is_paid: false,
        individual_amounts: {}
      });

      onClose();

    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      alert('Erro ao adicionar transação. Tente novamente.');
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      name: '',
      amount: '',
      type: defaultType,
      category: 'Alimentação',
      date: new Date().toISOString().split('T')[0],
      paid_by: '',
      split_type: 'igual',
      custom_splits: {},
      is_paid: false,
      individual_amounts: {}
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <FiDollarSign className="text-yellow-600 dark:text-yellow-400" size={18} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                Nova Transação
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {formData.type === 'expense' ? 'Adicione uma nova despesa' : 'Adicione uma nova receita'}
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

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome da Transação *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 sm:p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Supermercado, Conta de luz..."
              required
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de Transação *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full p-2 sm:p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
            </select>
          </div>

          <div>
            <label htmlFor="amount" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Valor Total *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                R$
              </span>
              <input
                type="text"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0,00"
                required
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Digite apenas números. Ex: 1500 = R$ 15,00
            </p>
          </div>

          <div>
            <label htmlFor="category" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoria
            </label>
            <CategorySelector
              value={formData.category}
              onChange={handleInputChange}
              name="category"
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full p-2 sm:p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="paid_by" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quem Pagou
            </label>
            <select
              id="paid_by"
              name="paid_by"
              value={formData.paid_by}
              onChange={handleInputChange}
              className="w-full p-2 sm:p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label htmlFor="split_type" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Como Dividir
            </label>
            <select
              id="split_type"
              name="split_type"
              value={formData.split_type}
              onChange={handleInputChange}
              className="w-full p-2 sm:p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="igual">Dividir Igualmente</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>

          {/* Mostrar divisão personalizada se selecionado */}
          {formData.split_type === 'personalizado' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
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
                    <div key={member.userId} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 sm:p-3 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 block truncate">
                          {member.name}
                        </span>
                        {formData.amount && percentage > 0 && (
                          <div className="text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400">
                            R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        )}
                        {percentage > 0 && !formData.amount && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Digite o valor total para ver o valor individual
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-2">
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
                          className="w-12 sm:w-16 px-1 sm:px-2 py-1 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-right"
                          placeholder="0"
                        />
                        <span className="text-xs sm:text-sm text-gray-500">%</span>
                      </div>
                    </div>
                  );
                })}

                {/* Resumo das Porcentagens */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 sm:p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                      Total das porcentagens:
                    </span>
                    <span className={`text-xs sm:text-sm font-medium ${Math.abs(Object.values(formData.custom_splits).reduce((sum, val) => sum + (parseFloat(val) || 0), 0) - 100) < 0.1
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
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-2 sm:p-3">
                    <h4 className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                      Resumo da Divisão
                    </h4>
                    <div className="space-y-1">
                      {getAllMembers().map(member => {
                        const amount = formData.individual_amounts[member.userId] || 0;
                        const percentage = formData.custom_splits[member.userId] || 0;
                        if (percentage > 0) {
                          return (
                            <div key={member.userId} className="flex justify-between text-xs sm:text-sm">
                              <span className="text-green-700 dark:text-green-300 truncate mr-2">{member.name}:</span>
                              <span className="font-semibold text-green-800 dark:text-green-200 flex-shrink-0">
                                R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({percentage}%)
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })}
                      <div className="border-t border-green-200 dark:border-green-700 pt-1 mt-2">
                        <div className="flex justify-between text-xs sm:text-sm font-bold">
                          <span className="text-green-700 dark:text-green-300">Total:</span>
                          <span className="text-green-800 dark:text-green-200">
                            R$ {parseCurrencyToNumber(formData.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Divisão por Pessoa
              </label>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                  Cada pessoa paga: <strong>R$ {getAllMembers().length > 0 ? (parseCurrencyToNumber(formData.amount) / getAllMembers().length).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}</strong>
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
            <label htmlFor="is_paid" className="ml-2 block text-xs sm:text-sm text-gray-700 dark:text-gray-300">
              Transação já foi paga
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg font-medium transition-colors min-h-[44px]"
            >
              <span className="text-sm sm:text-base">Cancelar</span>
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white py-3 px-4 rounded-lg font-medium transition-colors min-h-[44px]"
            >
              <span className="text-sm sm:text-base">Salvar Transação</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}