import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions } from '../contexts/TransactionsContext';
import { useGroup } from '../contexts/GroupContext';
import GroupMembers from '../components/GroupMembers';
import ExpensesByCategoryChart from '../components/ExpensesByCategoryChart';
import IncomeVsExpensesChart from '../components/IncomeVsExpensesChart';
import {
  FiDollarSign,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight,
  FiBarChart,
  FiPieChart,
  FiTrendingUp
} from 'react-icons/fi';

export default function Dashboard() {
  const { transactions, loading } = useTransactions();
  const { user } = useAuth();
  const { currentGroup, groupMembers } = useGroup();

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

  // Função para calcular estatísticas do grupo
  const getGroupStats = () => {
    if (!transactions || transactions.length === 0) {
      return {
        totalPaid: 0,
        totalPending: 0,
        memberStats: []
      };
    }

    const totalPaid = transactions
      .filter(t => t.is_paid)
      .reduce((acc, transaction) => acc + transaction.amount, 0);

    const totalPending = transactions
      .filter(t => !t.is_paid)
      .reduce((acc, transaction) => acc + transaction.amount, 0);

    // Estatísticas por membro (quem pagou o quê)
    const memberStats = {};
    transactions
      .filter(t => t.is_paid && t.paid_by)
      .forEach(t => {
        if (!memberStats[t.paid_by]) {
          memberStats[t.paid_by] = 0;
        }
        memberStats[t.paid_by] += t.amount;
      });

    return {
      totalPaid,
      totalPending,
      memberStats: Object.entries(memberStats).map(([name, amount]) => ({
        name,
        amount
      }))
    };
  };

  // Função para obter próximas despesas (não pagas)
  const getUpcomingExpenses = () => {
    if (!transactions) return [];
    return transactions
      .filter(t => !t.is_paid)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3);
  };

  const groupStats = getGroupStats();
  const upcomingExpenses = getUpcomingExpenses();
  const totalTransactions = transactions ? transactions.length : 0;

  return (
    <div className="max-w-7xl mx-auto p-6 main-content">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Olá, {getFirstName()}!
        </h1>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total pago pelo grupo */}
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Pago pelo Grupo</p>
              <p className="text-3xl font-bold">
                R$ {groupStats.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <FiDollarSign className="text-4xl opacity-80" />
          </div>
        </div>

        {/* Total pendente */}
        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Transações Pendentes</p>
              <p className="text-3xl font-bold">
                {loading ? '...' : `R$ ${groupStats.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              </p>
            </div>
            <FiAlertCircle className="text-4xl opacity-80" />
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

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Gráfico de Despesas por Categoria */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FiPieChart className="text-red-500" />
              Despesas por Categoria
            </h2>
            <Link to="/expenses" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm font-medium flex items-center">
              Ver despesas <FiArrowRight className="ml-1" size={16} />
            </Link>
          </div>
          <ExpensesByCategoryChart />
        </div>

        {/* Gráfico de Receitas vs Despesas */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FiTrendingUp className="text-green-500" />
              Receitas vs Despesas
            </h2>
            <div className="flex gap-2">
              <Link to="/income" className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 text-sm font-medium">
                Receitas
              </Link>
              <span className="text-gray-400">•</span>
              <Link to="/expenses" className="text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 text-sm font-medium">
                Despesas
              </Link>
            </div>
          </div>
          <IncomeVsExpensesChart />
        </div>
      </div>

      {/* Estatísticas por membro do grupo */}
      {groupStats.memberStats.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Pagamentos por Membro</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupStats.memberStats.map((member, index) => (
              <div key={member.name} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{member.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total pago</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 dark:text-green-400">
                      R$ {member.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {groupStats.totalPaid > 0 ? ((member.amount / groupStats.totalPaid) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

    </div>
  );
}