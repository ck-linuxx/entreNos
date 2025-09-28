import React, { useState, useEffect } from 'react';
import { useGoals } from '../contexts/GoalsContext';
import CategorySelector from '../components/CategorySelector';
import {
  FiTarget,
  FiTrendingUp,
  FiDollarSign,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSave,
  FiX,
  FiCheckCircle,
  FiCalendar,
  FiTrendingDown,
  FiShoppingCart,
  FiTruck,
  FiHome,
  FiHeart,
  FiActivity,
  FiMoreHorizontal,
  FiBook
} from 'react-icons/fi';

export default function Goals() {
  const { goals, loading, addGoal, updateGoal, deleteGoal: removeGoal, addProgressToGoal, getGoalsStats } = useGoals();
  const [showForm, setShowForm] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [stats, setStats] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    category: 'Outros',
    targetDate: ''
  });

  const [progressData, setProgressData] = useState({
    amount: '',
    description: ''
  });

  useEffect(() => {
    loadStats();
  }, [goals]);

  const loadStats = async () => {
    try {
      const goalsStats = await getGoalsStats();
      setStats(goalsStats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleProgressInputChange = (e) => {
    setProgressData({
      ...progressData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.name && formData.targetAmount) {
      try {
        const goalData = {
          name: formData.name,
          target_amount: parseFloat(formData.targetAmount),
          category: formData.category,
          target_date: formData.targetDate || null,
          current_amount: formData.currentAmount ? parseFloat(formData.currentAmount) : 0
        };

        // Adiciona a meta com o valor inicial já incluído
        await addGoal(goalData);

        setFormData({
          name: '',
          targetAmount: '',
          currentAmount: '',
          category: 'Outros',
          targetDate: ''
        });
        setShowForm(false);
      } catch (error) {
        console.error('Erro ao criar meta:', error);
        alert('Erro ao criar meta. Tente novamente.');
      }
    }
  };

  const handleAddProgress = async (e) => {
    e.preventDefault();
    if (selectedGoal && progressData.amount) {
      try {
        await addProgressToGoal(
          selectedGoal.id,
          parseFloat(progressData.amount),
          progressData.description || 'Atualização de progresso'
        );
        setProgressData({ amount: '', description: '' });
        setShowProgressModal(false);
        setSelectedGoal(null);
      } catch (error) {
        console.error('Erro ao adicionar progresso:', error);
        alert('Erro ao adicionar progresso. Tente novamente.');
      }
    }
  };

  const handleDeleteGoal = async (goalId, goalName) => {
    if (confirm(`Tem certeza que deseja excluir a meta "${goalName}"?`)) {
      try {
        await removeGoal(goalId);
      } catch (error) {
        console.error('Erro ao excluir meta:', error);
        alert('Erro ao excluir meta. Tente novamente.');
      }
    }
  };

  // Função para obter ícone da categoria
  const getCategoryIcon = (category) => {
    const icons = {
      'Alimentação': FiShoppingCart,
      'Transporte': FiTruck,
      'Moradia': FiHome,
      'Lazer': FiHeart,
      'Saúde': FiActivity,
      'Educação': FiBook,
      'Investimentos': FiDollarSign,
      'Outros': FiMoreHorizontal
    };
    return icons[category] || FiMoreHorizontal;
  };

  // Função para obter cor da categoria
  const getCategoryColor = (category) => {
    const colors = {
      'Alimentação': 'text-green-600 bg-green-100',
      'Transporte': 'text-blue-600 bg-blue-100',
      'Moradia': 'text-yellow-600 bg-yellow-100',
      'Lazer': 'text-purple-600 bg-purple-100',
      'Saúde': 'text-red-600 bg-red-100',
      'Educação': 'text-indigo-600 bg-indigo-100',
      'Investimentos': 'text-emerald-600 bg-emerald-100',
      'Outros': 'text-gray-600 bg-gray-100'
    };
    return colors[category] || 'text-gray-600 bg-gray-100';
  };

  const totalTargetAmount = goals.reduce((acc, goal) => acc + goal.target_amount, 0);
  const totalCurrentAmount = goals.reduce((acc, goal) => acc + goal.current_amount, 0);
  const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="card">
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            {[1, 2].map(i => (
              <div key={i} className="card">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Metas Financeiras</h1>
          <p className="text-gray-600 dark:text-gray-400">Planeje e acompanhe seus objetivos conjuntos</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <FiPlus className="mr-2" size={18} />
          Nova Meta
        </button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Progresso Geral</p>
              <p className="text-3xl font-bold">{overallProgress.toFixed(0)}%</p>
              <p className="text-purple-200 text-xs">{goals.length} metas ativas</p>
            </div>
            <FiTrendingUp className="text-4xl opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Guardado</p>
              <p className="text-2xl font-bold">
                R$ {totalCurrentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-green-200 text-xs">
                Falta: R$ {(totalTargetAmount - totalCurrentAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <FiDollarSign className="text-4xl opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Meta Total</p>
              <p className="text-2xl font-bold">
                R$ {totalTargetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-blue-200 text-xs">
                {goals.filter(g => g.is_completed).length} concluídas
              </p>
            </div>
            <FiTarget className="text-4xl opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Próximas Metas</p>
              <p className="text-2xl font-bold">
                {goals.filter(g => g.target_date && new Date(g.target_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length}
              </p>
              <p className="text-orange-200 text-xs">nos próximos 30 dias</p>
            </div>
            <FiCalendar className="text-4xl opacity-80" />
          </div>
        </div>
      </div>

      {/* Lista de metas */}
      <div className="space-y-6">
        {goals.length > 0 ? (
          goals.map((goal) => {
            const progress = (goal.current_amount / goal.target_amount) * 100;
            const isCompleted = goal.is_completed;
            const CategoryIcon = getCategoryIcon(goal.category);
            const categoryColorClass = getCategoryColor(goal.category);

            return (
              <div key={goal.id} className="card">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4">
                  <div className="flex-1 mb-4 lg:mb-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`p-2 rounded-full ${categoryColorClass}`}>
                        <CategoryIcon size={20} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{goal.name}</h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{goal.category}</span>
                      </div>
                      {isCompleted && (
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-sm font-medium rounded-full">
                          <FiCheckCircle className="inline-block mr-1" /> Concluída!
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>Criada em {new Date(goal.created_at).toLocaleDateString('pt-BR')}</span>
                      {goal.target_date && (
                        <span className="flex items-center">
                          <FiCalendar className="mr-1" size={14} />
                          Meta: {new Date(goal.target_date).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedGoal(goal);
                        setShowProgressModal(true);
                      }}
                      className="btn btn-secondary text-sm flex items-center"
                      disabled={isCompleted}
                    >
                      <FiPlus className="mr-1" size={16} />
                      Adicionar Progresso
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id, goal.name)}
                      className="btn bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-600 text-sm flex items-center"
                    >
                      <FiTrash2 className="mr-1" size={16} />
                      Excluir
                    </button>
                  </div>
                </div>

                {/* Barra de progresso */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Progresso</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {progress.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${isCompleted
                        ? 'bg-gradient-to-r from-green-500 to-green-600'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500'
                        }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Valores */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Já Guardado</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      R$ {goal.current_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Falta</p>
                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      R$ {Math.max(0, goal.target_amount - goal.current_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Meta Total</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      R$ {goal.target_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="card text-center py-12">
            <FiTarget className="text-6xl mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">Nenhuma meta cadastrada ainda</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">Que tal criar sua primeira meta financeira conjunta?</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              Criar Primeira Meta
            </button>
          </div>
        )}
      </div>

      {/* Modal do formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Nova Meta</h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome da Meta *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Ex: Viagem, Casa nova, Carro..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categoria *
                  </label>
                  <CategorySelector
                    value={formData.category}
                    onChange={handleInputChange}
                    name="category"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Valor da Meta *
                    </label>
                    <input
                      type="number"
                      id="targetAmount"
                      name="targetAmount"
                      value={formData.targetAmount}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="0.00"
                      step="0.01"
                      min="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data Meta (opcional)
                    </label>
                    <input
                      type="date"
                      id="targetDate"
                      name="targetDate"
                      value={formData.targetDate}
                      onChange={handleInputChange}
                      className="input-field"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="currentAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quanto já guardaram? (opcional)
                  </label>
                  <input
                    type="number"
                    id="currentAmount"
                    name="currentAmount"
                    value={formData.currentAmount}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 btn bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center justify-center"
                  >
                    <FiX className="mr-1" size={16} />
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn btn-primary flex items-center justify-center"
                  >
                    <FiSave className="mr-1" size={16} />
                    Criar Meta
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Progresso */}
      {showProgressModal && selectedGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Adicionar Progresso
                </h3>
                <button
                  onClick={() => {
                    setShowProgressModal(false);
                    setSelectedGoal(null);
                    setProgressData({ amount: '', description: '' });
                  }}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`p-2 rounded-full ${getCategoryColor(selectedGoal.category)}`}>
                    {React.createElement(getCategoryIcon(selectedGoal.category), { size: 16 })}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{selectedGoal.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      R$ {selectedGoal.current_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de{' '}
                      R$ {selectedGoal.target_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{ width: `${Math.min((selectedGoal.current_amount / selectedGoal.target_amount) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <form onSubmit={handleAddProgress} className="space-y-4">
                <div>
                  <label htmlFor="progressAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Valor a Adicionar *
                  </label>
                  <input
                    type="number"
                    id="progressAmount"
                    name="amount"
                    value={progressData.amount}
                    onChange={handleProgressInputChange}
                    className="input-field"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    max={selectedGoal.target_amount - selectedGoal.current_amount}
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Máximo: R$ {(selectedGoal.target_amount - selectedGoal.current_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div>
                  <label htmlFor="progressDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descrição (opcional)
                  </label>
                  <input
                    type="text"
                    id="progressDescription"
                    name="description"
                    value={progressData.description}
                    onChange={handleProgressInputChange}
                    className="input-field"
                    placeholder="Ex: Depósito mensal, Economia do mês..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProgressModal(false);
                      setSelectedGoal(null);
                      setProgressData({ amount: '', description: '' });
                    }}
                    className="flex-1 btn bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center justify-center"
                  >
                    <FiX className="mr-1" size={16} />
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn btn-primary flex items-center justify-center"
                  >
                    <FiSave className="mr-1" size={16} />
                    Adicionar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}