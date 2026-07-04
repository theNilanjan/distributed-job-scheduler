import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../../api/authApi';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '../../lib/authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadSession() {
      if (!getAccessToken()) {
        setBooting(false);
        return;
      }
      try {
        const current = await authApi.me();
        if (mounted) setUser(current);
      } catch {
        clearTokens();
      } finally {
        if (mounted) setBooting(false);
      }
    }
    loadSession();
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(() => ({
    user,
    booting,
    isAuthenticated: Boolean(user),
    async login(payload) {
      const result = await authApi.login(payload);
      setTokens(result);
      setUser(result.user);
      return result.user;
    },
    async register(payload) {
      const result = await authApi.register(payload);
      setTokens(result);
      setUser(result.user);
      return result.user;
    },
    async logout() {
      const refreshToken = getRefreshToken();
      try {
        if (refreshToken) await authApi.logout(refreshToken);
      } finally {
        clearTokens();
        setUser(null);
      }
    }
  }), [booting, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
