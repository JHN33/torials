import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, getToken, User } from '../lib/api';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) { setLoading(false); return; }
    api.me()
      .then(setUser)
      .catch(() => api.signOut())
      .finally(() => setLoading(false));
  }, []);

  const signIn = async (email: string, password: string) => {
    try { setUser(await api.signIn(email, password)); return { error: null }; }
    catch (err) { return { error: err as Error }; }
  };

  const signOut = async () => {
    api.signOut();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
