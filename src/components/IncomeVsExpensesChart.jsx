import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useTransactions } from '../contexts/TransactionsContext';
import { useTheme } from '../hooks/useLocalStorage';
import { FiTrendingUp } from 'react-icons/fi';

const IncomeVsExpensesChart = () => {
  const { transactions } = useTransactions();
  const { isDark } = useTheme();

  const chartData = useMemo(() => {
    // Calcular totais
    const expenses = transactions
      .filter(t => t.type === 'expense' || !t.type)
      .reduce((acc, t) => acc + t.amount, 0);

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);

    return [
      {
        name: 'Despesas',
        value: expenses,
        itemStyle: { color: '#EF4444' }
      },
      {
        name: 'Receitas',
        value: income,
        itemStyle: { color: '#10B981' }
      }
    ];
  }, [transactions]);

  const totalValue = chartData.reduce((acc, item) => acc + item.value, 0);
  const balance = chartData[1]?.value - chartData[0]?.value || 0;

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: function (params) {
        const percentage = ((params.value / totalValue) * 100).toFixed(1);
        return `${params.name}<br/>R$ ${params.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${percentage}%)`;
      },
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
      name: 'Receitas vs Despesas',
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
          color: isDark ? '#f9fafb' : '#111827',
          formatter: function (params) {
            return `${params.name}\nR$ ${params.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
          }
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
      data: chartData.filter(item => item.value > 0) // Só mostrar itens com valor
    }]
  };

  if (totalValue === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <FiTrendingUp className="text-4xl mb-2" />
        <p className="text-sm">Nenhuma transação para exibir</p>
      </div>
    );
  }

  return (
    <div className="w-full">

      {/* Gráfico */}
      <div className="h-64">
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
          theme={isDark ? 'dark' : 'light'}
        />
      </div>
    </div>
  );
};

export default IncomeVsExpensesChart;