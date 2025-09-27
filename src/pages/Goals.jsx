import { useState } from 'react';
import { useAppData } from '../hooks/useLocalStorage';

export default function Goals() {
  const { data, addGoal, updateGoals } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.targetAmount) {
      addGoal({
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount) || 0
      });
      setFormData({
        name: '',
        targetAmount: '',
        currentAmount: ''
      });
      setShowForm(false);
    }
  };

  const updateGoalAmount = (goalId, newAmount) => {
    const updatedGoals = data.goals.map(goal =>
      goal.id === goalId
        ? { ...goal, currentAmount: Math.min(parseFloat(newAmount) || 0, goal.targetAmount) }
        : goal
    );
    updateGoals(updatedGoals);
  };

  const deleteGoal = (goalId) => {
    const updatedGoals = data.goals.filter(goal => goal.id !== goalId);
    updateGoals(updatedGoals);
  };

  const totalTargetAmount = data.goals.reduce((acc, goal) => acc + goal.targetAmount, 0);
  const totalCurrentAmount = data.goals.reduce((acc, goal) => acc + goal.currentAmount, 0);
  const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Metas Financeiras</h1>
          <p className="text-gray-600">Planeje e acompanhe seus objetivos conjuntos</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <span className="mr-2">+</span>
          Nova Meta
        </button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Progresso Geral</p>
              <p className="text-3xl font-bold">{overallProgress.toFixed(0)}%</p>
            </div>
            <div className="text-4xl opacity-80">📊</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Guardado</p>
              <p className="text-2xl font-bold">
                R$ {totalCurrentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-4xl opacity-80">💰</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Meta Total</p>
              <p className="text-2xl font-bold">
                R$ {totalTargetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-4xl opacity-80">🎯</div>
          </div>
        </div>
      </div>

      {/* Lista de metas */}
      <div className="space-y-6">
        {data.goals.length > 0 ? (
          data.goals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const isCompleted = progress >= 100;

            return (
              <div key={goal.id} className="card">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4">
                  <div className="flex-1 mb-4 lg:mb-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{goal.name}</h3>
                      {isCompleted && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                          ✅ Concluída!
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600">
                      Criada em {new Date(goal.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const newAmount = prompt(
                          `Quanto vocês já guardaram para "${goal.name}"?`,
                          goal.currentAmount.toString()
                        );
                        if (newAmount !== null) {
                          updateGoalAmount(goal.id, newAmount);
                        }
                      }}
                      className="btn btn-secondary text-sm"
                    >
                      Atualizar Valor
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Tem certeza que deseja excluir a meta "${goal.name}"?`)) {
                          deleteGoal(goal.id);
                        }
                      }}
                      className="btn bg-red-600 text-white hover:bg-red-700 text-sm"
                    >
                      Excluir
                    </button>
                  </div>
                </div>

                {/* Barra de progresso */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">Progresso</span>
                    <span className="text-sm font-medium text-gray-900">
                      {progress.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
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
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">Já Guardado</p>
                    <p className="text-lg font-bold text-green-600">
                      R$ {goal.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">Falta</p>
                    <p className="text-lg font-bold text-orange-600">
                      R$ {Math.max(0, goal.targetAmount - goal.currentAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">Meta Total</p>
                    <p className="text-lg font-bold text-blue-600">
                      R$ {goal.targetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-gray-500 text-lg mb-2">Nenhuma meta cadastrada ainda</p>
            <p className="text-gray-400 text-sm mb-6">Que tal criar sua primeira meta financeira conjunta?</p>
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
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Nova Meta</h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label htmlFor="currentAmount" className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="flex-1 btn bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn btn-primary"
                  >
                    Criar Meta
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