import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useUserProfiles = (userIds = []) => {
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userIds || userIds.length === 0) {
      setProfiles({});
      return;
    }

    const fetchProfiles = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, display_name, avatar_url, email')
          .in('id', userIds);

        if (error) {
          console.error('Erro ao buscar perfis:', error);
          return;
        }

        // Converter array para objeto com id como chave
        const profilesMap = {};
        data?.forEach(profile => {
          profilesMap[profile.id] = profile;
        });

        setProfiles(profilesMap);
      } catch (err) {
        console.error('Erro ao buscar perfis:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [userIds.join(',')]);

  return { profiles, loading };
};

// Hook para buscar um único perfil
export const useUserProfile = (userId) => {
  const { profiles, loading } = useUserProfiles(userId ? [userId] : []);
  return { 
    profile: profiles[userId] || null, 
    loading 
  };
};