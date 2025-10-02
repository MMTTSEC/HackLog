import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

type Role = 'user' | 'admin';

export default function ProtectedRoute({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user, loading, refresh } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { refresh(); }, []);

  if (loading) return null;

  // If not logged in, send to login
  if (!user) {
    navigate('/login');
    return null;
  }

  // Admin has access to everything
  if (user.role === 'admin') return <>{children}</>;

  // User access only if role requirement allows user
  if (roles.includes('user')) return <>{children}</>;

  // Otherwise block
  navigate('/');
  return null;
}


