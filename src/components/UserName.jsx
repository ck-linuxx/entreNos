import { useUserProfile } from '../hooks/useUserProfiles';
import { useAuth } from '../contexts/AuthContext';

const UserName = ({ userId, fallback = 'Usuário', className = '' }) => {
  const { user } = useAuth();
  const { profile, loading } = useUserProfile(userId);

  // Se for o usuário atual, usar dados do auth
  if (userId === user?.id) {
    const name = user.user_metadata?.full_name || 
                 user.user_metadata?.name || 
                 user.email?.split('@')[0] || 
                 'Você';
    return <span className={className}>{name}</span>;
  }

  // Se ainda está carregando
  if (loading) {
    return <span className={className}>Carregando...</span>;
  }

  // Se encontrou o perfil
  if (profile) {
    return <span className={className}>{profile.display_name}</span>;
  }

  // Fallback
  return <span className={className}>{fallback}</span>;
};

export default UserName;