import { useEffect, useState } from 'react';

export type AuthUser = {
  id: number;
  email: string;
  username: string;
  role: string;
} | null;

export function useAuth() {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const res = await fetch('/api/login');
      const data = await res.json();
      setUser(data && !data.error ? data : null);
    } catch (_) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  // Provide a simple event-based notify so Header can refresh on login
  const notifyAuthChanged = () => refresh();
  return { user, loading, refresh, setUser, notifyAuthChanged };
}


