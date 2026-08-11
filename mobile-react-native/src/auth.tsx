import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from './api';
import type { ModulePermissions, Modulo } from './types';

export type Session = {
  accessToken: string;
  expiresAt: number;
  username: string;
  permissions: string[];
  modulePermissions?: ModulePermissions;
  modules?: Modulo[];
};

type Auth = {
  session: Session | null;
  ready: boolean;
  signIn: (username: string, password: string, bootstrap?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  refreshModules: () => Promise<void>;
};

const KEY = 'olimpio.session';
const Context = createContext<Auth | undefined>(undefined);

const fetchModules = async (accessToken: string): Promise<Modulo[]> => {
  try {
    const { data } = await api.get<Modulo[]>('/api/basico/modulo/menu', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) {
          const value = JSON.parse(raw) as Session;
          if (value.expiresAt * 1000 > Date.now()) setSession(value);
        }
      })
      .finally(() => setReady(true));
  }, []);

  const value = useMemo<Auth>(
    () => ({
      session,
      ready,
      async signIn(username, password, bootstrap = false) {
        const { data } = await api.post<Session>(`/api/login/${bootstrap ? 'bootstrap' : 'authenticate'}`, {
          username,
          password,
        });
        data.modules = await fetchModules(data.accessToken);
        await AsyncStorage.setItem(KEY, JSON.stringify(data));
        setSession(data);
      },
      async signOut() {
        await AsyncStorage.removeItem(KEY);
        setSession(null);
      },
      async refreshModules() {
        setSession((prev) => {
          if (!prev) return prev;
          fetchModules(prev.accessToken).then((modules) => {
            setSession((current) => {
              if (!current) return current;
              const merged = { ...current, modules };
              AsyncStorage.setItem(KEY, JSON.stringify(merged));
              return merged;
            });
          });
          return prev;
        });
      },
    }),
    [session, ready],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export const useAuth = () => {
  const value = useContext(Context);
  if (!value) throw new Error('AuthProvider ausente');
  return value;
};
