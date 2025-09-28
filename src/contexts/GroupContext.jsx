import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const GroupContext = createContext();

export const useGroup = () => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroup deve ser usado dentro de GroupProvider');
  }
  return context;
};

export const GroupProvider = ({ children }) => {
  const { user } = useAuth();
  const [currentGroup, setCurrentGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Buscar grupo atual do usuário
  const fetchCurrentGroup = async () => {
    if (!user) {
      setCurrentGroup(null);
      setGroupMembers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Buscando grupo para usuário:', user.id);

      // Buscar grupo do usuário
      const { data: groupData, error: groupError } = await supabase
        .from('group_members')
        .select(`
          group_id,
          role,
          groups (
            id,
            name,
            invite_code,
            created_by,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .limit(1);

      console.log('Resultado da busca de grupo:', { groupData, groupError });

      // Se não encontrou grupo, criar um novo
      if (groupError || !groupData || groupData.length === 0) {
        console.log('Grupo não encontrado, criando novo grupo...');
        await createUserGroup();
        return;
      }

      if (groupData[0]?.groups) {
        const group = groupData[0];
        setCurrentGroup({
          ...group.groups,
          userRole: group.role
        });

        console.log('Grupo encontrado:', group.groups);

        // Buscar todos os membros do grupo
        await fetchGroupMembers(group.groups.id);
      }
    } catch (err) {
      console.error('Erro ao buscar grupo:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Criar grupo para usuário novo
  const createUserGroup = async () => {
    try {
      console.log('Criando grupo para usuário:', user.id);

      // Criar grupo
      const { data: newGroup, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: 'Meu Grupo',
          created_by: user.id
        })
        .select()
        .single();

      if (groupError) {
        throw groupError;
      }

      // Adicionar usuário como admin do grupo
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: newGroup.id,
          user_id: user.id,
          role: 'admin'
        });

      if (memberError) {
        throw memberError;
      }

      console.log('Grupo criado com sucesso:', newGroup);

      // Atualizar estado
      setCurrentGroup({
        ...newGroup,
        userRole: 'admin'
      });

      // Buscar membros do novo grupo
      await fetchGroupMembers(newGroup.id);
    } catch (err) {
      console.error('Erro ao criar grupo:', err);
      setError('Erro ao criar grupo: ' + err.message);
    }
  };

  // Buscar membros do grupo
  const fetchGroupMembers = async (groupId) => {
    try {
      console.log('Buscando membros do grupo:', groupId);
      
      // Buscar membros do grupo (sem user_profiles por enquanto)
      const { data: members, error: membersError } = await supabase
        .from('group_members')
        .select(`
          id,
          user_id,
          role,
          joined_at
        `)
        .eq('group_id', groupId);

      console.log('Membros encontrados:', { members, membersError });

      if (membersError) {
        console.error('Erro ao buscar membros:', membersError);
        return;
      }

      // Formatar dados dos membros
      const formattedMembers = members?.map(member => {
        // Se for o usuário atual, usar os dados do auth
        if (member.user_id === user?.id) {
          return {
            id: member.id,
            userId: member.user_id,
            role: member.role,
            joinedAt: member.joined_at,
            email: user.email,
            name: user.user_metadata?.full_name || 
                  user.user_metadata?.name || 
                  user.email?.split('@')[0] || 
                  'Você',
            avatar: user.user_metadata?.avatar_url || 
                    user.user_metadata?.picture || 
                    null
          };
        }
        
        // Para outros usuários, usar dados básicos por enquanto
        return {
          id: member.id,
          userId: member.user_id,
          role: member.role,
          joinedAt: member.joined_at,
          email: 'Membro do grupo',
          name: `Membro ${member.user_id.slice(-4)}`,
          avatar: null
        };
      }) || [];

      console.log('Membros formatados:', formattedMembers);
      setGroupMembers(formattedMembers);
    } catch (err) {
      console.error('Erro ao buscar membros:', err);
    }
  };

  // Gerar código alfanumérico de 8 caracteres
  const generateAlphanumericCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Gerar novo código de convite
  const generateInviteCode = async () => {
    console.log('generateInviteCode chamado - currentGroup:', currentGroup);

    if (!currentGroup) {
      throw new Error('Grupo não encontrado');
    }

    if (currentGroup.userRole !== 'admin') {
      console.log('Usuário não é admin, mas continuando...');
    }

    try {
      let newInviteCode;
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;

      // Gerar código único (tentar até 10 vezes)
      while (!isUnique && attempts < maxAttempts) {
        newInviteCode = generateAlphanumericCode();

        // Verificar se já existe
        const { data: existingGroup } = await supabase
          .from('groups')
          .select('id')
          .eq('invite_code', newInviteCode)
          .single();

        if (!existingGroup) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        throw new Error('Não foi possível gerar um código único. Tente novamente.');
      }

      const { error } = await supabase
        .from('groups')
        .update({ invite_code: newInviteCode })
        .eq('id', currentGroup.id);

      if (error) throw error;

      setCurrentGroup(prev => ({
        ...prev,
        invite_code: newInviteCode
      }));

      return newInviteCode;
    } catch (err) {
      console.error('Erro ao gerar código de convite:', err);
      throw err;
    }
  };

  // Ingressar em grupo via código de convite
  const joinGroup = async (inviteCode) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      // Verificar se o código de convite existe
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('id, name')
        .eq('invite_code', inviteCode.toUpperCase())
        .single();

      if (groupError || !groupData) {
        throw new Error('Código de convite inválido');
      }

      // Verificar se usuário já é membro
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupData.id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        throw new Error('Você já é membro deste grupo');
      }

      // Remover usuário do grupo anterior (se houver)
      await supabase
        .from('group_members')
        .delete()
        .eq('user_id', user.id);

      // Adicionar usuário ao novo grupo
      const { error: joinError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupData.id,
          user_id: user.id,
          role: 'member'
        });

      if (joinError) throw joinError;

      // Atualizar grupo atual
      await fetchCurrentGroup();

      return groupData;
    } catch (err) {
      console.error('Erro ao ingressar no grupo:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar nome do grupo
  const updateGroupName = async (newName) => {
    if (!currentGroup || currentGroup.userRole !== 'admin') {
      throw new Error('Apenas administradores podem alterar o nome do grupo');
    }

    try {
      const { error } = await supabase
        .from('groups')
        .update({ name: newName })
        .eq('id', currentGroup.id);

      if (error) throw error;

      setCurrentGroup(prev => ({
        ...prev,
        name: newName
      }));
    } catch (err) {
      console.error('Erro ao atualizar nome do grupo:', err);
      throw err;
    }
  };

  // Remover membro do grupo
  const removeMember = async (memberId) => {
    if (!currentGroup || currentGroup.userRole !== 'admin') {
      throw new Error('Apenas administradores podem remover membros');
    }

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      // Atualizar lista de membros
      setGroupMembers(prev => prev.filter(member => member.id !== memberId));
    } catch (err) {
      console.error('Erro ao remover membro:', err);
      throw err;
    }
  };

  // Sair do grupo
  const leaveGroup = async () => {
    if (!user || !currentGroup) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      // Criar novo grupo pessoal
      const { data: newGroup, error: newGroupError } = await supabase
        .from('groups')
        .insert({
          name: 'Meu Grupo',
          created_by: user.id
        })
        .select()
        .single();

      if (newGroupError) throw newGroupError;

      // Adicionar usuário como admin do novo grupo
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: newGroup.id,
          user_id: user.id,
          role: 'admin'
        });

      if (memberError) throw memberError;

      // Atualizar grupo atual
      await fetchCurrentGroup();
    } catch (err) {
      console.error('Erro ao sair do grupo:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchCurrentGroup();
  }, [user]);

  const value = {
    currentGroup,
    groupMembers,
    loading,
    error,
    fetchCurrentGroup,
    generateInviteCode,
    joinGroup,
    updateGroupName,
    removeMember,
    leaveGroup
  };

  return (
    <GroupContext.Provider value={value}>
      {children}
    </GroupContext.Provider>
  );
};