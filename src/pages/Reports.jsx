import { useAppData } from '../hooks/useLocalStorage';

export default function Reports() {
  const { data, getBalance, resetData } = useAppData();
  const balance = getBalance();

  // Calcular estatísticas
  const totalExpenses = data.expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const joaoExpenses = data.expenses.filter(exp => exp.paidBy === 'João').reduce((acc, exp) => acc + exp.amount, 0);
  const anaExpenses = data.expenses.filter(exp => exp.paidBy === 'Ana').reduce((acc, exp) => acc + exp.amount, 0);

  const joaoPercentage = totalExpenses > 0 ? (joaoExpenses / totalExpenses) * 100 : 0;
  const anaPercentage = totalExpenses > 0 ? (anaExpenses / totalExpenses) * 100 : 0;

  // Categorizar despesas (simulação baseada no nome)
  const categorizeExpense = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('supermercado') || lowerName.includes('mercado') || lowerName.includes('comida')) return 'Alimentação';
    if (lowerName.includes('luz') || lowerName.includes('água') || lowerName.includes('energia') || lowerName.includes('internet') || lowerName.includes('telefone')) return 'Contas Básicas';
    if (lowerName.includes('transporte') || lowerName.includes('combustível') || lowerName.includes('uber')) return 'Transporte';
    if (lowerName.includes('lazer') || lowerName.includes('cinema') || lowerName.includes('restaurante')) return 'Lazer';
    return 'Outros';
  };

  const expensesByCategory = data.expenses.reduce((acc, expense) => {
    const category = categorizeExpense(expense.name);
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {});

  const categories = Object.entries(expensesByCategory).map(([name, amount]) => ({
    name,
    amount,
    percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
  })).sort((a, b) => b.amount - a.amount);

  const handleResetData = () => {
    if (confirm('Tem certeza que deseja resetar todos os dados? Esta ação não pode ser desfeita.')) {
      resetData();
      alert('Dados resetados com sucesso! Os exemplos iniciais foram restaurados.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Relatórios Financeiros</h1>
          <p className="text-gray-600 dark:text-gray-400">Análise completa das finanças compartilhadas</p>
        </div>
        <button
          onClick={handleResetData}
          className="btn bg-gray-600 text-white hover:bg-gray-700 mt-4 sm:mt-0"
        >
          🔄 Resetar Dados
        </button>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="text-center">
            <p className="text-blue-100 text-sm font-medium mb-2">Total Gasto</p>
            <p className="text-2xl font-bold">
              R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="text-center">
            <p className="text-green-100 text-sm font-medium mb-2">João Pagou</p>
            <p className="text-2xl font-bold">
              R$ {joaoExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-green-100 text-sm">({joaoPercentage.toFixed(0)}%)</p>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="text-center">
            <p className="text-purple-100 text-sm font-medium mb-2">Ana Pagou</p>
            <p className="text-2xl font-bold">
              R$ {anaExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-purple-100 text-sm">({anaPercentage.toFixed(0)}%)</p>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="text-center">
            <p className="text-orange-100 text-sm font-medium mb-2">Despesas</p>
            <p className="text-2xl font-bold">{data.expenses.length}</p>
            <p className="text-orange-100 text-sm">cadastradas</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Saldo entre os usuários */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Saldo entre Vocês</h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">João pagou</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total das despesas</p>
              </div>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                R$ {balance.joao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="flex justify-between items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Ana pagou</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total das despesas</p>
              </div>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                R$ {balance.ana.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="border-t pt-4">
              <div className={`text-center p-4 rounded-lg ${balance.balance > 0
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : balance.balance < 0
                    ? 'bg-red-50 dark:bg-red-900/20'
                    : 'bg-gray-50 dark:bg-gray-700'
                }`}>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Resultado</p>
                {balance.balance > 0 ? (
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    Ana deve R$ {Math.abs(balance.balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para João
                  </p>
                ) : balance.balance < 0 ? (
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">
                    João deve R$ {Math.abs(balance.balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para Ana
                  </p>
                ) : (
                  <p className="text-lg font-bold text-gray-600 dark:text-gray-400">
                    Vocês estão quites! 🎉
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Gastos por categoria */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Gastos por Categoria</h2>

          <div className="space-y-4">
            {categories.length > 0 ? (
              categories.map((category, index) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{category.name}</span>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-gray-100">
                        R$ {category.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{category.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${index === 0 ? 'bg-blue-500' :
                          index === 1 ? 'bg-green-500' :
                            index === 2 ? 'bg-purple-500' :
                              index === 3 ? 'bg-orange-500' : 'bg-gray-500'
                        }`}
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nenhuma despesa para categorizar</p>
            )}
          </div>
        </div>
      </div>

      {/* Lista detalhada de despesas */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Histórico Detalhado</h2>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Data</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Despesa</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Categoria</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Valor</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Pago por</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {data.expenses.length > 0 ? (
                data.expenses
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {new Date(expense.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {expense.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {categorizeExpense(expense.name)}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-gray-100">
                        R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {expense.paidBy || 'Pendente'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${expense.isPaid
                            ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200'
                            : 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200'
                          }`}>
                          {expense.isPaid ? 'Pago' : 'Pendente'}
                        </span>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    Nenhuma despesa registrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumo das metas */}
      {data.goals.length > 0 && (
        <div className="card mt-8">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Resumo das Metas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.goals.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              return (
                <div key={goal.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">{goal.name}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Progresso</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        R$ {goal.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        R$ {goal.targetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}