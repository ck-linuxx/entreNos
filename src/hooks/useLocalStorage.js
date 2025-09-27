import { useState, useEffect } from 'react';

// Dados iniciais da aplicação
const INITIAL_DATA = {
  user: {
    name: 'João',
    email: 'joao@email.com',
    partnername: 'Ana'
  },
  expenses: [
    {
      id: 1,
      name: 'Supermercado',
      amount: 600,
      paidBy: 'João',
      splitType: '50/50',
      date: '2024-01-15',
      isPaid: true
    },
    {
      id: 2,
      name: 'Internet',
      amount: 120,
      paidBy: 'Ana',
      splitType: '50/50',
      date: '2024-01-10',
      isPaid: true
    },
    {
      id: 3,
      name: 'Conta de Luz',
      amount: 240,
      paidBy: '',
      splitType: '50/50',
      date: '2024-01-20',
      isPaid: false
    }
  ],
  goals: [
    {
      id: 1,
      name: 'Viagem Florianópolis',
      targetAmount: 2000,
      currentAmount: 800,
      createdAt: '2024-01-01'
    }
  ]
};

export function useLocalStorage(key, initialValue = null) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setStoredValue = (newValue) => {
    try {
      setValue(newValue);
      window.localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [value, setStoredValue];
}

// Hook específico para dados da aplicação
export function useAppData() {
  const [data, setData] = useLocalStorage('entreNosData', INITIAL_DATA);

  const resetData = () => {
    setData(INITIAL_DATA);
  };

  const updateExpenses = (expenses) => {
    setData(prev => ({ ...prev, expenses }));
  };

  const updateGoals = (goals) => {
    setData(prev => ({ ...prev, goals }));
  };

  const addExpense = (expense) => {
    const newExpense = {
      ...expense,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0]
    };
    setData(prev => ({
      ...prev,
      expenses: [...prev.expenses, newExpense]
    }));
  };

  const addGoal = (goal) => {
    const newGoal = {
      ...goal,
      id: Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setData(prev => ({
      ...prev,
      goals: [...prev.goals, newGoal]
    }));
  };

  // Calcular saldo compartilhado
  const getSharedBalance = () => {
    if (!data?.expenses) return 0;

    let joaoTotal = 0;
    let anaTotal = 0;

    data.expenses.forEach(expense => {
      if (expense.isPaid) {
        const amount = expense.amount / 2; // 50/50 por simplicidade
        if (expense.paidBy === 'João') {
          joaoTotal += expense.amount;
          anaTotal -= amount;
          joaoTotal -= amount;
        } else if (expense.paidBy === 'Ana') {
          anaTotal += expense.amount;
          joaoTotal -= amount;
          anaTotal -= amount;
        }
      }
    });

    return joaoTotal + anaTotal;
  };

  // Obter próximas despesas
  const getUpcomingExpenses = () => {
    if (!data?.expenses) return [];

    return data.expenses.filter(expense => !expense.isPaid);
  };

  // Calcular quem deve para quem
  const getBalance = () => {
    if (!data?.expenses) return { joao: 0, ana: 0, balance: 0 };

    let joaoTotal = 0;
    let anaTotal = 0;

    data.expenses.forEach(expense => {
      if (expense.isPaid) {
        const half = expense.amount / 2;
        if (expense.paidBy === 'João') {
          joaoTotal += half;
        } else if (expense.paidBy === 'Ana') {
          anaTotal += half;
        }
      }
    });

    const totalPaid = joaoTotal + anaTotal;
    const balanceDifference = joaoTotal - anaTotal;

    return {
      joao: joaoTotal,
      ana: anaTotal,
      total: totalPaid,
      balance: balanceDifference
    };
  };

  return {
    data,
    resetData,
    updateExpenses,
    updateGoals,
    addExpense,
    addGoal,
    getSharedBalance,
    getUpcomingExpenses,
    getBalance
  };
}