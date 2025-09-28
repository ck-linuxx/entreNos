import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions } from '../contexts/TransactionsContext';
import {
  FiDollarSign,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight,
  FiBarChart
} from 'react-icons/fi';

export default function Dashboard() {
  const { transactions, loading } = useTransactions();
  const { user } = useAuth();

  // Função para obter o nome do usuário logado
  const getUserName = () => {
    if (!user) return 'Usuário';
    return user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Usuário';
  };

  // Função para obter o primeiro nome do usuário
  const getFirstName = () => {
    const fullName = getUserName();
    return fullName.split(' ')[0];
  };

  // Função para calcular o saldo compartilhado
  const getSharedBalance = () => {
    if (!transactions || transactions.length === 0) return 0;

    const totalExpenses = transactions
      .filter(t => t.is_paid)
      .reduce((acc, transaction) => acc + transaction.amount, 0);

    const userExpenses = transactions
      .filter(t => t.is_paid && t.paid_by === getUserName())
      .reduce((acc, transaction) => acc + transaction.amount, 0);

    const partnerExpenses = totalExpenses - userExpenses;

    return userExpenses - partnerExpenses;
  };

  // Função para obter próximas despesas (não pagas)
  const getUpcomingExpenses = () => {
    if (!transactions) return [];
    return transactions
      .filter(t => !t.is_paid)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3);
  };

  const sharedBalance = getSharedBalance();
  const upcomingExpenses = getUpcomingExpenses();
  const totalTransactions = transactions ? transactions.length : 0;
  const totalPaidAmount = transactions
    ? transactions.filter(t => t.is_paid).reduce((acc, t) => acc + t.amount, 0)
    : 0;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Olá, {getFirstName()}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Aqui está o resumo das suas finanças compartilhadas
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
            <FiDollarSign className="text-4xl opacity-80" />
          </div>
        </div>

        {/* Total de transações pagas */}
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Transações Pagas</p>
              <p className="text-3xl font-bold">
                {loading ? '...' : `R$ ${totalPaidAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              </p>
            </div>
            <FiCheckCircle className="text-4xl opacity-80" />
          </div>
        </div>

        {/* Total de transações */}
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total de Transações</p>
              <p className="text-3xl font-bold">
                {loading ? '...' : totalTransactions}
              </p>
            </div>
            <div className="text-4xl opacity-80"><FiBarChart className="mx-auto" /></div>
          </div>
        </div>
      </div>

      {/* Seções principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Próximas transações */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Próximas Transações</h2>
            <Link to="/expenses" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm font-medium flex items-center">
              Ver todas <FiArrowRight className="ml-1" size={16} />
            </Link>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Carregando...</span>
              </div>
            ) : upcomingExpenses.length > 0 ? (
              upcomingExpenses.slice(0, 3).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                      <FiAlertCircle className="text-red-600 dark:text-red-400" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{transaction.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Categoria: {transaction.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-gray-100">
                      R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pendente</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nenhuma transação pendente!</p>
            )}
          </div>
        </div>

        {/* Resumo por categoria */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Gastos por Categoria</h2>
            <Link to="/reports" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm font-medium">
              Ver relatório →
            </Link>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Carregando...</span>
              </div>
            ) : (() => {
              const categoryTotals = transactions
                ?.filter(t => t.is_paid)
                .reduce((acc, transaction) => {
                  acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
                  return acc;
                }, {}) || {};

              const categories = Object.entries(categoryTotals)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3);

              return categories.length > 0 ? (
                categories.map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <FiBarChart className="text-blue-600 dark:text-blue-400" size={16} />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{category}</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nenhuma transação paga ainda</p>
              );
            })()}
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
            <div className="text-3xl mb-2"><FiDollarSign className="mx-auto" /></div>
            <p className="font-medium text-gray-900 dark:text-gray-100">Nova Despesa</p>
          </Link>

          <Link
            to="/goals"
            className="card hover:shadow-md transition-shadow duration-200 text-center p-4"
          >
            <div className="text-3xl mb-2"><FiCheckCircle className="mx-auto" /></div>
            <p className="font-medium text-gray-900 dark:text-gray-100">Nova Meta</p>
          </Link>

          <Link
            to="/reports"
            className="card hover:shadow-md transition-shadow duration-200 text-center p-4"
          >
            <div className="text-3xl mb-2"><FiBarChart className="mx-auto" /></div>
            <p className="font-medium text-gray-900 dark:text-gray-100">Ver Relatórios</p>
          </Link>

          <button
            onClick={() => window.location.reload()}
            className="card hover:shadow-md transition-shadow duration-200 text-center p-4"
          >
            <div className="text-3xl mb-2"><FiAlertCircle className="mx-auto" /></div>
            <p className="font-medium text-gray-900 dark:text-gray-100">Atualizar</p>
          </button>
        </div>
      </div>
    </div>
  );
}