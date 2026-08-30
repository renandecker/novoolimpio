import {createContext, useContext, useEffect, useMemo, useState, type ReactNode} from 'react';
import {api} from '../../shared/services/api';
import type {ModulePermissions} from '../../features/auth/types';

type Module = { id: number; antecessorId: number | null; rotulo: string; descricao: string; icone: string; ajuda: string; outcome: string; ordem: number };
type Session = { accessToken: string; expiresAt: number; username: string; permissions: string[]; modules: Module[]; modulePermissions?: ModulePermissions; nome?: string; email?: string; cpf?: string; foto?: string; defaultOutcome?: string; hierarquia?: string };
type SessionCore =
    Pick<Session, 'accessToken' | 'expiresAt' | 'username' | 'permissions'>
    & { modulePermissions?: ModulePermissions; nome?: string; email?: string; cpf?: string; foto?: string; defaultOutcome?: string; hierarquia?: string };

const normalizeDefaultOutcome = (outcome?: string): string | undefined => {
    if (!outcome) return undefined;
    const normalized = outcome.replace(/\.xhtml$/i, '').replace(/^\/+|\/+$/g, '');
    return normalized ? `/${normalized}` : '/meus-dados';
};
type Auth = { session: Session | null; signIn: (username: string, password: string, bootstrap?: boolean) => Promise<void>; signOut: () => Promise<void>; refreshSession: (next: SessionCore) => void };
export type
{
    Session
}
;
const KEY = 'olimpio.session';
const MENU_KEY = 'olimpio.menu.v3';
const MENU_TTL = 24 * 60 * 60 * 1000;
type MenuCache = { at: number; modules: Module[] };

function readMenuCache(): MenuCache | null {
    try {
        const raw = localStorage.getItem(MENU_KEY);
        return raw ? (JSON.parse(raw) as MenuCache) : null;
    } catch {
        return null;
    }
}

async function fetchModules(accessToken: string): Promise<Module[]> {
    const cached = readMenuCache();
    if (cached && Date.now() - cached.at < MENU_TTL) return cached.modules;
    try {
        const {data} = await api.get<Module[]>('/api/basico/modulo/menu', {
            headers: {Authorization: `Bearer ${accessToken}`},
        });
        localStorage.setItem(MENU_KEY, JSON.stringify({at: Date.now(), modules: data}));
        return data;
    } catch {
        if (cached) return cached.modules;
        return [];
    }
}

const AuthContext = createContext<Auth | undefined>(undefined);

export function AuthProvider({children}: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(() => {
        const saved = localStorage.getItem(KEY);
        if (!saved) return null;
        const parsed = JSON.parse(saved) as Session;
        if (parsed.expiresAt * 1000 <= Date.now()) return null;
        return {
            ...parsed,
            defaultOutcome: normalizeDefaultOutcome(parsed.defaultOutcome)
        };
    });
    useEffect(() => {
        if (!session) return;
        const remaining = session.expiresAt * 1000 - Date.now();
        const timer = setTimeout(() => {
            localStorage.removeItem(KEY);
            setSession(null);
        }, remaining);
        return () => clearTimeout(timer);
    }, [session]);
    const value = useMemo<Auth>(() => ({
        session,
        async signIn(username, password, bootstrap = false) {
            const {data} = await api.post<Session>(`/api/login/${bootstrap ? 'bootstrap' : 'authenticate'}`, {
                username,
                password
            });
            console.log('[Auth] signIn response: ' + JSON.stringify({ defaultOutcome: data.defaultOutcome, permissions: data.permissions, username: data.username, defaultOutcomeType: typeof data.defaultOutcome }));
            data.defaultOutcome = normalizeDefaultOutcome(data.defaultOutcome);
            console.log('[Auth] normalized defaultOutcome: ' + JSON.stringify(data.defaultOutcome));
            data.modules = await fetchModules(data.accessToken);
            localStorage.setItem(KEY, JSON.stringify(data));
            setSession(data);
        },
        async signOut() {
            const saved = localStorage.getItem(KEY);
            localStorage.removeItem(KEY);
            setSession(null);
            if (!saved) return;
            try {
                await api.post('/api/login/logout', {}, {headers: {Authorization: `Bearer ${(JSON.parse(saved) as Session).accessToken}`}});
            } catch { /* sessão já inválida */
            }
        },
        refreshSession(next) {
            setSession(prev => {
                const merged = prev ? {...prev, ...next} : null;
                if (merged) {
                    merged.defaultOutcome = normalizeDefaultOutcome(merged.defaultOutcome);
                    localStorage.setItem(KEY, JSON.stringify(merged));
                } else {
                    localStorage.removeItem(KEY);
                }
                return merged;
            });
        },
    }), [session]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const auth = useContext(AuthContext);
    if (!auth) throw new Error('AuthProvider ausente');
    return auth;
};
