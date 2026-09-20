import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (loginId: string, password: string) => Promise<User>;
  adminLogin: (email: string, password: string) => Promise<User>;
  logout: () => void;
  updateUserContext: (user: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('rg_token');
    const storedUser = localStorage.getItem('rg_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('rg_token');
        localStorage.removeItem('rg_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (loginId: string, password: string) => {
    const res = await authApi.login(loginId, password);
    const { user: u, token: t } = res.data;
    setUser(u);
    setToken(t);
    localStorage.setItem('rg_token', t);
    localStorage.setItem('rg_user', JSON.stringify(u));
    return u;
  };

  const adminLogin = async (email: string, password: string) => {
    const res = await authApi.adminLogin(email, password);
    const { user: u, token: t } = res.data;
    setUser(u);
    setToken(t);
    localStorage.setItem('rg_token', t);
    localStorage.setItem('rg_user', JSON.stringify(u));
    return u;
  };

  const updateUserContext = (updatedFields: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const next = { ...prev, ...updatedFields };
      localStorage.setItem('rg_user', JSON.stringify(next));
      return next;
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('rg_token');
    localStorage.removeItem('rg_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, adminLogin, logout, updateUserContext, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
