import { useState } from 'react';
import { useAppData } from '../hooks/useLocalStorage';

export default function Expenses() {
  const { data, addExpense, updateExpenses } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    paidBy: '',
    splitType: '50/50',
    isPaid: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.amount) {
      addExpense({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      setFormData({
        name: '',
        amount: '',
        paidBy: '',
        splitType: '50/50',
        isPaid: false
      });
      setShowForm(false);
    }
  };

  const togglePaidStatus = (expenseId) => {
    const updatedExpenses = data.expenses.map(expense =>
      expense.id === expenseId
        ? { ...expense, isPaid: !expense.isPaid }
        : expense
    );
    updateExpenses(updatedExpenses);
  };

  const deleteExpense = (expenseId) => {
    const updatedExpenses = data.expenses.filter(expense => expense.id !== expenseId);
    updateExpenses(updatedExpenses);
  };

  const totalExpenses = data.expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const paidExpenses = data.expenses.filter(exp => exp.isPaid).reduce((acc, exp) => acc + exp.amount, 0);
  const pendingExpenses = totalExpenses - paidExpenses;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Despesas Compartilhadas</h1>
          <p className="text-gray-600">Gerencie as despesas em comum com {data.user.partnername}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <span className="mr-2">+</span>
          Nova Despesa
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
            <div className="text-3xl opacity-80">💸</div>
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
            <div className="text-3xl opacity-80">✅</div>
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
            <div className="text-3xl opacity-80">⏰</div>
          </div>
        </div>
      </div>

      {/* Lista de despesas */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Lista de Despesas</h2>

        <div className="space-y-4">
          {data.expenses.length > 0 ? (
            data.expenses.map((expense) => (
              <div
                key={expense.id}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${expense.isPaid
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
                  }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{expense.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${expense.isPaid
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {expense.isPaid ? 'Pago' : 'Pendente'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Valor: <span className="font-medium">R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>
                      <p>Divisão: <span className="font-medium">{expense.splitType}</span></p>
                      {expense.paidBy && (
                        <p>Pago por: <span className="font-medium">{expense.paidBy}</span></p>
                      )}
                      <p>Data: <span className="font-medium">{new Date(expense.date).toLocaleDateString('pt-BR')}</span></p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                    <button
                      onClick={() => togglePaidStatus(expense.id)}
                      className={`btn text-sm ${expense.isPaid
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'btn-secondary'
                        }`}
                    >
                      {expense.isPaid ? 'Marcar Pendente' : 'Marcar como Pago'}
                    </button>
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="btn bg-red-600 text-white hover:bg-red-700 text-sm"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💸</div>
              <p className="text-gray-500 text-lg">Nenhuma despesa cadastrada ainda</p>
              <p className="text-gray-400 text-sm mt-2">Clique em "Nova Despesa" para começar</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal do formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Nova Despesa</h3>
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
                    Nome da Despesa *
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
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label htmlFor="paidBy" className="block text-sm font-medium text-gray-700 mb-1">
                    Quem Pagou
                  </label>
                  <select
                    id="paidBy"
                    name="paidBy"
                    value={formData.paidBy}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="">Ainda não foi pago</option>
                    <option value="João">João</option>
                    <option value="Ana">Ana</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="splitType" className="block text-sm font-medium text-gray-700 mb-1">
                    Como Dividir
                  </label>
                  <select
                    id="splitType"
                    name="splitType"
                    value={formData.splitType}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="50/50">50/50</option>
                    <option value="60/40">60/40</option>
                    <option value="70/30">70/30</option>
                    <option value="personalizado">Personalizado</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPaid"
                    name="isPaid"
                    checked={formData.isPaid}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPaid" className="ml-2 block text-sm text-gray-700">
                    Despesa já foi paga
                  </label>
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
                    Salvar Despesa
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