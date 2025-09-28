import { useAuth } from '../contexts/AuthContext';
import { useTransactions } from '../contexts/TransactionsContext';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiBarChart } from 'react-icons/fi';

export default function Reports() {
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



  // Calcular transações pagas pelo usuário logado vs outros
  const paidTransactions = transactions?.filter(t => t.is_paid) || [];
  const userExpenses = paidTransactions.filter(t => t.paid_by === getUserName()).reduce((acc, t) => acc + t.amount, 0);
  const otherExpenses = paidTransactions.filter(t => t.paid_by && t.paid_by !== getUserName()).reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = userExpenses + otherExpenses;
  const userPercentage = totalExpenses > 0 ? (userExpenses / totalExpenses) * 100 : 0;
  const otherPercentage = totalExpenses > 0 ? (otherExpenses / totalExpenses) * 100 : 0;



  // Calcular balanço (quem deve para quem)
  const balance = userExpenses - otherExpenses;

  // Estatísticas adicionais
  const pendingTransactions = transactions?.filter(t => !t.is_paid) || [];
  const pendingAmount = pendingTransactions.reduce((acc, t) => acc + t.amount, 0);
  const totalTransactions = transactions?.length || 0;
  const paidTransactionsCount = paidTransactions.length;

  // Agrupar transações por categoria
  const expensesByCategory = paidTransactions.reduce((acc, transaction) => {
    const category = transaction.category || 'Outros';
    if (!acc[category]) acc[category] = 0;
    acc[category] += parseFloat(transaction.amount || 0);
    return acc;
  }, {});

  const categoryData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
  })).sort((a, b) => b.amount - a.amount);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 main-content">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600 dark:text-gray-400">Carregando relatórios...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 main-content">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Relatórios Financeiros
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Análise detalhada das transações e divisão de custos
          </p>
        </div>
      </div>

      {/* Cards de estatísticas extras */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Transações pendentes */}
        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="text-center">
            <p className="text-orange-100 text-sm font-medium mb-2">Pendentes</p>
            <p className="text-xl font-bold">
              {loading ? (
                <span className="animate-pulse">---</span>
              ) : (
                pendingTransactions.length
              )}
            </p>
            <p className="text-orange-100 text-xs">
              {loading ? 'carregando...' : `R$ ${pendingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            </p>
          </div>
        </div>

        {/* Total de transações */}
        <div className="card bg-gradient-to-br from-teal-500 to-teal-600 text-white">
          <div className="text-center">
            <p className="text-teal-100 text-sm font-medium mb-2">Total</p>
            <p className="text-xl font-bold">
              {loading ? (
                <span className="animate-pulse">---</span>
              ) : (
                totalTransactions
              )}
            </p>
            <p className="text-teal-100 text-xs">transações</p>
          </div>
        </div>

        {/* Transações pagas */}
        <div className="card bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <div className="text-center">
            <p className="text-emerald-100 text-sm font-medium mb-2">Pagas</p>
            <p className="text-xl font-bold">
              {loading ? (
                <span className="animate-pulse">---</span>
              ) : (
                paidTransactionsCount
              )}
            </p>
            <p className="text-emerald-100 text-xs">
              {loading ? '' : `${totalTransactions > 0 ? Math.round((paidTransactionsCount / totalTransactions) * 100) : 0}%`}
            </p>
          </div>
        </div>

        {/* Valor médio */}
        <div className="card bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <div className="text-center">
            <p className="text-indigo-100 text-sm font-medium mb-2">Média</p>
            <p className="text-xl font-bold">
              {loading ? (
                <span className="animate-pulse">---</span>
              ) : (
                `R$ ${paidTransactionsCount > 0 ? (totalExpenses / paidTransactionsCount).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}`
              )}
            </p>
            <p className="text-indigo-100 text-xs">por transação</p>
          </div>
        </div>
      </div>



      {/* Balanço e acerto de contas */}
      {!loading && totalExpenses > 0 && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Acerto de Contas</h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{getUserName()} pagou</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total das transações</p>
              </div>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                R$ {userExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="flex justify-between items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Outros pagaram</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total das transações</p>
              </div>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                R$ {otherExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="text-center">
                {balance > 0 ? (
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    Outros devem R$ {Math.abs(balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para {getUserName()}
                  </p>
                ) : balance < 0 ? (
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">
                    {getUserName()} deve R$ {Math.abs(balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para outros
                  </p>
                ) : (
                  <p className="text-lg font-bold text-gray-600 dark:text-gray-400">
                    Vocês estão quites!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gastos por categoria */}
      {!loading && categoryData.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
            <FiBarChart className="text-blue-600 dark:text-blue-400" />
            Gastos por Categoria
          </h2>
          <div className="space-y-3">
            {categoryData.map(({ category, amount, percentage }) => (
              <div key={category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{category}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista detalhada de transações */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Histórico Detalhado</h2>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Data</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Transação</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Categoria</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Valor</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Pago por</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {transactions && transactions.length > 0 ? (
                transactions
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {transaction.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {transaction.category}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-gray-100">
                        R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {transaction.paid_by || 'Pendente'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${transaction.is_paid
                          ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200'
                          : 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200'
                          }`}>
                          {transaction.is_paid ? 'Pago' : 'Pendente'}
                        </span>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    Nenhuma transação registrada ainda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}