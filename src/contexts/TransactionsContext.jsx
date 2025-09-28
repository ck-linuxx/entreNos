import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import { useAuth } from './AuthContext';
import { useGroup } from './GroupContext';

const TransactionsContext = createContext({});

export const useTransactions = () => {
  return useContext(TransactionsContext);
};

export const TransactionsProvider = ({ children }) => {
  const { user } = useAuth();
  const { currentGroup } = useGroup();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Buscar transações do grupo
  const fetchTransactions = async () => {
    if (!user || !currentGroup) return;

    setLoading(true);
    try {
      // Buscar transações com perfis dos usuários
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          user_profiles (
            display_name,
            avatar_url,
            email
          )
        `)
        .eq('group_id', currentGroup.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Formatar dados das transações com informações dos perfis
      const formattedTransactions = (data || []).map(transaction => {
        const profile = transaction.user_profiles;
        
        return {
          ...transaction,
          createdBy: {
            email: profile?.email || 'Email não disponível',
            name: profile?.display_name || `Usuário ${transaction.user_id.slice(-4)}`,
            avatar: profile?.avatar_url || null
          }
        };
      });

      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      
      // Fallback para o método anterior se a tabela de perfis não existir ainda
      try {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('transactions')
          .select('*')
          .eq('group_id', currentGroup.id)
          .order('created_at', { ascending: false });

        if (fallbackError) throw fallbackError;

        const formattedTransactions = (fallbackData || []).map(transaction => {
          // Se for o usuário atual, usar os dados do auth
          if (transaction.user_id === user?.id) {
            return {
              ...transaction,
              createdBy: {
                email: user.email,
                name: user.user_metadata?.full_name || 
                      user.user_metadata?.name || 
                      user.email?.split('@')[0] || 
                      'Você',
                avatar: user.user_metadata?.avatar_url || 
                        user.user_metadata?.picture || 
                        null
              }
            };
          }
          
          // Para outros usuários, usar dados básicos
          return {
            ...transaction,
            createdBy: {
              email: 'Membro do grupo',
              name: `Membro ${transaction.user_id.slice(-4)}`,
              avatar: null
            }
          };
        });

        setTransactions(formattedTransactions);
      } catch (fallbackErr) {
        console.error('Erro no fallback:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  // Adicionar nova transação
  const addTransaction = async (transactionData) => {
    if (!user) throw new Error('Usuário não autenticado');
    if (!currentGroup) throw new Error('Grupo não encontrado');

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([
          {
            ...transactionData,
            user_id: user.id,
            group_id: currentGroup.id,
            created_at: new Date().toISOString(),
          }
        ])
        .select('*')
        .single();

      if (error) throw error;

      // Formatar dados com informações do usuário
      const formattedTransaction = {
        ...data,
        createdBy: {
          email: data.users?.email,
          name: data.users?.raw_user_meta_data?.full_name ||
            data.users?.raw_user_meta_data?.name ||
            data.users?.email?.split('@')[0] ||
            'Usuário',
          avatar: data.users?.raw_user_meta_data?.picture ||
            data.users?.raw_user_meta_data?.avatar_url
        }
      };

      // Atualizar estado local
      setTransactions(prev => [formattedTransaction, ...prev]);
      return { data: formattedTransaction, error: null };
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      return { data: null, error };
    }
  };

  // Atualizar transação - qualquer membro do grupo pode editar
  const updateTransaction = async (id, updates) => {
    if (!user || !currentGroup) {
      const errorMsg = 'Usuário não autenticado ou grupo não encontrado';
      console.error(errorMsg);
      return { data: null, error: errorMsg };
    }

    try {

      // Primeira tentativa: atualização simples sem join
      const { data: updateData, error: updateError } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .eq('group_id', currentGroup.id)
        .select('*')
        .single();

      if (updateError) {
        console.error('❌ Erro no Supabase ao atualizar transação:', updateError);
        return { data: null, error: updateError.message };
      }

      if (!updateData) {
        const errorMsg = 'Nenhuma transação encontrada para atualizar';
        console.error('❌', errorMsg);
        return { data: null, error: errorMsg };
      }

      console.log('✅ Transação atualizada no banco:', {
        id: updateData.id,
        name: updateData.name,
        is_paid: updateData.is_paid,
        paid_by: updateData.paid_by
      });

      // Usar dados simples sem join complex
      const formattedTransaction = {
        ...updateData,
        createdBy: {
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
          avatar: user.user_metadata?.picture || user.user_metadata?.avatar_url
        }
      };

      // Atualizar estado local
      setTransactions(prev => {
        const updated = prev.map(transaction =>
          transaction.id === id ? formattedTransaction : transaction
        );

        // Verificar se a atualização local funcionou
        const updatedTransaction = updated.find(t => t.id === id);
        console.log('🔄 Estado local atualizado:', {
          found: !!updatedTransaction,
          newStatus: updatedTransaction?.is_paid,
          expectedStatus: updates.is_paid,
          success: updatedTransaction?.is_paid === updates.is_paid
        });

        return updated;
      });

      return { data: formattedTransaction, error: null };
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      return { data: null, error: error.message };
    }
  };

  // Deletar transação - qualquer membro do grupo pode deletar
  const deleteTransaction = async (id) => {
    if (!user || !currentGroup) throw new Error('Usuário não autenticado ou grupo não encontrado');

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('group_id', currentGroup.id);

      if (error) throw error;

      // Atualizar estado local
      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      return { error };
    }
  };

  // Buscar transações quando o usuário ou grupo mudar
  useEffect(() => {
    if (user && currentGroup) {
      fetchTransactions();
    } else {
      setTransactions([]);
    }
  }, [user, currentGroup]);

  // Calcular estatísticas das transações
  const getTransactionStats = () => {
    const totalAmount = transactions
      .filter(t => t.is_paid)
      .reduce((acc, t) => acc + t.amount, 0);

    const totalPending = transactions
      .filter(t => !t.is_paid)
      .reduce((acc, t) => acc + t.amount, 0);

    const categoriesStats = transactions.reduce((acc, t) => {
      const category = t.category || 'Outros';
      acc[category] = (acc[category] || 0) + t.amount;
      return acc;
    }, {});

    return {
      totalAmount,
      totalPending,
      totalTransactions: transactions.length,
      categoriesStats,
    };
  };

  const value = {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    fetchTransactions,
    getTransactionStats,
  };

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
};