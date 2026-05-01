import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../lib/api';
import type { AuthProfile, LoginPayload } from '../types';

interface AuthContextValue {
  token: string | null;
  role: string | null;
  profile: AuthProfile | null;
  childProfile: AuthProfile | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_KEY = 'rewardhub_token';
const ROLE_KEY = 'rewardhub_role';
const fallbackAuthContext: AuthContextValue = {
  token: null,
  role: null,
  profile: null,
  childProfile: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  refreshProfile: async () => {}
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [role, setRole] = useState<string | null>(() => localStorage.getItem(ROLE_KEY));
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [childProfile, setChildProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    setToken(null);
    setRole(null);
    setProfile(null);
    setChildProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const me = await api.me();
      setProfile(me);
      if (me.userRole) {
        setRole(me.userRole);
        localStorage.setItem(ROLE_KEY, me.userRole);
      }

      if (me.userRole === 'Parent') {
        try {
          const child = await api.child();
          setChildProfile(child);
        } catch {
          setChildProfile(null);
        }
      } else {
        setChildProfile(null);
      }
    } catch {
      logout();
    }
  };

  useEffect(() => {
    const hydrate = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      await refreshProfile();
      setLoading(false);
    };

    void hydrate();
  }, [token]);

  const login = async (payload: LoginPayload) => {
    const response = await api.login(payload);
    if (!response.token) {
      throw new Error('The token was not returned by the server');
    }

    localStorage.setItem(TOKEN_KEY, response.token);
    if (response.role) {
      localStorage.setItem(ROLE_KEY, response.role);
      setRole(response.role);
    }
    setToken(response.token);
    await refreshProfile();
  };

  return (
    <AuthContext.Provider value={{ token, role, profile, childProfile, loading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return fallbackAuthContext;
  }

  return context;
}
