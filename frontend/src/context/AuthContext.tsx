import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { UserOut, TenantOut, SimulatedTransaction } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserOut | null;
  tenant: TenantOut | null;
  token: string | null;
  isDemo: boolean;
  isLoading: boolean;
  isLiveStreaming: boolean;
  streamEvents: SimulatedTransaction[];
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    company_name: string;
    full_name: string;
    email: string;
    password: string;
    industry?: string;
    currency?: string;
    currency_symbol?: string;
    number_format?: string;
  }) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => void;
  refreshTenant: () => Promise<void>;
  toggleLiveStreaming: () => void;
  triggerLiveTransaction: () => Promise<SimulatedTransaction | null>;
  clearStreamEvents: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserOut | null>(null);
  const [tenant, setTenant] = useState<TenantOut | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('retailpulse_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(false);
  const [streamEvents, setStreamEvents] = useState<SimulatedTransaction[]>([]);
  const streamTimerRef = useRef<any>(null);

  const isDemo = !tenant || tenant.id === 'demo_tenant';

  // Load session on startup
  useEffect(() => {
    let mounted = true;

    async function initSession() {
      setIsLoading(true);
      const savedToken = localStorage.getItem('retailpulse_token');
      if (savedToken) {
        try {
          const res = await api.getMe();
          if (mounted) {
            setUser(res.user);
            setTenant(res.tenant);
            setToken(savedToken);
          }
        } catch (err) {
          console.warn('Existing token invalid or expired, falling back to demo session', err);
          localStorage.removeItem('retailpulse_token');
          try {
            const demoRes = await api.getDemoSession();
            if (mounted) {
              localStorage.setItem('retailpulse_token', demoRes.access_token);
              setToken(demoRes.access_token);
              setUser(demoRes.user);
              setTenant(demoRes.tenant);
            }
          } catch (demoErr) {
            console.error('Failed to initialize demo session', demoErr);
          }
        }
      } else {
        try {
          const demoRes = await api.getDemoSession();
          if (mounted) {
            localStorage.setItem('retailpulse_token', demoRes.access_token);
            setToken(demoRes.access_token);
            setUser(demoRes.user);
            setTenant(demoRes.tenant);
          }
        } catch (demoErr) {
          console.error('Failed to initialize demo session', demoErr);
        }
      }

      if (mounted) {
        setIsLoading(false);
      }
    }

    initSession();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      localStorage.setItem('retailpulse_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      setTenant(res.tenant);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: {
    company_name: string;
    full_name: string;
    email: string;
    password: string;
    industry?: string;
    currency?: string;
    currency_symbol?: string;
    number_format?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await api.register(payload);
      localStorage.setItem('retailpulse_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      setTenant(res.tenant);
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemo = async () => {
    setIsLoading(true);
    try {
      const res = await api.getDemoSession();
      localStorage.setItem('retailpulse_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      setTenant(res.tenant);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('retailpulse_token');
    setToken(null);
    setUser(null);
    setTenant(null);
    setIsLiveStreaming(false);
    if (streamTimerRef.current) {
      clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }
    // Re-seed demo session
    api.getDemoSession().then(res => {
      localStorage.setItem('retailpulse_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      setTenant(res.tenant);
    }).catch(console.error);
  };

  const refreshTenant = async () => {
    try {
      const t = await api.getCurrentTenant();
      setTenant(t);
    } catch (err) {
      console.error('Failed to refresh tenant details', err);
    }
  };

  const triggerLiveTransaction = useCallback(async (): Promise<SimulatedTransaction | null> => {
    try {
      const tx = await api.simulateLiveTransaction();
      setStreamEvents(prev => [tx, ...prev].slice(0, 30));
      return tx;
    } catch (err) {
      console.error('Failed to simulate live transaction', err);
      return null;
    }
  }, []);

  const toggleLiveStreaming = useCallback(() => {
    setIsLiveStreaming(prev => {
      const next = !prev;
      if (next) {
        // Fire one immediately
        triggerLiveTransaction();
        streamTimerRef.current = setInterval(() => {
          triggerLiveTransaction();
        }, 3500);
      } else {
        if (streamTimerRef.current) {
          clearInterval(streamTimerRef.current);
          streamTimerRef.current = null;
        }
      }
      return next;
    });
  }, [triggerLiveTransaction]);

  useEffect(() => {
    return () => {
      if (streamTimerRef.current) {
        clearInterval(streamTimerRef.current);
      }
    };
  }, []);

  const clearStreamEvents = () => {
    setStreamEvents([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        token,
        isDemo,
        isLoading,
        isLiveStreaming,
        streamEvents,
        login,
        register,
        loginDemo,
        logout,
        refreshTenant,
        toggleLiveStreaming,
        triggerLiveTransaction,
        clearStreamEvents,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
