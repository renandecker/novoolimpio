import AsyncStorage from '@react-native-async-storage/async-storage';
import {createContext, useContext, useEffect, useMemo, useState, type ReactNode} from 'react';
import {api} from './api';
import type {ModulePermissions, Modulo} from './types';

export type Session = {
    accessToken: string;
    expiresAt: number;
    username: string;
    permissions: string[];
    modulePermissions?: ModulePermissions;
    modules?: Modulo[];
    hierarquia?: string;
};

type Auth = {
    session: Session | null;
    ready: boolean;
    signIn: (username: string, password: string, bootstrap?: boolean) => Promise<void>;
    signOut: () => Promise<void>;
    refreshModules: () => Promise<void>;
    refreshSession: (session: Session) => void;
};

const KEY = 'olimpio.session';
const MENU_KEY = 'olimpio.menu.v2';
const MENU_TTL = 24 * 60 * 60 * 1000;
type MenuCache = { at: number; modules: Modulo[] };
const Context = createContext<Auth | undefined>(undefined);

async function readMenuCache(): Promise<MenuCache | null> {
    try {
        const raw = await AsyncStorage.getItem(MENU_KEY);
        return raw ? (JSON.parse(raw) as MenuCache) : null;
    } catch {
        return null;
    }
}

const fetchModules = async (accessToken: string): Promise<Modulo[]> => {
    const cached = await readMenuCache();
    if (cached && Array.isArray(cached.modules) && Date.now() - cached.at < MENU_TTL) {
        return cached.modules;
    }
    try {
        const {data} = await api.get<Modulo[]>('/api/basico/modulo/menu', {
            headers: {Authorization: `Bearer ${accessToken}`},
        });
        const modules = Array.isArray(data) ? data : [];
        try {
            await AsyncStorage.setItem(MENU_KEY, JSON.stringify({at: Date.now(), modules}));
        } catch {
        }
        return modules;
    } catch {
        if (cached && Array.isArray(cached.modules)) return cached.modules;
        return [];
    }
};

export function AuthProvider({children}: { children: ReactNode }) {
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
                const {data} = await api.post<Session>(`/api/login/${bootstrap ? 'bootstrap' : 'authenticate'}`, {
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
                            const merged = {...current, modules};
                            AsyncStorage.setItem(KEY, JSON.stringify(merged));
                            return merged;
                        });
                    });
                    return prev;
                });
            },
            refreshSession: (newSession: Session) => {
                AsyncStorage.setItem(KEY, JSON.stringify(newSession));
                setSession(newSession);
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
