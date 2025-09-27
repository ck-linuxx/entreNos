import { Link } from 'react-router-dom';
import { useAppData } from '../hooks/useLocalStorage';

export default function Dashboard() {
  const { data, getSharedBalance, getUpcomingExpenses } = useAppData();

  const sharedBalance = getSharedBalance();
  const upcomingExpenses = getUpcomingExpenses();
  const totalGoalsValue = data.goals.reduce((acc, goal) => acc + goal.targetAmount, 0);
  const totalSavedGoals = data.goals.reduce((acc, goal) => acc + goal.currentAmount, 0);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Olá, {data.user.name}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Aqui está o resumo das suas finanças compartilhadas com {data.user.partnername}
        </p>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Saldo compartilhado */}
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Saldo Compartilhado</p>
              <p className="text-3xl font-bold">
                R$ {sharedBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-4xl opacity-80">💰</div>
          </div>
        </div>

        {/* Total de despesas pagas */}
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Despesas Pagas</p>
              <p className="text-3xl font-bold">
                R$ {data.expenses
                  .filter(exp => exp.isPaid)
                  .reduce((acc, exp) => acc + exp.amount, 0)
                  .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-4xl opacity-80">✅</div>
          </div>
        </div>

        {/* Metas em progresso */}
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Progresso das Metas</p>
              <p className="text-3xl font-bold">
                {totalGoalsValue > 0 ? Math.round((totalSavedGoals / totalGoalsValue) * 100) : 0}%
              </p>
            </div>
            <div className="text-4xl opacity-80">🎯</div>
          </div>
        </div>
      </div>

      {/* Seções principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Próximas despesas */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Próximas Despesas</h2>
            <Link to="/expenses" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm font-medium">
              Ver todas →
            </Link>
          </div>

          <div className="space-y-4">
            {upcomingExpenses.length > 0 ? (
              upcomingExpenses.slice(0, 3).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                      <span className="text-red-600 dark:text-red-400 font-bold">!</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{expense.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Vence em breve</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-gray-100">
                      R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pendente</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nenhuma despesa pendente! 🎉</p>
            )}
          </div>
        </div>

        {/* Metas conjuntas */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Metas Conjuntas</h2>
            <Link to="/goals" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm font-medium">
              Ver todas →
            </Link>
          </div>

          <div className="space-y-6">
            {data.goals.length > 0 ? (
              data.goals.slice(0, 2).map((goal) => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                return (
                  <div key={goal.id}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{goal.name}</h3>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>R$ {goal.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <span>R$ {goal.targetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nenhuma meta cadastrada ainda</p>
            )}
          </div>
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/expenses"
            className="card hover:shadow-md transition-shadow duration-200 text-center p-4"
          >
            <div className="text-3xl mb-2">💸</div>
            <p className="font-medium text-gray-900 dark:text-gray-100">Nova Despesa</p>
          </Link>
          
          <Link
            to="/goals"
            className="card hover:shadow-md transition-shadow duration-200 text-center p-4"
          >
            <div className="text-3xl mb-2">🎯</div>
            <p className="font-medium text-gray-900 dark:text-gray-100">Nova Meta</p>
          </Link>
          
          <Link
            to="/reports"
            className="card hover:shadow-md transition-shadow duration-200 text-center p-4"
          >
            <div className="text-3xl mb-2">📈</div>
            <p className="font-medium text-gray-900 dark:text-gray-100">Ver Relatórios</p>
          </Link>
          
          <button
            onClick={() => window.location.reload()}
            className="card hover:shadow-md transition-shadow duration-200 text-center p-4"
          >
            <div className="text-3xl mb-2">🔄</div>
            <p className="font-medium text-gray-900 dark:text-gray-100">Atualizar</p>
          </button>
        </div>
      </div>
    </div>
  );
}