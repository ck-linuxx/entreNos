import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useGroup } from './GroupContext';

const GoalsContext = createContext();

export function GoalsProvider({ children }) {
  const { user } = useAuth();
  const { currentGroup } = useGroup();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Buscar metas do usuário e grupo atual
  const fetchGoals = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('goals_with_progress')
        .select('*')
        .order('target_date', { ascending: true });

      // Se há um grupo ativo, buscar metas do grupo e pessoais
      if (currentGroup?.id) {
        query = query.or(`user_id.eq.${user.id},group_id.eq.${currentGroup.id}`);
      } else {
        // Apenas metas pessoais
        query = query.eq('user_id', user.id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setGoals(data || []);
    } catch (err) {
      console.error('Erro ao buscar metas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar nova meta
  const addGoal = async (goalData) => {
    if (!user) throw new Error('Usuário não autenticado');

    setLoading(true);
    setError(null);

    try {
      const newGoal = {
        ...goalData,
        user_id: user.id,
        group_id: currentGroup?.id || null,
        current_amount: goalData.current_amount || 0
      };

      const { data, error: addError } = await supabase
        .from('goals')
        .insert([newGoal])
        .select()
        .single();

      if (addError) throw addError;

      // Atualizar a lista local
      await fetchGoals();

      return { data, error: null };
    } catch (err) {
      console.error('Erro ao adicionar meta:', err);
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Atualizar meta existente
  const updateGoal = async (goalId, updates) => {
    if (!user) throw new Error('Usuário não autenticado');

    setLoading(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', goalId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Atualizar a lista local
      await fetchGoals();

      return { data, error: null };
    } catch (err) {
      console.error('Erro ao atualizar meta:', err);
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Adicionar valor à meta (para progresso)
  const addProgressToGoal = async (goalId, amount) => {
    if (!user) throw new Error('Usuário não autenticado');

    setLoading(true);
    setError(null);

    try {
      // Buscar valor atual da meta
      const { data: currentGoal, error: fetchError } = await supabase
        .from('goals')
        .select('current_amount')
        .eq('id', goalId)
        .single();

      if (fetchError) throw fetchError;

      const newCurrentAmount = (currentGoal.current_amount || 0) + parseFloat(amount);

      const { data, error: updateError } = await supabase
        .from('goals')
        .update({ current_amount: newCurrentAmount })
        .eq('id', goalId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Atualizar a lista local
      await fetchGoals();

      return { data, error: null };
    } catch (err) {
      console.error('Erro ao adicionar progresso à meta:', err);
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Remover meta
  const deleteGoal = async (goalId) => {
    if (!user) throw new Error('Usuário não autenticado');

    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (deleteError) throw deleteError;

      // Atualizar a lista local
      await fetchGoals();

      return { error: null };
    } catch (err) {
      console.error('Erro ao remover meta:', err);
      setError(err.message);
      return { error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Marcar meta como completada
  const completeGoal = async (goalId) => {
    return await updateGoal(goalId, { is_completed: true });
  };

  // Obter estatísticas das metas
  const getGoalsStats = () => {
    if (!goals.length) {
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        overdue: 0,
        totalAmount: 0,
        totalCurrentAmount: 0,
        completionRate: 0
      };
    }

    const completed = goals.filter(g => g.is_completed).length;
    const overdue = goals.filter(g => g.is_overdue && !g.is_completed).length;
    const inProgress = goals.length - completed;
    const totalAmount = goals.reduce((sum, g) => sum + parseFloat(g.amount), 0);
    const totalCurrentAmount = goals.reduce((sum, g) => sum + parseFloat(g.current_amount || 0), 0);
    const completionRate = goals.length > 0 ? (completed / goals.length) * 100 : 0;

    return {
      total: goals.length,
      completed,
      inProgress,
      overdue,
      totalAmount,
      totalCurrentAmount,
      completionRate
    };
  };

  // Efeito para buscar metas quando user ou grupo mudam
  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user, currentGroup?.id]);

  const value = {
    goals,
    loading,
    error,
    fetchGoals,
    addGoal,
    updateGoal,
    addProgressToGoal,
    deleteGoal,
    completeGoal,
    getGoalsStats
  };

  return (
    <GoalsContext.Provider value={value}>
      {children}
    </GoalsContext.Provider>
  );
}

export function useGoals() {
  const context = useContext(GoalsContext);
  if (!context) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  return context;
}