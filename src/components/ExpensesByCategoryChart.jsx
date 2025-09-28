import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useTransactions } from '../contexts/TransactionsContext';
import { useTheme } from '../hooks/useLocalStorage';
import { FiBarChart } from 'react-icons/fi';

const ExpensesByCategoryChart = () => {
  const { transactions } = useTransactions();
  const { isDark } = useTheme();

  const chartData = useMemo(() => {
    // Filtrar apenas despesas
    const expenses = transactions.filter(t => t.type === 'expense' || !t.type);
    
    // Agrupar por categoria
    const categoryTotals = expenses.reduce((acc, transaction) => {
      const category = transaction.category || 'Outros';
      acc[category] = (acc[category] || 0) + transaction.amount;
      return acc;
    }, {});

    // Converter para formato do ECharts
    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Ordenar por valor decrescente
  }, [transactions]);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: R$ {c} ({d}%)',
      backgroundColor: isDark ? '#374151' : '#ffffff',
      borderColor: isDark ? '#4B5563' : '#e5e7eb',
      textStyle: {
        color: isDark ? '#f9fafb' : '#111827'
      }
    },
    legend: {
      top: '5%',
      left: 'center',
      textStyle: {
        fontSize: 12,
        color: isDark ? '#d1d5db' : '#374151'
      }
    },
    series: [{
      name: 'Despesas por Categoria',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: 'transparent',
        borderWidth: 0
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold',
          color: isDark ? '#f9fafb' : '#111827'
        },
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.2)'
        }
      },
      labelLine: {
        show: false
      },
      data: chartData
    }],
    color: [
      '#EF4444', // Vermelho
      '#10B981', // Verde esmeralda
      '#3B82F6', // Azul
      '#8B5CF6', // Roxo
      '#F59E0B', // Âmbar
      '#EC4899', // Rosa
      '#06B6D4', // Ciano
      '#84CC16', // Lima
      '#F97316', // Laranja
      '#6366F1'  // Índigo
    ]
  };

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <FiBarChart className="text-4xl mb-2" />
        <p className="text-sm">Nenhuma despesa para exibir</p>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ReactECharts 
        option={option} 
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'canvas' }}
        theme={isDark ? 'dark' : 'light'}
      />
    </div>
  );
};

export default ExpensesByCategoryChart;